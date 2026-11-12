import React from 'react';
import { ShieldCheck, Plus, Pencil, UserX, Phone, Church, IdCard } from 'lucide-react';
import { Person, UserRole } from '../../types';
import { ROLES } from '../../data/roles';

interface TeamViewProps {
  team: Person[];
  sesionId: number;
  /** Solo el Pastor puede crear y cambiar accesos. */
  onCreate?: () => void;
  onEdit?: (person: Person) => void;
  onRemove?: (person: Person) => void;
  onOpenDetail: (person: Person) => void;
}

const SECCIONES: { rol: UserRole; titulo: string; singular: string; vacio: string }[] = [
  { rol: 'pastor', titulo: 'Pastores', singular: 'pastor', vacio: 'Todavía no hay pastores registrados.' },
  { rol: 'asistente', titulo: 'Asistentes pastorales', singular: 'asistente pastoral', vacio: 'Todavía no hay asistentes pastorales.' },
  { rol: 'discipulador', titulo: 'Discipuladores', singular: 'discipulador', vacio: 'Todavía no hay discipuladores. Al elegir el líder de un grupo, esa persona pasa a ser discipulador.' },
];

const ESTILO_ROL: Record<string, string> = {
  pastor: 'bg-[#0A0A0A] text-white border-[#0A0A0A]',
  asistente: 'bg-[#FFEDD5] text-[#9A3412] border-[#FDBA74]',
  discipulador: 'bg-[#F5F5F5] text-[#404040] border-[#E0E0E0]',
};

export const TeamView: React.FC<TeamViewProps> = ({ team, sesionId, onCreate, onEdit, onRemove, onOpenDetail }) => {
  const ordenados = [...team].sort((a, b) => a.fullName.localeCompare(b.fullName, 'es'));

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-4.5 rounded-xl border border-[#E8E8E8] shadow-xs">
        <div>
          <h1 className="text-lg font-serif font-bold text-[#0A0A0A] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#EA580C]" />
            Equipo pastoral
          </h1>
          <p className="text-xs text-[#6B6B6B] mt-0.5">
            Pastores, asistentes pastorales y discipuladores. Los discípulos están aparte, en su propio módulo.
            {onCreate ? ' Aquí el Pastor también decide quién entra a la aplicación y con qué rol.' : ''}
          </p>
        </div>
        {onCreate && (
          <button
            onClick={onCreate}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-medium rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo integrante</span>
          </button>
        )}
      </div>

      {SECCIONES.map((seccion) => {
        const info = ROLES.find((r) => r.clave === seccion.rol)!;
        const miembros = ordenados.filter((p) => p.accessRole === seccion.rol);
        return (
          <section key={seccion.rol} className="bg-white rounded-xl border border-[#E8E8E8] shadow-xs overflow-hidden" aria-labelledby={`equipo-${seccion.rol}`}>
            <div className="px-4 py-3 border-b border-[#E8E8E8] bg-[#FAFAFA]">
              <div className="flex items-center justify-between gap-2">
                <h2 id={`equipo-${seccion.rol}`} className="text-sm font-bold text-[#0A0A0A] flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-semibold ${ESTILO_ROL[seccion.rol]}`}>
                    <ShieldCheck className="w-3 h-3" />
                    Nivel {info.nivel}
                  </span>
                  {seccion.titulo}
                </h2>
                <span className="text-[11px] font-medium text-[#6B6B6B]">
                  {miembros.length} {miembros.length === 1 ? seccion.singular : seccion.titulo.toLowerCase()}
                </span>
              </div>
              <p className="text-[11px] text-[#6B6B6B] mt-1 leading-snug">{info.descripcion}</p>
            </div>

            {miembros.length === 0 ? (
              <p className="p-6 text-center text-xs text-[#8A8A8A] italic">{seccion.vacio}</p>
            ) : (
              <ul className="divide-y divide-[#F2F2F2]">
                {miembros.map((p) => {
                  const esUnoMismo = Number(p.id) === sesionId;
                  const grupos = p.ledGroups ?? [];
                  return (
                    <li key={p.id} className="p-4 flex flex-col lg:flex-row lg:items-center gap-3">
                      <button onClick={() => onOpenDetail(p)} className="flex items-center gap-3 min-w-0 flex-1 text-left">
                        <div className="w-10 h-10 rounded-full bg-[#EA580C] text-white flex items-center justify-center font-semibold text-sm shrink-0">
                          {p.fullName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#0A0A0A] truncate">
                            {p.fullName}
                            {esUnoMismo && <span className="ml-2 text-[10px] font-medium text-[#EA580C]">(tú)</span>}
                          </p>
                          <p className="text-[11px] text-[#6B6B6B] flex flex-wrap items-center gap-x-3 gap-y-0.5">
                            <span className="flex items-center gap-1"><IdCard className="w-3 h-3" />{p.code} · Doc. {p.dni}</span>
                            {p.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{p.phone}</span>}
                          </p>
                          {grupos.length > 0 && (
                            <p className="text-[11px] text-[#404040] mt-0.5 flex items-center gap-1">
                              <Church className="w-3 h-3 text-[#EA580C] shrink-0" />
                              <span className="truncate">Dirige: {grupos.join(', ')}</span>
                            </p>
                          )}
                        </div>
                      </button>

                      <span className={`self-start lg:self-center px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                        p.hasAccess ? 'bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]' : 'bg-[#F5F5F5] text-[#6B6B6B] border-[#E0E0E0]'
                      }`}>
                        {p.hasAccess ? 'Con acceso a la app' : 'Sin acceso a la app'}
                      </span>

                      {(onEdit || onRemove) && (
                        <div className="flex items-center gap-2">
                          {onEdit && (
                            <button
                              onClick={() => onEdit(p)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#EA580C] bg-[#FAFAFA] hover:bg-[#F2F2F2] border border-[#E0E0E0] rounded-lg"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              {p.hasAccess ? 'Editar acceso' : 'Dar acceso'}
                            </button>
                          )}
                          {onRemove && p.hasAccess && !esUnoMismo && (
                            <button
                              onClick={() => onRemove(p)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#B91C1C] hover:bg-[#FEF2F2] border border-[#FECACA] rounded-lg"
                            >
                              <UserX className="w-3.5 h-3.5" />
                              Quitar acceso
                            </button>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
};
