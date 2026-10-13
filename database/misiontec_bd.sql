SET NAMES utf8mb4 COLLATE utf8mb4_spanish_ci;
DROP DATABASE IF EXISTS misiontec;
CREATE DATABASE misiontec
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_spanish_ci;
USE misiontec;

CREATE TABLE distrito (
  id_distrito     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre          VARCHAR(100) NOT NULL,
  descripcion     VARCHAR(255) NULL,
  activo          TINYINT(1) NOT NULL DEFAULT 1,
  CONSTRAINT uq_distrito_nombre UNIQUE (nombre)
) ENGINE=InnoDB COMMENT='Distritos en que se organiza la misión';

CREATE TABLE zona (
  id_zona         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_distrito     INT UNSIGNED NOT NULL,
  nombre          VARCHAR(100) NOT NULL,
  activo          TINYINT(1) NOT NULL DEFAULT 1,
  CONSTRAINT uq_zona_distrito UNIQUE (id_distrito, nombre),
  CONSTRAINT fk_zona_distrito FOREIGN KEY (id_distrito)
    REFERENCES distrito (id_distrito) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB COMMENT='Zonas territoriales de cada distrito';

CREATE TABLE fase_discipulado (
  id_fase         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre          VARCHAR(50)  NOT NULL,
  orden           TINYINT UNSIGNED NOT NULL,
  descripcion     VARCHAR(255) NULL,
  activo          TINYINT(1) NOT NULL DEFAULT 1,
  CONSTRAINT uq_fase_nombre UNIQUE (nombre),
  CONSTRAINT uq_fase_orden  UNIQUE (orden)
) ENGINE=InnoDB COMMENT='Etapas del proceso de discipulado';

CREATE TABLE rol (
  id_rol          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre          VARCHAR(50)  NOT NULL,
  descripcion     VARCHAR(255) NULL,
  nivel_jerarquia TINYINT UNSIGNED NOT NULL COMMENT '1 = mayor autoridad',
  activo          TINYINT(1) NOT NULL DEFAULT 1,
  CONSTRAINT uq_rol_nombre UNIQUE (nombre)
) ENGINE=InnoDB COMMENT='Roles ministeriales y del sistema';

CREATE TABLE permiso (
  id_permiso      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  codigo          VARCHAR(50)  NOT NULL,
  descripcion     VARCHAR(255) NOT NULL,
  modulo          VARCHAR(50)  NOT NULL,
  CONSTRAINT uq_permiso_codigo UNIQUE (codigo)
) ENGINE=InnoDB COMMENT='Acciones que se pueden autorizar';

CREATE TABLE rol_permiso (
  id_rol          INT UNSIGNED NOT NULL,
  id_permiso      INT UNSIGNED NOT NULL,
  PRIMARY KEY (id_rol, id_permiso),
  CONSTRAINT fk_rp_rol FOREIGN KEY (id_rol)
    REFERENCES rol (id_rol) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_rp_permiso FOREIGN KEY (id_permiso)
    REFERENCES permiso (id_permiso) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Relación N:M entre roles y permisos';

CREATE TABLE persona (
  id_persona          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  codigo              VARCHAR(20)  NOT NULL,
  tipo_documento      ENUM('CC','TI','CE','PA','RC') NOT NULL DEFAULT 'CC',
  numero_documento    VARCHAR(20)  NOT NULL,
  nombres             VARCHAR(80)  NOT NULL,
  apellidos           VARCHAR(80)  NOT NULL,
  fecha_nacimiento    DATE NULL,
  genero              ENUM('M','F') NULL,
  telefono            VARCHAR(20)  NULL,
  correo              VARCHAR(120) NULL,
  direccion           VARCHAR(150) NULL,
  barrio              VARCHAR(80)  NULL,
  id_grupo            INT UNSIGNED NULL,
  id_mentor           INT UNSIGNED NULL COMMENT 'Discipulador que acompaña a la persona',
  id_fase             INT UNSIGNED NOT NULL,
  fecha_ingreso       DATE NOT NULL,
  notas_criticas      TEXT NULL,
  autoriza_datos      TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Autorización Ley 1581 de 2012',
  fecha_autorizacion  DATETIME NULL,
  activo              TINYINT(1) NOT NULL DEFAULT 1,
  fecha_creacion      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_persona_codigo    UNIQUE (codigo),
  CONSTRAINT uq_persona_documento UNIQUE (tipo_documento, numero_documento),
  CONSTRAINT uq_persona_correo    UNIQUE (correo),
  CONSTRAINT ck_persona_correo    CHECK (correo IS NULL OR correo LIKE '%_@_%._%'),
  CONSTRAINT fk_persona_mentor FOREIGN KEY (id_mentor)
    REFERENCES persona (id_persona) ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_persona_fase FOREIGN KEY (id_fase)
    REFERENCES fase_discipulado (id_fase) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB COMMENT='Miembros y participantes de la misión';

CREATE TABLE grupo (
  id_grupo        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  codigo          VARCHAR(20)  NOT NULL,
  nombre          VARCHAR(100) NOT NULL,
  id_zona         INT UNSIGNED NOT NULL,
  id_lider        INT UNSIGNED NULL,
  id_asistente    INT UNSIGNED NULL,
  direccion       VARCHAR(150) NOT NULL,
  barrio          VARCHAR(80)  NULL,
  latitud         DECIMAL(10,7) NOT NULL,
  longitud        DECIMAL(10,7) NOT NULL,
  dia_reunion     ENUM('Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo') NOT NULL,
  hora_reunion    TIME NOT NULL,
  estado          ENUM('activo','observacion','inactivo') NOT NULL DEFAULT 'activo',
  fecha_apertura  DATE NOT NULL,
  activo          TINYINT(1) NOT NULL DEFAULT 1,
  CONSTRAINT uq_grupo_codigo UNIQUE (codigo),
  CONSTRAINT ck_grupo_latitud  CHECK (latitud  BETWEEN -90  AND 90),
  CONSTRAINT ck_grupo_longitud CHECK (longitud BETWEEN -180 AND 180),
  CONSTRAINT fk_grupo_zona FOREIGN KEY (id_zona)
    REFERENCES zona (id_zona) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_grupo_lider FOREIGN KEY (id_lider)
    REFERENCES persona (id_persona) ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_grupo_asistente FOREIGN KEY (id_asistente)
    REFERENCES persona (id_persona) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='Grupos misioneros / células con su geolocalización';

ALTER TABLE persona
  ADD CONSTRAINT fk_persona_grupo FOREIGN KEY (id_grupo)
    REFERENCES grupo (id_grupo) ON UPDATE CASCADE ON DELETE SET NULL;

CREATE TABLE persona_rol (
  id_persona_rol  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_persona      INT UNSIGNED NOT NULL,
  id_rol          INT UNSIGNED NOT NULL,
  fecha_inicio    DATE NOT NULL,
  fecha_fin       DATE NULL,
  activo          TINYINT(1) NOT NULL DEFAULT 1,
  CONSTRAINT uq_persona_rol UNIQUE (id_persona, id_rol, fecha_inicio),
  CONSTRAINT ck_persona_rol_fechas CHECK (fecha_fin IS NULL OR fecha_fin >= fecha_inicio),
  CONSTRAINT fk_pr_persona FOREIGN KEY (id_persona)
    REFERENCES persona (id_persona) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_pr_rol FOREIGN KEY (id_rol)
    REFERENCES rol (id_rol) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB COMMENT='Asignación histórica de roles a personas (N:M)';

CREATE TABLE etiqueta (
  id_etiqueta     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre          VARCHAR(50) NOT NULL,
  CONSTRAINT uq_etiqueta_nombre UNIQUE (nombre)
) ENGINE=InnoDB;

CREATE TABLE persona_etiqueta (
  id_persona      INT UNSIGNED NOT NULL,
  id_etiqueta     INT UNSIGNED NOT NULL,
  PRIMARY KEY (id_persona, id_etiqueta),
  CONSTRAINT fk_pe_persona FOREIGN KEY (id_persona)
    REFERENCES persona (id_persona) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_pe_etiqueta FOREIGN KEY (id_etiqueta)
    REFERENCES etiqueta (id_etiqueta) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Relación N:M entre personas y etiquetas';

CREATE TABLE usuario (
  id_usuario      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_persona      INT UNSIGNED NOT NULL,
  id_rol          INT UNSIGNED NOT NULL COMMENT 'Rol con el que opera en el sistema',
  nombre_usuario  VARCHAR(50)  NOT NULL,
  contrasena_hash VARCHAR(255) NOT NULL COMMENT 'Nunca guardar la contraseña en texto plano',
  ultimo_acceso   DATETIME NULL,
  activo          TINYINT(1) NOT NULL DEFAULT 1,
  fecha_creacion  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_usuario_nombre  UNIQUE (nombre_usuario),
  CONSTRAINT uq_usuario_persona UNIQUE (id_persona),
  CONSTRAINT fk_usuario_persona FOREIGN KEY (id_persona)
    REFERENCES persona (id_persona) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_usuario_rol FOREIGN KEY (id_rol)
    REFERENCES rol (id_rol) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB COMMENT='Cuentas de acceso al sistema (relación 1:1 con persona)';

CREATE TABLE historial_discipulado (
  id_historial    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_persona      INT UNSIGNED NOT NULL,
  id_fase         INT UNSIGNED NOT NULL,
  fecha_inicio    DATE NOT NULL,
  fecha_fin       DATE NULL,
  observaciones   VARCHAR(255) NULL,
  id_usuario      INT UNSIGNED NULL COMMENT 'Usuario que registró el cambio',
  CONSTRAINT ck_hd_fechas CHECK (fecha_fin IS NULL OR fecha_fin >= fecha_inicio),
  CONSTRAINT fk_hd_persona FOREIGN KEY (id_persona)
    REFERENCES persona (id_persona) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_hd_fase FOREIGN KEY (id_fase)
    REFERENCES fase_discipulado (id_fase) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_hd_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuario (id_usuario) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='Registro histórico del avance en las fases';

CREATE TABLE sesion_asistencia (
  id_sesion       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_grupo        INT UNSIGNED NOT NULL,
  fecha           DATE NOT NULL,
  tema            VARCHAR(150) NULL,
  id_usuario      INT UNSIGNED NULL COMMENT 'Usuario que tomó la asistencia',
  fecha_registro  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_sesion_grupo_fecha UNIQUE (id_grupo, fecha),
  CONSTRAINT fk_sesion_grupo FOREIGN KEY (id_grupo)
    REFERENCES grupo (id_grupo) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_sesion_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuario (id_usuario) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='Reunión de un grupo en una fecha';

CREATE TABLE detalle_asistencia (
  id_sesion       INT UNSIGNED NOT NULL,
  id_persona      INT UNSIGNED NOT NULL,
  estado          ENUM('presente','falta_justificada','falta_injustificada') NOT NULL,
  observacion     VARCHAR(255) NULL,
  PRIMARY KEY (id_sesion, id_persona),
  CONSTRAINT fk_da_sesion FOREIGN KEY (id_sesion)
    REFERENCES sesion_asistencia (id_sesion) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_da_persona FOREIGN KEY (id_persona)
    REFERENCES persona (id_persona) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB COMMENT='Asistencia de cada persona a una sesión';

CREATE TABLE seguimiento (
  id_seguimiento      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_persona          INT UNSIGNED NOT NULL,
  id_usuario          INT UNSIGNED NOT NULL COMMENT 'Responsable que hizo el seguimiento',
  fecha               DATETIME NOT NULL,
  canal               ENUM('llamada','visita','reunion_pastoral','mensaje_chat') NOT NULL,
  estado_pastoral     ENUM('excelente','estable','desanimado','en_crisis','necesita_oracion') NOT NULL,
  notas               TEXT NULL,
  compromisos         VARCHAR(255) NULL,
  proximo_contacto    DATE NULL,
  semaforo_resultante ENUM('verde','amarillo','rojo') NOT NULL,
  CONSTRAINT fk_seg_persona FOREIGN KEY (id_persona)
    REFERENCES persona (id_persona) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_seg_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuario (id_usuario) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB COMMENT='Contactos de acompañamiento realizados a cada persona';

CREATE TABLE evento (
  id_evento         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  titulo            VARCHAR(150) NOT NULL,
  tipo              ENUM('culto','taller','retiro','vigilia','evangelismo') NOT NULL,
  fecha             DATE NOT NULL,
  hora              TIME NOT NULL,
  lugar             VARCHAR(150) NOT NULL,
  publico_objetivo  VARCHAR(100) NULL,
  id_grupo          INT UNSIGNED NULL COMMENT 'NULL = evento general de la misión',
  id_usuario        INT UNSIGNED NULL COMMENT 'Organizador',
  estado            ENUM('programado','en_curso','concluido','cancelado') NOT NULL DEFAULT 'programado',
  activo            TINYINT(1) NOT NULL DEFAULT 1,
  CONSTRAINT fk_evento_grupo FOREIGN KEY (id_grupo)
    REFERENCES grupo (id_grupo) ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_evento_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuario (id_usuario) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='Actividades programadas por la misión';

CREATE TABLE asistencia_evento (
  id_evento       INT UNSIGNED NOT NULL,
  id_persona      INT UNSIGNED NOT NULL,
  fecha_registro  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_evento, id_persona),
  CONSTRAINT fk_ae_evento FOREIGN KEY (id_evento)
    REFERENCES evento (id_evento) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_ae_persona FOREIGN KEY (id_persona)
    REFERENCES persona (id_persona) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Personas que asistieron a cada evento (N:M)';

CREATE TABLE alerta (
  id_alerta         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tipo              ENUM('inasistencia','sin_seguimiento','grupo','discipulado') NOT NULL,
  severidad         ENUM('critica','advertencia','informativa') NOT NULL,
  titulo            VARCHAR(150) NOT NULL,
  mensaje           VARCHAR(255) NOT NULL,
  id_persona        INT UNSIGNED NULL,
  id_grupo          INT UNSIGNED NULL,
  id_usuario_destino INT UNSIGNED NULL COMMENT 'Responsable que debe atender la alerta',
  fecha_generacion  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  leida             TINYINT(1) NOT NULL DEFAULT 0,
  resuelta          TINYINT(1) NOT NULL DEFAULT 0,
  fecha_resolucion  DATETIME NULL,
  CONSTRAINT fk_alerta_persona FOREIGN KEY (id_persona)
    REFERENCES persona (id_persona) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_alerta_grupo FOREIGN KEY (id_grupo)
    REFERENCES grupo (id_grupo) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_alerta_usuario FOREIGN KEY (id_usuario_destino)
    REFERENCES usuario (id_usuario) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='Alertas generadas por inasistencias o falta de seguimiento';

CREATE TABLE auditoria (
  id_auditoria    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_usuario      INT UNSIGNED NULL,
  fecha_hora      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  accion          ENUM('INSERT','UPDATE','DESACTIVAR','DELETE','LOGIN') NOT NULL,
  tabla_afectada  VARCHAR(50) NOT NULL,
  id_registro     INT UNSIGNED NULL,
  detalle         VARCHAR(500) NULL,
  direccion_ip    VARCHAR(45) NULL,
  CONSTRAINT fk_auditoria_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuario (id_usuario) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='Bitácora de trazabilidad de cambios importantes';

CREATE INDEX ix_persona_nombre      ON persona (apellidos, nombres);
CREATE INDEX ix_persona_fase_activo ON persona (id_fase, activo);
CREATE INDEX ix_grupo_ubicacion     ON grupo (latitud, longitud);
CREATE INDEX ix_sesion_fecha        ON sesion_asistencia (fecha);
CREATE INDEX ix_seguimiento_fecha   ON seguimiento (id_persona, fecha);
CREATE INDEX ix_evento_fecha        ON evento (fecha);
CREATE INDEX ix_alerta_pendiente    ON alerta (resuelta, severidad);
CREATE INDEX ix_auditoria_fecha     ON auditoria (fecha_hora);

DELIMITER $$

CREATE FUNCTION fn_distancia_km(lat1 DECIMAL(10,7), lon1 DECIMAL(10,7),
                                lat2 DECIMAL(10,7), lon2 DECIMAL(10,7))
RETURNS DECIMAL(10,2)
DETERMINISTIC
BEGIN
  DECLARE r DOUBLE DEFAULT 6371;
  DECLARE dlat DOUBLE;
  DECLARE dlon DOUBLE;
  DECLARE a DOUBLE;
  SET dlat = RADIANS(lat2 - lat1);
  SET dlon = RADIANS(lon2 - lon1);
  SET a = SIN(dlat/2) * SIN(dlat/2)
        + COS(RADIANS(lat1)) * COS(RADIANS(lat2)) * SIN(dlon/2) * SIN(dlon/2);
  RETURN ROUND(r * 2 * ATAN2(SQRT(a), SQRT(1 - a)), 2);
END$$

CREATE PROCEDURE sp_grupos_cercanos(IN p_lat DECIMAL(10,7), IN p_lon DECIMAL(10,7),
                                    IN p_radio_km DECIMAL(6,2))
BEGIN
  SELECT g.id_grupo, g.codigo, g.nombre, g.direccion, g.barrio,
         g.dia_reunion, g.hora_reunion,
         fn_distancia_km(p_lat, p_lon, g.latitud, g.longitud) AS distancia_km
  FROM grupo g
  WHERE g.activo = 1
    AND fn_distancia_km(p_lat, p_lon, g.latitud, g.longitud) <= p_radio_km
  ORDER BY distancia_km;
END$$

CREATE PROCEDURE sp_desactivar_persona(IN p_id_persona INT UNSIGNED,
                                       IN p_id_usuario INT UNSIGNED,
                                       IN p_motivo VARCHAR(255))
BEGIN
  UPDATE persona SET activo = 0 WHERE id_persona = p_id_persona;
  INSERT INTO auditoria (id_usuario, accion, tabla_afectada, id_registro, detalle)
  VALUES (p_id_usuario, 'DESACTIVAR', 'persona', p_id_persona, p_motivo);
END$$

DELIMITER ;

CREATE VIEW vw_inasistencias_consecutivas AS
SELECT p.id_persona,
       (SELECT COUNT(*)
          FROM detalle_asistencia d
          JOIN sesion_asistencia s ON s.id_sesion = d.id_sesion
         WHERE d.id_persona = p.id_persona
           AND d.estado <> 'presente'
           AND s.fecha > COALESCE((SELECT MAX(s2.fecha)
                                     FROM detalle_asistencia d2
                                     JOIN sesion_asistencia s2 ON s2.id_sesion = d2.id_sesion
                                    WHERE d2.id_persona = p.id_persona
                                      AND d2.estado = 'presente'), '1900-01-01')
       ) AS faltas_consecutivas,
       (SELECT MAX(s3.fecha)
          FROM detalle_asistencia d3
          JOIN sesion_asistencia s3 ON s3.id_sesion = d3.id_sesion
         WHERE d3.id_persona = p.id_persona AND d3.estado = 'presente'
       ) AS ultima_asistencia
FROM persona p
WHERE p.activo = 1;

CREATE VIEW vw_semaforo_persona AS
SELECT p.id_persona,
       p.codigo,
       CONCAT(p.nombres, ' ', p.apellidos) AS nombre_completo,
       g.nombre                            AS grupo,
       f.nombre                            AS fase,
       CONCAT(m.nombres, ' ', m.apellidos) AS mentor,
       i.faltas_consecutivas,
       i.ultima_asistencia,
       MAX(sg.fecha)                       AS ultimo_seguimiento,
       DATEDIFF(CURDATE(), COALESCE(MAX(sg.fecha), p.fecha_ingreso)) AS dias_sin_contacto,
       CASE
         WHEN i.faltas_consecutivas >= 3
           OR DATEDIFF(CURDATE(), COALESCE(MAX(sg.fecha), p.fecha_ingreso)) > 30 THEN 'rojo'
         WHEN i.faltas_consecutivas = 2
           OR DATEDIFF(CURDATE(), COALESCE(MAX(sg.fecha), p.fecha_ingreso)) > 14 THEN 'amarillo'
         ELSE 'verde'
       END COLLATE utf8mb4_spanish_ci AS semaforo
FROM persona p
JOIN fase_discipulado f            ON f.id_fase = p.id_fase
JOIN vw_inasistencias_consecutivas i ON i.id_persona = p.id_persona
LEFT JOIN grupo g                  ON g.id_grupo = p.id_grupo
LEFT JOIN persona m                ON m.id_persona = p.id_mentor
LEFT JOIN seguimiento sg           ON sg.id_persona = p.id_persona
WHERE p.activo = 1
GROUP BY p.id_persona, p.codigo, p.nombres, p.apellidos, g.nombre, f.nombre,
         m.nombres, m.apellidos, i.faltas_consecutivas, i.ultima_asistencia, p.fecha_ingreso;

CREATE VIEW vw_indicadores_grupo AS
SELECT g.id_grupo,
       g.codigo,
       g.nombre,
       z.nombre AS zona,
       d.nombre AS distrito,
       CONCAT(l.nombres, ' ', l.apellidos) AS lider,
       g.estado,
       (SELECT COUNT(*) FROM persona p WHERE p.id_grupo = g.id_grupo AND p.activo = 1) AS total_miembros,
       (SELECT COUNT(*) FROM sesion_asistencia s WHERE s.id_grupo = g.id_grupo) AS total_sesiones,
       (SELECT ROUND(100 * SUM(da.estado = 'presente') / NULLIF(COUNT(*), 0), 1)
          FROM detalle_asistencia da
          JOIN sesion_asistencia s ON s.id_sesion = da.id_sesion
         WHERE s.id_grupo = g.id_grupo) AS porcentaje_asistencia
FROM grupo g
JOIN zona z      ON z.id_zona = g.id_zona
JOIN distrito d  ON d.id_distrito = z.id_distrito
LEFT JOIN persona l ON l.id_persona = g.id_lider
WHERE g.activo = 1;

CREATE VIEW vw_personas_por_fase AS
SELECT f.orden, f.nombre AS fase, COUNT(p.id_persona) AS total_personas
FROM fase_discipulado f
LEFT JOIN persona p ON p.id_fase = f.id_fase AND p.activo = 1
GROUP BY f.id_fase, f.orden, f.nombre;

CREATE VIEW vw_dashboard AS
SELECT
  (SELECT COUNT(*) FROM persona WHERE activo = 1)                          AS personas_activas,
  (SELECT COUNT(*) FROM grupo   WHERE activo = 1)                          AS grupos_activos,
  (SELECT ROUND(AVG(porcentaje_asistencia), 1) FROM vw_indicadores_grupo)  AS asistencia_promedio,
  (SELECT COUNT(*) FROM vw_semaforo_persona WHERE semaforo = 'rojo')       AS personas_en_rojo,
  (SELECT COUNT(*) FROM vw_semaforo_persona WHERE semaforo = 'amarillo')   AS personas_en_amarillo,
  (SELECT COUNT(*) FROM alerta WHERE resuelta = 0)                         AS alertas_pendientes,
  (SELECT COUNT(*) FROM persona
    WHERE activo = 1 AND fecha_ingreso >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)) AS nuevos_ultimos_90_dias,
  (SELECT COUNT(*) FROM evento
    WHERE activo = 1 AND estado = 'programado' AND fecha >= CURDATE())     AS eventos_proximos;

DELIMITER $$
CREATE PROCEDURE sp_generar_alertas()
BEGIN
  INSERT INTO alerta (tipo, severidad, titulo, mensaje, id_persona, id_grupo, id_usuario_destino)
  SELECT 'inasistencia',
         IF(s.faltas_consecutivas >= 3, 'critica', 'advertencia'),
         CONCAT('Inasistencias consecutivas: ', s.nombre_completo),
         CONCAT('Registra ', s.faltas_consecutivas, ' faltas seguidas en su grupo.'),
         p.id_persona, p.id_grupo, u.id_usuario
  FROM vw_semaforo_persona s
  JOIN persona p      ON p.id_persona = s.id_persona
  LEFT JOIN usuario u ON u.id_persona = p.id_mentor
  WHERE s.faltas_consecutivas >= 2
    AND NOT EXISTS (SELECT 1 FROM alerta a
                     WHERE a.id_persona = p.id_persona
                       AND a.tipo = 'inasistencia' AND a.resuelta = 0);

  INSERT INTO alerta (tipo, severidad, titulo, mensaje, id_persona, id_grupo, id_usuario_destino)
  SELECT 'sin_seguimiento',
         IF(s.dias_sin_contacto > 30, 'critica', 'advertencia'),
         CONCAT('Seguimiento pendiente: ', s.nombre_completo),
         CONCAT('Lleva ', s.dias_sin_contacto, ' días sin seguimiento registrado.'),
         p.id_persona, p.id_grupo, u.id_usuario
  FROM vw_semaforo_persona s
  JOIN persona p      ON p.id_persona = s.id_persona
  LEFT JOIN usuario u ON u.id_persona = p.id_mentor
  WHERE s.dias_sin_contacto > 14
    AND NOT EXISTS (SELECT 1 FROM alerta a
                     WHERE a.id_persona = p.id_persona
                       AND a.tipo = 'sin_seguimiento' AND a.resuelta = 0);
END$$
DELIMITER ;

DELIMITER $$

CREATE TRIGGER trg_persona_bu BEFORE UPDATE ON persona
FOR EACH ROW
BEGIN
  IF NEW.id_mentor IS NOT NULL AND NEW.id_mentor = NEW.id_persona THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Una persona no puede ser su propio mentor';
  END IF;
END$$

CREATE TRIGGER trg_persona_ai AFTER INSERT ON persona
FOR EACH ROW
BEGIN
  INSERT INTO historial_discipulado (id_persona, id_fase, fecha_inicio, observaciones, id_usuario)
  VALUES (NEW.id_persona, NEW.id_fase, NEW.fecha_ingreso, 'Registro inicial', @id_usuario_app);

  INSERT INTO auditoria (id_usuario, accion, tabla_afectada, id_registro, detalle)
  VALUES (@id_usuario_app, 'INSERT', 'persona', NEW.id_persona,
          CONCAT('Nueva persona: ', NEW.nombres, ' ', NEW.apellidos));
END$$

CREATE TRIGGER trg_persona_au AFTER UPDATE ON persona
FOR EACH ROW
BEGIN
  IF NEW.id_fase <> OLD.id_fase THEN
    UPDATE historial_discipulado
       SET fecha_fin = CURDATE()
     WHERE id_persona = NEW.id_persona AND fecha_fin IS NULL;

    INSERT INTO historial_discipulado (id_persona, id_fase, fecha_inicio, observaciones, id_usuario)
    VALUES (NEW.id_persona, NEW.id_fase, CURDATE(), 'Cambio de fase', @id_usuario_app);

    INSERT INTO auditoria (id_usuario, accion, tabla_afectada, id_registro, detalle)
    VALUES (@id_usuario_app, 'UPDATE', 'persona', NEW.id_persona,
            CONCAT('Cambio de fase ', OLD.id_fase, ' -> ', NEW.id_fase));
  END IF;

  IF NOT (NEW.id_grupo <=> OLD.id_grupo) THEN
    INSERT INTO auditoria (id_usuario, accion, tabla_afectada, id_registro, detalle)
    VALUES (@id_usuario_app, 'UPDATE', 'persona', NEW.id_persona,
            CONCAT('Cambio de grupo ', IFNULL(OLD.id_grupo, 'ninguno'), ' -> ', IFNULL(NEW.id_grupo, 'ninguno')));
  END IF;
END$$

CREATE TRIGGER trg_seguimiento_ai AFTER INSERT ON seguimiento
FOR EACH ROW
BEGIN
  INSERT INTO auditoria (id_usuario, accion, tabla_afectada, id_registro, detalle)
  VALUES (NEW.id_usuario, 'INSERT', 'seguimiento', NEW.id_seguimiento,
          CONCAT('Seguimiento por ', NEW.canal, ' a persona ', NEW.id_persona));
END$$

DELIMITER ;

SET @id_usuario_app = NULL;

INSERT INTO distrito (nombre, descripcion) VALUES
 ('Distrito Villavicencio Norte', 'Comunas del norte de la ciudad'),
 ('Distrito Villavicencio Sur',   'Comunas del sur de la ciudad');

INSERT INTO zona (id_distrito, nombre) VALUES
 (1, 'Zona Norte - Barzal'),
 (1, 'Zona Centro'),
 (2, 'Zona Sur - Porfía'),
 (2, 'Zona Oriente - La Esperanza');

INSERT INTO fase_discipulado (nombre, orden, descripcion) VALUES
 ('Contacto',      1, 'Primer acercamiento a la misión'),
 ('Consolidación', 2, 'Afirmación y acompañamiento inicial'),
 ('Formación',     3, 'Formación bíblica y doctrinal'),
 ('Liderazgo',     4, 'Preparación para servir y discipular');

INSERT INTO rol (nombre, descripcion, nivel_jerarquia) VALUES
 ('Administrador del sistema', 'Gestión técnica y de usuarios',                1),
 ('Pastor de distrito',        'Supervisa todos los grupos de su distrito',     2),
 ('Pastor local',              'Responsable de la congregación local',          3),
 ('Asistente apostólica',      'Apoyo al liderazgo apostólico',                 3),
 ('Asistente pastoral',        'Apoyo al pastor en seguimiento y grupos',       4),
 ('Discipulador',              'Acompaña a un grupo de discípulos',             5),
 ('Discípulo',                 'Persona en proceso de discipulado',             6);

INSERT INTO permiso (codigo, descripcion, modulo) VALUES
 ('PERSONA_GESTIONAR',     'Crear, editar y desactivar personas',      'Personas'),
 ('PERSONA_CONSULTAR',     'Consultar fichas de personas',             'Personas'),
 ('GRUPO_GESTIONAR',       'Crear, editar y desactivar grupos',        'Grupos'),
 ('ASISTENCIA_REGISTRAR',  'Tomar asistencia de un grupo',             'Asistencia'),
 ('SEGUIMIENTO_REGISTRAR', 'Registrar seguimientos pastorales',        'Seguimiento'),
 ('EVENTO_GESTIONAR',      'Programar y editar eventos',               'Eventos'),
 ('REPORTE_VER',           'Ver reportes e indicadores',               'Reportes'),
 ('AUDITORIA_VER',         'Consultar la bitácora de cambios',         'Auditoría'),
 ('USUARIO_GESTIONAR',     'Administrar usuarios y roles',             'Roles');

INSERT INTO rol_permiso (id_rol, id_permiso) SELECT 1, id_permiso FROM permiso;
INSERT INTO rol_permiso (id_rol, id_permiso) SELECT 2, id_permiso FROM permiso WHERE codigo <> 'USUARIO_GESTIONAR';
INSERT INTO rol_permiso (id_rol, id_permiso) SELECT 3, id_permiso FROM permiso
 WHERE codigo IN ('PERSONA_GESTIONAR','PERSONA_CONSULTAR','GRUPO_GESTIONAR','ASISTENCIA_REGISTRAR',
                  'SEGUIMIENTO_REGISTRAR','EVENTO_GESTIONAR','REPORTE_VER');
INSERT INTO rol_permiso (id_rol, id_permiso) SELECT r.id_rol, p.id_permiso FROM rol r, permiso p
 WHERE r.id_rol IN (4,5)
   AND p.codigo IN ('PERSONA_CONSULTAR','ASISTENCIA_REGISTRAR','SEGUIMIENTO_REGISTRAR','EVENTO_GESTIONAR','REPORTE_VER');
INSERT INTO rol_permiso (id_rol, id_permiso) SELECT 6, id_permiso FROM permiso
 WHERE codigo IN ('PERSONA_CONSULTAR','ASISTENCIA_REGISTRAR','SEGUIMIENTO_REGISTRAR');
INSERT INTO rol_permiso (id_rol, id_permiso) SELECT 7, id_permiso FROM permiso WHERE codigo = 'PERSONA_CONSULTAR';

INSERT INTO persona (codigo, tipo_documento, numero_documento, nombres, apellidos, fecha_nacimiento, genero,
                     telefono, correo, direccion, barrio, id_fase, fecha_ingreso, autoriza_datos, fecha_autorizacion) VALUES
 ('MT-0001','CC','1121800101','Carlos Andrés','Mendoza Ruiz',   '1975-03-14','M','3101234501','carlos.mendoza@misiontec.org','Cra 40 # 26-15','Barzal',      4,'2015-02-01',1,'2026-01-10 09:00:00'),
 ('MT-0002','CC','1121800102','Elena María',  'Ramos Gutiérrez','1980-07-22','F','3101234502','elena.ramos@misiontec.org',   'Cl 37 # 32-40','Centro',      4,'2017-05-12',1,'2026-01-10 09:05:00'),
 ('MT-0003','CC','1121800103','Roberto',      'Quintero Parra', '1985-11-02','M','3101234503','roberto.quintero@misiontec.org','Cra 30 # 45-10','Barzal',    4,'2018-08-20',1,'2026-01-11 10:00:00'),
 ('MT-0004','CC','1121800104','Martha Lucía', 'Morales Díaz',   '1983-01-30','F','3101234504','martha.morales@misiontec.org','Cl 15 # 22-08','Centro',      4,'2019-03-03',1,'2026-01-11 10:10:00'),
 ('MT-0005','CC','1121800105','Gabriel',      'Torres Rincón',  '1990-06-18','M','3101234505','gabriel.torres@misiontec.org','Cl 60 Sur # 18-25','Porfía',  4,'2020-01-15',1,'2026-01-12 08:30:00'),
 ('MT-0006','CC','1121800106','Andrés Felipe','Salazar Mora',   '1995-09-09','M','3101234506','andres.salazar@misiontec.org','Cra 12 # 9-30','La Esperanza',4,'2021-06-01',1,'2026-01-12 08:45:00'),
 ('MT-0007','CC','1121800107','David',        'Paredes León',   '1992-04-04','M','3101234507','david.paredes@misiontec.org', 'Cra 41 # 27-02','Barzal',      3,'2022-02-10',1,'2026-01-13 14:00:00'),
 ('MT-0008','CC','1121800108','Sofía',        'Vargas Pinto',   '1997-12-12','F','3101234508','sofia.vargas@misiontec.org',  'Cl 38 # 30-11','Centro',      3,'2022-07-19',1,'2026-01-13 14:10:00'),
 ('MT-0009','CC','1121800109','Lucas',        'Benítez Ocampo', '1998-02-27','M','3101234509','lucas.benitez@misiontec.org', 'Cl 58 Sur # 20-04','Porfía',  3,'2023-01-08',1,'2026-01-14 11:00:00'),
 ('MT-0010','CC','1121800110','Ruth',         'Castro Herrera', '1994-08-15','F','3101234510','ruth.castro@misiontec.org',   'Cra 14 # 10-21','La Esperanza',3,'2023-04-22',1,'2026-01-14 11:15:00'),
 ('MT-0011','CC','1121800111','Laura Valentina','Rojas Peña',   '2001-05-05','F','3201234511','laura.rojas@correo.com',      'Cra 39 # 25-60','Barzal',      2,'2025-09-14',1,'2026-01-20 16:00:00'),
 ('MT-0012','CC','1121800112','Jorge Iván',   'Cárdenas Silva', '1988-10-10','M','3201234512','jorge.cardenas@correo.com',   'Cl 28 # 41-17','Barzal',      3,'2024-11-03',1,'2026-01-20 16:20:00'),
 ('MT-0013','CC','1121800113','Natalia',      'Gómez Ariza',    '1999-03-21','F','3201234513','natalia.gomez@correo.com',    'Cra 42 # 30-05','Barzal',      1,'2026-06-02',1,'2026-06-02 19:00:00'),
 ('MT-0014','CC','1121800114','Miguel Ángel', 'Herrera Lozano', '1993-07-07','M','3201234514','miguel.herrera@correo.com',   'Cl 36 # 29-33','Centro',      2,'2025-12-01',1,'2026-01-25 10:00:00'),
 ('MT-0015','TI','1121800115','Camila',       'Ortiz Bernal',   '2009-01-19','F','3201234515',NULL,                          'Cl 34 # 31-12','Centro',      1,'2026-08-10',1,'2026-08-10 18:30:00'),
 ('MT-0016','CC','1121800116','Julián',       'Méndez Castaño', '1996-11-28','M','3201234516','julian.mendez@correo.com',    'Cl 61 Sur # 17-40','Porfía',  2,'2025-04-15',1,'2026-02-01 09:00:00'),
 ('MT-0017','CC','1121800117','Diana Marcela','Pulido Reyes',   '1991-02-14','F','3201234517','diana.pulido@correo.com',     'Cl 59 Sur # 19-09','Porfía',  3,'2024-03-30',1,'2026-02-01 09:20:00'),
 ('MT-0018','CC','1121800118','Sebastián',    'Acosta Vela',    '2000-09-01','M','3201234518','sebastian.acosta@correo.com', 'Cra 13 # 11-50','La Esperanza',1,'2026-09-06',1,'2026-09-06 17:00:00');

INSERT INTO grupo (codigo, nombre, id_zona, id_lider, id_asistente, direccion, barrio, latitud, longitud,
                   dia_reunion, hora_reunion, estado, fecha_apertura) VALUES
 ('GM-NOR-01','Grupo Misionero Emmanuel',   1, 3, 7,  'Cra 40 # 26-15',    'Barzal',       4.1489000, -73.6355000, 'Jueves',    '19:30', 'activo',      '2019-02-07'),
 ('GM-CEN-02','Célula Gracia y Verdad',      2, 4, 8,  'Cl 37 # 32-40',     'Centro',       4.1512000, -73.6331000, 'Miércoles', '20:00', 'activo',      '2020-05-13'),
 ('GM-SUR-03','Semillero Monte Sión',        3, 5, 9,  'Cl 60 Sur # 18-25', 'Porfía',       4.0847000, -73.6735000, 'Viernes',   '19:00', 'observacion', '2021-03-05'),
 ('GM-ORI-04','Generación de Impacto',       4, 6, 10, 'Cra 12 # 9-30',     'La Esperanza', 4.1385000, -73.6098000, 'Sábado',    '18:00', 'activo',      '2022-08-06');

UPDATE persona SET id_grupo = 1 WHERE id_persona IN (3,7,11,12,13);
UPDATE persona SET id_grupo = 2 WHERE id_persona IN (4,8,14,15);
UPDATE persona SET id_grupo = 3 WHERE id_persona IN (5,9,16,17);
UPDATE persona SET id_grupo = 4 WHERE id_persona IN (6,10,18);
UPDATE persona SET id_mentor = 1 WHERE id_persona IN (2,3,4);
UPDATE persona SET id_mentor = 2 WHERE id_persona IN (5,6);
UPDATE persona SET id_mentor = 3 WHERE id_persona IN (7,11,12);
UPDATE persona SET id_mentor = 7 WHERE id_persona = 13;
UPDATE persona SET id_mentor = 4 WHERE id_persona IN (8,14,15);
UPDATE persona SET id_mentor = 5 WHERE id_persona IN (9,16,17);
UPDATE persona SET id_mentor = 6 WHERE id_persona IN (10,18);

INSERT INTO persona_rol (id_persona, id_rol, fecha_inicio) VALUES
 (1, 2, '2015-02-01'), (1, 1, '2026-01-10'),
 (2, 3, '2017-05-12'),
 (3, 6, '2019-02-07'), (4, 6, '2020-05-13'), (5, 6, '2021-03-05'), (6, 6, '2022-08-06'),
 (7, 5, '2023-01-15'), (8, 4, '2023-06-01'), (9, 5, '2023-08-01'), (10, 5, '2023-09-01'),
 (11, 7, '2025-09-14'), (12, 7, '2024-11-03'), (13, 7, '2026-06-02'), (14, 7, '2025-12-01'),
 (15, 7, '2026-08-10'), (16, 7, '2025-04-15'), (17, 7, '2024-03-30'), (18, 7, '2026-09-06');

INSERT INTO etiqueta (nombre) VALUES ('Nuevo creyente'), ('Joven'), ('Músico'), ('Necesita visita'), ('Servidor');
INSERT INTO persona_etiqueta VALUES (13,1),(15,1),(15,2),(18,1),(18,2),(8,3),(13,4),(12,5),(17,5);

INSERT INTO usuario (id_persona, id_rol, nombre_usuario, contrasena_hash) VALUES
 (1, 1, 'cmendoza',  SHA2('Misiontec2026*', 256)),
 (2, 3, 'eramos',    SHA2('Misiontec2026*', 256)),
 (3, 6, 'rquintero', SHA2('Misiontec2026*', 256)),
 (4, 6, 'mmorales',  SHA2('Misiontec2026*', 256)),
 (5, 6, 'gtorres',   SHA2('Misiontec2026*', 256)),
 (6, 6, 'asalazar',  SHA2('Misiontec2026*', 256)),
 (7, 5, 'dparedes',  SHA2('Misiontec2026*', 256));

INSERT INTO sesion_asistencia (id_grupo, fecha, tema, id_usuario) VALUES
 (1,'2026-09-10','El llamado de Abraham',      3),(1,'2026-09-17','Fe que obra',            3),
 (1,'2026-09-24','La oración eficaz',          3),(1,'2026-10-01','El fruto del Espíritu',  3),
 (2,'2026-09-09','El buen samaritano',         4),(2,'2026-09-16','Perdón y restauración',  4),
 (2,'2026-09-23','La gracia de Dios',          4),(2,'2026-09-30','Servir con alegría',     4),
 (3,'2026-09-11','La parábola del sembrador',  5),(3,'2026-09-18','Raíces profundas',       5),
 (3,'2026-09-25','Perseverar en la fe',        5),(3,'2026-10-02','La armadura de Dios',    5),
 (4,'2026-09-12','Identidad en Cristo',        6),(4,'2026-09-19','Propósito y llamado',    6),
 (4,'2026-09-26','Jóvenes que impactan',       6),(4,'2026-10-03','Amistad con Dios',       6);

INSERT INTO detalle_asistencia (id_sesion, id_persona, estado)
SELECT s.id_sesion, p.id_persona, 'presente'
FROM sesion_asistencia s
JOIN persona p ON p.id_grupo = s.id_grupo
WHERE p.fecha_ingreso <= s.fecha;

UPDATE detalle_asistencia SET estado = 'falta_injustificada'
 WHERE id_persona = 13 AND id_sesion IN (2,3,4);
UPDATE detalle_asistencia SET estado = 'falta_injustificada' WHERE id_persona = 16 AND id_sesion = 11;
UPDATE detalle_asistencia SET estado = 'falta_justificada', observacion = 'Viaje de trabajo'
 WHERE id_persona = 16 AND id_sesion = 12;
UPDATE detalle_asistencia SET estado = 'falta_justificada', observacion = 'Cita médica'
 WHERE id_persona = 17 AND id_sesion = 10;
UPDATE detalle_asistencia SET estado = 'falta_injustificada' WHERE id_persona = 14 AND id_sesion = 6;

INSERT INTO seguimiento (id_persona, id_usuario, fecha, canal, estado_pastoral, notas, compromisos,
                         proximo_contacto, semaforo_resultante) VALUES
 (11, 3, '2026-10-02 18:00:00','llamada',         'excelente',       'Muy animada con el grupo.',             'Invitar a un amigo',            '2026-10-09','verde'),
 (12, 3, '2026-09-29 19:30:00','visita',          'estable',         'Visita en su casa con la familia.',     'Iniciar curso de formación',    '2026-10-13','verde'),
 (13, 7, '2026-08-20 17:00:00','mensaje_chat',    'desanimado',      'Comenta problemas de horario laboral.', 'Volver a la reunión del jueves','2026-08-27','amarillo'),
 (14, 4, '2026-09-28 20:30:00','reunion_pastoral','estable',         'Conversación sobre su proceso.',        'Lectura diaria',                '2026-10-12','verde'),
 (15, 4, '2026-09-30 17:30:00','visita',          'excelente',       'Visita con autorización de sus padres.','Participar en el grupo juvenil','2026-10-14','verde'),
 (16, 5, '2026-09-15 18:00:00','llamada',         'necesita_oracion','Situación familiar difícil.',           'Llamada de seguimiento',        '2026-09-22','amarillo'),
 (17, 5, '2026-09-30 19:00:00','llamada',         'estable',         'Ya se recuperó de su cita médica.',     'Servir en bienvenida',          '2026-10-14','verde'),
 (18, 6, '2026-10-03 19:30:00','reunion_pastoral','excelente',       'Primera conversación de consolidación.','Asistir al retiro',             '2026-10-10','verde'),
 (7,  3, '2026-09-25 21:00:00','reunion_pastoral','estable',         'Revisión de su labor como asistente.',  NULL,                            '2026-10-23','verde'),
 (8,  4, '2026-09-23 21:00:00','llamada',         'estable',         'Coordinación del grupo.',               NULL,                            '2026-10-21','verde'),
 (9,  5, '2026-09-26 20:00:00','llamada',         'estable',         'Coordinación del grupo.',               NULL,                            '2026-10-24','verde'),
 (10, 6, '2026-09-27 20:00:00','llamada',         'excelente',       'Apoyo con jóvenes nuevos.',             NULL,                            '2026-10-25','verde'),
 (3,  1, '2026-09-28 10:00:00','reunion_pastoral','estable',         'Reunión de líderes.',                   NULL,                            '2026-10-26','verde'),
 (4,  1, '2026-09-28 10:00:00','reunion_pastoral','estable',         'Reunión de líderes.',                   NULL,                            '2026-10-26','verde'),
 (5,  1, '2026-09-28 10:00:00','reunion_pastoral','estable',         'Reunión de líderes.',                   NULL,                            '2026-10-26','verde'),
 (6,  1, '2026-09-28 10:00:00','reunion_pastoral','estable',         'Reunión de líderes.',                   NULL,                            '2026-10-26','verde'),
 (2,  1, '2026-09-28 10:00:00','reunion_pastoral','excelente',       'Reunión de líderes.',                   NULL,                            '2026-10-26','verde'),
 (1,  2, '2026-09-28 10:00:00','reunion_pastoral','excelente',       'Reunión de líderes.',                   NULL,                            '2026-10-26','verde');

INSERT INTO evento (titulo, tipo, fecha, hora, lugar, publico_objetivo, id_grupo, id_usuario, estado) VALUES
 ('Culto general de la misión',     'culto',       '2026-09-27','09:00','Auditorio principal, Cl 37 # 32-40','Toda la misión',   NULL, 2, 'concluido'),
 ('Taller de discipulado',          'taller',      '2026-10-10','15:00','Salón Barzal',                      'Discipuladores',   NULL, 1, 'programado'),
 ('Retiro juvenil Renacer',         'retiro',      '2026-10-17','08:00','Finca El Recreo, vía Restrepo',     'Jóvenes',          4,    6, 'programado'),
 ('Vigilia de oración',             'vigilia',     '2026-10-23','21:00','Auditorio principal, Cl 37 # 32-40','Toda la misión',   NULL, 2, 'programado'),
 ('Jornada de evangelismo Porfía',  'evangelismo', '2026-09-19','14:00','Parque de Porfía',                  'Grupo Monte Sión', 3,    5, 'concluido');

INSERT INTO asistencia_evento (id_evento, id_persona)
SELECT 1, id_persona FROM persona WHERE id_persona NOT IN (13, 16);
INSERT INTO asistencia_evento (id_evento, id_persona) VALUES (5,5),(5,9),(5,17);

CALL sp_generar_alertas();

