## Final Steps to Finish Integration (Option A: Code-level Merge)

### 1) Grant Access to secret-view-haven
- Add this Deploy Key on GitHub → repo Settings → Deploy keys → Add deploy key:
  - Title: cursor-workspace-deploy
  - Key:
    ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIFmhLpbAi8yYO3HkcnAgLagCp3Kzp/GrcsgEN8ksIjfQ cursor-workspace-deploy
  - Allow write access: enabled (to push PR branch)
- SSH URL to use: git@github.com:NXConner/secret-view-haven.git

### 2) Clone target repo and prepare feature prefix
```bash
GIT_SSH_COMMAND="ssh -i /workspace/secret-view-haven_deploy -o IdentitiesOnly=yes" \
  git clone git@github.com:NXConner/secret-view-haven.git /workspace/secret-view-haven
cd /workspace/secret-view-haven
git checkout -b feature/wellness-module
```

### 3) Frontend wiring in secret-view-haven
- Install dependencies to match feature module requirements (React 18, react-router or adapt, Tailwind/shadcn, @tanstack/react-query, zod, sonner, lucide-react, etc.).
- Copy the feature UI into a module path, e.g. `apps/web/features/wellness` or `src/features/wellness`:
  - From this repo: `src/pages/*`, `src/components/*`, and any used `src/lib/*`, `src/utils/*`.
- Router:
  - Mount the feature under `/wellness/*`.
  - If using React Router: add a route group with basename or path prefix.
  - If using Next.js: create a route segment `app/wellness/(routes)` and convert pages to server/client components as needed.
- Styling:
  - Merge Tailwind config and base styles; add shadcn components as needed.
- Env for client:
  - `VITE_APP_BASENAME=/wellness`
  - `VITE_API_BASE=/api/wellness`

### 4) Backend wiring in secret-view-haven
- Create an Express router or API handlers and mount under `/api/wellness/*`.
- Port endpoints (see this repo `server/index.js`):
  - POST `/chat`
  - GET `/chat/stream`
  - GET `/reddit/gettingbigger`
  - GET `/image/schedule`
  - POST `/feedback`
  - GET `/health`
- Security middleware:
  - Keep rate limit, helmet, compression, Sentry (opt-in) as in the current server.
- Env for server:
  - `API_PREFIX=/api/wellness`
  - `PORT=3001` (or your existing API port)
  - `NODE_ENV=production`
  - Optional: `SENTRY_DSN`, Reddit OAuth (`REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`, `REDDIT_USERNAME`, `REDDIT_PASSWORD`).

### 5) Dev proxy and prod reverse proxy
- Dev: proxy `${VITE_API_BASE}` to the server port (e.g., Vite/Next dev proxy).
- Prod: add reverse proxy (Nginx/traefik) mapping `/api/wellness/*` to API service.

### 6) Navigation & UX
- Add a Navbar link to `/wellness`.
- Lazy-load the feature routes to keep initial bundle small.

### 7) Validation checklist
- `npm run typecheck` and fix types.
- `npm test` passes.
- Hit `GET /api/wellness/health` → `{ status: "ok" }`.
- Load `/wellness/chat`: test chat, SSE stream toggle, and feedback post.
- Load subreddit posts with/without Reddit OAuth configured.
- Confirm CSP/cors headers and rate limiting behave in prod.

### 8) Commit and open PR
```bash
git add .
git commit -m "feat(wellness): integrate wellness module under /wellness and /api/wellness"
git push -u origin feature/wellness-module
```
Open a Pull Request on GitHub with summary and env/proxy notes above.

---
Notes:
- This repo has been prepared for namespacing via `VITE_APP_BASENAME`, `VITE_API_BASE`, and server `API_PREFIX`.
- For fastest adoption, keep the prefix `/wellness` and `/api/wellness` as shown.

### OpenCV WASM/SIMD (optional but recommended)
- Place `public/opencv/opencv_js.wasm` (SIMD-enabled build if available). Ensure it is served with `Content-Type: application/wasm`.
- The runtime loader uses `locateFile` so the `.wasm` will be fetched from the same directory as `opencv.js`.
- The Service Worker caches `/opencv/opencv_js.wasm` for offline support.

