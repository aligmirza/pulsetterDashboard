# Pulsetter Outreach Dashboard (API Scaffold)

Opinionated MVC-style Express scaffold for the outreach dashboard at `portal.pulsetter.com`. It wires the main API surface, provider service wrappers, RBAC middleware, job hooks, and sample SQL schema so you can iterate quickly.

## Stack
- Node.js 18+, Express, JWT auth, Pino logging, PG driver.
- Providers: SmartLead, Instantly, Clay (placeholders ready for real logic).

## Structure
- `src/index.js` – server bootstrap.
- `src/app.js` – Express app and middleware.
- `src/config/` – environment config.
- `src/routes/v1/` – versioned routes per resource.
- `src/controllers/` – request handlers.
- `src/services/clients/` – business logic for clients/campaigns/leads/analytics/users.
- `src/services/providers/` – API wrappers for SmartLead/Instantly/Clay.
- `src/models/` – entity shapes.
- `src/db/` – PG pool helper.
- `src/middleware/` – auth/RBAC, rate limits, error handler.
- `src/jobs/` – background sync hooks.
- `config/schema.sql` – starter database schema.
- `docs/requirements.md` – product requirements.

## Quickstart
1) Copy `.env.example` to `.env` and set secrets (DB, JWT, provider keys).
2) Install deps: `npm install`.
3) Apply schema: `psql $DATABASE_URL -f config/schema.sql`.
4) Seed an admin user: `npm run seed:admin` (prompts for email/password).
5) Run dev server: `npm run dev` (listens on `PORT`).
6) Hit `GET /api/v1/health` to verify.
7) Frontend (React via Vite): `cd frontend && npm install && npm run dev` (defaults to API `http://localhost:4000/api/v1`, configurable via `VITE_API_BASE`). Visit `http://localhost:5173/login`.

## Routes (v1)
- `POST /api/v1/auth/login` – login returning JWT (token persists until you log out/switch users).
- `GET/POST/PATCH/DELETE /api/v1/clients` – clients CRUD; keywords + optional provider creds + portal password create a client user.
- `GET /api/v1/clients/:id/campaigns` – matched campaigns by keyword/client.
- `POST /api/v1/clients/:clientId/assign-campaigns` – fuzzy assignment placeholder.
- `GET /api/v1/campaigns` – list campaigns; `GET /api/v1/campaigns/:id`; `POST /api/v1/campaigns/sync?provider=smartlead|instantly`.
- `GET/POST/DELETE/PATCH /api/v1/users` – user management (admin).
- `GET /api/v1/leads`, `GET /api/v1/leads/:id`, `GET /api/v1/lead-lookup`, `POST /api/v1/leads` (insert lead).
- `GET /api/v1/analytics/summary`, `GET /api/v1/analytics/daily`.
- `GET/POST /api/v1/provider-credentials` plus `GET /api/v1/provider-credentials/summary/all`; `GET/POST /api/v1/org-credentials`.
- `GET /api/v1/overview/summary`.

## Frontend notes
- Dashboard shell with sidebar/topbar, login page, Overview stats, Campaigns, Leads Lookup, Users, Settings/Integrations, and API Docs.
- Configure API base via `VITE_API_BASE` (default `http://localhost:4000/api/v1`).
- Auth guard requires login; token persists in localStorage and is reused unless you log out or change users.
- Clients page supports creating/updating clients, attaching SmartLead/Instantly creds, and creating a portal login password (using the contact email).
- API Usage page lists all endpoints and shows your session token with a copy button; includes curl examples.
- UI optimized for full-width layout, responsive breakpoints, status pills, and toasts for feedback.

## Additional docs
- Backend/API reference: `docs/api.md` (endpoints, usage, curl examples, token capture).
- Frontend overview: `docs/frontend.md` (pages, data flow, styling notes).

## API docs
- See `docs/api.md` for endpoint reference and usage.

## MVC Notes
- Controllers stay thin; services hold business logic; models represent data shapes; routes remain versioned.
- RBAC: `authorize('admin', 'internal', 'client')` enforces roles and client scoping in services.
- Rate limiting: `apiRateLimiter` applies globally under `/api`; tune via env.

## Auth basics
- Login via `POST /api/v1/auth/login` with JSON `{ "email": "", "password": "" }`.
- Tokens embed `id`, `email`, `role`, and `client_id`; 1 hour expiry by default.
- Admins can create users via `POST /api/v1/users` with `{ email, password, role, client_id }`.

## Multi-tenant provider credentials
- Default env keys live in `.env`.
- Per-client/per-user credentials: `POST /api/v1/provider-credentials` with `provider`, `owner_type`, `owner_id`, optional `label`, `priority`, `is_active`.
- Org/global credentials: `POST /api/v1/org-credentials` with `provider`, optional `label`, `priority`, `is_active`.
- Sync order: owner-scoped active credential (highest priority), then org credential, then env default. Multiple SmartLead/Instantly keys are supported via labels and priority.

## Next Steps
- Flesh out provider services with pagination, rate limits, retries, and error handling.
- Implement real auth (password hashing, refresh tokens), user storage, and migration tooling.
- Add queue/scheduler (e.g., Bull/Agenda) in `src/jobs` for sync + alerts.
- Expand tests in `test/` and add lint config per AirBnB base.
