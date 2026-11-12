import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Search, Crosshair, RefreshCw, Trash2 } from 'lucide-react';

interface LocationPickerProps {
  lat: string;
  lng: string;
  onChange: (lat: string, lng: string) => void;
  /** Texto que se usa para buscar el lugar (por ejemplo, el campo "Lugar"). */
  consulta: string;
  etiqueta: string;
  ayuda?: string;
}

const CENTRO_VILLAVICENCIO: L.LatLngTuple = [4.142, -73.626];

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

export const LocationPicker: React.FC<LocationPickerProps> = ({ lat, lng, onChange, consulta, etiqueta, ayuda }) => {
  const [aviso, setAviso] = useState<string | null>(null);
  const [buscando, setBuscando] = useState(false);

  const contenedorRef = useRef<HTMLDivElement>(null);
  const mapaRef = useRef<L.Map | null>(null);
  const marcadorRef = useRef<L.Marker | null>(null);
  const alCambiarRef = useRef(onChange);
  alCambiarRef.current = onChange;
  const inicialRef = useRef({ lat, lng });

  useEffect(() => {
    if (!contenedorRef.current) return;
    const la = numeroValido(inicialRef.current.lat, -90, 90);
    const lo = numeroValido(inicialRef.current.lng, -180, 180);
    const inicial: L.LatLngTuple | null = la !== null && lo !== null ? [la, lo] : null;
    const mapa = L.map(contenedorRef.current).setView(inicial ?? CENTRO_VILLAVICENCIO, inicial ? 16 : 12);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
    }).addTo(mapa);
    mapa.on('click', (e: L.LeafletMouseEvent) => {
      alCambiarRef.current(e.latlng.lat.toFixed(6), e.latlng.lng.toFixed(6));
    });
    mapaRef.current = mapa;
    const pendiente = window.setTimeout(() => mapa.invalidateSize(), 200);
    return () => {
      window.clearTimeout(pendiente);
      mapa.remove();
      mapaRef.current = null;
      marcadorRef.current = null;
    };
  }, []);

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
          alCambiarRef.current(p.lat.toFixed(6), p.lng.toFixed(6));
        })
        .addTo(mapa);
    } else {
      marcadorRef.current.setLatLng([la, lo]);
    }
  }, [lat, lng]);

  const centrarEn = (la: number, lo: number, zoom = 17) => {
    onChange(la.toFixed(6), lo.toFixed(6));
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

  const buscar = async () => {
    setAviso(null);
    if (!consulta.trim()) {
      setAviso('Escribe primero el lugar para poder buscarlo en el mapa.');
      return;
    }
    setBuscando(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=co&q=${encodeURIComponent(`${consulta.trim()}, Colombia`)}`;
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      const datos: { lat: string; lon: string }[] = await res.json();
      if (datos.length === 0) {
        setAviso('No se encontró ese lugar. Toca el mapa para marcar el punto exacto.');
      } else {
        centrarEn(Number(datos[0].lat), Number(datos[0].lon), 17);
        setAviso('Ubicación encontrada. Si no es exacta, arrastra el punto o toca el mapa.');
      }
    } catch {
      setAviso('No se pudo buscar el lugar. Toca el mapa para marcar el punto.');
    } finally {
      setBuscando(false);
    }
  };

  const hayPunto = numeroValido(lat, -90, 90) !== null && numeroValido(lng, -180, 180) !== null;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="font-medium text-[#0A0A0A] flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-[#EA580C]" /> {etiqueta}
        </label>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={buscar} disabled={buscando}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#FAFAFA] hover:bg-[#F2F2F2] text-[#EA580C] border border-[#E0E0E0] rounded-lg font-medium disabled:opacity-60">
            {buscando ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            Buscar lugar
          </button>
          <button type="button" onClick={usarMiUbicacion}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#FAFAFA] hover:bg-[#F2F2F2] text-[#EA580C] border border-[#E0E0E0] rounded-lg font-medium">
            <Crosshair className="w-3.5 h-3.5" />
            Usar mi ubicación
          </button>
          {hayPunto && (
            <button type="button" onClick={() => onChange('', '')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#FAFAFA] hover:bg-[#FEF2F2] text-[#B91C1C] border border-[#E0E0E0] rounded-lg font-medium">
              <Trash2 className="w-3.5 h-3.5" />
              Quitar punto
            </button>
          )}
        </div>
      </div>

      <div ref={contenedorRef} className="h-52 w-full rounded-lg border border-[#E0E0E0] overflow-hidden z-0" />
      <p className="text-[11px] text-[#6B6B6B]">
        {ayuda ?? 'Toca el mapa para marcar el punto. Puedes arrastrarlo para ajustarlo.'}
        {hayPunto && <span className="text-[#166534] font-medium"> Punto marcado: {lat}, {lng}</span>}
      </p>

      {aviso && <p className="text-[11px] font-medium text-[#854D0E] bg-[#FEF9C3] border border-[#FEF08A] rounded-lg px-3 py-2">{aviso}</p>}
    </div>
  );
};
