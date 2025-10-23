# Phase 1 — Codebase Analysis and Strategic Roadmap

## Project Summary
- Web: Vite + React 18 + TypeScript + Tailwind + shadcn-ui
- Mobile: Capacitor (Android scaffold present)
- API: Express (Helmet, CORS, compression, rate-limit, Swagger, optional Sentry)
- PWA: Workbox-generated SW, offline caching, background sync, push scaffold
- Data: LocalStorage + IndexedDB; optional Supabase schema + RLS migrations present
- Observability: Pino HTTP logs, Prometheus metrics endpoint, optional Sentry
- Tests: Vitest unit tests, Playwright E2E smoke; CI workflows exist (duplicated)

## Key Findings (Gaps, Risks, Technical Debt)
- Security/Secrets
  - Hardcoded Supabase URL and anon key in `src/integrations/supabase/client.ts` (must use env)
  - `.env` checked in; missing `.env.example` and secrets guidance
- Backend duplication
  - `server/app.js` and `server/index.js` duplicate logic; metrics/logging differ
- A11y & i18n
  - No a11y ESLint plugin configured; i18n helper exists but not broadly applied
- CI/CD
  - Multiple overlapping CI workflows; no dedicated CodeQL SAST workflow
- DB & Migrations
  - Supabase SQL migrations exist with RLS, but missing `roles` and `user_roles` tables/policies
  - No idempotent seed script using service role
- DevEx
  - No Prettier config; no Husky/lint-staged hooks
  - Missing `.dockerignore`
- API Docs
  - OpenAPI present in code, but no export script artifact
- Load/Perf
  - No load test scripts for API smoke/regression
- Feature Flags & Design System
  - No central feature-flag module
  - Tailwind theme tokens exist, but no explicit design_system.ts and ThemeProvider wiring

## Feature Maximization Opportunities
- Measurement UX: refine performance of overlays, add feature flags to gate experimental ML, robust i18n on core pages.
- PWA: improve offline data sync validation and push UX; add a queue status surface (partially present).
- Settings: add ThemeProvider-backed multi-theme, high contrast mode (class toggle exists), language selector integration via `i18n.ts`.
- Backend: unify app creation and server entry; consistent metrics across environments; structured logging already present in app.js.
- Supabase: move to env-configured client; add roles/user_roles + seed; keep RLS strict.

## New High-Value Features
- Feature flags foundation to allow progressive delivery
- Admin role support (via Supabase roles/user_roles) enabling future dashboards
- Load testing baseline (k6) for health, reddit proxy, and chat routes

## Refactors and Fixes
- Remove hardcoded Supabase keys from source; use `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`
- Unify `server/index.js` to bootstrap `app.js`
- Add `.dockerignore`, Prettier config, Husky + lint-staged
- Add a11y ESLint plugin
- Consolidate CI with a primary workflow and add CodeQL

## Phased Implementation Roadmap

| Priority | Task Description | Task Type | Files to Modify/Create |
|---|---|---|---|
| P0 | Remove hardcoded Supabase keys; use env | Fix | `src/integrations/supabase/client.ts`, `.env.example` |
| P0 | Unify server entry to use `app.js` | Refactor | `server/index.js` |
| P0 | Add `.env.example` and secrets guidance | Refactor | `.env.example`, `docs/SECRETS.md` |
| P0 | Add Prettier and a11y ESLint | Refactor | `.prettierrc.json`, `eslint.config.js`, `package.json` |
| P0 | Add Husky + lint-staged pre-commit | DevEx | `.husky/pre-commit`, `package.json` |
| P0 | Add `.dockerignore` | DevEx | `.dockerignore` |
| P0 | Add roles/user_roles migration | Max-Feature | `supabase/migrations/*roles_user_roles.sql` |
| P0 | Add seed script (idempotent) | Max-Feature | `scripts/seed.mjs` |
| P1 | Export OpenAPI to artifact | DevEx | `scripts/export-openapi.mjs`, `package.json` |
| P1 | Add k6 API smoke | Perf/New-Feature | `tests/load/k6-smoke.js`, `docs/LOAD_TESTING.md` |
| P1 | Add ThemeProvider + design system file | Max-Feature | `src/lib/design_system.ts`, `src/lib/flags.ts`, `src/App.tsx` |
| P1 | Add LICENSE and CODEOWNERS | DevEx | `LICENSE`, `CODEOWNERS` |
| P1 | Add PR/Issue templates | DevEx | `.github/ISSUE_TEMPLATE/*`, `.github/pull_request_template.md` |
| P1 | Add main CI + CodeQL | DevEx/Security | `.github/workflows/main.yml`, `.github/workflows/codeql.yml` |

Notes
- All changes are idempotent and safe to re-run
- No runtime secrets committed; use env variables only
