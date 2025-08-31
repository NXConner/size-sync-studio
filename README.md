# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/16d96009-e518-4ad6-887b-ccbb25d2315a

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/16d96009-e518-4ad6-887b-ccbb25d2315a) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/16d96009-e518-4ad6-887b-ccbb25d2315a) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Backend (API) Setup

## Docker

Build and run both API and Web with Docker Compose:

```bash
docker compose up --build
```

- Web: http://localhost:8080
- API (proxied by Nginx at /api): http://localhost:8080/api/health

To run API only:

```bash
docker build -t sizeseeker-api -f Dockerfile.api .
docker run -p 3001:3001 --env-file .env sizeseeker-api
```

To run Web only (serves built assets via Nginx and proxies /api to API container):

```bash
docker build -t sizeseeker-web -f Dockerfile.web .
docker run -p 8080:80 sizeseeker-web
```

This project includes a minimal Express backend with safety guardrails.

- Install deps: `npm install`
- Start API server: `npm run server`
- Start frontend: `npm run dev`
- Or run both: `npm run dev:all`

Vite proxy forwards `/api/*` to `http://localhost:3001` in development.

### Endpoints

- `POST /api/chat` — Safe chat. Refuses sexual technique or enlargement instructions and returns general wellness guidance.
- `GET /api/image/schedule` — Returns a simple non-graphic SVG wellness plan.
- `GET /api/reddit/gettingbigger` — Fetches titles/links from r/gettingbigger top posts (titles and links only). Upstream may block or rate-limit.

## OpenCV.js (manual local hosting)

If your environment blocks CDNs or you want offline support, you can host OpenCV locally. The app already prefers a local copy at `/opencv/opencv.js` before trying CDNs.

Steps:

1) Create folder `public/opencv/` and add both files:
- `public/opencv/opencv.js`
- `public/opencv/opencv_js.wasm`

2) Use matching versions for JS and WASM. Typical sources:
- `@techstark/opencv-js` npm package (look under its `dist/` or `build/` folder)
- Official docs host (versioned), e.g. `https://docs.opencv.org/4.x/`

3) Verify the files are served in dev:
- Start dev server: `npm run dev`
- Visit `http://localhost:5173/opencv/opencv.js` and `http://localhost:5173/opencv/opencv_js.wasm` — both should return files (not 404).

4) Build/serve:
- Build: `npm run build`
- Preview: `npm run preview` (or Docker image). Ensure `GET /opencv/opencv.js` and `/opencv/opencv_js.wasm` succeed.

Notes:
- Our loader sets `cvModule.locateFile` so the wasm is requested from the same directory as `opencv.js`. Keep both files together in `public/opencv/`.
- If you update versions, keep JS and WASM compatible. Mismatched versions can cause initialization failures.
- If local files are present, they will be used; otherwise, the loader falls back to multiple CDNs automatically.

## Safety and Scope

- The chatbot explicitly declines to provide sexual technique, enlargement, routines, pressures, or medical instructions.
- It provides general non-graphic wellness guidance (sleep, stress, exercise, nutrition).
- Not medical advice. For concerns, consult a licensed clinician/urologist.
