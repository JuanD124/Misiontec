import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Navigation,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Users,
  Clock,
  X,
  ExternalLink,
  Compass,
  Church
} from 'lucide-react';
import { MissionaryGroup } from '../types';

interface InteractiveMapProps {
  groups: MissionaryGroup[];
  onSelectGroup?: (group: MissionaryGroup) => void;
  onQuickAttendanceForGroup?: (groupId: string) => void;
}

const MAPAS_BASE = {
  streets: {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; Colaboradores de <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Imágenes &copy; Esri, Maxar, Earthstar Geographics',
  },
};

const CENTRO_VILLAVICENCIO: L.LatLngTuple = [4.142, -73.626];

const escapar = (texto: string) =>
  texto.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

const colorGrupo = (grp: MissionaryGroup) => {
  const critico = grp.status === 'watch' || grp.criticalMembersCount > 1;
  if (critico) return '#DC2626';
  return grp.averageAttendanceRate >= 85 ? '#16A34A' : '#CA8A04';
};

const iconoGrupo = (grp: MissionaryGroup, seleccionado: boolean) => {
  const tam = seleccionado ? 36 : 30;
  const sombra = seleccionado
    ? '0 0 0 5px rgba(234,88,12,.3), 0 3px 8px rgba(10,10,10,.4)'
    : '0 2px 6px rgba(10,10,10,.35)';
  const html = `
    <div style="position:relative;width:${tam}px;height:${tam}px">
      <div style="width:${tam}px;height:${tam}px;border-radius:9999px;background:${colorGrupo(grp)};border:2px solid #fff;box-shadow:${sombra};display:flex;align-items:center;justify-content:center;color:#fff;font:700 12px 'Plus Jakarta Sans',system-ui,sans-serif">${grp.memberCount}</div>
      <div style="position:absolute;left:50%;top:${tam + 3}px;transform:translateX(-50%);white-space:nowrap;text-align:center;font:600 10px 'Plus Jakarta Sans',system-ui,sans-serif;color:#0A0A0A;text-shadow:0 0 3px #fff,0 0 3px #fff,0 0 3px #fff">${escapar(grp.code)}</div>
    </div>`;
  return L.divIcon({ html, className: '', iconSize: [tam, tam], iconAnchor: [tam / 2, tam / 2] });
};

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  groups,
  onSelectGroup,
  onQuickAttendanceForGroup
}) => {
  const [selectedGroup, setSelectedGroup] = useState<MissionaryGroup | null>(groups[0] || null);
  const [searchRadiusKm, setSearchRadiusKm] = useState<number>(10);
  const [mapLayer, setMapLayer] = useState<'streets' | 'satellite' | 'heatmap'>('streets');

  const contenedorRef = useRef<HTMLDivElement>(null);
  const mapaRef = useRef<L.Map | null>(null);
  const baseRef = useRef<L.TileLayer | null>(null);
  const capaRef = useRef<L.LayerGroup | null>(null);
  const alSeleccionarRef = useRef(onSelectGroup);
  alSeleccionarRef.current = onSelectGroup;

  const idsGrupos = groups.map(g => g.id).join(',');

  const ajustarVista = () => {
    const mapa = mapaRef.current;
    if (!mapa) return;
    if (groups.length === 0) {
      mapa.setView(CENTRO_VILLAVICENCIO, 12);
      return;
    }
    mapa.fitBounds(L.latLngBounds(groups.map(g => [g.lat, g.lng] as L.LatLngTuple)), {
      padding: [70, 70],
      maxZoom: 14,
    });
  };

  useEffect(() => {
    if (!contenedorRef.current) return;
    const mapa = L.map(contenedorRef.current, { zoomControl: false, attributionControl: false })
      .setView(CENTRO_VILLAVICENCIO, 12);
    L.control.attribution({ position: 'topleft', prefix: false }).addTo(mapa);
    capaRef.current = L.layerGroup().addTo(mapa);
    mapaRef.current = mapa;
    return () => {
      mapa.remove();
      mapaRef.current = null;
      baseRef.current = null;
      capaRef.current = null;
    };
  }, []);

  useEffect(() => {
    const mapa = mapaRef.current;
    if (!mapa) return;
    baseRef.current?.remove();
    const base = MAPAS_BASE[mapLayer === 'satellite' ? 'satellite' : 'streets'];
    baseRef.current = L.tileLayer(base.url, { attribution: base.attribution, maxZoom: 19 }).addTo(mapa);
  }, [mapLayer]);

  useEffect(() => {
    ajustarVista();
  }, [idsGrupos]);

  useEffect(() => {
    const capa = capaRef.current;
    if (!capa) return;
    capa.clearLayers();

    if (mapLayer === 'heatmap') {
      groups.forEach((g) => {
        L.circle([g.lat, g.lng], {
          radius: 150 + g.memberCount * 70,
          stroke: false,
          fillColor: g.averageAttendanceRate > 85 ? '#16A34A' : g.averageAttendanceRate > 70 ? '#CA8A04' : '#DC2626',
          fillOpacity: 0.4,
          interactive: false,
        }).addTo(capa);
      });
    }

    if (selectedGroup) {
      L.circle([selectedGroup.lat, selectedGroup.lng], {
        radius: searchRadiusKm * 1000,
        color: '#EA580C',
        weight: 1.5,
        dashArray: '4 4',
        fillColor: '#EA580C',
        fillOpacity: 0.07,
        interactive: false,
      }).addTo(capa);
      L.circle([selectedGroup.lat, selectedGroup.lng], {
        radius: searchRadiusKm * 500,
        color: '#A3A3A3',
        weight: 1,
        dashArray: '2 2',
        fill: false,
        interactive: false,
      }).addTo(capa);
    }

    groups.forEach((grp) => {
      L.marker([grp.lat, grp.lng], {
        icon: iconoGrupo(grp, selectedGroup?.id === grp.id),
        title: grp.name,
      })
        .on('click', () => {
          setSelectedGroup(grp);
          alSeleccionarRef.current?.(grp);
        })
        .addTo(capa);
    });
  }, [groups, selectedGroup, mapLayer, searchRadiusKm]);

  const resetView = () => {
    ajustarVista();
    setSelectedGroup(groups[0] ?? null);
  };

  return (
    <div className="bg-white border border-[#E8E8E8] rounded-xl shadow-xs overflow-hidden flex flex-col">
      <div className="p-4.5 border-b border-[#E8E8E8] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-serif font-bold text-[#0A0A0A] flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#EA580C]" />
              Geolocalización de Grupos de Comunión
            </h2>
            <span className="text-xs bg-[#FAFAFA] text-[#6B6B6B] border border-[#E8E8E8] font-medium px-2 py-0.5 rounded">
              {groups.length} Grupos
            </span>
          </div>
          <p className="text-xs text-[#6B6B6B] mt-0.5">
            Distribución territorial de puntos de reunión, cobertura pastoral y comunidades fraternas.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-[#FAFAFA] border border-[#E0E0E0] px-2.5 py-1 rounded-lg text-xs">
            <Navigation className="w-3.5 h-3.5 text-[#EA580C]" />
            <span className="text-[#6B6B6B] text-[11px]">Radio de Cobertura:</span>
            <select
              value={searchRadiusKm}
              onChange={(e) => setSearchRadiusKm(Number(e.target.value))}
              className="bg-transparent font-medium text-[#0A0A0A] focus:outline-none text-xs cursor-pointer"
            >
              <option value={2}>2 km (Barrial)</option>
              <option value={5}>5 km (Distrital)</option>
              <option value={10}>10 km (Inter-Zonas)</option>
              <option value={20}>20 km (Metropolitano)</option>
            </select>
          </div>

          <div className="flex items-center gap-1 bg-[#FAFAFA] border border-[#E0E0E0] p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setMapLayer('streets')}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                mapLayer === 'streets' 
                  ? 'bg-white text-[#0A0A0A] shadow-xs' 
                  : 'text-[#6B6B6B] hover:text-[#0A0A0A]'
              }`}
            >
              Cartográfico
            </button>
            <button
              onClick={() => setMapLayer('satellite')}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                mapLayer === 'satellite' 
                  ? 'bg-white text-[#0A0A0A] shadow-xs' 
                  : 'text-[#6B6B6B] hover:text-[#0A0A0A]'
              }`}
            >
              Satélite
            </button>
            <button
              onClick={() => setMapLayer('heatmap')}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                mapLayer === 'heatmap' 
                  ? 'bg-white text-[#0A0A0A] shadow-xs' 
                  : 'text-[#6B6B6B] hover:text-[#0A0A0A]'
              }`}
            >
              Densidad
            </button>
          </div>
        </div>
      </div>

      <div className="relative w-full h-[420px] sm:h-[500px] bg-[#F5F5F5] overflow-hidden border-b border-[#E8E8E8]">
        <div ref={contenedorRef} className="absolute inset-0 z-0" />

        <div className="absolute top-4 right-4 flex flex-col gap-1.5 z-10">
          <button
            onClick={() => mapaRef.current?.zoomIn()}
            className="w-8 h-8 rounded-lg bg-white border border-[#E0E0E0] text-[#404040] hover:bg-[#FAFAFA] flex items-center justify-center shadow-xs transition-colors"
            title="Acercar"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => mapaRef.current?.zoomOut()}
            className="w-8 h-8 rounded-lg bg-white border border-[#E0E0E0] text-[#404040] hover:bg-[#FAFAFA] flex items-center justify-center shadow-xs transition-colors"
            title="Alejar"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={resetView}
            className="w-8 h-8 rounded-lg bg-white border border-[#E0E0E0] text-[#404040] hover:bg-[#FAFAFA] flex items-center justify-center shadow-xs transition-colors"
            title="Centrar"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <div className="absolute bottom-3 left-3 bg-white/95 border border-[#E8E8E8] rounded-lg p-2.5 backdrop-blur-xs text-[10px] text-[#6B6B6B] z-10 space-y-1.5 shadow-sm hidden sm:block">
          <p className="font-semibold text-[#0A0A0A] uppercase tracking-wider text-[9px]">Simbología de Grupos:</p>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]" />
            <span>Perseverancia Alta (&gt;85%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#CA8A04]" />
            <span>Asistencia Media (70-84%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]" />
            <span>Atención Pastoral Requerida (&lt;70%)</span>
          </div>
        </div>

        {selectedGroup && (
          <div className="absolute bottom-3 right-3 max-w-sm w-80 bg-white border border-[#E0E0E0] rounded-xl shadow-md p-3.5 z-20">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <span className="text-[10px] font-medium text-[#EA580C] bg-[#FAFAFA] border border-[#E8E8E8] px-1.5 py-0.5 rounded">
                  {selectedGroup.code}
                </span>
                <h3 className="text-xs font-serif font-bold text-[#0A0A0A] mt-1 flex items-center gap-1.5">
                  <Church className="w-3.5 h-3.5 text-[#EA580C]" />
                  {selectedGroup.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedGroup(null)}
                className="text-[#8A8A8A] hover:text-[#0A0A0A] p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 text-xs text-[#404040] mb-3">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#8A8A8A] shrink-0" />
                <span className="truncate">{selectedGroup.address} ({selectedGroup.zone})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#8A8A8A] shrink-0" />
                <span>Anfitrión/Líder: <strong className="text-[#0A0A0A]">{selectedGroup.leaderName}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#8A8A8A] shrink-0" />
                <span>Día: <strong>{selectedGroup.meetingDay}s, {selectedGroup.meetingTime} hrs</strong></span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 p-2 bg-[#FAFAFA] border border-[#E8E8E8] rounded-lg text-center mb-3">
              <div>
                <p className="text-[10px] text-[#6B6B6B]">Discípulos del Grupo</p>
                <p className="text-sm font-serif font-bold text-[#0A0A0A]">{selectedGroup.memberCount}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#6B6B6B]">Perseverancia</p>
                <p className={`text-sm font-serif font-bold ${
                  selectedGroup.averageAttendanceRate >= 85 ? 'text-[#16A34A]' :
                  selectedGroup.averageAttendanceRate >= 75 ? 'text-[#CA8A04]' : 'text-[#DC2626]'
                }`}>
                  {selectedGroup.averageAttendanceRate}%
                </p>
              </div>
            </div>

            {onQuickAttendanceForGroup && (
              <button
                onClick={() => onQuickAttendanceForGroup(selectedGroup.id)}
                className="w-full py-1.5 px-2.5 bg-[#EA580C] hover:bg-[#C2410C] text-[#FAFAFA] rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Registrar Asistencia en este Grupo</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
