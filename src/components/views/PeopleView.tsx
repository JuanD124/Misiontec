import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Download, 
  UserPlus, 
  Phone, 
  ExternalLink
} from 'lucide-react';
import { Person, MissionaryGroup, DiscipleshipPhase, TrafficLightStatus } from '../../types';
import { NOMBRE_FASE } from '../../utils/formato';

const COLOR_ESTADO: Record<TrafficLightStatus, { punto: string; chip: string; texto: string }> = {
  red: { punto: 'bg-[#DC2626]', chip: 'bg-[#FEE2E2] text-[#B91C1C] border border-[#FECACA]', texto: 'Atención Urgente' },
  yellow: { punto: 'bg-[#CA8A04]', chip: 'bg-[#FEF9C3] text-[#854D0E] border border-[#FEF08A]', texto: 'Seguimiento' },
  green: { punto: 'bg-[#16A34A]', chip: 'bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]', texto: 'En Comunión' },
};

interface PeopleViewProps {
  people: Person[];
  groups: MissionaryGroup[];
  onOpenNewPersonModal?: () => void;
  onOpenPersonDetail: (person: Person) => void;
}

export const PeopleView: React.FC<PeopleViewProps> = ({
  people,
  groups,
  onOpenNewPersonModal,
  onOpenPersonDetail
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [phaseFilter, setPhaseFilter] = useState<'all' | DiscipleshipPhase>('all');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | TrafficLightStatus>('all');

  const filteredPeople = people.filter(p => {
    const matchesSearch = 
      p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.dni.includes(searchTerm) ||
      p.phone.includes(searchTerm);
    const matchesPhase = phaseFilter === 'all' || p.phase === phaseFilter;
    const matchesGroup = groupFilter === 'all' || p.groupId === groupFilter;
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesPhase && matchesGroup && matchesStatus;
  });

  const exportCSV = () => {
    const headers = 'ID,Nombre,Documento,Telefono,Email,Grupo,Fase,Semaforo,Inasistencias\n';
    const rows = filteredPeople.map(p => 
      `"${p.code}","${p.fullName}","${p.dni}","${p.phone}","${p.email}","${p.groupName}","${p.phase}","${p.status}",${p.consecutiveAbsences}`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `padron_pastoral_misiontec_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4.5 rounded-xl border border-[#E8E8E8] shadow-xs">
        <div>
          <h1 className="text-lg font-serif font-bold text-[#0A0A0A] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#EA580C]" />
            Discípulos & Directorio
          </h1>
          <p className="text-xs text-[#6B6B6B] mt-0.5">
            Cuidado y registro de cada discípulo y su grupo de comunión.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#FAFAFA] hover:bg-[#F2F2F2] text-[#EA580C] text-xs font-medium rounded-lg border border-[#E0E0E0] transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#EA580C]" />
            <span>Exportar CSV</span>
          </button>

          {onOpenNewPersonModal && (
            <button
              onClick={onOpenNewPersonModal}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-[#FAFAFA] text-xs font-medium rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Registrar Nuevo Discípulo</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-4 bg-white rounded-xl border border-[#E8E8E8] shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#8A8A8A] absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por nombre, documento o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-[#FAFAFA] border border-[#E0E0E0] rounded-lg text-[#0A0A0A] focus:outline-none focus:border-[#EA580C] placeholder:text-[#A3A3A3]"
          />
        </div>

        <div>
          <select
            value={phaseFilter}
            onChange={(e) => setPhaseFilter(e.target.value as any)}
            className="w-full px-2.5 py-1.5 bg-[#FAFAFA] border border-[#E0E0E0] rounded-lg text-[#0A0A0A] focus:outline-none focus:border-[#EA580C]"
          >
            <option value="all">Todas las Fases de Formación</option>
            <option value="contacto">Fase 1: Bienvenida</option>
            <option value="consolidacion">Fase 2: Consolidación</option>
            <option value="formacion">Fase 3: Formación</option>
            <option value="liderazgo">Fase 4: Liderazgo</option>
          </select>
        </div>

        <div>
          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-[#FAFAFA] border border-[#E0E0E0] rounded-lg text-[#0A0A0A] focus:outline-none focus:border-[#EA580C]"
          >
            <option value="all">Todos los Grupos de Comunión</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full px-2.5 py-1.5 bg-[#FAFAFA] border border-[#E0E0E0] rounded-lg text-[#0A0A0A] focus:outline-none focus:border-[#EA580C]"
          >
            <option value="all">Todos los Estados Pastorales</option>
            <option value="green">En Comunión (Verde)</option>
            <option value="yellow">En Seguimiento (Amarillo)</option>
            <option value="red">Atención Urgente (Rojo)</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E8E8E8] shadow-xs overflow-hidden">
        <div className="md:hidden divide-y divide-[#F2F2F2]">
          {filteredPeople.length === 0 ? (
            <p className="p-8 text-center text-xs text-[#8A8A8A] italic">No se encontraron registros con los filtros seleccionados.</p>
          ) : (
            filteredPeople.map(person => {
              const estado = COLOR_ESTADO[person.status];
              return (
                <button
                  key={person.id}
                  onClick={() => onOpenPersonDetail(person)}
                  className="w-full text-left p-4 flex items-start gap-3 active:bg-[#FAFAFA]"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm text-white shrink-0 ${estado.punto}`}>
                    {person.fullName.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-[#0A0A0A] leading-snug">{person.fullName}</p>
                    <p className="text-[11px] text-[#6B6B6B] mt-0.5">{person.code} • Doc. {person.dni}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${estado.chip}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${estado.punto}`} />
                        {estado.texto}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#FAFAFA] text-[#6B6B6B] border border-[#E8E8E8]">
                        {NOMBRE_FASE[person.phase] ?? person.phase}
                      </span>
                    </div>
                    <p className="mt-2 text-xs font-medium text-[#0A0A0A]">{person.groupName}</p>
                    <p className="mt-0.5 text-[11px] text-[#6B6B6B] flex items-center gap-1">
                      <Phone className="w-3 h-3 text-[#EA580C]" /> {person.phone}
                      <span className="text-[#C4C4C4]">·</span> {person.district}
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
                <th className="py-3 px-4.5">Discípulo / Documento</th>
                <th className="py-3 px-4.5">Contacto & Zona</th>
                <th className="py-3 px-4.5">Grupo de Comunión</th>
                <th className="py-3 px-4.5">Fase de Formación</th>
                <th className="py-3 px-4.5">Estado Pastoral</th>
                <th className="py-3 px-4.5">Mentor Espiritual</th>
                <th className="py-3 px-4.5 text-right">Acompañar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2F2F2]">
              {filteredPeople.map(person => (
                <tr key={person.id} className="hover:bg-[#FAFAFA] transition-colors">
                  <td className="py-3 px-4.5">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs text-white ${
                        person.status === 'red' ? 'bg-[#DC2626]' :
                        person.status === 'yellow' ? 'bg-[#CA8A04]' : 'bg-[#16A34A]'
                      }`}>
                        {person.fullName.charAt(0)}
                      </div>
                      <div>
                        <button
                          onClick={() => onOpenPersonDetail(person)}
                          className="font-medium text-[#0A0A0A] hover:text-[#EA580C] text-left block"
                        >
                          {person.fullName}
                        </button>
                        <span className="text-[10px] text-[#6B6B6B]">
                          {person.code} • Doc. {person.dni}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4.5 text-[#404040]">
                    <p className="flex items-center gap-1"><Phone className="w-3 h-3 text-[#EA580C]" /> {person.phone}</p>
                    <p className="text-[10px] text-[#6B6B6B]">{person.district}</p>
                  </td>

                  <td className="py-3 px-4.5 text-[#0A0A0A]">
                    <p className="font-medium">{person.groupName}</p>
                  </td>

                  <td className="py-3 px-4.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#FAFAFA] text-[#6B6B6B] border border-[#E8E8E8]">
                      {NOMBRE_FASE[person.phase] ?? person.phase}
                    </span>
                  </td>

                  <td className="py-3 px-4.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                      person.status === 'red' ? 'bg-[#FEE2E2] text-[#B91C1C] border border-[#FECACA]' :
                      person.status === 'yellow' ? 'bg-[#FEF9C3] text-[#854D0E] border border-[#FEF08A]' :
                      'bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        person.status === 'red' ? 'bg-[#DC2626]' :
                        person.status === 'yellow' ? 'bg-[#CA8A04]' : 'bg-[#16A34A]'
                      }`} />
                      {person.status === 'red' ? 'Atención Urgente' : person.status === 'yellow' ? 'Seguimiento' : 'En Comunión'}
                    </span>
                  </td>

                  <td className="py-3 px-4.5 text-[#404040]">
                    {person.mentorName}
                  </td>

                  <td className="py-3 px-4.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onOpenPersonDetail(person)}
                        className="p-1.5 text-[#8A8A8A] hover:text-[#0A0A0A] rounded-md"
                        title="Ver Ficha"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
