import React, { useState } from 'react';
import { 
  HeartHandshake, 
  Clock, 
  AlertOctagon
} from 'lucide-react';
import { Person, TrafficLightStatus } from '../../types';
import { TrafficLightTable } from '../TrafficLightTable';

interface AlertsViewProps {
  people: Person[];
  onOpenPersonDetail: (person: Person) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  people,
  onOpenPersonDetail
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | TrafficLightStatus>('red');

  const criticalPeople = people.filter(p => p.status === 'red');
  const warningPeople = people.filter(p => p.status === 'yellow');

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4.5 rounded-xl border border-[#E8E8E8] shadow-xs">
        <div>
          <h1 className="text-lg font-serif font-bold text-[#0A0A0A] flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-[#DC2626]" />
            Cuidado Fraterno & Atención de Alertas Pastorales
          </h1>
          <p className="text-xs text-[#6B6B6B] mt-0.5">
            Acompañamiento prioritario para discípulos con ausencias consecutivas a su grupo.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-[#B91C1C] bg-[#FEE2E2] px-3 py-1 rounded-full flex items-center gap-1.5 border border-[#FECACA]">
            <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
            {criticalPeople.length} Discípulos en Atención Prioritaria
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-xl">
          <h3 className="text-xs font-serif font-bold text-[#B91C1C] flex items-center gap-2 mb-1.5">
            <HeartHandshake className="w-4 h-4 text-[#DC2626]" />
            Atención Urgente (Semáforo Rojo)
          </h3>
          <p className="text-[11px] text-[#B91C1C]/90 mb-3">
            Discípulos con ausencias prolongadas a las reuniones del grupo. Requieren visita fraterna en el hogar u oración personal.
          </p>

          <div className="space-y-2">
            {criticalPeople.map(p => (
              <div key={p.id} className="p-2.5 bg-white rounded-lg border border-[#FECACA] flex items-center justify-between text-xs">
                <div>
                  <button
                    onClick={() => onOpenPersonDetail(p)}
                    className="font-medium text-[#0A0A0A] hover:text-[#B91C1C] text-left"
                  >
                    {p.fullName}
                  </button>
                  <p className="text-[10px] text-[#B91C1C] font-medium">{p.consecutiveAbsences} ausencias • {p.groupName}</p>
                </div>

                <button
                  onClick={() => onOpenPersonDetail(p)}
                  className="px-2.5 py-1 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded text-[11px] font-medium transition-colors cursor-pointer"
                >
                  Ver ficha
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-[#FAFAFA] border border-[#FEF08A] rounded-xl">
          <h3 className="text-xs font-serif font-bold text-[#854D0E] flex items-center gap-2 mb-1.5">
            <Clock className="w-4 h-4 text-[#CA8A04]" />
            Cuidado Preventivo (Semáforo Amarillo)
          </h3>
          <p className="text-[11px] text-[#854D0E]/90 mb-3">
            Discípulos con dos inasistencias consecutivas a su grupo.
          </p>

          <div className="space-y-2">
            {warningPeople.map(p => (
              <div key={p.id} className="p-2.5 bg-white rounded-lg border border-[#FEF08A] flex items-center justify-between text-xs">
                <div>
                  <button
                    onClick={() => onOpenPersonDetail(p)}
                    className="font-medium text-[#0A0A0A] hover:text-[#854D0E] text-left"
                  >
                    {p.fullName}
                  </button>
                  <p className="text-[10px] text-[#854D0E] font-medium">{p.consecutiveAbsences} ausencias • {p.groupName}</p>
                </div>

                <button
                  onClick={() => onOpenPersonDetail(p)}
                  className="px-2.5 py-1 bg-[#CA8A04] hover:bg-[#854D0E] text-white rounded text-[11px] font-medium transition-colors cursor-pointer"
                >
                  Ver ficha
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <TrafficLightTable
        people={people}
        onOpenPersonDetailModal={onOpenPersonDetail}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />
    </div>
  );
};
