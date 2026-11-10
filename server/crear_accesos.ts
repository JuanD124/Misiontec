import crypto from 'node:crypto';
import { pool } from './db';
import { hashClave } from './sesion';

type Consulta = (sql: string, params?: any[]) => Promise<any>;

const CODIGOS_DEMO = ['MT-0001', 'MT-0002', 'MT-0003'];

export function claveDemo(): { clave: string; generada: boolean } {
  const definida = process.env.CLAVE_DEMO;
  if (definida) return { clave: definida, generada: false };
  return { clave: crypto.randomBytes(6).toString('base64url'), generada: true };
}

export async function asignarAccesosDemo(consultar: Consulta) {
  const { clave, generada } = claveDemo();
  const hash = hashClave(clave);

  for (const codigo of CODIGOS_DEMO) {
    await consultar('UPDATE persona SET contrasena_hash = ? WHERE codigo = ?', [hash, codigo]);
  }

  const [filas] = await consultar(
    `SELECT p.numero_documento AS documento, CONCAT(p.nombres, ' ', p.apellidos) AS nombre, r.nombre AS rol
     FROM persona p
     JOIN persona_rol pr ON pr.id_persona = p.id_persona AND pr.activo = 1
     JOIN rol r ON r.id_rol = pr.id_rol
     WHERE p.codigo IN (?) AND p.contrasena_hash IS NOT NULL
     ORDER BY r.nivel_jerarquia`, [CODIGOS_DEMO]);

  console.log('\nAccesos de demostración (entra con el documento y la contraseña):');
  for (const f of filas) console.log(`  ${f.rol.padEnd(20)} documento ${f.documento}   ${f.nombre}`);
  console.log(generada
    ? `\nContraseña generada: ${clave}\n(Anótala ahora; no se vuelve a mostrar. Para fijar otra, define CLAVE_DEMO en el .env.)`
    : '\nContraseña: la que definiste en CLAVE_DEMO.');
}

if (process.argv[1]?.endsWith('crear_accesos.ts')) {
  asignarAccesosDemo((sql, params) => pool.query(sql, params))
    .then(() => pool.end())
    .catch((err) => {
      console.error('No se pudieron crear los accesos:', err.sqlMessage || err.message);
      process.exit(1);
    });
}
