-- Separa a los discípulos del equipo (Pastor, Asistente pastoral, Discipulador).
-- El equipo es quien tiene un rol vigente en persona_rol; quien lidera un grupo debe ser del equipo.
-- Esta migración da el rol "Discipulador" (sin acceso a la aplicación) a quien hoy lidera un grupo y no tiene rol.
-- Haz antes un respaldo (mysqldump). Es segura de repetir: no duplica roles.
INSERT INTO persona_rol (id_persona, id_rol, fecha_inicio)
SELECT DISTINCT p.id_persona, (SELECT id_rol FROM rol WHERE nombre = 'Discipulador'), CURDATE()
FROM persona p
JOIN grupo g ON g.activo = 1 AND g.id_lider = p.id_persona
WHERE p.activo = 1
  AND NOT EXISTS (SELECT 1 FROM persona_rol pr WHERE pr.id_persona = p.id_persona AND pr.activo = 1);
