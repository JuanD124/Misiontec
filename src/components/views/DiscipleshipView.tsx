import React from 'react';
import { 
  BookOpen, 
  ArrowRight
} from 'lucide-react';
import { Person, DiscipleshipPhase } from '../../types';
import { DISCIPLESHIP_PHASES_META } from '../../data/mockData';
import { DiscipleshipFunnel } from '../DiscipleshipFunnel';

interface DiscipleshipViewProps {
  people: Person[];
  onPromotePerson?: (personId: string, nextPhase: DiscipleshipPhase) => void;
  onOpenPersonDetail: (person: Person) => void;
}

export const DiscipleshipView: React.FC<DiscipleshipViewProps> = ({
  people,
  onPromotePerson,
  onOpenPersonDetail
}) => {
  const getNextPhase = (current: DiscipleshipPhase): DiscipleshipPhase | null => {
    if (current === 'contacto') return 'consolidacion';
    if (current === 'consolidacion') return 'formacion';
    if (current === 'formacion') return 'liderazgo';
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4.5 rounded-xl border border-[#E8E8E8] shadow-xs">
        <div>
          <h1 className="text-lg font-serif font-bold text-[#0A0A0A] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#EA580C]" />
            Adiestramiento & Etapas de Formación
          </h1>
          <p className="text-xs text-[#6B6B6B] mt-0.5">
            Acompañamiento del creyente desde su primera visita, consolidación en la fe, formación y liderazgo ministerial.
          </p>
        </div>
      </div>

      <DiscipleshipFunnel
        people={people}
        onPromotePerson={onPromotePerson}
        onOpenPersonDetail={onOpenPersonDetail}
      />

      <div className="mt-6">
        <h2 className="text-sm font-serif font-bold text-[#0A0A0A] mb-3 flex items-center gap-2">
          <span>Tablero de Progresión Espiritual</span>
          <span className="text-xs text-[#6B6B6B] font-normal">• 4 Etapas bíblicas</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {DISCIPLESHIP_PHASES_META.map((phase) => {
            const members = people.filter(p => p.phase === phase.key);

            return (
              <div 
                key={phase.key}
                className="bg-[#FAFAFA] border border-[#E8E8E8] rounded-xl p-3.5 flex flex-col max-h-[600px]"
              >
                <div className="pb-3 mb-3 border-b border-[#E8E8E8] flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-serif font-bold text-[#0A0A0A]">{phase.name}</h3>
                    <span className="text-[10px] text-[#6B6B6B]">{members.length} discípulos</span>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EA580C]" />
                </div>

                <div className="space-y-2 overflow-y-auto flex-1 pr-1 custom-scrollbar">
                  {members.map((m) => {
                    const next = getNextPhase(m.phase);

                    return (
                      <div
                        key={m.id}
                        className="p-3 bg-white rounded-lg border border-[#E8E8E8] shadow-xs hover:border-[#A3A3A3] transition-all text-xs"
                      >
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <button
                            onClick={() => onOpenPersonDetail(m)}
                            className="font-medium text-[#0A0A0A] hover:text-[#EA580C] text-left"
                          >
                            {m.fullName}
                          </button>
                          <span className={`w-2 h-2 rounded-full shrink-0 mt-1 ${
                            m.status === 'red' ? 'bg-[#DC2626]' :
                            m.status === 'yellow' ? 'bg-[#CA8A04]' : 'bg-[#16A34A]'
                          }`} />
                        </div>
                        <p className="text-[10px] text-[#6B6B6B] truncate">{m.groupName}</p>
                        <p className="text-[10px] text-[#6B6B6B] mt-1">Mentor: {m.mentorName}</p>

                        {next && onPromotePerson && (
                          <button
                            onClick={() => onPromotePerson(m.id, next)}
                            className="w-full mt-2 py-1 px-2 bg-[#FAFAFA] hover:bg-[#F2F2F2] text-[#EA580C] border border-[#E0E0E0] rounded text-[11px] font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          >
                            <span>Avanzar Etapa</span>
                            <ArrowRight className="w-3 h-3 text-[#EA580C]" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
