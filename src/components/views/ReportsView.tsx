import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  ShieldCheck, 
  FileText, 
  Printer, 
  BarChart2
} from 'lucide-react';
import { AuditLog, Person, MissionaryGroup } from '../../types';

interface ReportsViewProps {
  auditLogs: AuditLog[];
  people: Person[];
  groups: MissionaryGroup[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  auditLogs,
  people,
  groups
}) => {
  const [reportType, setReportType] = useState('executive');

  const printReport = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4.5 rounded-xl border border-[#E8DFD7] shadow-xs">
        <div>
          <h1 className="text-lg font-serif font-bold text-[#2D1F17] flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#8C5D36]" />
            Informes Pastorales & Bitácora de Registro
          </h1>
          <p className="text-xs text-[#7D6B5E] mt-0.5">
            Consolidados de gestión de la misión y registro inmutable de trazabilidad de cambios.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={printReport}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#FAF7F2] hover:bg-[#F2ECE4] text-[#3B281C] text-xs font-medium rounded-lg border border-[#D9CCC1] transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#8C5D36]" />
            <span>Imprimir / Exportar PDF</span>
          </button>
        </div>
      </div>

      {/* Reports Selector & Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          onClick={() => setReportType('executive')}
          className={`p-4.5 rounded-xl border cursor-pointer transition-all ${
            reportType === 'executive' 
              ? 'bg-[#FAF7F2] border-[#8C5D36] ring-1 ring-[#8C5D36]/20 shadow-xs' 
              : 'bg-white border-[#E8DFD7] hover:border-[#B8A18E]'
          }`}
        >
          <FileText className="w-5 h-5 text-[#8C5D36] mb-2" />
          <h3 className="text-xs font-serif font-bold text-[#2D1F17]">Consolidado Mensual de Misión</h3>
          <p className="text-[11px] text-[#7D6B5E] mt-1">
            Resumen estadístico de {people.length} miembros, {groups.length} células y semáforo pastoral.
          </p>
        </div>

        <div 
          onClick={() => setReportType('traffic')}
          className={`p-4.5 rounded-xl border cursor-pointer transition-all ${
            reportType === 'traffic' 
              ? 'bg-[#FAF7F2] border-[#8C5D36] ring-1 ring-[#8C5D36]/20 shadow-xs' 
              : 'bg-white border-[#E8DFD7] hover:border-[#B8A18E]'
          }`}
        >
          <BarChart2 className="w-5 h-5 text-[#9E382A] mb-2" />
          <h3 className="text-xs font-serif font-bold text-[#2D1F17]">Informe de Cuidado & Ausencias</h3>
          <p className="text-[11px] text-[#7D6B5E] mt-1">
            Detalle de hermanos en atención prioritaria con compromisos de visita y oración.
          </p>
        </div>

        <div 
          onClick={() => setReportType('audit')}
          className={`p-4.5 rounded-xl border cursor-pointer transition-all ${
            reportType === 'audit' 
              ? 'bg-[#FAF7F2] border-[#8C5D36] ring-1 ring-[#8C5D36]/20 shadow-xs' 
              : 'bg-white border-[#E8DFD7] hover:border-[#B8A18E]'
          }`}
        >
          <ShieldCheck className="w-5 h-5 text-[#486341] mb-2" />
          <h3 className="text-xs font-serif font-bold text-[#2D1F17]">Bitácora de Trazabilidad</h3>
          <p className="text-[11px] text-[#7D6B5E] mt-1">
            Registro de ingresos, promociones de discipulado y asistencias por usuario.
          </p>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-[#E8DFD7] shadow-xs overflow-hidden">
        <div className="p-4.5 border-b border-[#E8DFD7] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#8C5D36]" />
            <h2 className="text-sm font-serif font-bold text-[#2D1F17]">
              Bitácora Histórica de Auditoría
            </h2>
          </div>
          <span className="text-xs bg-[#FAF7F2] text-[#7D6B5E] border border-[#E8DFD7] px-2 py-0.5 rounded font-mono">
            {auditLogs.length} acciones registradas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] text-[#7D6B5E] uppercase text-[10px] font-semibold tracking-wider border-b border-[#E8DFD7]">
              <tr>
                <th className="py-2.5 px-4.5">Fecha & Hora</th>
                <th className="py-2.5 px-4.5">Usuario Responsable</th>
                <th className="py-2.5 px-4.5">Rol Pastoral</th>
                <th className="py-2.5 px-4.5">Acción</th>
                <th className="py-2.5 px-4.5">Entidad Afectada</th>
                <th className="py-2.5 px-4.5">Detalles</th>
                <th className="py-2.5 px-4.5">Origen IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2ECE4]">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#FAF7F2] transition-colors">
                  <td className="py-3 px-4.5 font-mono text-[#7D6B5E] text-[11px] whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-3 px-4.5 font-medium text-[#2D1F17]">
                    {log.userName}
                  </td>
                  <td className="py-3 px-4.5">
                    <span className="bg-[#FAF7F2] text-[#6B4E3D] border border-[#E8DFD7] px-2 py-0.5 rounded text-[10px] font-medium">
                      {log.userRole}
                    </span>
                  </td>
                  <td className="py-3 px-4.5 font-mono font-medium text-[11px] text-[#8C5D36]">
                    {log.action}
                  </td>
                  <td className="py-3 px-4.5 text-[#2D1F17]">
                    {log.entity}
                  </td>
                  <td className="py-3 px-4.5 text-[#5C4535] max-w-xs">
                    {log.details}
                  </td>
                  <td className="py-3 px-4.5 font-mono text-[#998576] text-[10px]">
                    {log.ipAddress}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
