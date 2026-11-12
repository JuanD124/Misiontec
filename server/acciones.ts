import { pool, withTransaction } from './db';
import { FASES, separarNombre } from './mappers';
import { CORREO_VALIDO, ESTADOS_ASISTENCIA } from './calculos';
import { ErrorNegocio } from './errores';
import { rolDesdeBase, ROLES } from '../src/data/roles';
import { hashClave, verificarClave, CLAVE_MINIMA } from './sesion';
import { edadEn } from './consultas';
import type { Alcance } from './consultas';

function validarFechaNacimiento(valor: unknown, obligatoria: boolean): string | null {
  const texto = typeof valor === 'string' ? valor.trim() : '';
  if (!texto) {
    if (obligatoria) throw new ErrorNegocio(400, 'Escribe la fecha de nacimiento.');
    return null;
  }
  const fecha = new Date(`${texto}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto) || Number.isNaN(fecha.getTime()) || fecha.toISOString().slice(0, 10) !== texto) {
    throw new ErrorNegocio(400, 'La fecha de nacimiento no es válida.');
  }
  const hoy = new Date().toISOString().slice(0, 10);
  if (texto > hoy) throw new ErrorNegocio(400, 'La fecha de nacimiento no puede ser futura.');
  if (edadEn(texto, hoy) > 110) throw new ErrorNegocio(400, 'La fecha de nacimiento no es posible (más de 110 años).');
  return texto;
}

export async function registrarPersona(b: any): Promise<number> {
  const nombreCompleto = String(b.fullName ?? '').trim();
  const documento = String(b.dni ?? '').trim();
  if (!nombreCompleto || !documento) {
    throw new ErrorNegocio(400, 'El nombre completo y el documento son obligatorios.');
  }
  if (b.email && !CORREO_VALIDO.test(b.email)) {
    throw new ErrorNegocio(400, 'El correo no tiene un formato válido.');
  }

  const { nombres, apellidos } = separarNombre(nombreCompleto);
  const nacimiento = validarFechaNacimiento(b.birthDate, true);
  const fase = FASES.includes(b.phase) ? b.phase : 'contacto';

  return withTransaction(async (conn) => {
    const [g]: any = await conn.query('SELECT id_lider FROM grupo WHERE id_grupo = ?', [b.groupId || null]);
    const [[{ siguiente }]]: any = await conn.query(
      "SELECT CONCAT('MT-', LPAD(IFNULL(MAX(id_persona), 0) + 1, 4, '0')) AS siguiente FROM persona");

    const [r]: any = await conn.query(
      `INSERT INTO persona (codigo, numero_documento, nombres, apellidos, fecha_nacimiento, genero,
                            telefono, correo, direccion, id_grupo, id_mentor, fase, fecha_ingreso,
                            notas_criticas, autoriza_datos, fecha_autorizacion)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), ?, 1, NOW())`,
      [siguiente, documento, nombres, apellidos, nacimiento,
       b.gender || null, b.phone || null, b.email || null, b.address || null,
       b.groupId || null, g[0]?.id_lider ?? null, fase, b.criticalNotes || null]);

    await conn.query(
      `INSERT INTO historial_discipulado (id_persona, fase, fecha_inicio, observaciones)
       VALUES (?, ?, CURDATE(), 'Registro inicial')`,
      [r.insertId, fase]);

    for (const tag of b.tags ?? []) {
      await conn.query('INSERT IGNORE INTO etiqueta (nombre) VALUES (?)', [tag]);
      await conn.query(
        'INSERT IGNORE INTO persona_etiqueta (id_persona, id_etiqueta) SELECT ?, id_etiqueta FROM etiqueta WHERE nombre = ?',
        [r.insertId, tag]);
    }
    return r.insertId;
  });
}

export async function cambiarFase(idPersona: string, fase: string): Promise<void> {
  if (!FASES.includes(fase)) {
    throw new ErrorNegocio(400, 'Fase de discipulado no válida.');
  }

  await withTransaction(async (conn) => {
    const [[persona]]: any = await conn.query('SELECT fase FROM persona WHERE id_persona = ?', [idPersona]);
    if (!persona) throw new ErrorNegocio(404, 'La persona no existe.');
    if (persona.fase === fase) return;

    await conn.query('UPDATE persona SET fase = ? WHERE id_persona = ?', [fase, idPersona]);
    await conn.query(
      'UPDATE historial_discipulado SET fecha_fin = CURDATE() WHERE id_persona = ? AND fecha_fin IS NULL',
      [idPersona]);
    await conn.query(
      `INSERT INTO historial_discipulado (id_persona, fase, fecha_inicio, observaciones)
       VALUES (?, ?, CURDATE(), 'Cambio de fase')`,
      [idPersona, fase]);
  });
}

export async function desactivarPersona(idPersona: string): Promise<void> {
  const [r]: any = await pool.query('UPDATE persona SET activo = 0 WHERE id_persona = ?', [idPersona]);
  if (r.affectedRows === 0) throw new ErrorNegocio(404, 'La persona no existe.');
}

export async function registrarAsistencia(b: any): Promise<void> {
  const { groupId, date, topic, items } = b;
  if (!groupId || !date || !items || typeof items !== 'object') {
    throw new ErrorNegocio(400, 'Faltan datos de la asistencia (grupo, fecha o lista).');
  }
  for (const estado of Object.values(items as Record<string, string>)) {
    if (!ESTADOS_ASISTENCIA.includes(estado)) {
      throw new ErrorNegocio(400, 'Estado de asistencia no válido.');
    }
  }

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
}

const HASH_FALSO = hashClave('clave-que-nadie-usa');

export async function validarCredenciales(documento: string, clave: string) {
  const [filas]: any = await pool.query(`
    SELECT p.id_persona, p.nombres, p.apellidos, p.contrasena_hash, r.nombre AS rol
    FROM persona p
    JOIN persona_rol pr ON pr.id_persona = p.id_persona AND pr.activo = 1
    JOIN rol r ON r.id_rol = pr.id_rol
    WHERE p.numero_documento = ? AND p.activo = 1 AND p.contrasena_hash IS NOT NULL
    ORDER BY r.nivel_jerarquia`, [documento]);

  if (filas.length === 0) {
    verificarClave(clave, HASH_FALSO);
    return null;
  }
  for (const f of filas) {
    if (verificarClave(clave, f.contrasena_hash)) {
      const rol = rolDesdeBase(f.rol);
      if (rol) return { id: f.id_persona as number, nombre: `${f.nombres} ${f.apellidos}`.trim(), rol };
    }
  }
  return null;
}

export async function editarPersona(id: string, b: any): Promise<void> {
  const nombreCompleto = String(b.fullName ?? '').trim();
  if (!nombreCompleto) throw new ErrorNegocio(400, 'El nombre completo es obligatorio.');
  if (b.email && !CORREO_VALIDO.test(b.email)) {
    throw new ErrorNegocio(400, 'El correo no tiene un formato válido.');
  }

  const { nombres, apellidos } = separarNombre(nombreCompleto);

  const [[actual]]: any = await pool.query(
    'SELECT fecha_nacimiento FROM persona WHERE id_persona = ? AND activo = 1', [id]);
  if (!actual) throw new ErrorNegocio(404, 'La persona no existe.');

  const nacimiento = validarFechaNacimiento(b.birthDate, Boolean(actual.fecha_nacimiento));
  const campos = ['nombres = ?', 'apellidos = ?', 'genero = ?', 'telefono = ?', 'correo = ?', 'direccion = ?', 'id_grupo = ?', 'notas_criticas = ?'];
  const valores: any[] = [nombres, apellidos, b.gender || null, b.phone || null, b.email || null,
    b.address || null, b.groupId || null, b.criticalNotes || null];
  if (nacimiento) {
    campos.push('fecha_nacimiento = ?');
    valores.push(nacimiento);
  }

  await pool.query(`UPDATE persona SET ${campos.join(', ')} WHERE id_persona = ? AND activo = 1`, [...valores, id]);
}

export async function definirAcceso(id: string, clave: unknown, rol: unknown, idQuienPide: number): Promise<void> {
  const hayClaveNueva = typeof clave === 'string' && clave.length > 0;
  if (hayClaveNueva && (clave as string).length < CLAVE_MINIMA) {
    throw new ErrorNegocio(400, `La contraseña debe tener al menos ${CLAVE_MINIMA} caracteres.`);
  }
  if (clave !== undefined && clave !== null && typeof clave !== 'string') {
    throw new ErrorNegocio(400, 'La contraseña no es válida.');
  }
  const infoRol = ROLES.find((r) => r.clave === rol);
  if (!infoRol) throw new ErrorNegocio(400, 'Elige el rol que tendrá esta persona.');
  if (Number(id) === idQuienPide && infoRol.clave !== 'pastor') {
    throw new ErrorNegocio(400, 'No puedes quitarte a ti mismo el rol de Pastor.');
  }

  await withTransaction(async (conn) => {
    const [[persona]]: any = await conn.query(
      'SELECT id_persona, contrasena_hash FROM persona WHERE id_persona = ? AND activo = 1', [id]);
    if (!persona) throw new ErrorNegocio(404, 'La persona no existe.');
    if (!hayClaveNueva && !persona.contrasena_hash) {
      throw new ErrorNegocio(400, 'Escribe una contraseña para crear el acceso.');
    }
    const [[rolBase]]: any = await conn.query('SELECT id_rol FROM rol WHERE nombre = ? AND activo = 1', [infoRol.nombreEnBase]);
    if (!rolBase) throw new ErrorNegocio(500, 'El rol no existe en la base de datos.');

    if (hayClaveNueva) {
      await conn.query('UPDATE persona SET contrasena_hash = ? WHERE id_persona = ?', [hashClave(clave as string), id]);
    }
    await conn.query(
      'UPDATE persona_rol SET activo = 0, fecha_fin = CURDATE() WHERE id_persona = ? AND activo = 1 AND id_rol <> ?',
      [id, rolBase.id_rol]);
    const [[vigente]]: any = await conn.query(
      'SELECT id_persona_rol FROM persona_rol WHERE id_persona = ? AND id_rol = ? AND activo = 1', [id, rolBase.id_rol]);
    if (!vigente) {
      await conn.query(
        `INSERT INTO persona_rol (id_persona, id_rol, fecha_inicio) VALUES (?, ?, CURDATE())
         ON DUPLICATE KEY UPDATE activo = 1, fecha_fin = NULL`,
        [id, rolBase.id_rol]);
    }
  });
}

export async function crearAcceso(b: any): Promise<number> {
  const nombreCompleto = String(b.fullName ?? '').trim();
  const documento = String(b.dni ?? '').trim();
  const clave = b.password;
  const infoRol = ROLES.find((r) => r.clave === b.role);

  if (nombreCompleto.length < 3) throw new ErrorNegocio(400, 'Escribe el nombre completo de la persona.');
  if (!documento) throw new ErrorNegocio(400, 'Escribe el número de documento: es con el que va a iniciar sesión.');
  if (documento.length > 20) throw new ErrorNegocio(400, 'El documento es demasiado largo (máximo 20 caracteres).');
  if (!infoRol) throw new ErrorNegocio(400, 'Elige el rol: Asistente pastoral, Discipulador o Pastor.');
  if (typeof clave !== 'string' || clave.length < CLAVE_MINIMA) {
    throw new ErrorNegocio(400, `La contraseña debe tener al menos ${CLAVE_MINIMA} caracteres.`);
  }
  if (b.email && !CORREO_VALIDO.test(b.email)) throw new ErrorNegocio(400, 'El correo no tiene un formato válido.');

  const { nombres, apellidos } = separarNombre(nombreCompleto);

  return withTransaction(async (conn) => {
    const [[repetido]]: any = await conn.query(
      "SELECT codigo FROM persona WHERE tipo_documento = 'CC' AND numero_documento = ?", [documento]);
    if (repetido) throw new ErrorNegocio(409, `Ya existe una persona con el documento ${documento} (${repetido.codigo}). Búscala en Discípulos y créale el acceso desde su ficha.`);

    const [[rolBase]]: any = await conn.query('SELECT id_rol FROM rol WHERE nombre = ? AND activo = 1', [infoRol.nombreEnBase]);
    if (!rolBase) throw new ErrorNegocio(500, 'El rol no existe en la base de datos.');

    const [[{ siguiente }]]: any = await conn.query(
      "SELECT CONCAT('MT-', LPAD(IFNULL(MAX(id_persona), 0) + 1, 4, '0')) AS siguiente FROM persona");
    const [r]: any = await conn.query(
      `INSERT INTO persona (codigo, numero_documento, nombres, apellidos, telefono, correo, fase, fecha_ingreso,
                            autoriza_datos, fecha_autorizacion, contrasena_hash)
       VALUES (?, ?, ?, ?, ?, ?, 'liderazgo', CURDATE(), 1, NOW(), ?)`,
      [siguiente, documento, nombres, apellidos, b.phone || null, b.email || null, hashClave(clave)]);
    await conn.query(
      `INSERT INTO historial_discipulado (id_persona, fase, fecha_inicio, observaciones)
       VALUES (?, 'liderazgo', CURDATE(), 'Registro inicial')`, [r.insertId]);
    await conn.query('INSERT INTO persona_rol (id_persona, id_rol, fecha_inicio) VALUES (?, ?, CURDATE())', [r.insertId, rolBase.id_rol]);
    return r.insertId;
  });
}

export async function quitarAcceso(id: string, idQuienPide: number): Promise<void> {
  if (Number(id) === idQuienPide) throw new ErrorNegocio(400, 'No puedes quitarte tu propio acceso.');
  await withTransaction(async (conn) => {
    const [r]: any = await conn.query(
      'UPDATE persona SET contrasena_hash = NULL WHERE id_persona = ? AND activo = 1', [id]);
    if (r.affectedRows === 0) throw new ErrorNegocio(404, 'La persona no existe.');
    await conn.query('UPDATE persona_rol SET activo = 0, fecha_fin = CURDATE() WHERE id_persona = ? AND activo = 1', [id]);
  });
}

const DIAS_REUNION = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const ESTADOS_GRUPO = ['activo', 'observacion', 'inactivo'];

function validarGrupo(b: any) {
  const nombre = String(b.name ?? '').trim();
  const direccion = String(b.address ?? '').trim();
  const distrito = String(b.district ?? '').trim();
  const zona = String(b.zone ?? '').trim();
  const barrio = String(b.neighborhood ?? '').trim();
  const lat = Number(b.lat);
  const lng = Number(b.lng);

  if (nombre.length < 3) throw new ErrorNegocio(400, 'Escribe el nombre del grupo (mínimo 3 letras).');
  if (nombre.length > 100) throw new ErrorNegocio(400, 'El nombre del grupo es demasiado largo (máximo 100 caracteres).');
  if (!direccion) throw new ErrorNegocio(400, 'Escribe la dirección donde se reúne el grupo.');
  if (direccion.length > 150) throw new ErrorNegocio(400, 'La dirección es demasiado larga (máximo 150 caracteres).');
  if (!distrito || !zona) throw new ErrorNegocio(400, 'Indica el distrito y la zona del grupo.');
  if (distrito.length > 100 || zona.length > 100) throw new ErrorNegocio(400, 'El distrito o la zona son demasiado largos.');
  if (barrio.length > 80) throw new ErrorNegocio(400, 'El barrio es demasiado largo (máximo 80 caracteres).');
  if (b.lat === '' || b.lat == null || b.lng === '' || b.lng == null || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new ErrorNegocio(400, 'Marca la ubicación del grupo en el mapa.');
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    throw new ErrorNegocio(400, 'La ubicación no es válida (latitud entre -90 y 90, longitud entre -180 y 180).');
  }
  if (!DIAS_REUNION.includes(b.meetingDay)) throw new ErrorNegocio(400, 'Elige el día de reunión.');
  if (!/^\d{2}:\d{2}$/.test(String(b.meetingTime ?? ''))) throw new ErrorNegocio(400, 'La hora de reunión no es válida.');
  const estado = b.status === undefined || b.status === '' ? 'activo' : b.status;
  if (!ESTADOS_GRUPO.includes(estado)) throw new ErrorNegocio(400, 'El estado del grupo no es válido.');

  return {
    nombre, direccion, distrito, zona, barrio: barrio || null,
    lat: Number(lat.toFixed(7)), lng: Number(lng.toFixed(7)),
    dia: b.meetingDay as string, hora: b.meetingTime as string, estado: estado as string,
    idLider: b.leaderId ? Number(b.leaderId) : null,
    idAsistente: b.assistantId ? Number(b.assistantId) : null,
  };
}

async function buscarOCrearZona(conn: any, distrito: string, zona: string): Promise<number> {
  await conn.query('INSERT IGNORE INTO distrito (nombre) VALUES (?)', [distrito]);
  const [[d]]: any = await conn.query('SELECT id_distrito FROM distrito WHERE nombre = ?', [distrito]);
  await conn.query('INSERT IGNORE INTO zona (id_distrito, nombre) VALUES (?, ?)', [d.id_distrito, zona]);
  const [[z]]: any = await conn.query('SELECT id_zona FROM zona WHERE id_distrito = ? AND nombre = ?', [d.id_distrito, zona]);
  return z.id_zona;
}

async function comprobarPersonaActiva(conn: any, id: number | null, etiqueta: string) {
  if (id === null) return;
  const [[p]]: any = await conn.query('SELECT id_persona FROM persona WHERE id_persona = ? AND activo = 1', [id]);
  if (!p) throw new ErrorNegocio(400, `${etiqueta} no existe o fue eliminado.`);
}

export async function crearGrupo(b: any): Promise<number> {
  const g = validarGrupo(b);
  return withTransaction(async (conn) => {
    await comprobarPersonaActiva(conn, g.idLider, 'El líder elegido');
    await comprobarPersonaActiva(conn, g.idAsistente, 'El asistente elegido');
    const idZona = await buscarOCrearZona(conn, g.distrito, g.zona);
    const [[{ siguiente }]]: any = await conn.query(
      "SELECT CONCAT('GC-', LPAD(IFNULL(MAX(id_grupo), 0) + 1, 3, '0')) AS siguiente FROM grupo");
    const [r]: any = await conn.query(
      `INSERT INTO grupo (codigo, nombre, id_zona, id_lider, id_asistente, direccion, barrio, latitud, longitud,
                          dia_reunion, hora_reunion, estado, fecha_apertura)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE())`,
      [siguiente, g.nombre, idZona, g.idLider, g.idAsistente, g.direccion, g.barrio, g.lat, g.lng, g.dia, g.hora, g.estado]);
    return r.insertId;
  });
}

export async function editarGrupo(id: string, b: any): Promise<void> {
  const g = validarGrupo(b);
  await withTransaction(async (conn) => {
    const [[actual]]: any = await conn.query('SELECT id_lider FROM grupo WHERE id_grupo = ? AND activo = 1', [id]);
    if (!actual) throw new ErrorNegocio(404, 'El grupo no existe.');
    await comprobarPersonaActiva(conn, g.idLider, 'El líder elegido');
    await comprobarPersonaActiva(conn, g.idAsistente, 'El asistente elegido');
    const idZona = await buscarOCrearZona(conn, g.distrito, g.zona);
    await conn.query(
      `UPDATE grupo SET nombre = ?, id_zona = ?, id_lider = ?, id_asistente = ?, direccion = ?, barrio = ?,
              latitud = ?, longitud = ?, dia_reunion = ?, hora_reunion = ?, estado = ? WHERE id_grupo = ?`,
      [g.nombre, idZona, g.idLider, g.idAsistente, g.direccion, g.barrio, g.lat, g.lng, g.dia, g.hora, g.estado, id]);
    if (g.idLider !== (actual.id_lider ?? null)) {
      await conn.query(
        'UPDATE persona SET id_mentor = ? WHERE id_grupo = ? AND activo = 1 AND (id_mentor IS NULL OR id_mentor = ?)',
        [g.idLider, id, actual.id_lider ?? 0]);
    }
  });
}

export async function eliminarGrupo(id: string): Promise<void> {
  await withTransaction(async (conn) => {
    const [[g]]: any = await conn.query('SELECT id_grupo FROM grupo WHERE id_grupo = ? AND activo = 1', [id]);
    if (!g) throw new ErrorNegocio(404, 'El grupo no existe.');
    const [[{ total }]]: any = await conn.query(
      'SELECT COUNT(*) AS total FROM persona WHERE id_grupo = ? AND activo = 1', [id]);
    if (total > 0) {
      throw new ErrorNegocio(409, `Este grupo tiene ${total} ${total === 1 ? 'discípulo' : 'discípulos'}. Pásalos a otro grupo antes de eliminarlo.`);
    }
    await conn.query('UPDATE grupo SET activo = 0 WHERE id_grupo = ?', [id]);
  });
}

export async function eliminarEvento(idEvento: string): Promise<void> {
  const [r]: any = await pool.query('UPDATE evento SET activo = 0 WHERE id_evento = ? AND activo = 1', [idEvento]);
  if (r.affectedRows === 0) throw new ErrorNegocio(404, 'El evento no existe.');
}

const TIPOS_EVENTO = ['culto', 'taller', 'retiro', 'vigilia', 'evangelismo'];

export async function crearEvento(b: any): Promise<number> {
  const titulo = String(b.title ?? '').trim();
  const lugar = String(b.location ?? '').trim();
  if (!titulo || !lugar) throw new ErrorNegocio(400, 'El título y el lugar son obligatorios.');
  if (titulo.length > 150) throw new ErrorNegocio(400, 'El título es demasiado largo (máximo 150 caracteres).');
  if (!TIPOS_EVENTO.includes(b.type)) throw new ErrorNegocio(400, 'El tipo de evento no es válido.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(b.date ?? ''))) throw new ErrorNegocio(400, 'La fecha no es válida.');
  if (!/^\d{2}:\d{2}$/.test(String(b.time ?? ''))) throw new ErrorNegocio(400, 'La hora no es válida.');

  const sinLat = b.lat === undefined || b.lat === null || b.lat === '';
  const sinLng = b.lng === undefined || b.lng === null || b.lng === '';
  let lat: number | null = null;
  let lng: number | null = null;
  if (sinLat !== sinLng) {
    throw new ErrorNegocio(400, 'Para ubicar el evento en el mapa se necesitan la latitud y la longitud.');
  }
  if (!sinLat) {
    lat = Number(b.lat);
    lng = Number(b.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      throw new ErrorNegocio(400, 'La ubicación no es válida (latitud entre -90 y 90, longitud entre -180 y 180).');
    }
    lat = Number(lat.toFixed(7));
    lng = Number(lng.toFixed(7));
  }

  const [r]: any = await pool.query(
    `INSERT INTO evento (titulo, tipo, fecha, hora, lugar, publico_objetivo, latitud, longitud, estado)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'programado')`,
    [titulo, b.type, b.date, b.time, lugar, String(b.targetAudience ?? '').trim().slice(0, 100) || null, lat, lng]);
  return r.insertId;
}

export async function registrarAsistenciaEvento(idEvento: string, ids: unknown, alcance: Alcance): Promise<void> {
  if (!Array.isArray(ids)) throw new ErrorNegocio(400, 'Envía la lista de personas asistentes.');
  const personaIds = [...new Set(ids.map(Number))];
  if (personaIds.some((n) => !Number.isInteger(n) || n <= 0)) {
    throw new ErrorNegocio(400, 'La lista de personas no es válida.');
  }

  await withTransaction(async (conn) => {
    const [[evento]]: any = await conn.query('SELECT id_evento FROM evento WHERE id_evento = ? AND activo = 1', [idEvento]);
    if (!evento) throw new ErrorNegocio(404, 'El evento no existe.');

    const [permitidas]: any = alcance.todos
      ? await conn.query('SELECT id_persona FROM persona WHERE activo = 1')
      : await conn.query('SELECT id_persona FROM persona WHERE activo = 1 AND id_grupo IN (?)',
          [alcance.grupos.length ? alcance.grupos : [0]]);
    const idsPermitidos = new Set<number>(permitidas.map((p: any) => p.id_persona));

    if (personaIds.some((n) => !idsPermitidos.has(n))) {
      throw new ErrorNegocio(403, 'Hay personas fuera de tu alcance.');
    }
    if (idsPermitidos.size > 0) {
      await conn.query('DELETE FROM asistencia_evento WHERE id_evento = ? AND id_persona IN (?)',
        [idEvento, [...idsPermitidos]]);
    }
    for (const id of personaIds) {
      await conn.query('INSERT INTO asistencia_evento (id_evento, id_persona) VALUES (?, ?)', [idEvento, id]);
    }
  });
}
