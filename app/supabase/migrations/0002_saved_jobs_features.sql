-- Saved jobs + folders + alerts + reminders + notifications

do $$ begin
  create type public.alert_frequency as enum ('instant','daily','weekly');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.reminder_status as enum ('scheduled','sent','cancelled');
exception when duplicate_object then null; end $$;

create table if not exists public.job_folders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  color text,
  sort_order int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);

create index if not exists job_folders_user_idx on public.job_folders(user_id);

create table if not exists public.saved_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  folder_id uuid references public.job_folders(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, job_id)
);

create index if not exists saved_jobs_user_idx on public.saved_jobs(user_id);
create index if not exists saved_jobs_job_idx on public.saved_jobs(job_id);
create index if not exists saved_jobs_folder_idx on public.saved_jobs(folder_id);

create table if not exists public.job_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  criteria jsonb not null default '{}'::jsonb,
  frequency public.alert_frequency not null default 'daily',
  is_active boolean not null default true,
  last_run_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists job_alerts_user_idx on public.job_alerts(user_id);
create index if not exists job_alerts_active_idx on public.job_alerts(is_active);

create table if not exists public.job_reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  saved_job_id uuid not null references public.saved_jobs(id) on delete cascade,
  remind_at timestamptz not null,
  note text,
  status public.reminder_status not null default 'scheduled',
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists job_reminders_user_idx on public.job_reminders(user_id);
create index if not exists job_reminders_due_idx on public.job_reminders(remind_at);
create index if not exists job_reminders_status_idx on public.job_reminders(status);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  data jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_idx on public.notifications(user_id);
create index if not exists notifications_read_idx on public.notifications(read_at);

alter table public.job_folders enable row level security;
alter table public.saved_jobs enable row level security;
alter table public.job_alerts enable row level security;
alter table public.job_reminders enable row level security;
alter table public.notifications enable row level security;

create policy "folders owner read" on public.job_folders for select
  using (auth.uid() = user_id);

create policy "folders owner insert" on public.job_folders for insert
  with check (auth.uid() = user_id);

create policy "folders owner update" on public.job_folders for update
  using (auth.uid() = user_id);

create policy "folders owner delete" on public.job_folders for delete
  using (auth.uid() = user_id);

create policy "saved jobs owner read" on public.saved_jobs for select
  using (auth.uid() = user_id);

create policy "saved jobs owner insert" on public.saved_jobs for insert
  with check (auth.uid() = user_id);

create policy "saved jobs owner update" on public.saved_jobs for update
  using (auth.uid() = user_id);

create policy "saved jobs owner delete" on public.saved_jobs for delete
  using (auth.uid() = user_id);

create policy "alerts owner read" on public.job_alerts for select
  using (auth.uid() = user_id);

create policy "alerts owner insert" on public.job_alerts for insert
  with check (auth.uid() = user_id);

create policy "alerts owner update" on public.job_alerts for update
  using (auth.uid() = user_id);

create policy "alerts owner delete" on public.job_alerts for delete
  using (auth.uid() = user_id);

create policy "reminders owner read" on public.job_reminders for select
  using (auth.uid() = user_id);

create policy "reminders owner insert" on public.job_reminders for insert
  with check (auth.uid() = user_id);

create policy "reminders owner update" on public.job_reminders for update
  using (auth.uid() = user_id);

create policy "reminders owner delete" on public.job_reminders for delete
  using (auth.uid() = user_id);

create policy "notifications owner read" on public.notifications for select
  using (auth.uid() = user_id);

create policy "notifications owner insert" on public.notifications for insert
  with check (auth.uid() = user_id);

create policy "notifications owner update" on public.notifications for update
  using (auth.uid() = user_id);

create policy "notifications owner delete" on public.notifications for delete
  using (auth.uid() = user_id);
