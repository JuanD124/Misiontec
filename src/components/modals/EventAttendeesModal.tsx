import React, { useEffect, useMemo, useState } from 'react';
import { X, Users, CheckCircle2, RefreshCw, Search } from 'lucide-react';
import { MissionEvent, Person } from '../../types';
import { api } from '../../services/api';
import { fechaCorta } from '../../utils/formato';

interface EventAttendeesModalProps {
  event: MissionEvent | null;
  people: Person[];
  onClose: () => void;
  onSave: (eventId: string, personIds: number[]) => Promise<void>;
}

export const EventAttendeesModal: React.FC<EventAttendeesModalProps> = ({ event, people, onClose, onSave }) => {
  const [seleccion, setSeleccion] = useState<Set<number>>(new Set());
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!event) return;
    setCargando(true);
    setError(null);
    setBusqueda('');
    let vigente = true;
    api.asistentesEvento(event.id)
      .then((ids) => vigente && setSeleccion(new Set(ids.filter((id) => people.some((p) => Number(p.id) === id)))))
      .catch((err) => vigente && setError((err as Error).message))
      .finally(() => vigente && setCargando(false));
    return () => {
      vigente = false;
    };
  }, [event?.id]);

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return people.filter((p) => !q || p.fullName.toLowerCase().includes(q) || p.groupName.toLowerCase().includes(q));
  }, [people, busqueda]);

  if (!event) return null;

  const alternar = (id: number) => {
    const nueva = new Set(seleccion);
    if (nueva.has(id)) nueva.delete(id);
    else nueva.add(id);
    setSeleccion(nueva);
  };

  const todosMarcados = visibles.length > 0 && visibles.every((p) => seleccion.has(Number(p.id)));

  const alternarTodos = () => {
    const nueva = new Set(seleccion);
    visibles.forEach((p) => (todosMarcados ? nueva.delete(Number(p.id)) : nueva.add(Number(p.id))));
    setSeleccion(nueva);
  };

  const guardar = async () => {
    setGuardando(true);
    setError(null);
    try {
      await onSave(event.id, [...seleccion]);
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-[#0A0A0A]/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-[#E8E8E8] rounded-t-2xl sm:rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        <div className="p-4 sm:p-5 border-b border-[#E8E8E8] flex items-start justify-between bg-[#FAFAFA] gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#FFEDD5] flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-[#EA580C]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-[#0A0A0A]">Asistentes</h2>
              <p className="text-xs text-[#6B6B6B] truncate">{event.title} · {fechaCorta(event.date)}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-[#8A8A8A] hover:text-[#0A0A0A] rounded-lg hover:bg-[#F2F2F2] shrink-0" aria-label="Cerrar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-3 overflow-y-auto text-xs">
          {error && <div role="alert" className="p-3 rounded-lg bg-[#FEE2E2] border border-[#FECACA] text-[#B91C1C] font-medium">{error}</div>}

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#8A8A8A] absolute left-3 top-3" />
            <input type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por nombre o grupo…"
              className="w-full pl-9 pr-3 py-2 bg-white border border-[#E0E0E0] rounded-lg focus:outline-none focus:border-[#EA580C]" />
          </div>

          <div className="flex items-center justify-between">
            <button onClick={alternarTodos} className="text-[#EA580C] font-medium hover:underline">
              {todosMarcados ? 'Quitar todos' : 'Marcar todos'}
            </button>
            <span className="text-[#6B6B6B]">{seleccion.size} seleccionados</span>
          </div>

          {cargando ? (
            <p className="py-8 text-center text-[#8A8A8A] italic">Cargando…</p>
          ) : visibles.length === 0 ? (
            <p className="py-8 text-center text-[#8A8A8A] italic">No hay personas para mostrar.</p>
          ) : (
            <ul className="divide-y divide-[#F2F2F2] border border-[#E8E8E8] rounded-lg">
              {visibles.map((p) => {
                const id = Number(p.id);
                return (
                  <li key={p.id}>
                    <label className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-[#FAFAFA]">
                      <input type="checkbox" checked={seleccion.has(id)} onChange={() => alternar(id)} className="w-4 h-4 accent-[#EA580C]" />
                      <span className="flex-1 min-w-0">
                        <span className="block font-medium text-[#0A0A0A] truncate">{p.fullName}</span>
                        <span className="block text-[10px] text-[#6B6B6B] truncate">{p.groupName}</span>
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="p-4 border-t border-[#E8E8E8] flex items-center justify-end gap-3 bg-white">
          <button onClick={onClose} className="px-4 py-2 text-xs font-medium text-[#6B6B6B] hover:text-[#0A0A0A]">Cancelar</button>
          <button onClick={guardar} disabled={guardando || cargando}
            className="flex items-center gap-1.5 px-5 py-2 bg-[#EA580C] hover:bg-[#C2410C] disabled:opacity-60 text-white text-xs font-medium rounded-lg">
            {guardando ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>{guardando ? 'Guardando…' : 'Guardar asistentes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
