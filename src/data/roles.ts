import { UserRole } from '../types';

export type Funcion =
  | 'verMiembros'
  | 'registrarMiembro'
  | 'verGrupos'
  | 'verDiscipulado'
  | 'promoverFase'
  | 'tomarAsistencia'
  | 'verCuidado'
  | 'verEventos'
  | 'verReportes';

export const FUNCIONES: Record<Funcion, string> = {
  verMiembros: 'Ver la lista de miembros y sus fichas',
  registrarMiembro: 'Registrar nuevos miembros',
  verGrupos: 'Ver los grupos de discipulado y el mapa',
  verDiscipulado: 'Ver las fases de discipulado',
  promoverFase: 'Promover a un miembro a la siguiente fase',
  tomarAsistencia: 'Tomar la asistencia de los grupos',
  verCuidado: 'Ver el semáforo y las alertas de cuidado',
  verEventos: 'Ver los eventos',
  verReportes: 'Ver los informes',
};

export interface InfoRol {
  clave: UserRole;
  nombre: string;
  nivel: number;
  descripcion: string;
  funciones: Funcion[];
}

export const ROLES: InfoRol[] = [
  {
    clave: 'pastor',
    nombre: 'Pastor',
    nivel: 1,
    descripcion: 'Dirige la misión y aprueba el avance de los discípulos de una fase a otra.',
    funciones: [
      'verMiembros', 'registrarMiembro', 'verGrupos', 'verDiscipulado', 'promoverFase',
      'tomarAsistencia', 'verCuidado', 'verEventos', 'verReportes',
    ],
  },
  {
    clave: 'asistente',
    nombre: 'Asistente Pastoral',
    nivel: 2,
    descripcion: 'Ayuda al pastor con el registro de miembros, la asistencia y los informes de seguimiento.',
    funciones: [
      'verMiembros', 'registrarMiembro', 'verGrupos', 'verDiscipulado',
      'tomarAsistencia', 'verCuidado', 'verEventos', 'verReportes',
    ],
  },
  {
    clave: 'discipulador',
    nombre: 'Discipulador',
    nivel: 3,
    descripcion: 'Da la clase a su grupo, toma la asistencia y cuida a sus discípulos.',
    funciones: ['verMiembros', 'verGrupos', 'verDiscipulado', 'tomarAsistencia', 'verCuidado', 'verEventos'],
  },
  {
    clave: 'discipulo',
    nombre: 'Discípulo',
    nivel: 4,
    descripcion: 'Recibe la clase. Consulta su grupo de discipulado y los eventos.',
    funciones: ['verGrupos', 'verEventos'],
  },
];

export const VISTAS: Record<string, Funcion | null> = {
  dashboard: null,
  personas: 'verMiembros',
  grupos: 'verGrupos',
  discipulado: 'verDiscipulado',
  asistencia: 'tomarAsistencia',
  alertas: 'verCuidado',
  eventos: 'verEventos',
  reportes: 'verReportes',
};

export const infoRol = (rol: UserRole): InfoRol => ROLES.find((r) => r.clave === rol) ?? ROLES[0];

export const puede = (rol: UserRole, funcion: Funcion): boolean => infoRol(rol).funciones.includes(funcion);

export const vistaPermitida = (rol: UserRole, vista: string): boolean => {
  const requerida = VISTAS[vista];
  return !requerida || puede(rol, requerida);
};
