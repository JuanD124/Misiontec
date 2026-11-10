export const NOMBRE_FASE: Record<string, string> = {
  contacto: '1. Bienvenida',
  consolidacion: '2. Consolidación',
  formacion: '3. Formación',
  liderazgo: '4. Liderazgo',
};

export const NOMBRE_TIPO_EVENTO: Record<string, string> = {
  culto: 'Culto',
  taller: 'Taller formativo',
  retiro: 'Retiro espiritual',
  vigilia: 'Vigilia de oración',
  evangelismo: 'Misión y evangelismo',
};

export const NOMBRE_ESTADO_EVENTO: Record<string, string> = {
  programado: 'Programado',
  en_curso: 'En curso',
  concluido: 'Concluido',
  cancelado: 'Cancelado',
};

export const fechaCorta = (fecha: string) => {
  const [anio, mes, dia] = fecha.slice(0, 10).split('-');
  return `${dia}/${mes}/${anio}`;
};

export const hoyISO = () => new Date().toISOString().slice(0, 10);
