import { MESES, aISO, deISO, fechaLarga } from './formato';

export type ModoPeriodo = 'semana' | 'mes' | 'anio' | 'rango';

export interface Periodo {
  desde: string;
  hasta: string;
  etiqueta: string;
}

const sumarDias = (fecha: Date, dias: number) => new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + dias);

const capitalizar = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1);

export function periodoDe(modo: ModoPeriodo, ancla: Date, rango: { desde: string; hasta: string }): Periodo {
  if (modo === 'semana') {
    const lunes = sumarDias(ancla, -((ancla.getDay() + 6) % 7));
    const domingo = sumarDias(lunes, 6);
    const mismoMes = lunes.getMonth() === domingo.getMonth();
    const etiqueta = mismoMes
      ? `Semana del ${lunes.getDate()} al ${domingo.getDate()} de ${MESES[domingo.getMonth()]} de ${domingo.getFullYear()}`
      : `Semana del ${lunes.getDate()} de ${MESES[lunes.getMonth()]} al ${domingo.getDate()} de ${MESES[domingo.getMonth()]} de ${domingo.getFullYear()}`;
    return { desde: aISO(lunes), hasta: aISO(domingo), etiqueta };
  }

  if (modo === 'mes') {
    const primero = new Date(ancla.getFullYear(), ancla.getMonth(), 1);
    const ultimo = new Date(ancla.getFullYear(), ancla.getMonth() + 1, 0);
    return { desde: aISO(primero), hasta: aISO(ultimo), etiqueta: `${capitalizar(MESES[primero.getMonth()])} de ${primero.getFullYear()}` };
  }

  if (modo === 'anio') {
    const anio = ancla.getFullYear();
    return { desde: `${anio}-01-01`, hasta: `${anio}-12-31`, etiqueta: `Año ${anio}` };
  }

  return {
    desde: rango.desde,
    hasta: rango.hasta,
    etiqueta: `Del ${fechaLarga(rango.desde)} al ${fechaLarga(rango.hasta)}`,
  };
}

export function moverAncla(modo: ModoPeriodo, ancla: Date, pasos: number): Date {
  if (modo === 'semana') return sumarDias(ancla, 7 * pasos);
  if (modo === 'mes') return new Date(ancla.getFullYear(), ancla.getMonth() + pasos, 1);
  if (modo === 'anio') return new Date(ancla.getFullYear() + pasos, 0, 1);
  return ancla;
}

export const rangoValido = (rango: { desde: string; hasta: string }) =>
  Boolean(rango.desde) && Boolean(rango.hasta) && rango.desde <= rango.hasta && !Number.isNaN(deISO(rango.desde).getTime());
