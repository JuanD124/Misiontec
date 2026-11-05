import React, { useState } from 'react';
import { X, UserPlus, Church, CheckCircle2 } from 'lucide-react';
import { Person, MissionaryGroup, DiscipleshipPhase } from '../../types';

interface NewPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: MissionaryGroup[];
  onAddPerson: (newPerson: Omit<Person, 'id' | 'code' | 'status' | 'consecutiveAbsences'>) => void;
}

export const NewPersonModal: React.FC<NewPersonModalProps> = ({
  isOpen,
  onClose,
  groups,
  onAddPerson
}) => {
  const [fullName, setFullName] = useState('');
  const [dni, setDni] = useState('');
  const [phone, setPhone] = useState('+51 ');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState<number>(25);
  const [gender, setGender] = useState<'M' | 'F'>('M');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('Los Olivos');
  const [groupId, setGroupId] = useState(groups[0]?.id || '');
  const [phase, setPhase] = useState<DiscipleshipPhase>('contacto');
  const [mentorName, setMentorName] = useState(groups[0]?.leaderName || 'Pr. Carlos Mendoza');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !dni) {
      alert('Por favor ingrese el Nombre Completo y DNI.');
      return;
    }

    const selectedGroup = groups.find(g => g.id === groupId);

    onAddPerson({
      fullName,
      dni,
      phone,
      email,
      age: Number(age),
      gender,
      address,
      district,
      groupId,
      groupName: selectedGroup?.name || 'Grupo de Discipulado',
      phase,
      mentorName: mentorName || selectedGroup?.leaderName || 'Pastor',
      mentorId: 'lead-1',
      lastAttendanceDate: new Date().toISOString().split('T')[0],
      enrollmentDate: new Date().toISOString().split('T')[0],
      criticalNotes: notes,
      tags: ['Nuevo Ingreso', 'Bienvenida']
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-[#E2E8F0] rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F6F8FB]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E2E8F0] text-[#4F46E5] flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-[#4F46E5]" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-[#0F172A]">
                Registrar Nuevo Hermano en la Comunidad
              </h2>
              <p className="text-xs text-[#64748B]">
                Incorporación al padrón de cuidado pastoral y asignación a grupo de discipulado.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#7B8BA3] hover:text-[#0F172A] rounded-lg hover:bg-[#EEF2F7] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-[#0F172A] mb-1">
                Nombres y Apellidos Completos *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ej. Sara Milagros Valencia Vega"
                className="w-full px-3 py-2 bg-[#F6F8FB] border border-[#D8DFEA] rounded-lg focus:outline-none focus:border-[#4F46E5] text-[#0F172A]"
              />
            </div>

            <div>
              <label className="block font-medium text-[#0F172A] mb-1">
                Documento de Identidad (DNI) *
              </label>
              <input
                type="text"
                required
                maxLength={8}
                value={dni}
                onChange={(e) => setDni(e.target.value.replace(/\D/g, ''))}
                placeholder="8 dígitos numéricos"
                className="w-full px-3 py-2 bg-[#F6F8FB] border border-[#D8DFEA] rounded-lg focus:outline-none focus:border-[#4F46E5] text-[#0F172A] font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-[#0F172A] mb-1">
                Teléfono / WhatsApp
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-[#F6F8FB] border border-[#D8DFEA] rounded-lg focus:outline-none focus:border-[#4F46E5] text-[#0F172A]"
              />
            </div>

            <div>
              <label className="block font-medium text-[#0F172A] mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="w-full px-3 py-2 bg-[#F6F8FB] border border-[#D8DFEA] rounded-lg focus:outline-none focus:border-[#4F46E5] text-[#0F172A]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-medium text-[#0F172A] mb-1">
                  Edad
                </label>
                <input
                  type="number"
                  min={12}
                  max={99}
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#F6F8FB] border border-[#D8DFEA] rounded-lg focus:outline-none focus:border-[#4F46E5] text-[#0F172A]"
                />
              </div>
              <div>
                <label className="block font-medium text-[#0F172A] mb-1">
                  Género
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#F6F8FB] border border-[#D8DFEA] rounded-lg focus:outline-none focus:border-[#4F46E5] text-[#0F172A]"
                >
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-medium text-[#0F172A] mb-1">
                Distrito de Residencia
              </label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3 py-2 bg-[#F6F8FB] border border-[#D8DFEA] rounded-lg focus:outline-none focus:border-[#4F46E5] text-[#0F172A]"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-[#0F172A] mb-1">
              Dirección de Domicilio
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Av. / Jr. / Calle, Número o Referencia"
              className="w-full px-3 py-2 bg-[#F6F8FB] border border-[#D8DFEA] rounded-lg focus:outline-none focus:border-[#4F46E5] text-[#0F172A]"
            />
          </div>

          <div className="pt-2 border-t border-[#E2E8F0]">
            <h3 className="font-serif font-bold text-[#0F172A] mb-2 flex items-center gap-1.5">
              <Church className="w-4 h-4 text-[#4F46E5]" />
              Asignación de Grupo & Mentor Espiritual
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block font-medium text-[#0F172A] mb-1">
                  Grupo de Discipulado
                </label>
                <select
                  value={groupId}
                  onChange={(e) => {
                    setGroupId(e.target.value);
                    const grp = groups.find(g => g.id === e.target.value);
                    if (grp) setMentorName(grp.leaderName);
                  }}
                  className="w-full px-3 py-2 bg-[#F6F8FB] border border-[#D8DFEA] rounded-lg focus:outline-none focus:border-[#4F46E5] text-[#0F172A]"
                >
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-[#0F172A] mb-1">
                  Etapa de Formación
                </label>
                <select
                  value={phase}
                  onChange={(e) => setPhase(e.target.value as DiscipleshipPhase)}
                  className="w-full px-3 py-2 bg-[#F6F8FB] border border-[#D8DFEA] rounded-lg focus:outline-none focus:border-[#4F46E5] text-[#0F172A]"
                >
                  <option value="contacto">1. Bienvenida / Contacto</option>
                  <option value="consolidacion">2. Consolidación</option>
                  <option value="formacion">3. Formación Doctrinal</option>
                  <option value="liderazgo">4. Liderazgo & Envío</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-[#0F172A] mb-1">
                  Mentor / Discipulador
                </label>
                <input
                  type="text"
                  value={mentorName}
                  onChange={(e) => setMentorName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F6F8FB] border border-[#D8DFEA] rounded-lg focus:outline-none focus:border-[#4F46E5] text-[#0F172A]"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-medium text-[#0F172A] mb-1">
              Petición de Oración / Observación Pastoral
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Motivo de oración, necesidades de la familia, fecha de bienvenida..."
              className="w-full px-3 py-2 bg-[#F6F8FB] border border-[#D8DFEA] rounded-lg focus:outline-none focus:border-[#4F46E5] text-[#0F172A]"
            />
          </div>

          <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#64748B] hover:text-[#0F172A]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-[#F6F8FB] text-xs font-medium rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Guardar en el Padrón Fraterno</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
