import express, { Request, Response, NextFunction } from 'express';
import { pool, withTransaction } from './db';
import { FASES, SEMAFORO, ESTADO_GRUPO, separarNombre } from './mappers';

const app = express();
app.use(express.json());

const ruta =
  (fn: (req: Request, res: Response) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) =>
    fn(req, res).catch(next);

async function obtenerPersonas() {
  const [rows]: any = await pool.query(`
    SELECT p.id_persona, p.codigo, p.nombres, p.apellidos, p.numero_documento, p.telefono, p.correo,
           TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) AS edad, p.genero, p.direccion,
           d.nombre AS distrito, g.id_grupo, g.nombre AS grupo, p.fase,
           s.semaforo, p.id_mentor, s.mentor, s.faltas_consecutivas, s.ultima_asistencia,
           p.notas_criticas, p.fecha_ingreso,
           (SELECT GROUP_CONCAT(e.nombre SEPARATOR '|')
              FROM persona_etiqueta pe JOIN etiqueta e ON e.id_etiqueta = pe.id_etiqueta
             WHERE pe.id_persona = p.id_persona) AS etiquetas
    FROM persona p
    JOIN vw_semaforo_persona s ON s.id_persona = p.id_persona
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
    phase: r.fase,
    status: SEMAFORO[r.semaforo],
    mentorName: r.mentor ?? 'Sin asignar',
    mentorId: r.id_mentor ? String(r.id_mentor) : '',
    consecutiveAbsences: Number(r.faltas_consecutivas),
    lastAttendanceDate: r.ultima_asistencia ?? 'Sin registro',
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

async function obtenerAlertas() {
  const [rows]: any = await pool.query(`
    SELECT id_persona, nombre_completo, faltas_consecutivas, ultima_asistencia
    FROM vw_semaforo_persona
    WHERE faltas_consecutivas >= 2
    ORDER BY faltas_consecutivas DESC, id_persona`);

  return rows.map((r: any) => ({
    id: String(r.id_persona),
    title: `Inasistencias consecutivas: ${r.nombre_completo}`,
    message: `Registra ${r.faltas_consecutivas} faltas seguidas en su grupo.`,
    timeAgo: r.ultima_asistencia ? `Última asistencia: ${r.ultima_asistencia}` : 'Sin asistencias registradas',
    severity: Number(r.faltas_consecutivas) >= 3 ? 'critical' : 'warning',
    type: 'absence',
    relatedPersonId: String(r.id_persona),
    read: false,
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

app.get('/api/salud', ruta(async (_req, res) => {
  const [rows]: any = await pool.query('SELECT DATABASE() AS base, NOW() AS hora');
  res.json({ ok: true, ...rows[0] });
}));

app.get('/api/inicio', ruta(async (_req, res) => {
  const [people, groups, notifications, events] = await Promise.all([
    obtenerPersonas(), obtenerGrupos(), obtenerAlertas(), obtenerEventos(),
  ]);
  res.json({ people, groups, notifications, events });
}));

app.get('/api/dashboard', ruta(async (_req, res) => {
  const [rows]: any = await pool.query('SELECT * FROM vw_dashboard');
  res.json(rows[0]);
}));

app.get('/api/personas', ruta(async (_req, res) => res.json(await obtenerPersonas())));
app.get('/api/grupos', ruta(async (_req, res) => res.json(await obtenerGrupos())));

app.get('/api/grupos/cercanos', ruta(async (req, res) => {
  const { lat, lng, radio = '5' } = req.query as Record<string, string>;
  const [result]: any = await pool.query('CALL sp_grupos_cercanos(?, ?, ?)', [lat, lng, radio]);
  res.json(result[0]);
}));

app.post('/api/personas', ruta(async (req, res) => {
  const b = req.body;
  const { nombres, apellidos } = separarNombre(b.fullName);
  const anioNacimiento = b.age ? new Date().getFullYear() - Number(b.age) : null;
  const fase = FASES.includes(b.phase) ? b.phase : 'contacto';

  const id = await withTransaction(async (conn) => {
    const [g]: any = await conn.query('SELECT id_lider FROM grupo WHERE id_grupo = ?', [b.groupId || null]);
    const [[{ siguiente }]]: any = await conn.query(
      "SELECT CONCAT('MT-', LPAD(IFNULL(MAX(id_persona), 0) + 1, 4, '0')) AS siguiente FROM persona");

    const [r]: any = await conn.query(
      `INSERT INTO persona (codigo, numero_documento, nombres, apellidos, fecha_nacimiento, genero,
                            telefono, correo, direccion, id_grupo, id_mentor, fase, fecha_ingreso,
                            notas_criticas, autoriza_datos, fecha_autorizacion)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), ?, 1, NOW())`,
      [siguiente, b.dni, nombres, apellidos, anioNacimiento ? `${anioNacimiento}-01-01` : null,
       b.gender || null, b.phone || null, b.email || null, b.address || null,
       b.groupId || null, g[0]?.id_lider ?? null, fase, b.criticalNotes || null]);

    for (const tag of b.tags ?? []) {
      await conn.query('INSERT IGNORE INTO etiqueta (nombre) VALUES (?)', [tag]);
      await conn.query(
        'INSERT IGNORE INTO persona_etiqueta (id_persona, id_etiqueta) SELECT ?, id_etiqueta FROM etiqueta WHERE nombre = ?',
        [r.insertId, tag]);
    }
    return r.insertId;
  });

  const persona = (await obtenerPersonas()).find((p: any) => p.id === String(id));
  res.status(201).json(persona);
}));

app.patch('/api/personas/:id/fase', ruta(async (req, res) => {
  if (!FASES.includes(req.body.phase)) {
    return res.status(400).json({ error: 'Fase de discipulado no válida.' });
  }
  await pool.query('UPDATE persona SET fase = ? WHERE id_persona = ?', [req.body.phase, req.params.id]);
  res.json({ ok: true });
}));

app.delete('/api/personas/:id', ruta(async (req, res) => {
  await pool.query('CALL sp_desactivar_persona(?)', [req.params.id]);
  res.json({ ok: true });
}));

app.post('/api/asistencias', ruta(async (req, res) => {
  const { groupId, date, topic, items } = req.body;
  await withTransaction(async (conn) => {
    await conn.query(
      `INSERT INTO sesion_asistencia (id_grupo, fecha, tema) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE tema = VALUES(tema)`,
      [groupId, date, topic ?? null]);
    const [[sesion]]: any = await conn.query(
      'SELECT id_sesion FROM sesion_asistencia WHERE id_grupo = ? AND fecha = ?', [groupId, date]);

    for (const [personId, estado] of Object.entries(items as Record<string, string>)) {
      await conn.query(
        `INSERT INTO detalle_asistencia (id_sesion, id_persona, estado) VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE estado = VALUES(estado)`,
        [sesion.id_sesion, personId, estado]);
    }
  });
  res.status(201).json({ ok: true });
}));

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
