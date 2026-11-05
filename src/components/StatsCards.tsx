import React from 'react';
import { Users, Church, CheckCircle2, HeartHandshake } from 'lucide-react';
import { Person, MissionaryGroup } from '../types';

interface StatsCardsProps {
  people: Person[];
  groups: MissionaryGroup[];
  onFilterByStatus?: (status: 'all' | 'green' | 'yellow' | 'red') => void;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  people,
  groups,
  onFilterByStatus
}) => {
  const totalPeople = people.length;
  const activeGroups = groups.filter(g => g.status === 'active').length;
  
  const averageAttendance = (
    groups.reduce((acc, curr) => acc + curr.averageAttendanceRate, 0) / groups.length
  ).toFixed(1);

  const criticalCount = people.filter(p => p.status === 'red').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div 
        id="kpi-card-personas"
        onClick={() => onFilterByStatus && onFilterByStatus('all')}
        className="bg-white border border-[#E2E8F0] rounded-xl p-4.5 shadow-xs hover:border-[#94A3B8] transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-[#64748B]">Total del Rebaño</span>
          <div className="w-9 h-9 rounded-lg bg-[#F6F8FB] text-[#4F46E5] border border-[#E2E8F0] flex items-center justify-center group-hover:bg-[#EEF2F7] transition-colors">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-2xl font-serif font-bold text-[#0F172A] tracking-tight">{totalPeople}</span>
          <span className="text-xs font-medium text-[#16A34A]">
            activos
          </span>
        </div>
        <p className="text-[11px] text-[#64748B]">
          {totalPeople} hermanos en seguimiento directo
        </p>
      </div>

      <div 
        id="kpi-card-grupos"
        className="bg-white border border-[#E2E8F0] rounded-xl p-4.5 shadow-xs hover:border-[#94A3B8] transition-all group"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-[#64748B]">Grupos de Discipulado</span>
          <div className="w-9 h-9 rounded-lg bg-[#F6F8FB] text-[#4F46E5] border border-[#E2E8F0] flex items-center justify-center group-hover:bg-[#EEF2F7] transition-colors">
            <Church className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-2xl font-serif font-bold text-[#0F172A] tracking-tight">{groups.length}</span>
          <span className="text-xs font-medium text-[#64748B]">
            grupos de discipulado
          </span>
        </div>
        <p className="text-[11px] text-[#64748B]">
          {activeGroups} grupos perseverando activamente
        </p>
      </div>

      <div 
        id="kpi-card-asistencia"
        className="bg-white border border-[#E2E8F0] rounded-xl p-4.5 shadow-xs hover:border-[#94A3B8] transition-all group"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-[#64748B]">Asistencia & Comunión</span>
          <div className="w-9 h-9 rounded-lg bg-[#F6F8FB] text-[#16A34A] border border-[#E2E8F0] flex items-center justify-center group-hover:bg-[#EEF2F7] transition-colors">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-2xl font-serif font-bold text-[#0F172A] tracking-tight">{averageAttendance}%</span>
          <span className="text-xs font-medium text-[#16A34A]">
            perseverancia
          </span>
        </div>
        <div className="w-full bg-[#F6F8FB] border border-[#E2E8F0] h-1.5 rounded-full overflow-hidden mt-2">
          <div 
            className="bg-[#4338CA] h-full rounded-full transition-all duration-500" 
            style={{ width: `${Math.min(parseFloat(averageAttendance), 100)}%` }}
          />
        </div>
      </div>

      <div 
        id="kpi-card-alertas"
        onClick={() => onFilterByStatus && onFilterByStatus('red')}
        className="bg-[#F8FAFC] border border-[#FECACA] rounded-xl p-4.5 shadow-xs hover:border-[#DC2626] transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-[#B91C1C] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
            Cuidado Requerido
          </span>
          <div className="w-9 h-9 rounded-lg bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA] flex items-center justify-center group-hover:bg-[#FEE2E2] transition-colors">
            <HeartHandshake className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-2xl font-serif font-bold text-[#B91C1C] tracking-tight">{criticalCount}</span>
          <span className="text-xs font-medium text-[#B91C1C]">
            hermanos
          </span>
        </div>
        <p className="text-[11px] text-[#DC2626]">
          Ausencias reiteradas en su grupo
        </p>
      </div>
    </div>
  );
};

