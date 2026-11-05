import express, { Request, Response, NextFunction } from 'express';
import { pool } from './db';
import { ErrorNegocio } from './errores';
import {
  datosIniciales,
  obtenerPersonasConEstado,
  obtenerGruposConIndicadores,
  personasParaPantalla,
  gruposParaPantalla,
  resumenParaDashboard,
  obtenerGruposCercanos,
  informeGeneral,
} from './consultas';
import { registrarPersona, cambiarFase, desactivarPersona, registrarAsistencia } from './acciones';

const app = express();
app.use(express.json());

const ruta =
  (fn: (req: Request, res: Response) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) =>
    fn(req, res).catch(next);

app.get('/api/salud', ruta(async (_req, res) => {
  const [rows]: any = await pool.query('SELECT DATABASE() AS base, NOW() AS hora');
  res.json({ ok: true, ...rows[0] });
}));

app.get('/api/inicio', ruta(async (_req, res) => res.json(await datosIniciales())));

app.get('/api/dashboard', ruta(async (_req, res) => res.json(await resumenParaDashboard())));

app.get('/api/personas', ruta(async (_req, res) => {
  res.json(personasParaPantalla(await obtenerPersonasConEstado()));
}));

app.get('/api/grupos', ruta(async (_req, res) => {
  const personas = await obtenerPersonasConEstado();
  res.json(gruposParaPantalla(await obtenerGruposConIndicadores(personas)));
}));

app.get('/api/grupos/cercanos', ruta(async (req, res) => {
  const { lat, lng, radio = '5' } = req.query as Record<string, string>;
  const [la, lo, ra] = [Number(lat), Number(lng), Number(radio)];
  if ([la, lo, ra].some((n) => Number.isNaN(n))) {
    throw new ErrorNegocio(400, 'Indica lat, lng y radio como números.');
  }
  res.json(await obtenerGruposCercanos(la, lo, ra));
}));

app.post('/api/personas', ruta(async (req, res) => {
  const id = await registrarPersona(req.body);
  const personas = personasParaPantalla(await obtenerPersonasConEstado());
  res.status(201).json(personas.find((p) => p.id === String(id)));
}));

app.patch('/api/personas/:id/fase', ruta(async (req, res) => {
  await cambiarFase(req.params.id, req.body.phase);
  res.json({ ok: true });
}));

app.delete('/api/personas/:id', ruta(async (req, res) => {
  await desactivarPersona(req.params.id);
  res.json({ ok: true });
}));

app.post('/api/asistencias', ruta(async (req, res) => {
  await registrarAsistencia(req.body);
  res.status(201).json({ ok: true });
}));

app.get('/api/informe/general', ruta(async (_req, res) => res.json(await informeGeneral())));

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ErrorNegocio) {
    return res.status(err.estado).json({ error: err.message });
  }
  console.error(err);
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: 'Ya existe un registro con ese documento, correo o código.' });
  }
  if (err.code === 'ER_CHECK_CONSTRAINT_VIOLATED') {
    return res.status(400).json({ error: 'Alguno de los datos no cumple las reglas de la base de datos.' });
  }
  if (err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR' || err.code === 'ER_BAD_DB_ERROR') {
    return res.status(503).json({ error: 'No se pudo conectar a MySQL. Revisa el archivo .env y que el servidor esté encendido.' });
  }
  res.status(500).json({ error: err.sqlMessage || err.message || 'Error interno' });
});

const PORT = Number(process.env.API_PORT || 3001);
app.listen(PORT, () => {
  console.log(`API de MISIONTEC escuchando en http://localhost:${PORT}`);
});
