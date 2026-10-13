import React, { useState } from 'react';
import { 
  BookOpen, 
  ArrowRight, 
  Users, 
  Sparkles,
  Award
} from 'lucide-react';
import { Person, DiscipleshipPhase } from '../types';
import { DISCIPLESHIP_PHASES_META } from '../data/mockData';

interface DiscipleshipFunnelProps {
  people: Person[];
  onPromotePerson: (personId: string, nextPhase: DiscipleshipPhase) => void;
  onOpenPersonDetail: (person: Person) => void;
}

export const DiscipleshipFunnel: React.FC<DiscipleshipFunnelProps> = ({
  people,
  onPromotePerson,
  onOpenPersonDetail
}) => {
  const [selectedPhaseKey, setSelectedPhaseKey] = useState<DiscipleshipPhase>('consolidacion');

  const phaseCounts = {
    contacto: people.filter(p => p.phase === 'contacto').length,
    consolidacion: people.filter(p => p.phase === 'consolidacion').length,
    formacion: people.filter(p => p.phase === 'formacion').length,
    liderazgo: people.filter(p => p.phase === 'liderazgo').length,
  };

  const total = people.length || 1;

  const conversionRates = {
    contacto: '100%',
    consolidacion: `${Math.round((phaseCounts.consolidacion / (phaseCounts.contacto + phaseCounts.consolidacion || 1)) * 100)}%`,
    formacion: `${Math.round((phaseCounts.formacion / (phaseCounts.consolidacion + phaseCounts.formacion || 1)) * 100)}%`,
    liderazgo: `${Math.round((phaseCounts.liderazgo / (phaseCounts.formacion + phaseCounts.liderazgo || 1)) * 100)}%`,
  };

  const membersInSelectedPhase = people.filter(p => p.phase === selectedPhaseKey);
  const activeMeta = DISCIPLESHIP_PHASES_META.find(m => m.key === selectedPhaseKey)!;

  const getNextPhase = (current: DiscipleshipPhase): DiscipleshipPhase | null => {
    if (current === 'contacto') return 'consolidacion';
    if (current === 'consolidacion') return 'formacion';
    if (current === 'formacion') return 'liderazgo';
    return null;
  };

  return (
    <div className="bg-white border border-[#E8DFD7] rounded-xl shadow-xs overflow-hidden">
      <div className="p-4.5 border-b border-[#E8DFD7] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-serif font-bold text-[#2D1F17] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#8C5D36]" />
              Crecimiento Espiritual & Fases de Discipulado
            </h2>
            <span className="text-xs bg-[#FAF7F2] text-[#7D6B5E] border border-[#E8DFD7] font-medium px-2 py-0.5 rounded">
              Camino de Fe
            </span>
          </div>
          <p className="text-xs text-[#7D6B5E] mt-0.5">
            Madurez espiritual, formación doctrinal y preparación ministerial de los discípulos.
          </p>
        </div>

        <div className="text-xs text-[#7D6B5E] font-medium flex items-center gap-1.5">
          <Award className="w-4 h-4 text-[#8C5D36]" />
          <span>Meta: <strong>Sembrar obreros fieles para la mies</strong></span>
        </div>
      </div>

      <div className="p-4.5 bg-[#FAF7F2] border-b border-[#E8DFD7]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {DISCIPLESHIP_PHASES_META.map((phase, idx) => {
            const count = phaseCounts[phase.key];
            const percent = Math.round((count / total) * 100);
            const isSelected = selectedPhaseKey === phase.key;

            return (
              <div
                key={phase.key}
                onClick={() => setSelectedPhaseKey(phase.key)}
                className={`relative p-3.5 rounded-xl border transition-all cursor-pointer group ${
                  isSelected
                    ? 'bg-white border-[#8C5D36] shadow-xs ring-1 ring-[#8C5D36]/20'
                    : 'bg-white/80 border-[#E8DFD7] hover:border-[#B8A18E]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#998576]">
                    Etapa 0{idx + 1}
                  </span>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                    isSelected ? 'bg-[#3B281C] text-[#FAF7F2]' : 'bg-[#FAF7F2] text-[#7D6B5E] border border-[#E8DFD7]'
                  }`}>
                    {percent}% del total
                  </span>
                </div>

                <h3 className="text-xs font-serif font-bold text-[#2D1F17] leading-tight">
                  {phase.name}
                </h3>
                <p className="text-[10px] text-[#7D6B5E] mt-0.5">{phase.subtitle}</p>

                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-2xl font-serif font-bold text-[#2D1F17]">{count}</span>
                  <span className="text-[10px] text-[#8C7A6D]">hermanos</span>
                </div>

                <div className="w-full bg-[#FAF7F2] border border-[#E8DFD7] h-1.5 rounded-full overflow-hidden mt-2">
                  <div 
                    className="bg-[#6B4E3D] h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(percent, 10)}%` }}
                  />
                </div>

                <div className="mt-2.5 flex items-center justify-between text-[10px] text-[#7D6B5E] pt-2 border-t border-[#F2ECE4]">
                  <span>Progresión:</span>
                  <span className="font-semibold text-[#2D1F17]">{conversionRates[phase.key]}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-4.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-[#F2ECE4]">
          <div>
            <h4 className="text-xs font-serif font-bold text-[#2D1F17] flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#8C5D36]" />
              Discípulos en etapa: <span className="text-[#8C5D36]">{activeMeta.name}</span>
            </h4>
            <p className="text-[11px] text-[#7D6B5E] mt-0.5">
              {activeMeta.description} • Tiempo estimado: {activeMeta.targetDurationWeeks} semanas ({activeMeta.requiredSessions} lecciones bíblicas).
            </p>
          </div>

          <span className="text-xs font-medium text-[#7D6B5E]">
            {membersInSelectedPhase.length} discípulos registrados
          </span>
        </div>

        {membersInSelectedPhase.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#998576] italic">
            No hay discípulos en esta etapa formativa en este momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {membersInSelectedPhase.map((member) => {
              const nextPhase = getNextPhase(member.phase);

              return (
                <div
                  key={member.id}
                  className="p-3 bg-[#FAF7F2] border border-[#E8DFD7] rounded-xl hover:border-[#B8A18E] transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#3B281C] text-[#FAF7F2] font-semibold text-xs flex items-center justify-center">
                        {member.fullName.charAt(0)}
                      </div>
                      <div>
                        <button
                          onClick={() => onOpenPersonDetail(member)}
                          className="text-xs font-medium text-[#2D1F17] hover:text-[#8C5D36] text-left block"
                        >
                          {member.fullName}
                        </button>
                        <p className="text-[10px] text-[#8C7A6D]">{member.groupName}</p>
                      </div>
                    </div>

                    <span className={`w-2 h-2 rounded-full ${
                      member.status === 'red' ? 'bg-[#9E382A]' :
                      member.status === 'yellow' ? 'bg-[#B38646]' : 'bg-[#486341]'
                    }`} title={`Estado: ${member.status}`} />
                  </div>

                  <div className="text-[11px] text-[#6B5A4E] space-y-1 my-2">
                    <div className="flex items-center justify-between">
                      <span>Mentor Espiritual:</span>
                      <span className="font-medium text-[#2D1F17]">{member.mentorName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Último contacto pastoral:</span>
                      <span>{member.daysSinceLastContact} días atrás</span>
                    </div>
                  </div>

                  {nextPhase ? (
                    <button
                      onClick={() => onPromotePerson(member.id, nextPhase)}
                      className="w-full mt-2 py-1.5 px-2 bg-white hover:bg-[#FAF7F2] text-[#3B281C] border border-[#D9CCC1] rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#8C5D36]" />
                      <span>Promover a la Siguiente Etapa</span>
                      <ArrowRight className="w-3 h-3 ml-0.5" />
                    </button>
                  ) : (
                    <div className="mt-2 py-1 px-2 bg-[#EBF2E8] text-[#3D5636] border border-[#D4E4CF] rounded-lg text-xs font-medium text-center flex items-center justify-center gap-1">
                      <Award className="w-3.5 h-3.5" />
                      <span>Liderazgo & Envío Alcanzado</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
