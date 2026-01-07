# Quick Start Guide

## Local Setup (5 minutes)

1. **Install dependencies:**
   ```bash
   cd app
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Open browser:**
   Navigate to `http://localhost:3000`

## Netlify Deployment (10 minutes)

1. **Push to Git:**
   ```bash
   git add .
   git commit -m "Ready for Netlify"
   git push
   ```

2. **Connect to Netlify:**
   - Go to [netlify.com](https://www.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your Git repository
   - Netlify will auto-detect settings from `netlify.toml`

3. **Set environment variables:**
   In Netlify Dashboard → Site settings → Environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-key
   NEXT_PUBLIC_SITE_URL=https://your-site.netlify.app
   CRON_SECRET=your-secret
   ```

4. **Deploy:**
   Click "Deploy site" and wait for build to complete

5. **Update site URL:**
   After first deployment, update `NEXT_PUBLIC_SITE_URL` with your actual Netlify URL

6. **Set up cron jobs:**
   Use [cron-job.org](https://cron-job.org) to call:
   - `https://your-site.netlify.app/api/cron/alerts` (every 15 min)
   - `https://your-site.netlify.app/api/cron/reminders` (every minute)
   - Add header: `Authorization: Bearer YOUR_CRON_SECRET`

## Troubleshooting

**Build fails?**
- Check all environment variables are set
- Verify Node.js version (should be 20)
- Check build logs in Netlify dashboard

**Can't login?**
- Verify Supabase credentials are correct
- Check `NEXT_PUBLIC_SITE_URL` matches your site URL
- Ensure Supabase project allows your domain

**Cron jobs not working?**
- Verify `CRON_SECRET` matches in Netlify and cron service
- Test endpoint manually with curl
- Check function logs in Netlify dashboard

For detailed instructions, see `NETLIFY_DEPLOYMENT.md`

