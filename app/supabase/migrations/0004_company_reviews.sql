-- Company reviews (public) so seekers can leave feedback on employers

create table if not exists public.company_reviews (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  rating int not null check (rating >= 1 and rating <= 5),
  title text,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, user_id)
);

create index if not exists company_reviews_company_idx on public.company_reviews(company_id);
create index if not exists company_reviews_user_idx on public.company_reviews(user_id);

alter table public.company_reviews enable row level security;

create policy "company reviews public read"
on public.company_reviews for select
using (true);

create policy "company reviews insert by owner"
on public.company_reviews for insert
with check (auth.uid() = user_id);

create policy "company reviews update by owner"
on public.company_reviews for update
using (auth.uid() = user_id);

create policy "company reviews delete by owner"
on public.company_reviews for delete
using (auth.uid() = user_id);


