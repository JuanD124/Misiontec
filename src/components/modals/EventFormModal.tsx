import React, { useEffect, useState } from 'react';
import { X, CalendarPlus, CheckCircle2, RefreshCw } from 'lucide-react';
import { DatosEvento } from '../../services/api';
import { NOMBRE_TIPO_EVENTO, hoyISO } from '../../utils/formato';
import { LocationPicker } from '../LocationPicker';

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: DatosEvento) => Promise<void>;
}

const campo = (conError: boolean) =>
  `w-full px-3 py-2 bg-white border rounded-lg focus:outline-none text-[#0A0A0A] ${
    conError ? 'border-[#DC2626]' : 'border-[#E0E0E0] focus:border-[#EA580C]'
  }`;

export const EventFormModal: React.FC<EventFormModalProps> = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('taller');
  const [date, setDate] = useState(hoyISO());
  const [time, setTime] = useState('18:00');
  const [location, setLocation] = useState('');
  const [audience, setAudience] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setTitle('');
    setType('taller');
    setDate(hoyISO());
    setTime('18:00');
    setLocation('');
    setAudience('');
    setLat('');
    setLng('');
    setErrores({});
    setErrorGeneral(null);
    setGuardando(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Escribe el nombre del evento.';
    if (!location.trim()) errs.location = 'Indica el lugar.';
    if (!date) errs.date = 'Elige la fecha.';
    if (!time) errs.time = 'Elige la hora.';
    setErrores(errs);
    if (Object.keys(errs).length > 0) return;

    setGuardando(true);
    setErrorGeneral(null);
    try {
      await onSave({
        title: title.trim(), type, date, time, location: location.trim(), targetAudience: audience.trim(),
        lat: lat ? Number(lat) : null, lng: lng ? Number(lng) : null,
      });
      onClose();
    } catch (err) {
      setErrorGeneral((err as Error).message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-[#0A0A0A]/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-[#E8E8E8] rounded-t-2xl sm:rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        <div className="p-4 sm:p-5 border-b border-[#E8E8E8] flex items-center justify-between bg-[#FAFAFA]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFEDD5] flex items-center justify-center">
              <CalendarPlus className="w-5 h-5 text-[#EA580C]" />
            </div>
            <h2 className="text-base font-bold text-[#0A0A0A]">Nuevo evento</h2>
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
            <label className="block font-medium text-[#0A0A0A] mb-1">Nombre del evento *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej. Seminario de liderazgo" className={campo(Boolean(errores.title))} />
            {errores.title && <p className="mt-1 text-[11px] text-[#DC2626]">{errores.title}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-medium text-[#0A0A0A] mb-1">Tipo *</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className={campo(false)}>
                {Object.entries(NOMBRE_TIPO_EVENTO).map(([clave, nombre]) => (
                  <option key={clave} value={clave}>{nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium text-[#0A0A0A] mb-1">Fecha *</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={campo(Boolean(errores.date))} />
              {errores.date && <p className="mt-1 text-[11px] text-[#DC2626]">{errores.date}</p>}
            </div>
            <div>
              <label className="block font-medium text-[#0A0A0A] mb-1">Hora *</label>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={campo(Boolean(errores.time))} />
              {errores.time && <p className="mt-1 text-[11px] text-[#DC2626]">{errores.time}</p>}
            </div>
          </div>

          <div>
            <label className="block font-medium text-[#0A0A0A] mb-1">Lugar *</label>
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Ej. Salón Barzal" className={campo(Boolean(errores.location))} />
            {errores.location && <p className="mt-1 text-[11px] text-[#DC2626]">{errores.location}</p>}
          </div>

          <div>
            <label className="block font-medium text-[#0A0A0A] mb-1">A quién va dirigido</label>
            <input type="text" value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="Ej. Discipuladores" className={campo(false)} />
          </div>

          <LocationPicker
            lat={lat}
            lng={lng}
            onChange={(la, lo) => { setLat(la); setLng(lo); }}
            consulta={location}
            etiqueta="Ubicación en el mapa (opcional)"
            ayuda="Si marcas el punto, el evento aparecerá en el mapa de la misión. Toca el mapa o arrastra el punto para ajustarlo."
          />

          <div className="pt-4 border-t border-[#E8E8E8] flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-medium text-[#6B6B6B] hover:text-[#0A0A0A]">Cancelar</button>
            <button type="submit" disabled={guardando}
              className="flex items-center gap-1.5 px-5 py-2 bg-[#EA580C] hover:bg-[#C2410C] disabled:opacity-60 text-white text-xs font-medium rounded-lg">
              {guardando ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>{guardando ? 'Guardando…' : 'Crear evento'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
