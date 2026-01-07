#!/usr/bin/env node
/**
 * Check if database migrations have been run
 * 
 * This script verifies that required tables exist in your Supabase database.
 */

import { createClient } from '@supabase/supabase-js';

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

const REQUIRED_TABLES = [
  'profiles',
  'companies',
  'jobs',
  'applications',
  'saved_jobs',
  'job_alerts',
  'notifications',
  'saved_searches',
];

async function checkTable(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error) {
      // Check if it's a "relation does not exist" error
      if (error.message.includes('does not exist') || error.code === '42P01') {
        return { exists: false, error: 'Table does not exist' };
      }
      return { exists: false, error: error.message };
    }
    return { exists: true };
  } catch (error) {
    return { exists: false, error: error.message };
  }
}

async function main() {
  console.log('🔍 Checking Database Migrations');
  console.log('='.repeat(50));
  console.log(`Project: ${SUPABASE_URL}\n`);

  const results = [];
  for (const table of REQUIRED_TABLES) {
    const result = await checkTable(table);
    results.push({ table, ...result });
    
    if (result.exists) {
      console.log(`✅ ${table}`);
    } else {
      console.log(`❌ ${table} - ${result.error || 'Not found'}`);
    }
  }

  console.log('\n' + '='.repeat(50));
  
  const missing = results.filter(r => !r.exists);
  if (missing.length === 0) {
    console.log('✅ All required tables exist!');
    console.log('   Your database is ready for seeding.\n');
    process.exit(0);
  } else {
    console.log(`❌ ${missing.length} table(s) are missing!`);
    console.log('\n⚠️  You need to run database migrations first.');
    console.log('\nTo fix this:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Run all migration files from app/supabase/migrations/ in order');
    console.log('   (0001_init.sql through 0008_company_members_policies.sql)');
    console.log('\nOr use: npm run setup:supabase to view all migrations\n');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
});

