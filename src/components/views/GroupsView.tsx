import React, { useState } from 'react';
import { 
  Church, 
  Users, 
  Clock, 
  MapPin, 
  ExternalLink
} from 'lucide-react';
import { MissionaryGroup, Person } from '../../types';
import { InteractiveMap } from '../InteractiveMap';

interface GroupsViewProps {
  groups: MissionaryGroup[];
  people: Person[];
  onTakeAttendanceForGroup?: (groupId: string) => void;
}

export const GroupsView: React.FC<GroupsViewProps> = ({
  groups,
  people,
  onTakeAttendanceForGroup
}) => {
  const [selectedGroup, setSelectedGroup] = useState<MissionaryGroup | null>(groups[0] || null);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4.5 rounded-xl border border-[#E8E8E8] shadow-xs">
        <div>
          <h1 className="text-lg font-serif font-bold text-[#0A0A0A] flex items-center gap-2">
            <Church className="w-5 h-5 text-[#EA580C]" />
            Grupos de Discipulado & Red Territorial
          </h1>
          <p className="text-xs text-[#6B6B6B] mt-0.5">
            Monitoreo territorial de grupos de discipulado, perseverancia y presencia pastoral por zonas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-[#FAFAFA] text-[#16A34A] border border-[#BBF7D0] font-medium px-3 py-1 rounded-full">
            {groups.length} Grupos Activos
          </span>
        </div>
      </div>

      <InteractiveMap
        groups={groups}
        onSelectGroup={(g) => setSelectedGroup(g)}
        onQuickAttendanceForGroup={onTakeAttendanceForGroup}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((grp) => {
          const isSelected = selectedGroup?.id === grp.id;

          return (
            <div
              key={grp.id}
              className={`p-4.5 bg-white rounded-xl border transition-all shadow-xs ${
                isSelected
                  ? 'border-[#EA580C] ring-1 ring-[#EA580C]/20 shadow-xs'
                  : 'border-[#E8E8E8] hover:border-[#A3A3A3]'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="text-[10px] font-mono font-medium text-[#EA580C] bg-[#FAFAFA] border border-[#E8E8E8] px-1.5 py-0.5 rounded">
                    {grp.code}
                  </span>
                  <h3 className="text-sm font-serif font-bold text-[#0A0A0A] mt-1">
                    {grp.name}
                  </h3>
                </div>

                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                  grp.averageAttendanceRate >= 85
                    ? 'bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]'
                    : 'bg-[#FEF9C3] text-[#854D0E] border border-[#FEF08A]'
                }`}>
                  {grp.averageAttendanceRate}% perseverancia
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-[#404040] my-3">
                <p className="flex items-center gap-1.5 text-[#6B6B6B] truncate">
                  <MapPin className="w-3.5 h-3.5 text-[#8A8A8A] shrink-0" />
                  <span>{grp.address}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#8A8A8A] shrink-0" />
                  <span>Líder Anfitrión: <strong className="text-[#0A0A0A]">{grp.leaderName}</strong></span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#8A8A8A] shrink-0" />
                  <span>Reunión: {grp.meetingDay} a las {grp.meetingTime} hrs</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 p-2 bg-[#FAFAFA] border border-[#E8E8E8] rounded-lg text-center text-xs mb-3">
                <div>
                  <span className="text-[10px] text-[#6B6B6B]">Hermanos</span>
                  <p className="font-serif font-bold text-[#0A0A0A]">{grp.memberCount}</p>
                </div>
                <div>
                  <span className="text-[10px] text-[#6B6B6B]">En Cuidado</span>
                  <p className={`font-serif font-bold ${grp.criticalMembersCount > 0 ? 'text-[#DC2626]' : 'text-[#16A34A]'}`}>
                    {grp.criticalMembersCount}
                  </p>
                </div>
              </div>

              {onTakeAttendanceForGroup && (
                <button
                  onClick={() => onTakeAttendanceForGroup(grp.id)}
                  className="w-full py-2 bg-[#EA580C] hover:bg-[#C2410C] text-[#FAFAFA] rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Registrar Asistencia en este Grupo</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
