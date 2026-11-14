# Deployment guide

SenseWeave deploys as a static frontend plus a persistent API/WebSocket server. Build from the repository root so npm workspaces can build `@senseweave/shared` in the correct order.

## Before deploying

1. Create a Supabase project and configure email authentication.
2. Run `supabase/migrations/20261114000000_initial_schema.sql` in that project's SQL editor.
3. Set the Supabase site URL and allowed redirect URLs to the production frontend origin and its auth callback routes.
4. Store the Supabase URL, anon key, service-role key, and Gemini API key in the hosting provider's secret settings. Never commit real credentials. Only the Supabase anon key belongs in the frontend build.

## API service

Use a persistent Node service that supports WebSocket upgrades. From the repository root:

```bash
npm ci
npm run build
node apps/api/dist/server.js
```

Set `NODE_ENV=production`, the port supplied by the host, `FRONTEND_ORIGIN` to the exact frontend origin, and the API values shown in `.env.example`. The health route is `GET /api/v1/health`. Allow HTTP requests and WebSocket upgrades to `/api/v1/live`.

## Frontend

Build the static app from the repository root:

```bash
npm ci
npm run build:shared
npm run build:web
```

Publish `apps/web/dist`. Provide `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` when building. Configure SPA fallback to `index.html` for client routes.

The current API client uses relative `/api/v1` URLs and the live WebSocket uses the current host. Configure the frontend host or an edge proxy to forward `/api/v1/*` and WebSocket upgrades at `/api/v1/live` to the API service. The API's CORS setting must match the browser origin. Use HTTPS/WSS in production.

## Verify the release

- Open `/demo` directly and exercise playback, next step, reset, scenario selection, and each output toggle.
- Check `GET /api/v1/health` through the public frontend origin.
- Test sign-in redirects and password reset using the configured Supabase project.
- Start and stop a live session, verify camera and microphone controls and WebSocket events, and check the recap and saved-session flow.
- Confirm keyboard navigation and screen-reader output with the project's accessibility checklist in `accessibility-testing.md`.

The live service stores sessions in process memory; plan for a single API instance unless session state is moved to shared storage. Read `privacy-and-data.md` and `limitations.md` before collecting real user data or describing the prototype as a safety aid.
