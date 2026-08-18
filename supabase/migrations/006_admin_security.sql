-- ============================================================
-- 006_admin_security.sql
-- Admin TOTP 2FA + rate limiting + RLS audit fix
-- ============================================================

-- ------------------------------------------------------------
-- TOTP fields on the admin's users_profile row
-- ------------------------------------------------------------

alter table public.users_profile
  add column totp_secret      text,
  add column totp_enabled     boolean default false,
  add column totp_verified_at timestamptz;

-- ------------------------------------------------------------
-- Recovery codes — one-time use, shown once at enrolment
-- ------------------------------------------------------------

create table public.admin_recovery_codes (
  id         uuid primary key default gen_random_uuid(),
  code_hash  text not null,
  used       boolean default false,
  used_at    timestamptz,
  created_at timestamptz default now()
);

alter table public.admin_recovery_codes enable row level security;
-- No policies — service role only, same pattern as verification_tokens.

-- ------------------------------------------------------------
-- Rate limiting for auth routes (login, register, forgot-password,
-- verify-2fa). One row per attempt; "is this IP/route over the limit"
-- is a rolling-window COUNT(*) rather than an incremented counter —
-- avoids needing a Postgres function for an atomic increment, since a
-- plain INSERT has no race condition to begin with. attempt_count is
-- kept at 1 per row for schema clarity / future use.
-- ------------------------------------------------------------

create table public.auth_rate_limits (
  id            uuid primary key default gen_random_uuid(),
  ip_address    text not null,
  route         text not null,
  attempt_count integer default 1,
  window_start  timestamptz default now()
);

create index auth_rate_limits_ip_route_window_idx
  on public.auth_rate_limits (ip_address, route, window_start);

alter table public.auth_rate_limits enable row level security;
-- No policies — service role only.

-- ------------------------------------------------------------
-- RLS audit fix: manufacturers was granted select but never had
-- row level security enabled (missed in 002_manufacturers.sql).
-- ------------------------------------------------------------

alter table public.manufacturers enable row level security;

create policy "Manufacturers viewable by everyone"
  on public.manufacturers for select
  using (true);
