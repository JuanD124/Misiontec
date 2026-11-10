import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import express, { Request, Response, NextFunction } from 'express';
import { pool } from './db';
import { ErrorNegocio } from './errores';
import {
  cargarSesion,
  requiereSesion,
  requiere,
  limitarIntentos,
  registrarIntento,
  iniciarSesion,
  cerrarSesion,
} from './sesion';
import {
  datosIniciales,
  calcularAlcance,
  enAlcance,
  resumenParaDashboard,
  obtenerGruposCercanos,
  obtenerHistorial,
  obtenerGrupoDePersona,
  obtenerAsistentesEvento,
  informeGeneral,
} from './consultas';
import {
  registrarPersona,
  editarPersona,
  definirAcceso,
  quitarAcceso,
  crearAcceso,
  crearGrupo,
  editarGrupo,
  eliminarGrupo,
  cambiarFase,
  desactivarPersona,
  registrarAsistencia,
  crearEvento,
  eliminarEvento,
  registrarAsistenciaEvento,
  validarCredenciales,
} from './acciones';

const app = express();
app.set('trust proxy', 1);
app.use(express.json());

const usuarioAcceso = process.env.ACCESO_USUARIO;
const claveAcceso = process.env.ACCESO_CLAVE;

if (usuarioAcceso && claveAcceso) {
  const huella = (texto: string) => crypto.createHash('sha256').update(texto).digest();
  const esperado = huella(`${usuarioAcceso}:${claveAcceso}`);

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path === '/api/salud') return next();
    const [tipo, valor] = (req.headers.authorization ?? '').split(' ');
    if (tipo === 'Basic' && valor) {
      const recibido = huella(Buffer.from(valor, 'base64').toString());
      if (crypto.timingSafeEqual(recibido, esperado)) return next();
    }
    res.set('WWW-Authenticate', 'Basic realm="MISIONTEC"').status(401).send('Acceso restringido');
  });
}

app.use(cargarSesion);

const ruta =
  (fn: (req: Request, res: Response) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) =>
    fn(req, res).catch(next);

app.get('/api/salud', ruta(async (_req, res) => {
  const [rows]: any = await pool.query('SELECT DATABASE() AS base, NOW() AS hora');
  res.json({ ok: true, ...rows[0] });
}));

app.post('/api/login', limitarIntentos, ruta(async (req, res) => {
  const documento = String(req.body?.documento ?? '').trim();
  const clave = String(req.body?.contrasena ?? '');
  if (!documento || !clave) throw new ErrorNegocio(400, 'Escribe tu documento y tu contraseña.');

  const usuario = await validarCredenciales(documento, clave);
  registrarIntento(req, Boolean(usuario));
  if (!usuario) throw new ErrorNegocio(401, 'Documento o contraseña incorrectos.');

  iniciarSesion(req, res, usuario);
  res.json({ id: usuario.id, nombre: usuario.nombre, rol: usuario.rol });
}));

app.post('/api/logout', (_req: Request, res: Response) => {
  cerrarSesion(res);
  res.json({ ok: true });
});

app.use('/api', requiereSesion);

app.get('/api/yo', (req: Request, res: Response) => {
  const { id, nombre, rol } = req.sesion!;
  res.json({ id, nombre, rol });
});

app.get('/api/inicio', ruta(async (req, res) => res.json(await datosIniciales(req.sesion!))));

app.get('/api/dashboard', requiere('verInicio'), ruta(async (_req, res) => res.json(await resumenParaDashboard())));

app.get('/api/personas', requiere('verMiembros'), ruta(async (req, res) => {
  res.json((await datosIniciales(req.sesion!)).people);
}));

app.get('/api/grupos', requiere('verPadron'), ruta(async (req, res) => {
  res.json((await datosIniciales(req.sesion!)).groups);
}));

app.get('/api/grupos/cercanos', requiere('verPadron'), ruta(async (req, res) => {
  const { lat, lng, radio = '5' } = req.query as Record<string, string>;
  const [la, lo, ra] = [Number(lat), Number(lng), Number(radio)];
  if ([la, lo, ra].some((n) => Number.isNaN(n))) {
    throw new ErrorNegocio(400, 'Indica lat, lng y radio como números.');
  }
  res.json(await obtenerGruposCercanos(la, lo, ra, await calcularAlcance(req.sesion!)));
}));

app.get('/api/personas/:id/historial', requiere('verMiembros'), ruta(async (req, res) => {
  const alcance = await calcularAlcance(req.sesion!);
  if (!enAlcance(alcance, await obtenerGrupoDePersona(req.params.id))) {
    throw new ErrorNegocio(403, 'Esa persona no es parte de tu grupo.');
  }
  res.json(await obtenerHistorial(req.params.id));
}));

app.post('/api/personas', requiere('registrarMiembro'), ruta(async (req, res) => {
  const id = await registrarPersona(req.body);
  const personas = (await datosIniciales(req.sesion!)).people;
  res.status(201).json(personas.find((p) => p.id === String(id)));
}));

app.put('/api/personas/:id', requiere('registrarMiembro'), ruta(async (req, res) => {
  await editarPersona(req.params.id, req.body);
  res.json({ ok: true });
}));

app.put('/api/personas/:id/acceso', requiere('gestionarAccesos'), ruta(async (req, res) => {
  await definirAcceso(req.params.id, req.body?.contrasena, req.body?.rol, req.sesion!.id);
  res.json({ ok: true });
}));

app.post('/api/accesos', requiere('gestionarAccesos'), ruta(async (req, res) => {
  const id = await crearAcceso(req.body);
  res.status(201).json({ id: String(id) });
}));

app.delete('/api/personas/:id/acceso', requiere('gestionarAccesos'), ruta(async (req, res) => {
  await quitarAcceso(req.params.id, req.sesion!.id);
  res.json({ ok: true });
}));

app.post('/api/grupos', requiere('gestionarGrupos'), ruta(async (req, res) => {
  const id = await crearGrupo(req.body);
  res.status(201).json({ id: String(id) });
}));

app.put('/api/grupos/:id', requiere('gestionarGrupos'), ruta(async (req, res) => {
  await editarGrupo(req.params.id, req.body);
  res.json({ ok: true });
}));

app.delete('/api/grupos/:id', requiere('eliminar'), ruta(async (req, res) => {
  await eliminarGrupo(req.params.id);
  res.json({ ok: true });
}));

app.patch('/api/personas/:id/fase', requiere('promoverFase'), ruta(async (req, res) => {
  await cambiarFase(req.params.id, req.body.phase);
  res.json({ ok: true });
}));

app.delete('/api/personas/:id', requiere('eliminar'), ruta(async (req, res) => {
  if (Number(req.params.id) === req.sesion!.id) {
    throw new ErrorNegocio(400, 'No puedes eliminar tu propia cuenta.');
  }
  await desactivarPersona(req.params.id);
  res.json({ ok: true });
}));

app.post('/api/asistencias', requiere('tomarAsistencia'), ruta(async (req, res) => {
  const alcance = await calcularAlcance(req.sesion!);
  if (!enAlcance(alcance, Number(req.body?.groupId))) {
    throw new ErrorNegocio(403, 'Ese grupo no es parte de tu alcance.');
  }
  await registrarAsistencia(req.body);
  res.status(201).json({ ok: true });
}));

app.post('/api/eventos', requiere('gestionarEventos'), ruta(async (req, res) => {
  const id = await crearEvento(req.body);
  res.status(201).json({ id: String(id) });
}));

app.delete('/api/eventos/:id', requiere('eliminar'), ruta(async (req, res) => {
  await eliminarEvento(req.params.id);
  res.json({ ok: true });
}));

app.get('/api/eventos/:id/asistencia', requiere('tomarAsistencia'), ruta(async (req, res) => {
  res.json(await obtenerAsistentesEvento(req.params.id));
}));

app.post('/api/eventos/:id/asistencia', requiere('tomarAsistencia'), ruta(async (req, res) => {
  await registrarAsistenciaEvento(req.params.id, req.body?.personIds, await calcularAlcance(req.sesion!));
  res.json({ ok: true });
}));

app.get('/api/informe/general', requiere('verReportes'), ruta(async (_req, res) => res.json(await informeGeneral())));

app.use('/api', (_req: Request, res: Response) => {
  res.status(404).json({ error: 'Ruta no encontrada.' });
});

const carpetaWeb = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(path.join(carpetaWeb, 'index.html'))) {
  app.use(express.static(carpetaWeb));
  app.get('*', (_req: Request, res: Response) => res.sendFile(path.join(carpetaWeb, 'index.html')));
}

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ErrorNegocio) {
    return res.status(err.estado).json({ error: err.message });
  }
  console.error(err);
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: 'Ya existe un registro con ese documento, correo o código.' });
  }
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ error: 'El grupo indicado no existe.' });
  }
  if (err.code === 'ER_CHECK_CONSTRAINT_VIOLATED') {
    return res.status(400).json({ error: 'Alguno de los datos no cumple las reglas de la base de datos.' });
  }
  if (err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR' || err.code === 'ER_BAD_DB_ERROR') {
    return res.status(503).json({ error: 'No se pudo conectar a MySQL. Revisa el archivo .env y que el servidor esté encendido.' });
  }
  res.status(500).json({ error: err.sqlMessage || err.message || 'Error interno' });
});

if (!process.env.SESION_SECRETO) {
  console.warn('Aviso: define SESION_SECRETO en el .env; sin él, las sesiones se cierran cada vez que se reinicia el servidor.');
}

const PORT = Number(process.env.PORT || process.env.API_PORT || 3001);
app.listen(PORT, () => {
  console.log(`API de MISIONTEC escuchando en http://localhost:${PORT}`);
});
