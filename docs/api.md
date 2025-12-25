# Pulsetter API Usage

Base URL: `http://localhost:4000/api/v1` (set `VITE_API_BASE` for frontend).

## Auth
- `POST /auth/login` – `{ email, password }` → `{ token, role, client_id }`
  - Roles: `admin`, `internal`, `client`.
  - Include token in `Authorization: Bearer <token>` for protected routes.

## Overview
- `GET /overview/summary` (admin/internal) – counts: clients, campaigns, leads, active/paused/completed.

## Clients
- `GET /clients` (admin/internal)
- `POST /clients` (admin/internal) – create client.
- `POST /clients/:clientId/assign-campaigns` (admin/internal) – fuzzy assign campaigns to client (placeholder).

## Campaigns
- `GET /campaigns?status=&provider=` (admin/internal/client scoped)
- `GET /campaigns/:id` (scoped)
- `POST /campaigns/sync?provider=smartlead|instantly` (admin/internal) – trigger provider sync (placeholder logic).

## Auth
- `POST /auth/login` – `{ email, password }` → `{ token, role, client_id, name }`
  - Include `Authorization: Bearer <token>` on protected routes.

## Clients
- `GET /clients` – list clients (admin/internal).
  - `curl -H "Authorization: Bearer $TOKEN" http://localhost:4000/api/v1/clients`
- `POST /clients` – create client.
  - Body: `{ "name": "...", "contact_email": "...", "campaign_keyword": "...", "smartlead_api_key": "...", "instantly_api_token": "...", "login_password": "..." }` (provider creds optional; login password creates a client user with contact_email).
  - `curl -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{...}' http://localhost:4000/api/v1/clients`
- `PATCH /clients/:clientId` – update fields (name, contact_email, campaign_keyword, creds).
  - `curl -X PATCH -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{...}' http://localhost:4000/api/v1/clients/<id>`
- `DELETE /clients/:clientId` – delete client (fails if linked data).
- `GET /clients/:clientId/campaigns` – campaigns matched by keywords/client_id (admin/internal).
- `POST /clients/:clientId/assign-campaigns` – fuzzy assignment placeholder.

## Campaigns
- `GET /campaigns?status=&provider=` – list campaigns (role scoped; client sees own).
  - `curl -H "Authorization: Bearer $TOKEN" http://localhost:4000/api/v1/campaigns`
- `GET /campaigns/:id` – campaign detail.
- `POST /campaigns/sync?provider=smartlead|instantly` – trigger provider sync (admin/internal; uses stored creds).
  - `curl -X POST -H "Authorization: Bearer $TOKEN" http://localhost:4000/api/v1/campaigns/sync`

## Quick token for curl
- Get token (example admin user):
```
TOKEN=$(curl -s -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pulsetter.local","password":"changeme123"}' | jq -r .token)
```
- Use it:
```
curl -H "Authorization: Bearer $TOKEN" http://localhost:4000/api/v1/clients
```

## Leads
- `GET /leads?domain=&company=` – list leads (scoped).
- `GET /leads/:id` – lead detail (scoped).
- `GET /lead-lookup?first_name=&last_name=&domain=&company=&linkedin_url=` – search (admin/internal).
- `POST /leads` – insert lead (admin/internal). Body supports first_name, last_name, email, domain, company_name, job_title, location, linkedin_url, client_id (client role auto-scoped).
  - `curl -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{...}' http://localhost:4000/api/v1/leads`

## Analytics
- `GET /analytics/summary?campaign_id=` – snapshots (scoped).
- `GET /analytics/daily?campaign_id=` – daily view (scoped).

## Users
- `GET /users` – list users (admin).
- `POST /users` – create user (admin) `{ email, name, password, role, client_id }`.
- `PATCH /users/:id` – update email/name/role/client/password (admin).
- `DELETE /users/:id` – delete user (admin).

## Provider Credentials
- `POST /provider-credentials` – store per client/user `{ provider, owner_type, owner_id, api_key, access_token, label, priority, is_active }`.
- `GET /provider-credentials/:provider` – fetch latest active for provider (admin/internal).
- `GET /provider-credentials/summary/all` – summary counts of org/owner creds (admin/internal).
- `POST /org-credentials` – store org-level creds `{ provider, api_key, access_token, label, priority, is_active }`.
- `GET /org-credentials/:provider` – fetch org cred (admin).

## Overview
- `GET /overview/summary` – counts of clients, campaigns (by status), leads, users (admin/internal).

## Health
- `GET /health` – basic health check.

## Analytics
- `GET /analytics/summary?campaign_id=` (scoped)
- `GET /analytics/daily?campaign_id=` (scoped)

## Users
- `GET /users` (admin)
- `POST /users` (admin) – `{ email, password, role, client_id }`
- `PATCH /users/:id` (admin) – update email/role/client assignment/password.

## Provider Credentials
- Per client/user: `POST /provider-credentials` (admin/internal) – `{ provider, owner_type, owner_id, api_key, access_token, label, priority, is_active }`
- Org/global: `POST /org-credentials` (admin) – `{ provider, api_key, access_token, label, priority, is_active }`

## Health
- `GET /health` – basic health check.

## Notes
- Client role is scoped to their `client_id` on campaign/lead queries.
- SmartLead/Instantly integrations use per-client creds when present, otherwise org creds, otherwise env defaults.
