import React from 'react';
import { KeyRound, Plus, Pencil, UserX, ShieldCheck } from 'lucide-react';
import { Person } from '../../types';
import { ROLES, infoRol } from '../../data/roles';

interface AccessViewProps {
  people: Person[];
  sesionId: number;
  onCreate: () => void;
  onEdit: (person: Person) => void;
  onRemove: (person: Person) => void;
}

const ESTILO_ROL: Record<string, string> = {
  pastor: 'bg-[#0A0A0A] text-white border-[#0A0A0A]',
  asistente: 'bg-[#FFEDD5] text-[#9A3412] border-[#FDBA74]',
  discipulador: 'bg-[#F5F5F5] text-[#404040] border-[#E0E0E0]',
};

export const AccessView: React.FC<AccessViewProps> = ({ people, sesionId, onCreate, onEdit, onRemove }) => {
  const conAcceso = people
    .filter((p) => p.hasAccess)
    .sort((a, b) => {
      const na = a.accessRole ? infoRol(a.accessRole).nivel : 9;
      const nb = b.accessRole ? infoRol(b.accessRole).nivel : 9;
      return na - nb || a.fullName.localeCompare(b.fullName, 'es');
    });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-4.5 rounded-xl border border-[#E8E8E8] shadow-xs">
        <div>
          <h1 className="text-lg font-serif font-bold text-[#0A0A0A] flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-[#EA580C]" />
            Accesos del equipo
          </h1>
          <p className="text-xs text-[#6B6B6B] mt-0.5">
            Aquí el Pastor decide quién puede entrar a la aplicación y con qué rol. Solo el Pastor ve esta pantalla.
          </p>
        </div>
        <button
          onClick={onCreate}
          className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-medium rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo acceso</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {ROLES.map((r) => (
          <div key={r.clave} className="p-3.5 bg-white rounded-xl border border-[#E8E8E8] shadow-xs">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-semibold ${ESTILO_ROL[r.clave]}`}>
                <ShieldCheck className="w-3 h-3" />
                {r.nombre}
              </span>
              <span className="text-[10px] text-[#8A8A8A]">{conAcceso.filter((p) => p.accessRole === r.clave).length} personas</span>
            </div>
            <p className="text-[11px] text-[#6B6B6B] leading-snug">{r.descripcion}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-[#E8E8E8] shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-[#E8E8E8] bg-[#FAFAFA] text-xs font-semibold text-[#0A0A0A]">
          Personas con acceso ({conAcceso.length})
        </div>
        {conAcceso.length === 0 ? (
          <p className="p-8 text-center text-xs text-[#8A8A8A] italic">Todavía no hay personas con acceso.</p>
        ) : (
          <ul className="divide-y divide-[#F2F2F2]">
            {conAcceso.map((p) => {
              const esUnoMismo = Number(p.id) === sesionId;
              return (
                <li key={p.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-full bg-[#EA580C] text-white flex items-center justify-center font-semibold text-sm shrink-0">
                      {p.fullName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#0A0A0A] truncate">
                        {p.fullName}
                        {esUnoMismo && <span className="ml-2 text-[10px] font-medium text-[#EA580C]">(tú)</span>}
                      </p>
                      <p className="text-[11px] text-[#6B6B6B]">Documento: {p.dni} · {p.code}</p>
                    </div>
                  </div>

                  {p.accessRole && (
                    <span className={`self-start sm:self-center px-2.5 py-1 rounded-full border text-[10px] font-semibold ${ESTILO_ROL[p.accessRole]}`}>
                      {infoRol(p.accessRole).nombre}
                    </span>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(p)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#EA580C] bg-[#FAFAFA] hover:bg-[#F2F2F2] border border-[#E0E0E0] rounded-lg"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Editar
                    </button>
                    {!esUnoMismo && (
                      <button
                        onClick={() => onRemove(p)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#B91C1C] hover:bg-[#FEF2F2] border border-[#FECACA] rounded-lg"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        Quitar acceso
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};
