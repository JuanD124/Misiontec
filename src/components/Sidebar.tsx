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
  Info
} from 'lucide-react';
import { UserRole } from '../types';
import { ROLES, VISTAS, puede, infoRol } from '../data/roles';

interface SidebarProps {
  currentView: string;
  onSelectView: (view: string) => void;
  activeRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  criticalAlertsCount: number;
  peopleCount: number;
  groupsCount: number;
  onOpenArchitectureModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  activeRole,
  onRoleChange,
  criticalAlertsCount,
  peopleCount,
  groupsCount,
  onOpenArchitectureModal
}) => {
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
      badgeColor: 'bg-[#DC2626] text-white'
    },
    { id: 'eventos', label: 'Encuentros & Misiones', icon: Calendar, badge: null },
    { id: 'reportes', label: 'Informes', icon: FileText, badge: null },
  ];

  const navItems = todosLosItems.filter((item) => {
    const requerida = VISTAS[item.id];
    return !requerida || puede(activeRole, requerida);
  });

  return (
    <aside 
      id="main-sidebar"
      className="w-68 bg-[#0A0A0A] text-[#FAFAFA] flex flex-col h-screen border-r border-[#262626] shrink-0 select-none z-30 transition-all"
    >
      <div className="p-5 border-b border-[#262626]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#262626] border border-[#404040] flex items-center justify-center text-[#FDBA74] shadow-xs">
            <Cross className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg font-bold tracking-wide text-white">MISION<span className="text-[#FDBA74]">TEC</span></span>
            </div>
            <p className="text-[11px] text-[#D4D4D4] font-light tracking-wide italic">«Cuidado Pastoral & Misiones»</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 bg-[#000000] border-b border-[#262626]">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-medium uppercase tracking-widest text-[#A3A3A3] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#FDBA74]" />
            Ministerio / Rol
          </span>
          <span className="text-[10px] bg-[#EA580C] text-[#D4D4D4] px-1.5 py-0.5 rounded border border-[#525252]">
            Nivel {infoRol(activeRole).nivel}
          </span>
        </div>
        <select
          id="rbac-role-selector"
          value={activeRole}
          onChange={(e) => onRoleChange(e.target.value as UserRole)}
          className="w-full bg-[#1A1A1A] border border-[#404040] text-xs text-[#FAFAFA] rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#FDBA74] cursor-pointer font-medium"
        >
          {ROLES.map((r) => (
            <option key={r.clave} value={r.clave}$1>
              {r.nombre}
            </option>
          ))}
        </select>
        <p className="mt-2 text-[10px] leading-snug text-[#A3A3A3]">{infoRol(activeRole).descripcion}</p>
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
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#EA580C]' : 'text-[#A3A3A3]'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              
              {item.badge && (
                <span 
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium leading-tight ${
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
        <div className="mb-2.5 px-2 py-1.5 rounded bg-[#1A1A1A] border border-[#2E2E2E]">
          <p className="text-[10px] italic text-[#D4D4D4] leading-tight text-center">
            «Apacienta mis ovejas»
            <span className="block text-[9px] text-[#A3A3A3] not-italic mt-0.5">— Juan 21:17</span>
          </p>
        </div>

        <div className="flex items-center justify-between p-1.5 rounded-lg">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-[#404040] border border-[#525252] flex items-center justify-center text-xs font-bold text-[#FAFAFA]">
              JD
            </div>
            <div className="min-w-0 text-left">
              <p className="text-xs font-medium text-[#FAFAFA] truncate">Hno. Juan Diego</p>
              <p className="text-[10px] text-[#A3A3A3] truncate">{infoRol(activeRole).nombre}</p>
            </div>
          </div>
          <button 
            id="btn-sidebar-logout"
            onClick={() => alert("Sesión demostrativa activa. Puede alternar roles en el menú superior para evaluar permisos.")}
            className="p-1 text-[#A3A3A3] hover:text-[#FDBA74] rounded transition-colors" 
            title="Cerrar sesión"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

