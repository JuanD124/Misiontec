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
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4.5 rounded-xl border border-[#E8DFD7] shadow-xs">
        <div>
          <h1 className="text-lg font-serif font-bold text-[#2D1F17] flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-[#8C5D36]" />
            Registro Fraterno & Asistencia Semanal
          </h1>
          <p className="text-xs text-[#7D6B5E] mt-0.5">
            Planillas de comunión por célula en hogar con actualización inmediata de inasistencias y alertas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-[#486341] bg-[#FAF7F2] border border-[#D4E4CF] px-3 py-1 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 84.6% Perseverancia Promedio
          </span>
        </div>
      </div>

      {/* Main interactive attendance component */}
      <QuickAttendance
        groups={groups}
        people={people}
        onSaveAttendance={onSaveAttendance}
      />

      {/* Group Attendance Performance Comparison */}
      <div className="bg-white p-4.5 rounded-xl border border-[#E8DFD7] shadow-xs">
        <h2 className="text-sm font-serif font-bold text-[#2D1F17] mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#8C5D36]" />
          Perseverancia por Célula (Últimas 4 Semanas)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {groups.map((grp) => (
            <div key={grp.id} className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E8DFD7] text-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-serif font-bold text-[#2D1F17] truncate">{grp.name}</span>
                <span className={`font-serif font-bold ${
                  grp.averageAttendanceRate >= 85 ? 'text-[#486341]' :
                  grp.averageAttendanceRate >= 75 ? 'text-[#B38646]' : 'text-[#9E382A]'
                }`}>
                  {grp.averageAttendanceRate}%
                </span>
              </div>
              <div className="w-full bg-[#E8DFD7] h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    grp.averageAttendanceRate >= 85 ? 'bg-[#486341]' :
                    grp.averageAttendanceRate >= 75 ? 'bg-[#B38646]' : 'bg-[#9E382A]'
                  }`}
                  style={{ width: `${grp.averageAttendanceRate}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-[#7D6B5E] mt-1.5">
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
