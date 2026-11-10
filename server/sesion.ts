import crypto from 'node:crypto';
import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../src/types';
import { Funcion, puede } from '../src/data/roles';
import { ErrorNegocio } from './errores';

export interface Sesion {
  id: number;
  nombre: string;
  rol: UserRole;
  exp: number;
}

declare module 'express-serve-static-core' {
  interface Request {
    sesion?: Sesion;
  }
}

const NOMBRE_COOKIE = 'mt_sesion';
const DURACION_MS = 8 * 60 * 60 * 1000;
const SECRETO = process.env.SESION_SECRETO || crypto.randomBytes(32).toString('hex');

export const CLAVE_MINIMA = 8;

export function hashClave(clave: string): string {
  const sal = crypto.randomBytes(16);
  const hash = crypto.scryptSync(clave, sal, 64);
  return `${sal.toString('hex')}:${hash.toString('hex')}`;
}

export function verificarClave(clave: string, guardada: string | null): boolean {
  if (!guardada) return false;
  const [sal, hash] = guardada.split(':');
  if (!sal || !hash) return false;
  const esperado = Buffer.from(hash, 'hex');
  const calculado = crypto.scryptSync(clave, Buffer.from(sal, 'hex'), esperado.length);
  return crypto.timingSafeEqual(esperado, calculado);
}

const firmar = (texto: string) => crypto.createHmac('sha256', SECRETO).update(texto).digest('base64url');

export function crearToken(datos: Omit<Sesion, 'exp'>): string {
  const cuerpo = Buffer.from(JSON.stringify({ ...datos, exp: Date.now() + DURACION_MS })).toString('base64url');
  return `${cuerpo}.${firmar(cuerpo)}`;
}

function leerToken(token: string | undefined): Sesion | null {
  if (!token) return null;
  const [cuerpo, firma] = token.split('.');
  if (!cuerpo || !firma) return null;
  const esperada = Buffer.from(firmar(cuerpo));
  const recibida = Buffer.from(firma);
  if (esperada.length !== recibida.length || !crypto.timingSafeEqual(esperada, recibida)) return null;
  try {
    const sesion = JSON.parse(Buffer.from(cuerpo, 'base64url').toString()) as Sesion;
    return sesion.exp > Date.now() ? sesion : null;
  } catch {
    return null;
  }
}

function leerCookie(req: Request): string | undefined {
  const cabecera = req.headers.cookie ?? '';
  const par = cabecera.split(';').map((c) => c.trim()).find((c) => c.startsWith(`${NOMBRE_COOKIE}=`));
  return par?.slice(NOMBRE_COOKIE.length + 1);
}

export function iniciarSesion(req: Request, res: Response, datos: Omit<Sesion, 'exp'>) {
  const seguro = req.secure ? '; Secure' : '';
  res.setHeader('Set-Cookie',
    `${NOMBRE_COOKIE}=${crearToken(datos)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${DURACION_MS / 1000}${seguro}`);
}

export function cerrarSesion(res: Response) {
  res.setHeader('Set-Cookie', `${NOMBRE_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`);
}

export function cargarSesion(req: Request, _res: Response, next: NextFunction) {
  req.sesion = leerToken(leerCookie(req)) ?? undefined;
  next();
}

export function requiereSesion(req: Request, _res: Response, next: NextFunction) {
  if (!req.sesion) return next(new ErrorNegocio(401, 'Inicia sesión para continuar.'));
  next();
}

export const requiere = (funcion: Funcion) => (req: Request, _res: Response, next: NextFunction) => {
  if (!req.sesion) return next(new ErrorNegocio(401, 'Inicia sesión para continuar.'));
  if (!puede(req.sesion.rol, funcion)) return next(new ErrorNegocio(403, 'Tu rol no tiene permiso para hacer esto.'));
  next();
};

const intentos = new Map<string, { cuenta: number; hasta: number }>();

export function limitarIntentos(req: Request, _res: Response, next: NextFunction) {
  const clave = req.ip ?? 'desconocida';
  const ahora = Date.now();
  const actual = intentos.get(clave);
  if (actual && actual.hasta > ahora && actual.cuenta >= 8) {
    return next(new ErrorNegocio(429, 'Demasiados intentos. Espera unos minutos y vuelve a intentar.'));
  }
  next();
}

export function registrarIntento(req: Request, exito: boolean) {
  const clave = req.ip ?? 'desconocida';
  if (exito) {
    intentos.delete(clave);
    return;
  }
  const ahora = Date.now();
  const actual = intentos.get(clave);
  intentos.set(clave, actual && actual.hasta > ahora
    ? { cuenta: actual.cuenta + 1, hasta: actual.hasta }
    : { cuenta: 1, hasta: ahora + 10 * 60 * 1000 });
}
