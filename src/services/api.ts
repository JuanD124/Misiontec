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

  gruposCercanos: (lat: number, lng: number, radioKm = 5) =>
    request<any[]>(`/api/grupos/cercanos?lat=${lat}&lng=${lng}&radio=${radioKm}`),
};
