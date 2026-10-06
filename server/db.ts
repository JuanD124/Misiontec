import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Pool de conexiones a la base de datos MySQL de MISIONTEC.
// Los datos de conexión se leen del archivo .env (ver .env.example).
export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'misiontec',
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true, // las fechas llegan como texto 'YYYY-MM-DD', igual que en el front
  charset: 'UTF8MB4_SPANISH_CI', // misma intercalación de la base de datos
});

/**
 * Ejecuta una operación con una conexión propia, indicando a MySQL qué
 * usuario de la aplicación está haciendo el cambio (lo usan los triggers
 * de auditoría a través de la variable @id_usuario_app).
 */
export async function withUser<T>(
  idUsuario: number,
  fn: (conn: mysql.PoolConnection) => Promise<T>,
): Promise<T> {
  const conn = await pool.getConnection();
  try {
    await conn.query('SET @id_usuario_app = ?', [idUsuario]);
    return await fn(conn);
  } finally {
    await conn.query('SET @id_usuario_app = NULL');
    conn.release();
  }
}
