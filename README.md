Privacy-first Men's Health App (Prototype)

Overview
- This repository contains an initial ML prototype for the Peyronie's screening module and scaffolding for future components. The prototype runs on a desktop to validate the calibration, segmentation, and geometry metrics before porting to mobile on-device inference.

Modules
- ml/prototype: Python prototype for calibration (ArUco), segmentation (classical placeholder), and curvature/length metrics with a CLI tool.
  - analyze_capture.py: Single-image analysis CLI
  - live_capture.py: Live camera overlays with auto-capture and on-the-fly analysis
  - triage_cli.py & triage_rules.py: STD triage rule engine CLI
  - report_pdf.py: Generate clinician-style PDF from analysis outputs

Quick start (Linux/macOS)
1) Create and activate a virtual environment
   python3 -m venv .venv
   source .venv/bin/activate

2) Install dependencies
   pip install -r ml/prototype/requirements.txt

3) Run analysis on an image
   python ml/prototype/analyze_capture.py --image path/to/your_image.jpg --marker-mm 20 --out overlays.png --json metrics.json

   Arguments:
   - --image: Path to the input image containing both the subject and the printed calibration card (full card visible).
   - --marker-mm: Real-world side length in millimeters for the reference square on the calibration card (default 20 mm).
   - --out: Path to save the overlay image with detected centerline and annotations.
   - --json: Path to save computed metrics in JSON format.

4) Notes
- Print the calibration card at 100% scale (no fit-to-page). Place the card flat, matte side up, and fully visible in the frame.
- Use bright, even lighting and hold the camera parallel to the surface.
- This prototype uses classical segmentation as a placeholder. A neural model will replace it in later iterations.

Troubleshooting
- If ArUco is not detected: Ensure you printed at 100%, the card occupies ~15%+ of the frame, and there is minimal glare.
- If segmentation fails: Improve lighting and contrast. Adjust the frame so the subject is well separated from the background.

License
- For internal prototyping only. Do not distribute.

Live capture (desktop webcam)
1) Launch live capture with overlays and auto-capture
   python ml/prototype/live_capture.py live --marker-mm 20 --threshold 85 --consecutive 10 --camera-index 0 --burst-frames 6 --out-dir captures

2) Controls
- The window shows a “good score” and guidance (Lighting/Stability/Marker/Distance/Framing).
- When the score stays above the threshold for the required consecutive frames, a burst is captured and analyzed.
- Press 'q' to quit.

Outputs
- Overlay PNG and metrics JSON are saved under the specified output directory.

STD triage rule engine (CLI)
1) Prepare inputs
   Write three JSON files, for example:
   exposures.json
   [
     {"date": "2025-08-01", "site": "vaginal", "condom_used": false}
   ]
   symptoms.json
   {"discharge": true, "dysuria_pain_urination": true}
   profile.json
   {"user_age": 25, "hepatitis_b_vaccinated": false, "injection_drug_use": false}

2) Run triage
   python ml/prototype/triage_cli.py run --exposures-json exposures.json --symptoms-json symptoms.json --profile-json profile.json --out triage_result.json

3) Output
   triage_result.json contains recommended panels, urgency flags, and guidance.

PDF report generation
1) Install dependencies if not already installed
   pip install -r ml/prototype/requirements.txt

2) Generate a report from prior analysis outputs
   python ml/prototype/report_pdf.py generate --metrics-json /abs/path/metrics.json --overlay-image /abs/path/overlays.png --out-pdf curvature_report.pdf

3) Optional PDQ summary
   Provide --pdq-summary pdq.json to include questionnaire summaries in the report.

Lab sandbox stub (local only)
1) Create an order
   python ml/prototype/lab_stub_cli.py create_order --user-id usr_1 --panel-codes CG_NAAT HIV_AGAB_4TH_GEN SYPHILIS_RPR_TPPA

2) List and view orders
   python ml/prototype/lab_stub_cli.py list_orders
   python ml/prototype/lab_stub_cli.py get_order --order-id ord_XXXXXXXXXXXX

3) Simulate results
   python ml/prototype/lab_stub_cli.py simulate_result --order-id ord_XXXXXXXXXXXX
   python ml/prototype/lab_stub_cli.py list_results
   python ml/prototype/lab_stub_cli.py get_result --result-id res_XXXXXXXXXXXX

# Size Seeker — Wellness & Measurement App

Size Seeker is a Vite + React + TypeScript app with an Express API focused on safe, wellness‑oriented tracking. It includes guided sessions, a camera‑assisted measurement tool (OpenCV.js), safety guidance, tips, a gallery, and a safety‑scoped chat.

## Table of Contents
- Overview
- Features
- Architecture
- Getting Started (Local)
- Environment Configuration
- Running with Docker
- OpenCV.js Local Hosting
- Scripts
- Testing
- Deployment Notes
- API Overview
- Privacy & Data Storage
- Troubleshooting

## Overview
- Frontend: Vite, React 18, TypeScript, Tailwind, shadcn‑ui
- Backend: Express with rate limiting, Helmet, CORS, compression, optional Sentry
- Dev proxy: Vite proxies API requests to the Express server
- Mobile: Capacitor config is present for Android builds

## Features
- Guided Sessions with presets and a live Session Runner
- Camera‑assisted Measure page with manual/auto calibration, overlays, and OpenCV.js
- Safety page emphasizing non‑graphic, harm‑minimizing guidance
- Tips page with curated advice
- Gallery for progress photos with overlay comparison
- Chat for general wellness guidance with explicit refusals for sexual techniques

## Architecture
- Frontend app entry: `src/main.tsx`, routes in `src/App.tsx`
- Pages: `src/pages/` → `Index`, `Sessions`, `SessionRunner`, `Measure`, `Gallery`, `Chat`, `Safety`, `Tips`
- Utilities: `src/utils/` → `opencv.ts`, `audio.ts`, `storage.ts`
- API server: `server/index.js` (mounted at `API_PREFIX`, default `/api`)
- Config: `src/lib/config.ts` (`VITE_APP_BASENAME`, `VITE_API_BASE`); `server/config.js`
- Docker: `Dockerfile.api`, `Dockerfile.web`, `docker-compose.yml`, Nginx static + proxy

## Getting Started (Local)
Prereqs: Node.js >= 20 and npm

1) Install dependencies:
```bash
npm install
```

2) Start API and Web (two terminals) or together:
```bash
# terminal A
npm run server

# terminal B
npm run dev

# or concurrently
npm run dev:all
```

3) Open the app:
- Web: `http://localhost:8080` (Vite dev server)
- API health: `http://localhost:3001/api/health`

Proxy: Vite forwards `${VITE_API_BASE || "/api"}` to `http://localhost:3001` in dev.

## Environment Configuration
Create `.env` for the API (server) if needed:
```env
NODE_ENV=development
PORT=3001
API_PREFIX=/api
WEB_ORIGIN=http://localhost:8080
# Optional Sentry
SENTRY_DSN=
# Optional Reddit OAuth for richer subreddit fetches
REDDIT_CLIENT_ID=
REDDIT_CLIENT_SECRET=
REDDIT_USERNAME=
REDDIT_PASSWORD=
```

Frontend (Vite) env (optional) via `.env.local`:
```env
VITE_APP_BASENAME=
VITE_API_BASE=/api
# Optional Sentry DSN for frontend init at build time
VITE_SENTRY_DSN=
```

## Running with Docker
Build and run both services via Compose:
```bash
docker compose up --build
```
- Web: `http://localhost:8080`
- API (proxied at `/api`): `http://localhost:8080/api/health`

Run API only:
```bash
docker build -t sizeseeker-api -f Dockerfile.api .
docker run -p 3001:3001 --env-file .env sizeseeker-api
```

Run Web only (Nginx serves build and proxies `/api` to API container):
```bash
docker build -t sizeseeker-web -f Dockerfile.web .
docker run -p 8080:80 sizeseeker-web
```

## OpenCV.js Local Hosting
If CDNs are blocked or you need offline support, provide local OpenCV assets. The loader prefers `/opencv/opencv.js`.

Steps:
1) Place files in `public/opencv/`:
   - `opencv.js`
   - `opencv_js.wasm` (version‑matched)
2) Verify in dev:
   - `npm run dev`
   - Visit `http://localhost:8080/opencv/opencv.js` and `/opencv/opencv_js.wasm`
3) Build and preview:
   - `npm run build && npm run preview`

Notes:
- The loader sets `cvModule.locateFile` so WASM loads from the same directory as `opencv.js`.
- If local files are absent, multiple CDN fallbacks are attempted.

## Scripts
- `npm run dev` — Start Vite dev server
- `npm run server` — Start Express API on port 3001
- `npm run dev:all` — Run both dev server and API
- `npm run build` — Build frontend
- `npm run preview` — Preview built frontend
- `npm run test` — Run vitest with coverage
- `npm run typecheck` — TypeScript check
- `npm run lint` — ESLint

## Testing
```bash
npm test
```
Vitest + jsdom are configured. Add tests under `tests/` and `src/**/__tests__/**` as needed.

## Deployment Notes
- Static build is served by Nginx (see `Dockerfile.web`, `nginx.conf`). `/api` is proxied to the API service.
- If hosting under a sub‑path, set `VITE_APP_BASENAME` and ensure server proxy and Nginx match paths.
- Optional Sentry is supported via env on both client and server.

## API Overview
Base path: `${API_PREFIX}` (default `/api`). See `GET {API_PREFIX}/docs` for Swagger UI.

Endpoints:
- `POST /chat` — Returns safe wellness guidance; refuses sexual technique/enlargement requests
- `GET /chat/stream` — SSE stream of a short wellness message
- `GET /reddit/gettingbigger` — Titles/links only; may use Reddit OAuth if configured
- `GET /image/schedule` — Simple SVG wellness plan
- `POST /feedback` — Capture chat feedback in memory
- `GET /health` — Health check `{ status: "ok" }`

Security middleware: Helmet (CSP in prod), rate limit, CORS restricted by `WEB_ORIGIN`, compression.

## Privacy & Data Storage
- Measurements, sessions, goals: stored in `localStorage` keys `size-seeker-*`
- Photos: stored in IndexedDB (`SizeSeekerPhotos` store)
- Data remains in the browser unless you export or clear it

## Troubleshooting
- OpenCV load failures: ensure `public/opencv/opencv.js` and matching `opencv_js.wasm` exist and are reachable. Check console for CORS/404.
- CORS errors in dev: set `WEB_ORIGIN=http://localhost:8080` on the API; ensure `VITE_API_BASE=/api` client‑side.
- API 502 on subreddit fetch: Reddit may block; configure OAuth creds or try later.
- Camera errors on Measure: grant camera permissions and ensure a camera is available; switch facing mode if needed.
- Running under sub‑path: set `VITE_APP_BASENAME` and redeploy; confirm Nginx `try_files` and proxy prefix.
