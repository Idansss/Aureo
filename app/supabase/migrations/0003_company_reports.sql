-- Company (employer) reports for marketplace safety

create table if not exists public.company_reports (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null,
  details text,
  created_at timestamptz not null default now()
);

create index if not exists company_reports_company_idx on public.company_reports(company_id);
create index if not exists company_reports_reporter_idx on public.company_reports(reporter_id);

alter table public.company_reports enable row level security;

create policy "company report insert"
on public.company_reports for insert
with check (auth.uid() = reporter_id);


