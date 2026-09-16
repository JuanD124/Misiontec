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
  
  // Average attendance rate across groups
  const averageAttendance = (
    groups.reduce((acc, curr) => acc + curr.averageAttendanceRate, 0) / groups.length
  ).toFixed(1);

  // Critical alerts count (status === 'red')
  const criticalCount = people.filter(p => p.status === 'red').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* KPI 1: Total Rebaño */}
      <div 
        id="kpi-card-personas"
        onClick={() => onFilterByStatus && onFilterByStatus('all')}
        className="bg-white border border-[#E8DFD7] rounded-xl p-4.5 shadow-xs hover:border-[#B8A18E] transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-[#7D6B5E]">Total del Rebaño</span>
          <div className="w-9 h-9 rounded-lg bg-[#FAF7F2] text-[#8C5D36] border border-[#E8DFD7] flex items-center justify-center group-hover:bg-[#F2ECE4] transition-colors">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-2xl font-serif font-bold text-[#2D1F17] tracking-tight">{totalPeople * 12}</span>
          <span className="text-xs font-medium text-[#486341]">
            activos
          </span>
        </div>
        <p className="text-[11px] text-[#8C7A6D]">
          {totalPeople} hermanos en seguimiento directo
        </p>
      </div>

      {/* KPI 2: Células en Hogares */}
      <div 
        id="kpi-card-grupos"
        className="bg-white border border-[#E8DFD7] rounded-xl p-4.5 shadow-xs hover:border-[#B8A18E] transition-all group"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-[#7D6B5E]">Células en Hogares</span>
          <div className="w-9 h-9 rounded-lg bg-[#FAF7F2] text-[#8C5D36] border border-[#E8DFD7] flex items-center justify-center group-hover:bg-[#F2ECE4] transition-colors">
            <Church className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-2xl font-serif font-bold text-[#2D1F17] tracking-tight">{groups.length}</span>
          <span className="text-xs font-medium text-[#7D6B5E]">
            hogares de oración
          </span>
        </div>
        <p className="text-[11px] text-[#8C7A6D]">
          {activeGroups} células perseverando activamente
        </p>
      </div>

      {/* KPI 3: Asistencia y Comunión */}
      <div 
        id="kpi-card-asistencia"
        className="bg-white border border-[#E8DFD7] rounded-xl p-4.5 shadow-xs hover:border-[#B8A18E] transition-all group"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-[#7D6B5E]">Asistencia & Comunión</span>
          <div className="w-9 h-9 rounded-lg bg-[#FAF7F2] text-[#486341] border border-[#E8DFD7] flex items-center justify-center group-hover:bg-[#F2ECE4] transition-colors">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-2xl font-serif font-bold text-[#2D1F17] tracking-tight">{averageAttendance}%</span>
          <span className="text-xs font-medium text-[#486341]">
            perseverancia
          </span>
        </div>
        <div className="w-full bg-[#FAF7F2] border border-[#E8DFD7] h-1.5 rounded-full overflow-hidden mt-2">
          <div 
            className="bg-[#6B4E3D] h-full rounded-full transition-all duration-500" 
            style={{ width: `${Math.min(parseFloat(averageAttendance), 100)}%` }}
          />
        </div>
      </div>

      {/* KPI 4: Acompañamiento / Cuidado Pastoral */}
      <div 
        id="kpi-card-alertas"
        onClick={() => onFilterByStatus && onFilterByStatus('red')}
        className="bg-[#FDFBF7] border border-[#EAD5D1] rounded-xl p-4.5 shadow-xs hover:border-[#9E382A] transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-[#8C3527] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#9E382A]" />
            Cuidado Requerido
          </span>
          <div className="w-9 h-9 rounded-lg bg-[#FBEBE9] text-[#9E382A] border border-[#F2D0CC] flex items-center justify-center group-hover:bg-[#F7DDD9] transition-colors">
            <HeartHandshake className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-2xl font-serif font-bold text-[#8C3527] tracking-tight">{criticalCount}</span>
          <span className="text-xs font-medium text-[#8C3527]">
            hermanos
          </span>
        </div>
        <p className="text-[11px] text-[#A3594F]">
          Ausencias reiteradas o sin visita pastoral
        </p>
      </div>
    </div>
  );
};

