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

export const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

export const fechaCorta = (fecha: string) => {
  const [anio, mes, dia] = fecha.slice(0, 10).split('-');
  return `${dia}/${mes}/${anio}`;
};

export const fechaLarga = (fecha: string) => {
  const [anio, mes, dia] = fecha.slice(0, 10).split('-');
  return `${Number(dia)} de ${MESES[Number(mes) - 1]} de ${anio}`;
};

export const aISO = (fecha: Date) =>
  `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;

export const deISO = (texto: string) => {
  const [anio, mes, dia] = texto.slice(0, 10).split('-').map(Number);
  return new Date(anio, mes - 1, dia);
};

export const hoyISO = () => aISO(new Date());

export const edadDesde = (nacimiento: string, referencia: Date = new Date()) => {
  const nac = deISO(nacimiento);
  let edad = referencia.getFullYear() - nac.getFullYear();
  const cumplio =
    referencia.getMonth() > nac.getMonth() ||
    (referencia.getMonth() === nac.getMonth() && referencia.getDate() >= nac.getDate());
  if (!cumplio) edad -= 1;
  return edad;
};
