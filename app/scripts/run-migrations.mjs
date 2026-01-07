#!/usr/bin/env node
/**
 * Automated migration runner for Supabase
 * 
 * This script attempts to run migrations via Supabase REST API.
 * Alternative: Use Supabase CLI or SQL Editor manually.
 * 
 * Usage:
 *   node scripts/run-migrations.mjs
 * 
 * Requires:
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 */

import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nSet them in .env.local or export them:');
  console.error('   export NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"');
  console.error('   export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function runMigration(filePath, fileName) {
  const sql = readFileSync(filePath, 'utf-8');
  
  console.log(`\n📄 Running: ${fileName}`);
  console.log(`   ${sql.split('\n').length} lines`);
  
  try {
    // Use Supabase REST API to run SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      // Fallback: Try direct SQL execution via REST API
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ sql_query: sql }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
      
      console.log(`   ✅ Success (via REST API)`);
    } else {
      console.log(`   ✅ Success`);
    }
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    console.error('\n⚠️  Note: Automated migration may not work.');
    console.error('   Please run migrations manually in Supabase SQL Editor:');
    console.error(`   File: ${filePath}\n`);
    return false;
  }
  
  return true;
}

async function main() {
  console.log('🚀 Supabase Migration Runner');
  console.log('============================\n');
  console.log('Project:', SUPABASE_URL);
  console.log('');
  
  const migrationsDir = join(__dirname, '..', 'supabase', 'migrations');
  const files = readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort()
    .map(file => ({
      name: file,
      path: join(migrationsDir, file),
    }));
  
  if (files.length === 0) {
    console.error('❌ No migration files found!');
    process.exit(1);
  }
  
  console.log(`Found ${files.length} migration files.\n`);
  console.log('⚠️  Note: This script may not work with all Supabase setups.');
  console.log('   If it fails, use the Supabase SQL Editor instead.\n');
  console.log('Press Ctrl+C to cancel, or Enter to continue...');
  
  // Wait for user confirmation (optional)
  // In automated scenarios, you can remove this
  
  let successCount = 0;
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const success = await runMigration(file.path, file.name);
    if (success) successCount++;
    
    // Small delay between migrations
    if (i < files.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`✅ Completed: ${successCount}/${files.length} migrations`);
  console.log('='.repeat(50));
  
  if (successCount < files.length) {
    console.log('\n⚠️  Some migrations failed.');
    console.log('   Please run them manually in Supabase SQL Editor.');
    console.log('   See SETUP_GUIDE.md for instructions.\n');
    process.exit(1);
  } else {
    console.log('\n🎉 All migrations completed successfully!');
    console.log('   Verify tables in Supabase Table Editor.\n');
  }
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error.message);
  console.error('\n💡 Tip: Use Supabase SQL Editor to run migrations manually.');
  console.error('   See SETUP_GUIDE.md for step-by-step instructions.\n');
  process.exit(1);
});

