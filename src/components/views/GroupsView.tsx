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
  onTakeAttendanceForGroup: (groupId: string) => void;
}

export const GroupsView: React.FC<GroupsViewProps> = ({
  groups,
  people,
  onTakeAttendanceForGroup
}) => {
  const [selectedGroup, setSelectedGroup] = useState<MissionaryGroup | null>(groups[0] || null);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4.5 rounded-xl border border-[#E8DFD7] shadow-xs">
        <div>
          <h1 className="text-lg font-serif font-bold text-[#2D1F17] flex items-center gap-2">
            <Church className="w-5 h-5 text-[#8C5D36]" />
            Células en Hogares & Red Fraterna Territorial
          </h1>
          <p className="text-xs text-[#7D6B5E] mt-0.5">
            Monitoreo territorial de hogares de oración, perseverancia y presencia pastoral por zonas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-[#FAF7F2] text-[#486341] border border-[#D4E4CF] font-medium px-3 py-1 rounded-full">
            {groups.length} Hogares Abiertos
          </span>
        </div>
      </div>

      <InteractiveMap
        groups={groups}
        onSelectGroup={(g) => setSelectedGroup(g)}
        onQuickAttendanceForGroup={(groupId) => onTakeAttendanceForGroup(groupId)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((grp) => {
          const isSelected = selectedGroup?.id === grp.id;

          return (
            <div
              key={grp.id}
              className={`p-4.5 bg-white rounded-xl border transition-all shadow-xs ${
                isSelected
                  ? 'border-[#8C5D36] ring-1 ring-[#8C5D36]/20 shadow-xs'
                  : 'border-[#E8DFD7] hover:border-[#B8A18E]'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="text-[10px] font-mono font-medium text-[#8C5D36] bg-[#FAF7F2] border border-[#E8DFD7] px-1.5 py-0.5 rounded">
                    {grp.code}
                  </span>
                  <h3 className="text-sm font-serif font-bold text-[#2D1F17] mt-1">
                    {grp.name}
                  </h3>
                </div>

                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                  grp.averageAttendanceRate >= 85
                    ? 'bg-[#EBF2E8] text-[#3D5636] border border-[#D4E4CF]'
                    : 'bg-[#FAF2E1] text-[#946A1B] border border-[#EBDCC2]'
                }`}>
                  {grp.averageAttendanceRate}% perseverancia
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-[#5C4535] my-3">
                <p className="flex items-center gap-1.5 text-[#7D6B5E] truncate">
                  <MapPin className="w-3.5 h-3.5 text-[#998576] shrink-0" />
                  <span>{grp.address}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#998576] shrink-0" />
                  <span>Líder Anfitrión: <strong className="text-[#2D1F17]">{grp.leaderName}</strong></span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#998576] shrink-0" />
                  <span>Reunión: {grp.meetingDay} a las {grp.meetingTime} hrs</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 p-2 bg-[#FAF7F2] border border-[#E8DFD7] rounded-lg text-center text-xs mb-3">
                <div>
                  <span className="text-[10px] text-[#7D6B5E]">Hermanos</span>
                  <p className="font-serif font-bold text-[#2D1F17]">{grp.memberCount}</p>
                </div>
                <div>
                  <span className="text-[10px] text-[#7D6B5E]">En Cuidado</span>
                  <p className={`font-serif font-bold ${grp.criticalMembersCount > 0 ? 'text-[#9E382A]' : 'text-[#486341]'}`}>
                    {grp.criticalMembersCount}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onTakeAttendanceForGroup(grp.id)}
                className="w-full py-2 bg-[#3B281C] hover:bg-[#2D1F17] text-[#FAF7F2] rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Registrar Asistencia en este Hogar</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
