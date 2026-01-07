# Aureo

Aureo is a Next.js App Router frontend for a trust-first job search and hiring platform.

## Tech stack

- Next.js (App Router, TypeScript)
- Tailwind CSS + shadcn/ui (Radix)
- Supabase (auth, data)

## Project root

This repository has a standalone Next.js project inside `app/`.

Run all commands from the `app/` folder (it contains `package.json`, `next.config.ts`, and `.env.local`):

```bash
cd app
```

## Environment variables

Create `app/.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CRON_SECRET=your-cron-secret
```

Notes:
- Supabase environment variables are required for auth and persistence.
- `CRON_SECRET` is optional in local dev but recommended in production (protects `/api/cron/*`).

If you change `.env.local`, stop the dev server, delete `.next`, and restart so env values are rebundled:

```bash
cd app
rmdir /s /q .next   # use rm -rf .next on macOS/Linux
npm run dev
```

## Local development

```bash
cd app
npm install
npm run dev
```

## Smoke test

Route smoke test script:

```bash
cd app
node scripts/smoke-routes.mjs
```

This script derives routes from `src/app`, starts a dev server if needed, and fetches key pages to confirm they render.

## Key routes

- `/` Landing page
- `/jobs` Jobs browsing with filters
- `/jobs/[id]` Job detail with apply and report flows
- `/employers` Employers directory
- `/employers/[slug]` Employer profile
- `/stories` Stories list
- `/stories/[slug]` Story detail
- `/pricing` Pricing page
- `/app` Seeker dashboard
- `/dashboard/employer` Employer dashboard
- `/messages` Messaging
- `/alerts` Job alerts
- `/admin/reports` Admin reports inbox
- `/status` Internal health page for routes and smoke testing

## 🚀 Quick Start

**New to this project?** Start here:

1. **Quick Deploy (30 min):** See [`QUICK_DEPLOY.md`](./QUICK_DEPLOY.md)
2. **Complete Setup Guide:** See [`SETUP_GUIDE.md`](./SETUP_GUIDE.md)
3. **Deployment Checklist:** See [`DEPLOYMENT_CHECKLIST.md`](./DEPLOYMENT_CHECKLIST.md)

## Deployment to Netlify

### Prerequisites

1. A Netlify account (sign up at [netlify.com](https://www.netlify.com))
2. A Supabase project with your database set up
3. Git repository (GitHub, GitLab, or Bitbucket)

### Step 1: Install Netlify CLI (Optional)

```bash
npm install -g netlify-cli
```

### Step 2: Configure Environment Variables

In your Netlify dashboard:

1. Go to **Site settings** → **Environment variables**
2. Add the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
NEXT_PUBLIC_SITE_URL=https://your-site-name.netlify.app
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CRON_SECRET=your-cron-secret
```

**Important:** Replace `NEXT_PUBLIC_SITE_URL` with your actual Netlify site URL after deployment.

### Step 3: Deploy via Git (Recommended)

1. Push your code to GitHub/GitLab/Bitbucket
2. In Netlify dashboard, click **Add new site** → **Import an existing project**
3. Connect your repository
4. Configure build settings:
   - **Base directory:** `app`
   - **Build command:** `npm run build`
   - **Publish directory:** **Leave EMPTY** (Next.js plugin handles this automatically)
5. Click **Deploy site**

**⚠️ Important:** The `netlify.toml` file must be in your **repository root**, not in the `app/` folder. If you're getting 404 errors, see `NETLIFY_TROUBLESHOOTING.md` or `NETLIFY_FIX.md` in the root directory.

Netlify will automatically detect the `netlify.toml` configuration file.

### Step 4: Set Up Scheduled Functions (Cron Jobs)

Your app has two cron endpoints that need to be scheduled:

1. **Job Alerts** (`/api/cron/alerts`) - Should run every 15 minutes
2. **Reminders** (`/api/cron/reminders`) - Should run every minute

#### Option A: Using Netlify Scheduled Functions (Recommended)

1. Go to **Functions** → **Scheduled Functions** in Netlify dashboard
2. Create a new scheduled function for alerts:
   - **Function name:** `cron-alerts`
   - **Schedule:** `*/15 * * * *` (every 15 minutes)
   - **Function path:** `/.netlify/functions/cron-alerts`
3. Create a new scheduled function for reminders:
   - **Function name:** `cron-reminders`
   - **Schedule:** `* * * * *` (every minute)
   - **Function path:** `/.netlify/functions/cron-reminders`

#### Option B: Using External Cron Service

You can use services like [cron-job.org](https://cron-job.org) or [EasyCron](https://www.easycron.com) to call your endpoints:

- **URL:** `https://your-site.netlify.app/api/cron/alerts`
- **Method:** GET
- **Headers:** `Authorization: Bearer YOUR_CRON_SECRET`
- **Schedule:** Every 15 minutes

- **URL:** `https://your-site.netlify.app/api/cron/reminders`
- **Method:** GET
- **Headers:** `Authorization: Bearer YOUR_CRON_SECRET`
- **Schedule:** Every minute

### Step 5: Update Site URL

After deployment, update the `NEXT_PUBLIC_SITE_URL` environment variable in Netlify to match your actual site URL (e.g., `https://your-site-name.netlify.app`).

### Troubleshooting

- **Build fails:** Check that all environment variables are set correctly
- **Cron jobs not working:** Verify `CRON_SECRET` is set and matches in your cron service
- **Authentication issues:** Ensure Supabase URL and keys are correct
- **404 errors:** Make sure the base directory is set to `app` in Netlify build settings

### Manual Deployment (Alternative)

If you prefer to deploy manually:

```bash
cd app
npm install
npm run build
netlify deploy --prod
```

Or use the Netlify CLI:

```bash
netlify init
netlify deploy --prod
```

