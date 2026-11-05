export const FASES = ['contacto', 'consolidacion', 'formacion', 'liderazgo'];

export const SEMAFORO: Record<string, 'green' | 'yellow' | 'red'> = {
  verde: 'green',
  amarillo: 'yellow',
  rojo: 'red',
};

export const ESTADO_GRUPO: Record<string, 'active' | 'watch' | 'inactive'> = {
  activo: 'active',
  observacion: 'watch',
  inactivo: 'inactive',
};

export function separarNombre(fullName: string): { nombres: string; apellidos: string } {
  const partes = fullName.trim().split(/\s+/);
  if (partes.length === 1) return { nombres: partes[0], apellidos: '' };
  if (partes.length === 2) return { nombres: partes[0], apellidos: partes[1] };
  if (partes.length === 3) return { nombres: partes[0], apellidos: partes.slice(1).join(' ') };
  return { nombres: partes.slice(0, 2).join(' '), apellidos: partes.slice(2).join(' ') };
}
