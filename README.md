# SenseWeave

SenseWeave is an environmental awareness prototype for DeafBlind, blind, and low-vision people. It turns observed events into user-controlled text, screen-reader, audio, haptic, and Braille-compatible feedback. The `/demo` page uses synthetic scenarios and works without camera, microphone, or API credentials.

> **Safety:** SenseWeave is a prototype, not a mobility aid. Do not use it to navigate, cross streets, or detect hazards. It can miss events or describe them incorrectly. Keep established mobility aids and support in use.

## Features

- Synthetic interactive scenarios at `/demo`, with audio, haptic, Braille text, and timeline controls.
- Live session flow with selectable environment, optional camera/microphone, event timeline, and session recap.
- Sign in, sign up, password reset, onboarding, saved sessions, privacy information, and accessibility preferences via Supabase.
- Express API and ticket-authenticated WebSocket service for live sessions.
- Shared TypeScript and Zod contracts across the frontend and API.

Live AI, account, and saved-session features require valid service credentials. Browser support for camera, microphone, vibration, speech synthesis, and clipboard access varies. Run on HTTPS for browser media permissions in a deployed environment.

## Requirements

- Node.js 20 or later (use an active LTS release) and npm.
- A Supabase project for authentication and persistence.
- A Google Gemini API key for live AI features.

## Run locally

```bash
npm ci
```

Create `apps/api/.env` with the server settings below and `apps/web/.env` with the browser settings. The demo can be explored without configuring either file; API-backed pages need both services configured.

`apps/api/.env`:

```dotenv
NODE_ENV=development
PORT=4000
FRONTEND_ORIGIN=http://localhost:5173
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
GEMINI_LIVE_MODEL=gemini-3.8-flash
GEMINI_SUMMARY_MODEL=gemini-3.8-flash
```

`apps/web/.env`:

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Use the anon/publishable key in the browser only. Never put the Supabase service-role key or Gemini key in a `VITE_` variable or commit a real `.env` file. The Vite development server proxies `/api/v1` and `/api/v1/live` to `localhost:4000`.

Apply the SQL migration in `supabase/migrations/` to the Supabase project before relying on saved sessions. Configure Supabase email authentication and redirect URLs for `http://localhost:5173/**` and your deployed site.

Start the API and web app in separate terminals from the repository root:

```bash
npm run dev:api
npm run dev:web
```

Open <http://localhost:5173>. The API health endpoint is <http://localhost:4000/api/v1/health>.

## Checks

```bash
npm run typecheck
npm test
npm run build
```

The integration tests start local HTTP and WebSocket listeners, so the environment running them must allow loopback connections. Browser-only interactions and assistive hardware still need manual checks; use `docs/accessibility-testing.md` as a checklist. Build output is generated under `apps/web/dist` and `apps/api/dist`.

## Deployment

Deploy the frontend and backend as separate services. The frontend is a static Vite site; the API must run as a persistent Node service that supports WebSocket upgrades. Build from the repository root so npm workspaces can resolve the shared package.

| Service | Build command | Start / publish |
| --- | --- | --- |
| API service | `npm ci && npm run build` | `node apps/api/dist/server.js`; set the platform port, `FRONTEND_ORIGIN`, and server environment variables above |
| Static frontend | `npm ci && npm run build:shared && npm run build:web` | Publish `apps/web/dist`; set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` at build time |

Configure the frontend host to proxy `/api/v1/*` and WebSocket upgrades at `/api/v1/live` to the API origin, or update the frontend API client to use a separately configured API origin before deploying cross-origin. Configure API CORS with the exact frontend origin, Supabase auth redirects with the deployed frontend URL, and HTTPS/WSS. Add a SPA fallback to `index.html` so direct navigation to routes such as `/demo` works.

Set production secrets in the hosting provider's secret manager. Run the database migration before enabling account persistence. Check `GET /api/v1/health` after deployment and exercise the demo, sign-in redirects, API health, and a WebSocket session against the deployed URLs. See `docs/deployment.md`, `docs/privacy-and-data.md`, and `docs/limitations.md` for additional operational detail.

## Project layout

```text
apps/api/       Express API and WebSocket server
apps/web/       React and Vite application
packages/shared Shared schemas and types
supabase/       Database migration and seed data
tests/          Unit and integration checks
docs/           Architecture, accessibility, privacy, and deployment notes
```

## Privacy and limitations

Review the implementation and Supabase policies in this repository before collecting real user data. Do not treat product goals or documentation claims as a substitute for a security, privacy, or accessibility audit. Get feedback from intended users and test with their assistive technology before any real-world use.

## License

No license file is currently included. Add a `LICENSE` file before describing this repository as MIT licensed or distributing it under another license.
