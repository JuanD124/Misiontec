import type {
  Person,
  MissionaryGroup,
  NotificationItem,
  MissionEvent,
  DiscipleshipPhase,
} from '../types';

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
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

export interface DatosIniciales {
  people: Person[];
  groups: MissionaryGroup[];
  notifications: NotificationItem[];
  events: MissionEvent[];
}

export const api = {
  cargarTodo: () => request<DatosIniciales>('/api/inicio'),

  crearPersona: (data: Partial<Person>) =>
    request<Person>('/api/personas', { method: 'POST', body: JSON.stringify(data) }),

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

  informeGeneral: () => request<InformeGeneral>('/api/informe/general'),

  gruposCercanos: (lat: number, lng: number, radioKm = 5) =>
    request<any[]>(`/api/grupos/cercanos?lat=${lat}&lng=${lng}&radio=${radioKm}`),
};
