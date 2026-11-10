import { pool } from './db';
import { hashClave } from './sesion';

type Consulta = (sql: string, params?: any[]) => Promise<any>;

const ACCESOS_INICIALES = [
  { codigo: 'MT-0001', clave: '1' },
  { codigo: 'MT-0002', clave: '2' },
  { codigo: 'MT-0003', clave: '3' },
];

export async function asignarAccesosDemo(consultar: Consulta) {
  const unica = process.env.CLAVE_INICIAL;

  for (const acceso of ACCESOS_INICIALES) {
    await consultar('UPDATE persona SET contrasena_hash = ? WHERE codigo = ?', [hashClave(unica || acceso.clave), acceso.codigo]);
  }

  const [filas] = await consultar(
    `SELECT p.codigo, p.numero_documento AS documento, r.nombre AS rol
     FROM persona p
     JOIN persona_rol pr ON pr.id_persona = p.id_persona AND pr.activo = 1
     JOIN rol r ON r.id_rol = pr.id_rol
     WHERE p.codigo IN (?) AND p.contrasena_hash IS NOT NULL
     ORDER BY r.nivel_jerarquia`, [ACCESOS_INICIALES.map((a) => a.codigo)]);

  console.log('\nAccesos iniciales (documento y contraseña):');
  for (const f of filas) {
    const clave = unica || ACCESOS_INICIALES.find((a) => a.codigo === f.codigo)!.clave;
    console.log(`  ${f.rol.padEnd(20)} documento ${f.documento}   contraseña ${clave}`);
  }
}

if (process.argv[1]?.endsWith('crear_accesos.ts')) {
  asignarAccesosDemo((sql, params) => pool.query(sql, params))
    .then(() => pool.end())
    .catch((err) => {
      console.error('No se pudieron crear los accesos:', err.sqlMessage || err.message);
      process.exit(1);
    });
}
