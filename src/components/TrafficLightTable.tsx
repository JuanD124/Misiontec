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
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#EEF2FF] text-[#4338CA] border border-[#E2E8F0]">1. Bienvenida</span>;
      case 'consolidacion':
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">2. Consolidación</span>;
      case 'formacion':
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0]">3. Formación</span>;
      case 'liderazgo':
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#EEF2FF] text-[#4F46E5] border border-[#D8DFEA]">4. Liderazgo</span>;
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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
            <Clock className="w-3 h-3 text-[#D97706]" />
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
    <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-xs overflow-hidden">
      <div className="p-4.5 border-b border-[#E2E8F0] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-serif font-bold text-[#0F172A] flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-[#4F46E5]" />
              Cuidado Pastoral & Acompañamiento del Rebaño
            </h2>
            <span className="text-xs bg-[#F6F8FB] text-[#64748B] border border-[#E2E8F0] px-2 py-0.5 rounded font-medium">
              {filteredPeople.length} hermanos
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Atención preventiva ante inasistencias en grupos para fortalecer la perseverancia espiritual.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-[#F6F8FB] border border-[#E2E8F0] p-1 rounded-lg self-start md:self-auto">
          <button
            onClick={() => onStatusFilterChange('all')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              statusFilter === 'all'
                ? 'bg-[#4F46E5] text-[#F6F8FB] shadow-xs'
                : 'text-[#64748B] hover:text-[#0F172A]'
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
                ? 'bg-[#D97706] text-white shadow-xs'
                : 'text-[#B45309] hover:bg-[#FEF3C7]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
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

      <div className="px-4.5 py-2.5 bg-[#F6F8FB] border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-[#7B8BA3] absolute left-2.5 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Filtrar por nombre o grupo..."
            value={tableSearch}
            onChange={(e) => setTableSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#D8DFEA] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:border-[#4F46E5] placeholder:text-[#94A3B8]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#64748B] font-medium flex items-center gap-1">
            <Filter className="w-3 h-3 text-[#7B8BA3]" />
            Fase:
          </span>
          <select
            value={selectedPhase}
            onChange={(e) => setSelectedPhase(e.target.value as any)}
            className="bg-white border border-[#D8DFEA] text-xs text-[#0F172A] rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#4F46E5]"
          >
            <option value="all">Todas las Fases</option>
            <option value="contacto">1. Bienvenida</option>
            <option value="consolidacion">2. Consolidación</option>
            <option value="formacion">3. Formación</option>
            <option value="liderazgo">4. Liderazgo</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F6F8FB] text-[#64748B] uppercase text-[10px] font-semibold tracking-wider border-b border-[#E2E8F0]">
            <tr>
              <th className="py-3 px-4.5">Hermano / Código</th>
              <th className="py-3 px-4.5">Grupo de Discipulado</th>
              <th className="py-3 px-4.5">Fase de Formación</th>
              <th className="py-3 px-4.5">Última Asistencia</th>
              <th className="py-3 px-4.5">Estado Pastoral</th>
              <th className="py-3 px-4.5">Mentor Asignado</th>
              <th className="py-3 px-4.5 text-right">Ficha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EEF2F7]">
            {filteredPeople.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-[#7B8BA3] italic">
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
                    className={`hover:bg-[#F6F8FB] transition-colors ${
                      isRed ? 'bg-[#FEF2F2]' : ''
                    }`}
                  >
                    <td className="py-3 px-4.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 text-white ${
                          isRed ? 'bg-[#DC2626]' :
                          isYellow ? 'bg-[#D97706]' : 'bg-[#16A34A]'
                        }`}>
                          {person.fullName.charAt(0)}
                        </div>
                        <div>
                          <button
                            onClick={() => onOpenPersonDetailModal(person)}
                            className="font-medium text-[#0F172A] hover:text-[#4F46E5] text-left block"
                          >
                            {person.fullName}
                          </button>
                          <span className="text-[10px] text-[#64748B]">
                            {person.code} • DNI: {person.dni}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4.5 text-[#334155]">
                      <p className="font-medium text-xs">{person.groupName}</p>
                      <p className="text-[10px] text-[#64748B]">{person.district}</p>
                    </td>

                    <td className="py-3 px-4.5">
                      {getPhaseBadge(person.phase)}
                    </td>

                    <td className="py-3 px-4.5">
                      <div className="flex items-center gap-1.5 text-[#334155]">
                        <Calendar className="w-3 h-3 text-[#7B8BA3]" />
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

                    <td className="py-3 px-4.5 text-[#334155]">
                      <p className="font-medium text-xs">{person.mentorName}</p>
                      <p className="text-[10px] text-[#64748B] flex items-center gap-1">
                        <Phone className="w-2.5 h-2.5 text-[#4F46E5]" /> {person.phone}
                      </p>
                    </td>

                    <td className="py-3 px-4.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenPersonDetailModal(person)}
                          className="p-1.5 text-[#7B8BA3] hover:text-[#0F172A] rounded-lg hover:bg-[#F1F5F9]"
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

      <div className="p-3.5 bg-[#F6F8FB] border-t border-[#E2E8F0] text-[11px] text-[#64748B] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-semibold text-[#0F172A]">Criterios de Cuidado Pastoral:</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
            <strong className="text-[#0F172A]">Comunión:</strong> Asistencia continua (&lt;2 faltas).
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#D97706]" />
            <strong className="text-[#0F172A]">Seguimiento:</strong> 2 inasistencias consecutivas.
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
            <strong className="text-[#0F172A]">Atención Urgente:</strong> 3+ inasistencias consecutivas.
          </span>
        </div>
      </div>
    </div>
  );
};
