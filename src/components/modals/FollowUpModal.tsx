import React, { useState, useEffect } from 'react';
import { 
  X, 
  HeartHandshake, 
  Phone, 
  Home, 
  Users, 
  MessageSquare, 
  FileCheck
} from 'lucide-react';
import { Person, TrafficLightStatus, FollowUpRecord } from '../../types';

interface FollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  people: Person[];
  preSelectedPersonId?: string;
  onSaveFollowUp: (followUp: Omit<FollowUpRecord, 'id'>, resultingStatus: TrafficLightStatus) => void;
}

export const FollowUpModal: React.FC<FollowUpModalProps> = ({
  isOpen,
  onClose,
  people,
  preSelectedPersonId,
  onSaveFollowUp
}) => {
  const [personId, setPersonId] = useState<string>(preSelectedPersonId || people[0]?.id || '');
  const [channel, setChannel] = useState<'llamada' | 'visita' | 'reunion_pastoral' | 'mensaje_chat'>('llamada');
  const [pastoralStatus, setPastoralStatus] = useState<'excelente' | 'estable' | 'desanimado' | 'en_crisis' | 'necesita_oracion'>('estable');
  const [notes, setNotes] = useState('');
  const [commitments, setCommitments] = useState('');
  const [nextContactDate, setNextContactDate] = useState('2026-09-22');
  const [resultingStatus, setResultingStatus] = useState<TrafficLightStatus>('yellow');

  useEffect(() => {
    if (preSelectedPersonId) {
      setPersonId(preSelectedPersonId);
      const target = people.find(p => p.id === preSelectedPersonId);
      if (target) {
        setResultingStatus(target.status === 'red' ? 'yellow' : target.status);
      }
    }
  }, [preSelectedPersonId, people]);

  if (!isOpen) return null;

  const currentPerson = people.find(p => p.id === personId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPerson) return;

    onSaveFollowUp({
      personId: currentPerson.id,
      personName: currentPerson.fullName,
      date: new Date().toISOString().split('T')[0],
      channel,
      pastoralStatus,
      notes: notes || 'Acompañamiento y oración fraterna realizada.',
      commitments: commitments || 'Asistir a la próxima reunión de célula en hogar.',
      nextContactDate,
      registeredByName: 'Pr. Carlos Mendoza',
      registeredByRole: 'Pastor de Zona',
      resultingStatus
    }, resultingStatus);

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D1F17]/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-[#E8DFD7] rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#E8DFD7] flex items-center justify-between bg-[#FAF7F2]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8DFD7] text-[#3B281C] flex items-center justify-center">
              <HeartHandshake className="w-5 h-5 text-[#8C5D36]" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-[#2D1F17]">
                Registrar Acompañamiento & Cuidado Pastoral
              </h2>
              <p className="text-xs text-[#7D6B5E]">
                Bitácora de visita, conversación fraterna, oración y compromisos.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#998576] hover:text-[#2D1F17] rounded-lg hover:bg-[#F2ECE4] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs custom-scrollbar">
          {/* Member selector */}
          <div>
            <label className="block font-medium text-[#2D1F17] mb-1">
              Hermano en Cuidado *
            </label>
            <select
              value={personId}
              onChange={(e) => {
                setPersonId(e.target.value);
                const p = people.find(item => item.id === e.target.value);
                if (p && p.status === 'red') setResultingStatus('yellow');
              }}
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E0D4C7] rounded-lg focus:outline-none focus:border-[#8C5D36] text-[#2D1F17] font-medium"
            >
              {people.map(p => (
                <option key={p.id} value={p.id}>
                  {p.fullName} — {p.groupName} ({p.status === 'red' ? '🔴 Atención Urgente' : p.status === 'yellow' ? '🟡 Seguimiento' : '🟢 En Comunión'})
                </option>
              ))}
            </select>

            {currentPerson && (
              <div className="mt-2 p-2.5 rounded-lg bg-[#FAF7F2] border border-[#E8DFD7] text-[#5C4535] flex items-center justify-between text-[11px]">
                <span>Inasistencias: <strong>{currentPerson.consecutiveAbsences}</strong></span>
                <span>Sin contacto: <strong>{currentPerson.daysSinceLastContact} días</strong></span>
                <span>Mentor: <strong>{currentPerson.mentorName}</strong></span>
              </div>
            )}
          </div>

          {/* Contact Channel Selector */}
          <div>
            <label className="block font-medium text-[#2D1F17] mb-1.5">
              Canal de Comunicación Empleado *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setChannel('llamada')}
                className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 cursor-pointer transition-all ${
                  channel === 'llamada'
                    ? 'bg-[#FAF7F2] border-[#8C5D36] ring-1 ring-[#8C5D36]/20 text-[#3B281C] font-semibold'
                    : 'bg-white border-[#E8DFD7] text-[#7D6B5E] hover:border-[#B8A18E]'
                }`}
              >
                <Phone className="w-4 h-4 text-[#8C5D36]" />
                <span>Llamada</span>
              </button>

              <button
                type="button"
                onClick={() => setChannel('visita')}
                className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 cursor-pointer transition-all ${
                  channel === 'visita'
                    ? 'bg-[#FAF7F2] border-[#8C5D36] ring-1 ring-[#8C5D36]/20 text-[#3B281C] font-semibold'
                    : 'bg-white border-[#E8DFD7] text-[#7D6B5E] hover:border-[#B8A18E]'
                }`}
              >
                <Home className="w-4 h-4 text-[#8C5D36]" />
                <span>Visita Hogar</span>
              </button>

              <button
                type="button"
                onClick={() => setChannel('reunion_pastoral')}
                className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 cursor-pointer transition-all ${
                  channel === 'reunion_pastoral'
                    ? 'bg-[#FAF7F2] border-[#8C5D36] ring-1 ring-[#8C5D36]/20 text-[#3B281C] font-semibold'
                    : 'bg-white border-[#E8DFD7] text-[#7D6B5E] hover:border-[#B8A18E]'
                }`}
              >
                <Users className="w-4 h-4 text-[#8C5D36]" />
                <span>Encuentro</span>
              </button>

              <button
                type="button"
                onClick={() => setChannel('mensaje_chat')}
                className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 cursor-pointer transition-all ${
                  channel === 'mensaje_chat'
                    ? 'bg-[#FAF7F2] border-[#8C5D36] ring-1 ring-[#8C5D36]/20 text-[#3B281C] font-semibold'
                    : 'bg-white border-[#E8DFD7] text-[#7D6B5E] hover:border-[#B8A18E]'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-[#8C5D36]" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Spiritual state */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-[#2D1F17] mb-1">
                Estado Espiritual / Ánimo
              </label>
              <select
                value={pastoralStatus}
                onChange={(e) => setPastoralStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E0D4C7] rounded-lg focus:outline-none focus:border-[#8C5D36] text-[#2D1F17]"
              >
                <option value="excelente">Excelente / Conectado y firme</option>
                <option value="estable">Estable en la fe</option>
                <option value="desanimado">Desanimado o cansado</option>
                <option value="en_crisis">En dificultad personal/familiar</option>
                <option value="necesita_oracion">Petición de oración especial</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-[#2D1F17] mb-1">
                Próxima Visita / Contacto
              </label>
              <input
                type="date"
                value={nextContactDate}
                onChange={(e) => setNextContactDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E0D4C7] rounded-lg focus:outline-none focus:border-[#8C5D36] text-[#2D1F17]"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-medium text-[#2D1F17] mb-1">
              Observaciones & Conversación Pastoral *
            </label>
            <textarea
              rows={2}
              required
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describa el motivo de la inasistencia, situación de salud o necesidad espiritual expresada..."
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E0D4C7] rounded-lg focus:outline-none focus:border-[#8C5D36] text-[#2D1F17]"
            />
          </div>

          {/* Commitments */}
          <div>
            <label className="block font-medium text-[#2D1F17] mb-1">
              Compromiso Acordado
            </label>
            <input
              type="text"
              value={commitments}
              onChange={(e) => setCommitments(e.target.value)}
              placeholder="Ej. Asistir a la reunión de oración este jueves; su mentor lo recogerá"
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E0D4C7] rounded-lg focus:outline-none focus:border-[#8C5D36] text-[#2D1F17]"
            />
          </div>

          {/* Resulting Traffic Light State */}
          <div className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#E8DFD7]">
            <label className="block font-serif font-bold text-[#2D1F17] mb-2">
              Actualizar Estado Pastoral tras este contacto:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setResultingStatus('green')}
                className={`py-2 px-2 rounded-lg text-center text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  resultingStatus === 'green'
                    ? 'bg-[#486341] text-white shadow-xs'
                    : 'bg-white text-[#486341] border border-[#D4E4CF]'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-current" />
                <span>En Comunión (Verde)</span>
              </button>

              <button
                type="button"
                onClick={() => setResultingStatus('yellow')}
                className={`py-2 px-2 rounded-lg text-center text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  resultingStatus === 'yellow'
                    ? 'bg-[#B38646] text-white shadow-xs'
                    : 'bg-white text-[#946A1B] border border-[#EBDCC2]'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-current" />
                <span>Seguimiento (Amarillo)</span>
              </button>

              <button
                type="button"
                onClick={() => setResultingStatus('red')}
                className={`py-2 px-2 rounded-lg text-center text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  resultingStatus === 'red'
                    ? 'bg-[#9E382A] text-white shadow-xs'
                    : 'bg-white text-[#8C3527] border border-[#F2D0CC]'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-current" />
                <span>Urgente (Rojo)</span>
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2 border-t border-[#E8DFD7] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#7D6B5E] hover:text-[#2D1F17]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 bg-[#3B281C] hover:bg-[#2D1F17] text-[#FAF7F2] text-xs font-medium rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <FileCheck className="w-4 h-4" />
              <span>Guardar en Bitácora Fraterna</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
