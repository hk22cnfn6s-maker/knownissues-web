-- ============================================================
-- 003_resources.sql
-- ============================================================

-- ------------------------------------------------------------
-- TABLES
-- ------------------------------------------------------------

create table public.resource_sections (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  description   text,
  display_order integer default 0,
  created_at    timestamptz default now()
);

create table public.resource_items (
  id            uuid primary key default gen_random_uuid(),
  section_id    uuid references public.resource_sections(id) on delete cascade,
  name          text not null,
  description   text,
  url           text not null,
  badge         text,
  tag           text,
  display_order integer default 0,
  is_active     boolean default true,
  created_at    timestamptz default now()
);

-- ------------------------------------------------------------
-- GRANTS
-- ------------------------------------------------------------

grant select on public.resource_sections to anon, authenticated;
grant select on public.resource_items    to anon, authenticated;
grant all    on public.resource_sections to service_role;
grant all    on public.resource_items    to service_role;

-- ------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ------------------------------------------------------------

alter table public.resource_sections enable row level security;
alter table public.resource_items    enable row level security;

create policy "Resource sections viewable by everyone"
  on public.resource_sections for select
  using (true);

create policy "Resource items viewable by everyone"
  on public.resource_items for select
  using (is_active = true);

-- writes go through the service-role client from admin API routes only
-- (RLS is enabled and there are no insert/update/delete policies for anon/authenticated)

-- ------------------------------------------------------------
-- SEED DATA
-- ------------------------------------------------------------

insert into public.resource_sections (title, description, display_order) values
  ('Diagnostic Tools', 'Tools the author uses and recommends for diagnosing and maintaining your car.', 1),
  ('Pre-Purchase Inspections', 'Independent inspection services to check a car before you buy.', 2),
  ('Specialist Insurance', 'Insurance providers for performance, classic, and specialist vehicles.', 3),
  ('Warranty Providers', 'Extended warranty options for used car buyers.', 4);

insert into public.resource_items
  (section_id, name, description, url, badge, tag, display_order)
values (
  (select id from public.resource_sections where title = 'Diagnostic Tools'),
  'Autel MaxiAP AP200',
  'The author''s go-to diagnostic tool. Covers 19 service functions including oil reset, EPB, TPMS, BMS, brake bleed, DPF, IMMO, suspension, transmission adaptation and more. One manufacturer included free, additional manufacturers available annually. Outstanding value.',
  'https://amzn.to/4ykLE1o',
  'Recommended',
  'Amazon',
  1
);
