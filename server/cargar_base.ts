import fs from 'node:fs';
import mysql from 'mysql2/promise';
import { opcionesConexion } from './db';
import { asignarAccesosDemo } from './crear_accesos';

const archivo = process.env.SQL_ARCHIVO || 'database/misiontec_bd.sql';

async function main() {
  const opciones = opcionesConexion();

  if (!process.argv.includes('--confirmar')) {
    console.log(`Esto BORRA y vuelve a crear la base "misiontec" en ${opciones.host}:${opciones.port}`);
    console.log(`con las tablas y los datos de ejemplo de ${archivo}.`);
    console.log('Si estás seguro, ejecuta:  npm run db:cargar -- --confirmar');
    process.exit(1);
  }

  const sql = fs.readFileSync(archivo, 'utf8');
  const conexion = await mysql.createConnection({
    ...opciones,
    multipleStatements: true,
    charset: 'UTF8MB4_SPANISH_CI',
  });

  try {
    await conexion.query(sql);
    const [[r]]: any = await conexion.query(
      "SELECT COUNT(*) AS tablas FROM information_schema.tables WHERE table_schema = DATABASE() AND table_type = 'BASE TABLE'");
    const [[p]]: any = await conexion.query('SELECT COUNT(*) AS personas FROM persona');
    console.log(`Base cargada en ${opciones.host}: ${r.tablas} tablas y ${p.personas} personas.`);
    await asignarAccesosDemo((sql, params) => conexion.query(sql, params));
  } finally {
    await conexion.end();
  }
}

main().catch((err) => {
  console.error('No se pudo cargar la base:', err.sqlMessage || err.message);
  process.exit(1);
});
