-- Phase 3: AI verses, cache, prayer requests, daily devotionals
-- Run after 001 + 002 in Supabase SQL Editor

-- Linked AI verse suggestions
create table if not exists public.prayer_entry_verses (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.prayer_entries (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  reference text not null,
  translation text not null,
  verse_text text not null,
  relevance_score numeric(3, 2),
  reason text,
  saved boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists prayer_entry_verses_entry_idx
  on public.prayer_entry_verses (entry_id, created_at desc);

-- AI verse response cache (cost control)
create table if not exists public.verse_cache (
  cache_key text primary key,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists verse_cache_expires_idx
  on public.verse_cache (expires_at);

-- Prayer request tracker
create type public.request_status as enum ('pending', 'ongoing', 'answered');
create type public.request_category as enum (
  'health',
  'family',
  'finances',
  'work',
  'spiritual',
  'community',
  'other'
);

create table if not exists public.prayer_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text,
  category public.request_category not null default 'other',
  status public.request_status not null default 'pending',
  answered_at timestamptz,
  reflection_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.prayer_request_events (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.prayer_requests (id) on delete cascade,
  from_status public.request_status,
  to_status public.request_status not null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists prayer_requests_user_status_idx
  on public.prayer_requests (user_id, status, updated_at desc);

-- Daily devotionals (curated / seeded)
create table if not exists public.daily_devotionals (
  id uuid primary key default gen_random_uuid(),
  publish_date date not null unique,
  verse_reference text not null,
  verse_text text not null,
  translation text not null default 'KJV',
  reflection text not null,
  created_at timestamptz not null default now()
);

alter table public.prayer_entry_verses enable row level security;
alter table public.verse_cache enable row level security;
alter table public.prayer_requests enable row level security;
alter table public.prayer_request_events enable row level security;
alter table public.daily_devotionals enable row level security;

create policy "Users manage own entry verses"
  on public.prayer_entry_verses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Cache readable by authenticated users; writes via user client OK for MVP
create policy "Authenticated read verse cache"
  on public.verse_cache for select
  to authenticated
  using (true);

create policy "Authenticated write verse cache"
  on public.verse_cache for insert
  to authenticated
  with check (true);

create policy "Authenticated update verse cache"
  on public.verse_cache for update
  to authenticated
  using (true)
  with check (true);

create policy "Users manage own prayer requests"
  on public.prayer_requests for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage events for own requests"
  on public.prayer_request_events for all
  using (
    exists (
      select 1 from public.prayer_requests r
      where r.id = request_id and r.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.prayer_requests r
      where r.id = request_id and r.user_id = auth.uid()
    )
  );

create policy "Anyone authenticated can read devotionals"
  on public.daily_devotionals for select
  to authenticated
  using (true);

-- Allow anon read for devotional if needed on home after login only is fine
create policy "Public read devotionals"
  on public.daily_devotionals for select
  to anon
  using (true);

drop trigger if exists prayer_requests_set_updated_at on public.prayer_requests;
create trigger prayer_requests_set_updated_at
  before update on public.prayer_requests
  for each row execute function public.set_updated_at();

-- Seed a few devotionals (today ± a few days, UTC)
insert into public.daily_devotionals (publish_date, verse_reference, verse_text, translation, reflection)
values
  (
    (current_date at time zone 'utc')::date,
    'Philippians 4:6-7',
    'Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God. And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.',
    'KJV',
    'Bring every care to God today. Thanksgiving turns anxiety into trust, and His peace guards what you cannot control.'
  ),
  (
    ((current_date at time zone 'utc')::date - 1),
    'Psalm 46:10',
    'Be still, and know that I am God: I will be exalted among the heathen, I will be exalted in the earth.',
    'KJV',
    'Stillness is not empty—it is space to remember who holds your life. Rest in His strength today.'
  ),
  (
    ((current_date at time zone 'utc')::date + 1),
    'Lamentations 3:22-23',
    'It is of the Lord''s mercies that we are not consumed, because his compassions fail not. They are new every morning: great is thy faithfulness.',
    'KJV',
    'Morning mercies mean yesterday''s failures do not define today. Start again under His faithfulness.'
  ),
  (
    ((current_date at time zone 'utc')::date + 2),
    'Romans 8:28',
    'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.',
    'KJV',
    'Not all things are good, but God weaves them for good for those who love Him. Trust His purpose when the pattern is unclear.'
  ),
  (
    ((current_date at time zone 'utc')::date + 3),
    'Matthew 11:28',
    'Come unto me, all ye that labour and are heavy laden, and I will give you rest.',
    'KJV',
    'Jesus invites the weary—not the already-strong. Bring your load and receive His rest.'
  )
on conflict (publish_date) do nothing;
