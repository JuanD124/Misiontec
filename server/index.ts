import express, { Request, Response, NextFunction } from 'express';
import { pool, withUser } from './db';
import {
  FASE_POR_ORDEN,
  ORDEN_POR_FASE,
  SEMAFORO,
  SEMAFORO_INVERSO,
  ESTADO_GRUPO,
  SEVERIDAD,
  TIPO_ALERTA,
  haceCuanto,
  separarNombre,
} from './mappers';

const app = express();
app.use(express.json());

// Mientras no exista pantalla de login, el front envía el id del usuario
// en la cabecera "x-usuario-id" (por defecto 1 = administrador).
function usuarioActual(req: Request): number {
  return Number(req.header('x-usuario-id') || 1);
}

// Envuelve las rutas async para que los errores lleguen al manejador final
const ruta =
  (fn: (req: Request, res: Response) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) =>
    fn(req, res).catch(next);

// ---------------------------------------------------------------------
// Consultas de lectura
// ---------------------------------------------------------------------
async function obtenerPersonas() {
  const [rows]: any = await pool.query(`
    SELECT p.id_persona, p.codigo, p.nombres, p.apellidos, p.numero_documento, p.telefono, p.correo,
           TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) AS edad, p.genero, p.direccion,
           d.nombre AS distrito, g.id_grupo, g.nombre AS grupo, f.orden AS fase_orden,
           s.semaforo, p.id_mentor, s.mentor, s.faltas_consecutivas, s.ultima_asistencia,
           DATE(s.ultimo_seguimiento) AS ultimo_seguimiento, s.dias_sin_contacto,
           p.notas_criticas, p.fecha_ingreso,
           (SELECT GROUP_CONCAT(e.nombre SEPARATOR '|')
              FROM persona_etiqueta pe JOIN etiqueta e ON e.id_etiqueta = pe.id_etiqueta
             WHERE pe.id_persona = p.id_persona) AS etiquetas
    FROM persona p
    JOIN vw_semaforo_persona s ON s.id_persona = p.id_persona
    JOIN fase_discipulado f    ON f.id_fase = p.id_fase
    LEFT JOIN grupo g          ON g.id_grupo = p.id_grupo
    LEFT JOIN zona z           ON z.id_zona = g.id_zona
    LEFT JOIN distrito d       ON d.id_distrito = z.id_distrito
    WHERE p.activo = 1
    ORDER BY p.id_persona DESC`);

  return rows.map((r: any) => ({
    id: String(r.id_persona),
    code: r.codigo,
    fullName: `${r.nombres} ${r.apellidos}`.trim(),
    dni: r.numero_documento,
    phone: r.telefono ?? '',
    email: r.correo ?? '',
    age: r.edad ?? 0,
    gender: r.genero ?? 'M',
    address: r.direccion ?? '',
    district: r.distrito ?? '',
    groupId: r.id_grupo ? String(r.id_grupo) : '',
    groupName: r.grupo ?? 'Sin grupo',
    phase: FASE_POR_ORDEN[r.fase_orden],
    status: SEMAFORO[r.semaforo],
    mentorName: r.mentor ?? 'Sin asignar',
    mentorId: r.id_mentor ? String(r.id_mentor) : '',
    consecutiveAbsences: Number(r.faltas_consecutivas),
    lastAttendanceDate: r.ultima_asistencia ?? 'Sin registro',
    lastFollowUpDate: r.ultimo_seguimiento ?? 'Sin registro',
    daysSinceLastContact: Number(r.dias_sin_contacto),
    criticalNotes: r.notas_criticas ?? undefined,
    enrollmentDate: r.fecha_ingreso,
    tags: r.etiquetas ? r.etiquetas.split('|') : [],
  }));
}

async function obtenerGrupos() {
  const [rows]: any = await pool.query(`
    SELECT g.id_grupo, g.codigo, g.nombre, g.direccion, g.latitud, g.longitud, g.dia_reunion,
           TIME_FORMAT(g.hora_reunion, '%H:%i') AS hora, g.estado,
           z.nombre AS zona, d.nombre AS distrito,
           CONCAT(l.nombres, ' ', l.apellidos) AS lider, l.telefono AS telefono_lider,
           CONCAT(a.nombres, ' ', a.apellidos) AS asistente,
           i.total_miembros, i.porcentaje_asistencia,
           (SELECT COUNT(*) FROM vw_semaforo_persona s JOIN persona p ON p.id_persona = s.id_persona
             WHERE p.id_grupo = g.id_grupo AND s.semaforo = 'rojo') AS criticos
    FROM grupo g
    JOIN zona z      ON z.id_zona = g.id_zona
    JOIN distrito d  ON d.id_distrito = z.id_distrito
    JOIN vw_indicadores_grupo i ON i.id_grupo = g.id_grupo
    LEFT JOIN persona l ON l.id_persona = g.id_lider
    LEFT JOIN persona a ON a.id_persona = g.id_asistente
    WHERE g.activo = 1
    ORDER BY g.id_grupo`);

  return rows.map((r: any) => ({
    id: String(r.id_grupo),
    code: r.codigo,
    name: r.nombre,
    leaderName: r.lider ?? 'Sin líder',
    leaderPhone: r.telefono_lider ?? '',
    assistantName: r.asistente ?? 'Sin asistente',
    zone: r.zona,
    district: r.distrito,
    address: r.direccion,
    lat: Number(r.latitud),
    lng: Number(r.longitud),
    meetingDay: r.dia_reunion,
    meetingTime: r.hora,
    memberCount: Number(r.total_miembros),
    averageAttendanceRate: Number(r.porcentaje_asistencia ?? 0),
    status: ESTADO_GRUPO[r.estado],
    criticalMembersCount: Number(r.criticos),
  }));
}

async function obtenerSeguimientos() {
  const [rows]: any = await pool.query(`
    SELECT s.id_seguimiento, s.id_persona, CONCAT(p.nombres, ' ', p.apellidos) AS persona,
           DATE(s.fecha) AS fecha, s.canal, s.estado_pastoral, s.notas, s.compromisos,
           s.proximo_contacto, s.semaforo_resultante,
           CONCAT(rp.nombres, ' ', rp.apellidos) AS registrado_por, r.nombre AS rol
    FROM seguimiento s
    JOIN persona p  ON p.id_persona = s.id_persona
    JOIN usuario u  ON u.id_usuario = s.id_usuario
    JOIN persona rp ON rp.id_persona = u.id_persona
    JOIN rol r      ON r.id_rol = u.id_rol
    ORDER BY s.fecha DESC`);

  return rows.map((r: any) => ({
    id: String(r.id_seguimiento),
    personId: String(r.id_persona),
    personName: r.persona,
    date: r.fecha,
    channel: r.canal,
    pastoralStatus: r.estado_pastoral,
    notes: r.notas ?? '',
    commitments: r.compromisos ?? '',
    nextContactDate: r.proximo_contacto ?? '',
    registeredByName: r.registrado_por,
    registeredByRole: r.rol,
    resultingStatus: SEMAFORO[r.semaforo_resultante],
  }));
}

async function obtenerAlertas() {
  const [rows]: any = await pool.query(`
    SELECT id_alerta, titulo, mensaje, fecha_generacion, severidad, tipo, id_persona, leida
    FROM alerta WHERE resuelta = 0 ORDER BY fecha_generacion DESC`);

  return rows.map((r: any) => ({
    id: String(r.id_alerta),
    title: r.titulo,
    message: r.mensaje,
    timeAgo: haceCuanto(r.fecha_generacion),
    severity: SEVERIDAD[r.severidad],
    type: TIPO_ALERTA[r.tipo],
    relatedPersonId: r.id_persona ? String(r.id_persona) : undefined,
    read: r.leida === 1,
  }));
}

async function obtenerEventos() {
  const [rows]: any = await pool.query(`
    SELECT e.id_evento, e.titulo, e.fecha, TIME_FORMAT(e.hora, '%H:%i') AS hora, e.lugar, e.tipo,
           e.publico_objetivo, e.estado,
           (SELECT COUNT(*) FROM asistencia_evento a WHERE a.id_evento = e.id_evento) AS asistentes
    FROM evento e WHERE e.activo = 1 ORDER BY e.fecha`);

  return rows.map((r: any) => ({
    id: String(r.id_evento),
    title: r.titulo,
    date: r.fecha,
    time: r.hora,
    location: r.lugar,
    type: r.tipo,
    attendeesCount: Number(r.asistentes),
    targetAudience: r.publico_objetivo ?? '',
    status: r.estado === 'cancelado' ? 'concluido' : r.estado,
  }));
}

async function obtenerAuditoria() {
  const [rows]: any = await pool.query(`
    SELECT a.id_auditoria, a.fecha_hora, a.accion, a.tabla_afectada, a.detalle, a.direccion_ip,
           CONCAT(p.nombres, ' ', p.apellidos) AS usuario, r.nombre AS rol
    FROM auditoria a
    LEFT JOIN usuario u ON u.id_usuario = a.id_usuario
    LEFT JOIN persona p ON p.id_persona = u.id_persona
    LEFT JOIN rol r     ON r.id_rol = u.id_rol
    ORDER BY a.fecha_hora DESC, a.id_auditoria DESC
    LIMIT 200`);

  return rows.map((r: any) => ({
    id: String(r.id_auditoria),
    timestamp: r.fecha_hora,
    userName: r.usuario ?? 'Sistema',
    userRole: r.rol ?? 'sistema',
    action: r.accion,
    entity: r.tabla_afectada,
    details: r.detalle ?? '',
    ipAddress: r.direccion_ip ?? '',
  }));
}

// ---------------------------------------------------------------------
// Rutas
// ---------------------------------------------------------------------

// Estado de la conexión (útil para probar que la API ve la base)
app.get('/api/salud', ruta(async (_req, res) => {
  const [rows]: any = await pool.query('SELECT DATABASE() AS base, NOW() AS hora');
  res.json({ ok: true, ...rows[0] });
}));

// Carga todo lo que necesita la aplicación al iniciar
app.get('/api/inicio', ruta(async (_req, res) => {
  const [people, groups, followUps, notifications, events, auditLogs] = await Promise.all([
    obtenerPersonas(), obtenerGrupos(), obtenerSeguimientos(),
    obtenerAlertas(), obtenerEventos(), obtenerAuditoria(),
  ]);
  res.json({ people, groups, followUps, notifications, events, auditLogs });
}));

app.get('/api/dashboard', ruta(async (_req, res) => {
  const [rows]: any = await pool.query('SELECT * FROM vw_dashboard');
  res.json(rows[0]);
}));

app.get('/api/personas', ruta(async (_req, res) => res.json(await obtenerPersonas())));
app.get('/api/grupos', ruta(async (_req, res) => res.json(await obtenerGrupos())));

// Geolocalización: /api/grupos/cercanos?lat=4.142&lng=-73.626&radio=5
app.get('/api/grupos/cercanos', ruta(async (req, res) => {
  const { lat, lng, radio = '5' } = req.query as Record<string, string>;
  const [result]: any = await pool.query('CALL sp_grupos_cercanos(?, ?, ?)', [lat, lng, radio]);
  res.json(result[0]);
}));

// Registrar persona
app.post('/api/personas', ruta(async (req, res) => {
  const b = req.body;
  const { nombres, apellidos } = separarNombre(b.fullName);
  const anioNacimiento = b.age ? new Date().getFullYear() - Number(b.age) : null;

  const id = await withUser(usuarioActual(req), async (conn) => {
    await conn.beginTransaction();
    try {
      // El mentor por defecto es el líder del grupo elegido
      const [g]: any = await conn.query('SELECT id_lider FROM grupo WHERE id_grupo = ?', [b.groupId || null]);
      const [[{ siguiente }]]: any = await conn.query(
        "SELECT CONCAT('MT-', LPAD(IFNULL(MAX(id_persona), 0) + 1, 4, '0')) AS siguiente FROM persona");

      const [r]: any = await conn.query(
        `INSERT INTO persona (codigo, numero_documento, nombres, apellidos, fecha_nacimiento, genero,
                              telefono, correo, direccion, id_grupo, id_mentor, id_fase, fecha_ingreso,
                              notas_criticas, autoriza_datos, fecha_autorizacion)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                 (SELECT id_fase FROM fase_discipulado WHERE orden = ?), CURDATE(), ?, 1, NOW())`,
        [siguiente, b.dni, nombres, apellidos, anioNacimiento ? `${anioNacimiento}-01-01` : null,
         b.gender || null, b.phone || null, b.email || null, b.address || null,
         b.groupId || null, g[0]?.id_lider ?? null, ORDEN_POR_FASE[b.phase] ?? 1, b.criticalNotes || null]);

      // Etiquetas: se crean si no existen
      for (const tag of b.tags ?? []) {
        await conn.query('INSERT IGNORE INTO etiqueta (nombre) VALUES (?)', [tag]);
        await conn.query(
          'INSERT IGNORE INTO persona_etiqueta (id_persona, id_etiqueta) SELECT ?, id_etiqueta FROM etiqueta WHERE nombre = ?',
          [r.insertId, tag]);
      }
      await conn.commit();
      return r.insertId;
    } catch (e) {
      await conn.rollback();
      throw e;
    }
  });

  const persona = (await obtenerPersonas()).find((p: any) => p.id === String(id));
  res.status(201).json(persona);
}));

// Cambio de fase de discipulado (el trigger guarda el historial)
app.patch('/api/personas/:id/fase', ruta(async (req, res) => {
  await withUser(usuarioActual(req), (conn) => conn.query(
    'UPDATE persona SET id_fase = (SELECT id_fase FROM fase_discipulado WHERE orden = ?) WHERE id_persona = ?',
    [ORDEN_POR_FASE[req.body.phase], req.params.id]));
  res.json({ ok: true });
}));

// Desactivación lógica
app.delete('/api/personas/:id', ruta(async (req, res) => {
  await pool.query('CALL sp_desactivar_persona(?, ?, ?)',
    [req.params.id, usuarioActual(req), req.body?.motivo ?? 'Desactivado desde la aplicación']);
  res.json({ ok: true });
}));

// Registrar seguimiento pastoral
app.post('/api/seguimientos', ruta(async (req, res) => {
  const b = req.body;
  await pool.query(
    `INSERT INTO seguimiento (id_persona, id_usuario, fecha, canal, estado_pastoral, notas, compromisos,
                              proximo_contacto, semaforo_resultante)
     VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?)`,
    [b.personId, usuarioActual(req), b.channel, b.pastoralStatus, b.notes, b.commitments,
     b.nextContactDate || null, SEMAFORO_INVERSO[b.resultingStatus] ?? 'verde']);
  // Si se atendió a la persona, se resuelven sus alertas de falta de seguimiento
  await pool.query(
    "UPDATE alerta SET resuelta = 1, fecha_resolucion = NOW() WHERE id_persona = ? AND tipo = 'sin_seguimiento' AND resuelta = 0",
    [b.personId]);
  res.status(201).json({ ok: true });
}));

// Registrar asistencia de un grupo
// body: { groupId, date, items: { [personId]: 'presente' | 'falta_justificada' | 'falta_injustificada' } }
app.post('/api/asistencias', ruta(async (req, res) => {
  const { groupId, date, topic, items } = req.body;
  const usuario = usuarioActual(req);
  await withUser(usuario, async (conn) => {
    await conn.beginTransaction();
    try {
      // Si ya existe la sesión de ese día se actualiza en lugar de duplicarla
      await conn.query(
        `INSERT INTO sesion_asistencia (id_grupo, fecha, tema, id_usuario) VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE tema = VALUES(tema), id_usuario = VALUES(id_usuario)`,
        [groupId, date, topic ?? null, usuario]);
      const [[sesion]]: any = await conn.query(
        'SELECT id_sesion FROM sesion_asistencia WHERE id_grupo = ? AND fecha = ?', [groupId, date]);

      for (const [personId, estado] of Object.entries(items as Record<string, string>)) {
        await conn.query(
          `INSERT INTO detalle_asistencia (id_sesion, id_persona, estado) VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE estado = VALUES(estado)`,
          [sesion.id_sesion, personId, estado]);
      }
      await conn.query(
        "INSERT INTO auditoria (id_usuario, accion, tabla_afectada, id_registro, detalle) VALUES (?, 'INSERT', 'sesion_asistencia', ?, ?)",
        [usuario, sesion.id_sesion, `Asistencia del grupo ${groupId} del ${date}`]);
      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    }
  });
  // Recalcular alertas con la nueva asistencia
  await pool.query('CALL sp_generar_alertas()');
  res.status(201).json({ ok: true });
}));

// Marcar alerta como leída
app.patch('/api/alertas/:id/leida', ruta(async (req, res) => {
  await pool.query('UPDATE alerta SET leida = 1 WHERE id_alerta = ?', [req.params.id]);
  res.json({ ok: true });
}));

// Regenerar alertas manualmente
app.post('/api/alertas/generar', ruta(async (_req, res) => {
  await pool.query('CALL sp_generar_alertas()');
  res.json({ ok: true });
}));

// Manejador de errores: traduce los errores más comunes de MySQL
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: 'Ya existe un registro con ese documento, correo o código.' });
  }
  if (err.sqlState === '45000') {
    return res.status(400).json({ error: err.sqlMessage });
  }
  if (err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR' || err.code === 'ER_BAD_DB_ERROR') {
    return res.status(503).json({ error: 'No se pudo conectar a MySQL. Revisa el archivo .env y que el servidor esté encendido.' });
  }
  res.status(500).json({ error: err.sqlMessage || err.message || 'Error interno' });
});

const PORT = Number(process.env.API_PORT || 3001);
app.listen(PORT, () => {
  console.log(`API de MISIONTEC escuchando en http://localhost:${PORT}`);
});
