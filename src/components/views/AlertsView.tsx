import React, { useState } from 'react';
import { 
  HeartHandshake, 
  Phone, 
  Clock, 
  AlertOctagon
} from 'lucide-react';
import { Person, FollowUpRecord, TrafficLightStatus } from '../../types';
import { TrafficLightTable } from '../TrafficLightTable';

interface AlertsViewProps {
  people: Person[];
  followUps: FollowUpRecord[];
  onOpenFollowUpModal: (personId: string) => void;
  onOpenPersonDetail: (person: Person) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  people,
  followUps,
  onOpenFollowUpModal,
  onOpenPersonDetail
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | TrafficLightStatus>('red');

  const criticalPeople = people.filter(p => p.status === 'red');
  const warningPeople = people.filter(p => p.status === 'yellow');

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4.5 rounded-xl border border-[#E8DFD7] shadow-xs">
        <div>
          <h1 className="text-lg font-serif font-bold text-[#2D1F17] flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-[#9E382A]" />
            Cuidado Fraterno & Atención de Alertas Pastorales
          </h1>
          <p className="text-xs text-[#7D6B5E] mt-0.5">
            Acompañamiento prioritario para hermanos con ausencias consecutivas o retraso en mentoría espiritual.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-[#8C3527] bg-[#FBEBE9] px-3 py-1 rounded-full flex items-center gap-1.5 border border-[#F2D0CC]">
            <span className="w-2 h-2 rounded-full bg-[#9E382A]" />
            {criticalPeople.length} Hermanos en Atención Prioritaria
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-[#FDF7F6] border border-[#F2D0CC] rounded-xl">
          <h3 className="text-xs font-serif font-bold text-[#8C3527] flex items-center gap-2 mb-1.5">
            <HeartHandshake className="w-4 h-4 text-[#9E382A]" />
            Atención Urgente (Semáforo Rojo)
          </h3>
          <p className="text-[11px] text-[#8C3527]/90 mb-3">
            Hermanos con ausencias prolongadas a la célula. Requieren visita fraterna en el hogar u oración personal.
          </p>

          <div className="space-y-2">
            {criticalPeople.map(p => (
              <div key={p.id} className="p-2.5 bg-white rounded-lg border border-[#F2D0CC] flex items-center justify-between text-xs">
                <div>
                  <button
                    onClick={() => onOpenPersonDetail(p)}
                    className="font-medium text-[#2D1F17] hover:text-[#8C3527] text-left"
                  >
                    {p.fullName}
                  </button>
                  <p className="text-[10px] text-[#8C3527] font-medium">{p.consecutiveAbsences} ausencias • {p.groupName}</p>
                </div>

                <button
                  onClick={() => onOpenFollowUpModal(p.id)}
                  className="px-2.5 py-1 bg-[#9E382A] hover:bg-[#852C20] text-white rounded text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <HeartHandshake className="w-3.5 h-3.5" />
                  <span>Visitar</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-[#FAF7F0] border border-[#EBDCC2] rounded-xl">
          <h3 className="text-xs font-serif font-bold text-[#946A1B] flex items-center gap-2 mb-1.5">
            <Clock className="w-4 h-4 text-[#B38646]" />
            Cuidado Preventivo (Semáforo Amarillo)
          </h3>
          <p className="text-[11px] text-[#946A1B]/90 mb-3">
            Hermanos con faltas recientes o más de 15 días sin llamada o contacto directo de su mentor.
          </p>

          <div className="space-y-2">
            {warningPeople.map(p => (
              <div key={p.id} className="p-2.5 bg-white rounded-lg border border-[#EBDCC2] flex items-center justify-between text-xs">
                <div>
                  <button
                    onClick={() => onOpenPersonDetail(p)}
                    className="font-medium text-[#2D1F17] hover:text-[#946A1B] text-left"
                  >
                    {p.fullName}
                  </button>
                  <p className="text-[10px] text-[#946A1B] font-medium">{p.daysSinceLastContact}d sin contacto • {p.groupName}</p>
                </div>

                <button
                  onClick={() => onOpenFollowUpModal(p.id)}
                  className="px-2.5 py-1 bg-[#B38646] hover:bg-[#9E7337] text-white rounded text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Llamar</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <TrafficLightTable
        people={people}
        onOpenFollowUpModal={onOpenFollowUpModal}
        onOpenPersonDetailModal={onOpenPersonDetail}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />
    </div>
  );
};
