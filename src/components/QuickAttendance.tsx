import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, 
  Calendar, 
  Check, 
  X, 
  AlertCircle, 
  Save, 
  Users, 
  CheckCheck,
  Sparkles
} from 'lucide-react';
import { MissionaryGroup, Person } from '../types';

interface QuickAttendanceProps {
  groups: MissionaryGroup[];
  people: Person[];
  selectedGroupId?: string;
  onSaveAttendance: (
    groupId: string, 
    date: string, 
    attendanceMap: Record<string, 'presente' | 'falta_justificada' | 'falta_injustificada'>
  ) => void;
}

export const QuickAttendance: React.FC<QuickAttendanceProps> = ({
  groups,
  people,
  selectedGroupId: initialGroupId,
  onSaveAttendance
}) => {
  const [currentGroupId, setCurrentGroupId] = useState<string>(initialGroupId || groups[0]?.id || '');
  const [meetingDate, setMeetingDate] = useState<string>('2026-09-15');
  const [attendanceState, setAttendanceState] = useState<Record<string, 'presente' | 'falta_justificada' | 'falta_injustificada'>>({});
  const [isSavedRecently, setIsSavedRecently] = useState(false);

  const groupMembers = people.filter(p => p.groupId === currentGroupId);

  useEffect(() => {
    if (initialGroupId) {
      setCurrentGroupId(initialGroupId);
    }
  }, [initialGroupId]);

  useEffect(() => {
    const initialState: Record<string, 'presente' | 'falta_justificada' | 'falta_injustificada'> = {};
    groupMembers.forEach(m => {
      initialState[m.id] = m.consecutiveAbsences > 0 ? 'falta_injustificada' : 'presente';
    });
    setAttendanceState(initialState);
  }, [currentGroupId, people]);

  const handleStatusChange = (personId: string, status: 'presente' | 'falta_justificada' | 'falta_injustificada') => {
    setAttendanceState(prev => ({
      ...prev,
      [personId]: status
    }));
  };

  const markAllPresent = () => {
    const next: Record<string, 'presente' | 'falta_justificada' | 'falta_injustificada'> = {};
    groupMembers.forEach(m => {
      next[m.id] = 'presente';
    });
    setAttendanceState(next);
  };

  const handleSave = () => {
    onSaveAttendance(currentGroupId, meetingDate, attendanceState);
    setIsSavedRecently(true);
    setTimeout(() => setIsSavedRecently(false), 3000);
  };

  const presentCount = Object.values(attendanceState).filter(s => s === 'presente').length;
  const justifiedCount = Object.values(attendanceState).filter(s => s === 'falta_justificada').length;
  const absentCount = Object.values(attendanceState).filter(s => s === 'falta_injustificada').length;
  const totalCount = groupMembers.length || 1;
  const attendanceRate = Math.round((presentCount / totalCount) * 100);

  const selectedGroup = groups.find(g => g.id === currentGroupId);

  return (
    <div className="bg-white border border-[#E8E8E8] rounded-xl shadow-xs overflow-hidden">
      <div className="p-4.5 border-b border-[#E8E8E8] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-serif font-bold text-[#0A0A0A] flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-[#EA580C]" />
              Registro de Asistencia por Grupo
            </h2>
            <span className="text-xs bg-[#FAFAFA] text-[#6B6B6B] border border-[#E8E8E8] font-medium px-2 py-0.5 rounded">
              Reuniones de Discipulado
            </span>
          </div>
          <p className="text-xs text-[#6B6B6B] mt-0.5">
            Registrar la concurrencia a la reunión de oración actualiza el semáforo de cuidado pastoral.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-[#FAFAFA] px-2.5 py-1.5 rounded-lg border border-[#E0E0E0] text-xs">
            <Users className="w-3.5 h-3.5 text-[#EA580C]" />
            <select
              value={currentGroupId}
              onChange={(e) => setCurrentGroupId(e.target.value)}
              className="bg-transparent font-medium text-[#0A0A0A] focus:outline-none text-xs cursor-pointer"
            >
              {groups.map((grp) => (
                <option key={grp.id} value={grp.id}>
                  {grp.name} ({grp.code})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-[#FAFAFA] px-2.5 py-1.5 rounded-lg border border-[#E0E0E0] text-xs">
            <Calendar className="w-3.5 h-3.5 text-[#8A8A8A]" />
            <input
              type="date"
              value={meetingDate}
              onChange={(e) => setMeetingDate(e.target.value)}
              className="bg-transparent text-xs font-medium text-[#0A0A0A] focus:outline-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="px-4.5 py-2.5 bg-[#FAFAFA] border-b border-[#E8E8E8] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-[#6B6B6B]">
            Líder/Anfitrión: <strong className="text-[#0A0A0A]">{selectedGroup?.leaderName}</strong>
          </span>
          <span className="text-[#D4D4D4]">|</span>
          <span className="text-[#16A34A] font-medium">
            Presentes: {presentCount}
          </span>
          <span className="text-[#CA8A04] font-medium">
            Con Permiso: {justifiedCount}
          </span>
          <span className="text-[#DC2626] font-medium">
            Ausencias: {absentCount}
          </span>
          <span className="text-[#0A0A0A] font-semibold">
            Perseverancia: {attendanceRate}%
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={markAllPresent}
            className="px-2.5 py-1 text-xs font-medium text-[#EA580C] bg-white hover:bg-[#FAFAFA] rounded-md border border-[#E0E0E0] transition-colors flex items-center gap-1 cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5 text-[#EA580C]" />
            <span>Marcar Todos Presentes</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FAFAFA] text-[#6B6B6B] uppercase text-[10px] font-semibold tracking-wider border-b border-[#E8E8E8]">
            <tr>
              <th className="py-2.5 px-4.5">Hermano / Documento</th>
              <th className="py-2.5 px-4.5">Fase</th>
              <th className="py-2.5 px-4.5">Ausencias Anteriores</th>
              <th className="py-2.5 px-4.5 text-center">Asistencia ({meetingDate})</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F2F2F2]">
            {groupMembers.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-[#8A8A8A] italic">
                  No hay hermanos registrados en este grupo actualmente.
                </td>
              </tr>
            ) : (
              groupMembers.map((member) => {
                const currentStatus = attendanceState[member.id] || 'presente';

                return (
                  <tr key={member.id} className="hover:bg-[#FAFAFA] transition-colors">
                    <td className="py-3 px-4.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#E8E8E8] text-[#EA580C] flex items-center justify-center font-semibold text-[10px]">
                          {member.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-[#0A0A0A]">{member.fullName}</p>
                          <p className="text-[10px] text-[#6B6B6B]">DNI: {member.dni}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4.5">
                      <span className="capitalize text-[11px] font-medium text-[#525252]">
                        {member.phase}
                      </span>
                    </td>

                    <td className="py-3 px-4.5">
                      {member.consecutiveAbsences > 0 ? (
                        <span className="text-[11px] font-medium text-[#B91C1C]">
                          {member.consecutiveAbsences} faltas
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#16A34A]">
                          Al día
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4.5">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(member.id, 'presente')}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                            currentStatus === 'presente'
                              ? 'bg-[#16A34A] text-white shadow-xs'
                              : 'bg-[#FAFAFA] text-[#6B6B6B] hover:bg-[#F2F2F2]'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Presente</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(member.id, 'falta_justificada')}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                            currentStatus === 'falta_justificada'
                              ? 'bg-[#CA8A04] text-white shadow-xs'
                              : 'bg-[#FAFAFA] text-[#6B6B6B] hover:bg-[#F2F2F2]'
                          }`}
                        >
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Con Permiso</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(member.id, 'falta_injustificada')}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                            currentStatus === 'falta_injustificada'
                              ? 'bg-[#DC2626] text-white shadow-xs'
                              : 'bg-[#FAFAFA] text-[#6B6B6B] hover:bg-[#F2F2F2]'
                          }`}
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Falta</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4.5 bg-[#FAFAFA] border-t border-[#E8E8E8] flex items-center justify-between">
        <div className="text-xs text-[#6B6B6B]">
          {isSavedRecently ? (
            <span className="text-[#16A34A] font-medium flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#EA580C]" />
              ¡Asistencia guardada con éxito! El semáforo pastoral ha sido actualizado.
            </span>
          ) : (
            <span>Al registrar la asistencia, el cuidado pastoral recalcula el acompañamiento necesario.</span>
          )}
        </div>

        <button
          id="btn-save-attendance"
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-[#FAFAFA] text-xs font-medium rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Guardar Asistencia</span>
        </button>
      </div>
    </div>
  );
};
