-- Añade la columna storage_path a property_photos
-- Necesaria para poder borrar archivos de Supabase Storage correctamente
ALTER TABLE property_photos
  ADD COLUMN IF NOT EXISTS storage_path TEXT;
