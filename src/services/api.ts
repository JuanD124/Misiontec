import type {
  Person,
  MissionaryGroup,
  FollowUpRecord,
  NotificationItem,
  MissionEvent,
  AuditLog,
  DiscipleshipPhase,
} from '../types';

// Cliente de la API de MISIONTEC. En desarrollo Vite redirige /api al
// servidor Express (ver vite.config.ts), así que no hace falta poner la URL.

// Mientras no haya login se trabaja como el usuario 1 (administrador)
let usuarioId = 1;
export const setUsuarioActual = (id: number) => { usuarioId = id; };

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-usuario-id': String(usuarioId),
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
  followUps: FollowUpRecord[];
  notifications: NotificationItem[];
  events: MissionEvent[];
  auditLogs: AuditLog[];
}

export const api = {
  cargarTodo: () => request<DatosIniciales>('/api/inicio'),

  crearPersona: (data: Partial<Person>) =>
    request<Person>('/api/personas', { method: 'POST', body: JSON.stringify(data) }),

  cambiarFase: (personId: string, phase: DiscipleshipPhase) =>
    request(`/api/personas/${personId}/fase`, { method: 'PATCH', body: JSON.stringify({ phase }) }),

  desactivarPersona: (personId: string, motivo?: string) =>
    request(`/api/personas/${personId}`, { method: 'DELETE', body: JSON.stringify({ motivo }) }),

  registrarSeguimiento: (data: Omit<FollowUpRecord, 'id'>) =>
    request('/api/seguimientos', { method: 'POST', body: JSON.stringify(data) }),

  registrarAsistencia: (
    groupId: string,
    date: string,
    items: Record<string, 'presente' | 'falta_justificada' | 'falta_injustificada'>,
    topic?: string,
  ) => request('/api/asistencias', { method: 'POST', body: JSON.stringify({ groupId, date, items, topic }) }),

  marcarAlertaLeida: (id: string) => request(`/api/alertas/${id}/leida`, { method: 'PATCH' }),

  gruposCercanos: (lat: number, lng: number, radioKm = 5) =>
    request<any[]>(`/api/grupos/cercanos?lat=${lat}&lng=${lng}&radio=${radioKm}`),
};
