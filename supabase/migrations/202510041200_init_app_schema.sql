create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

create schema if not exists app;

create table if not exists app.profiles (
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

create table if not exists app.measurements (
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

create table if not exists app.sessions (
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

create table if not exists app.session_pressure_logs (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references app.sessions(id) on delete cascade,
  timestamp timestamptz not null,
  pressure numeric(10,3) not null
);

create table if not exists app.session_tube_intervals (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references app.sessions(id) on delete cascade,
  start_time timestamptz not null,
  end_time timestamptz
);

create table if not exists app.session_breaks (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references app.sessions(id) on delete cascade,
  start_time timestamptz not null,
  end_time timestamptz
);

create table if not exists app.goals (
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

create table if not exists app.preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  theme text check (theme in ('light','dark','system')),
  notifications jsonb,
  privacy jsonb,
  accessibility jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table app.measurements
  drop constraint if exists fk_measurement_session,
  add constraint fk_measurement_session foreign key (session_id) references app.sessions(id) on delete set null;

create or replace function app.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger set_updated_at_profiles before update on app.profiles
for each row execute function app.set_updated_at();

create trigger set_updated_at_measurements before update on app.measurements
for each row execute function app.set_updated_at();

create trigger set_updated_at_sessions before update on app.sessions
for each row execute function app.set_updated_at();

create trigger set_updated_at_goals before update on app.goals
for each row execute function app.set_updated_at();

create trigger set_updated_at_preferences before update on app.preferences
for each row execute function app.set_updated_at();

alter table app.profiles enable row level security;
alter table app.measurements enable row level security;
alter table app.sessions enable row level security;
alter table app.session_pressure_logs enable row level security;
alter table app.session_tube_intervals enable row level security;
alter table app.session_breaks enable row level security;
alter table app.goals enable row level security;
alter table app.preferences enable row level security;

create policy if not exists "profiles_select_own" on app.profiles
for select using (auth.uid() = id);
create policy if not exists "profiles_modify_own" on app.profiles
for all using (auth.uid() = id) with check (auth.uid() = id);

create policy if not exists "measurements_select_own" on app.measurements
for select using (auth.uid() = user_id);
create policy if not exists "measurements_modify_own" on app.measurements
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy if not exists "sessions_select_own" on app.sessions
for select using (auth.uid() = user_id);
create policy if not exists "sessions_modify_own" on app.sessions
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy if not exists "pressure_logs_own" on app.session_pressure_logs
for all using (
  exists (select 1 from app.sessions s where s.id = session_id and s.user_id = auth.uid())
)
with check (
  exists (select 1 from app.sessions s where s.id = session_id and s.user_id = auth.uid())
);

create policy if not exists "tube_intervals_own" on app.session_tube_intervals
for all using (
  exists (select 1 from app.sessions s where s.id = session_id and s.user_id = auth.uid())
)
with check (
  exists (select 1 from app.sessions s where s.id = session_id and s.user_id = auth.uid())
);

create policy if not exists "breaks_own" on app.session_breaks
for all using (
  exists (select 1 from app.sessions s where s.id = session_id and s.user_id = auth.uid())
)
with check (
  exists (select 1 from app.sessions s where s.id = session_id and s.user_id = auth.uid())
);

create policy if not exists "goals_select_own" on app.goals
for select using (auth.uid() = user_id);
create policy if not exists "goals_modify_own" on app.goals
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy if not exists "preferences_select_own" on app.preferences
for select using (auth.uid() = user_id);
create policy if not exists "preferences_modify_own" on app.preferences
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists idx_measurements_user_date on app.measurements(user_id, date);
create index if not exists idx_sessions_user_date on app.sessions(user_id, date);
create index if not exists idx_goals_user on app.goals(user_id);

create or replace view app.latest_measurement as
select distinct on (user_id)
  user_id, id as measurement_id, date, length, girth, notes, created_at
from app.measurements
order by user_id, date desc, created_at desc;
