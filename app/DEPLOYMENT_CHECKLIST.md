# One-Time Deployment Checklist

Use this checklist to ensure everything is set up correctly for deployment.

## Pre-Deployment Setup

### Supabase Database
- [ ] Created Supabase project
- [ ] Copied Project URL
- [ ] Copied anon/public key
- [ ] Copied service_role key (kept secret)
- [ ] Ran all 8 migration files in order:
  - [ ] `0001_init.sql`
  - [ ] `0002_saved_jobs_features.sql`
  - [ ] `0003_company_reports.sql`
  - [ ] `0004_company_reviews.sql`
  - [ ] `0005_saved_searches_digests_tracker_profile.sql`
  - [ ] `0006_applications_notes_events_employer_update.sql`
  - [ ] `0007_platform_metrics_public.sql`
  - [ ] `0008_company_members_policies.sql`
- [ ] Verified tables exist in Table Editor
- [ ] (Optional) Ran seed script for test data

### Local Environment
- [ ] Created `.env.local` from `env.example`
- [ ] Filled in `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Filled in `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Filled in `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Set `NEXT_PUBLIC_SITE_URL` to `http://localhost:3000`
- [ ] Generated `CRON_SECRET` (use `openssl rand -hex 32`)
- [ ] Tested locally: `npm run dev` works
- [ ] Verified login/registration works locally

### Git Repository
- [ ] Code is committed to Git
- [ ] Pushed to GitHub/GitLab/Bitbucket
- [ ] Repository is accessible to Netlify

## Netlify Deployment

### Initial Setup
- [ ] Created Netlify account
- [ ] Connected Git repository to Netlify
- [ ] Verified build settings:
  - [ ] Base directory: `app`
  - [ ] Build command: `npm run build`
  - [ ] Publish directory: (empty/auto)

### Environment Variables
- [ ] `NEXT_PUBLIC_SUPABASE_URL` = (your Supabase URL)
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (your anon key)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = (your service role key)
- [ ] `NEXT_PUBLIC_SITE_URL` = (will update after first deploy)
- [ ] `CRON_SECRET` = (same as local)

### First Deployment
- [ ] Triggered initial deployment
- [ ] Build completed successfully
- [ ] Noted Netlify site URL
- [ ] Updated `NEXT_PUBLIC_SITE_URL` in Netlify with actual URL
- [ ] Triggered redeploy after updating site URL

### Supabase Auth Configuration
- [ ] Added Netlify URL to Supabase Site URL
- [ ] Added redirect URLs:
  - [ ] `https://your-site.netlify.app/auth/confirm`
  - [ ] `https://your-site.netlify.app/**`

## Cron Jobs Setup

### Job Alerts Cron
- [ ] Created account on cron-job.org (or EasyCron)
- [ ] Created cron job for alerts:
  - [ ] URL: `https://your-site.netlify.app/api/cron/alerts`
  - [ ] Schedule: `*/15 * * * *` (every 15 minutes)
  - [ ] Method: GET
  - [ ] Header: `Authorization: Bearer YOUR_CRON_SECRET`
- [ ] Tested alerts endpoint manually
- [ ] Verified cron job is running

### Reminders Cron
- [ ] Created cron job for reminders:
  - [ ] URL: `https://your-site.netlify.app/api/cron/reminders`
  - [ ] Schedule: `* * * * *` (every minute)
  - [ ] Method: GET
  - [ ] Header: `Authorization: Bearer YOUR_CRON_SECRET`
- [ ] Tested reminders endpoint manually
- [ ] Verified cron job is running

## Post-Deployment Verification

### Functionality Tests
- [ ] Site loads at Netlify URL
- [ ] Can register new account
- [ ] Can log in with registered account
- [ ] Can create profile (seeker)
- [ ] Can create company (employer)
- [ ] Can post job (employer)
- [ ] Can apply to job (seeker)
- [ ] Can save jobs
- [ ] Can create job alerts
- [ ] Protected routes redirect when not logged in
- [ ] Role-based access works (seeker/employer/admin)

### Technical Checks
- [ ] No errors in Netlify function logs
- [ ] No errors in Supabase logs
- [ ] Cron jobs executing successfully
- [ ] Database queries working
- [ ] Authentication working
- [ ] Images loading correctly
- [ ] API routes responding

### Security Checks
- [ ] Environment variables not exposed in client
- [ ] Service role key only used server-side
- [ ] CRON_SECRET protecting cron endpoints
- [ ] Supabase RLS policies active
- [ ] HTTPS enabled (automatic on Netlify)

## Optional Enhancements

### Custom Domain
- [ ] Purchased domain
- [ ] Added custom domain in Netlify
- [ ] Configured DNS records
- [ ] Updated `NEXT_PUBLIC_SITE_URL` with custom domain
- [ ] Updated Supabase redirect URLs

### Monitoring
- [ ] Set up Netlify Analytics (if desired)
- [ ] Configured error tracking
- [ ] Set up uptime monitoring

### Email Configuration
- [ ] Configured email provider in Supabase
- [ ] Customized email templates
- [ ] Tested email delivery

## Troubleshooting Notes

If something doesn't work, check:

- [ ] All environment variables are set correctly
- [ ] Supabase URL and keys are correct
- [ ] Site URL matches actual Netlify URL
- [ ] All migrations ran successfully
- [ ] Cron secret matches in Netlify and cron service
- [ ] Supabase redirect URLs include your domain
- [ ] Build logs for errors
- [ ] Function logs for runtime errors

## Quick Reference

### Useful Commands

```bash
# Local development
cd app
npm install
npm run dev

# View Supabase migrations
npm run setup:supabase

# View cron configuration
npm run setup:cron

# Seed test data
npm run seed:dev

# Test build
npm run build
```

### Important URLs

- **Netlify Dashboard:** https://app.netlify.com
- **Supabase Dashboard:** https://app.supabase.com
- **Cron Service:** https://cron-job.org

### Support Resources

- **Setup Guide:** See `SETUP_GUIDE.md`
- **Deployment Guide:** See `NETLIFY_DEPLOYMENT.md`
- **Code Review:** See `CODE_REVIEW.md`

---

**Last Updated:** After completing all items, your application should be fully deployed and functional! 🎉

