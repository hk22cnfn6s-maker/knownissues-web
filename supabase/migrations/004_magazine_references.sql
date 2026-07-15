-- ============================================================
-- 004_magazine_references.sql
-- ============================================================

-- ------------------------------------------------------------
-- TABLES
-- ------------------------------------------------------------

create table public.magazine_references (
  id             uuid primary key default gen_random_uuid(),
  magazine       text not null,
  issue_number   text,
  issue_date     text,
  article_title  text,
  url            text,
  notes          text,
  reference_type text default 'print',
  display_order  integer default 0,
  is_active      boolean default true,
  created_at     timestamptz default now()
);

create table public.magazine_reference_guides (
  id           uuid primary key default gen_random_uuid(),
  reference_id uuid references public.magazine_references(id) on delete cascade,
  guide_id     uuid references public.guides(id) on delete cascade
);

-- ------------------------------------------------------------
-- GRANTS
-- ------------------------------------------------------------

grant select on public.magazine_references      to anon, authenticated;
grant select on public.magazine_reference_guides to anon, authenticated;
grant all    on public.magazine_references      to service_role;
grant all    on public.magazine_reference_guides to service_role;

-- ------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ------------------------------------------------------------

alter table public.magazine_references      enable row level security;
alter table public.magazine_reference_guides enable row level security;

create policy "Magazine references viewable by everyone"
  on public.magazine_references for select
  using (is_active = true);

create policy "Magazine reference guides viewable by everyone"
  on public.magazine_reference_guides for select
  using (true);

-- writes go through the service-role client from admin API routes only
-- (RLS is enabled and there are no insert/update/delete policies for anon/authenticated)
