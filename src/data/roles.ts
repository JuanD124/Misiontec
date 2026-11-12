import { UserRole } from '../types';

export type Funcion =
  | 'verInicio'
  | 'verPadron'
  | 'verMiembros'
  | 'registrarMiembro'
  | 'verGrupos'
  | 'gestionarGrupos'
  | 'verDiscipulado'
  | 'promoverFase'
  | 'tomarAsistencia'
  | 'verCuidado'
  | 'verEventos'
  | 'gestionarEventos'
  | 'verReportes'
  | 'gestionarAccesos'
  | 'eliminar';

export const FUNCIONES: Record<Funcion, string> = {
  verInicio: 'Ver el inicio con los indicadores generales',
  verPadron: 'Ver el padrón completo de discípulos y los grupos',
  verMiembros: 'Ver las fichas de los discípulos de su alcance',
  registrarMiembro: 'Registrar y editar discípulos',
  verGrupos: 'Ver los grupos de comunión y el mapa',
  gestionarGrupos: 'Crear grupos de comunión y registrar su ubicación',
  verDiscipulado: 'Ver el adiestramiento y las fases de formación',
  promoverFase: 'Promover a un miembro a la siguiente fase',
  tomarAsistencia: 'Registrar la asistencia de los grupos y de los encuentros',
  verCuidado: 'Ver el semáforo y las alertas de cuidado pastoral',
  verEventos: 'Ver los encuentros y misiones',
  gestionarEventos: 'Crear encuentros y misiones',
  verReportes: 'Ver los informes',
  gestionarAccesos: 'Crear y cambiar los accesos (contraseñas) del equipo',
  eliminar: 'Eliminar personas, grupos y encuentros',
};

export interface InfoRol {
  clave: UserRole;
  nombre: string;
  nombreEnBase: string;
  nivel: number;
  descripcion: string;
  funciones: Funcion[];
}

export const ROLES: InfoRol[] = [
  {
    clave: 'pastor',
    nombre: 'Pastor',
    nombreEnBase: 'Pastor',
    nivel: 1,
    descripcion: 'Dirige la misión. Tiene todas las funciones, es el único que crea grupos de comunión y el único que puede eliminar.',
    funciones: [
      'verInicio', 'verPadron', 'verMiembros', 'registrarMiembro', 'verGrupos', 'gestionarGrupos', 'verDiscipulado', 'promoverFase',
      'tomarAsistencia', 'verCuidado', 'verEventos', 'gestionarEventos', 'verReportes', 'gestionarAccesos', 'eliminar',
    ],
  },
  {
    clave: 'asistente',
    nombre: 'Asistente Pastoral',
    nombreEnBase: 'Asistente pastoral',
    nivel: 2,
    descripcion: 'Ayuda al pastor: hace los registros, crea encuentros y misiones y ve los informes. No puede eliminar.',
    funciones: [
      'verInicio', 'verPadron', 'verMiembros', 'registrarMiembro', 'verGrupos', 'verDiscipulado',
      'tomarAsistencia', 'verCuidado', 'verEventos', 'gestionarEventos', 'verReportes',
    ],
  },
  {
    clave: 'discipulador',
    nombre: 'Discipulador',
    nombreEnBase: 'Discipulador',
    nivel: 3,
    descripcion: 'Acompaña a su grupo: ve el adiestramiento, registra la asistencia, el cuidado pastoral y los encuentros.',
    funciones: ['verMiembros', 'verDiscipulado', 'tomarAsistencia', 'verCuidado', 'verEventos'],
  },
];

export const VISTAS: Record<string, Funcion> = {
  dashboard: 'verInicio',
  personas: 'verPadron',
  grupos: 'verGrupos',
  discipulado: 'verDiscipulado',
  asistencia: 'tomarAsistencia',
  alertas: 'verCuidado',
  eventos: 'verEventos',
  reportes: 'verReportes',
  equipo: 'verPadron',
};

export const infoRol = (rol: UserRole): InfoRol => ROLES.find((r) => r.clave === rol) ?? ROLES[ROLES.length - 1];

export const rolDesdeBase = (nombreEnBase: string): UserRole | null =>
  ROLES.find((r) => r.nombreEnBase === nombreEnBase)?.clave ?? null;

export const puede = (rol: UserRole, funcion: Funcion): boolean => infoRol(rol).funciones.includes(funcion);

export const vistaPermitida = (rol: UserRole, vista: string): boolean => {
  const requerida = VISTAS[vista];
  return Boolean(requerida) && puede(rol, requerida);
};

export const primeraVista = (rol: UserRole): string =>
  Object.keys(VISTAS).find((vista) => vistaPermitida(rol, vista)) ?? 'discipulado';
