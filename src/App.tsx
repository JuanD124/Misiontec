import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import { 
  Person, 
  MissionaryGroup, 
  FollowUpRecord, 
  NotificationItem, 
  UserRole, 
  DiscipleshipPhase, 
  TrafficLightStatus,
  AuditLog,
  MissionEvent
} from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { StatsCards } from './components/StatsCards';
import { TrafficLightTable } from './components/TrafficLightTable';
import { InteractiveMap } from './components/InteractiveMap';
import { DiscipleshipFunnel } from './components/DiscipleshipFunnel';
import { QuickAttendance } from './components/QuickAttendance';
import { NewPersonModal } from './components/modals/NewPersonModal';
import { FollowUpModal } from './components/modals/FollowUpModal';
import { PersonDetailModal } from './components/modals/PersonDetailModal';
import { SystemArchitectureModal } from './components/modals/SystemArchitectureModal';
import { PeopleView } from './components/views/PeopleView';
import { GroupsView } from './components/views/GroupsView';
import { DiscipleshipView } from './components/views/DiscipleshipView';
import { AttendanceView } from './components/views/AttendanceView';
import { AlertsView } from './components/views/AlertsView';
import { EventsView } from './components/views/EventsView';
import { ReportsView } from './components/views/ReportsView';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function App() {
  const [people, setPeople] = useState<Person[]>([]);
  const [groups, setGroups] = useState<MissionaryGroup[]>([]);
  const [followUps, setFollowUps] = useState<FollowUpRecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [events, setEvents] = useState<MissionEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [activeRole, setActiveRole] = useState<UserRole>('admin');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [dashboardStatusFilter, setDashboardStatusFilter] = useState<'all' | TrafficLightStatus>('all');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const [isNewPersonModalOpen, setIsNewPersonModalOpen] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [followUpPersonId, setFollowUpPersonId] = useState<string | undefined>(undefined);
  const [selectedPersonForDetail, setSelectedPersonForDetail] = useState<Person | null>(null);
  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    try {
      const data = await api.cargarTodo();
      setPeople(data.people);
      setGroups(data.groups);
      setFollowUps(data.followUps);
      setNotifications(data.notifications);
      setEvents(data.events);
      setAuditLogs(data.auditLogs);
      setLoadError(null);
    } catch (err) {
      setLoadError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const districts = Array.from(new Set(groups.map(g => g.district))).sort();

  const handleRoleChange = (newRole: UserRole) => {
    setActiveRole(newRole);
    showToast(`Rol cambiado a: ${newRole.toUpperCase()} para demostración de permisos RBAC.`, 'info');
  };

  const filteredPeople = selectedDistrict === 'all' 
    ? people 
    : people.filter(p => {
        const group = groups.find(g => g.id === p.groupId);
        return group?.district === selectedDistrict || p.district.includes(selectedDistrict);
      });

  const filteredGroups = selectedDistrict === 'all'
    ? groups
    : groups.filter(g => g.district === selectedDistrict);

  const handleSaveAttendance = async (
    groupId: string, 
    date: string, 
    attendanceMap: Record<string, 'presente' | 'falta_justificada' | 'falta_injustificada'>
  ) => {
    try {
      await api.registrarAsistencia(groupId, date, attendanceMap);
      await loadData();
      showToast('Asistencia guardada y semáforo de riesgo recalculado automáticamente.');
    } catch (err) {
      showToast(`No se pudo guardar la asistencia: ${(err as Error).message}`, 'error');
    }
  };

  const handleAddPerson = async (newPersonData: Omit<Person, 'id' | 'code' | 'status' | 'consecutiveAbsences' | 'daysSinceLastContact'>) => {
    try {
      const created = await api.crearPersona(newPersonData);
      await loadData();
      showToast(`Miembro "${created.fullName}" registrado exitosamente con código ${created.code}.`);
    } catch (err) {
      showToast(`No se pudo registrar la persona: ${(err as Error).message}`, 'error');
    }
  };

  const handleSaveFollowUp = async (followUpData: Omit<FollowUpRecord, 'id'>, resultingStatus: TrafficLightStatus) => {
    try {
      await api.registrarSeguimiento({ ...followUpData, resultingStatus });
      await loadData();
      showToast(`Seguimiento pastoral registrado para ${followUpData.personName}. Semáforo actualizado.`);
    } catch (err) {
      showToast(`No se pudo guardar el seguimiento: ${(err as Error).message}`, 'error');
    }
  };

  const handlePromotePerson = async (personId: string, nextPhase: DiscipleshipPhase) => {
    const targetPerson = people.find(p => p.id === personId);
    try {
      await api.cambiarFase(personId, nextPhase);
      await loadData();
      showToast(`¡${targetPerson?.fullName || 'Miembro'} fue promovido a la fase: ${nextPhase.toUpperCase()}!`, 'success');
    } catch (err) {
      showToast(`No se pudo cambiar la fase: ${(err as Error).message}`, 'error');
    }
  };

  const handleMarkNotificationAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try {
      await api.marcarAlertaLeida(id);
    } catch {
    }
  };

  const handleOpenFollowUp = (personId?: string) => {
    setFollowUpPersonId(personId);
    setIsFollowUpModalOpen(true);
  };

  const handleOpenPersonDetail = (person: Person) => {
    setSelectedPersonForDetail(person);
  };

  const criticalCount = people.filter(p => p.status === 'red').length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2] text-[#5C4535] text-sm">
        Cargando información de MISIONTEC…
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2] p-6">
        <div className="max-w-md bg-white border border-[#E8DFD7] rounded-xl p-6 text-sm text-[#2D1F17] space-y-3">
          <h2 className="font-bold text-base">No se pudo conectar con la base de datos</h2>
          <p className="text-[#7D6B5E]">{loadError}</p>
          <p className="text-[#7D6B5E]">Verifica que MySQL esté encendido, que el archivo .env tenga la contraseña correcta y que la API esté corriendo (npm run dev).</p>
          <button onClick={() => { setLoading(true); loadData(); }} className="px-4 py-2 bg-[#3B281C] text-white rounded-lg text-xs">Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#FAF7F2] text-[#2D1F17] font-sans antialiased overflow-hidden">
      <Sidebar
        currentView={currentView}
        onSelectView={(view) => setCurrentView(view)}
        activeRole={activeRole}
        onRoleChange={handleRoleChange}
        criticalAlertsCount={criticalCount}
        onOpenArchitectureModal={() => setIsArchitectureModalOpen(true)}
      />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header
          searchQuery={globalSearch}
          onSearchChange={setGlobalSearch}
          notifications={notifications}
          onMarkNotificationAsRead={handleMarkNotificationAsRead}
          onSelectPersonFromSearch={(personId) => {
            const found = people.find(p => p.id === personId);
            if (found) setSelectedPersonForDetail(found);
          }}
          allPeople={people}
          allGroups={groups}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          onOpenNewPersonModal={() => setIsNewPersonModalOpen(true)}
          onOpenFollowUpModal={handleOpenFollowUp}
          selectedDistrict={selectedDistrict}
          districts={districts}
          onDistrictChange={setSelectedDistrict}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 custom-scrollbar">
          {currentView === 'dashboard' && (
            <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-150">
              <div className="p-4.5 bg-white border border-[#E8DFD7] rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-lg font-serif font-bold text-[#2D1F17] tracking-tight">
                    MISIONTEC • Sistema Pastoral de Acompañamiento y Misión
                  </h1>
                  <p className="text-xs text-[#7D6B5E] mt-0.5">
                    Consolidado de cobertura territorial, cuidado de hermanos en células y seguimiento discipular.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsArchitectureModalOpen(true)}
                    className="px-3.5 py-1.5 bg-[#FAF7F2] hover:bg-[#F2ECE4] text-[#3B281C] border border-[#D9CCC1] rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Info className="w-3.5 h-3.5 text-[#8C5D36]" />
                    <span>Ficha Pastoral & Arquitectura</span>
                  </button>
                </div>
              </div>

              <StatsCards
                people={filteredPeople}
                groups={filteredGroups}
                onFilterByStatus={(status) => {
                  setDashboardStatusFilter(status);
                  const el = document.getElementById('dashboard-traffic-light-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              />

              <div id="dashboard-traffic-light-section">
                <TrafficLightTable
                  people={filteredPeople}
                  onOpenFollowUpModal={handleOpenFollowUp}
                  onOpenPersonDetailModal={handleOpenPersonDetail}
                  statusFilter={dashboardStatusFilter}
                  onStatusFilterChange={setDashboardStatusFilter}
                />
              </div>

              <div>
                <InteractiveMap
                  groups={filteredGroups}
                  onSelectGroup={(grp) => console.log('Selected group:', grp.name)}
                  onQuickAttendanceForGroup={(groupId) => {
                    const el = document.getElementById('dashboard-attendance-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                />
              </div>

              <div>
                <DiscipleshipFunnel
                  people={filteredPeople}
                  onPromotePerson={handlePromotePerson}
                  onOpenPersonDetail={handleOpenPersonDetail}
                />
              </div>

              <div id="dashboard-attendance-section">
                <QuickAttendance
                  groups={filteredGroups}
                  people={filteredPeople}
                  onSaveAttendance={handleSaveAttendance}
                />
              </div>
            </div>
          )}

          {currentView === 'personas' && (
            <div className="max-w-7xl mx-auto animate-in fade-in duration-150">
              <PeopleView
                people={filteredPeople}
                groups={filteredGroups}
                onOpenNewPersonModal={() => setIsNewPersonModalOpen(true)}
                onOpenFollowUpModal={handleOpenFollowUp}
                onOpenPersonDetail={handleOpenPersonDetail}
              />
            </div>
          )}

          {currentView === 'grupos' && (
            <div className="max-w-7xl mx-auto animate-in fade-in duration-150">
              <GroupsView
                groups={filteredGroups}
                people={filteredPeople}
                onTakeAttendanceForGroup={(groupId) => {
                  setCurrentView('asistencia');
                }}
              />
            </div>
          )}

          {currentView === 'discipulado' && (
            <div className="max-w-7xl mx-auto animate-in fade-in duration-150">
              <DiscipleshipView
                people={filteredPeople}
                onPromotePerson={handlePromotePerson}
                onOpenPersonDetail={handleOpenPersonDetail}
              />
            </div>
          )}

          {currentView === 'asistencia' && (
            <div className="max-w-7xl mx-auto animate-in fade-in duration-150">
              <AttendanceView
                groups={filteredGroups}
                people={filteredPeople}
                onSaveAttendance={handleSaveAttendance}
              />
            </div>
          )}

          {currentView === 'alertas' && (
            <div className="max-w-7xl mx-auto animate-in fade-in duration-150">
              <AlertsView
                people={filteredPeople}
                followUps={followUps}
                onOpenFollowUpModal={handleOpenFollowUp}
                onOpenPersonDetail={handleOpenPersonDetail}
              />
            </div>
          )}

          {currentView === 'eventos' && (
            <div className="max-w-7xl mx-auto animate-in fade-in duration-150">
              <EventsView events={events} />
            </div>
          )}

          {currentView === 'reportes' && (
            <div className="max-w-7xl mx-auto animate-in fade-in duration-150">
              <ReportsView
                auditLogs={auditLogs}
                people={filteredPeople}
                groups={filteredGroups}
              />
            </div>
          )}
        </main>
      </div>

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#2D1F17] text-[#FAF7F2] shadow-xl border border-[#6B4E3D] text-xs font-medium animate-in fade-in slide-in-from-bottom-3 duration-200">
          {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#8CBF84] shrink-0" />}
          {toastMessage.type === 'info' && <Info className="w-4 h-4 text-[#D9B48F] shrink-0" />}
          {toastMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-[#E68A80] shrink-0" />}
          <span>{toastMessage.text}</span>
          <button 
            onClick={() => setToastMessage(null)}
            className="ml-2 text-[#B8A18E] hover:text-[#FAF7F2]"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <NewPersonModal
        isOpen={isNewPersonModalOpen}
        onClose={() => setIsNewPersonModalOpen(false)}
        groups={groups}
        onAddPerson={handleAddPerson}
      />

      <FollowUpModal
        isOpen={isFollowUpModalOpen}
        onClose={() => {
          setIsFollowUpModalOpen(false);
          setFollowUpPersonId(undefined);
        }}
        people={people}
        preSelectedPersonId={followUpPersonId}
        onSaveFollowUp={handleSaveFollowUp}
      />

      <PersonDetailModal
        person={selectedPersonForDetail}
        onClose={() => setSelectedPersonForDetail(null)}
        followUps={followUps}
        onOpenFollowUpForThisPerson={(pId) => {
          setSelectedPersonForDetail(null);
          handleOpenFollowUp(pId);
        }}
        onPromotePhase={handlePromotePerson}
      />

      <SystemArchitectureModal
        isOpen={isArchitectureModalOpen}
        onClose={() => setIsArchitectureModalOpen(false)}
      />
    </div>
  );
}
