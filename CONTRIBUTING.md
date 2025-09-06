Contributing
============

Getting started
---------------
- Node 20+ (Node 22 recommended)
- npm 10+
- Install deps: `npm ci`
- Start dev servers: `npm run dev:all` (web + API)

Code style
----------
- TypeScript strict, no `any` in public APIs
- Descriptive names; avoid 1–2 char vars
- Prefer early returns, shallow nesting
- Add comments for non-trivial logic (the "why")

Commands
--------
- Lint: `npm run lint`
- Typecheck: `npm run typecheck`
- Unit tests: `npm test`
- E2E tests: `npm run e2e` (requires preview + API; CI handles this)
- Build: `npm run build`

PR checklist
------------
- Lint/type/tests pass locally
- Added/updated tests
- No console.log in committed code
- Docs updated (README/USER_MANUAL/ADRs if needed)

Security
--------
- Never commit secrets. Use `.env` locally and CI secrets.
- Follow CSP guidelines in `server/index.js`.

Releases
--------
- CI builds Docker images and runs E2E
- Sentry release uploads can be enabled via env vars

