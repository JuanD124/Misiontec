import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'misiontec',
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true,
  charset: 'UTF8MB4_SPANISH_CI',
});

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
