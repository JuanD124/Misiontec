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
  onOpenFollowUpModal: (personId: string) => void;
  onOpenPersonDetailModal: (person: Person) => void;
  statusFilter: 'all' | TrafficLightStatus;
  onStatusFilterChange: (status: 'all' | TrafficLightStatus) => void;
}

export const TrafficLightTable: React.FC<TrafficLightTableProps> = ({
  people,
  onOpenFollowUpModal,
  onOpenPersonDetailModal,
  statusFilter,
  onStatusFilterChange
}) => {
  const [selectedPhase, setSelectedPhase] = useState<'all' | DiscipleshipPhase>('all');
  const [tableSearch, setTableSearch] = useState('');

  // Filtering
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
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#F5EDE4] text-[#6B4E3D] border border-[#E8DFD7]">1. Bienvenida</span>;
      case 'consolidacion':
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#FAF2E1] text-[#946A1B] border border-[#EBDCC2]">2. Consolidación</span>;
      case 'formacion':
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#EBF2E8] text-[#486341] border border-[#D4E4CF]">3. Formación</span>;
      case 'liderazgo':
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#F0EBE5] text-[#3B281C] border border-[#D9CCC1]">4. Liderazgo</span>;
    }
  };

  const getStatusBadge = (status: TrafficLightStatus, absences: number, daysWithoutContact: number) => {
    switch (status) {
      case 'red':
        return (
          <div className="flex flex-col gap-0.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FBEBE9] text-[#8C3527] border border-[#F2D0CC]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#9E382A]" />
              Atención Urgente ({absences} faltas)
            </span>
            <span className="text-[10px] text-[#A3594F]">
              {daysWithoutContact} días sin visita
            </span>
          </div>
        );
      case 'yellow':
        return (
          <div className="flex flex-col gap-0.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FAF2E1] text-[#946A1B] border border-[#EBDCC2]">
              <Clock className="w-3 h-3 text-[#B38646]" />
              Seguimiento ({absences} faltas)
            </span>
            <span className="text-[10px] text-[#946A1B]">
              {daysWithoutContact > 15 ? `${daysWithoutContact}d sin mentoría` : '2da inasistencia'}
            </span>
          </div>
        );
      case 'green':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EBF2E8] text-[#3D5636] border border-[#D4E4CF]">
            <CheckCircle2 className="w-3 h-3 text-[#486341]" />
            En Comunión Activa
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-[#E8DFD7] rounded-xl shadow-xs overflow-hidden">
      {/* Header and Semantic Legend */}
      <div className="p-4.5 border-b border-[#E8DFD7] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-serif font-bold text-[#2D1F17] flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-[#8C5D36]" />
              Cuidado Pastoral & Acompañamiento del Rebaño
            </h2>
            <span className="text-xs bg-[#FAF7F2] text-[#7D6B5E] border border-[#E8DFD7] px-2 py-0.5 rounded font-medium">
              {filteredPeople.length} hermanos
            </span>
          </div>
          <p className="text-xs text-[#7D6B5E] mt-0.5">
            Atención preventiva ante inasistencias en células para fortalecer la perseverancia espiritual.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-[#FAF7F2] border border-[#E8DFD7] p-1 rounded-lg self-start md:self-auto">
          <button
            onClick={() => onStatusFilterChange('all')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              statusFilter === 'all'
                ? 'bg-[#3B281C] text-[#FAF7F2] shadow-xs'
                : 'text-[#7D6B5E] hover:text-[#2D1F17]'
            }`}
          >
            Todos ({people.length})
          </button>
          <button
            onClick={() => onStatusFilterChange('red')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors ${
              statusFilter === 'red'
                ? 'bg-[#9E382A] text-white shadow-xs'
                : 'text-[#8C3527] hover:bg-[#FBEBE9]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#9E382A]" />
            Atención ({redCount})
          </button>
          <button
            onClick={() => onStatusFilterChange('yellow')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors ${
              statusFilter === 'yellow'
                ? 'bg-[#B38646] text-white shadow-xs'
                : 'text-[#946A1B] hover:bg-[#FAF2E1]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#B38646]" />
            Seguimiento ({yellowCount})
          </button>
          <button
            onClick={() => onStatusFilterChange('green')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors ${
              statusFilter === 'green'
                ? 'bg-[#486341] text-white shadow-xs'
                : 'text-[#3D5636] hover:bg-[#EBF2E8]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#486341]" />
            Comunión ({greenCount})
          </button>
        </div>
      </div>

      {/* Sub-toolbar: Search & Phase Filter */}
      <div className="px-4.5 py-2.5 bg-[#FAF7F2] border-b border-[#E8DFD7] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-[#998576] absolute left-2.5 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Filtrar por nombre o célula..."
            value={tableSearch}
            onChange={(e) => setTableSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E0D4C7] rounded-lg text-xs text-[#2D1F17] focus:outline-none focus:border-[#8C5D36] placeholder:text-[#A39284]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#7D6B5E] font-medium flex items-center gap-1">
            <Filter className="w-3 h-3 text-[#998576]" />
            Fase:
          </span>
          <select
            value={selectedPhase}
            onChange={(e) => setSelectedPhase(e.target.value as any)}
            className="bg-white border border-[#E0D4C7] text-xs text-[#2D1F17] rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#8C5D36]"
          >
            <option value="all">Todas las Fases</option>
            <option value="contacto">1. Bienvenida</option>
            <option value="consolidacion">2. Consolidación</option>
            <option value="formacion">3. Formación</option>
            <option value="liderazgo">4. Liderazgo</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FAF7F2] text-[#7D6B5E] uppercase text-[10px] font-semibold tracking-wider border-b border-[#E8DFD7]">
            <tr>
              <th className="py-3 px-4.5">Hermano / Código</th>
              <th className="py-3 px-4.5">Célula en Hogar</th>
              <th className="py-3 px-4.5">Fase de Formación</th>
              <th className="py-3 px-4.5">Última Asistencia</th>
              <th className="py-3 px-4.5">Estado Pastoral</th>
              <th className="py-3 px-4.5">Mentor Asignado</th>
              <th className="py-3 px-4.5 text-right">Acompañar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F2ECE4]">
            {filteredPeople.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-[#998576] italic">
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
                    className={`hover:bg-[#FAF7F2] transition-colors ${
                      isRed ? 'bg-[#FDF8F7]' : ''
                    }`}
                  >
                    {/* Persona */}
                    <td className="py-3 px-4.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 text-white ${
                          isRed ? 'bg-[#9E382A]' :
                          isYellow ? 'bg-[#B38646]' : 'bg-[#486341]'
                        }`}>
                          {person.fullName.charAt(0)}
                        </div>
                        <div>
                          <button
                            onClick={() => onOpenPersonDetailModal(person)}
                            className="font-medium text-[#2D1F17] hover:text-[#8C5D36] text-left block"
                          >
                            {person.fullName}
                          </button>
                          <span className="text-[10px] text-[#8C7A6D]">
                            {person.code} • DNI: {person.dni}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Grupo */}
                    <td className="py-3 px-4.5 text-[#4A3425]">
                      <p className="font-medium text-xs">{person.groupName}</p>
                      <p className="text-[10px] text-[#8C7A6D]">{person.district}</p>
                    </td>

                    {/* Fase */}
                    <td className="py-3 px-4.5">
                      {getPhaseBadge(person.phase)}
                    </td>

                    {/* Última Asistencia */}
                    <td className="py-3 px-4.5">
                      <div className="flex items-center gap-1.5 text-[#4A3425]">
                        <Calendar className="w-3 h-3 text-[#998576]" />
                        <span>{person.lastAttendanceDate}</span>
                      </div>
                      {person.consecutiveAbsences > 0 ? (
                        <span className="text-[10px] text-[#8C3527] font-medium block">
                          {person.consecutiveAbsences} {person.consecutiveAbsences === 1 ? 'falta' : 'faltas seguidas'}
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#486341]">Asistencia puntual</span>
                      )}
                    </td>

                    {/* Estado Semáforo */}
                    <td className="py-3 px-4.5">
                      {getStatusBadge(person.status, person.consecutiveAbsences, person.daysSinceLastContact)}
                    </td>

                    {/* Mentor */}
                    <td className="py-3 px-4.5 text-[#4A3425]">
                      <p className="font-medium text-xs">{person.mentorName}</p>
                      <p className="text-[10px] text-[#8C7A6D] flex items-center gap-1">
                        <Phone className="w-2.5 h-2.5 text-[#8C5D36]" /> {person.phone}
                      </p>
                    </td>

                    {/* Quick Action Button */}
                    <td className="py-3 px-4.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          id={`btn-followup-${person.id}`}
                          onClick={() => onOpenFollowUpModal(person.id)}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                            isRed 
                              ? 'bg-[#9E382A] hover:bg-[#852C20] text-white' 
                              : isYellow
                              ? 'bg-[#B38646] hover:bg-[#996F34] text-white'
                              : 'bg-[#F7F2EB] hover:bg-[#EFE6DB] text-[#3B281C] border border-[#D9CCC1]'
                          }`}
                          title="Registrar visita pastoral o llamada"
                        >
                          <HeartHandshake className="w-3.5 h-3.5" />
                          <span>Visita Pastoral</span>
                        </button>

                        <button
                          onClick={() => onOpenPersonDetailModal(person)}
                          className="p-1.5 text-[#998576] hover:text-[#2D1F17] rounded-lg hover:bg-[#F7F2EB]"
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

      {/* Semantic Footer Legend */}
      <div className="p-3.5 bg-[#FAF7F2] border-t border-[#E8DFD7] text-[11px] text-[#7D6B5E] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-semibold text-[#2D1F17]">Criterios de Cuidado Pastoral:</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#486341]" />
            <strong className="text-[#2D1F17]">Comunión:</strong> Asistencia continua (&lt;2 faltas).
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#B38646]" />
            <strong className="text-[#2D1F17]">Seguimiento:</strong> 2 inasistencias o más de 15 días sin visita.
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#9E382A]" />
            <strong className="text-[#2D1F17]">Atención Urgente:</strong> 3+ inasistencias consecutivas.
          </span>
        </div>
      </div>
    </div>
  );
};
