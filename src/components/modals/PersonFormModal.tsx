import React, { useEffect, useState } from 'react';
import { X, UserPlus, UserCog, Church, CheckCircle2, RefreshCw } from 'lucide-react';
import { Person, MissionaryGroup, DiscipleshipPhase } from '../../types';
import { edadDesde, hoyISO } from '../../utils/formato';

interface PersonFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: MissionaryGroup[];
  personToEdit?: Person | null;
  onSave: (data: Partial<Person>, personId?: string) => Promise<void>;
}

const CORREO_VALIDO = /^.+@.+\..+$/;

const campo = (conError: boolean) =>
  `w-full px-3 py-2 bg-white border rounded-lg focus:outline-none text-[#0A0A0A] ${
    conError ? 'border-[#DC2626] focus:border-[#DC2626]' : 'border-[#E0E0E0] focus:border-[#EA580C]'
  }`;

export const PersonFormModal: React.FC<PersonFormModalProps> = ({ isOpen, onClose, groups, personToEdit, onSave }) => {
  const editando = Boolean(personToEdit);

  const [fullName, setFullName] = useState('');
  const [dni, setDni] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'M' | 'F'>('M');
  const [address, setAddress] = useState('');
  const [groupId, setGroupId] = useState('');
  const [phase, setPhase] = useState<DiscipleshipPhase>('contacto');
  const [notes, setNotes] = useState('');
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setErrores({});
    setErrorGeneral(null);
    setGuardando(false);
    if (personToEdit) {
      setFullName(personToEdit.fullName);
      setDni(personToEdit.dni);
      setPhone(personToEdit.phone);
      setEmail(personToEdit.email);
      setBirthDate(personToEdit.birthDate ?? '');
      setGender(personToEdit.gender);
      setAddress(personToEdit.address);
      setGroupId(personToEdit.groupId);
      setPhase(personToEdit.phase);
      setNotes(personToEdit.criticalNotes ?? '');
    } else {
      setFullName('');
      setDni('');
      setPhone('');
      setEmail('');
      setBirthDate('');
      setGender('M');
      setAddress('');
      setGroupId(groups[0]?.id ?? '');
      setPhase('contacto');
      setNotes('');
    }
  }, [isOpen, personToEdit]);

  if (!isOpen) return null;

  const grupoElegido = groups.find((g) => g.id === groupId);

  const validar = () => {
    const e: Record<string, string> = {};
    if (fullName.trim().split(/\s+/).filter(Boolean).length < 2) e.fullName = 'Escribe el nombre y al menos un apellido.';
    if (!editando && (dni.length < 5 || dni.length > 12)) e.dni = 'El documento debe tener entre 5 y 12 números.';
    if (email && !CORREO_VALIDO.test(email)) e.email = 'El correo no tiene un formato válido.';
    const nacimientoObligatorio = !editando || Boolean(personToEdit?.birthDate);
    if (!birthDate) {
      if (nacimientoObligatorio) e.birthDate = 'Elige la fecha de nacimiento.';
    } else if (birthDate > hoyISO()) {
      e.birthDate = 'La fecha de nacimiento no puede ser futura.';
    } else if (edadDesde(birthDate) > 110) {
      e.birthDate = 'La fecha de nacimiento no es posible.';
    }
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setErrorGeneral(null);
    if (!validar()) return;

    setGuardando(true);
    try {
      await onSave(
        {
          fullName: fullName.trim(),
          ...(editando ? {} : { dni, phase, tags: ['Nuevo Ingreso', 'Bienvenida'] }),
          phone: phone.trim(),
          email: email.trim(),
          birthDate,
          gender,
          address: address.trim(),
          groupId,
          criticalNotes: notes.trim(),
        },
        personToEdit?.id,
      );
      onClose();
    } catch (err) {
      setErrorGeneral((err as Error).message);
    } finally {
      setGuardando(false);
    }
  };

  const MensajeError: React.FC<{ nombre: string }> = ({ nombre }) =>
    errores[nombre] ? <p className="mt-1 text-[11px] text-[#DC2626]">{errores[nombre]}</p> : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-[#0A0A0A]/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-[#E8E8E8] rounded-t-2xl sm:rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh]">
        <div className="p-4 sm:p-5 border-b border-[#E8E8E8] flex items-center justify-between bg-[#FAFAFA] gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#FFEDD5] flex items-center justify-center shrink-0">
              {editando ? <UserCog className="w-5 h-5 text-[#EA580C]" /> : <UserPlus className="w-5 h-5 text-[#EA580C]" />}
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-[#0A0A0A] truncate">
                {editando ? `Editar datos de ${personToEdit?.fullName}` : 'Registrar nuevo miembro'}
              </h2>
              <p className="text-xs text-[#6B6B6B]">
                {editando ? 'Actualiza los datos de contacto y el grupo.' : 'Se agrega al padrón y a un grupo de comunión.'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-[#8A8A8A] hover:text-[#0A0A0A] rounded-lg hover:bg-[#F2F2F2] transition-colors shrink-0" aria-label="Cerrar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs custom-scrollbar">
          {errorGeneral && (
            <div role="alert" className="p-3 rounded-lg bg-[#FEE2E2] border border-[#FECACA] text-[#B91C1C] font-medium">
              {errorGeneral}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-[#0A0A0A] mb-1">Nombres y apellidos *</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                placeholder="Ej. Sara Milagros Valencia Vega" className={campo(Boolean(errores.fullName))} />
              <MensajeError nombre="fullName" />
            </div>

            <div>
              <label className="block font-medium text-[#0A0A0A] mb-1">Documento de identidad {editando ? '' : '*'}</label>
              <input type="text" inputMode="numeric" maxLength={12} value={dni} disabled={editando}
                onChange={(e) => setDni(e.target.value.replace(/\D/g, ''))}
                placeholder="Solo números" className={`${campo(Boolean(errores.dni))} font-mono ${editando ? 'bg-[#F5F5F5] text-[#6B6B6B]' : ''}`} />
              {editando && <p className="mt-1 text-[11px] text-[#8A8A8A]">El documento no se puede cambiar.</p>}
              <MensajeError nombre="dni" />
            </div>

            <div>
              <label className="block font-medium text-[#0A0A0A] mb-1">Teléfono / WhatsApp</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ej. 3101234567" className={campo(false)} />
            </div>

            <div>
              <label className="block font-medium text-[#0A0A0A] mb-1">Correo electrónico</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@ejemplo.com" className={campo(Boolean(errores.email))} />
              <MensajeError nombre="email" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-medium text-[#0A0A0A] mb-1">
                  Fecha de nacimiento {!editando || personToEdit?.birthDate ? '*' : ''}
                </label>
                <input type="date" max={hoyISO()} value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className={campo(Boolean(errores.birthDate))} />
                {birthDate && birthDate <= hoyISO() && (
                  <p className="mt-1 text-[11px] text-[#6B6B6B]">Edad: <strong className="text-[#0A0A0A]">{edadDesde(birthDate)} años</strong></p>
                )}
                <MensajeError nombre="birthDate" />
              </div>
              <div>
                <label className="block font-medium text-[#0A0A0A] mb-1">Género</label>
                <select value={gender} onChange={(e) => setGender(e.target.value as 'M' | 'F')} className={campo(false)}>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-medium text-[#0A0A0A] mb-1">Dirección</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Calle, número o referencia" className={campo(false)} />
            </div>
          </div>

          <div className="pt-2 border-t border-[#E8E8E8]">
            <h3 className="font-bold text-[#0A0A0A] mb-2 flex items-center gap-1.5">
              <Church className="w-4 h-4 text-[#EA580C]" />
              Grupo de comunión
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-[#0A0A0A] mb-1">Grupo</label>
                <select value={groupId} onChange={(e) => setGroupId(e.target.value)} className={campo(false)}>
                  <option value="">Sin grupo por ahora</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              {!editando && (
                <div>
                  <label className="block font-medium text-[#0A0A0A] mb-1">Etapa de formación</label>
                  <select value={phase} onChange={(e) => setPhase(e.target.value as DiscipleshipPhase)} className={campo(false)}>
                    <option value="contacto">1. Bienvenida / Contacto</option>
                    <option value="consolidacion">2. Consolidación</option>
                    <option value="formacion">3. Formación doctrinal</option>
                    <option value="liderazgo">4. Liderazgo y envío</option>
                  </select>
                </div>
              )}
            </div>

            <p className="mt-2 text-[11px] text-[#6B6B6B]">
              {grupoElegido
                ? `Su mentor será el líder del grupo: ${grupoElegido.leaderName}.`
                : 'Sin grupo, la persona no tendrá mentor asignado.'}
            </p>
          </div>

          <div>
            <label className="block font-medium text-[#0A0A0A] mb-1">Petición de oración / observación pastoral</label>
            <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="Motivo de oración, necesidades de la familia…" className={campo(false)} />
          </div>

          <div className="pt-4 border-t border-[#E8E8E8] flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-medium text-[#6B6B6B] hover:text-[#0A0A0A]">
              Cancelar
            </button>
            <button type="submit" disabled={guardando}
              className="flex items-center gap-1.5 px-5 py-2 bg-[#EA580C] hover:bg-[#C2410C] disabled:opacity-60 text-white text-xs font-medium rounded-lg shadow-xs transition-colors cursor-pointer">
              {guardando ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>{guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Registrar miembro'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
