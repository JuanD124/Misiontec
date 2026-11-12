import React, { useEffect, useState } from 'react';
import {
  X,
  Phone,
  AlertCircle,
  Tag,
  BookOpen,
  History,
  KeyRound,
  Pencil,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { Person, DiscipleshipPhase, UserRole } from '../../types';
import { api, HistorialFase } from '../../services/api';
import { NOMBRE_FASE, fechaCorta, fechaLarga } from '../../utils/formato';
import { ROLES, infoRol } from '../../data/roles';

interface PersonDetailModalProps {
  person: Person | null;
  onClose: () => void;
  onPromotePhase?: (personId: string, nextPhase: DiscipleshipPhase) => void;
  onEdit?: (person: Person) => void;
  onSetAccess?: (personId: string, clave: string, rol: UserRole) => Promise<void>;
  onRemoveAccess?: (personId: string) => Promise<void>;
  onDelete?: (person: Person) => void;
}

export const PersonDetailModal: React.FC<PersonDetailModalProps> = ({
  person,
  onClose,
  onPromotePhase,
  onEdit,
  onSetAccess,
  onRemoveAccess,
  onDelete,
}) => {
  const [historial, setHistorial] = useState<HistorialFase[] | null>(null);
  const [clave, setClave] = useState('');
  const [rolElegido, setRolElegido] = useState<UserRole>('discipulador');
  const [mensajeAcceso, setMensajeAcceso] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);
  const [guardandoAcceso, setGuardandoAcceso] = useState(false);

  useEffect(() => {
    setHistorial(null);
    setClave('');
    setMensajeAcceso(null);
    setRolElegido(person?.accessRole ?? 'discipulador');
    if (!person) return;
    let vigente = true;
    api.historial(person.id).then((h) => vigente && setHistorial(h)).catch(() => vigente && setHistorial([]));
    return () => {
      vigente = false;
    };
  }, [person?.id, person?.phase]);

  if (!person) return null;

  const getNextPhase = (current: DiscipleshipPhase): DiscipleshipPhase | null => {
    if (current === 'contacto') return 'consolidacion';
    if (current === 'consolidacion') return 'formacion';
    if (current === 'formacion') return 'liderazgo';
    return null;
  };

  const nextPhase = getNextPhase(person.phase);

  const guardarAcceso = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSetAccess) return;
    setGuardandoAcceso(true);
    setMensajeAcceso(null);
    try {
      await onSetAccess(person.id, clave, rolElegido);
      setClave('');
      setMensajeAcceso({ tipo: 'ok', texto: `Listo: ya puede entrar como ${infoRol(rolElegido).nombre} con su documento y esa contraseña.` });
    } catch (err) {
      setMensajeAcceso({ tipo: 'error', texto: (err as Error).message });
    } finally {
      setGuardandoAcceso(false);
    }
  };

  const quitarAcceso = async () => {
    if (!onRemoveAccess) return;
    setGuardandoAcceso(true);
    setMensajeAcceso(null);
    try {
      await onRemoveAccess(person.id);
      setMensajeAcceso({ tipo: 'ok', texto: 'Se quitó el acceso a la aplicación.' });
    } catch (err) {
      setMensajeAcceso({ tipo: 'error', texto: (err as Error).message });
    } finally {
      setGuardandoAcceso(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-[#0A0A0A]/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-[#E8E8E8] rounded-t-2xl sm:rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh]">
        <div className="p-4 sm:p-5 border-b border-[#E8E8E8] bg-[#FAFAFA] flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold text-white shadow-xs shrink-0 ${
              person.status === 'red' ? 'bg-[#DC2626]' :
              person.status === 'yellow' ? 'bg-[#CA8A04]' : 'bg-[#16A34A]'
            }`}>
              {person.fullName.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-[#0A0A0A]">{person.fullName}</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-[#6B6B6B] border border-[#E8E8E8]">{person.code}</span>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                  person.status === 'red' ? 'bg-[#FEE2E2] text-[#B91C1C] border border-[#FECACA]' :
                  person.status === 'yellow' ? 'bg-[#FEF9C3] text-[#854D0E] border border-[#FEF08A]' :
                  'bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]'
                }`}>
                  {person.status === 'red' ? 'Atención urgente' : person.status === 'yellow' ? 'Seguimiento' : 'En comunión'}
                </span>
              </div>
              <p className="text-xs text-[#6B6B6B] mt-0.5">
                Documento: {person.dni} • {person.groupName}
              </p>
              <p className="text-xs text-[#404040] mt-0.5">
                {person.birthDate
                  ? <><strong className="text-[#0A0A0A]">{person.age} años</strong> • nació el {fechaLarga(person.birthDate)}</>
                  : 'Edad no registrada'}
                {' '}• {person.gender === 'M' ? 'Varón' : 'Mujer'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {onEdit && (
              <button onClick={() => onEdit(person)} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#404040] border border-[#E0E0E0] bg-white rounded-lg hover:bg-[#F2F2F2]">
                <Pencil className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Editar</span>
              </button>
            )}
            <button onClick={onClose} className="p-1.5 text-[#8A8A8A] hover:text-[#0A0A0A] rounded-lg hover:bg-[#F2F2F2]" aria-label="Cerrar">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-[#FAFAFA] rounded-xl border border-[#E8E8E8]">
              <span className="text-[10px] text-[#6B6B6B] font-medium block">Etapa de formación</span>
              <p className="text-xs font-bold text-[#EA580C] mt-0.5">{NOMBRE_FASE[person.phase] ?? person.phase}</p>
              <p className="text-[10px] text-[#6B6B6B] mt-1">Mentor: {person.mentorName}</p>
            </div>

            <div className="p-3 bg-[#FAFAFA] rounded-xl border border-[#E8E8E8]">
              <span className="text-[10px] text-[#6B6B6B] font-medium block">Ausencias consecutivas</span>
              <p className={`text-base font-bold mt-0.5 ${person.consecutiveAbsences > 2 ? 'text-[#DC2626]' : 'text-[#0A0A0A]'}`}>
                {person.consecutiveAbsences}
              </p>
              <p className="text-[10px] text-[#6B6B6B] mt-0.5">Última asistencia: {person.lastAttendanceDate}</p>
            </div>
          </div>

          <div className="p-4 bg-[#FAFAFA] rounded-xl border border-[#E8E8E8] space-y-2">
            <h4 className="font-bold text-[#0A0A0A] flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#EA580C]" />
              Datos de contacto
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#404040]">
              <p><strong>Teléfono:</strong> {person.phone || '—'}</p>
              <p className="break-all"><strong>Correo:</strong> {person.email || '—'}</p>
              <p><strong>Distrito:</strong> {person.district || '—'}</p>
              <p><strong>Dirección:</strong> {person.address || '—'}</p>
            </div>
            {person.tags && person.tags.length > 0 && (
              <div className="flex items-center gap-1.5 pt-2 flex-wrap">
                <Tag className="w-3 h-3 text-[#8A8A8A]" />
                {person.tags.map((t, idx) => (
                  <span key={idx} className="text-[10px] bg-white text-[#6B6B6B] border border-[#E8E8E8] px-2 py-0.5 rounded">{t}</span>
                ))}
              </div>
            )}
          </div>

          {person.criticalNotes && (
            <div className="p-3.5 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-[#B91C1C]">
              <p className="font-bold flex items-center gap-1.5 text-xs mb-1">
                <AlertCircle className="w-4 h-4 text-[#DC2626]" />
                Observación / petición de oración
              </p>
              <p className="text-[11px] leading-relaxed">{person.criticalNotes}</p>
            </div>
          )}

          <div>
            <h4 className="font-bold text-[#0A0A0A] mb-2 flex items-center gap-1.5">
              <History className="w-4 h-4 text-[#EA580C]" />
              Historial de fases
            </h4>
            {historial === null ? (
              <p className="text-[#8A8A8A] italic">Cargando…</p>
            ) : historial.length === 0 ? (
              <p className="text-[#8A8A8A] italic">Todavía no hay cambios de fase registrados.</p>
            ) : (
              <ol className="relative border-l-2 border-[#E8E8E8] ml-2 space-y-3">
                {historial.map((h, i) => (
                  <li key={i} className="pl-4 relative">
                    <span className={`absolute -left-[7px] top-1 w-3 h-3 rounded-full border-2 border-white ${h.to ? 'bg-[#A3A3A3]' : 'bg-[#EA580C]'}`} />
                    <p className="font-semibold text-[#0A0A0A]">
                      {NOMBRE_FASE[h.phase] ?? h.phase}
                      {!h.to && <span className="ml-2 text-[10px] font-medium text-[#EA580C]">Fase actual</span>}
                    </p>
                    <p className="text-[11px] text-[#6B6B6B]">
                      Desde {fechaCorta(h.from)}{h.to ? ` hasta ${fechaCorta(h.to)}` : ''}{h.note ? ` · ${h.note}` : ''}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </div>

          {onSetAccess && (
            <form onSubmit={guardarAcceso} className="p-4 bg-[#FAFAFA] rounded-xl border border-[#E8E8E8] space-y-2">
              <h4 className="font-bold text-[#0A0A0A] flex items-center gap-1.5 flex-wrap">
                <KeyRound className="w-4 h-4 text-[#EA580C]" />
                Acceso a la aplicación
                <span className={`ml-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${person.hasAccess ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#F2F2F2] text-[#6B6B6B]'}`}>
                  {person.hasAccess ? `Tiene acceso${person.accessRole ? ` · ${infoRol(person.accessRole).nombre}` : ''}` : 'Sin acceso'}
                </span>
              </h4>
              <p className="text-[11px] text-[#6B6B6B]">
                Entra con su documento ({person.dni}) y la contraseña que le definas aquí (mínimo 8 caracteres). El rol decide qué puede ver y hacer.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={rolElegido}
                  onChange={(e) => setRolElegido(e.target.value as UserRole)}
                  className="px-3 py-2 bg-white border border-[#E0E0E0] rounded-lg focus:outline-none focus:border-[#EA580C] text-[#0A0A0A]"
                  aria-label="Rol en la aplicación"
                >
                  {ROLES.map((r) => (
                    <option key={r.clave} value={r.clave}>{r.nombre}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={clave}
                  onChange={(e) => setClave(e.target.value)}
                  placeholder={person.hasAccess ? 'Nueva contraseña' : 'Contraseña inicial'}
                  autoComplete="off"
                  className="flex-1 px-3 py-2 bg-white border border-[#E0E0E0] rounded-lg focus:outline-none focus:border-[#EA580C] text-[#0A0A0A]"
                />
                <button
                  type="submit"
                  disabled={guardandoAcceso || clave.length === 0}
                  className="px-4 py-2 bg-[#0A0A0A] hover:bg-[#262626] disabled:opacity-50 text-white font-medium rounded-lg"
                >
                  {person.hasAccess ? 'Guardar cambios' : 'Crear acceso'}
                </button>
              </div>
              {person.hasAccess && onRemoveAccess && (
                <button
                  type="button"
                  onClick={quitarAcceso}
                  disabled={guardandoAcceso}
                  className="text-[11px] font-medium text-[#B91C1C] hover:underline disabled:opacity-50"
                >
                  Quitar el acceso a la aplicación
                </button>
              )}
              {mensajeAcceso && (
                <p className={`flex items-center gap-1.5 text-[11px] font-medium ${mensajeAcceso.tipo === 'ok' ? 'text-[#166534]' : 'text-[#B91C1C]'}`}>
                  {mensajeAcceso.tipo === 'ok' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {mensajeAcceso.texto}
                </p>
              )}
            </form>
          )}

          <div className="pt-3 border-t border-[#E8E8E8] flex items-center justify-between gap-3 flex-wrap">
            {nextPhase && onPromotePhase ? (
              <button
                onClick={() => {
                  onPromotePhase(person.id, nextPhase);
                  onClose();
                }}
                className="px-3.5 py-2 bg-[#FAFAFA] hover:bg-[#F2F2F2] text-[#EA580C] border border-[#E0E0E0] rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-[#EA580C]" />
                <span>Promover a {NOMBRE_FASE[nextPhase] ?? nextPhase}</span>
              </button>
            ) : nextPhase ? null : (
              <span className="text-[11px] text-[#6B6B6B] font-medium">Liderazgo y envío alcanzado</span>
            )}

            {onDelete && (
              <button
                onClick={() => onDelete(person)}
                className="ml-auto flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#B91C1C] border border-[#FECACA] bg-white hover:bg-[#FEF2F2] rounded-lg"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Eliminar persona
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
