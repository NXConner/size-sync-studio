# PumpGuard Performance Suite

Safety-first coaching, analytics, and observability platform for penis pump training. PumpGuard helps men maximize long-term growth while protecting vascular health, documenting progress, and collaborating with trusted supporters or clinicians.

## Mission & Principles
- **Safety Over Everything** – codify medical-grade guardrails, injury triage, and compliance workflows before performance gains.
- **Evidence-Backed Progress** – log vacuum pressure, duration, physiological signals, and morphological changes with calibration-grade accuracy.
- **Personalized Coaching** – deliver adaptive programming, AI guidance, and partner/clinician collaboration features tailored to small teams.
- **Operational Excellence** – automate setup, testing, deployment, and monitoring so a three-person crew can operate like a mature studio.
- **Data Stewardship** – enforce encryption, RLS, and clear retention policies; no secrets stored in code.

## Feature Highlights
- **Guided Session Engine** – preset libraries, adaptive rest timers, pressure logging, emergency-stop workflows, and compliance scoring.
- **Measurement Intelligence** – multi-metric captures (length, girth, volumetric estimates, edema markers) with calibration cards, overlays, and sensor fusion.
- **Safety Command Center** – triage questionnaires, red-flag detection, injury logbook, escalation protocols, and evidence-based safety tips.
- **Growth Analytics** – cohort comparisons, trend projections, plateau alerts, and pump model benchmarking across time horizons.
- **AI Safety Coach** – feature-flagged conversational coach for live decision support, escalation, and motivational accountability.
- **Media & Gallery** – anonymized photo timelines, edema detection, seal check overlays, and PDF summary exports.
- **Partner & Clinician Portals** – RBAC-secured dashboards for coaches, partners, or clinicians to review sessions, add notes, and sign off on plans.
- **Mobile & Sensor Ready** – Capacitor app scaffold, Web Bluetooth/BLE bridge, and future AR-assisted fit guidance.

## Architecture Overview
- **Frontend (`src/`)** – Vite + React 18 + TypeScript, Tailwind, shadcn-ui components, Radix primitives, TanStack Query for data flows, feature flags in `src/lib/flags.ts`.
- **Backend (`server/`)** – Express with Helmet, rate limiting, compression, structured logging (pino) and optional Sentry integration.
- **Supabase (`supabase/`)** – PostgreSQL schema, RLS policies, Edge Functions; pending migrations will capture measurements, sessions, injuries, programs, audit logs.
- **Integrations (`src/integrations/`)** – Supabase client, health hardware hooks, and third-party services.
- **ML & CV (`ml/`)** – Python prototypes for calibration, segmentation, triage, and report generation; scheduled for on-device model integration.
- **Mobile (`android/`)** – Capacitor/Android shell for native packaging, camera overlays, and asset generation.
- **Tooling** – Husky + lint-staged, ESLint, Prettier, Vitest, Playwright, Docker (api + web), k6 load-testing scaffold (planned).

## Quick Start (Local Web + API)
```bash
npm install
npm run server   # Express API on :3001
npm run dev      # Vite dev server on :8080 (proxies /api)
```
Open http://localhost:8080 and verify the health endpoint at http://localhost:3001/api/health.

### Alternative Combined Start
```bash
npm run dev:all  # concurrently runs API + web
```

## Environment Configuration
Create `.env` for the API:
```env
NODE_ENV=development
PORT=3001
API_PREFIX=/api
WEB_ORIGIN=http://localhost:8080
SENTRY_DSN=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

Frontend (`.env.local`):
```env
VITE_APP_BASENAME=
VITE_API_BASE=/api
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_SENTRY_DSN=
```
> Never commit real secrets; use Doppler, Vault, or AWS Secrets Manager in production. All scripts must be idempotent and rerunnable.

## Core Directories
- `src/pages/` – Route-level experiences (`Measure`, `Sessions`, `Safety`, `Analytics`, `Gallery`, `Chat`, etc.).
- `src/components/` – Reusable UI and feature modules (measurement suite, wellness toolkit, session presets, etc.).
- `src/lib/` – Config, design system tokens, feature flags, Supabase client, analytics helpers, ML bridges.
- `src/utils/` – Camera, storage, notifications, exporters, security, and voice coaching helpers.
- `tests/` – Vitest unit/integration specs, Playwright e2e smoke tests.
- `ml/` – Python notebooks, ingest pipelines, prototype tooling for calibration and triage.
- `supabase/` – Database migrations, seed scripts, and SQL helpers.
- `scripts/` – Automation utilities (build, service worker generation, OpenAPI export, seeding).
- `android/` – Capacitor Android wrapper for packaging to native.

## Scripts & Tooling
- `npm run dev` / `npm run server` / `npm run dev:all`
- `npm run build` / `npm run preview`
- `npm run lint` / `npm run lint:fix`
- `npm run format` / `npm run format:check`
- `npm run test` (Vitest coverage) / `npm run e2e` (Playwright)
- `npm run typecheck`
- `npm run analyze` (bundle stats)
- `npm run audit:high` (dependency scan)
- `npm run build:android` / `npm run cap:sync`
- `npm run seed` (Supabase seeding once migrations are updated)

## Testing & QA Matrix
| Layer | Tooling | Status |
| --- | --- | --- |
| Unit & Integration | Vitest + Testing Library | ✅ baseline coverage, target 85%+
| UI Regression | Story-driven component tests (planned) | ⚙️ pending
| End-to-End | Playwright (`tests/e2e`) | ✅ smoke coverage, expand flows
| Accessibility | eslint-plugin-jsx-a11y + axe scripts | ⚙️ enhance automation
| Load | k6 / Artillery scripts (`scripts/performance/`, planned) | ⚙️ pending
| Security | npm audit / Snyk / CodeQL (via CI) | ⚙️ expand coverage

## Observability & Security
- Structured logging (`pino`, `pino-http`) with correlation IDs.
- Optional Sentry for FE/BE error reporting (`VITE_SENTRY_DSN`, `SENTRY_DSN`).
- Prometheus metrics scaffold (via `prom-client`) prepared for CI/CD integration.
- Helmet, CORS, express-rate-limit, and configurable CSP headers.
- Supabase RLS policies (forthcoming migrations) + encrypted local storage (Dexie + crypto plan).
- Plan to integrate Doppler/Vault/AWS Secrets Manager for production secret rotation.

## Deployment & Operations
- Dockerized web + API (`Dockerfile.web`, `Dockerfile.api`, `docker-compose.yml`).
- Husky pre-commit hooks enforce lint/format before commits.
- GitHub Actions workflow (to be expanded) will build, lint, test, run migrations, scan dependencies, and produce artifacts.
- Lovable.dev preview supported via `lovable-tagger` metadata.

## Roadmap Snapshot (see `/docs` for detailed specs)
1. Strategic copy update & terminology alignment.
2. Supabase schema / migration overhaul for measurements, injuries, programs, audit logs.
3. Encrypted Dexie + Supabase sync layer and conflict resolution helpers.
4. Advanced measurement workflow UI, session orchestration, and tests.
5. Safety intelligence center with injury triage and escalation automation.
6. Growth analytics, achievements, and reporting dashboards.
7. AI safety coach (feature-flagged) with structured logging and audit trails.
8. Sensor integration (BLE/Capacitor plugins) and hardware abstraction.
9. Gallery ML enhancements (edema detection, anonymization, seal analysis).
10. Multi-theme design system with wallpaper customization and a11y QA.
11. Observability + security hardening (Sentry, Prometheus, CodeQL, CSP).
12. CI/CD, load testing, documentation (compliance, onboarding, DR, retrospective).

## Legacy Research Assets
The repository still includes ML prototypes under `ml/prototype` (calibration, triage, report generation) and mobile scaffolding docs under `docs/mobile/`. These remain valuable references while the production pipeline is aligned with PumpGuard’s mission.

## License
MIT — review `LICENSE` before distributing. Ensure all medical guidance is validated by qualified professionals prior to public release.
