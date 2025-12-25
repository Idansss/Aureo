-- Saved searches + digests + job tracker, plus profile JSON fields for persistence

do $$ begin
  create type public.job_tracker_status as enum ('saved','applied','interview','offer','rejected');
exception when duplicate_object then null; end $$;

-- Extend profiles to store the data the Profile editor captures
alter table public.profiles
  add column if not exists links jsonb not null default '{}'::jsonb,
  add column if not exists skills text[] not null default '{}'::text[],
  add column if not exists experience jsonb not null default '[]'::jsonb,
  add column if not exists projects jsonb not null default '[]'::jsonb,
  add column if not exists remote_preference text,
  add column if not exists is_public boolean not null default true;

create table if not exists public.saved_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  query text not null default '',
  filters jsonb not null default '{}'::jsonb,
  schedule jsonb not null default '{}'::jsonb,
  delivery jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  last_run_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists saved_searches_user_idx on public.saved_searches(user_id);
create index if not exists saved_searches_active_idx on public.saved_searches(active);

create table if not exists public.search_digests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  saved_search_id uuid not null references public.saved_searches(id) on delete cascade,
  summary_rows jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists search_digests_user_idx on public.search_digests(user_id);
create index if not exists search_digests_search_idx on public.search_digests(saved_search_id);
create index if not exists search_digests_created_idx on public.search_digests(created_at);

create table if not exists public.job_tracker_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  status public.job_tracker_status not null default 'saved',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, job_id)
);

create index if not exists job_tracker_user_idx on public.job_tracker_items(user_id);
create index if not exists job_tracker_job_idx on public.job_tracker_items(job_id);
create index if not exists job_tracker_status_idx on public.job_tracker_items(status);

alter table public.saved_searches enable row level security;
alter table public.search_digests enable row level security;
alter table public.job_tracker_items enable row level security;

create policy "saved searches owner read" on public.saved_searches for select
  using (auth.uid() = user_id);
create policy "saved searches owner insert" on public.saved_searches for insert
  with check (auth.uid() = user_id);
create policy "saved searches owner update" on public.saved_searches for update
  using (auth.uid() = user_id);
create policy "saved searches owner delete" on public.saved_searches for delete
  using (auth.uid() = user_id);

create policy "digests owner read" on public.search_digests for select
  using (auth.uid() = user_id);
create policy "digests owner insert" on public.search_digests for insert
  with check (auth.uid() = user_id);
create policy "digests owner delete" on public.search_digests for delete
  using (auth.uid() = user_id);

create policy "tracker owner read" on public.job_tracker_items for select
  using (auth.uid() = user_id);
create policy "tracker owner insert" on public.job_tracker_items for insert
  with check (auth.uid() = user_id);
create policy "tracker owner update" on public.job_tracker_items for update
  using (auth.uid() = user_id);
create policy "tracker owner delete" on public.job_tracker_items for delete
  using (auth.uid() = user_id);

-- Allow employers (company members) to move applications for their jobs through the pipeline.
create policy "employers update job applications"
on public.applications for update
using (
  exists (
    select 1
    from public.jobs j
    join public.company_members m on m.company_id = j.company_id
    where j.id = job_id and m.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.jobs j
    join public.company_members m on m.company_id = j.company_id
    where j.id = job_id and m.user_id = auth.uid()
  )
);


