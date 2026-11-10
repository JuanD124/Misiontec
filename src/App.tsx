import React, { useState, useEffect } from 'react';
import { api, ErrorApi, DatosEvento, DatosGrupo, DatosAcceso } from './services/api';
import {
  Person,
  MissionaryGroup,
  NotificationItem,
  DiscipleshipPhase,
  TrafficLightStatus,
  MissionEvent,
  SesionUsuario,
  UserRole,
} from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { LoginScreen } from './components/LoginScreen';
import { StatsCards } from './components/StatsCards';
import { TrafficLightTable } from './components/TrafficLightTable';
import { InteractiveMap } from './components/InteractiveMap';
import { DiscipleshipFunnel } from './components/DiscipleshipFunnel';
import { QuickAttendance } from './components/QuickAttendance';
import { PersonFormModal } from './components/modals/PersonFormModal';
import { PersonDetailModal } from './components/modals/PersonDetailModal';
import { EventFormModal } from './components/modals/EventFormModal';
import { GroupFormModal } from './components/modals/GroupFormModal';
import { AccessFormModal } from './components/modals/AccessFormModal';
import { AccessView } from './components/views/AccessView';
import { EventAttendeesModal } from './components/modals/EventAttendeesModal';
import { SystemArchitectureModal } from './components/modals/SystemArchitectureModal';
import { ConfirmDialog, DatosConfirmacion } from './components/modals/ConfirmDialog';
import { puede, infoRol, vistaPermitida, primeraVista, Funcion } from './data/roles';
import { PeopleView } from './components/views/PeopleView';
import { GroupsView } from './components/views/GroupsView';
import { DiscipleshipView } from './components/views/DiscipleshipView';
import { AttendanceView } from './components/views/AttendanceView';
import { AlertsView } from './components/views/AlertsView';
import { EventsView } from './components/views/EventsView';
import { ReportsView } from './components/views/ReportsView';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const vistaInicial = (sesion: SesionUsuario) => {
  if (window.location.hash === '#informe-general' && vistaPermitida(sesion.rol, 'reportes')) return 'reportes';
  return primeraVista(sesion.rol);
};

export default function App() {
  const [sesion, setSesion] = useState<SesionUsuario | null>(null);
  const [comprobando, setComprobando] = useState(true);
  const [errorInicial, setErrorInicial] = useState<string | null>(null);

  const [people, setPeople] = useState<Person[]>([]);
  const [groups, setGroups] = useState<MissionaryGroup[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [events, setEvents] = useState<MissionEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [dashboardStatusFilter, setDashboardStatusFilter] = useState<'all' | TrafficLightStatus>('all');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const [personForm, setPersonForm] = useState<{ abierto: boolean; persona: Person | null }>({ abierto: false, persona: null });
  const [selectedPersonForDetail, setSelectedPersonForDetail] = useState<Person | null>(null);
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [groupForm, setGroupForm] = useState<{ abierto: boolean; grupo: MissionaryGroup | null }>({ abierto: false, grupo: null });
  const [accessForm, setAccessForm] = useState<{ abierto: boolean; persona: Person | null }>({ abierto: false, persona: null });
  const [eventForAttendees, setEventForAttendees] = useState<MissionEvent | null>(null);
  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState(false);
  const [confirmacion, setConfirmacion] = useState<DatosConfirmacion | null>(null);

  const comprobarSesion = () => {
    setComprobando(true);
    setErrorInicial(null);
    api.yo()
      .then((s) => {
        setSesion(s);
        setCurrentView(vistaInicial(s));
      })
      .catch((err) => {
        if (err instanceof ErrorApi && err.estado === 401) setSesion(null);
        else setErrorInicial('No se pudo conectar con el servidor. Intenta de nuevo en unos segundos.');
      })
      .finally(() => setComprobando(false));
  };

  useEffect(() => {
    comprobarSesion();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    if (!selectedPersonForDetail) return;
    const actualizada = people.find((p) => p.id === selectedPersonForDetail.id);
    if (actualizada && actualizada !== selectedPersonForDetail) setSelectedPersonForDetail(actualizada);
  }, [people]);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const sesionExpirada = (err: unknown) => {
    if (err instanceof ErrorApi && err.estado === 401) {
      setSesion(null);
      return true;
    }
    return false;
  };

  const loadData = async () => {
    try {
      const data = await api.cargarTodo();
      setPeople(data.people);
      setGroups(data.groups);
      setNotifications(data.notifications);
      setEvents(data.events);
      setLoadError(null);
    } catch (err) {
      if (!sesionExpirada(err)) setLoadError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sesion) {
      setLoading(true);
      loadData();
    }
  }, [sesion?.id]);

  const entrar = (s: SesionUsuario) => {
    setSesion(s);
    setCurrentView(vistaInicial(s));
    setMenuAbierto(false);
  };

  const salir = async () => {
    await api.logout().catch(() => undefined);
    setSesion(null);
    setPeople([]);
    setGroups([]);
    setNotifications([]);
    setEvents([]);
    setSelectedPersonForDetail(null);
    setPersonForm({ abierto: false, persona: null });
    setMenuAbierto(false);
    setSelectedDistrict('all');
    setGlobalSearch('');
  };

  const selectView = (vista: string) => {
    setCurrentView(vista);
    setMenuAbierto(false);
  };

  if (comprobando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-[#404040] text-sm">
        Cargando MISIONTEC…
      </div>
    );
  }

  if (errorInicial) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6">
        <div className="max-w-sm w-full border border-[#E8E8E8] rounded-xl p-6 text-sm text-[#0A0A0A] space-y-3 text-center">
          <h2 className="font-bold text-base">Sin conexión con el servidor</h2>
          <p className="text-[#6B6B6B]">{errorInicial}</p>
          <button onClick={comprobarSesion} className="px-4 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-lg text-xs font-medium">Reintentar</button>
        </div>
      </div>
    );
  }

  if (!sesion) {
    return <LoginScreen onLogin={entrar} />;
  }

  const rol = sesion.rol;
  const can = (funcion: Funcion) => puede(rol, funcion);

  const districts = Array.from(new Set(groups.map(g => g.district))).sort();

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
      if (!sesionExpirada(err)) showToast(`No se pudo guardar la asistencia: ${(err as Error).message}`, 'error');
    }
  };

  const handleSavePerson = async (data: Partial<Person>, personId?: string) => {
    try {
      if (personId) {
        await api.editarPersona(personId, data);
        await loadData();
        showToast('Los datos de la persona se actualizaron.');
      } else {
        const created = await api.crearPersona(data);
        await loadData();
        showToast(`Discípulo "${created.fullName}" registrado con el código ${created.code}.`);
      }
    } catch (err) {
      sesionExpirada(err);
      throw err;
    }
  };

  const handleSetAccess = async (personId: string, clave: string, rolNuevo: UserRole) => {
    try {
      await api.definirAcceso(personId, clave, rolNuevo);
      await loadData();
    } catch (err) {
      sesionExpirada(err);
      throw err;
    }
  };

  const handleRemoveAccess = async (personId: string) => {
    try {
      await api.quitarAcceso(personId);
      await loadData();
    } catch (err) {
      sesionExpirada(err);
      throw err;
    }
  };

  const handleCreateAccess = async (data: DatosAcceso) => {
    try {
      await api.crearAcceso(data);
      await loadData();
      showToast(`Acceso creado para ${data.fullName} como ${infoRol(data.role).nombre}. Entra con su documento y la contraseña que definiste.`);
    } catch (err) {
      sesionExpirada(err);
      throw err;
    }
  };

  const handleUpdateAccess = async (personId: string, clave: string, rolNuevo: UserRole) => {
    try {
      await api.definirAcceso(personId, clave, rolNuevo);
      await loadData();
      showToast(`El acceso quedó como ${infoRol(rolNuevo).nombre}.`);
    } catch (err) {
      sesionExpirada(err);
      throw err;
    }
  };

  const handleConfirmRemoveAccess = (persona: Person) => {
    setConfirmacion({
      titulo: `¿Quitar el acceso a ${persona.fullName}?`,
      mensaje: 'Ya no podrá iniciar sesión. La persona se conserva en el padrón y puedes volver a darle acceso cuando quieras.',
      textoConfirmar: 'Sí, quitar acceso',
      accion: async () => {
        try {
          await api.quitarAcceso(persona.id);
          await loadData();
          showToast(`Se quitó el acceso a ${persona.fullName}.`);
        } catch (err) {
          if (!sesionExpirada(err)) showToast(`No se pudo quitar el acceso: ${(err as Error).message}`, 'error');
        }
      },
    });
  };

  const handleSaveGroup = async (data: DatosGrupo, groupId?: string) => {
    try {
      if (groupId) {
        await api.editarGrupo(groupId, data);
        await loadData();
        showToast('El grupo se actualizó.');
      } else {
        await api.crearGrupo(data);
        await loadData();
        showToast(`El grupo "${data.name}" fue creado con su ubicación.`);
      }
    } catch (err) {
      sesionExpirada(err);
      throw err;
    }
  };

  const handleDeleteGroup = (grupo: MissionaryGroup) => {
    setConfirmacion({
      titulo: `¿Eliminar el grupo "${grupo.name}"?`,
      mensaje: 'El grupo dejará de aparecer en el mapa y en las listas. Solo se puede eliminar si ya no tiene discípulos.',
      textoConfirmar: 'Sí, eliminar',
      accion: async () => {
        try {
          await api.eliminarGrupo(grupo.id);
          await loadData();
          showToast('El grupo fue eliminado.');
        } catch (err) {
          if (!sesionExpirada(err)) showToast(`No se pudo eliminar: ${(err as Error).message}`, 'error');
        }
      },
    });
  };

  const handlePromotePerson = async (personId: string, nextPhase: DiscipleshipPhase) => {
    const targetPerson = people.find(p => p.id === personId);
    try {
      await api.cambiarFase(personId, nextPhase);
      await loadData();
      showToast(`¡${targetPerson?.fullName || 'Miembro'} fue promovido a la fase: ${nextPhase.toUpperCase()}!`, 'success');
    } catch (err) {
      if (!sesionExpirada(err)) showToast(`No se pudo cambiar la fase: ${(err as Error).message}`, 'error');
    }
  };

  const handleCreateEvent = async (data: DatosEvento) => {
    try {
      await api.crearEvento(data);
      await loadData();
      showToast('El evento se creó correctamente.');
    } catch (err) {
      sesionExpirada(err);
      throw err;
    }
  };

  const handleSaveAttendees = async (eventId: string, personIds: number[]) => {
    try {
      await api.guardarAsistentesEvento(eventId, personIds);
      await loadData();
      showToast('Asistentes del evento guardados.');
    } catch (err) {
      sesionExpirada(err);
      throw err;
    }
  };

  const handleDeletePerson = (person: Person) => {
    setConfirmacion({
      titulo: `¿Eliminar a ${person.fullName}?`,
      mensaje: 'Se quitará del padrón, de los grupos y de las alertas. Se conserva su historial en la base de datos.',
      textoConfirmar: 'Sí, eliminar',
      accion: async () => {
        try {
          await api.desactivarPersona(person.id);
          setSelectedPersonForDetail(null);
          await loadData();
          showToast(`${person.fullName} fue eliminado del padrón.`);
        } catch (err) {
          if (!sesionExpirada(err)) showToast(`No se pudo eliminar: ${(err as Error).message}`, 'error');
        }
      },
    });
  };

  const handleDeleteEvent = (evento: MissionEvent) => {
    setConfirmacion({
      titulo: `¿Eliminar "${evento.title}"?`,
      mensaje: 'El encuentro dejará de aparecer en la lista de eventos.',
      textoConfirmar: 'Sí, eliminar',
      accion: async () => {
        try {
          await api.eliminarEvento(evento.id);
          await loadData();
          showToast('El encuentro fue eliminado.');
        } catch (err) {
          if (!sesionExpirada(err)) showToast(`No se pudo eliminar: ${(err as Error).message}`, 'error');
        }
      },
    });
  };

  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleOpenPersonDetail = (person: Person) => {
    setSelectedPersonForDetail(person);
  };

  const abrirNuevaPersona = () => setPersonForm({ abierto: true, persona: null });

  const criticalCount = people.filter(p => p.status === 'red').length;

  if (loading && people.length === 0 && groups.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-[#404040] text-sm">
        Cargando información de MISIONTEC…
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6">
        <div className="max-w-md bg-white border border-[#E8E8E8] rounded-xl p-6 text-sm text-[#0A0A0A] space-y-3">
          <h2 className="font-bold text-base">No se pudo conectar con la base de datos</h2>
          <p className="text-[#6B6B6B]">{loadError}</p>
          <p className="text-[#6B6B6B]">Verifica que MySQL esté encendido, que el archivo .env tenga la contraseña correcta y que la API esté corriendo (npm run dev).</p>
          <button onClick={() => { setLoading(true); loadData(); }} className="px-4 py-2 bg-[#EA580C] text-white rounded-lg text-xs">Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div id="app-root" className="flex h-screen w-full bg-white text-[#0A0A0A] font-sans antialiased overflow-hidden">
      <Sidebar
        currentView={currentView}
        onSelectView={selectView}
        usuario={sesion}
        onLogout={salir}
        criticalAlertsCount={criticalCount}
        peopleCount={people.length}
        groupsCount={groups.length}
        accessCount={people.filter((p) => p.hasAccess).length}
        abierto={menuAbierto}
        onCerrar={() => setMenuAbierto(false)}
        onOpenArchitectureModal={() => { setIsArchitectureModalOpen(true); setMenuAbierto(false); }}
      />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header
          searchQuery={globalSearch}
          onSearchChange={setGlobalSearch}
          notifications={can('verCuidado') ? notifications : []}
          onMarkNotificationAsRead={handleMarkNotificationAsRead}
          onSelectPersonFromSearch={(personId) => {
            const found = people.find(p => p.id === personId);
            if (found) setSelectedPersonForDetail(found);
          }}
          allPeople={can('verMiembros') ? people : []}
          allGroups={groups}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          onOpenMenu={() => setMenuAbierto(true)}
          onOpenNewPersonModal={abrirNuevaPersona}
          puedeRegistrar={can('registrarMiembro')}
          selectedDistrict={selectedDistrict}
          districts={districts}
          onDistrictChange={setSelectedDistrict}
        />

        <main className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 space-y-6 custom-scrollbar">
          {currentView === 'dashboard' && (
            <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-150">
              <div className="p-4 sm:p-4.5 bg-white border border-[#E8E8E8] rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-lg font-serif font-bold text-[#0A0A0A] tracking-tight">
                    Hola, {sesion.nombre.split(' ')[0]} • MISIONTEC
                  </h1>
                  <p className="text-xs text-[#6B6B6B] mt-0.5">
                    Consolidado de cobertura territorial, cuidado de discípulos en grupos y seguimiento discipular.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsArchitectureModalOpen(true)}
                    className="px-3.5 py-1.5 bg-[#FAFAFA] hover:bg-[#F2F2F2] text-[#EA580C] border border-[#E0E0E0] rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Info className="w-3.5 h-3.5 text-[#EA580C]" />
                    <span>Ficha Pastoral & Arquitectura</span>
                  </button>
                </div>
              </div>

              {can('verMiembros') && (
                <StatsCards
                  people={filteredPeople}
                  groups={filteredGroups}
                  onFilterByStatus={(status) => {
                    setDashboardStatusFilter(status);
                    const el = document.getElementById('dashboard-traffic-light-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                />
              )}

              {can('verCuidado') && (
                <div id="dashboard-traffic-light-section">
                  <TrafficLightTable
                    people={filteredPeople}
                    onOpenPersonDetailModal={handleOpenPersonDetail}
                    statusFilter={dashboardStatusFilter}
                    onStatusFilterChange={setDashboardStatusFilter}
                  />
                </div>
              )}

              {can('verGrupos') && (
                <div>
                  <InteractiveMap
                    groups={filteredGroups}
                    onQuickAttendanceForGroup={can('tomarAsistencia') ? () => {
                      const el = document.getElementById('dashboard-attendance-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    } : undefined}
                  />
                </div>
              )}

              {can('verDiscipulado') && (
                <div>
                  <DiscipleshipFunnel
                    people={filteredPeople}
                    onPromotePerson={can('promoverFase') ? handlePromotePerson : undefined}
                    onOpenPersonDetail={handleOpenPersonDetail}
                  />
                </div>
              )}

              {can('tomarAsistencia') && (
                <div id="dashboard-attendance-section">
                  <QuickAttendance
                    groups={filteredGroups}
                    people={filteredPeople}
                    onSaveAttendance={handleSaveAttendance}
                  />
                </div>
              )}
            </div>
          )}

          {currentView === 'personas' && (
            <div className="max-w-7xl mx-auto animate-in fade-in duration-150">
              <PeopleView
                people={filteredPeople}
                groups={filteredGroups}
                onOpenNewPersonModal={can('registrarMiembro') ? abrirNuevaPersona : undefined}
                onOpenPersonDetail={handleOpenPersonDetail}
              />
            </div>
          )}

          {currentView === 'grupos' && (
            <div className="max-w-7xl mx-auto animate-in fade-in duration-150">
              <GroupsView
                groups={filteredGroups}
                people={filteredPeople}
                onTakeAttendanceForGroup={can('tomarAsistencia') ? () => selectView('asistencia') : undefined}
                onCreateGroup={can('gestionarGrupos') ? () => setGroupForm({ abierto: true, grupo: null }) : undefined}
                onEditGroup={can('gestionarGrupos') ? (g) => setGroupForm({ abierto: true, grupo: g }) : undefined}
                onDeleteGroup={can('eliminar') ? handleDeleteGroup : undefined}
              />
            </div>
          )}

          {currentView === 'discipulado' && (
            <div className="max-w-7xl mx-auto animate-in fade-in duration-150">
              <DiscipleshipView
                people={filteredPeople}
                onPromotePerson={can('promoverFase') ? handlePromotePerson : undefined}
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
                onOpenPersonDetail={handleOpenPersonDetail}
              />
            </div>
          )}

          {currentView === 'eventos' && (
            <div className="max-w-7xl mx-auto animate-in fade-in duration-150">
              <EventsView
                events={events}
                onCreateEvent={can('gestionarEventos') ? () => setIsEventFormOpen(true) : undefined}
                onManageAttendees={can('tomarAsistencia') ? setEventForAttendees : undefined}
                onDeleteEvent={can('eliminar') ? handleDeleteEvent : undefined}
              />
            </div>
          )}

          {currentView === 'accesos' && can('gestionarAccesos') && (
            <div className="max-w-5xl mx-auto animate-in fade-in duration-150">
              <AccessView
                people={people}
                sesionId={sesion.id}
                onCreate={() => setAccessForm({ abierto: true, persona: null })}
                onEdit={(p) => setAccessForm({ abierto: true, persona: p })}
                onRemove={handleConfirmRemoveAccess}
              />
            </div>
          )}

          {currentView === 'reportes' && (
            <div className="max-w-7xl mx-auto animate-in fade-in duration-150">
              <ReportsView
                rolActivo={infoRol(rol).nombre}
                people={filteredPeople}
                groups={filteredGroups}
              />
            </div>
          )}
        </main>
      </div>

      {toastMessage && (
        <div className="no-print fixed bottom-4 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 z-[60] flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#0A0A0A] text-[#FAFAFA] shadow-xl border border-[#C2410C] text-xs font-medium animate-in fade-in slide-in-from-bottom-3 duration-200">
          {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#4ADE80] shrink-0" />}
          {toastMessage.type === 'info' && <Info className="w-4 h-4 text-[#FDBA74] shrink-0" />}
          {toastMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-[#F87171] shrink-0" />}
          <span className="flex-1">{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-[#A3A3A3] hover:text-[#FAFAFA]"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <PersonFormModal
        isOpen={personForm.abierto}
        onClose={() => setPersonForm({ abierto: false, persona: null })}
        groups={groups}
        personToEdit={personForm.persona}
        onSave={handleSavePerson}
      />

      <PersonDetailModal
        person={selectedPersonForDetail}
        onClose={() => setSelectedPersonForDetail(null)}
        onPromotePhase={can('promoverFase') ? handlePromotePerson : undefined}
        onEdit={can('registrarMiembro') ? (p) => { setSelectedPersonForDetail(null); setPersonForm({ abierto: true, persona: p }); } : undefined}
        onSetAccess={can('gestionarAccesos') ? handleSetAccess : undefined}
        onRemoveAccess={can('gestionarAccesos') ? handleRemoveAccess : undefined}
        onDelete={can('eliminar') ? handleDeletePerson : undefined}
      />

      <AccessFormModal
        isOpen={accessForm.abierto}
        onClose={() => setAccessForm({ abierto: false, persona: null })}
        people={people}
        personToEdit={accessForm.persona}
        sesionId={sesion.id}
        onCreate={handleCreateAccess}
        onUpdate={handleUpdateAccess}
      />

      <GroupFormModal
        isOpen={groupForm.abierto}
        onClose={() => setGroupForm({ abierto: false, grupo: null })}
        groups={groups}
        people={people}
        groupToEdit={groupForm.grupo}
        onSave={handleSaveGroup}
      />

      <EventFormModal
        isOpen={isEventFormOpen}
        onClose={() => setIsEventFormOpen(false)}
        groups={groups}
        onSave={handleCreateEvent}
      />

      <EventAttendeesModal
        event={eventForAttendees}
        people={people}
        onClose={() => setEventForAttendees(null)}
        onSave={handleSaveAttendees}
      />

      <SystemArchitectureModal
        isOpen={isArchitectureModalOpen}
        onClose={() => setIsArchitectureModalOpen(false)}
      />

      <ConfirmDialog datos={confirmacion} onCerrar={() => setConfirmacion(null)} />
    </div>
  );
}
