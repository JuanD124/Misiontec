INSERT INTO distrito (nombre, descripcion) VALUES
 ('Distrito Norte', 'Comunas del norte de la ciudad'),
 ('Distrito Sur',   'Comunas del sur de la ciudad');

INSERT INTO zona (id_distrito, nombre)
SELECT id_distrito, 'Zona Barzal' FROM distrito WHERE nombre = 'Distrito Norte';
INSERT INTO zona (id_distrito, nombre)
SELECT id_distrito, 'Zona Porfía' FROM distrito WHERE nombre = 'Distrito Sur';

INSERT INTO persona (codigo, tipo_documento, numero_documento, nombres, apellidos, fecha_nacimiento, genero,
                     telefono, correo, direccion, barrio, fase, fecha_ingreso, notas_criticas,
                     autoriza_datos, fecha_autorizacion) VALUES
 ('MT-0004','CC','1000000004','Gabriel',         'Torres Rincón',   '1990-06-18','M','3105550004','gabriel.torres@correo.com', 'Cl 60 Sur # 18-25','Porfía', 'liderazgo',    '2025-02-10', NULL, 1, NOW()),
 ('MT-0005','CC','1000000005','Laura Valentina', 'Rojas Peña',      '2001-05-05','F','3105550005','laura.rojas@correo.com',    'Cra 39 # 25-60',   'Barzal', 'consolidacion', '2026-08-10', NULL, 1, NOW()),
 ('MT-0006','CC','1000000006','Jorge Iván',      'Cárdenas Silva',  '1988-10-10','M','3105550006','jorge.cardenas@correo.com', 'Cl 28 # 41-17',    'Barzal', 'formacion',     '2026-03-15', NULL, 1, NOW()),
 ('MT-0007','CC','1000000007','Natalia',         'Gómez Ariza',     '1999-03-21','F','3105550007','natalia.gomez@correo.com',  'Cra 42 # 30-05',   'Barzal', 'contacto',      '2026-09-20', 'Dejó de asistir; pidió oración. Programar visita en casa.', 1, NOW()),
 ('MT-0008','CC','1000000008','Miguel Ángel',    'Herrera Lozano',  '1993-07-07','M','3105550008','miguel.herrera@correo.com', 'Cl 36 # 29-33',    'Barzal', 'consolidacion', '2026-07-05', NULL, 1, NOW()),
 ('MT-0009','CC','1000000009','Diana Marcela',   'Pulido Reyes',    '1991-02-14','F','3105550009','diana.pulido@correo.com',   'Cl 59 Sur # 19-09','Porfía', 'formacion',     '2026-02-20', NULL, 1, NOW()),
 ('MT-0010','CC','1000000010','Julián',          'Méndez Castaño',  '1996-11-28','M','3105550010','julian.mendez@correo.com',  'Cl 61 Sur # 17-40','Porfía', 'consolidacion', '2026-06-01', NULL, 1, NOW()),
 ('MT-0011','CC','1000000011','Sebastián',       'Acosta Vela',     '2000-09-01','M','3105550011','sebastian.acosta@correo.com','Cra 13 # 11-50',  'Porfía', 'contacto',      '2026-10-05', NULL, 1, NOW()),
 ('MT-0012','CC','1000000012','Camila',          'Ortiz Bernal',    '1998-01-19','F','3105550012','camila.ortiz@correo.com',   'Cl 34 # 31-12',    'Porfía', 'contacto',      '2026-10-12', NULL, 1, NOW());

INSERT INTO grupo (codigo, nombre, id_zona, id_lider, direccion, barrio, latitud, longitud,
                   dia_reunion, hora_reunion, estado, fecha_apertura)
SELECT 'GC-001', 'Grupo Emmanuel', z.id_zona, (SELECT id_persona FROM persona WHERE codigo = 'MT-0003'),
       'Cra 40 # 26-15', 'Barzal', 4.1489000, -73.6355000, 'Jueves', '19:30', 'activo', '2026-01-15'
FROM zona z WHERE z.nombre = 'Zona Barzal';

INSERT INTO grupo (codigo, nombre, id_zona, id_lider, id_asistente, direccion, barrio, latitud, longitud,
                   dia_reunion, hora_reunion, estado, fecha_apertura)
SELECT 'GC-002', 'Grupo Monte Sión', z.id_zona, (SELECT id_persona FROM persona WHERE codigo = 'MT-0004'),
       (SELECT id_persona FROM persona WHERE codigo = 'MT-0009'),
       'Cl 60 Sur # 18-25', 'Porfía', 4.0847000, -73.6735000, 'Viernes', '19:00', 'activo', '2026-02-20'
FROM zona z WHERE z.nombre = 'Zona Porfía';

UPDATE persona SET id_grupo = (SELECT id_grupo FROM grupo WHERE codigo = 'GC-001'),
                   id_mentor = (SELECT id_persona FROM (SELECT id_persona FROM persona WHERE codigo = 'MT-0003') t)
 WHERE codigo IN ('MT-0005','MT-0006','MT-0007','MT-0008');
UPDATE persona SET id_grupo = (SELECT id_grupo FROM grupo WHERE codigo = 'GC-002'),
                   id_mentor = (SELECT id_persona FROM (SELECT id_persona FROM persona WHERE codigo = 'MT-0004') t)
 WHERE codigo IN ('MT-0009','MT-0010','MT-0011','MT-0012');

INSERT INTO historial_discipulado (id_persona, fase, fecha_inicio, observaciones)
SELECT id_persona, fase, fecha_ingreso, 'Registro inicial' FROM persona WHERE codigo >= 'MT-0004';

INSERT INTO etiqueta (nombre) VALUES ('Nuevo creyente'), ('Joven'), ('Necesita visita'), ('Servidor');
INSERT INTO persona_etiqueta (id_persona, id_etiqueta)
SELECT p.id_persona, e.id_etiqueta FROM persona p JOIN etiqueta e
 ON (p.codigo = 'MT-0007' AND e.nombre IN ('Nuevo creyente', 'Necesita visita'))
 OR (p.codigo = 'MT-0011' AND e.nombre IN ('Nuevo creyente', 'Joven'))
 OR (p.codigo = 'MT-0009' AND e.nombre = 'Servidor');

INSERT INTO sesion_asistencia (id_grupo, fecha, tema)
SELECT id_grupo, '2026-10-15', 'El llamado de Abraham' FROM grupo WHERE codigo = 'GC-001';
INSERT INTO sesion_asistencia (id_grupo, fecha, tema)
SELECT id_grupo, '2026-10-22', 'Fe que obra' FROM grupo WHERE codigo = 'GC-001';
INSERT INTO sesion_asistencia (id_grupo, fecha, tema)
SELECT id_grupo, '2026-10-29', 'La oración eficaz' FROM grupo WHERE codigo = 'GC-001';
INSERT INTO sesion_asistencia (id_grupo, fecha, tema)
SELECT id_grupo, '2026-11-05', 'El fruto del Espíritu' FROM grupo WHERE codigo = 'GC-001';
INSERT INTO sesion_asistencia (id_grupo, fecha, tema)
SELECT id_grupo, '2026-10-16', 'La parábola del sembrador' FROM grupo WHERE codigo = 'GC-002';
INSERT INTO sesion_asistencia (id_grupo, fecha, tema)
SELECT id_grupo, '2026-10-23', 'Raíces profundas' FROM grupo WHERE codigo = 'GC-002';
INSERT INTO sesion_asistencia (id_grupo, fecha, tema)
SELECT id_grupo, '2026-10-30', 'Perseverar en la fe' FROM grupo WHERE codigo = 'GC-002';
INSERT INTO sesion_asistencia (id_grupo, fecha, tema)
SELECT id_grupo, '2026-11-06', 'La armadura de Dios' FROM grupo WHERE codigo = 'GC-002';

INSERT INTO detalle_asistencia (id_sesion, id_persona, estado)
SELECT s.id_sesion, p.id_persona, 'presente'
FROM sesion_asistencia s JOIN persona p ON p.id_grupo = s.id_grupo;

UPDATE detalle_asistencia d
JOIN sesion_asistencia s ON s.id_sesion = d.id_sesion
JOIN persona p ON p.id_persona = d.id_persona
SET d.estado = 'falta_injustificada'
WHERE (p.codigo = 'MT-0007' AND s.fecha IN ('2026-10-22', '2026-10-29', '2026-11-05'))
   OR (p.codigo = 'MT-0008' AND s.fecha IN ('2026-10-29', '2026-11-05'))
   OR (p.codigo = 'MT-0011' AND s.fecha = '2026-11-06');

UPDATE detalle_asistencia d
JOIN sesion_asistencia s ON s.id_sesion = d.id_sesion
JOIN persona p ON p.id_persona = d.id_persona
SET d.estado = 'falta_justificada', d.observacion = 'Cita médica'
WHERE p.codigo = 'MT-0012' AND s.fecha = '2026-10-30';

INSERT INTO evento (titulo, tipo, fecha, hora, lugar, publico_objetivo, id_grupo, estado) VALUES
 ('Culto general de la misión', 'culto',  '2026-11-01', '09:00', 'Auditorio principal',  'Toda la misión',  NULL, 'concluido'),
 ('Taller de adiestramiento',   'taller', '2026-11-21', '15:00', 'Salón Barzal',         'Discipuladores',  NULL, 'programado'),
 ('Vigilia de oración',         'vigilia','2026-11-28', '21:00', 'Auditorio principal',  'Toda la misión',  NULL, 'programado');

INSERT INTO asistencia_evento (id_evento, id_persona)
SELECT e.id_evento, p.id_persona FROM evento e JOIN persona p
 ON p.codigo IN ('MT-0003','MT-0004','MT-0005','MT-0006','MT-0009','MT-0010')
WHERE e.titulo = 'Culto general de la misión';
