import React from 'react';
import { 
  ClipboardCheck, 
  CheckCircle2, 
  BarChart3
} from 'lucide-react';
import { MissionaryGroup, Person } from '../../types';
import { QuickAttendance } from '../QuickAttendance';

interface AttendanceViewProps {
  groups: MissionaryGroup[];
  people: Person[];
  onSaveAttendance: (
    groupId: string, 
    date: string, 
    attendanceMap: Record<string, 'presente' | 'falta_justificada' | 'falta_injustificada'>
  ) => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  groups,
  people,
  onSaveAttendance
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4.5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-lg font-serif font-bold text-[#0F172A] flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-[#4F46E5]" />
            Registro Fraterno & Asistencia Semanal
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Planillas de comunión por grupo de discipulado con actualización inmediata de inasistencias y alertas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-[#16A34A] bg-[#F6F8FB] border border-[#BBF7D0] px-3 py-1 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 84.6% Perseverancia Promedio
          </span>
        </div>
      </div>

      <QuickAttendance
        groups={groups}
        people={people}
        onSaveAttendance={onSaveAttendance}
      />

      <div className="bg-white p-4.5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <h2 className="text-sm font-serif font-bold text-[#0F172A] mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#4F46E5]" />
          Perseverancia por Grupo (Últimas 4 Semanas)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {groups.map((grp) => (
            <div key={grp.id} className="p-3 bg-[#F6F8FB] rounded-xl border border-[#E2E8F0] text-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-serif font-bold text-[#0F172A] truncate">{grp.name}</span>
                <span className={`font-serif font-bold ${
                  grp.averageAttendanceRate >= 85 ? 'text-[#16A34A]' :
                  grp.averageAttendanceRate >= 75 ? 'text-[#D97706]' : 'text-[#DC2626]'
                }`}>
                  {grp.averageAttendanceRate}%
                </span>
              </div>
              <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    grp.averageAttendanceRate >= 85 ? 'bg-[#16A34A]' :
                    grp.averageAttendanceRate >= 75 ? 'bg-[#D97706]' : 'bg-[#DC2626]'
                  }`}
                  style={{ width: `${grp.averageAttendanceRate}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-[#64748B] mt-1.5">
                <span>{grp.zone}</span>
                <span>{grp.memberCount} hermanos</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
