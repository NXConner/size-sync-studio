# Size Sync Studio Integration

## What was added
- New page `Studio` at route `/studio` with an iframe that embeds Size Sync Studio
  - Dev: iframes `http://localhost:8081/` (configurable via `VITE_STUDIO_DEV_URL`)
  - Prod: serves bundled static assets from `/ssstudio/index.html`
- Navbar: new "Studio" tab
- Dev script: `npm run dev:studio` to run host app and (if available) the submodule's API/Web
- Build script: `npm run build:studio` to build/copy submodule assets into `public/ssstudio`
- Server: static serving for `/ssstudio` when using Node server

## Setup
- Ensure Git submodule is present at `external/size-sync-studio`:
  ```bash
  git submodule update --init --recursive
  ```

## Development
- Start end-to-end dev with Studio embed:
  ```bash
  npm run dev:studio
  ```
  - Host app on `:8080`
  - Submodule API `:3001` and Web `:8081` (if submodule folder exists)
  - Open `http://localhost:8080/studio`

- Alternatively, run host and Studio web yourself and just open `/studio`.
  - Configure `VITE_STUDIO_DEV_URL` if not using `http://localhost:8081/`.

## Production Build
- Bundle Studio assets and app:
  ```bash
  npm run build:studio && npm run build
  ```
  - Assets copied to `public/ssstudio`
  - Open `/studio` in the built app

## Benefits & Enhancements
- Centralizes advanced camera/microphone workflows and sizing flows in one place
- Reuses full Size Sync Studio feature set without code duplication
- Enhances existing app by enabling:
  - Guided capture flows and improved UI/UX for media handling
  - Potential cross-feature use (e.g., sending captures/measurements to main app flows)
  - Privacy-friendly approach: permissions remain scoped in the embedded app; the host stores no raw media
- Extensible: You can message between host and iframe for advanced integrations (future)

## How it looks and functions
- A dedicated page with informative header and controls:
  - "Reload" button to refresh the embedded app
  - "Open in new tab" to break out to the Studio directly
  - About/Permissions note and environment indicator (Dev/Production)
- Main content shows the interactive Studio app within a responsive iframe

## Usage tips
- Dev blank frame? Ensure port `8081` is live or set `VITE_STUDIO_DEV_URL`
- Production updates: re-run `npm run build:studio` to refresh assets
- If using the Node server (`npm run server`), `/ssstudio` is served automatically

## Future integrations (optional)
- PostMessage bridge for:
  - Starting capture from host UI
  - Receiving processed measurements or session metadata
- Feature flag to toggle Studio availability per environment
- Telemetry wrapping to surface Studio session metrics in host analytics
