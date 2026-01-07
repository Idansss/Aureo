# Quick Deploy Guide - 30 Minutes

This is a condensed version of the full setup. For detailed instructions, see `SETUP_GUIDE.md`.

## Step 1: Supabase (10 min)

1. Create project at [supabase.com](https://supabase.com)
2. Get credentials from **Settings → API**:
   - Project URL
   - anon key
   - service_role key
3. Run migrations:
   - Go to **SQL Editor**
   - Copy/paste each file from `app/supabase/migrations/` in order (0001 through 0008)
   - Click **Run** after each

**Or use helper script:**
```bash
cd app
npm run setup:supabase  # Shows all migrations
```

## Step 2: Local Test (5 min)

```bash
cd app
cp env.example .env.local
# Edit .env.local with your Supabase credentials
npm install
npm run dev
```

Visit `http://localhost:3000` - should work!

## Step 3: Deploy to Netlify (10 min)

1. Push to Git:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push
   ```

2. In Netlify:
   - **Add new site** → **Import from Git**
   - Select repository
   - Verify settings (auto-detected from `netlify.toml`)
   - Add environment variables:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your-url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
     SUPABASE_SERVICE_ROLE_KEY=your-service-key
     NEXT_PUBLIC_SITE_URL=https://your-site.netlify.app
     CRON_SECRET=your-secret
     ```
   - **Deploy site**

3. After deploy:
   - Update `NEXT_PUBLIC_SITE_URL` with actual Netlify URL
   - Redeploy

4. In Supabase:
   - **Authentication → URL Configuration**
   - Add Netlify URL to Site URL and Redirect URLs

## Step 4: Cron Jobs (5 min)

1. Go to [cron-job.org](https://cron-job.org) (free)
2. Create account
3. Create two cron jobs:

**Job Alerts:**
- URL: `https://your-site.netlify.app/api/cron/alerts`
- Schedule: `*/15 * * * *`
- Header: `Authorization: Bearer YOUR_CRON_SECRET`

**Reminders:**
- URL: `https://your-site.netlify.app/api/cron/reminders`
- Schedule: `* * * * *`
- Header: `Authorization: Bearer YOUR_CRON_SECRET`

**Or use helper script:**
```bash
cd app
npm run setup:cron  # Shows exact configuration
```

## Done! ✅

Your app should now be live at `https://your-site.netlify.app`

## Troubleshooting

- **Build fails?** Check environment variables
- **Can't login?** Verify Supabase URL and redirect URLs
- **Cron not working?** Test with curl:
  ```bash
  curl -H "Authorization: Bearer YOUR_SECRET" \
    https://your-site.netlify.app/api/cron/alerts
  ```

For detailed help, see `SETUP_GUIDE.md` or `DEPLOYMENT_CHECKLIST.md`

