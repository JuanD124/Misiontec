import React from 'react';
import {
  Church,
  Users,
  MapPin,
  BookOpen,
  ClipboardCheck,
  HeartHandshake,
  Calendar,
  FileText,
  ShieldCheck,
  LogOut,
  Cross,
  Sparkles,
  Info,
  X,
} from 'lucide-react';
import { SesionUsuario } from '../types';
import { VISTAS, puede, infoRol } from '../data/roles';

interface SidebarProps {
  currentView: string;
  onSelectView: (view: string) => void;
  usuario: SesionUsuario;
  onLogout: () => void;
  criticalAlertsCount: number;
  peopleCount: number;
  groupsCount: number;
  abierto: boolean;
  onCerrar: () => void;
  onOpenArchitectureModal: () => void;
}

const iniciales = (nombre: string) =>
  nombre.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p.charAt(0).toUpperCase()).join('');

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  usuario,
  onLogout,
  criticalAlertsCount,
  peopleCount,
  groupsCount,
  abierto,
  onCerrar,
  onOpenArchitectureModal,
}) => {
  const rol = infoRol(usuario.rol);

  const todosLosItems = [
    { id: 'dashboard', label: 'Inicio Pastoral', icon: Church, badge: null },
    { id: 'personas', label: 'Rebaño & Miembros', icon: Users, badge: `${peopleCount} Hermanos` },
    { id: 'grupos', label: 'Grupos de Discipulado', icon: MapPin, badge: `${groupsCount} Grupos` },
    { id: 'discipulado', label: 'Formación & Discipulado', icon: BookOpen, badge: '4 Fases' },
    { id: 'asistencia', label: 'Registro de Asistencia', icon: ClipboardCheck, badge: null },
    {
      id: 'alertas',
      label: 'Cuidado Pastoral',
      icon: HeartHandshake,
      badge: criticalAlertsCount > 0 ? `${criticalAlertsCount} en Cuidado` : null,
      badgeColor: 'bg-[#DC2626] text-white',
    },
    { id: 'eventos', label: 'Encuentros & Misiones', icon: Calendar, badge: null },
    { id: 'reportes', label: 'Informes', icon: FileText, badge: null },
  ];

  const navItems = todosLosItems.filter((item) => {
    const requerida = VISTAS[item.id];
    return !requerida || puede(usuario.rol, requerida);
  });

  return (
    <>
      {abierto && <div className="no-print fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={onCerrar} aria-hidden="true" />}

      <aside
        id="main-sidebar"
        className={`fixed inset-y-0 left-0 z-40 w-72 max-w-[85vw] lg:static lg:z-30 lg:w-68 bg-[#0A0A0A] text-[#FAFAFA] flex flex-col h-screen border-r border-[#262626] shrink-0 select-none transition-transform duration-200 ${
          abierto ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="p-5 border-b border-[#262626] flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-[#262626] border border-[#404040] flex items-center justify-center text-[#FDBA74] shadow-xs shrink-0">
              <Cross className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="font-serif text-lg font-bold tracking-wide text-white">MISION<span className="text-[#FDBA74]">TEC</span></span>
              <p className="text-[11px] text-[#D4D4D4] font-light tracking-wide italic truncate">«Cuidado Pastoral & Misiones»</p>
            </div>
          </div>
          <button onClick={onCerrar} className="lg:hidden p-1.5 text-[#A3A3A3] hover:text-white rounded-lg" aria-label="Cerrar menú">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 py-3 bg-[#000000] border-b border-[#262626]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-medium uppercase tracking-widest text-[#A3A3A3] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#FDBA74]" />
              Tu rol
            </span>
            <span className="text-[10px] bg-[#EA580C] text-white px-1.5 py-0.5 rounded">Nivel {rol.nivel}</span>
          </div>
          <p className="text-sm font-semibold text-white">{rol.nombre}</p>
          <p className="mt-1 text-[10px] leading-snug text-[#A3A3A3]">{rol.descripcion}</p>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#A3A3A3]">
            Módulos
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                onClick={() => onSelectView(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition-all ${
                  isActive
                    ? 'bg-[#FAFAFA] text-[#0A0A0A] font-semibold shadow-xs'
                    : 'text-[#E0E0E0] hover:text-white hover:bg-[#262626]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#EA580C]' : 'text-[#A3A3A3]'}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium leading-tight shrink-0 ${
                      item.badgeColor || (isActive ? 'bg-[#FFEDD5] text-[#9A3412]' : 'bg-[#262626] text-[#E0E0E0]')
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-4 mt-3 border-t border-[#262626]">
            <button
              id="btn-open-sys-architecture"
              onClick={onOpenArchitectureModal}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium bg-[#1A1A1A] border border-[#404040] text-[#D4D4D4] hover:text-white hover:border-[#FDBA74] transition-colors"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#FDBA74]" />
                <span>Ficha Técnica & Modelo</span>
              </div>
              <Info className="w-3.5 h-3.5 text-[#A3A3A3]" />
            </button>
          </div>
        </div>

        <div className="p-3 border-t border-[#262626] bg-[#000000]">
          <div className="flex items-center justify-between p-1.5 rounded-lg gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#EA580C] flex items-center justify-center text-xs font-bold text-white shrink-0">
                {iniciales(usuario.nombre)}
              </div>
              <div className="min-w-0 text-left">
                <p className="text-xs font-medium text-[#FAFAFA] truncate">{usuario.nombre}</p>
                <p className="text-[10px] text-[#A3A3A3] truncate">{rol.nombre}</p>
              </div>
            </div>
            <button
              id="btn-sidebar-logout"
              onClick={onLogout}
              className="p-2 text-[#A3A3A3] hover:text-[#FDBA74] rounded transition-colors shrink-0"
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
