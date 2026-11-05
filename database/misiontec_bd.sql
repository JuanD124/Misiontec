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
  fase                ENUM('contacto','consolidacion','formacion','liderazgo') NOT NULL DEFAULT 'contacto',
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
    REFERENCES persona (id_persona) ON UPDATE CASCADE ON DELETE SET NULL
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
) ENGINE=InnoDB COMMENT='Grupos misioneros / grupos con su geolocalización';

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

CREATE TABLE historial_discipulado (
  id_historial    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_persona      INT UNSIGNED NOT NULL,
  fase            ENUM('contacto','consolidacion','formacion','liderazgo') NOT NULL,
  fecha_inicio    DATE NOT NULL,
  fecha_fin       DATE NULL,
  observaciones   VARCHAR(255) NULL,
  CONSTRAINT ck_hd_fechas CHECK (fecha_fin IS NULL OR fecha_fin >= fecha_inicio),
  CONSTRAINT fk_hd_persona FOREIGN KEY (id_persona)
    REFERENCES persona (id_persona) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Registro histórico del avance en las fases';

CREATE TABLE sesion_asistencia (
  id_sesion       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_grupo        INT UNSIGNED NOT NULL,
  fecha           DATE NOT NULL,
  tema            VARCHAR(150) NULL,
  fecha_registro  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_sesion_grupo_fecha UNIQUE (id_grupo, fecha),
  CONSTRAINT fk_sesion_grupo FOREIGN KEY (id_grupo)
    REFERENCES grupo (id_grupo) ON UPDATE CASCADE ON DELETE RESTRICT
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

CREATE TABLE evento (
  id_evento         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  titulo            VARCHAR(150) NOT NULL,
  tipo              ENUM('culto','taller','retiro','vigilia','evangelismo') NOT NULL,
  fecha             DATE NOT NULL,
  hora              TIME NOT NULL,
  lugar             VARCHAR(150) NOT NULL,
  publico_objetivo  VARCHAR(100) NULL,
  id_grupo          INT UNSIGNED NULL COMMENT 'NULL = evento general de la misión',
  estado            ENUM('programado','en_curso','concluido','cancelado') NOT NULL DEFAULT 'programado',
  activo            TINYINT(1) NOT NULL DEFAULT 1,
  CONSTRAINT fk_evento_grupo FOREIGN KEY (id_grupo)
    REFERENCES grupo (id_grupo) ON UPDATE CASCADE ON DELETE SET NULL
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

CREATE INDEX ix_persona_nombre      ON persona (apellidos, nombres);
CREATE INDEX ix_persona_fase_activo ON persona (fase, activo);
CREATE INDEX ix_grupo_ubicacion     ON grupo (latitud, longitud);
CREATE INDEX ix_sesion_fecha        ON sesion_asistencia (fecha);
CREATE INDEX ix_evento_fecha        ON evento (fecha);

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

CREATE PROCEDURE sp_desactivar_persona(IN p_id_persona INT UNSIGNED)
BEGIN
  UPDATE persona SET activo = 0 WHERE id_persona = p_id_persona;
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
       p.fase                              AS fase,
       CONCAT(m.nombres, ' ', m.apellidos) AS mentor,
       i.faltas_consecutivas,
       i.ultima_asistencia,
       CASE
         WHEN i.faltas_consecutivas >= 3 THEN 'rojo'
         WHEN i.faltas_consecutivas = 2  THEN 'amarillo'
         ELSE 'verde'
       END COLLATE utf8mb4_spanish_ci AS semaforo
FROM persona p
JOIN vw_inasistencias_consecutivas i ON i.id_persona = p.id_persona
LEFT JOIN grupo g                    ON g.id_grupo = p.id_grupo
LEFT JOIN persona m                  ON m.id_persona = p.id_mentor
WHERE p.activo = 1;

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
SELECT f.orden, f.fase, COUNT(p.id_persona) AS total_personas
FROM (SELECT 1 AS orden, 'contacto' AS fase
      UNION ALL SELECT 2, 'consolidacion'
      UNION ALL SELECT 3, 'formacion'
      UNION ALL SELECT 4, 'liderazgo') f
LEFT JOIN persona p ON p.fase = f.fase COLLATE utf8mb4_spanish_ci AND p.activo = 1
GROUP BY f.orden, f.fase;

CREATE VIEW vw_dashboard AS
SELECT
  (SELECT COUNT(*) FROM persona WHERE activo = 1)                          AS personas_activas,
  (SELECT COUNT(*) FROM grupo   WHERE activo = 1)                          AS grupos_activos,
  (SELECT ROUND(AVG(porcentaje_asistencia), 1) FROM vw_indicadores_grupo)  AS asistencia_promedio,
  (SELECT COUNT(*) FROM vw_semaforo_persona WHERE semaforo = 'rojo')       AS personas_en_rojo,
  (SELECT COUNT(*) FROM vw_semaforo_persona WHERE semaforo = 'amarillo')   AS personas_en_amarillo,
  (SELECT COUNT(*) FROM persona
    WHERE activo = 1 AND fecha_ingreso >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)) AS nuevos_ultimos_90_dias,
  (SELECT COUNT(*) FROM evento
    WHERE activo = 1 AND estado = 'programado' AND fecha >= CURDATE())     AS eventos_proximos;

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
  INSERT INTO historial_discipulado (id_persona, fase, fecha_inicio, observaciones)
  VALUES (NEW.id_persona, NEW.fase, NEW.fecha_ingreso, 'Registro inicial');
END$$

CREATE TRIGGER trg_persona_au AFTER UPDATE ON persona
FOR EACH ROW
BEGIN
  IF NEW.fase <> OLD.fase THEN
    UPDATE historial_discipulado
       SET fecha_fin = CURDATE()
     WHERE id_persona = NEW.id_persona AND fecha_fin IS NULL;

    INSERT INTO historial_discipulado (id_persona, fase, fecha_inicio, observaciones)
    VALUES (NEW.id_persona, NEW.fase, CURDATE(), 'Cambio de fase');
  END IF;
END$$

DELIMITER ;

INSERT INTO distrito (nombre, descripcion) VALUES
 ('Distrito Villavicencio Norte', 'Comunas del norte de la ciudad'),
 ('Distrito Villavicencio Sur',   'Comunas del sur de la ciudad');

INSERT INTO zona (id_distrito, nombre) VALUES
 (1, 'Zona Norte - Barzal'),
 (1, 'Zona Centro'),
 (2, 'Zona Sur - Porfía'),
 (2, 'Zona Oriente - La Esperanza');

INSERT INTO rol (nombre, descripcion, nivel_jerarquia) VALUES
 ('Pastor',             'Dirige la misión y aprueba el avance de los discípulos de una fase a otra',          1),
 ('Asistente pastoral', 'Ayuda al pastor con el registro de miembros, la asistencia y los informes',           2),
 ('Discipulador',       'Da la clase a su grupo, toma la asistencia y cuida a sus discípulos',                 3),
 ('Discípulo',          'Recibe la clase y participa en su grupo de discipulado',                              4);

INSERT INTO permiso (codigo, descripcion, modulo) VALUES
 ('MIEMBROS_VER',      'Ver la lista de miembros y sus fichas',          'Miembros'),
 ('MIEMBRO_REGISTRAR', 'Registrar nuevos miembros',                      'Miembros'),
 ('GRUPOS_VER',        'Ver los grupos de discipulado y el mapa',        'Grupos'),
 ('DISCIPULADO_VER',   'Ver las fases de discipulado',                   'Discipulado'),
 ('FASE_PROMOVER',     'Promover a un miembro a la siguiente fase',      'Discipulado'),
 ('ASISTENCIA_TOMAR',  'Tomar la asistencia de los grupos',              'Asistencia'),
 ('CUIDADO_VER',       'Ver el semáforo y las alertas de cuidado',       'Cuidado'),
 ('EVENTOS_VER',       'Ver los eventos',                                'Eventos'),
 ('REPORTES_VER',      'Ver los informes',                               'Reportes');

INSERT INTO persona (codigo, tipo_documento, numero_documento, nombres, apellidos, fecha_nacimiento, genero,
                     telefono, correo, direccion, barrio, fase, fecha_ingreso, autoriza_datos, fecha_autorizacion) VALUES
 ('MT-0001','CC','1121800101','Carlos Andrés','Mendoza Ruiz',   '1975-03-14','M','3101234501','carlos.mendoza@misiontec.org','Cra 40 # 26-15','Barzal',      'liderazgo','2015-02-01',1,'2026-01-10 09:00:00'),
 ('MT-0002','CC','1121800102','Elena María',  'Ramos Gutiérrez','1980-07-22','F','3101234502','elena.ramos@misiontec.org',   'Cl 37 # 32-40','Centro',      'liderazgo','2017-05-12',1,'2026-01-10 09:05:00'),
 ('MT-0003','CC','1121800103','Roberto',      'Quintero Parra', '1985-11-02','M','3101234503','roberto.quintero@misiontec.org','Cra 30 # 45-10','Barzal',    'liderazgo','2018-08-20',1,'2026-01-11 10:00:00'),
 ('MT-0004','CC','1121800104','Martha Lucía', 'Morales Díaz',   '1983-01-30','F','3101234504','martha.morales@misiontec.org','Cl 15 # 22-08','Centro',      'liderazgo','2019-03-03',1,'2026-01-11 10:10:00'),
 ('MT-0005','CC','1121800105','Gabriel',      'Torres Rincón',  '1990-06-18','M','3101234505','gabriel.torres@misiontec.org','Cl 60 Sur # 18-25','Porfía',  'liderazgo','2020-01-15',1,'2026-01-12 08:30:00'),
 ('MT-0006','CC','1121800106','Andrés Felipe','Salazar Mora',   '1995-09-09','M','3101234506','andres.salazar@misiontec.org','Cra 12 # 9-30','La Esperanza','liderazgo','2021-06-01',1,'2026-01-12 08:45:00'),
 ('MT-0007','CC','1121800107','David',        'Paredes León',   '1992-04-04','M','3101234507','david.paredes@misiontec.org', 'Cra 41 # 27-02','Barzal',      'formacion','2022-02-10',1,'2026-01-13 14:00:00'),
 ('MT-0008','CC','1121800108','Sofía',        'Vargas Pinto',   '1997-12-12','F','3101234508','sofia.vargas@misiontec.org',  'Cl 38 # 30-11','Centro',      'formacion','2022-07-19',1,'2026-01-13 14:10:00'),
 ('MT-0009','CC','1121800109','Lucas',        'Benítez Ocampo', '1998-02-27','M','3101234509','lucas.benitez@misiontec.org', 'Cl 58 Sur # 20-04','Porfía',  'formacion','2023-01-08',1,'2026-01-14 11:00:00'),
 ('MT-0010','CC','1121800110','Ruth',         'Castro Herrera', '1994-08-15','F','3101234510','ruth.castro@misiontec.org',   'Cra 14 # 10-21','La Esperanza','formacion','2023-04-22',1,'2026-01-14 11:15:00'),
 ('MT-0011','CC','1121800111','Laura Valentina','Rojas Peña',   '2001-05-05','F','3201234511','laura.rojas@correo.com',      'Cra 39 # 25-60','Barzal',      'consolidacion','2025-09-14',1,'2026-01-20 16:00:00'),
 ('MT-0012','CC','1121800112','Jorge Iván',   'Cárdenas Silva', '1988-10-10','M','3201234512','jorge.cardenas@correo.com',   'Cl 28 # 41-17','Barzal',      'formacion','2024-11-03',1,'2026-01-20 16:20:00'),
 ('MT-0013','CC','1121800113','Natalia',      'Gómez Ariza',    '1999-03-21','F','3201234513','natalia.gomez@correo.com',    'Cra 42 # 30-05','Barzal',      'contacto','2026-06-02',1,'2026-06-02 19:00:00'),
 ('MT-0014','CC','1121800114','Miguel Ángel', 'Herrera Lozano', '1993-07-07','M','3201234514','miguel.herrera@correo.com',   'Cl 36 # 29-33','Centro',      'consolidacion','2025-12-01',1,'2026-01-25 10:00:00'),
 ('MT-0015','TI','1121800115','Camila',       'Ortiz Bernal',   '2009-01-19','F','3201234515',NULL,                          'Cl 34 # 31-12','Centro',      'contacto','2026-08-10',1,'2026-08-10 18:30:00'),
 ('MT-0016','CC','1121800116','Julián',       'Méndez Castaño', '1996-11-28','M','3201234516','julian.mendez@correo.com',    'Cl 61 Sur # 17-40','Porfía',  'consolidacion','2025-04-15',1,'2026-02-01 09:00:00'),
 ('MT-0017','CC','1121800117','Diana Marcela','Pulido Reyes',   '1991-02-14','F','3201234517','diana.pulido@correo.com',     'Cl 59 Sur # 19-09','Porfía',  'formacion','2024-03-30',1,'2026-02-01 09:20:00'),
 ('MT-0018','CC','1121800118','Sebastián',    'Acosta Vela',    '2000-09-01','M','3201234518','sebastian.acosta@correo.com', 'Cra 13 # 11-50','La Esperanza','contacto','2026-09-06',1,'2026-09-06 17:00:00');

INSERT INTO grupo (codigo, nombre, id_zona, id_lider, id_asistente, direccion, barrio, latitud, longitud,
                   dia_reunion, hora_reunion, estado, fecha_apertura) VALUES
 ('GM-NOR-01','Grupo Misionero Emmanuel',   1, 3, 7,  'Cra 40 # 26-15',    'Barzal',       4.1489000, -73.6355000, 'Jueves',    '19:30', 'activo',      '2019-02-07'),
 ('GM-CEN-02','Grupo Gracia y Verdad',      2, 4, 8,  'Cl 37 # 32-40',     'Centro',       4.1512000, -73.6331000, 'Miércoles', '20:00', 'activo',      '2020-05-13'),
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
 (1, 1, '2015-02-01'),
 (2, 2, '2017-05-12'),
 (3, 3, '2019-02-07'), (4, 3, '2020-05-13'), (5, 3, '2021-03-05'), (6, 3, '2022-08-06'),
 (7, 3, '2023-01-15'), (8, 3, '2023-06-01'), (9, 3, '2023-08-01'), (10, 3, '2023-09-01'),
 (11, 4, '2025-09-14'), (12, 4, '2024-11-03'), (13, 4, '2026-06-02'), (14, 4, '2025-12-01'),
 (15, 4, '2026-08-10'), (16, 4, '2025-04-15'), (17, 4, '2024-03-30'), (18, 4, '2026-09-06');

INSERT INTO etiqueta (nombre) VALUES ('Nuevo creyente'), ('Joven'), ('Músico'), ('Necesita visita'), ('Servidor');
INSERT INTO persona_etiqueta VALUES (13,1),(15,1),(15,2),(18,1),(18,2),(8,3),(13,4),(12,5),(17,5);

INSERT INTO sesion_asistencia (id_grupo, fecha, tema) VALUES
 (1,'2026-09-10','El llamado de Abraham'),(1,'2026-09-17','Fe que obra'),
 (1,'2026-09-24','La oración eficaz'),(1,'2026-10-01','El fruto del Espíritu'),
 (2,'2026-09-09','El buen samaritano'),(2,'2026-09-16','Perdón y restauración'),
 (2,'2026-09-23','La gracia de Dios'),(2,'2026-09-30','Servir con alegría'),
 (3,'2026-09-11','La parábola del sembrador'),(3,'2026-09-18','Raíces profundas'),
 (3,'2026-09-25','Perseverar en la fe'),(3,'2026-10-02','La armadura de Dios'),
 (4,'2026-09-12','Identidad en Cristo'),(4,'2026-09-19','Propósito y llamado'),
 (4,'2026-09-26','Jóvenes que impactan'),(4,'2026-10-03','Amistad con Dios');

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

INSERT INTO evento (titulo, tipo, fecha, hora, lugar, publico_objetivo, id_grupo, estado) VALUES
 ('Culto general de la misión',     'culto',       '2026-09-27','09:00','Auditorio principal, Cl 37 # 32-40','Toda la misión',   NULL, 'concluido'),
 ('Taller de discipulado',          'taller',      '2026-10-10','15:00','Salón Barzal',                      'Discipuladores',   NULL, 'programado'),
 ('Retiro juvenil Renacer',         'retiro',      '2026-10-17','08:00','Finca El Recreo, vía Restrepo',     'Jóvenes',          4,    'programado'),
 ('Vigilia de oración',             'vigilia',     '2026-10-23','21:00','Auditorio principal, Cl 37 # 32-40','Toda la misión',   NULL, 'programado'),
 ('Jornada de evangelismo Porfía',  'evangelismo', '2026-09-19','14:00','Parque de Porfía',                  'Grupo Monte Sión', 3,    'concluido');

INSERT INTO asistencia_evento (id_evento, id_persona)
SELECT 1, id_persona FROM persona WHERE id_persona NOT IN (13, 16);
INSERT INTO asistencia_evento (id_evento, id_persona) VALUES (5,5),(5,9),(5,17);
