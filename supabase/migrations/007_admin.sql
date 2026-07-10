-- Admin dashboard: roles, ban status, protect privileged profile fields
-- Run in Supabase SQL Editor after 001–006

-- 1) Role + account status on profiles
alter table public.profiles
  add column if not exists role text not null default 'user';

alter table public.profiles
  add column if not exists account_status text not null default 'active';

alter table public.profiles
  add column if not exists banned_at timestamptz;

alter table public.profiles
  add column if not exists ban_reason text;

alter table public.profiles
  add column if not exists admin_notes text;

-- Constraints (safe if re-run)
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_role_check'
  ) then
    alter table public.profiles
      add constraint profiles_role_check
      check (role in ('user', 'admin'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_account_status_check'
  ) then
    alter table public.profiles
      add constraint profiles_account_status_check
      check (account_status in ('active', 'banned'));
  end if;
end $$;

-- 2) Block *client* JWT roles from changing role / ban / plan.
-- Allow: service_role (API), SQL Editor / postgres (auth.role empty), migrations.
create or replace function public.protect_profile_privileged()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  jwt_role text := coalesce(auth.role(), '');
begin
  if tg_op = 'UPDATE' then
    if new.role is distinct from old.role
       or new.account_status is distinct from old.account_status
       or new.banned_at is distinct from old.banned_at
       or new.ban_reason is distinct from old.ban_reason
       or new.admin_notes is distinct from old.admin_notes
       or new.plan_tier is distinct from old.plan_tier
       or new.lemonsqueezy_customer_id is distinct from old.lemonsqueezy_customer_id
    then
      -- Only block browser/client sessions (authenticated + anon).
      -- service_role, postgres SQL Editor, and empty JWT are allowed.
      if jwt_role in ('authenticated', 'anon') then
        raise exception 'Cannot modify privileged profile fields';
      end if;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_privileged on public.profiles;
create trigger profiles_protect_privileged
  before update on public.profiles
  for each row execute function public.protect_profile_privileged();

-- Keep old billing trigger if present (redundant but harmless)
-- 3) Lightweight admin audit log
create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references public.profiles (id) on delete set null,
  target_user_id uuid references public.profiles (id) on delete set null,
  action text not null,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_log_created_at_idx
  on public.admin_audit_log (created_at desc);

alter table public.admin_audit_log enable row level security;

-- No client policies — service_role only (bypasses RLS)
drop policy if exists "No client access audit" on public.admin_audit_log;
