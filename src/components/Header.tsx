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
  onOpenNewPersonModal: () => void;
  onOpenFollowUpModal: (personId?: string) => void;
  selectedDistrict: string;
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
  onOpenNewPersonModal,
  onOpenFollowUpModal,
  selectedDistrict,
  onDistrictChange,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const newMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Handle outside clicks
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

  // Filter search results
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

  // Formatted date in Spanish
  const todayFormatted = new Intl.DateTimeFormat('es-PE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date());

  return (
    <header 
      id="main-app-header"
      className="h-16 bg-[#FFFFFF] border-b border-[#E8DFD7] px-6 flex items-center justify-between gap-4 sticky top-0 z-20 shadow-xs"
    >
      {/* Left: Global Search & Instant Results */}
      <div className="flex-1 max-w-xl relative" ref={searchRef}>
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-[#998576] absolute left-3 pointer-events-none" />
          <input
            id="global-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            placeholder="Buscar por nombre, DNI, célula o líder pastoral..."
            className="w-full pl-9 pr-8 py-2 bg-[#F7F2EB] border border-[#E2D5C7] text-[#2D1F17] text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8C5D36] focus:bg-white transition-all placeholder:text-[#9E8C7E]"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 text-[#998576] hover:text-[#2D1F17]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Instant Search Dropdown Results */}
        {searchFocused && (filteredPeople.length > 0 || filteredGroups.length > 0) && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-[#E8DFD7] rounded-xl shadow-lg p-2 z-50">
            {filteredPeople.length > 0 && (
              <div className="mb-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#998576] px-2 py-1">Miembros del Rebaño</p>
                {filteredPeople.map((person) => (
                  <button
                    key={person.id}
                    onClick={() => {
                      onSelectPersonFromSearch(person.id);
                      setSearchFocused(false);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#F7F2EB] text-left transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                        person.status === 'red' ? 'bg-[#9E382A]' : person.status === 'yellow' ? 'bg-[#B38646]' : 'bg-[#486341]'
                      }`}>
                        {person.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#2D1F17]">{person.fullName}</p>
                        <p className="text-[10px] text-[#7D6B5E]">DNI: {person.dni} • {person.groupName}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      person.status === 'red' ? 'bg-[#FBEBE9] text-[#8C3527]' :
                      person.status === 'yellow' ? 'bg-[#FAF2E1] text-[#946A1B]' :
                      'bg-[#EBF2E8] text-[#3D5636]'
                    }`}>
                      {person.status === 'red' ? 'Atención' : person.status === 'yellow' ? 'Acompañamiento' : 'En Comunión'}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {filteredGroups.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#998576] px-2 py-1">Células en Hogares</p>
                {filteredGroups.map((grp) => (
                  <div key={grp.id} className="p-2 rounded-lg hover:bg-[#F7F2EB] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#8C5D36]" />
                      <div>
                        <p className="text-xs font-semibold text-[#2D1F17]">{grp.name}</p>
                        <p className="text-[10px] text-[#7D6B5E]">{grp.zone} • Líder: {grp.leaderName}</p>
                      </div>
                    </div>
                    <span className="text-xs text-[#8C5D36] font-semibold">{grp.memberCount} hermanos</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* District Selector Filter */}
        <div className="hidden lg:flex items-center gap-1.5 bg-[#FAF7F2] border border-[#E8DFD7] px-2.5 py-1.5 rounded-lg text-xs">
          <MapPin className="w-3.5 h-3.5 text-[#8C5D36]" />
          <span className="text-[11px] text-[#7D6B5E]">Zona:</span>
          <select
            id="header-district-select"
            value={selectedDistrict}
            onChange={(e) => onDistrictChange(e.target.value)}
            className="bg-transparent text-xs font-medium text-[#2D1F17] focus:outline-none cursor-pointer"
          >
            <option value="all">Todas las Zonas</option>
            <option value="Distrito Metropolitano">Distrito Metropolitano</option>
            <option value="Distrito Central">Distrito Central</option>
            <option value="Distrito Sur">Distrito Sur</option>
            <option value="Distrito Este">Distrito Este</option>
            <option value="Distrito Callao">Distrito Callao</option>
          </select>
        </div>

        {/* Pastoral Date badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF7F2] rounded-lg text-xs text-[#7D6B5E] border border-[#E8DFD7]">
          <Clock className="w-3.5 h-3.5 text-[#8C5D36]" />
          <span className="text-[11px] capitalize font-medium">{todayFormatted}</span>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            id="btn-notifications-bell"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-[#634832] hover:bg-[#FAF7F2] transition-colors"
            title="Avisos Pastorales"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#9E382A] rounded-full ring-2 ring-white" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#E8DFD7] rounded-xl shadow-xl p-0 z-50 overflow-hidden">
              <div className="p-3 bg-[#FAF7F2] border-b border-[#E8DFD7] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HeartHandshake className="w-4 h-4 text-[#8C5D36]" />
                  <span className="text-xs font-serif font-bold text-[#2D1F17]">Avisos de Cuidado Pastoral</span>
                </div>
                <span className="text-[10px] bg-[#FAF2E1] text-[#946A1B] font-semibold px-2 py-0.5 rounded-full">
                  {unreadCount} pendientes
                </span>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-[#F2ECE4]">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#998576] italic">
                    Paz y bendición. No hay avisos pendientes.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={`p-3 transition-colors ${notif.read ? 'opacity-60 bg-transparent' : 'bg-[#FDFBF7]'}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          {notif.severity === 'critical' ? (
                            <AlertCircle className="w-4 h-4 text-[#9E382A] shrink-0 mt-0.5" />
                          ) : notif.severity === 'warning' ? (
                            <Clock className="w-4 h-4 text-[#B38646] shrink-0 mt-0.5" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-[#486341] shrink-0 mt-0.5" />
                          )}
                          <div>
                            <p className="text-xs font-semibold text-[#2D1F17] leading-snug">{notif.title}</p>
                            <p className="text-[11px] text-[#634832] mt-0.5 leading-relaxed">{notif.message}</p>
                            <div className="flex items-center gap-3 mt-1.5">
                              <span className="text-[10px] text-[#998576]">{notif.timeAgo}</span>
                              {notif.relatedPersonId && (
                                <button
                                  onClick={() => {
                                    onSelectPersonFromSearch(notif.relatedPersonId!);
                                    setShowNotifications(false);
                                  }}
                                  className="text-[10px] text-[#8C5D36] font-semibold hover:underline"
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
                            className="text-[10px] text-[#998576] hover:text-[#2D1F17]"
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

        {/* Fast Action Primary Button: Religious & Coffee style */}
        <div className="relative" ref={newMenuRef}>
          <button
            id="btn-header-quick-action"
            onClick={() => setShowNewMenu(!showNewMenu)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#3B281C] hover:bg-[#2C1E14] text-[#FAF7F2] text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#D6A86C]" />
            <span className="hidden sm:inline">Nuevo Registro</span>
            <ChevronDown className="w-3.5 h-3.5 ml-0.5 text-[#C4B2A3]" />
          </button>

          {showNewMenu && (
            <div className="absolute right-0 mt-1.5 w-56 bg-white border border-[#E8DFD7] rounded-xl shadow-xl p-1.5 z-50">
              <button
                id="menu-item-new-person"
                onClick={() => {
                  setShowNewMenu(false);
                  onOpenNewPersonModal();
                }}
                className="w-full flex items-center gap-2.5 p-2 rounded-lg text-xs font-medium text-[#2D1F17] hover:bg-[#F7F2EB] hover:text-[#8C5D36] transition-colors"
              >
                <UserPlus className="w-4 h-4 text-[#8C5D36]" />
                <div className="text-left">
                  <p className="font-semibold">Nuevo Miembro / Hermano</p>
                  <p className="text-[10px] text-[#7D6B5E]">Ingreso al rebaño</p>
                </div>
              </button>

              <button
                id="menu-item-new-followup"
                onClick={() => {
                  setShowNewMenu(false);
                  onOpenFollowUpModal();
                }}
                className="w-full flex items-center gap-2.5 p-2 rounded-lg text-xs font-medium text-[#2D1F17] hover:bg-[#F7F2EB] hover:text-[#486341] transition-colors"
              >
                <HeartHandshake className="w-4 h-4 text-[#486341]" />
                <div className="text-left">
                  <p className="font-semibold">Visita / Acompañamiento</p>
                  <p className="text-[10px] text-[#7D6B5E]">Cuidado pastoral</p>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
