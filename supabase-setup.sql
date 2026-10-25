create or replace function public.is_cleansmith_admin()
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role' = 'admin', false);
$$;

grant execute on function public.is_cleansmith_admin() to authenticated;

create table if not exists public.packages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  starting_price integer not null check (starting_price >= 0),
  price_unit text not null default 'session',
  vehicle_prices jsonb not null default '{}'::jsonb,
  duration text not null default '',
  features text[] not null default '{}',
  badge text not null default '',
  style text not null default 'standard' check (style in ('standard', 'featured', 'executive')),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.membership_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price integer not null check (price >= 0),
  billing_interval text not null default 'month',
  benefits text[] not null default '{}',
  discount_percent integer not null default 0 check (discount_percent between 0 and 100),
  badge text not null default '',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null default '',
  phone text not null default '',
  plan_id uuid references public.membership_plans(id) on delete set null,
  status text not null default 'active' check (status in ('active', 'paused', 'cancelled')),
  joined_at date not null default current_date,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.work_gallery (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  caption text not null default '',
  alt_text text not null default '',
  media_type text not null check (media_type in ('image', 'video')),
  media_url text not null,
  storage_path text,
  is_published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.packages enable row level security;
alter table public.membership_plans enable row level security;
alter table public.members enable row level security;
alter table public.work_gallery enable row level security;

grant select on public.packages, public.membership_plans, public.work_gallery to anon, authenticated;
grant select, insert, update, delete on public.packages, public.membership_plans, public.members, public.work_gallery to authenticated;

drop policy if exists "Public can read active packages" on public.packages;
create policy "Public can read active packages"
  on public.packages for select to anon, authenticated using (is_active or public.is_cleansmith_admin());
drop policy if exists "Admins manage packages" on public.packages;
create policy "Admins manage packages"
  on public.packages for all to authenticated
  using (public.is_cleansmith_admin()) with check (public.is_cleansmith_admin());

drop policy if exists "Public can read active membership plans" on public.membership_plans;
create policy "Public can read active membership plans"
  on public.membership_plans for select to anon, authenticated using (is_active or public.is_cleansmith_admin());
drop policy if exists "Admins manage membership plans" on public.membership_plans;
create policy "Admins manage membership plans"
  on public.membership_plans for all to authenticated
  using (public.is_cleansmith_admin()) with check (public.is_cleansmith_admin());

drop policy if exists "Admins manage members" on public.members;
create policy "Admins manage members"
  on public.members for all to authenticated
  using (public.is_cleansmith_admin()) with check (public.is_cleansmith_admin());

drop policy if exists "Public can read published work" on public.work_gallery;
create policy "Public can read published work"
  on public.work_gallery for select to anon, authenticated using (is_published or public.is_cleansmith_admin());
drop policy if exists "Admins manage work gallery" on public.work_gallery;
create policy "Admins manage work gallery"
  on public.work_gallery for all to authenticated
  using (public.is_cleansmith_admin()) with check (public.is_cleansmith_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('cleansmith-work', 'cleansmith-work', true, 104857600, array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view CleanSmith work media" on storage.objects;
create policy "Public can view CleanSmith work media"
  on storage.objects for select to anon, authenticated using (bucket_id = 'cleansmith-work');
drop policy if exists "Admins upload CleanSmith work media" on storage.objects;
create policy "Admins upload CleanSmith work media"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'cleansmith-work' and public.is_cleansmith_admin());
drop policy if exists "Admins update CleanSmith work media" on storage.objects;
create policy "Admins update CleanSmith work media"
  on storage.objects for update to authenticated
  using (bucket_id = 'cleansmith-work' and public.is_cleansmith_admin())
  with check (bucket_id = 'cleansmith-work' and public.is_cleansmith_admin());
drop policy if exists "Admins delete CleanSmith work media" on storage.objects;
create policy "Admins delete CleanSmith work media"
  on storage.objects for delete to authenticated
  using (bucket_id = 'cleansmith-work' and public.is_cleansmith_admin());

insert into public.packages
  (slug, name, description, starting_price, price_unit, vehicle_prices, duration, features, badge, style, sort_order)
values
  ('basic', 'Basic Wash', 'A spotless everyday clean.', 250, 'wash',
   '{"hatch":250,"sedan":280,"suv":320,"luxury":350,"minibus":300}'::jsonb, '45 – 60 minutes',
   array['Exterior foam wash & hand dry', 'Interior vacuum cleaning', 'Dashboard wipe-down', 'Tire shine', 'Window cleaning'], '', 'standard', 1),
  ('premium', 'Premium Detail', 'A complete refresh inside and out.', 550, 'session',
   '{"hatch":500,"sedan":550,"suv":650,"luxury":750,"minibus":600}'::jsonb, '90 – 120 minutes',
   array['Full exterior detail', 'Hand polish', 'Wax protection', 'Deep interior wipe', 'Rim detailing', 'Tire treatment', 'Streak-free window polish'], 'Most Popular', 'featured', 2),
  ('executive', 'Executive Ceramic', 'Our ultimate protection and detailing service.', 1200, 'session',
   '{"hatch":1100,"sedan":1200,"suv":1400,"luxury":1600,"minibus":1300}'::jsonb, '3 – 4 hours',
   array['Premium ceramic coating', 'Full interior detailing', 'Leather treatment', 'Engine bay wipe', 'Premium wax finish', 'Seat deep clean', 'Odor treatment', 'Full exterior polish', 'Detailed rim cleaning'], 'Top Tier', 'executive', 3)
on conflict (slug) do nothing;

insert into public.membership_plans
  (name, price, billing_interval, benefits, discount_percent, badge, sort_order)
select 'Silver', 699, 'month',
       array['2x Basic Washes', 'Priority Booking', '10% off add-ons'], 10, 'SILVER', 1
where not exists (select 1 from public.membership_plans where name = 'Silver');

insert into public.membership_plans
  (name, price, billing_interval, benefits, discount_percent, badge, sort_order)
select 'Gold', 1199, 'month',
       array['2x Premium Details', 'Priority Booking', '15% off add-ons', 'Free Odor Treatment'], 15, 'GOLD', 2
where not exists (select 1 from public.membership_plans where name = 'Gold');
