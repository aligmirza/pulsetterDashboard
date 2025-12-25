# Outreach Dashboard Requirements

## Goals
- Centralize SmartLead, Instantly, and Clay outreach data under `portal.pulsetter.com`.
- Provide secure client and internal views for campaigns, leads, analytics, and API usage.
- Persist enriched leads and campaign metrics to avoid repeat enrichment and enable historical analysis.

## User Roles & RBAC
- **Admin**: full access to all resources, user/role management, settings.
- **Internal User**: manage clients and campaigns; view all data; no user/role admin.
- **Client**: authenticated client-specific portal; can view only their campaigns and leads; cannot modify other clients’ data or export outside allowed scope.
- Enforce JWT-based authentication (or third-party IdP). Include role and client_id in claims. Middleware must scope queries by role and client ownership. Optional MFA for Admin.

## Navigation & UX
- Persistent sidebar: Overview, Clients, Campaigns, Leads-Lookup, API Usage & Docs, Users-Roles, Settings-Integrations.
- Top bar: user info, notifications.
- Client portal: dedicated login and restricted views; campaign status tabs (All, Active, Paused/Stopped, Completed); metrics (sent, opens, replies, bounces, unsubscribes, rates); drill-down to leads (name, email, company, domain, job title, LinkedIn, status).
- Tables with sorting, filtering, pagination; color-coded status indicators. Charts for trends (daily opens, replies, bounce rates).

## Data Model (PostgreSQL suggested)
- **clients**: id, name, contact info, created_at, updated_at.
- **campaigns**: id, provider (`smartlead|instantly`), external_id, name, status, schedule, client_id FK, evergreen flag, created_at, updated_at.
- **leads**: id, first_name, last_name, email, domain, company_name, job_title, location, linkedin_url, enrichment_data (JSONB), created_at, updated_at.
- **campaign_leads**: id, campaign_id FK, lead_id FK, status (started|in_progress|completed|blocked|bounced|unsubscribed), sent_count, open_count, click_count, reply_count, bounce_count, unsubscribed_at, last_activity_at.
- **analytics_snapshots**: id, campaign_id FK, snapshot_date, sent, opens, clicks, replies, bounces, unsubscribes, opportunities, meeting_booked, created_at.
- **users**: id, email, password_hash, role, client_id (nullable), created_at, updated_at.
- **api_keys / tokens** (if needed for lead lookup API), rate limit fields.
- Indexes on email, domain, company_name, campaign_id/client_id foreign keys.

## External Integrations
- **SmartLead API** (base `https://server.smartlead.ai/api/v1`, query param `api_key`):
  - Rate limit 10 requests / 2 seconds; add retry/queue with backoff.
  - List campaigns: `GET /campaigns`.
  - Campaign by ID: `GET /campaigns/{id}`.
  - Create campaign: `POST /campaigns/create`.
  - Update schedule: `POST /campaigns/{id}/schedule`.
  - Campaign analytics: `GET /campaigns/{id}/analytics`.
  - Campaign statistics (per lead): `GET /campaigns/{id}/statistics?offset&limit`.
  - Analytics by date (<=30 days): `GET /campaigns/{id}/analytics-by-date?start_date&end_date`.
  - Lead operations: `POST /campaigns/{id}/leads` (up to 100 per call); lead statuses include STARTED, COMPLETED, BLOCKED, INPROGRESS.
- **Instantly API v2** (base `https://api.instantly.ai/api/v2`, header `Authorization: Bearer <token>`):
  - Pagination via `limit` and `starting_after`.
  - List campaigns: `GET /campaigns` with filters `status`, `search`, `tag_ids`, `ai_sdr_id`.
  - Campaign details: `GET /campaigns/{id}`.
  - Analytics: `GET /campaigns/analytics` (ids, start/end date, exclude_total_leads_count).
  - Analytics overview: `GET /campaigns/analytics/overview`.
  - Daily analytics: `GET /campaigns/analytics/daily`.
  - Steps analytics: `GET /campaigns/analytics/steps`.
  - Search campaigns by lead: `GET /campaigns/search-by-contact`.
  - Lead endpoints: create leads `POST /leads`, batch fetch `POST /leads/list`, single lead `GET /leads/{id}`.
- **Clay**: enrich leads with job title, company, location, LinkedIn URL, etc.; persist enrichment results to avoid repurchase.

## Core Features
- Client management: add clients; auto-assign campaigns by fuzzy matching campaign name to client name (case-insensitive). Manual assignment override.
- Campaign sync: fetch campaigns from SmartLead and Instantly; store provider + external_id to prevent duplicates; support status filtering (Active, Paused/Stopped, Completed).
- Analytics: fetch and store metrics (sent, opens, replies, bounces, unsubscribes, opportunities, booked meetings). Maintain daily snapshots for trending.
- Lead storage: persist enriched leads and their campaign associations; cache per-lead stats when viewed.
- Client portal access control: filter all data by client_id; prevent cross-client lead visibility/export.
- Lead lookup API: authenticated and rate-limited endpoint to search by first name, last name, domain, company name, LinkedIn URL; return matching leads and associated campaigns.
- Navigation sections: Overview, Clients, Campaigns, Leads-Lookup, API Usage & Docs, Users-Roles, Settings-Integrations.

## Optional Features
- Exports: CSV/Excel export for campaigns or leads respecting permissions.
- Notifications: email/Slack alerts for thresholds (e.g., bounce rate >5%, reply rate <1%, campaign completed, lead replies).
- Calendar integrations: create events in Google/Outlook when replies indicate meetings booked.
- Webhooks: configurable per client for events (new lead enriched, campaign paused, analytics threshold crossed).

## Synchronization & Jobs
- Scheduled sync (e.g., cron/queue worker):
  - Fetch campaigns from providers; upsert by provider+external_id; reconcile status.
  - Pull analytics and write to `analytics_snapshots`; update campaign aggregates.
  - Optionally sync per-lead stats on demand and cache.
- Rate limiting:
  - SmartLead: enqueue calls to respect 10 requests / 2s.
  - Instantly: honor pagination using `starting_after`; throttle if provider limits observed.
- Enrichment flow:
  - When new leads added, trigger Clay enrichment; update lead record and campaign_leads metrics.

## API Surface (internal/backend)
- Auth: `POST /auth/login` returns JWT with role/client_id.
- Clients: CRUD (Admin/Internal).
- Campaigns: list/filter by status/provider/client; detail; assign to client; export (optional).
- Leads: list/search; detail; enrich status; optional export.
- Analytics: campaign summary; per-day snapshots; per-lead stats (cached).
- Lead lookup: `GET /lead-lookup` with filters (first_name, last_name, domain, company, linkedin_url); authenticated + rate-limited.
- Users/Roles: manage users and role assignments (Admin only).
- Webhooks/Notifications: register endpoints and thresholds (optional).

## Security & Compliance
- JWT validation middleware; short-lived tokens with refresh; secure password hashing.
- Enforce per-role authorization checks on every route and query; client scoping by client_id.
- Audit logging for admin actions and data exports.
- Rate limit public APIs (lead lookup) and protect with API keys or JWT.
- Store secrets via environment variables; rotate API keys; HTTPS everywhere (Nginx reverse proxy + SSL).

## Frontend Notes
- SPA (React/Vue/Angular) with client-side routing for sidebar sections.
- Responsive design; tables with pagination, sorting, filters, status badges.
- Charts (Chart.js/ECharts) for daily metrics and rates.
- Client portal variants: only permitted data shown; hide admin-only nav items.

## Testing & QA
- Unit and integration tests for authentication, RBAC middleware, DB models, provider service classes, and scheduled jobs.
- Contract tests for SmartLead/Instantly service wrappers (mocks).
- End-to-end smoke tests for client portal visibility and lead lookup API authorization.
- Manual UI checks for role-based navigation and data scoping.

## Deployment & Ops
- Containerized deployment (e.g., Docker) behind Nginx reverse proxy on VPS; domain `portal.pulsetter.com`.
- Environment configuration for DB, JWT secret, SmartLead/Instantly/Clay credentials.
- Scheduled tasks for sync jobs; monitoring/alerts on failures and API rate-limit responses.
- Backups for database; migration tooling for schema changes.
