import { pool } from './db';
import { puede, rolDesdeBase } from '../src/data/roles';
import { Sesion } from './sesion';
import { SEMAFORO, ESTADO_GRUPO } from './mappers';
import {
  calcularSemaforo,
  resumirAsistencia,
  porcentajeAsistencia,
  promedio,
  distanciaKm,
  RegistroAsistencia,
  Semaforo,
} from './calculos';

export interface PersonaConEstado {
  fila: any;
  nombreCompleto: string;
  faltas: number;
  ultimaAsistencia: string | null;
  semaforo: Semaforo;
}

export interface GrupoConIndicadores {
  fila: any;
  miembros: number;
  sesiones: number;
  asistencia: number | null;
  rojos: number;
  amarillos: number;
}

export async function obtenerPersonasConEstado(): Promise<PersonaConEstado[]> {
  const [filas]: any = await pool.query(`
    SELECT p.id_persona, p.codigo, p.nombres, p.apellidos, p.numero_documento, p.telefono, p.correo,
           TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) AS edad, p.genero, p.direccion,
           d.nombre AS distrito, p.id_grupo, g.nombre AS grupo, p.fase, p.id_mentor,
           CONCAT(m.nombres, ' ', m.apellidos) AS mentor, p.notas_criticas, p.fecha_ingreso,
           (p.contrasena_hash IS NOT NULL) AS tiene_acceso,
           (SELECT r.nombre FROM persona_rol pr JOIN rol r ON r.id_rol = pr.id_rol
             WHERE pr.id_persona = p.id_persona AND pr.activo = 1
             ORDER BY r.nivel_jerarquia LIMIT 1) AS rol_app,
           (SELECT GROUP_CONCAT(e.nombre SEPARATOR '|')
              FROM persona_etiqueta pe JOIN etiqueta e ON e.id_etiqueta = pe.id_etiqueta
             WHERE pe.id_persona = p.id_persona) AS etiquetas
    FROM persona p
    LEFT JOIN grupo g    ON g.id_grupo = p.id_grupo
    LEFT JOIN zona z     ON z.id_zona = g.id_zona
    LEFT JOIN distrito d ON d.id_distrito = z.id_distrito
    LEFT JOIN persona m  ON m.id_persona = p.id_mentor
    WHERE p.activo = 1
    ORDER BY p.id_persona DESC`);

  const [asistencias]: any = await pool.query(`
    SELECT d.id_persona, s.fecha, d.estado
    FROM detalle_asistencia d
    JOIN sesion_asistencia s ON s.id_sesion = d.id_sesion`);

  const porPersona = new Map<number, RegistroAsistencia[]>();
  for (const a of asistencias) {
    const lista = porPersona.get(a.id_persona) ?? [];
    lista.push({ fecha: a.fecha, estado: a.estado });
    porPersona.set(a.id_persona, lista);
  }

  return filas.map((fila: any) => {
    const { faltasConsecutivas, ultimaAsistencia } = resumirAsistencia(porPersona.get(fila.id_persona) ?? []);
    return {
      fila,
      nombreCompleto: `${fila.nombres} ${fila.apellidos}`,
      faltas: faltasConsecutivas,
      ultimaAsistencia,
      semaforo: calcularSemaforo(faltasConsecutivas),
    };
  });
}

export async function obtenerGruposConIndicadores(personas: PersonaConEstado[]): Promise<GrupoConIndicadores[]> {
  const [grupos]: any = await pool.query(`
    SELECT g.id_grupo, g.codigo, g.nombre, g.direccion, g.barrio, g.latitud, g.longitud, g.dia_reunion,
           g.id_lider, g.id_asistente,
           TIME_FORMAT(g.hora_reunion, '%H:%i') AS hora, g.estado,
           z.nombre AS zona, d.nombre AS distrito,
           CONCAT(l.nombres, ' ', l.apellidos) AS lider, l.telefono AS telefono_lider,
           CONCAT(a.nombres, ' ', a.apellidos) AS asistente
    FROM grupo g
    JOIN zona z      ON z.id_zona = g.id_zona
    JOIN distrito d  ON d.id_distrito = z.id_distrito
    LEFT JOIN persona l ON l.id_persona = g.id_lider
    LEFT JOIN persona a ON a.id_persona = g.id_asistente
    WHERE g.activo = 1
    ORDER BY g.id_grupo`);

  const [sesiones]: any = await pool.query(
    'SELECT id_grupo, COUNT(*) AS total FROM sesion_asistencia GROUP BY id_grupo');
  const [detalle]: any = await pool.query(`
    SELECT s.id_grupo, d.estado
    FROM detalle_asistencia d
    JOIN sesion_asistencia s ON s.id_sesion = d.id_sesion`);

  return grupos.map((fila: any) => {
    const miembros = personas.filter((p) => p.fila.id_grupo === fila.id_grupo);
    return {
      fila,
      miembros: miembros.length,
      sesiones: Number(sesiones.find((s: any) => s.id_grupo === fila.id_grupo)?.total ?? 0),
      asistencia: porcentajeAsistencia(
        detalle.filter((d: any) => d.id_grupo === fila.id_grupo).map((d: any) => d.estado)),
      rojos: miembros.filter((p) => p.semaforo === 'rojo').length,
      amarillos: miembros.filter((p) => p.semaforo === 'amarillo').length,
    };
  });
}

export function personasParaPantalla(personas: PersonaConEstado[]) {
  return personas.map(({ fila: r, nombreCompleto, faltas, ultimaAsistencia, semaforo }) => ({
    id: String(r.id_persona),
    code: r.codigo,
    fullName: nombreCompleto.trim(),
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
    status: SEMAFORO[semaforo],
    mentorName: r.mentor ?? 'Sin asignar',
    mentorId: r.id_mentor ? String(r.id_mentor) : '',
    consecutiveAbsences: faltas,
    lastAttendanceDate: ultimaAsistencia ?? 'Sin registro',
    criticalNotes: r.notas_criticas ?? undefined,
    enrollmentDate: r.fecha_ingreso,
    tags: r.etiquetas ? r.etiquetas.split('|') : [],
    hasAccess: Boolean(r.tiene_acceso),
    accessRole: (r.rol_app ? rolDesdeBase(r.rol_app) : null) ?? undefined,
  }));
}

export function gruposParaPantalla(grupos: GrupoConIndicadores[]) {
  return grupos.map(({ fila: r, miembros, asistencia, rojos }) => ({
    id: String(r.id_grupo),
    code: r.codigo,
    name: r.nombre,
    leaderName: r.lider ?? 'Sin líder',
    leaderId: r.id_lider ? String(r.id_lider) : '',
    leaderPhone: r.telefono_lider ?? '',
    assistantName: r.asistente ?? 'Sin asistente',
    assistantId: r.id_asistente ? String(r.id_asistente) : '',
    zone: r.zona,
    district: r.distrito,
    neighborhood: r.barrio ?? '',
    address: r.direccion,
    lat: Number(r.latitud),
    lng: Number(r.longitud),
    meetingDay: r.dia_reunion,
    meetingTime: r.hora,
    memberCount: miembros,
    averageAttendanceRate: asistencia ?? 0,
    status: ESTADO_GRUPO[r.estado],
    criticalMembersCount: rojos,
  }));
}

export function alertasParaPantalla(personas: PersonaConEstado[]) {
  return personas
    .filter((p) => p.faltas >= 2)
    .sort((a, b) => b.faltas - a.faltas || a.fila.id_persona - b.fila.id_persona)
    .map((p) => ({
      id: String(p.fila.id_persona),
      title: `Inasistencias consecutivas: ${p.nombreCompleto}`,
      message: `Registra ${p.faltas} faltas seguidas en su grupo.`,
      timeAgo: p.ultimaAsistencia ? `Última asistencia: ${p.ultimaAsistencia}` : 'Sin asistencias registradas',
      severity: p.faltas >= 3 ? 'critical' : 'warning',
      type: 'absence',
      relatedPersonId: String(p.fila.id_persona),
      read: false,
    }));
}

export async function obtenerEventos() {
  const [rows]: any = await pool.query(`
    SELECT e.id_evento, e.titulo, e.fecha, TIME_FORMAT(e.hora, '%H:%i') AS hora, e.lugar, e.tipo,
           e.publico_objetivo, e.estado, e.id_grupo, g.nombre AS grupo,
           (SELECT COUNT(*) FROM asistencia_evento a WHERE a.id_evento = e.id_evento) AS asistentes
    FROM evento e LEFT JOIN grupo g ON g.id_grupo = e.id_grupo
    WHERE e.activo = 1 ORDER BY e.fecha`);

  return rows.map((r: any) => ({
    id: String(r.id_evento),
    title: r.titulo,
    date: r.fecha,
    time: r.hora,
    location: r.lugar,
    type: r.tipo,
    attendeesCount: Number(r.asistentes),
    targetAudience: r.publico_objetivo ?? '',
    groupId: r.id_grupo ? String(r.id_grupo) : '',
    groupName: r.grupo ?? '',
    status: r.estado === 'cancelado' ? 'concluido' : r.estado,
  }));
}

export interface Alcance {
  todos: boolean;
  grupos: number[];
}

export async function calcularAlcance(sesion: Sesion): Promise<Alcance> {
  if (sesion.rol === 'pastor' || sesion.rol === 'asistente') return { todos: true, grupos: [] };

  const [filas]: any = await pool.query(
    'SELECT id_grupo FROM grupo WHERE activo = 1 AND (id_lider = ? OR id_asistente = ?)', [sesion.id, sesion.id]);
  return { todos: false, grupos: filas.map((f: any) => f.id_grupo) };
}

export const enAlcance = (alcance: Alcance, idGrupo: number | null | undefined) =>
  alcance.todos || (idGrupo != null && alcance.grupos.includes(idGrupo));

export async function datosIniciales(sesion: Sesion) {
  const personas = await obtenerPersonasConEstado();
  const grupos = await obtenerGruposConIndicadores(personas);
  const alcance = await calcularAlcance(sesion);

  const visibles = puede(sesion.rol, 'verMiembros')
    ? personas.filter((p) => enAlcance(alcance, p.fila.id_grupo))
    : [];

  return {
    people: personasParaPantalla(visibles),
    groups: gruposParaPantalla(grupos.filter((g) => enAlcance(alcance, g.fila.id_grupo))),
    notifications: puede(sesion.rol, 'verCuidado') ? alertasParaPantalla(visibles) : [],
    events: puede(sesion.rol, 'verEventos') ? await obtenerEventos() : [],
  };
}

export async function obtenerHistorial(idPersona: string) {
  const [filas]: any = await pool.query(`
    SELECT fase, fecha_inicio, fecha_fin, observaciones
    FROM historial_discipulado WHERE id_persona = ?
    ORDER BY fecha_inicio DESC, id_historial DESC`, [idPersona]);
  return filas.map((h: any) => ({
    phase: h.fase,
    from: h.fecha_inicio,
    to: h.fecha_fin,
    note: h.observaciones ?? '',
  }));
}

export async function obtenerGrupoDePersona(idPersona: string): Promise<number | null> {
  const [[p]]: any = await pool.query('SELECT id_grupo FROM persona WHERE id_persona = ?', [idPersona]);
  return p ? (p.id_grupo ?? null) : null;
}

export async function obtenerAsistentesEvento(idEvento: string): Promise<number[]> {
  const [filas]: any = await pool.query('SELECT id_persona FROM asistencia_evento WHERE id_evento = ?', [idEvento]);
  return filas.map((f: any) => f.id_persona);
}

export async function calcularResumen(personas: PersonaConEstado[], grupos: GrupoConIndicadores[]) {
  const [[nuevos]]: any = await pool.query(
    'SELECT COUNT(*) AS n FROM persona WHERE activo = 1 AND fecha_ingreso >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)');
  const [[proximos]]: any = await pool.query(
    "SELECT COUNT(*) AS n FROM evento WHERE activo = 1 AND estado = 'programado' AND fecha >= CURDATE()");

  return {
    personasActivas: personas.length,
    gruposActivos: grupos.length,
    asistenciaPromedio: promedio(grupos.map((g) => g.asistencia)),
    personasEnRojo: personas.filter((p) => p.semaforo === 'rojo').length,
    personasEnAmarillo: personas.filter((p) => p.semaforo === 'amarillo').length,
    nuevosUltimos90Dias: Number(nuevos.n),
    eventosProximos: Number(proximos.n),
  };
}

export async function resumenParaDashboard() {
  const personas = await obtenerPersonasConEstado();
  const grupos = await obtenerGruposConIndicadores(personas);
  const r = await calcularResumen(personas, grupos);
  return {
    personas_activas: r.personasActivas,
    grupos_activos: r.gruposActivos,
    asistencia_promedio: r.asistenciaPromedio === null ? null : r.asistenciaPromedio.toFixed(1),
    personas_en_rojo: r.personasEnRojo,
    personas_en_amarillo: r.personasEnAmarillo,
    nuevos_ultimos_90_dias: r.nuevosUltimos90Dias,
    eventos_proximos: r.eventosProximos,
  };
}

export async function obtenerGruposCercanos(lat: number, lng: number, radioKm: number, alcance?: Alcance) {
  const [grupos]: any = await pool.query(`
    SELECT id_grupo, codigo, nombre, direccion, barrio, dia_reunion, hora_reunion, latitud, longitud
    FROM grupo WHERE activo = 1`);

  return grupos
    .map((g: any) => ({ g, distancia: distanciaKm(lat, lng, Number(g.latitud), Number(g.longitud)) }))
    .filter(({ g }: any) => !alcance || enAlcance(alcance, g.id_grupo))
    .filter(({ distancia }: any) => distancia <= radioKm)
    .sort((a: any, b: any) => a.distancia - b.distancia)
    .map(({ g, distancia }: any) => ({
      id_grupo: g.id_grupo,
      codigo: g.codigo,
      nombre: g.nombre,
      direccion: g.direccion,
      barrio: g.barrio,
      dia_reunion: g.dia_reunion,
      hora_reunion: g.hora_reunion,
      distancia_km: distancia.toFixed(2),
    }));
}

export async function informeGeneral() {
  const personas = await obtenerPersonasConEstado();
  const grupos = await obtenerGruposConIndicadores(personas);
  const resumen = await calcularResumen(personas, grupos);

  const nombresFases = ['contacto', 'consolidacion', 'formacion', 'liderazgo'];
  const fases = nombresFases.map((fase, i) => ({
    orden: i + 1,
    fase,
    total: personas.filter((p) => p.fila.fase === fase).length,
  }));

  const cuidado = personas
    .filter((p) => p.semaforo !== 'verde')
    .sort((a, b) =>
      Number(b.semaforo === 'rojo') - Number(a.semaforo === 'rojo') ||
      b.faltas - a.faltas ||
      a.nombreCompleto.localeCompare(b.nombreCompleto, 'es'))
    .map((p) => ({
      codigo: p.fila.codigo,
      nombre: p.nombreCompleto,
      grupo: p.fila.grupo ?? 'Sin grupo',
      fase: p.fila.fase,
      mentor: p.fila.mentor ?? 'Sin asignar',
      faltas: p.faltas,
      ultimaAsistencia: p.ultimaAsistencia ?? 'Sin registro',
      semaforo: p.semaforo,
    }));

  const [sesiones]: any = await pool.query(`
    SELECT s.fecha, g.codigo, g.nombre AS grupo, s.tema,
           COALESCE(SUM(d.estado = 'presente'), 0) AS presentes,
           COALESCE(SUM(d.estado = 'falta_justificada'), 0) AS justificadas,
           COALESCE(SUM(d.estado = 'falta_injustificada'), 0) AS injustificadas
    FROM sesion_asistencia s
    JOIN grupo g ON g.id_grupo = s.id_grupo
    LEFT JOIN detalle_asistencia d ON d.id_sesion = s.id_sesion
    GROUP BY s.id_sesion, g.id_grupo
    ORDER BY s.fecha DESC, g.id_grupo
    LIMIT 24`);
  const [eventos]: any = await pool.query(`
    SELECT e.titulo, e.tipo, e.fecha, TIME_FORMAT(e.hora, '%H:%i') AS hora, e.lugar, e.estado,
           (SELECT COUNT(*) FROM asistencia_evento a WHERE a.id_evento = e.id_evento) AS asistentes
    FROM evento e WHERE e.activo = 1 ORDER BY e.fecha DESC`);
  const [roles]: any = await pool.query(`
    SELECT r.nombre AS rol, r.nivel_jerarquia AS nivel, COUNT(p.id_persona) AS personas
    FROM rol r
    LEFT JOIN persona_rol pr ON pr.id_rol = r.id_rol AND pr.activo = 1
    LEFT JOIN persona p ON p.id_persona = pr.id_persona AND p.activo = 1
    GROUP BY r.id_rol, r.nombre, r.nivel_jerarquia
    ORDER BY r.nivel_jerarquia`);
  const [nuevos]: any = await pool.query(`
    SELECT p.codigo, CONCAT(p.nombres, ' ', p.apellidos) AS nombre, g.nombre AS grupo, p.fase, p.fecha_ingreso
    FROM persona p LEFT JOIN grupo g ON g.id_grupo = p.id_grupo
    WHERE p.activo = 1 AND p.fecha_ingreso >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
    ORDER BY p.fecha_ingreso DESC, p.id_persona DESC`);
  const [[{ generado }]]: any = await pool.query('SELECT NOW() AS generado');

  return {
    generado,
    resumen: { ...resumen, asistenciaPromedio: resumen.asistenciaPromedio ?? 0 },
    fases,
    grupos: grupos.map((g) => ({
      codigo: g.fila.codigo, nombre: g.fila.nombre, zona: g.fila.zona, distrito: g.fila.distrito,
      lider: g.fila.lider ?? 'Sin líder',
      reunion: `${g.fila.dia_reunion} ${g.fila.hora}`,
      miembros: g.miembros, sesiones: g.sesiones, asistencia: g.asistencia ?? 0,
      rojos: g.rojos, amarillos: g.amarillos,
    })),
    cuidado,
    sesiones: sesiones.map((s: any) => ({
      fecha: s.fecha, codigo: s.codigo, grupo: s.grupo, tema: s.tema ?? '',
      presentes: Number(s.presentes), justificadas: Number(s.justificadas), injustificadas: Number(s.injustificadas),
    })),
    eventos: eventos.map((e: any) => ({
      titulo: e.titulo, tipo: e.tipo, fecha: e.fecha, hora: e.hora, lugar: e.lugar,
      estado: e.estado, asistentes: Number(e.asistentes),
    })),
    roles: roles.map((r: any) => ({ rol: r.rol, nivel: Number(r.nivel), personas: Number(r.personas) })),
    nuevos: nuevos.map((n: any) => ({
      codigo: n.codigo, nombre: n.nombre, grupo: n.grupo ?? 'Sin grupo', fase: n.fase, ingreso: n.fecha_ingreso,
    })),
  };
}
