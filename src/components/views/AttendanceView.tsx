import React, { useEffect, useState } from 'react';
import { 
  ClipboardCheck, 
  CheckCircle2, 
  BarChart3
} from 'lucide-react';
import { MissionaryGroup, Person } from '../../types';
import { QuickAttendance } from '../QuickAttendance';
import { api, ReunionReciente } from '../../services/api';
import { fechaCorta } from '../../utils/formato';

interface AttendanceViewProps {
  groups: MissionaryGroup[];
  people: Person[];
  onSaveAttendance: (
    groupId: string, 
    date: string, 
    attendanceMap: Record<string, 'presente' | 'falta_justificada' | 'falta_injustificada'>
  ) => Promise<boolean>;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  groups,
  people,
  onSaveAttendance
}) => {
  const [recientes, setRecientes] = useState<ReunionReciente[]>([]);

  // Se vuelve a leer cada vez que cambian los datos (por ejemplo, al guardar una asistencia).
  useEffect(() => {
    let vigente = true;
    api.reunionesRecientes().then((r) => vigente && setRecientes(r)).catch(() => undefined);
    return () => { vigente = false; };
  }, [people, groups]);

  const conReuniones = groups.filter((g) => g.meetingsCount > 0);
  const promedio = conReuniones.length === 0
    ? null
    : Math.round((conReuniones.reduce((a, g) => a + g.averageAttendanceRate, 0) / conReuniones.length) * 10) / 10;

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
            <CheckCircle2 className="w-3.5 h-3.5" /> {promedio === null ? 'Sin reuniones en 4 semanas' : `${promedio}% Perseverancia Promedio (4 sem.)`}
          </span>
        </div>
      </div>

      <QuickAttendance
        groups={groups}
        people={people}
        onSaveAttendance={onSaveAttendance}
      />

      <div className="bg-white rounded-xl border border-[#E8E8E8] shadow-xs overflow-hidden">
        <div className="px-4.5 py-3 border-b border-[#E8E8E8] bg-[#FAFAFA]">
          <h2 className="text-sm font-serif font-bold text-[#0A0A0A] flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-[#EA580C]" />
            Reuniones registradas recientemente
          </h2>
          <p className="text-[11px] text-[#6B6B6B] mt-0.5">Lo que ya quedó guardado en la base de datos para cada reunión.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[#6B6B6B] uppercase text-[10px] font-semibold tracking-wider border-b border-[#E8E8E8]">
              <tr>
                <th className="py-2 px-4.5">Fecha</th>
                <th className="py-2 px-4.5">Grupo</th>
                <th className="py-2 px-4.5 text-center">Presentes</th>
                <th className="py-2 px-4.5 text-center">Con permiso</th>
                <th className="py-2 px-4.5 text-center">Faltas</th>
                <th className="py-2 px-4.5 text-center">Asistencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2F2F2]">
              {recientes.length === 0 ? (
                <tr><td colSpan={6} className="py-5 text-center text-[#8A8A8A] italic">Todavía no hay reuniones registradas.</td></tr>
              ) : recientes.map((r) => {
                const total = r.presentes + r.justificadas + r.injustificadas;
                return (
                  <tr key={`${r.groupId}-${r.fecha}`}>
                    <td className="py-2 px-4.5 font-medium text-[#0A0A0A]">{fechaCorta(r.fecha)}</td>
                    <td className="py-2 px-4.5 text-[#404040]">{r.grupo} <span className="text-[#A3A3A3]">({r.codigo})</span></td>
                    <td className="py-2 px-4.5 text-center text-[#16A34A] font-medium">{r.presentes}</td>
                    <td className="py-2 px-4.5 text-center text-[#CA8A04] font-medium">{r.justificadas}</td>
                    <td className="py-2 px-4.5 text-center text-[#DC2626] font-medium">{r.injustificadas}</td>
                    <td className="py-2 px-4.5 text-center text-[#0A0A0A]">{total > 0 ? `${Math.round((100 * r.presentes) / total)}%` : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white p-4.5 rounded-xl border border-[#E8E8E8] shadow-xs">
        <h2 className="text-sm font-serif font-bold text-[#0A0A0A] mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#EA580C]" />
          Perseverancia por Grupo (Últimas 4 Semanas)
        </h2>
        <p className="text-[11px] text-[#6B6B6B] -mt-1 mb-3">
          Se calcula con las reuniones de las últimas 4 semanas: presentes ÷ total de registros de asistencia del grupo.
          Las faltas con permiso y sin aviso cuentan como no presente. Un grupo sin reuniones en ese tiempo no tiene porcentaje.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {groups.map((grp) => (
            <div key={grp.id} className="p-3 bg-[#FAFAFA] rounded-xl border border-[#E8E8E8] text-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-serif font-bold text-[#0A0A0A] truncate">{grp.name}</span>
                <span className={`font-serif font-bold ${
                  grp.meetingsCount === 0 ? 'text-[#8A8A8A]' :
                  grp.averageAttendanceRate >= 85 ? 'text-[#16A34A]' :
                  grp.averageAttendanceRate >= 75 ? 'text-[#CA8A04]' : 'text-[#DC2626]'
                }`}>
                  {grp.meetingsCount === 0 ? 'Sin reuniones recientes' : `${grp.averageAttendanceRate}%`}
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
