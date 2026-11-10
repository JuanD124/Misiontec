import React, { useState } from 'react';
import { Calendar, MapPin, Users, CheckCircle2, CalendarDays, Plus, Trash2 } from 'lucide-react';
import { MissionEvent } from '../../types';
import { NOMBRE_TIPO_EVENTO, NOMBRE_ESTADO_EVENTO, fechaCorta } from '../../utils/formato';

interface EventsViewProps {
  events: MissionEvent[];
  onCreateEvent?: () => void;
  onManageAttendees?: (event: MissionEvent) => void;
  onDeleteEvent?: (event: MissionEvent) => void;
}

const ESTILO_TIPO: Record<string, string> = {
  vigilia: 'bg-[#FFF7ED] text-[#C2410C] border-[#FDBA74]',
  taller: 'bg-[#FFEDD5] text-[#EA580C] border-[#FDBA74]',
  evangelismo: 'bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]',
  retiro: 'bg-[#FEF9C3] text-[#854D0E] border-[#FEF08A]',
  culto: 'bg-[#F5F5F5] text-[#404040] border-[#E0E0E0]',
};

export const EventsView: React.FC<EventsViewProps> = ({ events, onCreateEvent, onManageAttendees, onDeleteEvent }) => {
  const [filterType, setFilterType] = useState<string>('all');

  const filteredEvents = filterType === 'all' ? events : events.filter((e) => e.type === filterType);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-4.5 rounded-xl border border-[#E8E8E8] shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-[#0A0A0A] flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-[#EA580C]" />
            Encuentros & Eventos
          </h1>
          <p className="text-xs text-[#6B6B6B] mt-0.5">
            Cultos, talleres de formación, vigilias, retiros y jornadas de evangelismo.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-[#FAFAFA] border border-[#E0E0E0] rounded-lg text-xs font-medium text-[#0A0A0A] focus:outline-none"
          >
            <option value="all">Todos los eventos</option>
            {Object.entries(NOMBRE_TIPO_EVENTO).map(([clave, nombre]) => (
              <option key={clave} value={clave}>{nombre}</option>
            ))}
          </select>

          {onCreateEvent && (
            <button
              onClick={onCreateEvent}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-medium rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo evento</span>
            </button>
          )}
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="p-10 text-center text-xs text-[#8A8A8A] italic bg-white rounded-xl border border-[#E8E8E8]">
          No hay eventos para mostrar.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEvents.map((evt) => (
            <div
              key={evt.id}
              className="p-4 sm:p-5 bg-white rounded-xl border border-[#E8E8E8] shadow-xs hover:border-[#A3A3A3] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded border text-[10px] font-medium ${ESTILO_TIPO[evt.type] ?? ESTILO_TIPO.culto}`}>
                    {NOMBRE_TIPO_EVENTO[evt.type] ?? evt.type}
                  </span>
                  <span className="text-[10px] font-medium bg-[#FAFAFA] text-[#6B6B6B] border border-[#E8E8E8] px-2 py-0.5 rounded">
                    {NOMBRE_ESTADO_EVENTO[evt.status] ?? evt.status}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[#0A0A0A] mb-3 leading-snug">{evt.title}</h3>

                <div className="space-y-1.5 text-xs text-[#404040]">
                  <p className="flex items-center gap-2 text-[#0A0A0A] font-medium">
                    <Calendar className="w-4 h-4 text-[#EA580C] shrink-0" />
                    <span>{fechaCorta(evt.date)} • {evt.time}</span>
                  </p>
                  <p className="flex items-center gap-2 text-[#6B6B6B]">
                    <MapPin className="w-4 h-4 text-[#8A8A8A] shrink-0" />
                    <span>{evt.location}</span>
                  </p>
                  <p className="flex items-center gap-2 text-[#6B6B6B]">
                    <Users className="w-4 h-4 text-[#8A8A8A] shrink-0" />
                    <span>
                      Dirigido a: <strong className="text-[#0A0A0A]">{evt.targetAudience || (evt.groupName ? evt.groupName : 'Toda la misión')}</strong>
                    </span>
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#F2F2F2] flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-[#16A34A] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {evt.attendeesCount} {evt.attendeesCount === 1 ? 'asistente' : 'asistentes'}
                </span>

                <div className="flex items-center gap-2">
                  {onDeleteEvent && (
                    <button
                      onClick={() => onDeleteEvent(evt)}
                      className="p-1.5 text-[#B91C1C] hover:bg-[#FEF2F2] border border-[#FECACA] rounded-lg"
                      title="Eliminar evento"
                      aria-label="Eliminar evento"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {onManageAttendees && (
                    <button
                      onClick={() => onManageAttendees(evt)}
                      className="px-3 py-1.5 bg-[#FAFAFA] hover:bg-[#F2F2F2] text-[#EA580C] border border-[#E0E0E0] rounded-lg text-xs font-medium transition-colors cursor-pointer"
                    >
                      Registrar asistentes
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
