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
    { id: 'reportes', label: 'Libro de Actas & Informes', icon: FileText, badge: null },
  ];

  const navItems = todosLosItems.filter((item) => {
    const requerida = VISTAS[item.id];
    return !requerida || puede(activeRole, requerida);
  });

  return (
    <aside 
      id="main-sidebar"
      className="w-68 bg-[#0F172A] text-[#F6F8FB] flex flex-col h-screen border-r border-[#1E293B] shrink-0 select-none z-30 transition-all"
    >
      <div className="p-5 border-b border-[#1E293B]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#1E293B] border border-[#334155] flex items-center justify-center text-[#A5B4FC] shadow-xs">
            <Cross className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg font-bold tracking-wide text-white">MISION<span className="text-[#A5B4FC]">TEC</span></span>
            </div>
            <p className="text-[11px] text-[#CBD5E1] font-light tracking-wide italic">«Cuidado Pastoral & Misiones»</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 bg-[#0B1222] border-b border-[#1E293B]">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-medium uppercase tracking-widest text-[#94A3B8] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#A5B4FC]" />
            Ministerio / Rol
          </span>
          <span className="text-[10px] bg-[#4F46E5] text-[#CBD5E1] px-1.5 py-0.5 rounded border border-[#475569]">
            Nivel {infoRol(activeRole).nivel}
          </span>
        </div>
        <select
          id="rbac-role-selector"
          value={activeRole}
          onChange={(e) => onRoleChange(e.target.value as UserRole)}
          className="w-full bg-[#162033] border border-[#334155] text-xs text-[#F6F8FB] rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#A5B4FC] cursor-pointer font-medium"
        >
          {ROLES.map((r) => (
            <option key={r.clave} value={r.clave}$1>
              {r.nombre}
            </option>
          ))}
        </select>
        <p className="mt-2 text-[10px] leading-snug text-[#94A3B8]">{infoRol(activeRole).descripcion}</p>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#94A3B8]">
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
                  ? 'bg-[#F6F8FB] text-[#0F172A] font-semibold shadow-xs'
                  : 'text-[#D8DFEA] hover:text-white hover:bg-[#1E293B]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#4F46E5]' : 'text-[#94A3B8]'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              
              {item.badge && (
                <span 
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium leading-tight ${
                    item.badgeColor || (isActive ? 'bg-[#E0E7FF] text-[#3730A3]' : 'bg-[#1E293B] text-[#D8DFEA]')
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="pt-4 mt-3 border-t border-[#1E293B]">
          <button
            id="btn-open-sys-architecture"
            onClick={onOpenArchitectureModal}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium bg-[#162033] border border-[#334155] text-[#CBD5E1] hover:text-white hover:border-[#A5B4FC] transition-colors"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#A5B4FC]" />
              <span>Ficha Técnica & Modelo</span>
            </div>
            <Info className="w-3.5 h-3.5 text-[#94A3B8]" />
          </button>
        </div>
      </div>

      <div className="p-3 border-t border-[#1E293B] bg-[#0B1222]">
        <div className="mb-2.5 px-2 py-1.5 rounded bg-[#162033] border border-[#263449]">
          <p className="text-[10px] italic text-[#CBD5E1] leading-tight text-center">
            «Apacienta mis ovejas»
            <span className="block text-[9px] text-[#94A3B8] not-italic mt-0.5">— Juan 21:17</span>
          </p>
        </div>

        <div className="flex items-center justify-between p-1.5 rounded-lg">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-[#334155] border border-[#475569] flex items-center justify-center text-xs font-bold text-[#F6F8FB]">
              JD
            </div>
            <div className="min-w-0 text-left">
              <p className="text-xs font-medium text-[#F6F8FB] truncate">Hno. Juan Diego</p>
              <p className="text-[10px] text-[#94A3B8] truncate">{infoRol(activeRole).nombre}</p>
            </div>
          </div>
          <button 
            id="btn-sidebar-logout"
            onClick={() => alert("Sesión demostrativa activa. Puede alternar roles en el menú superior para evaluar permisos.")}
            className="p-1 text-[#94A3B8] hover:text-[#A5B4FC] rounded transition-colors" 
            title="Cerrar sesión"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

