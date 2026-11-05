import React, { useState } from 'react';
import { 
  Calendar, 
  MapPin, 
  Users, 
  CheckCircle2, 
  CalendarDays
} from 'lucide-react';
import { MissionEvent } from '../../types';

interface EventsViewProps {
  events: MissionEvent[];
  onAddEvent?: (event: MissionEvent) => void;
}

export const EventsView: React.FC<EventsViewProps> = ({ events }) => {
  const [filterType, setFilterType] = useState<string>('all');

  const filteredEvents = filterType === 'all'
    ? events
    : events.filter(e => e.type === filterType);

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'vigilia':
        return <span className="bg-[#F6F8FB] text-[#4338CA] border border-[#E2E8F0] px-2 py-0.5 rounded text-[10px] font-medium">Vigilia de Oración</span>;
      case 'taller':
        return <span className="bg-[#F6F8FB] text-[#4F46E5] border border-[#E2E8F0] px-2 py-0.5 rounded text-[10px] font-medium">Taller Formativo</span>;
      case 'evangelismo':
        return <span className="bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0] px-2 py-0.5 rounded text-[10px] font-medium">Misión & Evangelismo</span>;
      case 'retiro':
        return <span className="bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] px-2 py-0.5 rounded text-[10px] font-medium">Retiro Espiritual</span>;
      default:
        return <span className="bg-[#F6F8FB] text-[#64748B] border border-[#E2E8F0] px-2 py-0.5 rounded text-[10px] font-medium">Convocatoria</span>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4.5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-lg font-serif font-bold text-[#0F172A] flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-[#4F46E5]" />
            Convocatorias & Encuentros de la Comunidad
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Planificación de jornadas de oración, talleres de discipulado, vigilias y retiros pastorales.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 bg-[#F6F8FB] border border-[#D8DFEA] rounded-lg text-xs font-medium text-[#0F172A] focus:outline-none"
          >
            <option value="all">Todas las Convocatorias</option>
            <option value="vigilia">Vigilias de Oración</option>
            <option value="taller">Talleres de Formación</option>
            <option value="evangelismo">Misión & Evangelismo</option>
            <option value="retiro">Retiros Espirituales</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEvents.map((evt) => (
          <div 
            key={evt.id}
            className="p-5 bg-white rounded-xl border border-[#E2E8F0] shadow-xs hover:border-[#94A3B8] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                {getTypeBadge(evt.type)}
                <span className="text-[10px] font-mono font-medium bg-[#F6F8FB] text-[#64748B] border border-[#E2E8F0] px-2 py-0.5 rounded">
                  {evt.status.toUpperCase()}
                </span>
              </div>

              <h3 className="text-sm font-serif font-bold text-[#0F172A] mb-3 leading-snug">
                {evt.title}
              </h3>

              <div className="space-y-1.5 text-xs text-[#334155]">
                <p className="flex items-center gap-2 text-[#0F172A] font-medium">
                  <Calendar className="w-4 h-4 text-[#4F46E5] shrink-0" />
                  <span>{evt.date} • {evt.time}</span>
                </p>
                <p className="flex items-center gap-2 text-[#64748B]">
                  <MapPin className="w-4 h-4 text-[#7B8BA3] shrink-0" />
                  <span>{evt.location}</span>
                </p>
                <p className="flex items-center gap-2 text-[#64748B]">
                  <Users className="w-4 h-4 text-[#7B8BA3] shrink-0" />
                  <span>Audiencia: <strong className="text-[#0F172A]">{evt.targetAudience}</strong></span>
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#EEF2F7] flex items-center justify-between">
              <span className="text-xs font-medium text-[#16A34A] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {evt.attendeesCount} Hermanos confirmados
              </span>

              <button
                onClick={() => alert(`Inscripción a ${evt.title} registrada.`)}
                className="px-3 py-1.5 bg-[#F6F8FB] hover:bg-[#EEF2F7] text-[#4F46E5] border border-[#D8DFEA] rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                Inscribir Grupo
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
