-- Ejecutar en Supabase Dashboard > SQL Editor
-- Corrige el tipo de property_id de BIGINT a UUID

DROP TABLE IF EXISTS property_portals;

CREATE TABLE property_portals (
  id BIGSERIAL PRIMARY KEY,
  property_id UUID NOT NULL,
  portal TEXT NOT NULL,
  status TEXT DEFAULT 'inactive',
  last_synced TIMESTAMPTZ,
  error_msg TEXT,
  UNIQUE(property_id, portal)
);
