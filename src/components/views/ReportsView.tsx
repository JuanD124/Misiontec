import React, { useState } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Printer,
  BarChart2
} from 'lucide-react';
import { Person, MissionaryGroup } from '../../types';

interface ReportsViewProps {
  people: Person[];
  groups: MissionaryGroup[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  people,
  groups
}) => {
  const [reportType, setReportType] = useState<'executive' | 'traffic'>('executive');

  const printReport = () => {
    window.print();
  };

  const peopleInCare = people
    .filter(p => p.status !== 'green')
    .sort((a, b) => b.consecutiveAbsences - a.consecutiveAbsences);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4.5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-lg font-serif font-bold text-[#0F172A] flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#4F46E5]" />
            Informes Pastorales
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Consolidados de la misión y detalle de hermanos que requieren acompañamiento.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={printReport}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#F6F8FB] hover:bg-[#EEF2F7] text-[#4F46E5] text-xs font-medium rounded-lg border border-[#D8DFEA] transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#4F46E5]" />
            <span>Imprimir / Exportar PDF</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          onClick={() => setReportType('executive')}
          className={`p-4.5 rounded-xl border cursor-pointer transition-all ${
            reportType === 'executive'
              ? 'bg-[#F6F8FB] border-[#4F46E5] ring-1 ring-[#4F46E5]/20 shadow-xs'
              : 'bg-white border-[#E2E8F0] hover:border-[#94A3B8]'
          }`}
        >
          <FileText className="w-5 h-5 text-[#4F46E5] mb-2" />
          <h3 className="text-xs font-serif font-bold text-[#0F172A]">Consolidado de Misión</h3>
          <p className="text-[11px] text-[#64748B] mt-1">
            Resumen de {people.length} miembros y {groups.length} grupos con su asistencia.
          </p>
        </div>

        <div
          onClick={() => setReportType('traffic')}
          className={`p-4.5 rounded-xl border cursor-pointer transition-all ${
            reportType === 'traffic'
              ? 'bg-[#F6F8FB] border-[#4F46E5] ring-1 ring-[#4F46E5]/20 shadow-xs'
              : 'bg-white border-[#E2E8F0] hover:border-[#94A3B8]'
          }`}
        >
          <BarChart2 className="w-5 h-5 text-[#DC2626] mb-2" />
          <h3 className="text-xs font-serif font-bold text-[#0F172A]">Informe de Cuidado & Ausencias</h3>
          <p className="text-[11px] text-[#64748B] mt-1">
            Hermanos con inasistencias consecutivas a su grupo ({peopleInCare.length} en total).
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {reportType === 'executive' ? (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F6F8FB] text-[#64748B] uppercase text-[10px] font-semibold tracking-wider border-b border-[#E2E8F0]">
                <tr>
                  <th className="py-2.5 px-4.5">Grupo</th>
                  <th className="py-2.5 px-4.5">Zona</th>
                  <th className="py-2.5 px-4.5">Líder</th>
                  <th className="py-2.5 px-4.5">Miembros</th>
                  <th className="py-2.5 px-4.5">Asistencia</th>
                  <th className="py-2.5 px-4.5">En atención</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF2F7]">
                {groups.map((g) => (
                  <tr key={g.id} className="hover:bg-[#F6F8FB] transition-colors">
                    <td className="py-3 px-4.5 font-medium text-[#0F172A]">{g.name}</td>
                    <td className="py-3 px-4.5 text-[#334155]">{g.zone}</td>
                    <td className="py-3 px-4.5 text-[#334155]">{g.leaderName}</td>
                    <td className="py-3 px-4.5 text-[#0F172A]">{g.memberCount}</td>
                    <td className="py-3 px-4.5 text-[#0F172A]">{g.averageAttendanceRate}%</td>
                    <td className="py-3 px-4.5 text-[#B91C1C] font-medium">{g.criticalMembersCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F6F8FB] text-[#64748B] uppercase text-[10px] font-semibold tracking-wider border-b border-[#E2E8F0]">
                <tr>
                  <th className="py-2.5 px-4.5">Hermano</th>
                  <th className="py-2.5 px-4.5">Grupo</th>
                  <th className="py-2.5 px-4.5">Mentor</th>
                  <th className="py-2.5 px-4.5">Faltas seguidas</th>
                  <th className="py-2.5 px-4.5">Última asistencia</th>
                  <th className="py-2.5 px-4.5">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF2F7]">
                {peopleInCare.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#7B8BA3] italic">
                      Todos los hermanos asisten con regularidad.
                    </td>
                  </tr>
                ) : (
                  peopleInCare.map((p) => (
                    <tr key={p.id} className="hover:bg-[#F6F8FB] transition-colors">
                      <td className="py-3 px-4.5 font-medium text-[#0F172A]">{p.fullName}</td>
                      <td className="py-3 px-4.5 text-[#334155]">{p.groupName}</td>
                      <td className="py-3 px-4.5 text-[#334155]">{p.mentorName}</td>
                      <td className="py-3 px-4.5 text-[#0F172A]">{p.consecutiveAbsences}</td>
                      <td className="py-3 px-4.5 text-[#334155]">{p.lastAttendanceDate}</td>
                      <td className="py-3 px-4.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          p.status === 'red'
                            ? 'bg-[#FEE2E2] text-[#B91C1C] border border-[#FECACA]'
                            : 'bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]'
                        }`}>
                          {p.status === 'red' ? 'Atención Urgente' : 'Seguimiento'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
