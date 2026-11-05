import { pool, withTransaction } from './db';
import { FASES, separarNombre } from './mappers';
import { CORREO_VALIDO, ESTADOS_ASISTENCIA } from './calculos';
import { ErrorNegocio } from './errores';

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

    await conn.query(
      "INSERT INTO persona_rol (id_persona, id_rol, fecha_inicio) SELECT ?, id_rol, CURDATE() FROM rol WHERE nombre = 'Discípulo'",
      [r.insertId]);

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
