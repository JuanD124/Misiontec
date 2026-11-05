import React from 'react';
import { 
  X, 
  Phone, 
  AlertCircle,
  Tag,
  BookOpen
} from 'lucide-react';
import { Person, DiscipleshipPhase } from '../../types';

interface PersonDetailModalProps {
  person: Person | null;
  onClose: () => void;
  onPromotePhase?: (personId: string, nextPhase: DiscipleshipPhase) => void;
}

export const PersonDetailModal: React.FC<PersonDetailModalProps> = ({
  person,
  onClose,
  onPromotePhase
}) => {
  if (!person) return null;

  const getNextPhase = (current: DiscipleshipPhase): DiscipleshipPhase | null => {
    if (current === 'contacto') return 'consolidacion';
    if (current === 'consolidacion') return 'formacion';
    if (current === 'formacion') return 'liderazgo';
    return null;
  };

  const nextPhase = getNextPhase(person.phase);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-[#E2E8F0] rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-[#E2E8F0] bg-[#F6F8FB] flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-serif font-bold text-white shadow-xs ${
              person.status === 'red' ? 'bg-[#DC2626]' :
              person.status === 'yellow' ? 'bg-[#D97706]' : 'bg-[#16A34A]'
            }`}>
              {person.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-serif font-bold text-[#0F172A]">
                  {person.fullName}
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-[#64748B] border border-[#E2E8F0]">
                  {person.code}
                </span>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                  person.status === 'red' ? 'bg-[#FEE2E2] text-[#B91C1C] border border-[#FECACA]' :
                  person.status === 'yellow' ? 'bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]' :
                  'bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]'
                }`}>
                  {person.status === 'red' ? 'Atención Urgente' : person.status === 'yellow' ? 'Seguimiento' : 'En Comunión'}
                </span>
              </div>
              <p className="text-xs text-[#64748B] mt-0.5">
                DNI: {person.dni} • {person.age} años ({person.gender === 'M' ? 'Varón' : 'Mujer'}) • {person.groupName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#7B8BA3] hover:text-[#0F172A] rounded-lg hover:bg-[#EEF2F7]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 text-xs custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-[#F6F8FB] rounded-xl border border-[#E2E8F0]">
              <span className="text-[10px] text-[#64748B] font-medium block">Etapa de Formación</span>
              <p className="text-xs font-serif font-bold text-[#4F46E5] capitalize mt-0.5">{person.phase}</p>
              <p className="text-[10px] text-[#64748B] mt-1">Mentor: {person.mentorName}</p>
            </div>

            <div className="p-3 bg-[#F6F8FB] rounded-xl border border-[#E2E8F0]">
              <span className="text-[10px] text-[#64748B] font-medium block">Ausencias Consecutivas</span>
              <p className={`text-base font-serif font-bold mt-0.5 ${person.consecutiveAbsences > 2 ? 'text-[#DC2626]' : 'text-[#0F172A]'}`}>
                {person.consecutiveAbsences}
              </p>
              <p className="text-[10px] text-[#64748B] mt-0.5">Última: {person.lastAttendanceDate}</p>
            </div>
          </div>

          <div className="p-4 bg-[#F6F8FB] rounded-xl border border-[#E2E8F0] space-y-2">
            <h4 className="font-serif font-bold text-[#0F172A] flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#4F46E5]" />
              Datos de Localización y Contacto Fraterno
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#334155]">
              <p><strong>Teléfono:</strong> {person.phone}</p>
              <p><strong>Email:</strong> {person.email}</p>
              <p><strong>Distrito:</strong> {person.district}</p>
              <p><strong>Dirección:</strong> {person.address}</p>
            </div>
            {person.tags && person.tags.length > 0 && (
              <div className="flex items-center gap-1.5 pt-2 flex-wrap">
                <Tag className="w-3 h-3 text-[#7B8BA3]" />
                {person.tags.map((t, idx) => (
                  <span key={idx} className="text-[10px] bg-white text-[#64748B] border border-[#E2E8F0] px-2 py-0.5 rounded">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {person.criticalNotes && (
            <div className="p-3.5 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-[#B91C1C]">
              <p className="font-serif font-bold flex items-center gap-1.5 text-xs mb-1">
                <AlertCircle className="w-4 h-4 text-[#DC2626]" />
                Observación / Petición de Oración
              </p>
              <p className="text-[11px] leading-relaxed">{person.criticalNotes}</p>
            </div>
          )}

          <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between gap-3">
            {nextPhase && onPromotePhase ? (
              <button
                onClick={() => {
                  onPromotePhase(person.id, nextPhase);
                  onClose();
                }}
                className="px-3.5 py-2 bg-[#F6F8FB] hover:bg-[#EEF2F7] text-[#4F46E5] border border-[#D8DFEA] rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-[#4F46E5]" />
                <span>Promover a {nextPhase}</span>
              </button>
            ) : nextPhase ? null : (
              <span className="text-[11px] text-[#64748B] font-medium">Liderazgo & Envío alcanzado</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
