// Traduce los nombres y valores de la base de datos (en español) a los
// tipos que ya usa el front en src/types/index.ts, para no tener que
// modificar los componentes.

export const FASE_POR_ORDEN: Record<number, string> = {
  1: 'contacto',
  2: 'consolidacion',
  3: 'formacion',
  4: 'liderazgo',
};

export const ORDEN_POR_FASE: Record<string, number> = {
  contacto: 1,
  consolidacion: 2,
  formacion: 3,
  liderazgo: 4,
};

export const SEMAFORO: Record<string, 'green' | 'yellow' | 'red'> = {
  verde: 'green',
  amarillo: 'yellow',
  rojo: 'red',
};

export const SEMAFORO_INVERSO: Record<string, string> = {
  green: 'verde',
  yellow: 'amarillo',
  red: 'rojo',
};

export const ESTADO_GRUPO: Record<string, 'active' | 'watch' | 'inactive'> = {
  activo: 'active',
  observacion: 'watch',
  inactivo: 'inactive',
};

export const SEVERIDAD: Record<string, 'critical' | 'warning' | 'info'> = {
  critica: 'critical',
  advertencia: 'warning',
  informativa: 'info',
};

export const TIPO_ALERTA: Record<string, 'absence' | 'followup' | 'group' | 'discipleship'> = {
  inasistencia: 'absence',
  sin_seguimiento: 'followup',
  grupo: 'group',
  discipulado: 'discipleship',
};

export function haceCuanto(fecha: string): string {
  const minutos = Math.floor((Date.now() - new Date(fecha.replace(' ', 'T')).getTime()) / 60000);
  if (minutos < 1) return 'Hace un momento';
  if (minutos < 60) return `Hace ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `Hace ${horas} h`;
  const dias = Math.floor(horas / 24);
  return dias === 1 ? 'Hace 1 día' : `Hace ${dias} días`;
}

/** Separa "Laura Valentina Rojas Peña" en nombres y apellidos. */
export function separarNombre(fullName: string): { nombres: string; apellidos: string } {
  const partes = fullName.trim().split(/\s+/);
  if (partes.length === 1) return { nombres: partes[0], apellidos: '' };
  if (partes.length === 2) return { nombres: partes[0], apellidos: partes[1] };
  if (partes.length === 3) return { nombres: partes[0], apellidos: partes.slice(1).join(' ') };
  return { nombres: partes.slice(0, 2).join(' '), apellidos: partes.slice(2).join(' ') };
}
