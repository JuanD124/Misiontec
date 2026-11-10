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
  onPromotePerson?: (personId: string, nextPhase: DiscipleshipPhase) => void;
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
    <div className="bg-white border border-[#E8E8E8] rounded-xl shadow-xs overflow-hidden">
      <div className="p-4.5 border-b border-[#E8E8E8] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-serif font-bold text-[#0A0A0A] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#EA580C]" />
              Adiestramiento & Fases de Formación
            </h2>
            <span className="text-xs bg-[#FAFAFA] text-[#6B6B6B] border border-[#E8E8E8] font-medium px-2 py-0.5 rounded">
              Camino de Fe
            </span>
          </div>
          <p className="text-xs text-[#6B6B6B] mt-0.5">
            Madurez espiritual, formación doctrinal y preparación ministerial de los discípulos.
          </p>
        </div>

        <div className="text-xs text-[#6B6B6B] font-medium flex items-center gap-1.5">
          <Award className="w-4 h-4 text-[#EA580C]" />
          <span>Meta: <strong>Sembrar obreros fieles para la mies</strong></span>
        </div>
      </div>

      <div className="p-4.5 bg-[#FAFAFA] border-b border-[#E8E8E8]">
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
                    ? 'bg-white border-[#EA580C] shadow-xs ring-1 ring-[#EA580C]/20'
                    : 'bg-white/80 border-[#E8E8E8] hover:border-[#A3A3A3]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8A8A8A]">
                    Etapa 0{idx + 1}
                  </span>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                    isSelected ? 'bg-[#EA580C] text-[#FAFAFA]' : 'bg-[#FAFAFA] text-[#6B6B6B] border border-[#E8E8E8]'
                  }`}>
                    {percent}% del total
                  </span>
                </div>

                <h3 className="text-xs font-serif font-bold text-[#0A0A0A] leading-tight">
                  {phase.name}
                </h3>
                <p className="text-[10px] text-[#6B6B6B] mt-0.5">{phase.subtitle}</p>

                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-2xl font-serif font-bold text-[#0A0A0A]">{count}</span>
                  <span className="text-[10px] text-[#6B6B6B]">discípulos</span>
                </div>

                <div className="w-full bg-[#FAFAFA] border border-[#E8E8E8] h-1.5 rounded-full overflow-hidden mt-2">
                  <div 
                    className="bg-[#C2410C] h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(percent, 10)}%` }}
                  />
                </div>

                <div className="mt-2.5 flex items-center justify-between text-[10px] text-[#6B6B6B] pt-2 border-t border-[#F2F2F2]">
                  <span>Progresión:</span>
                  <span className="font-semibold text-[#0A0A0A]">{conversionRates[phase.key]}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-4.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-[#F2F2F2]">
          <div>
            <h4 className="text-xs font-serif font-bold text-[#0A0A0A] flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#EA580C]" />
              Discípulos en etapa: <span className="text-[#EA580C]">{activeMeta.name}</span>
            </h4>
            <p className="text-[11px] text-[#6B6B6B] mt-0.5">
              {activeMeta.description} • Tiempo estimado: {activeMeta.targetDurationWeeks} semanas ({activeMeta.requiredSessions} lecciones bíblicas).
            </p>
          </div>

          <span className="text-xs font-medium text-[#6B6B6B]">
            {membersInSelectedPhase.length} discípulos registrados
          </span>
        </div>

        {membersInSelectedPhase.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#8A8A8A] italic">
            No hay discípulos en esta etapa formativa en este momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {membersInSelectedPhase.map((member) => {
              const nextPhase = getNextPhase(member.phase);

              return (
                <div
                  key={member.id}
                  className="p-3 bg-[#FAFAFA] border border-[#E8E8E8] rounded-xl hover:border-[#A3A3A3] transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#EA580C] text-[#FAFAFA] font-semibold text-xs flex items-center justify-center">
                        {member.fullName.charAt(0)}
                      </div>
                      <div>
                        <button
                          onClick={() => onOpenPersonDetail(member)}
                          className="text-xs font-medium text-[#0A0A0A] hover:text-[#EA580C] text-left block"
                        >
                          {member.fullName}
                        </button>
                        <p className="text-[10px] text-[#6B6B6B]">{member.groupName}</p>
                      </div>
                    </div>

                    <span className={`w-2 h-2 rounded-full ${
                      member.status === 'red' ? 'bg-[#DC2626]' :
                      member.status === 'yellow' ? 'bg-[#CA8A04]' : 'bg-[#16A34A]'
                    }`} title={`Estado: ${member.status}`} />
                  </div>

                  <div className="text-[11px] text-[#525252] space-y-1 my-2">
                    <div className="flex items-center justify-between">
                      <span>Mentor Espiritual:</span>
                      <span className="font-medium text-[#0A0A0A]">{member.mentorName}</span>
                    </div>
                  </div>

                  {nextPhase && onPromotePerson ? (
                    <button
                      onClick={() => onPromotePerson(member.id, nextPhase)}
                      className="w-full mt-2 py-1.5 px-2 bg-white hover:bg-[#FAFAFA] text-[#EA580C] border border-[#E0E0E0] rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#EA580C]" />
                      <span>Promover a la Siguiente Etapa</span>
                      <ArrowRight className="w-3 h-3 ml-0.5" />
                    </button>
                  ) : nextPhase ? null : (
                    <div className="mt-2 py-1 px-2 bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0] rounded-lg text-xs font-medium text-center flex items-center justify-center gap-1">
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
