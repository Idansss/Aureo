#!/usr/bin/env node
/**
 * Helper script to run Supabase migrations via SQL Editor
 * 
 * This script reads all migration files and provides instructions
 * for running them in the Supabase dashboard SQL Editor.
 */

import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const migrationsDir = join(__dirname, '..', 'supabase', 'migrations');

function getMigrationFiles() {
  try {
    const files = readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Ensure order
    
    return files.map(file => ({
      name: file,
      path: join(migrationsDir, file),
    }));
  } catch (error) {
    console.error('Error reading migrations directory:', error.message);
    process.exit(1);
  }
}

function displayMigration(file, index, total) {
  const content = readFileSync(file.path, 'utf-8');
  const lines = content.split('\n').length;
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Migration ${index + 1}/${total}: ${file.name}`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Lines: ${lines}`);
  console.log(`\nSQL Content:\n`);
  console.log(content);
  console.log(`\n${'='.repeat(60)}\n`);
}

function main() {
  console.log('Supabase Migration Helper');
  console.log('========================\n');
  console.log('This script will display all migration files in order.');
  console.log('Copy each migration and run it in Supabase SQL Editor.\n');
  
  const files = getMigrationFiles();
  
  if (files.length === 0) {
    console.error('No migration files found!');
    process.exit(1);
  }
  
  console.log(`Found ${files.length} migration files.\n`);
  console.log('Instructions:');
  console.log('1. Go to your Supabase project dashboard');
  console.log('2. Navigate to SQL Editor');
  console.log('3. Copy and paste each migration below in order');
  console.log('4. Click "Run" after each migration\n');
  
  console.log('Press Enter to display the first migration...');
  
  // For automated display, show all migrations
  files.forEach((file, index) => {
    displayMigration(file, index, files.length);
    
    if (index < files.length - 1) {
      console.log('\n--- Next Migration ---\n');
    }
  });
  
  console.log('\n✅ All migrations displayed!');
  console.log('\nAfter running all migrations:');
  console.log('1. Verify tables exist in Table Editor');
  console.log('2. Check for any errors in SQL Editor');
  console.log('3. Proceed with deployment\n');
}

main();

