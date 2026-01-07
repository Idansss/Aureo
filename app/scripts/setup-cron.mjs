#!/usr/bin/env node
/**
 * Helper script to generate cron job configuration
 * 
 * This script generates the exact configuration needed for
 * setting up cron jobs with external services.
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function getEnvVar(name) {
  const envFile = join(__dirname, '..', '.env.local');
  try {
    const content = readFileSync(envFile, 'utf-8');
    const match = content.match(new RegExp(`^${name}=(.+)$`, 'm'));
    return match ? match[1].replace(/^["']|["']$/g, '') : null;
  } catch {
    return null;
  }
}

function generateCronConfig() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                  getEnvVar('NEXT_PUBLIC_SITE_URL') || 
                  'https://your-site.netlify.app';
  const cronSecret = process.env.CRON_SECRET || 
                     getEnvVar('CRON_SECRET') || 
                     'YOUR_CRON_SECRET_HERE';
  
  console.log('Cron Job Configuration');
  console.log('=====================\n');
  
  console.log('Site URL:', siteUrl);
  console.log('CRON_SECRET:', cronSecret ? '***' + cronSecret.slice(-4) : 'NOT SET');
  console.log('\n');
  
  console.log('='.repeat(60));
  console.log('JOB ALERTS - Configuration');
  console.log('='.repeat(60));
  console.log('Service: cron-job.org or EasyCron');
  console.log('Title: Aureo Job Alerts');
  console.log('URL:', `${siteUrl}/api/cron/alerts`);
  console.log('Method: GET');
  console.log('Schedule: */15 * * * * (every 15 minutes)');
  console.log('Headers:');
  console.log('  Authorization: Bearer', cronSecret);
  console.log('\n');
  
  console.log('='.repeat(60));
  console.log('REMINDERS - Configuration');
  console.log('='.repeat(60));
  console.log('Service: cron-job.org or EasyCron');
  console.log('Title: Aureo Reminders');
  console.log('URL:', `${siteUrl}/api/cron/reminders`);
  console.log('Method: GET');
  console.log('Schedule: * * * * * (every minute)');
  console.log('Headers:');
  console.log('  Authorization: Bearer', cronSecret);
  console.log('\n');
  
  console.log('='.repeat(60));
  console.log('Testing Commands');
  console.log('='.repeat(60));
  console.log('\nTest Job Alerts:');
  console.log(`curl -H "Authorization: Bearer ${cronSecret}" ${siteUrl}/api/cron/alerts`);
  console.log('\nTest Reminders:');
  console.log(`curl -H "Authorization: Bearer ${cronSecret}" ${siteUrl}/api/cron/reminders`);
  console.log('\n');
  
  console.log('='.repeat(60));
  console.log('Step-by-Step Instructions');
  console.log('='.repeat(60));
  console.log('\n1. Go to https://cron-job.org (or EasyCron)');
  console.log('2. Create a free account');
  console.log('3. Click "Create cronjob"');
  console.log('4. Fill in the details above for Job Alerts');
  console.log('5. Repeat for Reminders');
  console.log('6. Test both endpoints using the curl commands above');
  console.log('\n');
  
  if (!cronSecret || cronSecret === 'YOUR_CRON_SECRET_HERE') {
    console.log('⚠️  WARNING: CRON_SECRET not set!');
    console.log('Generate one with: openssl rand -hex 32');
    console.log('Add it to your .env.local file\n');
  }
  
  if (siteUrl.includes('your-site')) {
    console.log('⚠️  WARNING: Site URL not set!');
    console.log('Update NEXT_PUBLIC_SITE_URL with your actual Netlify URL\n');
  }
}

generateCronConfig();

