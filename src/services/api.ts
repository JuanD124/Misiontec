import type {
  Person,
  MissionaryGroup,
  NotificationItem,
  MissionEvent,
  DiscipleshipPhase,
  SesionUsuario,
  UserRole,
} from '../types';

export class ErrorApi extends Error {
  constructor(public estado: number, mensaje: string) {
    super(mensaje);
  }
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ErrorApi(res.status, data.error || `Error ${res.status}`);
  return data as T;
}

export interface InformeGeneral {
  generado: string;
  resumen: {
    personasActivas: number;
    gruposActivos: number;
    asistenciaPromedio: number;
    personasEnRojo: number;
    personasEnAmarillo: number;
    nuevosUltimos90Dias: number;
    eventosProximos: number;
  };
  fases: { orden: number; fase: string; total: number }[];
  grupos: {
    codigo: string; nombre: string; zona: string; distrito: string; lider: string; reunion: string;
    miembros: number; sesiones: number; asistencia: number; rojos: number; amarillos: number;
  }[];
  cuidado: {
    codigo: string; nombre: string; grupo: string; fase: string; mentor: string;
    faltas: number; ultimaAsistencia: string; semaforo: 'rojo' | 'amarillo';
  }[];
  sesiones: {
    fecha: string; codigo: string; grupo: string; tema: string;
    presentes: number; justificadas: number; injustificadas: number;
  }[];
  eventos: { titulo: string; tipo: string; fecha: string; hora: string; lugar: string; estado: string; asistentes: number }[];
  roles: { rol: string; nivel: number; personas: number }[];
  nuevos: { codigo: string; nombre: string; grupo: string; fase: string; ingreso: string }[];
}

export interface HistorialFase {
  phase: DiscipleshipPhase;
  from: string;
  to: string | null;
  note: string;
}

export interface DatosEvento {
  title: string;
  type: string;
  date: string;
  time: string;
  location: string;
  targetAudience?: string;
  groupId?: string;
}

export interface DatosAcceso {
  fullName: string;
  dni: string;
  phone?: string;
  email?: string;
  role: UserRole;
  password: string;
}

export interface DatosGrupo {
  name: string;
  district: string;
  zone: string;
  neighborhood: string;
  address: string;
  lat: number | '';
  lng: number | '';
  meetingDay: string;
  meetingTime: string;
  leaderId: string;
  assistantId: string;
  status: string;
}

export interface DatosIniciales {
  people: Person[];
  groups: MissionaryGroup[];
  notifications: NotificationItem[];
  events: MissionEvent[];
}

export const api = {
  yo: () => request<SesionUsuario>('/api/yo'),

  login: (documento: string, contrasena: string) =>
    request<SesionUsuario>('/api/login', { method: 'POST', body: JSON.stringify({ documento, contrasena }) }),

  logout: () => request('/api/logout', { method: 'POST' }),

  cargarTodo: () => request<DatosIniciales>('/api/inicio'),

  crearPersona: (data: Partial<Person>) =>
    request<Person>('/api/personas', { method: 'POST', body: JSON.stringify(data) }),

  editarPersona: (personId: string, data: Partial<Person>) =>
    request(`/api/personas/${personId}`, { method: 'PUT', body: JSON.stringify(data) }),

  historial: (personId: string) => request<HistorialFase[]>(`/api/personas/${personId}/historial`),

  definirAcceso: (personId: string, contrasena: string, rol: UserRole) =>
    request(`/api/personas/${personId}/acceso`, { method: 'PUT', body: JSON.stringify({ contrasena, rol }) }),

  crearAcceso: (data: DatosAcceso) =>
    request<{ id: string }>('/api/accesos', { method: 'POST', body: JSON.stringify(data) }),

  quitarAcceso: (personId: string) => request(`/api/personas/${personId}/acceso`, { method: 'DELETE' }),

  crearGrupo: (data: DatosGrupo) =>
    request<{ id: string }>('/api/grupos', { method: 'POST', body: JSON.stringify(data) }),

  editarGrupo: (groupId: string, data: DatosGrupo) =>
    request(`/api/grupos/${groupId}`, { method: 'PUT', body: JSON.stringify(data) }),

  eliminarGrupo: (groupId: string) => request(`/api/grupos/${groupId}`, { method: 'DELETE' }),

  cambiarFase: (personId: string, phase: DiscipleshipPhase) =>
    request(`/api/personas/${personId}/fase`, { method: 'PATCH', body: JSON.stringify({ phase }) }),

  desactivarPersona: (personId: string) =>
    request(`/api/personas/${personId}`, { method: 'DELETE' }),

  registrarAsistencia: (
    groupId: string,
    date: string,
    items: Record<string, 'presente' | 'falta_justificada' | 'falta_injustificada'>,
    topic?: string,
  ) => request('/api/asistencias', { method: 'POST', body: JSON.stringify({ groupId, date, items, topic }) }),

  crearEvento: (data: DatosEvento) =>
    request<{ id: string }>('/api/eventos', { method: 'POST', body: JSON.stringify(data) }),

  asistentesEvento: (eventId: string) => request<number[]>(`/api/eventos/${eventId}/asistencia`),

  guardarAsistentesEvento: (eventId: string, personIds: number[]) =>
    request(`/api/eventos/${eventId}/asistencia`, { method: 'POST', body: JSON.stringify({ personIds }) }),

  eliminarEvento: (eventId: string) => request(`/api/eventos/${eventId}`, { method: 'DELETE' }),

  informeGeneral: () => request<InformeGeneral>('/api/informe/general'),

  gruposCercanos: (lat: number, lng: number, radioKm = 5) =>
    request<any[]>(`/api/grupos/cercanos?lat=${lat}&lng=${lng}&radio=${radioKm}`),
};
