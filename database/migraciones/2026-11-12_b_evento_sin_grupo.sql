-- PASO 2 (después de que la versión nueva ya esté publicada): los eventos dejan de pertenecer a un grupo.
-- Ejecutar una sola vez.
ALTER TABLE evento DROP FOREIGN KEY fk_evento_grupo;
ALTER TABLE evento DROP COLUMN id_grupo;
ALTER TABLE evento COMMENT = 'Actividades de la misión, independientes de los grupos; pueden tener ubicación en el mapa';
