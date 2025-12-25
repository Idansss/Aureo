-- Application quality-of-life fields + event write permissions + employer status updates

alter table public.applications
  add column if not exists notes text,
  add column if not exists withdrawn_at timestamptz;

-- Allow employers (company members) to update applications for their jobs (e.g. move stages)
do $$ begin
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
exception when duplicate_object then null; end $$;

-- Allow both seekers and employers (participants) to insert application events.
do $$ begin
  create policy "participants insert application events"
  on public.application_events for insert
  with check (
    actor_id = auth.uid()
    and exists (
      select 1
      from public.applications a
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
exception when duplicate_object then null; end $$;



