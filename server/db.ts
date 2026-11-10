import fs from 'node:fs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export function opcionesConexion() {
  const valorCa = process.env.DB_SSL_CA;
  const ca = valorCa ? (valorCa.includes('BEGIN CERTIFICATE') ? valorCa : fs.readFileSync(valorCa)) : undefined;
  return {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    ssl: process.env.DB_SSL === 'true' ? (ca ? { ca } : { rejectUnauthorized: true }) : undefined,
  };
}

export const pool = mysql.createPool({
  ...opcionesConexion(),
  database: process.env.DB_NAME || 'misiontec',
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true,
  charset: 'UTF8MB4_SPANISH_CI',
});

export async function withTransaction<T>(
  fn: (conn: mysql.PoolConnection) => Promise<T>,
): Promise<T> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}
