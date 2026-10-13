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
    <div className="bg-white border border-[#E8DFD7] rounded-xl shadow-xs overflow-hidden">
      <div className="p-4.5 border-b border-[#E8DFD7] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-serif font-bold text-[#2D1F17] flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-[#8C5D36]" />
              Registro Fraterno de Asistencia por Célula
            </h2>
            <span className="text-xs bg-[#FAF7F2] text-[#7D6B5E] border border-[#E8DFD7] font-medium px-2 py-0.5 rounded">
              Comunión en Hogares
            </span>
          </div>
          <p className="text-xs text-[#7D6B5E] mt-0.5">
            Registrar la concurrencia a la reunión de oración actualiza el semáforo de cuidado pastoral.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-[#FAF7F2] px-2.5 py-1.5 rounded-lg border border-[#E0D4C7] text-xs">
            <Users className="w-3.5 h-3.5 text-[#8C5D36]" />
            <select
              value={currentGroupId}
              onChange={(e) => setCurrentGroupId(e.target.value)}
              className="bg-transparent font-medium text-[#2D1F17] focus:outline-none text-xs cursor-pointer"
            >
              {groups.map((grp) => (
                <option key={grp.id} value={grp.id}>
                  {grp.name} ({grp.code})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-[#FAF7F2] px-2.5 py-1.5 rounded-lg border border-[#E0D4C7] text-xs">
            <Calendar className="w-3.5 h-3.5 text-[#998576]" />
            <input
              type="date"
              value={meetingDate}
              onChange={(e) => setMeetingDate(e.target.value)}
              className="bg-transparent text-xs font-medium text-[#2D1F17] focus:outline-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="px-4.5 py-2.5 bg-[#FAF7F2] border-b border-[#E8DFD7] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-[#7D6B5E]">
            Líder/Anfitrión: <strong className="text-[#2D1F17]">{selectedGroup?.leaderName}</strong>
          </span>
          <span className="text-[#DDD3C5]">|</span>
          <span className="text-[#486341] font-medium">
            Presentes: {presentCount}
          </span>
          <span className="text-[#B38646] font-medium">
            Con Permiso: {justifiedCount}
          </span>
          <span className="text-[#9E382A] font-medium">
            Ausencias: {absentCount}
          </span>
          <span className="text-[#2D1F17] font-semibold">
            Perseverancia: {attendanceRate}%
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={markAllPresent}
            className="px-2.5 py-1 text-xs font-medium text-[#3B281C] bg-white hover:bg-[#FAF7F2] rounded-md border border-[#D9CCC1] transition-colors flex items-center gap-1 cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5 text-[#8C5D36]" />
            <span>Marcar Todos Presentes</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FAF7F2] text-[#7D6B5E] uppercase text-[10px] font-semibold tracking-wider border-b border-[#E8DFD7]">
            <tr>
              <th className="py-2.5 px-4.5">Hermano / Documento</th>
              <th className="py-2.5 px-4.5">Fase</th>
              <th className="py-2.5 px-4.5">Ausencias Anteriores</th>
              <th className="py-2.5 px-4.5 text-center">Asistencia ({meetingDate})</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F2ECE4]">
            {groupMembers.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-[#998576] italic">
                  No hay hermanos registrados en esta célula actualmente.
                </td>
              </tr>
            ) : (
              groupMembers.map((member) => {
                const currentStatus = attendanceState[member.id] || 'presente';

                return (
                  <tr key={member.id} className="hover:bg-[#FAF7F2] transition-colors">
                    <td className="py-3 px-4.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#E8DFD7] text-[#3B281C] flex items-center justify-center font-semibold text-[10px]">
                          {member.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-[#2D1F17]">{member.fullName}</p>
                          <p className="text-[10px] text-[#8C7A6D]">DNI: {member.dni}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4.5">
                      <span className="capitalize text-[11px] font-medium text-[#6B5A4E]">
                        {member.phase}
                      </span>
                    </td>

                    <td className="py-3 px-4.5">
                      {member.consecutiveAbsences > 0 ? (
                        <span className="text-[11px] font-medium text-[#8C3527]">
                          {member.consecutiveAbsences} faltas
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#486341]">
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
                              ? 'bg-[#486341] text-white shadow-xs'
                              : 'bg-[#FAF7F2] text-[#7D6B5E] hover:bg-[#F2ECE4]'
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
                              ? 'bg-[#B38646] text-white shadow-xs'
                              : 'bg-[#FAF7F2] text-[#7D6B5E] hover:bg-[#F2ECE4]'
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
                              ? 'bg-[#9E382A] text-white shadow-xs'
                              : 'bg-[#FAF7F2] text-[#7D6B5E] hover:bg-[#F2ECE4]'
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

      <div className="p-4.5 bg-[#FAF7F2] border-t border-[#E8DFD7] flex items-center justify-between">
        <div className="text-xs text-[#7D6B5E]">
          {isSavedRecently ? (
            <span className="text-[#486341] font-medium flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#8C5D36]" />
              ¡Asistencia guardada con éxito! El semáforo pastoral ha sido actualizado.
            </span>
          ) : (
            <span>Al registrar la asistencia, el cuidado pastoral recalcula el acompañamiento necesario.</span>
          )}
        </div>

        <button
          id="btn-save-attendance"
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-[#3B281C] hover:bg-[#2D1F17] text-[#FAF7F2] text-xs font-medium rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Guardar Asistencia</span>
        </button>
      </div>
    </div>
  );
};
