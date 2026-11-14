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

create table if not exists public.site_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug in ('car-wash', 'home-cleaning', 'gardening')),
  hero_title text not null,
  hero_subtitle text not null default '',
  intro text not null default '',
  hero_image_url text not null default '',
  section_title text not null default 'Our services',
  services jsonb not null default '[]'::jsonb check (jsonb_typeof(services) = 'array'),
  callout_title text not null default '',
  callout_text text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.site_pages
  add column if not exists sort_order integer not null default 0;

alter table public.packages enable row level security;
alter table public.membership_plans enable row level security;
alter table public.members enable row level security;
alter table public.work_gallery enable row level security;
alter table public.site_pages enable row level security;

grant select on public.packages, public.membership_plans, public.work_gallery to anon, authenticated;
grant select, insert, update, delete on public.packages, public.membership_plans, public.members, public.work_gallery to authenticated;
grant select on public.site_pages to anon, authenticated;
grant insert, update, delete on public.site_pages to authenticated;

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

drop policy if exists "Public can read website pages" on public.site_pages;
create policy "Public can read website pages"
  on public.site_pages for select to anon, authenticated using (true);
drop policy if exists "Admins manage website pages" on public.site_pages;
create policy "Admins manage website pages"
  on public.site_pages for all to authenticated
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

insert into public.site_pages
  (slug, hero_title, hero_subtitle, intro, hero_image_url, section_title, services, callout_title, callout_text, sort_order)
values
  ('car-wash', 'Mobile Car Wash & Detailing', 'Professional mobile car care across Johannesburg.', 'Choose from regular hand washing, complete valets, deep interior cleaning, exterior paint care, and detailed vehicle treatments. We come to your home or workplace, so your car gets careful attention without the queues.', 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=1600&q=80', 'Car-wash services', '[{"title":"Exterior Car Wash","description":"A careful exterior clean for everyday upkeep, finished by hand at your home or workplace.","price_label":"Ask us for a quote","image_url":"https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=960&q=80","features":["Pre-rinse and foam wash","Hand wash and dry","Glass and tyre finish"]},{"title":"Full Valet","description":"A thorough inside-and-out refresh for vehicles that need more than a quick wash.","price_label":"Ask us for a quote","image_url":"https://images.unsplash.com/photo-1605164599901-6f9c2c45c0c6?auto=format&fit=crop&w=960&q=80","features":["Exterior wash and hand dry","Cabin vacuum and surface clean","Finishing touches for wheels and glass"]},{"title":"Interior Deep Clean","description":"Focused interior care for seats, carpets, mats, and high-touch cabin surfaces.","price_label":"Ask us for a quote","image_url":"https://images.unsplash.com/photo-1600320254374-ce2d293c324e?auto=format&fit=crop&w=960&q=80","features":["Detailed vacuuming","Targeted upholstery and carpet care","Careful wipe-down of cabin surfaces"]},{"title":"Exterior Paint Care","description":"Exterior treatments to improve the finish and help protect paintwork from everyday wear.","price_label":"Ask us for a quote","image_url":"https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&w=960&q=80","features":["Paint-safe hand wash","Polishing options by vehicle condition","Tyre and trim finishing"]},{"title":"Vehicle Detailing","description":"A tailored detail for owners who want a more comprehensive clean and finish.","price_label":"Ask us for a quote","image_url":"https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=960&q=80","features":["Interior and exterior assessment","Detailing options matched to your vehicle","Confirm the scope before work begins"]}]'::jsonb, 'We bring the clean to you', 'Tell us your vehicle make and model, choose a package, and request a convenient time. We will confirm the final scope and price with you.', 1),
  ('home-cleaning', 'Home Cleaning Services', 'A cleaner, more comfortable home without giving up your day.', 'From regular upkeep to focused deep cleans, choose the home-cleaning help that fits your space. Share the size of your home and what needs attention so we can confirm the right service and quote.', 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1600&q=80', 'Home-cleaning services', '[{"title":"Regular Home Cleaning","description":"A dependable clean to keep everyday living spaces fresh, tidy, and comfortable.","price_label":"Request a quote","image_url":"https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=960&q=80","features":["Kitchen and bathroom surfaces","Dusting and general wipe-down","Floors vacuumed or mopped"]},{"title":"Deep Cleaning","description":"A more detailed clean for rooms and surfaces that need extra time and attention.","price_label":"Request a quote","image_url":"https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=960&q=80","features":["Detailed attention to built-up dirt","Extra focus on kitchens and bathrooms","Scope agreed before the visit"]},{"title":"Move-in / Move-out Cleaning","description":"A thorough clean to help prepare a property before moving in or after moving out.","price_label":"Request a quote","image_url":"https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=960&q=80","features":["Room-by-room clean","Cabinet and cupboard interiors by request","Flexible checklist for your handover"]},{"title":"Upholstery and Mattress Care","description":"Focused cleaning for soft furnishings that benefit from specialist attention.","price_label":"Request a quote","image_url":"https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=960&q=80","features":["Sofas and selected upholstery","Mattresses and fabric surfaces","Treatment confirmed for each material"]}]'::jsonb, 'A clean home, made simple', 'Tell us about your rooms, preferred date, and any priority areas. We will confirm availability and a tailored quote.', 2),
  ('gardening', 'Garden Care & Maintenance', 'Practical garden care to keep your outdoor space looking its best.', 'Book help with routine upkeep or a one-off tidy-up. Tell us about your garden, access, and the work you have in mind so the team can plan the right visit.', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1600&q=80', 'Gardening services', '[{"title":"Garden Maintenance","description":"Regular care to keep beds, paths, and outdoor areas neat and manageable.","price_label":"Request a quote","image_url":"https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=960&q=80","features":["Weeding and general garden tidy","Light pruning where suitable","Visit frequency planned with you"]},{"title":"Lawn Mowing and Edging","description":"A tidy lawn cut with clean edges to refresh the look of your garden.","price_label":"Request a quote","image_url":"https://images.unsplash.com/photo-1599685315640-7ec1c5537b7f?auto=format&fit=crop&w=960&q=80","features":["Lawn mowing","Edge trimming","Clippings gathered after the cut"]},{"title":"Hedge and Shrub Trimming","description":"Shape and tidy hedges and shrubs to help keep borders neat and clear.","price_label":"Request a quote","image_url":"https://images.unsplash.com/photo-1598902108854-10e335adac99?auto=format&fit=crop&w=960&q=80","features":["Light shaping and trimming","Neat borders and pathways","Green waste handling agreed in advance"]},{"title":"Seasonal Garden Clean-up","description":"A one-off tidy-up to clear garden waste and bring outdoor spaces back into shape.","price_label":"Request a quote","image_url":"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=960&q=80","features":["Leaf and debris clearing","Bed and path tidy-up","Priorities planned around your property"]}]'::jsonb, 'Let us take care of the garden', 'Share a few details about your outdoor space and the work you need. We will get back to you with a plan and quote.', 3)
on conflict (slug) do nothing;
