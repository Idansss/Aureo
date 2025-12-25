-- Aureo core schema & RLS
create extension if not exists pgcrypto;

do $$ begin
  create type public.user_role as enum ('seeker','employer','admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.application_status as enum ('applied','screening','interview','offer','rejected','withdrawn');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'seeker',
  email text,
  full_name text,
  username text unique,
  headline text,
  location text,
  bio text,
  avatar_url text,
  cv_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_username_idx on public.profiles(username);

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  website text,
  location text,
  description text,
  logo_url text,
  verified boolean not null default false,
  response_rate int not null default 0,
  flagged_count int not null default 0,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists companies_slug_idx on public.companies(slug);

create table if not exists public.company_members (
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  member_role text not null default 'owner',
  created_at timestamptz not null default now(),
  primary key (company_id, user_id)
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  title text not null,
  employment_type text,
  location text,
  remote boolean not null default false,
  salary_min int,
  salary_max int,
  currency text default 'NGN',
  description text not null,
  requirements text,
  is_active boolean not null default true,
  flagged boolean not null default false,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists jobs_company_idx on public.jobs(company_id);
create index if not exists jobs_active_idx on public.jobs(is_active);
create index if not exists jobs_search_idx on public.jobs using gin (to_tsvector('english', title || ' ' || coalesce(description,'')));

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status public.application_status not null default 'applied',
  cover_letter text,
  resume_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(job_id, user_id)
);

create index if not exists applications_user_idx on public.applications(user_id);
create index if not exists applications_job_idx on public.applications(job_id);

create table if not exists public.application_events (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  note text,
  from_status public.application_status,
  to_status public.application_status,
  created_at timestamptz not null default now()
);

create index if not exists application_events_app_idx on public.application_events(application_id);

create table if not exists public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  link_url text,
  media_url text,
  created_at timestamptz not null default now()
);

create index if not exists portfolio_user_idx on public.portfolio_items(user_id);

create table if not exists public.job_reports (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null,
  details text,
  created_at timestamptz not null default now()
);

create index if not exists job_reports_job_idx on public.job_reports(job_id);

alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.company_members enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;
alter table public.application_events enable row level security;
alter table public.portfolio_items enable row level security;
alter table public.job_reports enable row level security;

create policy "profiles are viewable by anyone"
on public.profiles for select
using (true);

create policy "users can update their profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "users can insert their profile"
on public.profiles for insert
with check (auth.uid() = id);

create policy "jobs public read"
on public.jobs for select
using (is_active = true);

create policy "employer create job"
on public.jobs for insert
with check (
  exists (
    select 1 from public.company_members m
    where m.company_id = company_id and m.user_id = auth.uid()
  )
);

create policy "employer update own jobs"
on public.jobs for update
using (
  exists (
    select 1 from public.company_members m
    where m.company_id = company_id and m.user_id = auth.uid()
  )
);

create policy "companies public read"
on public.companies for select
using (true);

create policy "company create"
on public.companies for insert
with check (auth.uid() = created_by);

create policy "company update by members"
on public.companies for update
using (
  exists (
    select 1 from public.company_members m
    where m.company_id = id and m.user_id = auth.uid()
  )
);

create policy "users read own applications"
on public.applications for select
using (auth.uid() = user_id);

create policy "users create applications"
on public.applications for insert
with check (auth.uid() = user_id);

create policy "users update own applications"
on public.applications for update
using (auth.uid() = user_id);

create policy "employers read job applications"
on public.applications for select
using (
  exists (
    select 1
    from public.jobs j
    join public.company_members m on m.company_id = j.company_id
    where j.id = job_id and m.user_id = auth.uid()
  )
);

create policy "read events if you can read application"
on public.application_events for select
using (
  exists (
    select 1 from public.applications a
    where a.id = application_id
    and (
      a.user_id = auth.uid()
      or exists (
        select 1
        from public.jobs j
        join public.company_members m on m.company_id = j.company_id
        where j.id = a.job_id and m.user_id = auth.uid()
      )
    )
  )
);

create policy "portfolio public read"
on public.portfolio_items for select
using (true);

create policy "portfolio owner write"
on public.portfolio_items for insert
with check (auth.uid() = user_id);

create policy "portfolio owner update"
on public.portfolio_items for update
using (auth.uid() = user_id);

create policy "portfolio owner delete"
on public.portfolio_items for delete
using (auth.uid() = user_id);

create policy "report insert"
on public.job_reports for insert
with check (auth.uid() = reporter_id);

create policy "members read their rows"
on public.company_members for select
using (auth.uid() = user_id);

-- ----
-- ATS & trust / proof extensions
-- ----

-- Additional trust metrics on companies
alter table public.companies
  add column if not exists trust_score int not null default 0,
  add column if not exists offer_rate int not null default 0,
  add column if not exists candidate_rating_avg numeric(3,2) default 0;

-- Scam / trust metadata on jobs
alter table public.jobs
  add column if not exists scam_score int not null default 0,
  add column if not exists scam_reasons jsonb not null default '[]'::jsonb;

-- Optional source metadata for internal vs external applications
alter table public.applications
  add column if not exists source text,
  add column if not exists external_company text,
  add column if not exists external_title text,
  add column if not exists external_url text;

-- Interviews and scorecards
create table if not exists public.interviews (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  scheduled_at timestamptz,
  location text,
  meeting_url text,
  stage text,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null
);

create index if not exists interviews_application_idx on public.interviews(application_id);

create table if not exists public.interview_scorecards (
  id uuid primary key default gen_random_uuid(),
  interview_id uuid not null references public.interviews(id) on delete cascade,
  interviewer_id uuid references public.profiles(id) on delete set null,
  overall_rating int,
  strengths text,
  risks text,
  recommendation text,
  created_at timestamptz not null default now()
);

create index if not exists interview_scorecards_interview_idx on public.interview_scorecards(interview_id);

create table if not exists public.interview_notes (
  id uuid primary key default gen_random_uuid(),
  interview_id uuid not null references public.interviews(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  note text not null,
  created_at timestamptz not null default now()
);

create index if not exists interview_notes_interview_idx on public.interview_notes(interview_id);

-- Work samples per application
create table if not exists public.application_work_samples (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  label text,
  link_url text,
  file_url text,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists application_work_samples_app_idx on public.application_work_samples(application_id);

-- Simple assessment suite
create table if not exists public.job_assessments (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  title text not null,
  description text,
  time_limit_minutes int,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null
);

create index if not exists job_assessments_job_idx on public.job_assessments(job_id);

create table if not exists public.assessment_questions (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.job_assessments(id) on delete cascade,
  question text not null,
  options jsonb,
  correct_option text,
  order_index int not null default 0
);

create index if not exists assessment_questions_assessment_idx on public.assessment_questions(assessment_id);

create table if not exists public.assessment_attempts (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.job_assessments(id) on delete cascade,
  application_id uuid references public.applications(id) on delete set null,
  user_id uuid not null references public.profiles(id) on delete cascade,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  score numeric(5,2),
  status text not null default 'in_progress'
);

create index if not exists assessment_attempts_assessment_idx on public.assessment_attempts(assessment_id);
create index if not exists assessment_attempts_user_idx on public.assessment_attempts(user_id);

create table if not exists public.assessment_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.assessment_attempts(id) on delete cascade,
  question_id uuid not null references public.assessment_questions(id) on delete cascade,
  selected_option text,
  is_correct boolean,
  created_at timestamptz not null default now()
);

create index if not exists assessment_answers_attempt_idx on public.assessment_answers(attempt_id);

