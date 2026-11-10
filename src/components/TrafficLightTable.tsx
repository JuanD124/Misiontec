import React, { useState } from 'react';
import { 
  HeartHandshake, 
  Clock, 
  CheckCircle2, 
  ExternalLink, 
  Search, 
  Filter, 
  Phone, 
  Calendar
} from 'lucide-react';
import { Person, TrafficLightStatus, DiscipleshipPhase } from '../types';

interface TrafficLightTableProps {
  people: Person[];
  onOpenPersonDetailModal: (person: Person) => void;
  statusFilter: 'all' | TrafficLightStatus;
  onStatusFilterChange: (status: 'all' | TrafficLightStatus) => void;
}

export const TrafficLightTable: React.FC<TrafficLightTableProps> = ({
  people,
  onOpenPersonDetailModal,
  statusFilter,
  onStatusFilterChange
}) => {
  const [selectedPhase, setSelectedPhase] = useState<'all' | DiscipleshipPhase>('all');
  const [tableSearch, setTableSearch] = useState('');

  const filteredPeople = people.filter((person) => {
    const matchesStatus = statusFilter === 'all' || person.status === statusFilter;
    const matchesPhase = selectedPhase === 'all' || person.phase === selectedPhase;
    const matchesSearch = 
      person.fullName.toLowerCase().includes(tableSearch.toLowerCase()) ||
      person.groupName.toLowerCase().includes(tableSearch.toLowerCase()) ||
      person.dni.includes(tableSearch);
    return matchesStatus && matchesPhase && matchesSearch;
  });

  const redCount = people.filter(p => p.status === 'red').length;
  const yellowCount = people.filter(p => p.status === 'yellow').length;
  const greenCount = people.filter(p => p.status === 'green').length;

  const getPhaseBadge = (phase: DiscipleshipPhase) => {
    switch(phase) {
      case 'contacto':
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#FFF7ED] text-[#C2410C] border border-[#E8E8E8]">1. Bienvenida</span>;
      case 'consolidacion':
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#FEF9C3] text-[#854D0E] border border-[#FEF08A]">2. Consolidación</span>;
      case 'formacion':
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0]">3. Formación</span>;
      case 'liderazgo':
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#FFF7ED] text-[#EA580C] border border-[#E0E0E0]">4. Liderazgo</span>;
    }
  };

  const getStatusBadge = (status: TrafficLightStatus, absences: number) => {
    switch (status) {
      case 'red':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FEE2E2] text-[#B91C1C] border border-[#FECACA]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
            Atención Urgente ({absences} faltas)
          </span>
        );
      case 'yellow':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FEF9C3] text-[#854D0E] border border-[#FEF08A]">
            <Clock className="w-3 h-3 text-[#CA8A04]" />
            Seguimiento ({absences} faltas)
          </span>
        );
      case 'green':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]">
            <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />
            En Comunión Activa
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-[#E8E8E8] rounded-xl shadow-xs overflow-hidden">
      <div className="p-4.5 border-b border-[#E8E8E8] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-serif font-bold text-[#0A0A0A] flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-[#EA580C]" />
              Cuidado Pastoral & Acompañamiento de los Discípulos
            </h2>
            <span className="text-xs bg-[#FAFAFA] text-[#6B6B6B] border border-[#E8E8E8] px-2 py-0.5 rounded font-medium">
              {filteredPeople.length} discípulos
            </span>
          </div>
          <p className="text-xs text-[#6B6B6B] mt-0.5">
            Atención preventiva ante inasistencias en grupos para fortalecer la perseverancia espiritual.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1 bg-[#FAFAFA] border border-[#E8E8E8] p-1 rounded-lg self-start md:self-auto">
          <button
            onClick={() => onStatusFilterChange('all')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              statusFilter === 'all'
                ? 'bg-[#EA580C] text-[#FAFAFA] shadow-xs'
                : 'text-[#6B6B6B] hover:text-[#0A0A0A]'
            }`}
          >
            Todos ({people.length})
          </button>
          <button
            onClick={() => onStatusFilterChange('red')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors ${
              statusFilter === 'red'
                ? 'bg-[#DC2626] text-white shadow-xs'
                : 'text-[#B91C1C] hover:bg-[#FEE2E2]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
            Atención ({redCount})
          </button>
          <button
            onClick={() => onStatusFilterChange('yellow')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors ${
              statusFilter === 'yellow'
                ? 'bg-[#CA8A04] text-white shadow-xs'
                : 'text-[#854D0E] hover:bg-[#FEF9C3]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#CA8A04]" />
            Seguimiento ({yellowCount})
          </button>
          <button
            onClick={() => onStatusFilterChange('green')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors ${
              statusFilter === 'green'
                ? 'bg-[#16A34A] text-white shadow-xs'
                : 'text-[#166534] hover:bg-[#DCFCE7]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
            Comunión ({greenCount})
          </button>
        </div>
      </div>

      <div className="px-4.5 py-2.5 bg-[#FAFAFA] border-b border-[#E8E8E8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-[#8A8A8A] absolute left-2.5 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Filtrar por nombre o grupo..."
            value={tableSearch}
            onChange={(e) => setTableSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E0E0E0] rounded-lg text-xs text-[#0A0A0A] focus:outline-none focus:border-[#EA580C] placeholder:text-[#A3A3A3]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#6B6B6B] font-medium flex items-center gap-1">
            <Filter className="w-3 h-3 text-[#8A8A8A]" />
            Fase:
          </span>
          <select
            value={selectedPhase}
            onChange={(e) => setSelectedPhase(e.target.value as any)}
            className="bg-white border border-[#E0E0E0] text-xs text-[#0A0A0A] rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#EA580C]"
          >
            <option value="all">Todas las Fases</option>
            <option value="contacto">1. Bienvenida</option>
            <option value="consolidacion">2. Consolidación</option>
            <option value="formacion">3. Formación</option>
            <option value="liderazgo">4. Liderazgo</option>
          </select>
        </div>
      </div>

      <div className="md:hidden divide-y divide-[#F2F2F2]">
        {filteredPeople.length === 0 ? (
          <p className="p-8 text-center text-xs text-[#8A8A8A] italic">
            No se encontraron registros con los filtros seleccionados.
          </p>
        ) : (
          filteredPeople.map((person) => {
            const isRed = person.status === 'red';
            const isYellow = person.status === 'yellow';
            return (
              <button
                key={person.id}
                onClick={() => onOpenPersonDetailModal(person)}
                className={`w-full text-left p-4 flex items-start gap-3 active:bg-[#FAFAFA] ${isRed ? 'bg-[#FEF2F2]' : ''}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 text-white ${
                  isRed ? 'bg-[#DC2626]' : isYellow ? 'bg-[#CA8A04]' : 'bg-[#16A34A]'
                }`}>
                  {person.fullName.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm text-[#0A0A0A] leading-snug">{person.fullName}</p>
                  <p className="text-[11px] text-[#6B6B6B] mt-0.5">{person.code} • {person.groupName}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {getStatusBadge(person.status, person.consecutiveAbsences)}
                    {getPhaseBadge(person.phase)}
                  </div>
                  <p className="mt-2 text-[11px] text-[#404040] flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-[#8A8A8A]" />
                    {person.lastAttendanceDate}
                    {person.consecutiveAbsences > 0 ? (
                      <span className="text-[#B91C1C] font-medium">
                        · {person.consecutiveAbsences} {person.consecutiveAbsences === 1 ? 'falta' : 'faltas seguidas'}
                      </span>
                    ) : (
                      <span className="text-[#16A34A]">· Asistencia puntual</span>
                    )}
                  </p>
                  <p className="mt-1 text-[11px] text-[#6B6B6B] flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#EA580C]" /> {person.mentorName} · {person.phone}
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-[#A3A3A3] shrink-0 mt-1" />
              </button>
            );
          })
        )}
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FAFAFA] text-[#6B6B6B] uppercase text-[10px] font-semibold tracking-wider border-b border-[#E8E8E8]">
            <tr>
              <th className="py-3 px-4.5">Discípulo / Código</th>
              <th className="py-3 px-4.5">Grupo de Comunión</th>
              <th className="py-3 px-4.5">Fase de Formación</th>
              <th className="py-3 px-4.5">Última Asistencia</th>
              <th className="py-3 px-4.5">Estado Pastoral</th>
              <th className="py-3 px-4.5">Mentor Asignado</th>
              <th className="py-3 px-4.5 text-right">Ficha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F2F2F2]">
            {filteredPeople.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-[#8A8A8A] italic">
                  No se encontraron registros con los filtros seleccionados.
                </td>
              </tr>
            ) : (
              filteredPeople.map((person) => {
                const isRed = person.status === 'red';
                const isYellow = person.status === 'yellow';

                return (
                  <tr 
                    key={person.id}
                    className={`hover:bg-[#FAFAFA] transition-colors ${
                      isRed ? 'bg-[#FEF2F2]' : ''
                    }`}
                  >
                    <td className="py-3 px-4.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 text-white ${
                          isRed ? 'bg-[#DC2626]' :
                          isYellow ? 'bg-[#CA8A04]' : 'bg-[#16A34A]'
                        }`}>
                          {person.fullName.charAt(0)}
                        </div>
                        <div>
                          <button
                            onClick={() => onOpenPersonDetailModal(person)}
                            className="font-medium text-[#0A0A0A] hover:text-[#EA580C] text-left block"
                          >
                            {person.fullName}
                          </button>
                          <span className="text-[10px] text-[#6B6B6B]">
                            {person.code} • Doc.: {person.dni}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4.5 text-[#404040]">
                      <p className="font-medium text-xs">{person.groupName}</p>
                      <p className="text-[10px] text-[#6B6B6B]">{person.district}</p>
                    </td>

                    <td className="py-3 px-4.5">
                      {getPhaseBadge(person.phase)}
                    </td>

                    <td className="py-3 px-4.5">
                      <div className="flex items-center gap-1.5 text-[#404040]">
                        <Calendar className="w-3 h-3 text-[#8A8A8A]" />
                        <span>{person.lastAttendanceDate}</span>
                      </div>
                      {person.consecutiveAbsences > 0 ? (
                        <span className="text-[10px] text-[#B91C1C] font-medium block">
                          {person.consecutiveAbsences} {person.consecutiveAbsences === 1 ? 'falta' : 'faltas seguidas'}
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#16A34A]">Asistencia puntual</span>
                      )}
                    </td>

                    <td className="py-3 px-4.5">
                      {getStatusBadge(person.status, person.consecutiveAbsences)}
                    </td>

                    <td className="py-3 px-4.5 text-[#404040]">
                      <p className="font-medium text-xs">{person.mentorName}</p>
                      <p className="text-[10px] text-[#6B6B6B] flex items-center gap-1">
                        <Phone className="w-2.5 h-2.5 text-[#EA580C]" /> {person.phone}
                      </p>
                    </td>

                    <td className="py-3 px-4.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenPersonDetailModal(person)}
                          className="p-1.5 text-[#8A8A8A] hover:text-[#0A0A0A] rounded-lg hover:bg-[#F5F5F5]"
                          title="Ver Ficha y Expediente"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="p-3.5 bg-[#FAFAFA] border-t border-[#E8E8E8] text-[11px] text-[#6B6B6B] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-semibold text-[#0A0A0A]">Criterios de Cuidado Pastoral:</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
            <strong className="text-[#0A0A0A]">Comunión:</strong> Asistencia continua (&lt;2 faltas).
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#CA8A04]" />
            <strong className="text-[#0A0A0A]">Seguimiento:</strong> 2 inasistencias consecutivas.
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
            <strong className="text-[#0A0A0A]">Atención Urgente:</strong> 3+ inasistencias consecutivas.
          </span>
        </div>
      </div>
    </div>
  );
};
