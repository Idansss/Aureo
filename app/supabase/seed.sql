-- Basic seed data for Aureo local development

insert into public.profiles (id, role, email, full_name, username, headline, location)
values
  ('11111111-1111-1111-1111-111111111111', 'seeker', 'seeker@example.com', 'Sample Seeker', 'seeker', 'Product Designer', 'Lagos, NG')
on conflict (id) do nothing;

insert into public.profiles (id, role, email, full_name, username, headline, location)
values
  ('22222222-2222-2222-2222-222222222222', 'employer', 'employer@example.com', 'Aureo Labs', 'aureolabs', 'Hiring Manager', 'Remote')
on conflict (id) do nothing;

insert into public.companies (id, name, slug, website, location, description, verified, response_rate, flagged_count, created_by)
values
  ('33333333-3333-3333-3333-333333333333', 'Aureo Labs', 'aureo-labs', 'https://example.com', 'Lagos / Remote', 'Building trustworthy hiring tools.', true, 92, 0, '22222222-2222-2222-2222-222222222222')
on conflict (id) do nothing;

insert into public.company_members (company_id, user_id, member_role)
values
  ('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'owner')
on conflict (company_id, user_id) do nothing;

insert into public.jobs (id, company_id, title, employment_type, location, remote, salary_min, salary_max, currency, description, requirements, is_active, created_by)
values
  ('44444444-4444-4444-4444-444444444444',
   '33333333-3333-3333-3333-333333333333',
   'Product Designer – Hiring Trust',
   'Full-time',
   'Lagos / Hybrid',
   true,
   7000000,
   9500000,
   'NGN',
   'Design the next generation of trust‑first hiring experiences for Aureo.',
   '3+ years product design, strong UX craft, portfolio of shipped work.',
   true,
   '22222222-2222-2222-2222-222222222222')
on conflict (id) do nothing;



