import React from 'react';
import { Church, Clock, MapPin, ArrowRight } from 'lucide-react';
import { MissionaryGroup } from '../types';

interface GroupsCardProps {
  groups: MissionaryGroup[];
  onVerGrupos?: () => void;
}

const colorPerseverancia = (valor: number) =>
  valor >= 85
    ? 'bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]'
    : valor >= 70
      ? 'bg-[#FEF9C3] text-[#854D0E] border-[#FEF08A]'
      : 'bg-[#FEE2E2] text-[#B91C1C] border-[#FECACA]';

export const GroupsCard: React.FC<GroupsCardProps> = ({ groups, onVerGrupos }) => {
  const visibles = groups.slice(0, 4);
  const restantes = groups.length - visibles.length;

  return (
    <section className="bg-white border border-[#E8E8E8] rounded-xl shadow-xs flex flex-col" aria-labelledby="tarjeta-grupos">
      <div className="p-4 sm:p-4.5 border-b border-[#E8E8E8] flex items-center justify-between gap-3">
        <h2 id="tarjeta-grupos" className="text-sm font-bold text-[#0A0A0A] flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-[#FFEDD5] flex items-center justify-center">
            <Church className="w-4 h-4 text-[#EA580C]" />
          </span>
          Grupos de Comunión
        </h2>
        <span className="text-xs font-medium bg-[#FAFAFA] text-[#6B6B6B] border border-[#E8E8E8] px-2.5 py-1 rounded-full">
          {groups.length} {groups.length === 1 ? 'grupo' : 'grupos'}
        </span>
      </div>

      {groups.length === 0 ? (
        <p className="p-6 text-center text-xs text-[#8A8A8A] italic">Todavía no hay grupos de comunión.</p>
      ) : (
        <ul className="divide-y divide-[#F2F2F2]">
          {visibles.map((g) => (
            <li key={g.id} className="p-3.5 sm:px-4.5 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#0A0A0A] truncate">
                  <span className="text-[10px] font-mono font-medium text-[#EA580C] mr-1.5">{g.code}</span>
                  {g.name}
                </p>
                <p className="text-[11px] text-[#6B6B6B] mt-0.5 flex items-center gap-1 truncate">
                  <MapPin className="w-3 h-3 shrink-0" />
                  {g.zone || 'Sin zona'} • Líder: {g.leaderName}
                </p>
                <p className="text-[11px] text-[#6B6B6B] mt-0.5 flex items-center gap-1">
                  <Clock className="w-3 h-3 shrink-0" />
                  {g.meetingDay} {g.meetingTime} • {g.memberCount} {g.memberCount === 1 ? 'discípulo' : 'discípulos'}
                </p>
              </div>
              <span className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full border ${colorPerseverancia(g.averageAttendanceRate)}`}>
                {g.averageAttendanceRate}% perseverancia
              </span>
            </li>
          ))}
        </ul>
      )}

      {onVerGrupos && (
        <button
          onClick={onVerGrupos}
          className="mt-auto m-3 sm:m-4 px-3 py-2 text-xs font-medium text-[#EA580C] bg-[#FAFAFA] hover:bg-[#F2F2F2] border border-[#E0E0E0] rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
        >
          {restantes > 0 ? `Ver los ${groups.length} grupos` : 'Ir a Grupos de Comunión'}
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </section>
  );
};
