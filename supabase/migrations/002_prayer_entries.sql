-- Phase 2: prayer journal entries, versions, usage_weekly stub
-- Run after 001_profiles.sql in Supabase SQL Editor

create type public.prayer_category as enum (
  'gratitude',
  'intercession',
  'petition',
  'confession',
  'praise',
  'uncategorized'
);

create table if not exists public.prayer_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  body_html text not null,
  body_plain text not null,
  category public.prayer_category not null default 'uncategorized',
  category_source text not null default 'user'
    check (category_source in ('ai', 'user')),
  source text not null default 'text'
    check (source in ('text', 'voice')),
  client_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, client_id)
);

create table if not exists public.prayer_entry_versions (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.prayer_entries (id) on delete cascade,
  body_html text not null,
  body_plain text not null,
  category public.prayer_category not null,
  edited_at timestamptz not null default now(),
  edited_by uuid not null references public.profiles (id)
);

-- Free-tier counter stub (enforce only in Phase PAY)
create table if not exists public.usage_weekly (
  user_id uuid not null references public.profiles (id) on delete cascade,
  week_start date not null,
  prayer_entry_count int not null default 0,
  primary key (user_id, week_start)
);

create index if not exists prayer_entries_user_created_idx
  on public.prayer_entries (user_id, created_at desc);

create index if not exists prayer_entry_versions_entry_idx
  on public.prayer_entry_versions (entry_id, edited_at desc);

alter table public.prayer_entries enable row level security;
alter table public.prayer_entry_versions enable row level security;
alter table public.usage_weekly enable row level security;

create policy "Users manage own prayer entries"
  on public.prayer_entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own entry versions"
  on public.prayer_entry_versions for all
  using (auth.uid() = edited_by)
  with check (auth.uid() = edited_by);

create policy "Users manage own usage weekly"
  on public.usage_weekly for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop trigger if exists prayer_entries_set_updated_at on public.prayer_entries;

create trigger prayer_entries_set_updated_at
  before update on public.prayer_entries
  for each row execute function public.set_updated_at();
