-- Platform metrics (public) + response-time aggregation (automatic)
--
-- Purpose:
-- - Replace hard-coded marketing metrics with real numbers
-- - Keep metrics updating automatically as users interact with the product
--
-- Notes:
-- - Jobs/companies/reviews are already publicly readable via RLS policies.
-- - Applications are NOT public; to compute response-time we aggregate into companies via trigger.

alter table public.companies
  add column if not exists response_time_total_hours double precision not null default 0,
  add column if not exists response_time_samples int not null default 0,
  add column if not exists avg_response_time_hours double precision;

create or replace function public.__aureo_update_company_response_metrics()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_company_id uuid;
  v_applied_at timestamptz;
  v_is_employer_actor boolean;
  v_has_prior_employer_event boolean;
  v_diff_hours double precision;
begin
  -- Resolve the company behind this application event
  select j.company_id, a.created_at
    into v_company_id, v_applied_at
  from public.applications a
  join public.jobs j on j.id = a.job_id
  where a.id = new.application_id;

  if v_company_id is null or v_applied_at is null then
    return new;
  end if;

  -- Only count events created by employer members for that company
  select exists (
    select 1 from public.company_members m
    where m.company_id = v_company_id and m.user_id = new.actor_id
  ) into v_is_employer_actor;

  if not v_is_employer_actor then
    return new;
  end if;

  -- Only count the *first* employer event on an application as the "first response"
  select exists (
    select 1
    from public.application_events e
    where e.application_id = new.application_id
      and e.id <> new.id
      and e.created_at < new.created_at
      and e.actor_id is not null
      and exists (
        select 1
        from public.company_members m
        where m.company_id = v_company_id and m.user_id = e.actor_id
      )
  ) into v_has_prior_employer_event;

  if v_has_prior_employer_event then
    return new;
  end if;

  v_diff_hours := extract(epoch from (new.created_at - v_applied_at)) / 3600.0;
  if v_diff_hours < 0 then v_diff_hours := 0; end if;

  update public.companies c
  set
    response_time_total_hours = c.response_time_total_hours + v_diff_hours,
    response_time_samples = c.response_time_samples + 1,
    avg_response_time_hours =
      (c.response_time_total_hours + v_diff_hours) / (c.response_time_samples + 1),
    updated_at = now()
  where c.id = v_company_id;

  return new;
end;
$$;

drop trigger if exists aureo_company_response_metrics_on_event on public.application_events;
create trigger aureo_company_response_metrics_on_event
after insert on public.application_events
for each row
execute function public.__aureo_update_company_response_metrics();

-- Public metrics view used by marketing pages (safe for anon key).
create or replace view public.platform_metrics_public as
select
  (select count(*)::int from public.companies where verified = true) as verified_employers,
  (select count(*)::int from public.jobs where is_active = true) as active_roles,
  coalesce(
    round((select avg(rating)::numeric from public.company_reviews) * 20),
    0
  )::int as satisfaction_rate_percent,
  case
    when (select sum(response_time_samples) from public.companies) > 0
      then (select sum(response_time_total_hours) from public.companies)
         / nullif((select sum(response_time_samples) from public.companies), 0)
    else null
  end as avg_response_time_hours;

-- Make the metrics view readable from the public API (anon/authenticated).
grant select on public.platform_metrics_public to anon, authenticated;


