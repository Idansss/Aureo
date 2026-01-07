#!/usr/bin/env node
/**
 * Verify seed data was created correctly
 * 
 * This script checks that all seed data exists and is properly structured.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const EMPLOYER_EMAIL = process.env.SEED_EMPLOYER_EMAIL ?? "employer@example.com";
const SEEKER_EMAIL = process.env.SEED_SEEKER_EMAIL ?? "seeker@example.com";

async function verifyTable(table, description, checkFn) {
  try {
    const result = await checkFn();
    if (result.success) {
      console.log(`✅ ${description}`);
      if (result.count !== undefined) {
        console.log(`   Count: ${result.count}`);
      }
      return true;
    } else {
      console.log(`❌ ${description}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      return false;
    }
  } catch (error) {
    console.log(`❌ ${description}`);
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🔍 Verifying Seed Data');
  console.log('='.repeat(50));
  console.log(`Project: ${SUPABASE_URL}\n`);

  let allPassed = true;

  // Get user IDs
  const { data: users } = await supabase.auth.admin.listUsers();
  const employerUser = users?.users?.find(u => u.email === EMPLOYER_EMAIL);
  const seekerUser = users?.users?.find(u => u.email === SEEKER_EMAIL);

  if (!employerUser) {
    console.log(`❌ Employer user not found: ${EMPLOYER_EMAIL}`);
    allPassed = false;
  } else {
    console.log(`✓ Employer user found: ${EMPLOYER_EMAIL}`);
  }

  if (!seekerUser) {
    console.log(`❌ Seeker user not found: ${SEEKER_EMAIL}`);
    allPassed = false;
  } else {
    console.log(`✓ Seeker user found: ${SEEKER_EMAIL}`);
  }

  if (!employerUser || !seekerUser) {
    console.log('\n⚠️  Cannot continue verification without users.');
    process.exit(1);
  }

  console.log('');

  // Verify profiles
  allPassed = await verifyTable('profiles', 'Profiles exist', async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, role, email')
      .in('id', [employerUser.id, seekerUser.id]);
    
    if (error) return { success: false, error: error.message };
    if (!data || data.length !== 2) {
      return { success: false, error: `Expected 2 profiles, found ${data?.length || 0}` };
    }
    return { success: true, count: data.length };
  }) && allPassed;

  // Verify company
  allPassed = await verifyTable('companies', 'Company exists', async () => {
    const { data, error } = await supabase
      .from('companies')
      .select('id, name, slug')
      .eq('slug', 'northwind')
      .single();
    
    if (error) return { success: false, error: error.message };
    if (!data) return { success: false, error: 'Company not found' };
    return { success: true };
  }) && allPassed;

  // Verify jobs
  allPassed = await verifyTable('jobs', 'Jobs exist', async () => {
    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('slug', 'northwind')
      .single();
    
    if (!company) return { success: false, error: 'Company not found' };
    
    const { data, error } = await supabase
      .from('jobs')
      .select('id, title')
      .eq('company_id', company.id);
    
    if (error) return { success: false, error: error.message };
    if (!data || data.length < 2) {
      return { success: false, error: `Expected at least 2 jobs, found ${data?.length || 0}` };
    }
    return { success: true, count: data.length };
  }) && allPassed;

  // Verify applications
  allPassed = await verifyTable('applications', 'Application exists', async () => {
    const { data, error } = await supabase
      .from('applications')
      .select('id')
      .eq('user_id', seekerUser.id);
    
    if (error) return { success: false, error: error.message };
    return { success: true, count: data?.length || 0 };
  }) && allPassed;

  // Verify saved jobs
  allPassed = await verifyTable('saved_jobs', 'Saved job exists', async () => {
    const { data, error } = await supabase
      .from('saved_jobs')
      .select('id')
      .eq('user_id', seekerUser.id);
    
    if (error) return { success: false, error: error.message };
    return { success: true, count: data?.length || 0 };
  }) && allPassed;

  // Verify saved searches
  allPassed = await verifyTable('saved_searches', 'Saved search exists', async () => {
    const { data, error } = await supabase
      .from('saved_searches')
      .select('id, name')
      .eq('user_id', seekerUser.id)
      .eq('name', 'Remote roles');
    
    if (error) return { success: false, error: error.message };
    if (!data || data.length === 0) {
      return { success: false, error: 'Saved search not found' };
    }
    return { success: true };
  }) && allPassed;

  // Verify notifications
  allPassed = await verifyTable('notifications', 'Notification exists', async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('id, type')
      .eq('user_id', seekerUser.id);
    
    if (error) return { success: false, error: error.message };
    return { success: true, count: data?.length || 0 };
  }) && allPassed;

  console.log('\n' + '='.repeat(50));
  if (allPassed) {
    console.log('✅ All seed data verified successfully!');
    process.exit(0);
  } else {
    console.log('❌ Some verifications failed. Please check the errors above.');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error.message);
  process.exit(1);
});

