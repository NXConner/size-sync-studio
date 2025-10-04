-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Users profile table (one row per auth user)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  phone text,
  bio text,
  location text,
  avatar text,
  date_of_birth date,
  gender text,
  occupation text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Measurements
create table if not exists public.measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  length numeric(10,3) not null,
  girth numeric(10,3) not null,
  notes text,
  session_id uuid,
  photo_url text,
  is_pre_session boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Sessions
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  preset_id text not null,
  start_time timestamptz not null,
  end_time timestamptz,
  notes text,
  status text not null check (status in ('active','completed','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Session pressure logs
create table if not exists public.session_pressure_logs (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  timestamp timestamptz not null,
  pressure numeric(10,3) not null
);

-- Session tube intervals
create table if not exists public.session_tube_intervals (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  start_time timestamptz not null,
  end_time timestamptz
);

-- Session breaks
create table if not exists public.session_breaks (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  start_time timestamptz not null,
  end_time timestamptz
);

-- Goals
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('length','girth')),
  target numeric(10,3) not null,
  current numeric(10,3) not null,
  deadline date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- User preferences
create table if not exists public.user_preferences_app (
  user_id uuid primary key references auth.users(id) on delete cascade,
  theme text check (theme in ('light','dark','system')),
  notifications jsonb,
  privacy jsonb,
  accessibility jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Link measurement.session_id to sessions.id
alter table public.measurements 
  add constraint fk_measurement_session 
  foreign key (session_id) 
  references public.sessions(id) 
  on delete set null;

-- Updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Apply triggers
create trigger set_updated_at_profiles
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger set_updated_at_measurements
  before update on public.measurements
  for each row execute function public.handle_updated_at();

create trigger set_updated_at_sessions
  before update on public.sessions
  for each row execute function public.handle_updated_at();

create trigger set_updated_at_goals
  before update on public.goals
  for each row execute function public.handle_updated_at();

create trigger set_updated_at_preferences
  before update on public.user_preferences_app
  for each row execute function public.handle_updated_at();

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.measurements enable row level security;
alter table public.sessions enable row level security;
alter table public.session_pressure_logs enable row level security;
alter table public.session_tube_intervals enable row level security;
alter table public.session_breaks enable row level security;
alter table public.goals enable row level security;
alter table public.user_preferences_app enable row level security;

-- RLS Policies for profiles
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can manage own profile"
  on public.profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- RLS Policies for measurements
create policy "Users can view own measurements"
  on public.measurements for select
  using (auth.uid() = user_id);

create policy "Users can manage own measurements"
  on public.measurements for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- RLS Policies for sessions
create policy "Users can view own sessions"
  on public.sessions for select
  using (auth.uid() = user_id);

create policy "Users can manage own sessions"
  on public.sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- RLS Policies for session child tables
create policy "Users can manage own pressure logs"
  on public.session_pressure_logs for all
  using (
    exists (
      select 1 from public.sessions s 
      where s.id = session_id and s.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.sessions s 
      where s.id = session_id and s.user_id = auth.uid()
    )
  );

create policy "Users can manage own tube intervals"
  on public.session_tube_intervals for all
  using (
    exists (
      select 1 from public.sessions s 
      where s.id = session_id and s.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.sessions s 
      where s.id = session_id and s.user_id = auth.uid()
    )
  );

create policy "Users can manage own breaks"
  on public.session_breaks for all
  using (
    exists (
      select 1 from public.sessions s 
      where s.id = session_id and s.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.sessions s 
      where s.id = session_id and s.user_id = auth.uid()
    )
  );

-- RLS Policies for goals
create policy "Users can view own goals"
  on public.goals for select
  using (auth.uid() = user_id);

create policy "Users can manage own goals"
  on public.goals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- RLS Policies for preferences
create policy "Users can view own preferences"
  on public.user_preferences_app for select
  using (auth.uid() = user_id);

create policy "Users can manage own preferences"
  on public.user_preferences_app for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Create indexes for performance
create index if not exists idx_measurements_user_date 
  on public.measurements(user_id, date);

create index if not exists idx_sessions_user_date 
  on public.sessions(user_id, date);

create index if not exists idx_goals_user 
  on public.goals(user_id);

-- Create storage bucket for measurement photos
insert into storage.buckets (id, name, public)
values ('measurement-photos', 'measurement-photos', false)
on conflict (id) do nothing;

-- Storage RLS policies
create policy "Users can view own photos"
  on storage.objects for select
  using (bucket_id = 'measurement-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can upload own photos"
  on storage.objects for insert
  with check (bucket_id = 'measurement-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can update own photos"
  on storage.objects for update
  using (bucket_id = 'measurement-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete own photos"
  on storage.objects for delete
  using (bucket_id = 'measurement-photos' AND auth.uid()::text = (storage.foldername(name))[1]);