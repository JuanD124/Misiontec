import React from 'react';
import { 
  X, 
  Phone, 
  Clock, 
  AlertCircle,
  Tag,
  HeartHandshake,
  BookOpen
} from 'lucide-react';
import { Person, FollowUpRecord, DiscipleshipPhase } from '../../types';

interface PersonDetailModalProps {
  person: Person | null;
  onClose: () => void;
  followUps: FollowUpRecord[];
  onOpenFollowUpForThisPerson: (personId: string) => void;
  onPromotePhase: (personId: string, nextPhase: DiscipleshipPhase) => void;
}

export const PersonDetailModal: React.FC<PersonDetailModalProps> = ({
  person,
  onClose,
  followUps,
  onOpenFollowUpForThisPerson,
  onPromotePhase
}) => {
  if (!person) return null;

  const personFollowUps = followUps.filter(f => f.personId === person.id);

  const getNextPhase = (current: DiscipleshipPhase): DiscipleshipPhase | null => {
    if (current === 'contacto') return 'consolidacion';
    if (current === 'consolidacion') return 'formacion';
    if (current === 'formacion') return 'liderazgo';
    return null;
  };

  const nextPhase = getNextPhase(person.phase);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D1F17]/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-[#E8DFD7] rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#E8DFD7] bg-[#FAF7F2] flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-serif font-bold text-white shadow-xs ${
              person.status === 'red' ? 'bg-[#9E382A]' :
              person.status === 'yellow' ? 'bg-[#B38646]' : 'bg-[#486341]'
            }`}>
              {person.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-serif font-bold text-[#2D1F17]">
                  {person.fullName}
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-[#7D6B5E] border border-[#E8DFD7]">
                  {person.code}
                </span>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                  person.status === 'red' ? 'bg-[#FBEBE9] text-[#8C3527] border border-[#F2D0CC]' :
                  person.status === 'yellow' ? 'bg-[#FAF2E1] text-[#946A1B] border border-[#EBDCC2]' :
                  'bg-[#EBF2E8] text-[#3D5636] border border-[#D4E4CF]'
                }`}>
                  {person.status === 'red' ? 'Atención Urgente' : person.status === 'yellow' ? 'Seguimiento' : 'En Comunión'}
                </span>
              </div>
              <p className="text-xs text-[#7D6B5E] mt-0.5">
                DNI: {person.dni} • {person.age} años ({person.gender === 'M' ? 'Varón' : 'Mujer'}) • {person.groupName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#998576] hover:text-[#2D1F17] rounded-lg hover:bg-[#F2ECE4]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs custom-scrollbar">
          {/* Key Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E8DFD7]">
              <span className="text-[10px] text-[#7D6B5E] font-medium block">Etapa de Formación</span>
              <p className="text-xs font-serif font-bold text-[#8C5D36] capitalize mt-0.5">{person.phase}</p>
              <p className="text-[10px] text-[#7D6B5E] mt-1">Mentor: {person.mentorName}</p>
            </div>

            <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E8DFD7]">
              <span className="text-[10px] text-[#7D6B5E] font-medium block">Ausencias Consecutivas</span>
              <p className={`text-base font-serif font-bold mt-0.5 ${person.consecutiveAbsences > 2 ? 'text-[#9E382A]' : 'text-[#2D1F17]'}`}>
                {person.consecutiveAbsences}
              </p>
              <p className="text-[10px] text-[#7D6B5E] mt-0.5">Última: {person.lastAttendanceDate}</p>
            </div>

            <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E8DFD7]">
              <span className="text-[10px] text-[#7D6B5E] font-medium block">Días sin Contacto</span>
              <p className={`text-base font-serif font-bold mt-0.5 ${person.daysSinceLastContact > 15 ? 'text-[#B38646]' : 'text-[#2D1F17]'}`}>
                {person.daysSinceLastContact} días
              </p>
              <p className="text-[10px] text-[#7D6B5E] mt-0.5">Último: {person.lastFollowUpDate}</p>
            </div>
          </div>

          {/* Contact Details & Address */}
          <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#E8DFD7] space-y-2">
            <h4 className="font-serif font-bold text-[#2D1F17] flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#8C5D36]" />
              Datos de Localización y Contacto Fraterno
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#5C4535]">
              <p><strong>Teléfono:</strong> {person.phone}</p>
              <p><strong>Email:</strong> {person.email}</p>
              <p><strong>Distrito:</strong> {person.district}</p>
              <p><strong>Dirección:</strong> {person.address}</p>
            </div>
            {person.tags && person.tags.length > 0 && (
              <div className="flex items-center gap-1.5 pt-2 flex-wrap">
                <Tag className="w-3 h-3 text-[#998576]" />
                {person.tags.map((t, idx) => (
                  <span key={idx} className="text-[10px] bg-white text-[#7D6B5E] border border-[#E8DFD7] px-2 py-0.5 rounded">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Critical Notes if any */}
          {person.criticalNotes && (
            <div className="p-3.5 bg-[#FDF7F6] border border-[#F2D0CC] rounded-xl text-[#8C3527]">
              <p className="font-serif font-bold flex items-center gap-1.5 text-xs mb-1">
                <AlertCircle className="w-4 h-4 text-[#9E382A]" />
                Observación / Petición de Oración
              </p>
              <p className="text-[11px] leading-relaxed">{person.criticalNotes}</p>
            </div>
          )}

          {/* Follow-up Timeline */}
          <div>
            <h4 className="font-serif font-bold text-[#2D1F17] mb-2 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#8C5D36]" />
              Historial de Cuidado Pastoral ({personFollowUps.length})
            </h4>

            {personFollowUps.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-[#E8DFD7] text-center text-[#998576] italic">
                Aún no hay visitas o llamadas registradas para este hermano.
              </div>
            ) : (
              <div className="space-y-2">
                {personFollowUps.map(f => (
                  <div key={f.id} className="p-3.5 rounded-xl border border-[#E8DFD7] bg-white">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium capitalize text-[#2D1F17]">
                        {f.channel.replace('_', ' ')} • Estado: {f.pastoralStatus}
                      </span>
                      <span className="text-[10px] text-[#7D6B5E]">{f.date}</span>
                    </div>
                    <p className="text-[11px] text-[#5C4535]">{f.notes}</p>
                    <p className="text-[10px] text-[#8C5D36] font-medium mt-1">
                      Compromiso: {f.commitments}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-[#E8DFD7] flex items-center justify-between gap-3">
            {nextPhase ? (
              <button
                onClick={() => {
                  onPromotePhase(person.id, nextPhase);
                  onClose();
                }}
                className="px-3.5 py-2 bg-[#FAF7F2] hover:bg-[#F2ECE4] text-[#3B281C] border border-[#D9CCC1] rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-[#8C5D36]" />
                <span>Promover a {nextPhase}</span>
              </button>
            ) : (
              <span className="text-[11px] text-[#7D6B5E] font-medium">Liderazgo & Envío alcanzado</span>
            )}

            <button
              onClick={() => {
                onClose();
                onOpenFollowUpForThisPerson(person.id);
              }}
              className="px-4 py-2 bg-[#3B281C] hover:bg-[#2D1F17] text-[#FAF7F2] rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <HeartHandshake className="w-4 h-4 text-[#8C5D36]" />
              <span>Registrar Visita Pastoral</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
