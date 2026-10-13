export type TrafficLightStatus = 'green' | 'yellow' | 'red';

export type DiscipleshipPhase = 
  | 'contacto' 
  | 'consolidacion' 
  | 'formacion' 
  | 'liderazgo';

export type UserRole = 
  | 'admin' 
  | 'pastor_distrito' 
  | 'pastor_local' 
  | 'discipulador' 
  | 'supervisor_zona';

export interface Person {
  id: string;
  code: string;
  fullName: string;
  dni: string;
  phone: string;
  email: string;
  age: number;
  gender: 'M' | 'F';
  address: string;
  district: string;
  groupId: string;
  groupName: string;
  phase: DiscipleshipPhase;
  status: TrafficLightStatus;
  mentorName: string;
  mentorId: string;
  consecutiveAbsences: number;
  lastAttendanceDate: string;
  lastFollowUpDate: string;
  daysSinceLastContact: number;
  criticalNotes?: string;
  avatarUrl?: string;
  enrollmentDate: string;
  tags: string[];
}

export interface MissionaryGroup {
  id: string;
  name: string;
  code: string;
  leaderName: string;
  leaderPhone: string;
  assistantName: string;
  zone: string;
  district: string;
  address: string;
  lat: number;
  lng: number;
  meetingDay: string;
  meetingTime: string;
  memberCount: number;
  averageAttendanceRate: number;
  status: 'active' | 'watch' | 'inactive';
  criticalMembersCount: number;
}

export interface FollowUpRecord {
  id: string;
  personId: string;
  personName: string;
  date: string;
  channel: 'llamada' | 'visita' | 'reunion_pastoral' | 'mensaje_chat';
  pastoralStatus: 'excelente' | 'estable' | 'desanimado' | 'en_crisis' | 'necesita_oracion';
  notes: string;
  commitments: string;
  nextContactDate: string;
  registeredByName: string;
  registeredByRole: string;
  resultingStatus: TrafficLightStatus;
}

export interface AttendanceItem {
  personId: string;
  fullName: string;
  status: 'presente' | 'falta_justificada' | 'falta_injustificada';
  notes?: string;
}

export interface AttendanceSession {
  id: string;
  groupId: string;
  groupName: string;
  date: string;
  topic: string;
  items: AttendanceItem[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timeAgo: string;
  severity: 'critical' | 'warning' | 'info';
  type: 'absence' | 'followup' | 'group' | 'discipleship';
  relatedPersonId?: string;
  read: boolean;
}

export interface MissionEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: 'culto' | 'taller' | 'retiro' | 'vigilia' | 'evangelismo';
  attendeesCount: number;
  targetAudience: string;
  status: 'programado' | 'en_curso' | 'concluido';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userName: string;
  userRole: string;
  action: string;
  entity: string;
  details: string;
  ipAddress: string;
}
