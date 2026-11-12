import React from 'react';
import { CalendarDays, MapPin, ArrowRight } from 'lucide-react';
import { MissionEvent } from '../types';
import { NOMBRE_TIPO_EVENTO, MESES, hoyISO } from '../utils/formato';

interface UpcomingEventsCardProps {
  events: MissionEvent[];
  onVerEventos?: () => void;
}

export const UpcomingEventsCard: React.FC<UpcomingEventsCardProps> = ({ events, onVerEventos }) => {
  const hoy = hoyISO();
  const proximos = events
    .filter((e) => e.status === 'programado' && e.date.slice(0, 10) >= hoy)
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  const visibles = proximos.slice(0, 4);

  return (
    <section className="bg-white border border-[#E8E8E8] rounded-xl shadow-xs flex flex-col" aria-labelledby="tarjeta-eventos">
      <div className="p-4 sm:p-4.5 border-b border-[#E8E8E8] flex items-center justify-between gap-3">
        <h2 id="tarjeta-eventos" className="text-sm font-bold text-[#0A0A0A] flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-[#FFEDD5] flex items-center justify-center">
            <CalendarDays className="w-4 h-4 text-[#EA580C]" />
          </span>
          Próximos Encuentros
        </h2>
        <span className="text-xs font-medium bg-[#FAFAFA] text-[#6B6B6B] border border-[#E8E8E8] px-2.5 py-1 rounded-full">
          {proximos.length} {proximos.length === 1 ? 'programado' : 'programados'}
        </span>
      </div>

      {visibles.length === 0 ? (
        <p className="p-6 text-center text-xs text-[#8A8A8A] italic">No hay encuentros programados.</p>
      ) : (
        <ul className="divide-y divide-[#F2F2F2]">
          {visibles.map((e) => {
            const [, mes, dia] = e.date.slice(0, 10).split('-');
            return (
              <li key={e.id} className="p-3.5 sm:px-4.5 flex items-start gap-3">
                <div className="w-12 shrink-0 text-center rounded-lg bg-[#FAFAFA] border border-[#E8E8E8] py-1">
                  <p className="text-lg font-bold text-[#EA580C] leading-none">{Number(dia)}</p>
                  <p className="text-[10px] uppercase text-[#6B6B6B] mt-0.5">{MESES[Number(mes) - 1].slice(0, 3)}</p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#0A0A0A] truncate">{e.title}</p>
                  <p className="text-[11px] text-[#6B6B6B] mt-0.5">
                    {NOMBRE_TIPO_EVENTO[e.type] ?? e.type} • {e.time}
                  </p>
                  <p className="text-[11px] text-[#6B6B6B] mt-0.5 flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 shrink-0" />
                    {e.location}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {onVerEventos && (
        <button
          onClick={onVerEventos}
          className="mt-auto m-3 sm:m-4 px-3 py-2 text-xs font-medium text-[#EA580C] bg-[#FAFAFA] hover:bg-[#F2F2F2] border border-[#E0E0E0] rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
        >
          Ir a Encuentros & Misiones
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </section>
  );
};
