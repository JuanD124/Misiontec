import fs from 'node:fs';
import mysql from 'mysql2/promise';
import { opcionesConexion } from './db';

const archivo = process.env.SQL_EJEMPLO || 'database/datos_ejemplo.sql';

async function main() {
  const opciones = opcionesConexion();
  const base = process.env.DB_NAME || 'misiontec';

  if (!process.argv.includes('--confirmar')) {
    console.log(`Esto AGREGA unos pocos datos de ejemplo (2 grupos, 9 discípulos, asistencias y 3 eventos) a "${base}" en ${opciones.host}:${opciones.port}.`);
    console.log('No borra nada. Para continuar ejecuta:  npm run db:ejemplo -- --confirmar');
    process.exit(1);
  }

  const conexion = await mysql.createConnection({
    ...opciones,
    database: base,
    multipleStatements: true,
    charset: 'UTF8MB4_SPANISH_CI',
  });

  try {
    const [[g]]: any = await conexion.query('SELECT COUNT(*) AS total FROM grupo');
    const [[p]]: any = await conexion.query('SELECT COUNT(*) AS total FROM persona');
    if (g.total > 0 || p.total > 3) {
      console.log('La base ya tiene datos propios (grupos o más de las 3 cuentas iniciales). No se agregó nada para no mezclarlos.');
      process.exit(1);
    }
    await conexion.query(fs.readFileSync(archivo, 'utf8'));
    const [[r]]: any = await conexion.query(
      'SELECT (SELECT COUNT(*) FROM persona) AS personas, (SELECT COUNT(*) FROM grupo) AS grupos, (SELECT COUNT(*) FROM evento) AS eventos');
    console.log(`Datos de ejemplo cargados en ${opciones.host}: ${r.personas} personas, ${r.grupos} grupos y ${r.eventos} eventos.`);
  } finally {
    await conexion.end();
  }
}

main().catch((err) => {
  console.error('No se pudieron cargar los datos de ejemplo:', err.sqlMessage || err.message);
  process.exit(1);
});
