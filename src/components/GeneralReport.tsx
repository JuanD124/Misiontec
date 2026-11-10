import React, { useEffect, useState } from 'react';
import { Printer, RefreshCw, ClipboardList } from 'lucide-react';
import { api, InformeGeneral } from '../services/api';

interface GeneralReportProps {
  rolActivo: string;
}

const NOMBRE_FASE: Record<string, string> = {
  contacto: '1. Bienvenida',
  consolidacion: '2. Consolidación',
  formacion: '3. Formación',
  liderazgo: '4. Liderazgo',
};

const NOMBRE_ESTADO_EVENTO: Record<string, string> = {
  programado: 'Programado',
  en_curso: 'En curso',
  concluido: 'Concluido',
  cancelado: 'Cancelado',
};

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

const fechaCorta = (f: string) => {
  const [anio, mes, dia] = f.slice(0, 10).split('-');
  return `${dia}/${mes}/${anio}`;
};

const fechaLarga = (f: string) => {
  const [anio, mes, dia] = f.slice(0, 10).split('-');
  return `${Number(dia)} de ${MESES[Number(mes) - 1]} de ${anio}, ${f.slice(11, 16)}`;
};

const capitalizar = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

const Seccion: React.FC<{ numero: number; titulo: string; children: React.ReactNode }> = ({ numero, titulo, children }) => (
  <section className="print-avoid-break">
    <h2 className="text-sm font-bold text-[#0A0A0A] mb-2 flex items-center gap-2">
      <span className="w-5 h-5 rounded-md bg-[#EA580C] text-white text-[11px] flex items-center justify-center">{numero}</span>
      {titulo}
    </h2>
    {children}
  </section>
);

const Tabla: React.FC<{ columnas: string[]; vacio?: string; filas: React.ReactNode[][] }> = ({ columnas, vacio, filas }) => (
  <div className="overflow-x-auto border border-[#E8E8E8] rounded-lg">
    <table className="w-full text-left text-[11px]">
      <thead className="bg-[#FAFAFA] text-[#6B6B6B] uppercase text-[9px] font-semibold tracking-wider border-b border-[#E8E8E8]">
        <tr>
          {columnas.map((c) => (
            <th key={c} className="py-2 px-3">{c}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-[#F2F2F2]">
        {filas.length === 0 ? (
          <tr>
            <td colSpan={columnas.length} className="py-4 text-center text-[#A3A3A3] italic">{vacio ?? 'Sin registros'}</td>
          </tr>
        ) : (
          filas.map((fila, i) => (
            <tr key={i}>
              {fila.map((celda, j) => (
                <td key={j} className="py-2 px-3 text-[#404040]">{celda}</td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

export const GeneralReport: React.FC<GeneralReportProps> = ({ rolActivo }) => {
  const [informe, setInforme] = useState<InformeGeneral | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  const cargar = async () => {
    setCargando(true);
    try {
      setInforme(await api.informeGeneral());
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  if (cargando && !informe) {
    return <div className="p-8 text-center text-xs text-[#6B6B6B] bg-white border border-[#E8E8E8] rounded-xl">Generando el informe…</div>;
  }

  if (error || !informe) {
    return (
      <div className="p-6 bg-white border border-[#E8E8E8] rounded-xl text-xs space-y-2">
        <p className="font-semibold text-[#B91C1C]">No se pudo generar el informe</p>
        <p className="text-[#6B6B6B]">{error}</p>
        <button onClick={cargar} className="px-3 py-1.5 bg-[#EA580C] text-white rounded-lg">Reintentar</button>
      </div>
    );
  }

  const { resumen } = informe;
  const totalFases = informe.fases.reduce((suma, f) => suma + f.total, 0) || 1;
  const tarjetas = [
    { etiqueta: 'Miembros activos', valor: resumen.personasActivas, color: 'text-[#0A0A0A]' },
    { etiqueta: 'Grupos de discipulado', valor: resumen.gruposActivos, color: 'text-[#0A0A0A]' },
    { etiqueta: 'Asistencia promedio', valor: `${resumen.asistenciaPromedio}%`, color: 'text-[#EA580C]' },
    { etiqueta: 'En atención urgente', valor: resumen.personasEnRojo, color: 'text-[#DC2626]' },
    { etiqueta: 'En seguimiento', valor: resumen.personasEnAmarillo, color: 'text-[#CA8A04]' },
    { etiqueta: 'Nuevos (90 días)', valor: resumen.nuevosUltimos90Dias, color: 'text-[#16A34A]' },
  ];

  return (
    <div>
      <div className="no-print flex items-center justify-between gap-3 mb-3">
        <p className="text-xs text-[#6B6B6B] flex items-center gap-1.5">
          <ClipboardList className="w-4 h-4 text-[#EA580C]" />
          Informe armado con los datos actuales de la base de datos.
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={cargar}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-[#F2F2F2] text-[#404040] text-xs font-medium rounded-lg border border-[#E0E0E0] transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${cargando ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-medium rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir / Guardar como PDF</span>
          </button>
        </div>
      </div>

      <article id="informe-general" className="bg-white border border-[#E8E8E8] rounded-xl shadow-xs p-6 space-y-6 print:border-0 print:shadow-none print:p-0 print:rounded-none">
        <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 pb-4 border-b-2 border-[#EA580C]">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#EA580C]">MISIONTEC</p>
            <h1 className="text-xl font-bold text-[#0A0A0A] mt-0.5">Informe General de Seguimiento</h1>
            <p className="text-xs text-[#6B6B6B] mt-1">Estado de los grupos de discipulado, la asistencia y el acompañamiento de los miembros.</p>
          </div>
          <div className="sm:text-right text-[11px] text-[#6B6B6B] shrink-0">
            <p><strong className="text-[#0A0A0A]">Generado:</strong> {fechaLarga(informe.generado)}</p>
            <p><strong className="text-[#0A0A0A]">Elaborado para:</strong> {rolActivo}</p>
          </div>
        </header>

        <Seccion numero={1} titulo="Resumen general">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {tarjetas.map((t) => (
              <div key={t.etiqueta} className="p-3 border border-[#E8E8E8] rounded-lg bg-[#FAFAFA] print-avoid-break">
                <p className={`text-xl font-bold ${t.color}`}>{t.valor}</p>
                <p className="text-[10px] text-[#6B6B6B] leading-tight mt-0.5">{t.etiqueta}</p>
              </div>
            ))}
          </div>
        </Seccion>

        <Seccion numero={2} titulo="Miembros por fase de discipulado">
          <div className="space-y-1.5">
            {informe.fases.map((f) => (
              <div key={f.fase} className="flex items-center gap-3 text-[11px] print-avoid-break">
                <span className="w-28 text-[#404040] font-medium">{NOMBRE_FASE[f.fase] ?? f.fase}</span>
                <div className="flex-1 h-3 bg-[#F2F2F2] rounded-full overflow-hidden">
                  <div className="h-full bg-[#EA580C] rounded-full" style={{ width: `${(f.total / totalFases) * 100}%` }} />
                </div>
                <span className="w-24 text-right text-[#404040]">{f.total} ({Math.round((f.total / totalFases) * 100)}%)</span>
              </div>
            ))}
          </div>
        </Seccion>

        <Seccion numero={3} titulo="Grupos de discipulado">
          <Tabla
            columnas={['Grupo', 'Zona', 'Líder', 'Reunión', 'Miembros', 'Asistencia', 'Atención', 'Seguim.']}
            filas={informe.grupos.map((g) => [
              <span><strong className="text-[#0A0A0A]">{g.nombre}</strong><br /><span className="text-[#A3A3A3]">{g.codigo}</span></span>,
              g.zona, g.lider, g.reunion, g.miembros, `${g.asistencia}%`,
              <span className={g.rojos > 0 ? 'text-[#DC2626] font-semibold' : ''}>{g.rojos}</span>,
              <span className={g.amarillos > 0 ? 'text-[#CA8A04] font-semibold' : ''}>{g.amarillos}</span>,
            ])}
          />
        </Seccion>

        <Seccion numero={4} titulo="Miembros que requieren acompañamiento">
          <Tabla
            columnas={['Código', 'Miembro', 'Grupo', 'Fase', 'Mentor', 'Faltas seguidas', 'Última asistencia', 'Estado']}
            vacio="Todos los miembros asisten con regularidad."
            filas={informe.cuidado.map((c) => [
              c.codigo, <strong className="text-[#0A0A0A]">{c.nombre}</strong>, c.grupo, NOMBRE_FASE[c.fase] ?? c.fase, c.mentor,
              c.faltas, c.ultimaAsistencia === 'Sin registro' ? c.ultimaAsistencia : fechaCorta(c.ultimaAsistencia),
              <span className={c.semaforo === 'rojo' ? 'text-[#DC2626] font-semibold' : 'text-[#CA8A04] font-semibold'}>
                {c.semaforo === 'rojo' ? 'Atención urgente' : 'Seguimiento'}
              </span>,
            ])}
          />
        </Seccion>

        <Seccion numero={5} titulo="Asistencia reciente por grupo">
          <Tabla
            columnas={['Fecha', 'Grupo', 'Tema', 'Presentes', 'Con permiso', 'Sin aviso']}
            filas={informe.sesiones.map((s) => [
              fechaCorta(s.fecha), s.grupo, s.tema, s.presentes, s.justificadas,
              <span className={s.injustificadas > 0 ? 'text-[#DC2626] font-semibold' : ''}>{s.injustificadas}</span>,
            ])}
          />
        </Seccion>

        <Seccion numero={6} titulo="Eventos">
          <Tabla
            columnas={['Fecha', 'Evento', 'Tipo', 'Lugar', 'Estado', 'Asistentes']}
            filas={informe.eventos.map((e) => [
              `${fechaCorta(e.fecha)} ${e.hora}`, <strong className="text-[#0A0A0A]">{e.titulo}</strong>, capitalizar(e.tipo), e.lugar,
              NOMBRE_ESTADO_EVENTO[e.estado] ?? e.estado, e.asistentes,
            ])}
          />
        </Seccion>

        <Seccion numero={7} titulo="Equipo por rol">
          <Tabla
            columnas={['Nivel', 'Rol', 'Personas']}
            filas={informe.roles.map((r) => [r.nivel, <strong className="text-[#0A0A0A]">{r.rol}</strong>, r.personas])}
          />
        </Seccion>

        <Seccion numero={8} titulo="Nuevos miembros (últimos 90 días)">
          <Tabla
            columnas={['Código', 'Miembro', 'Grupo', 'Fase', 'Ingreso']}
            vacio="No hubo ingresos en este período."
            filas={informe.nuevos.map((n) => [
              n.codigo, <strong className="text-[#0A0A0A]">{n.nombre}</strong>, n.grupo, NOMBRE_FASE[n.fase] ?? n.fase, fechaCorta(n.ingreso),
            ])}
          />
        </Seccion>

        <footer className="pt-10 grid grid-cols-2 gap-12 text-center text-[11px] text-[#6B6B6B] print-avoid-break">
          <div className="border-t border-[#A3A3A3] pt-1.5">Asistente Pastoral</div>
          <div className="border-t border-[#A3A3A3] pt-1.5">Pastor</div>
        </footer>
      </article>
    </div>
  );
};
