create schema if not exists app;

-- Roles table
create table if not exists app.roles (
  name text primary key,
  description text,
  created_at timestamptz not null default now()
);

-- User roles mapping (one-to-many)
create table if not exists app.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null references app.roles(name) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

alter table app.roles enable row level security;
alter table app.user_roles enable row level security;

-- RLS: users can view their own roles; super_admin can view all
create policy if not exists user_roles_select_own on app.user_roles for select using (
  auth.uid() = user_id OR
  exists(
    select 1 from app.user_roles ur
    where ur.user_id = auth.uid() and ur.role = 'super_admin'
  )
);

-- Helper function to create role if not exists (used by seed)
create or replace function public.create_role_if_not_exists(r_name text, r_desc text default '')
returns void language plpgsql security definer as $$
begin
  insert into app.roles(name, description) values (r_name, r_desc)
  on conflict (name) do nothing;
end;$$;

grant execute on function public.create_role_if_not_exists(text, text) to anon, authenticated, service_role;
