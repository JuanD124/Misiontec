import React, { useState, useEffect } from 'react';
import { 
  INITIAL_PEOPLE, 
  INITIAL_GROUPS, 
  INITIAL_FOLLOW_UPS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_EVENTS, 
  INITIAL_AUDIT_LOGS 
} from './data/mockData';
import { 
  Person, 
  MissionaryGroup, 
  FollowUpRecord, 
  NotificationItem, 
  UserRole, 
  DiscipleshipPhase, 
  TrafficLightStatus,
  AuditLog
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
  // Master state
  const [people, setPeople] = useState<Person[]>(INITIAL_PEOPLE);
  const [groups, setGroups] = useState<MissionaryGroup[]>(INITIAL_GROUPS);
  const [followUps, setFollowUps] = useState<FollowUpRecord[]>(INITIAL_FOLLOW_UPS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [events] = useState(INITIAL_EVENTS);

  // UI state
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [activeRole, setActiveRole] = useState<UserRole>('admin');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [dashboardStatusFilter, setDashboardStatusFilter] = useState<'all' | TrafficLightStatus>('all');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Modals state
  const [isNewPersonModalOpen, setIsNewPersonModalOpen] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [followUpPersonId, setFollowUpPersonId] = useState<string | undefined>(undefined);
  const [selectedPersonForDetail, setSelectedPersonForDetail] = useState<Person | null>(null);
  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState(false);

  // Sync dark mode class with root html
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

  // RBAC Role Change Handler
  const handleRoleChange = (newRole: UserRole) => {
    setActiveRole(newRole);
    showToast(`Rol cambiado a: ${newRole.toUpperCase()} para demostración de permisos RBAC.`, 'info');
  };

  // Filtered dataset by selected district
  const filteredPeople = selectedDistrict === 'all' 
    ? people 
    : people.filter(p => {
        const group = groups.find(g => g.id === p.groupId);
        return group?.district === selectedDistrict || p.district.includes(selectedDistrict);
      });

  const filteredGroups = selectedDistrict === 'all'
    ? groups
    : groups.filter(g => g.district === selectedDistrict);

  // Quick Attendance Save & Auto Recalculate Traffic Light
  const handleSaveAttendance = (
    groupId: string, 
    date: string, 
    attendanceMap: Record<string, 'presente' | 'falta_justificada' | 'falta_injustificada'>
  ) => {
    setPeople(prev => prev.map(person => {
      if (person.groupId !== groupId) return person;

      const statusInSession = attendanceMap[person.id];
      if (!statusInSession) return person;

      let newAbsences = person.consecutiveAbsences;
      let newStatus = person.status;

      if (statusInSession === 'presente') {
        newAbsences = 0;
        newStatus = 'green';
      } else if (statusInSession === 'falta_injustificada') {
        newAbsences += 1;
        if (newAbsences >= 3) {
          newStatus = 'red';
        } else if (newAbsences === 2) {
          newStatus = 'yellow';
        }
      }

      return {
        ...person,
        consecutiveAbsences: newAbsences,
        lastAttendanceDate: statusInSession === 'presente' ? date : person.lastAttendanceDate,
        status: newStatus
      };
    }));

    // Register Audit Log
    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userName: 'Ing. Juan Diego',
      userRole: activeRole,
      action: 'REGISTRO_ASISTENCIA',
      entity: 'Asistencias',
      details: `Guardó asistencia para el grupo ${groupId} fecha ${date}.`,
      ipAddress: '190.237.45.12'
    };
    setAuditLogs(prev => [newLog, ...prev]);

    showToast('Asistencia guardada y semáforo de riesgo recalculado automáticamente.');
  };

  // Add new person
  const handleAddPerson = (newPersonData: Omit<Person, 'id' | 'code' | 'status' | 'consecutiveAbsences' | 'daysSinceLastContact'>) => {
    const nextId = `per-${Date.now()}`;
    const nextCode = `MIS-2026-${String(people.length + 1).padStart(3, '0')}`;

    const newPerson: Person = {
      ...newPersonData,
      id: nextId,
      code: nextCode,
      status: 'green',
      consecutiveAbsences: 0,
      daysSinceLastContact: 0
    };

    setPeople(prev => [newPerson, ...prev]);

    // Update group member count
    setGroups(prev => prev.map(g => {
      if (g.id === newPerson.groupId) {
        return { ...g, memberCount: g.memberCount + 1 };
      }
      return g;
    }));

    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userName: 'Ing. Juan Diego',
      userRole: activeRole,
      action: 'ALTA_MIEMBRO',
      entity: 'Personas',
      details: `Incorporó a ${newPerson.fullName} al grupo ${newPerson.groupName}.`,
      ipAddress: '190.237.45.12'
    };
    setAuditLogs(prev => [newLog, ...prev]);

    showToast(`Miembro "${newPerson.fullName}" registrado exitosamente con código ${nextCode}.`);
  };

  // Follow-up save
  const handleSaveFollowUp = (followUpData: Omit<FollowUpRecord, 'id'>, resultingStatus: TrafficLightStatus) => {
    const newRecord: FollowUpRecord = {
      ...followUpData,
      id: `fol-${Date.now()}`
    };

    setFollowUps(prev => [newRecord, ...prev]);

    // Update person status & days since contact
    setPeople(prev => prev.map(p => {
      if (p.id === followUpData.personId) {
        return {
          ...p,
          status: resultingStatus,
          lastFollowUpDate: followUpData.date,
          daysSinceLastContact: 0,
          consecutiveAbsences: resultingStatus === 'green' ? 0 : p.consecutiveAbsences
        };
      }
      return p;
    }));

    // Register Audit Log
    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userName: 'Ing. Juan Diego',
      userRole: activeRole,
      action: 'REGISTRO_SEGUIMIENTO',
      entity: 'Seguimientos Pastorales',
      details: `Atención pastoral para ${followUpData.personName} (${followUpData.channel}). Nuevo estado: ${resultingStatus.toUpperCase()}.`,
      ipAddress: '190.237.45.12'
    };
    setAuditLogs(prev => [newLog, ...prev]);

    showToast(`Seguimiento pastoral registrado para ${followUpData.personName}. Semáforo actualizado.`);
  };

  // Promote person phase
  const handlePromotePerson = (personId: string, nextPhase: DiscipleshipPhase) => {
    setPeople(prev => prev.map(p => {
      if (p.id === personId) {
        return {
          ...p,
          phase: nextPhase
        };
      }
      return p;
    }));

    const targetPerson = people.find(p => p.id === personId);
    showToast(`¡${targetPerson?.fullName || 'Miembro'} fue promovido a la fase: ${nextPhase.toUpperCase()}!`, 'success');
  };

  const handleOpenFollowUp = (personId?: string) => {
    setFollowUpPersonId(personId);
    setIsFollowUpModalOpen(true);
  };

  const handleOpenPersonDetail = (person: Person) => {
    setSelectedPersonForDetail(person);
  };

  const criticalCount = people.filter(p => p.status === 'red').length;

  return (
    <div className="flex h-screen w-full bg-[#FAF7F2] text-[#2D1F17] font-sans antialiased overflow-hidden">
      {/* 1. Lateral Sidebar with RBAC selector */}
      <Sidebar
        currentView={currentView}
        onSelectView={(view) => setCurrentView(view)}
        activeRole={activeRole}
        onRoleChange={handleRoleChange}
        criticalAlertsCount={criticalCount}
        onOpenArchitectureModal={() => setIsArchitectureModalOpen(true)}
      />

      {/* Main App Canvas */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* 2. Top Header with global search, notifications, sync */}
        <Header
          searchQuery={globalSearch}
          onSearchChange={setGlobalSearch}
          notifications={notifications}
          onMarkNotificationAsRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))}
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
          onDistrictChange={setSelectedDistrict}
        />

        {/* 3. Main Dynamic Content View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 custom-scrollbar">
          {/* Default VIEW: DASHBOARD */}
          {currentView === 'dashboard' && (
            <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-150">
              {/* Pastoral Welcome & Context Banner */}
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

              {/* 1. Tarjetas KPI (Stats Cards) */}
              <StatsCards
                people={filteredPeople}
                groups={filteredGroups}
                onFilterByStatus={(status) => {
                  setDashboardStatusFilter(status);
                  const el = document.getElementById('dashboard-traffic-light-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              />

              {/* 2. Semáforo de Acompañamiento y Alertas (Core Module) */}
              <div id="dashboard-traffic-light-section">
                <TrafficLightTable
                  people={filteredPeople}
                  onOpenFollowUpModal={handleOpenFollowUp}
                  onOpenPersonDetailModal={handleOpenPersonDetail}
                  statusFilter={dashboardStatusFilter}
                  onStatusFilterChange={setDashboardStatusFilter}
                />
              </div>

              {/* 3. Mapa de Geolocalización de Grupos Misioneros */}
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

              {/* 4. Gráfico de Embudo / Fases de Discipulado */}
              <div>
                <DiscipleshipFunnel
                  people={filteredPeople}
                  onPromotePerson={handlePromotePerson}
                  onOpenPersonDetail={handleOpenPersonDetail}
                />
              </div>

              {/* 5. Módulo de Asistencia Rápida */}
              <div id="dashboard-attendance-section">
                <QuickAttendance
                  groups={filteredGroups}
                  people={filteredPeople}
                  onSaveAttendance={handleSaveAttendance}
                />
              </div>
            </div>
          )}

          {/* VIEW: PERSONAS */}
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

          {/* VIEW: GRUPOS & GEOLOCALIZACION */}
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

          {/* VIEW: DISCIPULADO */}
          {currentView === 'discipulado' && (
            <div className="max-w-7xl mx-auto animate-in fade-in duration-150">
              <DiscipleshipView
                people={filteredPeople}
                onPromotePerson={handlePromotePerson}
                onOpenPersonDetail={handleOpenPersonDetail}
              />
            </div>
          )}

          {/* VIEW: ASISTENCIA */}
          {currentView === 'asistencia' && (
            <div className="max-w-7xl mx-auto animate-in fade-in duration-150">
              <AttendanceView
                groups={filteredGroups}
                people={filteredPeople}
                onSaveAttendance={handleSaveAttendance}
              />
            </div>
          )}

          {/* VIEW: ALERTAS & SEMÁFORO */}
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

          {/* VIEW: EVENTOS */}
          {currentView === 'eventos' && (
            <div className="max-w-7xl mx-auto animate-in fade-in duration-150">
              <EventsView events={events} />
            </div>
          )}

          {/* VIEW: REPORTES & AUDITORÍA */}
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

      {/* Floating Toast Notification */}
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

      {/* MODAL 1: Registrar Nueva Persona */}
      <NewPersonModal
        isOpen={isNewPersonModalOpen}
        onClose={() => setIsNewPersonModalOpen(false)}
        groups={groups}
        onAddPerson={handleAddPerson}
      />

      {/* MODAL 2: Registrar Seguimiento Pastoral */}
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

      {/* MODAL 3: Ficha Detallada de Persona */}
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

      {/* MODAL 4: Ficha Técnica & Arquitectura de Software para Sustentación */}
      <SystemArchitectureModal
        isOpen={isArchitectureModalOpen}
        onClose={() => setIsArchitectureModalOpen(false)}
      />
    </div>
  );
}
