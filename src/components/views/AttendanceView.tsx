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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4.5 rounded-xl border border-[#E8E8E8] shadow-xs">
        <div>
          <h1 className="text-lg font-serif font-bold text-[#0A0A0A] flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-[#EA580C]" />
            Registro Fraterno & Asistencia Semanal
          </h1>
          <p className="text-xs text-[#6B6B6B] mt-0.5">
            Planillas de comunión por grupo de comunión con actualización inmediata de inasistencias y alertas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-[#16A34A] bg-[#FAFAFA] border border-[#BBF7D0] px-3 py-1 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 84.6% Perseverancia Promedio
          </span>
        </div>
      </div>

      <QuickAttendance
        groups={groups}
        people={people}
        onSaveAttendance={onSaveAttendance}
      />

      <div className="bg-white p-4.5 rounded-xl border border-[#E8E8E8] shadow-xs">
        <h2 className="text-sm font-serif font-bold text-[#0A0A0A] mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#EA580C]" />
          Perseverancia por Grupo (Últimas 4 Semanas)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {groups.map((grp) => (
            <div key={grp.id} className="p-3 bg-[#FAFAFA] rounded-xl border border-[#E8E8E8] text-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-serif font-bold text-[#0A0A0A] truncate">{grp.name}</span>
                <span className={`font-serif font-bold ${
                  grp.averageAttendanceRate >= 85 ? 'text-[#16A34A]' :
                  grp.averageAttendanceRate >= 75 ? 'text-[#CA8A04]' : 'text-[#DC2626]'
                }`}>
                  {grp.averageAttendanceRate}%
                </span>
              </div>
              <div className="w-full bg-[#E8E8E8] h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    grp.averageAttendanceRate >= 85 ? 'bg-[#16A34A]' :
                    grp.averageAttendanceRate >= 75 ? 'bg-[#CA8A04]' : 'bg-[#DC2626]'
                  }`}
                  style={{ width: `${grp.averageAttendanceRate}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-[#6B6B6B] mt-1.5">
                <span>{grp.zone}</span>
                <span>{grp.memberCount} discípulos</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
