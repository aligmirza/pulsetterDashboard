# Frontend Overview

Stack: React + Vite, React Router, Context for auth/data/toasts, lazy-loaded pages, and cached fetches for clients/campaigns.

## Pages
- Login: authenticates and persists JWT in localStorage; guards routes.
- Overview: stats (clients/campaigns/leads/users) and client campaign listings with status filters.
- Campaigns: list campaigns with status/provider filters (uses cached fetch, refresh button).
- Clients: create/update clients, attach SmartLead/Instantly creds, set portal password (contact email used for login). View/edit/delete clients; view matched campaigns by keyword/client_id.
- Leads Lookup: search by name/domain/company/LinkedIn (admin/internal).
- Users: create/update/delete users with roles/client assignment.
- Settings/Integrations: store provider creds and see usage summary.
- API Usage & Docs: endpoint list, your current token with copy button, curl examples.

## Configuration
- API base: `VITE_API_BASE` (default `http://localhost:4000/api/v1`).
- Token reuse: stays until logout or switching user; shown on API page.

## UX
- Full-width layout with responsive sidebar/content, status pills, toasts for success/error, and delete confirmations.
- Forms include inline validation; client form requires contact email and portal password to create client login.
- Lazy loading for heavier pages; cached client/campaign fetches in `DataContext` with debounced campaign loads.
