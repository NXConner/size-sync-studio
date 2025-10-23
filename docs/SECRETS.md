# Secrets and Environment Configuration

Never commit real secrets. Use environment variables and secret managers.

## Required
- Server
  - `PORT`, `API_PREFIX`, `WEB_ORIGIN`
- Frontend
  - `VITE_API_BASE`, optional `VITE_SENTRY_DSN`
- Supabase
  - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (frontend)
  - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (seed/ops)

## Recommended Secret Managers
- Doppler, AWS Secrets Manager, or HashiCorp Vault. Configure CI to inject secrets during build/deploy.

## Admin Setup
1. Create a user `n8ter8@gmail.com` in Supabase Dashboard (Authentication > Users).
2. Run the seed script to assign `super_admin`:
```bash
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed.mjs
```
