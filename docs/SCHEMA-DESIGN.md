# PumpGuard Data Model & Supabase Schema Plan

## Overview
The PumpGuard Performance Suite uses Supabase (PostgreSQL) as the source of truth with strict Row Level Security (RLS). Local data is cached in Dexie.js and synchronized via Supabase edge functions. This document captures the target relational schema, naming conventions, and policy expectations before implementation.

## Guiding Principles
- **Idempotent migrations**: each migration is forward-only, versioned, and reversible through dedicated rollback scripts.
- **Namespace**: use the `app` schema for domain tables; keep Supabase defaults (`public`) minimal.
- **Row security**: enable RLS on every table and define policies for owners, supporters, and clinicians.
- **Auditability**: all high-risk events log to `app.audit_logs` with immutable records.
- **Soft deletes**: prefer `deleted_at` columns over destructive deletes.
- **Time zones**: store timestamps as `timestamptz` in UTC.

## Table Inventory
| Table | Purpose |
| --- | --- |
| `app.users` | Profile metadata, preferences, and risk posture. Mirrors Supabase auth user id via FK. |
| `app.supporter_access` | RBAC mapping between primary user and partner/coach/clinician accounts. |
| `app.devices` | Registered pump or sensor hardware, firmware history. |
| `app.sessions` | Pump sessions with timing, status, compliance scores, telemetry references. |
| `app.session_pressure_samples` | High-frequency pressure/KPA readings linked to sessions. |
| `app.session_vital_samples` | Biometrics (heart rate, BP, SPO2) captured during sessions. |
| `app.session_breaks` | Rest/cooldown intervals per session. |
| `app.session_tube_intervals` | Vacuum intervals and chamber metrics per session. |
| `app.session_incidents` | Safety incidents triggered during a session. |
| `app.measurements` | Primary growth measurements with calibration metadata. |
| `app.measurement_vitals` | Optional per-measurement vitals. |
| `app.measurement_photos` | Media references (photo + overlay) bound to a measurement. |
| `app.goals` | Goal tracking with milestones and progress. |
| `app.goal_milestones` | Target checkpoints supporting each goal. |
| `app.programs` | Personalized programs (multi-phase). |
| `app.program_phases` | Sub-structures containing objectives per program. |
| `app.program_session_templates` | Prescribed session cadence/ordering for programs. |
| `app.injury_reports` | Injury/side-effect logging and escalation status. |
| `app.clinician_notes` | Professional annotations referencing sessions or injuries. |
| `app.ai_conversations` | Safety coach dialogue transcripts + metadata. |
| `app.audit_logs` | Immutable audit trail of sensitive actions. |
| `app.media_assets` | Shared store for uploaded files (photos, PDFs). |

## Column Highlights
### `app.sessions`
- `id uuid primary key default gen_random_uuid()`
- `user_id uuid references app.users(id)`
- `preset_id uuid references app.session_presets(id)` (new static table or JSONB catalog)
- `start_time timestamptz not null`
- `end_time timestamptz null`
- `status text check (status in ('draft','active','paused','completed','aborted'))`
- `guidance_mode text check (guidance_mode in ('self','partner','clinician','ai'))`
- `hydration_level text check (...)`
- `compliance jsonb`
- `emergency_stop boolean default false`
- `metadata jsonb` for forward compatibility

### `app.measurements`
- `id uuid primary key`
- `user_id uuid references app.users(id)`
- `session_id uuid references app.sessions(id)`
- `recorded_at timestamptz not null`
- `origin text check (origin in ('manual','camera','sensor','import'))`
- `focus text[]`
- `length_mm numeric(6,2)`
- `girth_mm numeric(6,2)`
- `volume_estimate numeric(7,2)`
- `stiffness_score numeric(3,1)`
- `precision text check (precision in ('low','medium','high'))`
- `calibration jsonb`
- `injury_screen jsonb`
- `tags text[]`
- `notes text`
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()`

### `app.goals`
- `id uuid primary key`
- `user_id uuid references app.users(id)`
- `type text check (type in ('length','girth','erectionQuality','sessionStreak','safetyScore','programCompletion'))`
- `unit text`
- `target numeric`
- `baseline numeric`
- `status text`
- `deadline date`
- `created_at timestamptz default now()`

### `app.injury_reports`
- `id uuid primary key`
- `user_id uuid references app.users(id)`
- `session_id uuid references app.sessions(id)`
- `reported_at timestamptz not null`
- `category text`
- `severity text`
- `description text`
- `recommended_action text`
- `escalation_status text`
- `follow_up_on date`
- `attachments jsonb`

### `app.audit_logs`
- `id uuid primary key`
- `user_id uuid`
- `actor_id uuid`
- `actor_role text`
- `event_type text`
- `target_id uuid`
- `metadata jsonb`
- `created_at timestamptz default now()`

## Enumerations
Use Supabase enums to back TypeScript union types:
- `app.session_status_enum`
- `app.session_category_enum`
- `app.goal_type_enum`
- `app.injury_severity_enum`
- `app.supporter_access_level_enum`
- `app.audit_event_enum`

## Relationships & Cascades
- `app.users` ← `app.sessions`, `app.measurements`, `app.goals`, `app.injury_reports`, `app.programs` (on delete cascade).
- `app.sessions` ← `app.session_pressure_samples`, `app.session_vital_samples`, `app.session_breaks`, `app.session_tube_intervals`, `app.session_incidents` (cascade on delete).
- `app.measurements` ← `app.measurement_vitals`, `app.measurement_photos` (cascade on delete).
- `app.goals` ← `app.goal_milestones` (cascade on delete).
- `app.programs` ← `app.program_phases` ← `app.program_session_templates` (cascade down).
- `app.injury_reports` ← `app.clinician_notes` (set null on delete).

## Row Level Security Policies
1. **Self-access** – users can view/edit records where `user_id = auth.uid()`.
2. **Supporter** – rows accessible if `supporter_access` grants permission and is not expired.
3. **Clinician** – privileged roles (via Supabase groups) with read access to assigned users only.
4. **System** – service role executes background tasks; handled via Supabase service key, not exposed to client.

Example policy stub:
```sql
create policy "Users manage their sessions"
  on app.sessions
  for all
  using ( user_id = auth.uid() )
  with check ( user_id = auth.uid() );
```

Supporter access view:
```sql
create view app.supporter_session_access as
select sa.supporter_id, s.*
from app.supporter_access sa
join app.sessions s on s.user_id = sa.user_id
where sa.expires_at is null or sa.expires_at > now();
```

## Indexing Strategy
- Time-series tables (`session_pressure_samples`, `session_vital_samples`) indexed on `(session_id, recorded_at)`.
- Tag/JSON search uses GIN indexes on `tags` arrays and `metadata` JSONB.
- Full text search indexes for clinician notes and AI conversations (`tsvector`).
- Partial indexes for active goals (`status = 'active'`).

## Supabase Functions & Triggers
- `app.fn_update_updated_at()` – generic trigger to maintain `updated_at`.
- `app.fn_log_audit_event()` – writes to `app.audit_logs` on insert/update/delete for high-risk tables.
- `app.fn_program_progress()` – calculates program completion percentages.
- `app.fn_session_compliance()` – recalculates compliance on data changes.

## Sync with Dexie
Local Dexie tables should mirror the primary domain tables:
- `dexie.sessions`
- `dexie.measurements`
- `dexie.goals`
- `dexie.injury_reports`
- `dexie.media_assets`
Each entry stores `synced_at`, `dirty`, and `pending_upload` flags for conflict resolution.

## Next Steps
1. Draft Supabase migrations under `supabase/migrations/001_core_schema.sql` based on this spec.
2. Create companion rollback scripts.
3. Update `scripts/seed.ts` with realistic seed data aligned with new schema.
4. Expand TypeScript API clients (`src/lib/api.ts`) to use the new models.
5. Document RLS policy rationale in `docs/SECURITY-OBSERVABILITY.md`.

