export type Semaforo = 'verde' | 'amarillo' | 'rojo';

export interface RegistroAsistencia {
  fecha: string;
  estado: string;
}

export const ESTADOS_ASISTENCIA = ['presente', 'falta_justificada', 'falta_injustificada'];

export function calcularSemaforo(faltasConsecutivas: number): Semaforo {
  if (faltasConsecutivas >= 3) return 'rojo';
  if (faltasConsecutivas === 2) return 'amarillo';
  return 'verde';
}

export function resumirAsistencia(registros: RegistroAsistencia[]) {
  let ultimaAsistencia: string | null = null;
  for (const r of registros) {
    if (r.estado === 'presente' && (ultimaAsistencia === null || r.fecha > ultimaAsistencia)) {
      ultimaAsistencia = r.fecha;
    }
  }
  const faltasConsecutivas = registros.filter(
    (r) => r.estado !== 'presente' && (ultimaAsistencia === null || r.fecha > ultimaAsistencia),
  ).length;
  return { faltasConsecutivas, ultimaAsistencia };
}

export function porcentajeAsistencia(estados: string[]): number | null {
  if (estados.length === 0) return null;
  const presentes = estados.filter((e) => e === 'presente').length;
  return Math.round((1000 * presentes) / estados.length) / 10;
}

export function promedio(valores: (number | null)[]): number | null {
  const reales = valores.filter((v): v is number => v !== null);
  if (reales.length === 0) return null;
  return Math.round((reales.reduce((a, b) => a + b, 0) / reales.length) * 10) / 10;
}

export function distanciaKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const radioTierraKm = 6371;
  const aRadianes = (grados: number) => (grados * Math.PI) / 180;
  const dLat = aRadianes(lat2 - lat1);
  const dLon = aRadianes(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(aRadianes(lat1)) * Math.cos(aRadianes(lat2)) * Math.sin(dLon / 2) ** 2;
  const km = radioTierraKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(km * 100) / 100;
}

export const CORREO_VALIDO = /^.+@.+\..+$/;
