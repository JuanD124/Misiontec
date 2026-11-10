import { pool, withTransaction } from './db';
import { FASES, separarNombre } from './mappers';
import { CORREO_VALIDO, ESTADOS_ASISTENCIA } from './calculos';
import { ErrorNegocio } from './errores';
import { rolDesdeBase } from '../src/data/roles';
import { hashClave, verificarClave, CLAVE_MINIMA } from './sesion';
import type { Alcance } from './consultas';

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
  const anioNacimiento = b.age ? new Date().getFullYear() - Number(b.age) : null;
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
      [siguiente, documento, nombres, apellidos, anioNacimiento ? `${anioNacimiento}-01-01` : null,
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
    'SELECT TIMESTAMPDIFF(YEAR, fecha_nacimiento, CURDATE()) AS edad FROM persona WHERE id_persona = ? AND activo = 1', [id]);
  if (!actual) throw new ErrorNegocio(404, 'La persona no existe.');

  const edadNueva = Number(b.age) || null;
  const cambiaEdad = edadNueva !== null && edadNueva !== (actual.edad === null ? null : Number(actual.edad));
  const campos = ['nombres = ?', 'apellidos = ?', 'genero = ?', 'telefono = ?', 'correo = ?', 'direccion = ?', 'id_grupo = ?', 'notas_criticas = ?'];
  const valores: any[] = [nombres, apellidos, b.gender || null, b.phone || null, b.email || null,
    b.address || null, b.groupId || null, b.criticalNotes || null];
  if (cambiaEdad) {
    campos.push('fecha_nacimiento = ?');
    valores.push(`${new Date().getFullYear() - edadNueva!}-01-01`);
  }

  await pool.query(`UPDATE persona SET ${campos.join(', ')} WHERE id_persona = ? AND activo = 1`, [...valores, id]);
}

export async function definirAcceso(id: string, clave: unknown): Promise<void> {
  if (typeof clave !== 'string' || clave.length < CLAVE_MINIMA) {
    throw new ErrorNegocio(400, `La contraseña debe tener al menos ${CLAVE_MINIMA} caracteres.`);
  }
  const [r]: any = await pool.query(
    'UPDATE persona SET contrasena_hash = ? WHERE id_persona = ? AND activo = 1', [hashClave(clave), id]);
  if (r.affectedRows === 0) throw new ErrorNegocio(404, 'La persona no existe.');
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

  const [r]: any = await pool.query(
    `INSERT INTO evento (titulo, tipo, fecha, hora, lugar, publico_objetivo, id_grupo, estado)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'programado')`,
    [titulo, b.type, b.date, b.time, lugar, String(b.targetAudience ?? '').trim().slice(0, 100) || null,
     b.groupId || null]);
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
