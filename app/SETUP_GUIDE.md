# Complete Setup Guide - One-Time Deployment

This guide will walk you through setting up everything needed for a one-time deployment to Netlify.

## 📋 Prerequisites Checklist

- [ ] GitHub/GitLab/Bitbucket account
- [ ] Netlify account (free tier works)
- [ ] Supabase account (free tier works)
- [ ] Node.js 20.x installed locally (for testing)

---

## Step 1: Set Up Supabase Database (15 minutes)

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click **"New Project"**
3. Fill in:
   - **Name:** `aureo` (or your preferred name)
   - **Database Password:** Generate a strong password (save it!) - Bol@rinw@27
   - **Region:** Choose closest to your users
   - **Pricing Plan:** Free tier is fine to start
4. Click **"Create new project"**
5. Wait 2-3 minutes for project to initialize

### 1.2 Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy these values (you'll need them later):
   - **Project URL** (e.g., `https://xxxxx.supabase.co`) - https://lwksixegtttopaeobklh.supabase.co
   - **anon/public key** (starts with `eyJ...`) - eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3a3NpeGVndHR0b3BhZW9ia2xoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3Nzc1MDQsImV4cCI6MjA4MzM1MzUwNH0.mCqMK9uvdyFpWwk88mlBQjUuHead5Z4_pbQPURgY62I
   - **service_role key** (starts with `eyJ...`) - **Keep this secret!** - eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3a3NpeGVndHR0b3BhZW9ia2xoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzc3NzUwNCwiZXhwIjoyMDgzMzUzNTA0fQ.-mH4F_m2zU_oGGR6GSq34bNQw1vKI8rbmqCBRDPNbFg

### 1.3 Run Database Migrations

You have two options:

#### Option A: Using Supabase Dashboard (Easiest)

1. In Supabase dashboard, go to **SQL Editor**
2. Open each migration file from `app/supabase/migrations/` in order:
   - `0001_init.sql`
   - `0002_saved_jobs_features.sql`
   - `0003_company_reports.sql`
   - `0004_company_reviews.sql`
   - `0005_saved_searches_digests_tracker_profile.sql`
   - `0006_applications_notes_events_employer_update.sql`
   - `0007_platform_metrics_public.sql`
   - `0008_company_members_policies.sql`
3. Copy the entire contents of each file
4. Paste into SQL Editor and click **"Run"**
5. Repeat for all 8 migration files in order

#### Option B: Using Supabase CLI (Advanced)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
cd app
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations
supabase db push
```

### 1.4 Verify Database Setup

1. In Supabase dashboard, go to **Table Editor**
2. You should see these tables:
   - `profiles`
   - `companies`
   - `jobs`
   - `applications`
   - `saved_jobs`
   - `job_alerts`
   - `notifications`
   - And more...

If you see these tables, your database is ready! ✅

### 1.5 (Optional) Seed Test Data

If you want test data for development:

```bash
cd app
# Set your Supabase credentials first
export NEXT_PUBLIC_SUPABASE_URL="https://lwksixegtttopaeobklh.supabase.co"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3a3NpeGVndHR0b3BhZW9ia2xoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3Nzc1MDQsImV4cCI6MjA4MzM1MzUwNH0.mCqMK9uvdyFpWwk88mlBQjUuHead5Z4_pbQPURgY62I"
export SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3a3NpeGVndHR0b3BhZW9ia2xoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzc3NzUwNCwiZXhwIjoyMDgzMzUzNTA0fQ.-mH4F_m2zU_oGGR6GSq34bNQw1vKI8rbmqCBRDPNbFg"


# Run seed script
npm run seed:dev
```

This creates:
- Test employer account: `employer@example.com` / `Password123!`
- Test seeker account: `seeker@example.com` / `Password123!`
- Sample company and jobs

---

## Step 2: Set Up Local Environment (5 minutes)

### 2.1 Create Environment File

```bash
cd app
cp env.example .env.local
```

### 2.2 Fill in Environment Variables

Edit `app/.env.local`:

```bash
# Your Supabase credentials from Step 1.2
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"

# Local development URL
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# Generate a random secret for cron jobs
# You can use: openssl rand -hex 32
CRON_SECRET="your-random-secret-here"
```

### 2.3 Test Locally

```bash
cd app
npm install
npm run dev
```

Visit `http://localhost:3000` - you should see the landing page!

---

## Step 3: Deploy to Netlify (10 minutes)

### 3.1 Push Code to Git

```bash
# Make sure you're in the project root
git add .
git commit -m "Ready for Netlify deployment"
git push origin main
```

### 3.2 Connect to Netlify

1. Go to [app.netlify.com](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose your Git provider (GitHub/GitLab/Bitbucket)
4. Authorize Netlify to access your repositories
5. Select your `Aureo` repository

### 3.3 Configure Build Settings

Netlify should auto-detect from `netlify.toml`, but verify:

- **Base directory:** `app`
- **Build command:** `npm run build`
- **Publish directory:** (leave empty - handled by plugin)

### 3.4 Set Environment Variables

In Netlify Dashboard → **Site settings** → **Environment variables**, add:

```
NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key
SUPABASE_SERVICE_ROLE_KEY = your-service-role-key
NEXT_PUBLIC_SITE_URL = https://your-site-name.netlify.app
CRON_SECRET = your-random-secret
```

**Important:** 
- Use the same `CRON_SECRET` you used locally
- For `NEXT_PUBLIC_SITE_URL`, you'll need to update this after first deployment with your actual Netlify URL

### 3.5 Deploy

1. Click **"Deploy site"**
2. Wait 3-5 minutes for build to complete
3. Note your site URL (e.g., `https://random-name-123.netlify.app`)

### 3.6 Update Site URL

After deployment:

1. Go to **Site settings** → **Environment variables**
2. Edit `NEXT_PUBLIC_SITE_URL` to match your actual Netlify URL
3. Go to **Deploys** → **Trigger deploy** → **Deploy site**

---

## Step 4: Set Up Cron Jobs (10 minutes)

Your app has two cron endpoints that need to run automatically:

1. **Job Alerts** - Runs every 15 minutes
2. **Reminders** - Runs every minute

### Option A: Using cron-job.org (Recommended - Free & Easy)

1. Go to [cron-job.org](https://cron-job.org) and create a free account
2. Click **"Create cronjob"**

#### For Job Alerts:

- **Title:** `Aureo Job Alerts`
- **Address:** `https://your-site.netlify.app/api/cron/alerts`
- **Schedule:** Every 15 minutes (`*/15 * * * *`)
- **Request method:** GET
- **Request headers:** 
  - Name: `Authorization`
  - Value: `Bearer YOUR_CRON_SECRET`
- Click **"Create cronjob"**

#### For Reminders:

- **Title:** `Aureo Reminders`
- **Address:** `https://your-site.netlify.app/api/cron/reminders`
- **Schedule:** Every minute (`* * * * *`)
- **Request method:** GET
- **Request headers:**
  - Name: `Authorization`
  - Value: `Bearer YOUR_CRON_SECRET`
- Click **"Create cronjob"**

### Option B: Using EasyCron (Alternative)

1. Go to [easycron.com](https://www.easycron.com)
2. Sign up for free account
3. Create two cron jobs with same settings as above

### Option C: Using Netlify Scheduled Functions (Advanced)

See `NETLIFY_DEPLOYMENT.md` for detailed instructions on setting up Netlify Scheduled Functions.

### 4.1 Test Cron Jobs

Test that your cron endpoints work:

```bash
# Replace with your actual values
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-site.netlify.app/api/cron/alerts

curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-site.netlify.app/api/cron/reminders
```

You should get JSON responses like:
```json
{"processed": 0, "results": []}
```

---

## Step 5: Configure Supabase Auth (5 minutes)

### 5.1 Add Netlify URL to Supabase

1. In Supabase dashboard, go to **Authentication** → **URL Configuration**
2. Add your Netlify URL to **Site URL:**
   - `https://your-site.netlify.app`
3. Add to **Redirect URLs:**
   - `https://your-site.netlify.app/auth/confirm`
   - `https://your-site.netlify.app/**`
4. Click **"Save"**

### 5.2 (Optional) Configure Email Templates

1. Go to **Authentication** → **Email Templates**
2. Customize email templates if desired
3. Default templates work fine for testing

---

## Step 6: Final Verification (5 minutes)

### 6.1 Test Your Site

1. Visit your Netlify URL
2. Try registering a new account
3. Check that you can log in
4. Test creating a job (if employer) or applying (if seeker)

### 6.2 Check Logs

- **Netlify:** Go to **Functions** → **Logs** to see function execution
- **Supabase:** Go to **Logs** → **API Logs** to see database queries

### 6.3 Monitor Cron Jobs

- Check your cron service dashboard to see execution history
- Verify jobs are running on schedule

---

## 🎉 You're Done!

Your application should now be fully deployed and functional!

## Troubleshooting

### Build fails on Netlify
- Check all environment variables are set correctly
- Verify Node.js version (should be 20)
- Check build logs in Netlify dashboard

### Can't log in
- Verify Supabase URL and keys are correct
- Check `NEXT_PUBLIC_SITE_URL` matches your Netlify URL
- Ensure Supabase redirect URLs include your Netlify domain

### Cron jobs not working
- Verify `CRON_SECRET` matches in Netlify and cron service
- Test endpoints manually with curl
- Check Netlify function logs

### Database errors
- Verify all migrations ran successfully
- Check Supabase logs for errors
- Ensure RLS policies are set correctly

## Next Steps

- Set up a custom domain (optional)
- Configure email sending (if needed)
- Set up monitoring and analytics
- Review security settings

## Support

- [Supabase Docs](https://supabase.com/docs)
- [Netlify Docs](https://docs.netlify.com)
- [Next.js Docs](https://nextjs.org/docs)

