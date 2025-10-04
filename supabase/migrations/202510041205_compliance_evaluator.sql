-- Lightweight content compliance signaler in Postgres
-- Returns a small JSON payload with flags; can be expanded later
create schema if not exists app;

create or replace function app.compliance_evaluator(text)
returns jsonb
language plpgsql
as $$
declare
  input alias for $1;
  lowered text := lower(coalesce(input, ''));
  refused boolean := false;
  categories text[] := array[]::text[];
begin
  if lowered ~ '(penis|enlarg|jelq|pump|tube|clamp|suction|pressure|routine|time in tube|sex technique|seduct)' then
    refused := true;
    categories := array_append(categories, 'sexual instruction');
  end if;
  return jsonb_build_object(
    'refused', refused,
    'categories', categories
  );
end;
$$;

-- Example trigger to auto-evaluate notes on insert/update and store flags
alter table app.measurements add column if not exists compliance jsonb;

create or replace function app.set_measurement_compliance()
returns trigger language plpgsql as $$
begin
  if new.notes is not null then
    new.compliance := app.compliance_evaluator(new.notes);
  else
    new.compliance := jsonb_build_object('refused', false, 'categories', '[]'::jsonb);
  end if;
  return new;
end; $$;

-- Attach BEFORE triggers so updated row persists flags
create or replace trigger trg_measurements_compliance_ins
before insert on app.measurements
for each row execute function app.set_measurement_compliance();

create or replace trigger trg_measurements_compliance_upd
before update of notes on app.measurements
for each row execute function app.set_measurement_compliance();

-- Public wrapper to expose RPC via PostgREST (Supabase exposes public schema)
create or replace function public.compliance_evaluator(input text)
returns jsonb
language sql
stable
as $$
  select app.compliance_evaluator(input);
$$;

-- Grant execute so RPC calls work via anon/authenticated as needed
grant execute on function public.compliance_evaluator(text) to anon, authenticated, service_role;
