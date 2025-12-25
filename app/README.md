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

