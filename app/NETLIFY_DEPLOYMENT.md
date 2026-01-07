# Netlify Deployment Guide for Aureo

This guide will help you deploy your Aureo application to Netlify.

## Quick Start Checklist

- [ ] Netlify account created
- [ ] Supabase project set up with database migrations
- [ ] Git repository ready (GitHub/GitLab/Bitbucket)
- [ ] Environment variables documented
- [ ] Build tested locally

## Step-by-Step Deployment

### 1. Prepare Your Repository

Ensure your code is pushed to a Git repository:

```bash
git add .
git commit -m "Prepare for Netlify deployment"
git push origin main
```

### 2. Connect to Netlify

1. Log in to [Netlify Dashboard](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose your Git provider and authorize Netlify
4. Select your repository

### 3. Configure Build Settings

Netlify should auto-detect the settings from `netlify.toml`, but verify:

- **Base directory:** `app`
- **Build command:** `npm run build`
- **Publish directory:** Leave empty (handled by Next.js plugin)

### 4. Set Environment Variables

In Netlify Dashboard → **Site settings** → **Environment variables**, add:

#### Required Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

#### Recommended Variables

```
NEXT_PUBLIC_SITE_URL=https://your-site-name.netlify.app
CRON_SECRET=generate-a-long-random-string-here
```

**Important Notes:**
- Replace `NEXT_PUBLIC_SITE_URL` with your actual Netlify site URL after first deployment
- Generate a strong `CRON_SECRET` (e.g., using `openssl rand -hex 32`)
- Never commit these values to Git

### 5. Install Netlify Next.js Plugin

The `netlify.toml` file includes the Next.js plugin configuration. Netlify will automatically install `@netlify/plugin-nextjs` during the build.

If you need to install it manually:

```bash
cd app
npm install --save-dev @netlify/plugin-nextjs
```

### 6. Deploy

1. Click **"Deploy site"** in Netlify
2. Wait for the build to complete
3. Note your site URL (e.g., `https://random-name-123.netlify.app`)

### 7. Update Site URL

After deployment, update the `NEXT_PUBLIC_SITE_URL` environment variable:

1. Go to **Site settings** → **Environment variables**
2. Edit `NEXT_PUBLIC_SITE_URL` to match your actual site URL
3. Trigger a new deployment (or it will update on the next deploy)

### 8. Set Up Cron Jobs

Your application has two cron endpoints that need to be scheduled:

#### Option A: Netlify Scheduled Functions (Recommended)

1. Go to **Functions** → **Scheduled Functions** in Netlify dashboard
2. Create scheduled function for alerts:
   - Click **"Create scheduled function"**
   - **Function name:** `cron-alerts`
   - **Schedule:** `*/15 * * * *` (every 15 minutes)
   - **Function path:** Create a wrapper function (see below)

3. Create scheduled function for reminders:
   - **Function name:** `cron-reminders`
   - **Schedule:** `* * * * *` (every minute)
   - **Function path:** Create a wrapper function (see below)

**Note:** Netlify scheduled functions need to be in the `netlify/functions` directory. You'll need to create wrapper functions that call your Next.js API routes.

#### Option B: External Cron Service (Easier)

Use a service like [cron-job.org](https://cron-job.org) or [EasyCron](https://www.easycron.com):

**For Job Alerts:**
- **URL:** `https://your-site.netlify.app/api/cron/alerts`
- **Method:** GET
- **Headers:** `Authorization: Bearer YOUR_CRON_SECRET`
- **Schedule:** Every 15 minutes (`*/15 * * * *`)

**For Reminders:**
- **URL:** `https://your-site.netlify.app/api/cron/reminders`
- **Method:** GET
- **Headers:** `Authorization: Bearer YOUR_CRON_SECRET`
- **Schedule:** Every minute (`* * * * *`)

### 9. Verify Deployment

1. Visit your site URL
2. Test authentication (login/register)
3. Check protected routes (should redirect if not logged in)
4. Verify API endpoints are working
5. Test cron endpoints manually (with Authorization header)

## Troubleshooting

### Build Fails

**Error: "Cannot find module"**
- Ensure all dependencies are in `package.json`
- Check that `node_modules` is not committed to Git
- Verify Node.js version (should be 20)

**Error: "Environment variable not found"**
- Check all required environment variables are set in Netlify
- Ensure variable names match exactly (case-sensitive)
- Redeploy after adding variables

### Runtime Errors

**Authentication not working**
- Verify Supabase URL and keys are correct
- Check `NEXT_PUBLIC_SITE_URL` matches your actual site URL
- Ensure Supabase project allows your Netlify domain

**404 errors on routes**
- Verify base directory is set to `app`
- Check that `netlify.toml` is in the `app` directory
- Ensure Next.js plugin is installed

**Cron jobs not running**
- Verify `CRON_SECRET` is set in both Netlify and your cron service
- Check that Authorization header matches exactly
- Test endpoints manually with curl:
  ```bash
  curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
    https://your-site.netlify.app/api/cron/alerts
  ```

### Performance Issues

- Enable Netlify's Edge Functions for better performance
- Check build logs for optimization warnings
- Consider enabling Netlify Analytics

## Custom Domain Setup

1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Follow Netlify's DNS configuration instructions
4. Update `NEXT_PUBLIC_SITE_URL` to your custom domain
5. Redeploy

## Continuous Deployment

Netlify automatically deploys when you push to your connected branch (usually `main` or `master`). 

To deploy from a different branch:
1. Go to **Site settings** → **Build & deploy**
2. Change the production branch
3. Or set up branch deploys for preview deployments

## Monitoring

- **Build logs:** Available in Netlify dashboard for each deployment
- **Function logs:** Check **Functions** tab for serverless function logs
- **Analytics:** Enable in **Site settings** → **Analytics**

## Support

- [Netlify Documentation](https://docs.netlify.com)
- [Next.js on Netlify](https://docs.netlify.com/integrations/frameworks/next-js/)
- [Supabase Documentation](https://supabase.com/docs)

