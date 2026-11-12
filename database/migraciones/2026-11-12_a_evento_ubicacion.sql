-- PASO 1 (antes de subir la versión nueva): agrega la ubicación opcional en el mapa a los eventos.
-- Es solo aditivo: la versión anterior de la aplicación sigue funcionando.
-- Haz antes un respaldo (mysqldump). Ejecutar una sola vez.
ALTER TABLE evento
  ADD COLUMN latitud  DECIMAL(10,7) NULL AFTER publico_objetivo,
  ADD COLUMN longitud DECIMAL(10,7) NULL AFTER latitud,
  ADD CONSTRAINT ck_evento_latitud   CHECK (latitud  IS NULL OR latitud  BETWEEN -90  AND 90),
  ADD CONSTRAINT ck_evento_longitud  CHECK (longitud IS NULL OR longitud BETWEEN -180 AND 180),
  ADD CONSTRAINT ck_evento_ubicacion CHECK ((latitud IS NULL) = (longitud IS NULL));
