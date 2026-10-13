import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Download, 
  UserPlus, 
  Phone, 
  HeartHandshake, 
  ExternalLink
} from 'lucide-react';
import { Person, MissionaryGroup, DiscipleshipPhase, TrafficLightStatus } from '../../types';

interface PeopleViewProps {
  people: Person[];
  groups: MissionaryGroup[];
  onOpenNewPersonModal: () => void;
  onOpenFollowUpModal: (personId: string) => void;
  onOpenPersonDetail: (person: Person) => void;
}

export const PeopleView: React.FC<PeopleViewProps> = ({
  people,
  groups,
  onOpenNewPersonModal,
  onOpenFollowUpModal,
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
    const headers = 'ID,Nombre,DNI,Telefono,Email,Grupo,Fase,Semaforo,Inasistencias\n';
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4.5 rounded-xl border border-[#E8DFD7] shadow-xs">
        <div>
          <h1 className="text-lg font-serif font-bold text-[#2D1F17] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#8C5D36]" />
            Padrón Fraterno & Directorio de Hermanos
          </h1>
          <p className="text-xs text-[#7D6B5E] mt-0.5">
            Cuidado y registro de cada miembro, discipulado y célula asignada.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#FAF7F2] hover:bg-[#F2ECE4] text-[#3B281C] text-xs font-medium rounded-lg border border-[#D9CCC1] transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#8C5D36]" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={onOpenNewPersonModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#3B281C] hover:bg-[#2D1F17] text-[#FAF7F2] text-xs font-medium rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Registrar Nuevo Hermano</span>
          </button>
        </div>
      </div>

      <div className="p-4 bg-white rounded-xl border border-[#E8DFD7] shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#998576] absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por nombre, DNI o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-[#FAF7F2] border border-[#E0D4C7] rounded-lg text-[#2D1F17] focus:outline-none focus:border-[#8C5D36] placeholder:text-[#A39284]"
          />
        </div>

        <div>
          <select
            value={phaseFilter}
            onChange={(e) => setPhaseFilter(e.target.value as any)}
            className="w-full px-2.5 py-1.5 bg-[#FAF7F2] border border-[#E0D4C7] rounded-lg text-[#2D1F17] focus:outline-none focus:border-[#8C5D36]"
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
            className="w-full px-2.5 py-1.5 bg-[#FAF7F2] border border-[#E0D4C7] rounded-lg text-[#2D1F17] focus:outline-none focus:border-[#8C5D36]"
          >
            <option value="all">Todas las Células en Hogares</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full px-2.5 py-1.5 bg-[#FAF7F2] border border-[#E0D4C7] rounded-lg text-[#2D1F17] focus:outline-none focus:border-[#8C5D36]"
          >
            <option value="all">Todos los Estados Pastorales</option>
            <option value="green">En Comunión (Verde)</option>
            <option value="yellow">En Seguimiento (Amarillo)</option>
            <option value="red">Atención Urgente (Rojo)</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E8DFD7] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] text-[#7D6B5E] uppercase text-[10px] font-semibold tracking-wider border-b border-[#E8DFD7]">
              <tr>
                <th className="py-3 px-4.5">Hermano / Documento</th>
                <th className="py-3 px-4.5">Contacto & Zona</th>
                <th className="py-3 px-4.5">Célula en Hogar</th>
                <th className="py-3 px-4.5">Fase de Formación</th>
                <th className="py-3 px-4.5">Estado Pastoral</th>
                <th className="py-3 px-4.5">Mentor Espiritual</th>
                <th className="py-3 px-4.5 text-right">Acompañar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2ECE4]">
              {filteredPeople.map(person => (
                <tr key={person.id} className="hover:bg-[#FAF7F2] transition-colors">
                  <td className="py-3 px-4.5">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs text-white ${
                        person.status === 'red' ? 'bg-[#9E382A]' :
                        person.status === 'yellow' ? 'bg-[#B38646]' : 'bg-[#486341]'
                      }`}>
                        {person.fullName.charAt(0)}
                      </div>
                      <div>
                        <button
                          onClick={() => onOpenPersonDetail(person)}
                          className="font-medium text-[#2D1F17] hover:text-[#8C5D36] text-left block"
                        >
                          {person.fullName}
                        </button>
                        <span className="text-[10px] text-[#8C7A6D]">
                          {person.code} • DNI {person.dni}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4.5 text-[#5C4535]">
                    <p className="flex items-center gap-1"><Phone className="w-3 h-3 text-[#8C5D36]" /> {person.phone}</p>
                    <p className="text-[10px] text-[#8C7A6D]">{person.district}</p>
                  </td>

                  <td className="py-3 px-4.5 text-[#2D1F17]">
                    <p className="font-medium">{person.groupName}</p>
                  </td>

                  <td className="py-3 px-4.5">
                    <span className="capitalize px-2 py-0.5 rounded text-[10px] font-medium bg-[#FAF7F2] text-[#7D6B5E] border border-[#E8DFD7]">
                      {person.phase}
                    </span>
                  </td>

                  <td className="py-3 px-4.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                      person.status === 'red' ? 'bg-[#FBEBE9] text-[#8C3527] border border-[#F2D0CC]' :
                      person.status === 'yellow' ? 'bg-[#FAF2E1] text-[#946A1B] border border-[#EBDCC2]' :
                      'bg-[#EBF2E8] text-[#3D5636] border border-[#D4E4CF]'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        person.status === 'red' ? 'bg-[#9E382A]' :
                        person.status === 'yellow' ? 'bg-[#B38646]' : 'bg-[#486341]'
                      }`} />
                      {person.status === 'red' ? 'Atención Urgente' : person.status === 'yellow' ? 'Seguimiento' : 'En Comunión'}
                    </span>
                  </td>

                  <td className="py-3 px-4.5 text-[#5C4535]">
                    {person.mentorName}
                  </td>

                  <td className="py-3 px-4.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onOpenFollowUpModal(person.id)}
                        className="px-2.5 py-1 bg-[#FAF7F2] hover:bg-[#F2ECE4] text-[#3B281C] border border-[#D9CCC1] rounded-md text-xs font-medium flex items-center gap-1 transition-colors"
                        title="Registrar Visita o Seguimiento"
                      >
                        <HeartHandshake className="w-3.5 h-3.5 text-[#8C5D36]" />
                        <span>Acompañar</span>
                      </button>

                      <button
                        onClick={() => onOpenPersonDetail(person)}
                        className="p-1.5 text-[#998576] hover:text-[#2D1F17] rounded-md"
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
