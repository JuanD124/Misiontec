import React, { useEffect, useState } from 'react';
import { X, KeyRound, CheckCircle2, RefreshCw, Eye, EyeOff, Wand2 } from 'lucide-react';
import { Person, UserRole } from '../../types';
import { DatosAcceso } from '../../services/api';
import { ROLES, infoRol } from '../../data/roles';

interface AccessFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  people: Person[];
  personToEdit: Person | null;
  sesionId: number;
  onCreate: (data: DatosAcceso) => Promise<void>;
  onUpdate: (personId: string, clave: string, rol: UserRole) => Promise<void>;
}

const campo = (conError: boolean) =>
  `w-full px-3 py-2 bg-white border rounded-lg focus:outline-none text-[#0A0A0A] ${
    conError ? 'border-[#DC2626]' : 'border-[#E0E0E0] focus:border-[#EA580C]'
  }`;

const generarClave = () => {
  const letras = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const bytes = new Uint32Array(10);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => letras[b % letras.length]).join('');
};

export const AccessFormModal: React.FC<AccessFormModalProps> = ({
  isOpen, onClose, people, personToEdit, sesionId, onCreate, onUpdate,
}) => {
  const editando = Boolean(personToEdit);
  const [modo, setModo] = useState<'nueva' | 'existente'>('nueva');
  const [fullName, setFullName] = useState('');
  const [dni, setDni] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [personaId, setPersonaId] = useState('');
  const [role, setRole] = useState<UserRole>('discipulador');
  const [password, setPassword] = useState('');
  const [verClave, setVerClave] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setModo('nueva');
    setFullName('');
    setDni('');
    setPhone('');
    setEmail('');
    setPersonaId('');
    setRole(personToEdit?.accessRole ?? 'discipulador');
    setPassword('');
    setVerClave(false);
    setErrores({});
    setErrorGeneral(null);
    setGuardando(false);
  }, [isOpen, personToEdit]);

  if (!isOpen) return null;

  const esUnoMismo = personToEdit ? Number(personToEdit.id) === sesionId : false;
  const sinAcceso = people.filter((p) => !p.hasAccess).sort((a, b) => a.fullName.localeCompare(b.fullName, 'es'));
  const infoElegida = infoRol(role);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};

    if (editando) {
      if (password && password.length < 8) errs.password = 'La contraseña nueva debe tener mínimo 8 caracteres (o déjala vacía para no cambiarla).';
    } else {
      if (modo === 'nueva') {
        if (fullName.trim().length < 3) errs.fullName = 'Escribe el nombre completo.';
        if (!dni.trim()) errs.dni = 'Escribe el documento: es con el que iniciará sesión.';
        if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = 'El correo no tiene un formato válido.';
      } else if (!personaId) {
        errs.personaId = 'Elige a la persona.';
      }
      if (password.length < 8) errs.password = 'La contraseña debe tener mínimo 8 caracteres.';
    }
    setErrores(errs);
    if (Object.keys(errs).length > 0) return;

    setGuardando(true);
    setErrorGeneral(null);
    try {
      if (editando) {
        await onUpdate(personToEdit!.id, password, role);
      } else if (modo === 'nueva') {
        await onCreate({ fullName: fullName.trim(), dni: dni.trim(), phone: phone.trim(), email: email.trim(), role, password });
      } else {
        await onUpdate(personaId, password, role);
      }
      onClose();
    } catch (err) {
      setErrorGeneral((err as Error).message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-[#0A0A0A]/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-[#E8E8E8] rounded-t-2xl sm:rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        <div className="p-4 sm:p-5 border-b border-[#E8E8E8] flex items-center justify-between bg-[#FAFAFA]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFEDD5] flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-[#EA580C]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0A0A0A]">{editando ? 'Editar acceso' : 'Nuevo acceso'}</h2>
              <p className="text-[11px] text-[#6B6B6B]">Solo el Pastor puede crear y cambiar accesos.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-[#8A8A8A] hover:text-[#0A0A0A] rounded-lg hover:bg-[#F2F2F2]" aria-label="Cerrar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={enviar} noValidate className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
          {errorGeneral && (
            <div role="alert" className="p-3 rounded-lg bg-[#FEE2E2] border border-[#FECACA] text-[#B91C1C] font-medium">{errorGeneral}</div>
          )}

          {editando ? (
            <div className="p-3 bg-[#FAFAFA] border border-[#E8E8E8] rounded-lg">
              <p className="font-semibold text-[#0A0A0A] text-sm">{personToEdit!.fullName}</p>
              <p className="text-[#6B6B6B]">Documento para iniciar sesión: <strong className="text-[#0A0A0A]">{personToEdit!.dni}</strong></p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-1 p-1 bg-[#F5F5F5] rounded-lg">
                {([['nueva', 'Persona nueva'], ['existente', 'Ya registrada']] as const).map(([clave, etiqueta]) => (
                  <button
                    key={clave}
                    type="button"
                    onClick={() => setModo(clave)}
                    className={`py-1.5 rounded-md font-medium transition-colors ${modo === clave ? 'bg-white text-[#0A0A0A] shadow-xs' : 'text-[#6B6B6B] hover:text-[#0A0A0A]'}`}
                  >
                    {etiqueta}
                  </button>
                ))}
              </div>

              {modo === 'nueva' ? (
                <>
                  <div>
                    <label className="block font-medium text-[#0A0A0A] mb-1">Nombre completo *</label>
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ej. Roberto Quintero Parra" className={campo(Boolean(errores.fullName))} />
                    {errores.fullName && <p className="mt-1 text-[11px] text-[#DC2626]">{errores.fullName}</p>}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-[#0A0A0A] mb-1">Documento (para entrar) *</label>
                      <input type="text" inputMode="numeric" value={dni} onChange={(e) => setDni(e.target.value)} placeholder="Ej. 1121800150" className={campo(Boolean(errores.dni))} />
                      {errores.dni && <p className="mt-1 text-[11px] text-[#DC2626]">{errores.dni}</p>}
                    </div>
                    <div>
                      <label className="block font-medium text-[#0A0A0A] mb-1">Teléfono</label>
                      <input type="text" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Opcional" className={campo(false)} />
                    </div>
                  </div>
                  <div>
                    <label className="block font-medium text-[#0A0A0A] mb-1">Correo</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Opcional" className={campo(Boolean(errores.email))} />
                    {errores.email && <p className="mt-1 text-[11px] text-[#DC2626]">{errores.email}</p>}
                  </div>
                </>
              ) : (
                <div>
                  <label className="block font-medium text-[#0A0A0A] mb-1">Persona *</label>
                  <select value={personaId} onChange={(e) => setPersonaId(e.target.value)} className={campo(Boolean(errores.personaId))}>
                    <option value="">Elige a la persona…</option>
                    {sinAcceso.map((p) => <option key={p.id} value={p.id}>{p.fullName} · Doc. {p.dni}</option>)}
                  </select>
                  {sinAcceso.length === 0 && <p className="mt-1 text-[11px] text-[#6B6B6B]">Todas las personas registradas ya tienen acceso.</p>}
                  {errores.personaId && <p className="mt-1 text-[11px] text-[#DC2626]">{errores.personaId}</p>}
                </div>
              )}
            </>
          )}

          <div>
            <label className="block font-medium text-[#0A0A0A] mb-1">Rol en la aplicación *</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              disabled={esUnoMismo}
              className={`${campo(false)} disabled:bg-[#F5F5F5] disabled:text-[#6B6B6B]`}
            >
              {ROLES.map((r) => <option key={r.clave} value={r.clave}>{r.nombre}</option>)}
            </select>
            <p className="mt-1.5 p-2.5 bg-[#FFF7ED] border border-[#FED7AA] rounded-lg text-[11px] text-[#7C2D12] leading-snug">
              <strong>{infoElegida.nombre}:</strong> {infoElegida.descripcion}
            </p>
            {esUnoMismo && <p className="mt-1 text-[11px] text-[#6B6B6B]">No puedes cambiar tu propio rol de Pastor.</p>}
          </div>

          <div>
            <label className="block font-medium text-[#0A0A0A] mb-1">
              {editando ? 'Nueva contraseña (opcional)' : 'Contraseña *'}
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={verClave ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={editando ? 'Déjala vacía para no cambiarla' : 'Mínimo 8 caracteres'}
                  autoComplete="new-password"
                  className={`${campo(Boolean(errores.password))} pr-9`}
                />
                <button
                  type="button"
                  onClick={() => setVerClave(!verClave)}
                  className="absolute right-2 top-2 text-[#8A8A8A] hover:text-[#0A0A0A]"
                  aria-label={verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {verClave ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button
                type="button"
                onClick={() => { setPassword(generarClave()); setVerClave(true); }}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#FAFAFA] hover:bg-[#F2F2F2] text-[#EA580C] border border-[#E0E0E0] rounded-lg font-medium whitespace-nowrap"
              >
                <Wand2 className="w-3.5 h-3.5" />
                Generar
              </button>
            </div>
            {errores.password && <p className="mt-1 text-[11px] text-[#DC2626]">{errores.password}</p>}
            <p className="mt-1 text-[11px] text-[#6B6B6B]">Entrégasela a la persona: la aplicación no la vuelve a mostrar, solo guarda una versión cifrada.</p>
          </div>

          <div className="pt-4 border-t border-[#E8E8E8] flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-medium text-[#6B6B6B] hover:text-[#0A0A0A]">Cancelar</button>
            <button type="submit" disabled={guardando}
              className="flex items-center gap-1.5 px-5 py-2 bg-[#EA580C] hover:bg-[#C2410C] disabled:opacity-60 text-white text-xs font-medium rounded-lg">
              {guardando ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>{guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Crear acceso'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
