import React, { useState } from 'react';
import {
  FileSpreadsheet,
  FileText,
  ClipboardList,
  Printer,
  BarChart2
} from 'lucide-react';
import { Person, MissionaryGroup } from '../../types';
import { GeneralReport } from '../GeneralReport';

interface ReportsViewProps {
  rolActivo: string;
  people: Person[];
  groups: MissionaryGroup[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  rolActivo,
  people,
  groups
}) => {
  const [reportType, setReportType] = useState<'general' | 'executive' | 'traffic'>('general');

  const printReport = () => {
    window.print();
  };

  const peopleInCare = people
    .filter(p => p.status !== 'green')
    .sort((a, b) => b.consecutiveAbsences - a.consecutiveAbsences);

  return (
    <div className="space-y-4">
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4.5 rounded-xl border border-[#E8E8E8] shadow-xs">
        <div>
          <h1 className="text-lg font-serif font-bold text-[#0A0A0A] flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#EA580C]" />
            Informes Pastorales
          </h1>
          <p className="text-xs text-[#6B6B6B] mt-0.5">
            Consolidados de la misión y detalle de hermanos que requieren acompañamiento.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={printReport}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#FAFAFA] hover:bg-[#F2F2F2] text-[#EA580C] text-xs font-medium rounded-lg border border-[#E0E0E0] transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#EA580C]" />
            <span>Imprimir / Exportar PDF</span>
          </button>
        </div>
      </div>

      <div className="no-print grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => setReportType('general')}
          className={`p-4.5 rounded-xl border cursor-pointer transition-all ${
            reportType === 'general'
              ? 'bg-[#FAFAFA] border-[#EA580C] ring-1 ring-[#EA580C]/20 shadow-xs'
              : 'bg-white border-[#E8E8E8] hover:border-[#A3A3A3]'
          }`}
        >
          <ClipboardList className="w-5 h-5 text-[#EA580C] mb-2" />
          <h3 className="text-xs font-serif font-bold text-[#0A0A0A]">Informe General de Seguimiento</h3>
          <p className="text-[11px] text-[#6B6B6B] mt-1">
            Todo en un solo documento: grupos, asistencia, acompañamiento, eventos y equipo.
          </p>
        </div>

        <div
          onClick={() => setReportType('executive')}
          className={`p-4.5 rounded-xl border cursor-pointer transition-all ${
            reportType === 'executive'
              ? 'bg-[#FAFAFA] border-[#EA580C] ring-1 ring-[#EA580C]/20 shadow-xs'
              : 'bg-white border-[#E8E8E8] hover:border-[#A3A3A3]'
          }`}
        >
          <FileText className="w-5 h-5 text-[#EA580C] mb-2" />
          <h3 className="text-xs font-serif font-bold text-[#0A0A0A]">Consolidado de Misión</h3>
          <p className="text-[11px] text-[#6B6B6B] mt-1">
            Resumen de {people.length} miembros y {groups.length} grupos con su asistencia.
          </p>
        </div>

        <div
          onClick={() => setReportType('traffic')}
          className={`p-4.5 rounded-xl border cursor-pointer transition-all ${
            reportType === 'traffic'
              ? 'bg-[#FAFAFA] border-[#EA580C] ring-1 ring-[#EA580C]/20 shadow-xs'
              : 'bg-white border-[#E8E8E8] hover:border-[#A3A3A3]'
          }`}
        >
          <BarChart2 className="w-5 h-5 text-[#DC2626] mb-2" />
          <h3 className="text-xs font-serif font-bold text-[#0A0A0A]">Informe de Cuidado & Ausencias</h3>
          <p className="text-[11px] text-[#6B6B6B] mt-1">
            Hermanos con inasistencias consecutivas a su grupo ({peopleInCare.length} en total).
          </p>
        </div>
      </div>

      {reportType === 'general' ? (
        <GeneralReport rolActivo={rolActivo} />
      ) : (
      <div className="bg-white rounded-xl border border-[#E8E8E8] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {reportType === 'executive' ? (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFAFA] text-[#6B6B6B] uppercase text-[10px] font-semibold tracking-wider border-b border-[#E8E8E8]">
                <tr>
                  <th className="py-2.5 px-4.5">Grupo</th>
                  <th className="py-2.5 px-4.5">Zona</th>
                  <th className="py-2.5 px-4.5">Líder</th>
                  <th className="py-2.5 px-4.5">Miembros</th>
                  <th className="py-2.5 px-4.5">Asistencia</th>
                  <th className="py-2.5 px-4.5">En atención</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2F2F2]">
                {groups.map((g) => (
                  <tr key={g.id} className="hover:bg-[#FAFAFA] transition-colors">
                    <td className="py-3 px-4.5 font-medium text-[#0A0A0A]">{g.name}</td>
                    <td className="py-3 px-4.5 text-[#404040]">{g.zone}</td>
                    <td className="py-3 px-4.5 text-[#404040]">{g.leaderName}</td>
                    <td className="py-3 px-4.5 text-[#0A0A0A]">{g.memberCount}</td>
                    <td className="py-3 px-4.5 text-[#0A0A0A]">{g.averageAttendanceRate}%</td>
                    <td className="py-3 px-4.5 text-[#B91C1C] font-medium">{g.criticalMembersCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFAFA] text-[#6B6B6B] uppercase text-[10px] font-semibold tracking-wider border-b border-[#E8E8E8]">
                <tr>
                  <th className="py-2.5 px-4.5">Hermano</th>
                  <th className="py-2.5 px-4.5">Grupo</th>
                  <th className="py-2.5 px-4.5">Mentor</th>
                  <th className="py-2.5 px-4.5">Faltas seguidas</th>
                  <th className="py-2.5 px-4.5">Última asistencia</th>
                  <th className="py-2.5 px-4.5">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2F2F2]">
                {peopleInCare.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#8A8A8A] italic">
                      Todos los hermanos asisten con regularidad.
                    </td>
                  </tr>
                ) : (
                  peopleInCare.map((p) => (
                    <tr key={p.id} className="hover:bg-[#FAFAFA] transition-colors">
                      <td className="py-3 px-4.5 font-medium text-[#0A0A0A]">{p.fullName}</td>
                      <td className="py-3 px-4.5 text-[#404040]">{p.groupName}</td>
                      <td className="py-3 px-4.5 text-[#404040]">{p.mentorName}</td>
                      <td className="py-3 px-4.5 text-[#0A0A0A]">{p.consecutiveAbsences}</td>
                      <td className="py-3 px-4.5 text-[#404040]">{p.lastAttendanceDate}</td>
                      <td className="py-3 px-4.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          p.status === 'red'
                            ? 'bg-[#FEE2E2] text-[#B91C1C] border border-[#FECACA]'
                            : 'bg-[#FEF9C3] text-[#854D0E] border border-[#FEF08A]'
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
      )}
    </div>
  );
};
