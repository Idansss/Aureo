# DEV NOTES (Aureo)

## Persistence model

- **Source of truth**: Supabase Postgres + Supabase Auth.
- **Client storage**: `localStorage` is only used for **non-critical UI preferences** (density, font size, motion, etc).

## Supabase schema

Migrations live in `app/supabase/migrations/`.

- `0001_init.sql`: core tables (`profiles`, `companies`, `jobs`, `applications`, `application_events`, `portfolio_items`) + RLS.
- `0002_saved_jobs_features.sql`: saved jobs + folders + alerts + reminders + notifications + RLS.
- `0003_company_reports.sql`: company reports + RLS.
- `0004_company_reviews.sql`: company reviews + RLS.
- `0005_saved_searches_digests_tracker_profile.sql`: saved searches, digests, job tracker, profile extensions.
- `0006_applications_notes_events_employer_update.sql`: application notes/withdrawn fields + allow participants to insert `application_events` + allow employers to update applications for their jobs.

## Local development

1. Create `app/.env.local` with your Supabase keys:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only; required for admin/reporting flows)
2. Apply migrations to your Supabase project (or Supabase local).
3. Run the app:

```bash
cd app
npm install
npm run dev
```

## Mock flow removal

- All placeholder/mock UI text and mock-only modules were removed from `app/src`.
- Saved Jobs, Alerts, Reminders, Saved Searches, Digests, Applications, Job Tracker, Reviews, and Reports use Supabase-backed reads/writes.


