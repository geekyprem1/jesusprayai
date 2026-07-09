-- Phase 4: reminders + push subscriptions
-- Run after 001–003 in Supabase SQL Editor

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('daily_prayer', 'request_followup')),
  request_id uuid references public.prayer_requests (id) on delete cascade,
  next_run_at timestamptz not null,
  channel text not null default 'email'
    check (channel in ('push', 'email', 'both')),
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists reminders_next_run_idx
  on public.reminders (enabled, next_run_at)
  where enabled = true;

alter table public.reminders enable row level security;
alter table public.push_subscriptions enable row level security;

create policy "Users manage own reminders"
  on public.reminders for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own push subscriptions"
  on public.push_subscriptions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Profile reminder preferences (columns may already exist from 001)
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles'
      and column_name = 'daily_reminder_time'
  ) then
    alter table public.profiles add column daily_reminder_time time;
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles'
      and column_name = 'timezone'
  ) then
    alter table public.profiles add column timezone text not null default 'UTC';
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles'
      and column_name = 'reminder_channel'
  ) then
    alter table public.profiles
      add column reminder_channel text not null default 'email'
      check (reminder_channel in ('push', 'email', 'both', 'none'));
  end if;
end $$;
