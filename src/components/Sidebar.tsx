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

interface SidebarProps {
  currentView: string;
  onSelectView: (view: string) => void;
  activeRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  criticalAlertsCount: number;
  onOpenArchitectureModal: () => void;
}

const ROLES: { key: UserRole; label: string; badge: string }[] = [
  { key: 'admin', label: 'Pastor Principal / Admin', badge: 'General' },
  { key: 'pastor_distrito', label: 'Pastor de Distrito', badge: 'Distrito' },
  { key: 'pastor_local', label: 'Pastor de Congregación', badge: 'Local' },
  { key: 'discipulador', label: 'Líder de Célula', badge: 'Discipulador' },
  { key: 'supervisor_zona', label: 'Supervisor Zonal', badge: 'Acompañamiento' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  activeRole,
  onRoleChange,
  criticalAlertsCount,
  onOpenArchitectureModal
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Inicio Pastoral', icon: Church, badge: null },
    { id: 'personas', label: 'Rebaño & Miembros', icon: Users, badge: '12 Hermanos' },
    { id: 'grupos', label: 'Células en Hogares', icon: MapPin, badge: '6 Hogares' },
    { id: 'discipulado', label: 'Formación & Discipulado', icon: BookOpen, badge: '4 Fases' },
    { id: 'asistencia', label: 'Registro de Asistencia', icon: ClipboardCheck, badge: null },
    { 
      id: 'alertas', 
      label: 'Cuidado Pastoral', 
      icon: HeartHandshake, 
      badge: criticalAlertsCount > 0 ? `${criticalAlertsCount} en Cuidado` : null,
      badgeColor: 'bg-[#9E382A] text-white'
    },
    { id: 'eventos', label: 'Encuentros & Misiones', icon: Calendar, badge: null },
    { id: 'reportes', label: 'Libro de Actas & Informes', icon: FileText, badge: null },
  ];

  return (
    <aside 
      id="main-sidebar"
      className="w-68 bg-[#2A1D15] text-[#FAF7F2] flex flex-col h-screen border-r border-[#3E2B20] shrink-0 select-none z-30 transition-all"
    >
      {/* Brand & Identity with Religious / Pastoral touch */}
      <div className="p-5 border-b border-[#3E2B20]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#3D2B1F] border border-[#5A4030] flex items-center justify-center text-[#D6A86C] shadow-xs">
            <Cross className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg font-bold tracking-wide text-white">MISION<span className="text-[#D6A86C]">TEC</span></span>
            </div>
            <p className="text-[11px] text-[#C4B2A3] font-light tracking-wide italic">«Cuidado Pastoral & Misiones»</p>
          </div>
        </div>
      </div>

      {/* Role Selector (Simpler, Clean Coffee Tone) */}
      <div className="px-4 py-3 bg-[#231710] border-b border-[#3E2B20]">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-medium uppercase tracking-widest text-[#B39F90] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D6A86C]" />
            Ministerio / Rol
          </span>
          <span className="text-[10px] bg-[#3B281C] text-[#E0CEBF] px-1.5 py-0.5 rounded border border-[#523A29]">
            {ROLES.find(r => r.key === activeRole)?.badge}
          </span>
        </div>
        <select
          id="rbac-role-selector"
          value={activeRole}
          onChange={(e) => onRoleChange(e.target.value as UserRole)}
          className="w-full bg-[#32231A] border border-[#4D3728] text-xs text-[#FAF7F2] rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#D6A86C] cursor-pointer font-medium"
        >
          {ROLES.map((r) => (
            <option key={r.key} value={r.key} className="bg-[#2A1D15] text-[#FAF7F2]">
              {r.label}
            </option>
          ))}
        </select>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#A89383]">
          Misterios & Módulos
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
                  ? 'bg-[#FAF7F2] text-[#2A1D15] font-semibold shadow-xs'
                  : 'text-[#D9CCC1] hover:text-white hover:bg-[#38261B]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#8C5D36]' : 'text-[#A89383]'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              
              {item.badge && (
                <span 
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium leading-tight ${
                    item.badgeColor || (isActive ? 'bg-[#EBDDCF] text-[#3D281B]' : 'bg-[#3E2B20] text-[#D9CCC1]')
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Academic / Technical sheet button */}
        <div className="pt-4 mt-3 border-t border-[#3E2B20]">
          <button
            id="btn-open-sys-architecture"
            onClick={onOpenArchitectureModal}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium bg-[#36251B] border border-[#4F3627] text-[#E0CEBF] hover:text-white hover:border-[#D6A86C] transition-colors"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#D6A86C]" />
              <span>Ficha Técnica & Modelo</span>
            </div>
            <Info className="w-3.5 h-3.5 text-[#A89383]" />
          </button>
        </div>
      </div>

      {/* Devotional verse / User footer */}
      <div className="p-3 border-t border-[#3E2B20] bg-[#231710]">
        <div className="mb-2.5 px-2 py-1.5 rounded bg-[#2D1E16] border border-[#422C20]">
          <p className="text-[10px] italic text-[#C7B6A7] leading-tight text-center">
            «Apacienta mis ovejas»
            <span className="block text-[9px] text-[#A69383] not-italic mt-0.5">— Juan 21:17</span>
          </p>
        </div>

        <div className="flex items-center justify-between p-1.5 rounded-lg">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-[#4A3425] border border-[#6B4E38] flex items-center justify-center text-xs font-bold text-[#FAF7F2]">
              JD
            </div>
            <div className="min-w-0 text-left">
              <p className="text-xs font-medium text-[#FAF7F2] truncate">Hno. Juan Diego</p>
              <p className="text-[10px] text-[#A89383] truncate">Coordinador Pastoral</p>
            </div>
          </div>
          <button 
            id="btn-sidebar-logout"
            onClick={() => alert("Sesión demostrativa activa. Puede alternar roles en el menú superior para evaluar permisos.")}
            className="p-1 text-[#A89383] hover:text-[#D6A86C] rounded transition-colors" 
            title="Cerrar sesión"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

