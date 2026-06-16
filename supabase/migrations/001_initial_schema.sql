-- ============================================================
-- 001_initial_schema.sql
-- ============================================================

-- ------------------------------------------------------------
-- TABLES
-- ------------------------------------------------------------

create table public.users_profile (
  id         uuid references auth.users on delete cascade primary key,
  email      text not null,
  created_at timestamptz default now(),
  is_verified boolean default false
);

create table public.guides (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  slug         text unique not null,
  description  text,
  filename     text not null,
  is_published boolean default false,
  created_at   timestamptz default now()
);

create table public.downloads (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references public.users_profile(id) on delete set null,
  guide_id      uuid references public.guides(id) on delete set null,
  downloaded_at timestamptz default now(),
  ip_address    text
);

create table public.verification_tokens (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.users_profile(id) on delete cascade,
  token      text unique not null,
  expires_at timestamptz not null,
  used       boolean default false
);

-- ------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ------------------------------------------------------------

alter table public.users_profile       enable row level security;
alter table public.guides              enable row level security;
alter table public.downloads           enable row level security;
alter table public.verification_tokens enable row level security;

-- users_profile: users can read and update only their own row
create policy "users_profile: own read"
  on public.users_profile for select
  using (auth.uid() = id);

create policy "users_profile: own update"
  on public.users_profile for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- guides: readable only by authenticated users whose profile is verified
create policy "guides: verified read"
  on public.guides for select
  using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.users_profile
      where id = auth.uid()
      and is_verified = true
    )
  );

-- downloads: users can read only their own rows
create policy "downloads: own read"
  on public.downloads for select
  using (auth.uid() = user_id);

-- verification_tokens: no policy = accessible by service role only
-- (RLS is enabled and there are no permissive policies for anon/authenticated)

-- ------------------------------------------------------------
-- AUTO-CREATE users_profile ON SIGN-UP
-- (fires after a new auth.users row is inserted)
-- ------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users_profile (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ------------------------------------------------------------
-- SEED DATA
-- ------------------------------------------------------------

insert into public.guides (title, slug, description, filename, is_published)
values (
  'Range Rover L322 (2002-2012) Buyers Guide',
  'range-rover-l322',
  'The definitive guide to buying a used third-generation Range Rover',
  'l322-buyers-guide.pdf',
  true
);
