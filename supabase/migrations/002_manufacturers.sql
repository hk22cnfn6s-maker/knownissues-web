-- ============================================================
-- 002_manufacturers.sql
-- ============================================================

create table public.manufacturers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  logo_filename text not null,
  display_order integer default 0,
  created_at timestamp with time zone default now()
);

alter table public.guides add column manufacturer_id uuid references public.manufacturers(id);

grant select on public.manufacturers to authenticated, anon;

insert into public.manufacturers (name, slug, logo_filename, display_order) values
  ('Land Rover', 'land-rover', 'land-rover.svg', 1),
  ('BMW', 'bmw', 'bmw.svg', 2),
  ('Vauxhall', 'vauxhall', 'vauxhall.svg', 3),
  ('Jaguar', 'jaguar', 'jaguar.svg', 4);

update public.guides set manufacturer_id = (
  select id from public.manufacturers where slug = 'land-rover'
) where slug = 'range-rover-l322';
