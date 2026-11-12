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
  contrasena_hash     VARCHAR(255) NULL COMMENT 'Acceso a la aplicación; guarda solo el hash, nunca la contraseña',
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
  latitud           DECIMAL(10,7) NULL,
  longitud          DECIMAL(10,7) NULL,
  estado            ENUM('programado','en_curso','concluido','cancelado') NOT NULL DEFAULT 'programado',
  activo            TINYINT(1) NOT NULL DEFAULT 1,
  CONSTRAINT ck_evento_latitud  CHECK (latitud  IS NULL OR latitud  BETWEEN -90  AND 90),
  CONSTRAINT ck_evento_longitud CHECK (longitud IS NULL OR longitud BETWEEN -180 AND 180),
  CONSTRAINT ck_evento_ubicacion CHECK ((latitud IS NULL) = (longitud IS NULL))
) ENGINE=InnoDB COMMENT='Actividades de la misión, independientes de los grupos; pueden tener ubicación en el mapa';

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

INSERT INTO rol (nombre, descripcion, nivel_jerarquia) VALUES
 ('Pastor',             'Dirige la misión. Tiene todas las funciones, crea los grupos de comunión y es el único que puede eliminar', 1),
 ('Asistente pastoral', 'Ayuda al pastor: hace los registros, crea encuentros y misiones y ve los informes', 2),
 ('Discipulador',       'Acompaña a su grupo: adiestramiento, asistencia, cuidado pastoral y encuentros', 3);

INSERT INTO permiso (codigo, descripcion, modulo) VALUES
 ('INICIO_VER', 'Ver el inicio con los indicadores generales', 'Inicio'),
 ('PADRON_VER', 'Ver el padrón completo de discípulos y los grupos', 'Discípulos'),
 ('MIEMBROS_VER', 'Ver las fichas de los discípulos de su alcance', 'Discípulos'),
 ('MIEMBRO_REGISTRAR', 'Registrar y editar discípulos', 'Discípulos'),
 ('GRUPOS_VER', 'Ver los grupos de comunión y el mapa', 'Grupos'),
 ('GRUPOS_GESTIONAR', 'Crear grupos de comunión y registrar su ubicación', 'Grupos'),
 ('DISCIPULADO_VER', 'Ver el adiestramiento y las fases de formación', 'Adiestramiento'),
 ('FASE_PROMOVER', 'Promover a un discípulo a la siguiente fase', 'Adiestramiento'),
 ('ASISTENCIA_TOMAR', 'Registrar la asistencia de los grupos y de los encuentros', 'Asistencia'),
 ('CUIDADO_VER', 'Ver el semáforo y las alertas de cuidado pastoral', 'Cuidado'),
 ('EVENTOS_VER', 'Ver los encuentros y misiones', 'Eventos'),
 ('EVENTO_CREAR', 'Crear encuentros y misiones', 'Eventos'),
 ('REPORTES_VER', 'Ver los informes', 'Reportes'),
 ('ACCESO_GESTIONAR', 'Crear y cambiar los accesos y roles del equipo', 'Accesos'),
 ('ELIMINAR', 'Eliminar personas, grupos y encuentros', 'Eliminación');

INSERT INTO persona (codigo, tipo_documento, numero_documento, nombres, apellidos, fase, fecha_ingreso,
                     autoriza_datos, fecha_autorizacion) VALUES
 ('MT-0001', 'CC', '1', 'Pastor',       'Principal', 'liderazgo', CURDATE(), 1, NOW()),
 ('MT-0002', 'CC', '2', 'Asistente',    'Pastoral',  'liderazgo', CURDATE(), 1, NOW()),
 ('MT-0003', 'CC', '3', 'Discipulador', 'Principal', 'liderazgo', CURDATE(), 1, NOW());

INSERT INTO historial_discipulado (id_persona, fase, fecha_inicio, observaciones)
SELECT id_persona, fase, fecha_ingreso, 'Registro inicial' FROM persona;

INSERT INTO persona_rol (id_persona, id_rol, fecha_inicio) VALUES
 (1, 1, CURDATE()),
 (2, 2, CURDATE()),
 (3, 3, CURDATE());
