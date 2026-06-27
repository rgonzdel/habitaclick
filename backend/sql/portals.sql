-- Ejecutar en el SQL Editor de Supabase Dashboard

CREATE TABLE IF NOT EXISTS portal_credentials (
  id BIGSERIAL PRIMARY KEY,
  user_email TEXT NOT NULL,
  portal TEXT NOT NULL,
  api_key TEXT DEFAULT '',
  api_secret TEXT DEFAULT '',
  enabled BOOLEAN DEFAULT true,
  feed_token TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_email, portal)
);

CREATE TABLE IF NOT EXISTS property_portals (
  id BIGSERIAL PRIMARY KEY,
  property_id BIGINT NOT NULL,
  portal TEXT NOT NULL,
  status TEXT DEFAULT 'inactive',
  last_synced TIMESTAMPTZ,
  error_msg TEXT,
  UNIQUE(property_id, portal)
);
