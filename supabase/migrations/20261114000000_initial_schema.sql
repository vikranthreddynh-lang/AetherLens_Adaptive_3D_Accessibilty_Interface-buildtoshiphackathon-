-- SenseWeave Production Database Migration
-- Version: 20261114000000_initial_schema.sql
-- Enables UUID generation and cryptographic functions
create extension if not exists pgcrypto;

-- Enums
do $$ begin
  create type public.environment_type as enum (
    'networking',
    'group_discussion',
    'classroom',
    'public_transit',
    'general_public_space',
    'custom'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.event_certainty as enum (
    'clear',
    'uncertain',
    'insufficient'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.event_priority as enum (
    'low',
    'normal',
    'high'
  );
exception
  when duplicate_object then null;
end $$;

-- 1. Profiles Table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  preferred_language text not null default 'en',
  accessibility_preferences jsonb not null default
    '{
      "outputs": {
        "audio": true,
        "haptics": false,
        "accessibleText": true,
        "brailleCompatible": true,
        "visualTimeline": false,
        "spatialAudio": false
      },
      "detailLevel": "balanced",
      "quietMode": false,
      "speechRate": 1.0,
      "hapticVocabulary": "standard"
    }'::jsonb,
  preferences_saved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint profiles_language_length check (
    char_length(preferred_language) between 2 and 35
  ),
  constraint profiles_preferences_object check (
    jsonb_typeof(accessibility_preferences) = 'object'
  )
);

-- 2. Saved Sessions Table
create table if not exists public.saved_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  environment_type public.environment_type not null,
  summary text not null,
  started_at timestamptz,
  ended_at timestamptz not null,
  saved_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint saved_sessions_title_length check (
    char_length(title) between 1 and 180
  ),
  constraint saved_sessions_summary_length check (
    char_length(summary) between 1 and 12000
  ),
  constraint saved_sessions_time_order check (
    started_at is null or started_at <= ended_at
  )
);

-- 3. Saved Events Table
create table if not exists public.saved_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.saved_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  description text not null,
  observable_evidence text,
  source_modalities jsonb not null default '[]'::jsonb,
  relative_position jsonb not null default '{"horizontal":"unknown","vertical":"unknown","basis":"unknown"}'::jsonb,
  certainty public.event_certainty not null default 'uncertain',
  priority public.event_priority not null default 'normal',
  observed_at timestamptz not null,
  created_at timestamptz not null default now(),

  constraint saved_events_description_length check (
    char_length(description) between 1 and 2000
  ),
  constraint saved_events_evidence_length check (
    observable_evidence is null or char_length(observable_evidence) <= 1000
  ),
  constraint saved_events_modalities_array check (
    jsonb_typeof(source_modalities) = 'array'
  ),
  constraint saved_events_position_object check (
    jsonb_typeof(relative_position) = 'object'
  )
);

-- Indexes
create index if not exists saved_sessions_user_created_idx
  on public.saved_sessions (user_id, saved_at desc);

create index if not exists saved_sessions_user_environment_idx
  on public.saved_sessions (user_id, environment_type);

create index if not exists saved_events_session_time_idx
  on public.saved_events (session_id, observed_at asc);

create index if not exists saved_events_user_time_idx
  on public.saved_events (user_id, observed_at desc);

-- Triggers for Updated At
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists saved_sessions_set_updated_at on public.saved_sessions;
create trigger saved_sessions_set_updated_at
before update on public.saved_sessions
for each row execute function public.set_updated_at();

-- User Signup Profile Hook
create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.create_profile_for_new_user();

-- Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.saved_sessions enable row level security;
alter table public.saved_events enable row level security;

-- Profiles RLS Policies
drop policy if exists "Users can read their own profiles" on public.profiles;
create policy "Users can read their own profiles"
on public.profiles for select using (auth.uid() = id);

drop policy if exists "Users can update their own profiles" on public.profiles;
create policy "Users can update their own profiles"
on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- Saved Sessions RLS Policies
drop policy if exists "Users can read their own saved sessions" on public.saved_sessions;
create policy "Users can read their own saved sessions"
on public.saved_sessions for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own saved sessions" on public.saved_sessions;
create policy "Users can insert their own saved sessions"
on public.saved_sessions for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own saved sessions" on public.saved_sessions;
create policy "Users can update their own saved sessions"
on public.saved_sessions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own saved sessions" on public.saved_sessions;
create policy "Users can delete their own saved sessions"
on public.saved_sessions for delete using (auth.uid() = user_id);

-- Saved Events RLS Policies
drop policy if exists "Users can read their own saved events" on public.saved_events;
create policy "Users can read their own saved events"
on public.saved_events for select using (
  auth.uid() = user_id
  and exists (
    select 1
    from public.saved_sessions s
    where s.id = session_id
      and s.user_id = auth.uid()
  )
);

drop policy if exists "Users can insert their own saved events" on public.saved_events;
create policy "Users can insert their own saved events"
on public.saved_events for insert with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.saved_sessions s
    where s.id = session_id
      and s.user_id = auth.uid()
  )
);

drop policy if exists "Users can delete their own saved events" on public.saved_events;
create policy "Users can delete their own saved events"
on public.saved_events for delete using (
  auth.uid() = user_id
  and exists (
    select 1
    from public.saved_sessions s
    where s.id = session_id
      and s.user_id = auth.uid()
  )
);
