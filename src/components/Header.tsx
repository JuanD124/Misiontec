import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  Moon, 
  Sun, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  UserPlus, 
  HeartHandshake, 
  MapPin, 
  X,
  Radio,
  Menu,
  ChevronDown
} from 'lucide-react';
import { NotificationItem, Person, MissionaryGroup } from '../types';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  notifications: NotificationItem[];
  onMarkNotificationAsRead: (id: string) => void;
  onSelectPersonFromSearch: (personId: string) => void;
  allPeople: Person[];
  allGroups: MissionaryGroup[];
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenMenu: () => void;
  onOpenNewPersonModal: () => void;
  puedeRegistrar?: boolean;
  selectedDistrict: string;
  districts?: string[];
  onDistrictChange: (district: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  notifications,
  onMarkNotificationAsRead,
  onSelectPersonFromSearch,
  allPeople,
  allGroups,
  darkMode,
  onToggleDarkMode,
  onOpenMenu,
  onOpenNewPersonModal,
  puedeRegistrar = true,
  selectedDistrict,
  districts = [],
  onDistrictChange,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const newMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (newMenuRef.current && !newMenuRef.current.contains(event.target as Node)) {
        setShowNewMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredPeople = searchQuery.trim().length > 1
    ? allPeople.filter(p => 
        p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.dni.includes(searchQuery) ||
        p.groupName.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 4)
    : [];

  const filteredGroups = searchQuery.trim().length > 1
    ? allGroups.filter(g => 
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.zone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.leaderName.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 2)
    : [];

  const todayFormatted = new Intl.DateTimeFormat('es-CO', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date());

  return (
    <header 
      id="main-app-header"
      className="h-16 bg-[#FFFFFF] border-b border-[#E8E8E8] px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 sticky top-0 z-20 shadow-xs"
    >
      <button
        onClick={onOpenMenu}
        className="lg:hidden p-2 text-[#0A0A0A] rounded-lg hover:bg-[#F2F2F2] shrink-0"
        aria-label="Abrir menú"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex-1 max-w-xl relative" ref={searchRef}>
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-[#8A8A8A] absolute left-3 pointer-events-none" />
          <input
            id="global-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            placeholder="Buscar por nombre, documento, grupo o líder pastoral..."
            className="w-full pl-9 pr-8 py-2 bg-[#F5F5F5] border border-[#E0E0E0] text-[#0A0A0A] text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-[#EA580C] focus:bg-white transition-all placeholder:text-[#A3A3A3]"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 text-[#8A8A8A] hover:text-[#0A0A0A]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {searchFocused && (filteredPeople.length > 0 || filteredGroups.length > 0) && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-[#E8E8E8] rounded-xl shadow-lg p-2 z-50">
            {filteredPeople.length > 0 && (
              <div className="mb-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8A8A8A] px-2 py-1">Discípulos</p>
                {filteredPeople.map((person) => (
                  <button
                    key={person.id}
                    onClick={() => {
                      onSelectPersonFromSearch(person.id);
                      setSearchFocused(false);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#F5F5F5] text-left transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                        person.status === 'red' ? 'bg-[#DC2626]' : person.status === 'yellow' ? 'bg-[#CA8A04]' : 'bg-[#16A34A]'
                      }`}>
                        {person.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#0A0A0A]">{person.fullName}</p>
                        <p className="text-[10px] text-[#6B6B6B]">Doc.: {person.dni} • {person.groupName}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      person.status === 'red' ? 'bg-[#FEE2E2] text-[#B91C1C]' :
                      person.status === 'yellow' ? 'bg-[#FEF9C3] text-[#854D0E]' :
                      'bg-[#DCFCE7] text-[#166534]'
                    }`}>
                      {person.status === 'red' ? 'Atención' : person.status === 'yellow' ? 'Acompañamiento' : 'En Comunión'}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {filteredGroups.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8A8A8A] px-2 py-1">Grupos de Comunión</p>
                {filteredGroups.map((grp) => (
                  <div key={grp.id} className="p-2 rounded-lg hover:bg-[#F5F5F5] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#EA580C]" />
                      <div>
                        <p className="text-xs font-semibold text-[#0A0A0A]">{grp.name}</p>
                        <p className="text-[10px] text-[#6B6B6B]">{grp.zone} • Líder: {grp.leaderName}</p>
                      </div>
                    </div>
                    <span className="text-xs text-[#EA580C] font-semibold">{grp.memberCount} discípulos</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        <div className="hidden lg:flex items-center gap-1.5 bg-[#FAFAFA] border border-[#E8E8E8] px-2.5 py-1.5 rounded-lg text-xs">
          <MapPin className="w-3.5 h-3.5 text-[#EA580C]" />
          <span className="text-[11px] text-[#6B6B6B]">Zona:</span>
          <select
            id="header-district-select"
            value={selectedDistrict}
            onChange={(e) => onDistrictChange(e.target.value)}
            className="bg-transparent text-xs font-medium text-[#0A0A0A] focus:outline-none cursor-pointer"
          >
            <option value="all">Todas las Zonas</option>
            {districts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#FAFAFA] rounded-lg text-xs text-[#6B6B6B] border border-[#E8E8E8]">
          <Clock className="w-3.5 h-3.5 text-[#EA580C]" />
          <span className="text-[11px] capitalize font-medium">{todayFormatted}</span>
        </div>

        <div className="relative" ref={notifRef}>
          <button
            id="btn-notifications-bell"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-[#404040] hover:bg-[#FAFAFA] transition-colors"
            title="Avisos Pastorales"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#DC2626] rounded-full ring-2 ring-white" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#E8E8E8] rounded-xl shadow-xl p-0 z-50 overflow-hidden">
              <div className="p-3 bg-[#FAFAFA] border-b border-[#E8E8E8] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HeartHandshake className="w-4 h-4 text-[#EA580C]" />
                  <span className="text-xs font-serif font-bold text-[#0A0A0A]">Avisos de Cuidado Pastoral</span>
                </div>
                <span className="text-[10px] bg-[#FEF9C3] text-[#854D0E] font-semibold px-2 py-0.5 rounded-full">
                  {unreadCount} pendientes
                </span>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-[#F2F2F2]">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#8A8A8A] italic">
                    Paz y bendición. No hay avisos pendientes.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={`p-3 transition-colors ${notif.read ? 'opacity-60 bg-transparent' : 'bg-[#FAFAFA]'}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          {notif.severity === 'critical' ? (
                            <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                          ) : notif.severity === 'warning' ? (
                            <Clock className="w-4 h-4 text-[#CA8A04] shrink-0 mt-0.5" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                          )}
                          <div>
                            <p className="text-xs font-semibold text-[#0A0A0A] leading-snug">{notif.title}</p>
                            <p className="text-[11px] text-[#404040] mt-0.5 leading-relaxed">{notif.message}</p>
                            <div className="flex items-center gap-3 mt-1.5">
                              <span className="text-[10px] text-[#8A8A8A]">{notif.timeAgo}</span>
                              {notif.relatedPersonId && (
                                <button
                                  onClick={() => {
                                    onSelectPersonFromSearch(notif.relatedPersonId!);
                                    setShowNotifications(false);
                                  }}
                                  className="text-[10px] text-[#EA580C] font-semibold hover:underline"
                                >
                                  Ver Ficha
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {!notif.read && (
                          <button
                            onClick={() => onMarkNotificationAsRead(notif.id)}
                            className="text-[10px] text-[#8A8A8A] hover:text-[#0A0A0A]"
                            title="Marcar como atendido"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {puedeRegistrar && (
        <div className="relative" ref={newMenuRef}>
          <button
            id="btn-header-quick-action"
            onClick={() => setShowNewMenu(!showNewMenu)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-[#FAFAFA] text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#FDBA74]" />
            <span className="hidden sm:inline">Nuevo Registro</span>
            <ChevronDown className="w-3.5 h-3.5 ml-0.5 text-[#D4D4D4]" />
          </button>

          {showNewMenu && (
            <div className="absolute right-0 mt-1.5 w-56 bg-white border border-[#E8E8E8] rounded-xl shadow-xl p-1.5 z-50">
              <button
                id="menu-item-new-person"
                onClick={() => {
                  setShowNewMenu(false);
                  onOpenNewPersonModal();
                }}
                className="w-full flex items-center gap-2.5 p-2 rounded-lg text-xs font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] hover:text-[#EA580C] transition-colors"
              >
                <UserPlus className="w-4 h-4 text-[#EA580C]" />
                <div className="text-left">
                  <p className="font-semibold">Nuevo Discípulo</p>
                  <p className="text-[10px] text-[#6B6B6B]">Ingreso al rebaño</p>
                </div>
              </button>
            </div>
          )}
        </div>
        )}
      </div>
    </header>
  );
};
