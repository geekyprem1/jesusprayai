-- Security hardening (post-audit)
-- Run after 001–004 in Supabase SQL Editor

-- 1) Protect billing fields from client (anon/authenticated) updates
create or replace function public.protect_profile_billing()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' then
    if new.plan_tier is distinct from old.plan_tier
       or new.lemonsqueezy_customer_id is distinct from old.lemonsqueezy_customer_id then
      -- service_role bypasses RLS; auth.jwt() role is 'authenticated' for users
      if coalesce(auth.role(), '') <> 'service_role' then
        raise exception 'Cannot modify billing fields';
      end if;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_billing on public.profiles;
create trigger profiles_protect_billing
  before update on public.profiles
  for each row execute function public.protect_profile_billing();

-- 2) prayer_entry_versions: must own the parent entry
drop policy if exists "Users manage own entry versions" on public.prayer_entry_versions;

create policy "Users manage own entry versions"
  on public.prayer_entry_versions for all
  using (
    auth.uid() = edited_by
    and exists (
      select 1 from public.prayer_entries e
      where e.id = entry_id and e.user_id = auth.uid()
    )
  )
  with check (
    auth.uid() = edited_by
    and exists (
      select 1 from public.prayer_entries e
      where e.id = entry_id and e.user_id = auth.uid()
    )
  );

-- 3) verse_cache: authenticated read only; no client writes (poisoning)
drop policy if exists "Authenticated write verse cache" on public.verse_cache;
drop policy if exists "Authenticated update verse cache" on public.verse_cache;
drop policy if exists "Authenticated read verse cache" on public.verse_cache;

create policy "Authenticated read verse cache"
  on public.verse_cache for select
  to authenticated
  using (true);

-- Writes only via service role (bypasses RLS) if you add server cache later.
-- User-path upserts will fail softly — cache is optional.

-- 4) Daily AI / Whisper usage counters (quota enforcement)
create table if not exists public.ai_usage_daily (
  user_id uuid not null references public.profiles (id) on delete cascade,
  day date not null,
  ai_count int not null default 0 check (ai_count >= 0),
  whisper_count int not null default 0 check (whisper_count >= 0),
  primary key (user_id, day)
);

alter table public.ai_usage_daily enable row level security;

drop policy if exists "Users manage own ai usage daily" on public.ai_usage_daily;

create policy "Users manage own ai usage daily"
  on public.ai_usage_daily for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists ai_usage_daily_day_idx
  on public.ai_usage_daily (day);
