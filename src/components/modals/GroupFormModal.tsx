import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { X, Church, CheckCircle2, RefreshCw, Crosshair, Search, MapPin } from 'lucide-react';
import { MissionaryGroup, Person } from '../../types';
import { DatosGrupo } from '../../services/api';
import { infoRol } from '../../data/roles';

interface GroupFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: MissionaryGroup[];
  people: Person[];
  groupToEdit: MissionaryGroup | null;
  onSave: (data: DatosGrupo, groupId?: string) => Promise<void>;
}

const CENTRO_VILLAVICENCIO: L.LatLngTuple = [4.142, -73.626];
const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const ESTADO_A_BASE: Record<string, string> = { active: 'activo', watch: 'observacion', inactive: 'inactivo' };

const campo = (conError: boolean) =>
  `w-full px-3 py-2 bg-white border rounded-lg focus:outline-none text-[#0A0A0A] ${
    conError ? 'border-[#DC2626]' : 'border-[#E0E0E0] focus:border-[#EA580C]'
  }`;

const iconoPunto = L.divIcon({
  html: '<div style="width:28px;height:28px;border-radius:9999px;background:#EA580C;border:3px solid #fff;box-shadow:0 0 0 4px rgba(234,88,12,.3),0 2px 8px rgba(10,10,10,.4)"></div>',
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const numeroValido = (texto: string, min: number, max: number) => {
  if (texto.trim() === '') return null;
  const n = Number(texto);
  return Number.isFinite(n) && n >= min && n <= max ? n : null;
};

export const GroupFormModal: React.FC<GroupFormModalProps> = ({ isOpen, onClose, groups, people, groupToEdit, onSave }) => {
  const editando = Boolean(groupToEdit);

  const [name, setName] = useState('');
  const [district, setDistrict] = useState('');
  const [zone, setZone] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [address, setAddress] = useState('');
  const [meetingDay, setMeetingDay] = useState('Jueves');
  const [meetingTime, setMeetingTime] = useState('19:00');
  const [leaderId, setLeaderId] = useState('');
  const [assistantId, setAssistantId] = useState('');
  const [status, setStatus] = useState('activo');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [buscando, setBuscando] = useState(false);

  const contenedorRef = useRef<HTMLDivElement>(null);
  const mapaRef = useRef<L.Map | null>(null);
  const marcadorRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setName(groupToEdit?.name ?? '');
    setDistrict(groupToEdit?.district ?? '');
    setZone(groupToEdit?.zone ?? '');
    setNeighborhood(groupToEdit?.neighborhood ?? '');
    setAddress(groupToEdit?.address ?? '');
    setMeetingDay(groupToEdit?.meetingDay ?? 'Jueves');
    setMeetingTime(groupToEdit?.meetingTime ?? '19:00');
    setLeaderId(groupToEdit?.leaderId ?? '');
    setAssistantId(groupToEdit?.assistantId ?? '');
    setStatus(groupToEdit ? ESTADO_A_BASE[groupToEdit.status] ?? 'activo' : 'activo');
    setLat(groupToEdit ? String(groupToEdit.lat) : '');
    setLng(groupToEdit ? String(groupToEdit.lng) : '');
    setErrores({});
    setErrorGeneral(null);
    setAviso(null);
    setGuardando(false);
    setBuscando(false);
  }, [isOpen, groupToEdit]);

  useEffect(() => {
    if (!isOpen || !contenedorRef.current) return;
    const inicial: L.LatLngTuple | null = groupToEdit ? [groupToEdit.lat, groupToEdit.lng] : null;
    const mapa = L.map(contenedorRef.current).setView(inicial ?? CENTRO_VILLAVICENCIO, inicial ? 16 : 12);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
    }).addTo(mapa);
    mapa.on('click', (e: L.LeafletMouseEvent) => {
      setLat(e.latlng.lat.toFixed(6));
      setLng(e.latlng.lng.toFixed(6));
    });
    mapaRef.current = mapa;
    const pendiente = window.setTimeout(() => mapa.invalidateSize(), 200);
    return () => {
      window.clearTimeout(pendiente);
      mapa.remove();
      mapaRef.current = null;
      marcadorRef.current = null;
    };
  }, [isOpen, groupToEdit]);

  useEffect(() => {
    const mapa = mapaRef.current;
    if (!mapa) return;
    const la = numeroValido(lat, -90, 90);
    const lo = numeroValido(lng, -180, 180);
    if (la === null || lo === null) {
      marcadorRef.current?.remove();
      marcadorRef.current = null;
      return;
    }
    if (!marcadorRef.current) {
      marcadorRef.current = L.marker([la, lo], { icon: iconoPunto, draggable: true })
        .on('dragend', (e) => {
          const p = (e.target as L.Marker).getLatLng();
          setLat(p.lat.toFixed(6));
          setLng(p.lng.toFixed(6));
        })
        .addTo(mapa);
    } else {
      marcadorRef.current.setLatLng([la, lo]);
    }
  }, [lat, lng, isOpen, groupToEdit]);

  if (!isOpen) return null;

  const centrarEn = (la: number, lo: number, zoom = 17) => {
    setLat(la.toFixed(6));
    setLng(lo.toFixed(6));
    mapaRef.current?.setView([la, lo], zoom);
  };

  const usarMiUbicacion = () => {
    setAviso(null);
    if (!navigator.geolocation) {
      setAviso('Tu navegador no permite obtener la ubicación. Toca el mapa para marcarla.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => centrarEn(pos.coords.latitude, pos.coords.longitude),
      () => setAviso('No se pudo obtener tu ubicación (revisa el permiso del navegador). Toca el mapa para marcarla.'),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const buscarDireccion = async () => {
    setAviso(null);
    const consulta = [address, neighborhood, zone, district].map((t) => t.trim()).filter(Boolean).join(', ');
    if (!address.trim()) {
      setAviso('Escribe primero la dirección para poder buscarla en el mapa.');
      return;
    }
    setBuscando(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=co&q=${encodeURIComponent(`${consulta}, Colombia`)}`;
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      const datos: { lat: string; lon: string }[] = await res.json();
      if (datos.length === 0) {
        setAviso('No se encontró esa dirección. Toca el mapa para marcar el punto exacto.');
      } else {
        centrarEn(Number(datos[0].lat), Number(datos[0].lon), 17);
        setAviso('Ubicación encontrada. Si no es exacta, arrastra el punto o toca el mapa.');
      }
    } catch {
      setAviso('No se pudo buscar la dirección. Toca el mapa para marcar el punto.');
    } finally {
      setBuscando(false);
    }
  };

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (name.trim().length < 3) errs.name = 'Escribe el nombre del grupo (mínimo 3 letras).';
    if (!district.trim()) errs.district = 'Indica el distrito.';
    if (!zone.trim()) errs.zone = 'Indica la zona.';
    if (!address.trim()) errs.address = 'Escribe la dirección de reunión.';
    const la = numeroValido(lat, -90, 90);
    const lo = numeroValido(lng, -180, 180);
    if (la === null || lo === null) errs.ubicacion = 'Marca la ubicación en el mapa (o escribe la latitud y la longitud).';
    if (!meetingTime) errs.meetingTime = 'Elige la hora.';
    if (leaderId && leaderId === assistantId) errs.assistantId = 'El asistente debe ser distinto del líder.';
    setErrores(errs);
    if (Object.keys(errs).length > 0) return;

    setGuardando(true);
    setErrorGeneral(null);
    try {
      await onSave(
        {
          name: name.trim(), district: district.trim(), zone: zone.trim(), neighborhood: neighborhood.trim(),
          address: address.trim(), lat: la!, lng: lo!, meetingDay, meetingTime, leaderId, assistantId, status,
        },
        groupToEdit?.id,
      );
      onClose();
    } catch (err) {
      setErrorGeneral((err as Error).message);
    } finally {
      setGuardando(false);
    }
  };

  const distritos = Array.from(new Set(groups.map((g) => g.district).filter(Boolean)));
  const zonas = Array.from(new Set(groups.map((g) => g.zone).filter(Boolean)));
  const personas = [...people].sort((a, b) => a.fullName.localeCompare(b.fullName, 'es'));
  const etiquetaPersona = (p: Person) => `${p.fullName}${p.accessRole ? ` (${infoRol(p.accessRole).nombre})` : ''}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-[#0A0A0A]/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-[#E8E8E8] rounded-t-2xl sm:rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        <div className="p-4 sm:p-5 border-b border-[#E8E8E8] flex items-center justify-between bg-[#FAFAFA]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFEDD5] flex items-center justify-center">
              <Church className="w-5 h-5 text-[#EA580C]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0A0A0A]">{editando ? 'Editar grupo de comunión' : 'Nuevo grupo de comunión'}</h2>
              <p className="text-[11px] text-[#6B6B6B]">Solo el Pastor puede crear grupos y registrar su ubicación.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-[#8A8A8A] hover:text-[#0A0A0A] rounded-lg hover:bg-[#F2F2F2]" aria-label="Cerrar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={enviar} noValidate className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
          {errorGeneral && (
            <div role="alert" className="p-3 rounded-lg bg-[#FEE2E2] border border-[#FECACA] text-[#B91C1C] font-medium">{errorGeneral}</div>
          )}

          <div>
            <label className="block font-medium text-[#0A0A0A] mb-1">Nombre del grupo *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Grupo Emmanuel" className={campo(Boolean(errores.name))} />
            {errores.name && <p className="mt-1 text-[11px] text-[#DC2626]">{errores.name}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-[#0A0A0A] mb-1">Distrito *</label>
              <input type="text" list="lista-distritos" value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="Ej. Distrito Norte" className={campo(Boolean(errores.district))} />
              <datalist id="lista-distritos">{distritos.map((d) => <option key={d} value={d} />)}</datalist>
              {errores.district && <p className="mt-1 text-[11px] text-[#DC2626]">{errores.district}</p>}
            </div>
            <div>
              <label className="block font-medium text-[#0A0A0A] mb-1">Zona *</label>
              <input type="text" list="lista-zonas" value={zone} onChange={(e) => setZone(e.target.value)} placeholder="Ej. Zona Centro" className={campo(Boolean(errores.zone))} />
              <datalist id="lista-zonas">{zonas.map((z) => <option key={z} value={z} />)}</datalist>
              {errores.zone && <p className="mt-1 text-[11px] text-[#DC2626]">{errores.zone}</p>}
            </div>
            <div>
              <label className="block font-medium text-[#0A0A0A] mb-1">Barrio</label>
              <input type="text" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} placeholder="Opcional" className={campo(false)} />
            </div>
          </div>

          <div>
            <label className="block font-medium text-[#0A0A0A] mb-1">Dirección donde se reúne *</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Ej. Cra 40 # 26-15" className={campo(Boolean(errores.address))} />
            {errores.address && <p className="mt-1 text-[11px] text-[#DC2626]">{errores.address}</p>}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-medium text-[#0A0A0A] mb-1">Día *</label>
              <select value={meetingDay} onChange={(e) => setMeetingDay(e.target.value)} className={campo(false)}>
                {DIAS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-medium text-[#0A0A0A] mb-1">Hora *</label>
              <input type="time" value={meetingTime} onChange={(e) => setMeetingTime(e.target.value)} className={campo(Boolean(errores.meetingTime))} />
            </div>
            <div className="col-span-2">
              <label className="block font-medium text-[#0A0A0A] mb-1">Líder (Discipulador)</label>
              <select value={leaderId} onChange={(e) => setLeaderId(e.target.value)} className={campo(false)}>
                <option value="">Sin líder por ahora</option>
                {personas.map((p) => <option key={p.id} value={p.id}>{etiquetaPersona(p)}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-[#0A0A0A] mb-1">Asistente del grupo</label>
              <select value={assistantId} onChange={(e) => setAssistantId(e.target.value)} className={campo(Boolean(errores.assistantId))}>
                <option value="">Sin asistente</option>
                {personas.map((p) => <option key={p.id} value={p.id}>{etiquetaPersona(p)}</option>)}
              </select>
              {errores.assistantId && <p className="mt-1 text-[11px] text-[#DC2626]">{errores.assistantId}</p>}
            </div>
            {editando && (
              <div>
                <label className="block font-medium text-[#0A0A0A] mb-1">Estado del grupo</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className={campo(false)}>
                  <option value="activo">Activo</option>
                  <option value="observacion">En observación</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="font-medium text-[#0A0A0A] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#EA580C]" /> Ubicación del grupo en el mapa *
              </label>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={buscarDireccion} disabled={buscando}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#FAFAFA] hover:bg-[#F2F2F2] text-[#EA580C] border border-[#E0E0E0] rounded-lg font-medium disabled:opacity-60">
                  {buscando ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                  Buscar dirección
                </button>
                <button type="button" onClick={usarMiUbicacion}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#FAFAFA] hover:bg-[#F2F2F2] text-[#EA580C] border border-[#E0E0E0] rounded-lg font-medium">
                  <Crosshair className="w-3.5 h-3.5" />
                  Usar mi ubicación
                </button>
              </div>
            </div>

            <div ref={contenedorRef} className="h-60 w-full rounded-lg border border-[#E0E0E0] overflow-hidden z-0" />
            <p className="text-[11px] text-[#6B6B6B]">Toca el mapa para marcar el punto de reunión. Puedes arrastrar el punto para ajustarlo.</p>

            {aviso && <p className="text-[11px] font-medium text-[#854D0E] bg-[#FEF9C3] border border-[#FEF08A] rounded-lg px-3 py-2">{aviso}</p>}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-[#6B6B6B] mb-1">Latitud</label>
                <input type="text" inputMode="decimal" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="4.142000" className={campo(Boolean(errores.ubicacion))} />
              </div>
              <div>
                <label className="block text-[11px] text-[#6B6B6B] mb-1">Longitud</label>
                <input type="text" inputMode="decimal" value={lng} onChange={(e) => setLng(e.target.value)} placeholder="-73.626000" className={campo(Boolean(errores.ubicacion))} />
              </div>
            </div>
            {errores.ubicacion && <p className="text-[11px] text-[#DC2626]">{errores.ubicacion}</p>}
          </div>

          <div className="pt-4 border-t border-[#E8E8E8] flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-medium text-[#6B6B6B] hover:text-[#0A0A0A]">Cancelar</button>
            <button type="submit" disabled={guardando}
              className="flex items-center gap-1.5 px-5 py-2 bg-[#EA580C] hover:bg-[#C2410C] disabled:opacity-60 text-white text-xs font-medium rounded-lg">
              {guardando ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>{guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Crear grupo'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
