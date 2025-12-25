-- Minimal schema sketch for outreach dashboard
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  contact_email TEXT,
  campaign_keyword TEXT,
  contact_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  external_id TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT,
  schedule JSONB,
  client_id UUID REFERENCES clients(id),
  evergreen BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (provider, external_id)
);

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  domain TEXT,
  company_name TEXT,
  job_title TEXT,
  location TEXT,
  linkedin_url TEXT,
  enrichment_data JSONB,
  client_id UUID REFERENCES clients(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS campaign_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id),
  lead_id UUID REFERENCES leads(id),
  status TEXT,
  sent_count INT DEFAULT 0,
  open_count INT DEFAULT 0,
  click_count INT DEFAULT 0,
  reply_count INT DEFAULT 0,
  bounce_count INT DEFAULT 0,
  unsubscribed_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (campaign_id, lead_id)
);

CREATE TABLE IF NOT EXISTS provider_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  owner_type TEXT NOT NULL DEFAULT 'client', -- e.g., client, user
  owner_id UUID, -- references client/user id depending on owner_type
  label TEXT NOT NULL DEFAULT 'default',
  api_key TEXT,
  access_token TEXT,
  metadata JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  priority INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (provider, owner_type, owner_id, label)
);

CREATE TABLE IF NOT EXISTS org_provider_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT 'default',
  api_key TEXT,
  access_token TEXT,
  metadata JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  priority INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (provider, label)
);

CREATE TABLE IF NOT EXISTS analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id),
  snapshot_date DATE NOT NULL,
  sent INT DEFAULT 0,
  opens INT DEFAULT 0,
  clicks INT DEFAULT 0,
  replies INT DEFAULT 0,
  bounces INT DEFAULT 0,
  unsubscribes INT DEFAULT 0,
  opportunities INT DEFAULT 0,
  meeting_booked INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (campaign_id, snapshot_date)
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL,
  client_id UUID REFERENCES clients(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS leads_email_idx ON leads(email);
CREATE INDEX IF NOT EXISTS leads_domain_idx ON leads(domain);
CREATE INDEX IF NOT EXISTS leads_company_idx ON leads(company_name);
CREATE INDEX IF NOT EXISTS campaign_leads_campaign_idx ON campaign_leads(campaign_id);
CREATE INDEX IF NOT EXISTS campaign_leads_lead_idx ON campaign_leads(lead_id);
