import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Printer, RefreshCw, ClipboardList, ChevronLeft, ChevronRight, CalendarRange } from 'lucide-react';
import { api, InformeGeneral } from '../services/api';
import { NOMBRE_FASE, NOMBRE_ESTADO_EVENTO, MESES, fechaCorta, fechaLarga, hoyISO, aISO } from '../utils/formato';
import { ModoPeriodo, periodoDe, moverAncla, rangoValido } from '../utils/periodo';

interface GeneralReportProps {
  rolActivo: string;
}

const fechaHoraLarga = (f: string) => `${fechaLarga(f)}, ${f.slice(11, 16)}`;

const capitalizar = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

const MODOS: { clave: ModoPeriodo; etiqueta: string }[] = [
  { clave: 'semana', etiqueta: 'Semana' },
  { clave: 'mes', etiqueta: 'Mes' },
  { clave: 'anio', etiqueta: 'Año' },
  { clave: 'rango', etiqueta: 'Rango de fechas' },
];

const campoFecha =
  'px-2.5 py-1.5 bg-white border border-[#E0E0E0] rounded-lg text-xs text-[#0A0A0A] focus:outline-none focus:border-[#EA580C]';

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

  const [modo, setModo] = useState<ModoPeriodo>('mes');
  const [ancla, setAncla] = useState<Date>(() => new Date());
  const [rango, setRango] = useState(() => {
    const hoy = new Date();
    return { desde: aISO(new Date(hoy.getFullYear(), hoy.getMonth(), 1)), hasta: aISO(hoy) };
  });

  const periodo = useMemo(() => periodoDe(modo, ancla, rango), [modo, ancla, rango]);
  const periodoListo = modo !== 'rango' || rangoValido(rango);
  const ultimaPeticion = useRef(0);

  const cargar = async () => {
    if (!periodoListo) return;
    const numero = ++ultimaPeticion.current;
    setCargando(true);
    try {
      const datos = await api.informeGeneral(periodo.desde, periodo.hasta);
      if (numero !== ultimaPeticion.current) return;
      setInforme(datos);
      setError(null);
    } catch (err) {
      if (numero !== ultimaPeticion.current) return;
      setError((err as Error).message);
    } finally {
      if (numero === ultimaPeticion.current) setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, [periodo.desde, periodo.hasta, periodoListo]);

  const barraPeriodo = (
    <div className="no-print mb-3 p-3 bg-white border border-[#E8E8E8] rounded-xl space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-[#0A0A0A] flex items-center gap-1.5 mr-1">
          <CalendarRange className="w-4 h-4 text-[#EA580C]" />
          Período del informe
        </span>
        <div className="flex flex-wrap items-center gap-1 bg-[#FAFAFA] border border-[#E8E8E8] p-1 rounded-lg">
          {MODOS.map((m) => (
            <button
              key={m.clave}
              onClick={() => setModo(m.clave)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                modo === m.clave ? 'bg-[#EA580C] text-white shadow-xs' : 'text-[#6B6B6B] hover:text-[#0A0A0A]'
              }`}
            >
              {m.etiqueta}
            </button>
          ))}
        </div>
      </div>

      {modo === 'rango' ? (
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-[11px] text-[#6B6B6B]">
            Desde
            <input type="date" value={rango.desde} max={rango.hasta || undefined}
              onChange={(e) => setRango({ ...rango, desde: e.target.value })} className={`${campoFecha} block mt-1`} />
          </label>
          <label className="text-[11px] text-[#6B6B6B]">
            Hasta
            <input type="date" value={rango.hasta} min={rango.desde || undefined}
              onChange={(e) => setRango({ ...rango, hasta: e.target.value })} className={`${campoFecha} block mt-1`} />
          </label>
          {!periodoListo && <p className="text-[11px] text-[#B91C1C] font-medium pb-2">Elige una fecha inicial y una final (la inicial no puede ser posterior).</p>}
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setAncla(moverAncla(modo, ancla, -1))} aria-label="Período anterior"
            className="p-1.5 border border-[#E0E0E0] rounded-lg bg-white hover:bg-[#F2F2F2] text-[#404040]">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold text-[#0A0A0A] min-w-[12rem] text-center">{periodo.etiqueta}</span>
          <button onClick={() => setAncla(moverAncla(modo, ancla, 1))} aria-label="Período siguiente"
            className="p-1.5 border border-[#E0E0E0] rounded-lg bg-white hover:bg-[#F2F2F2] text-[#404040]">
            <ChevronRight className="w-4 h-4" />
          </button>
          <button onClick={() => setAncla(new Date())}
            className="px-3 py-1.5 text-xs font-medium text-[#EA580C] border border-[#E0E0E0] rounded-lg bg-white hover:bg-[#F2F2F2]">
            Hoy
          </button>

          {modo === 'mes' && (
            <div className="flex items-center gap-2 ml-1">
              <select value={ancla.getMonth()} aria-label="Mes"
                onChange={(e) => setAncla(new Date(ancla.getFullYear(), Number(e.target.value), 1))} className={campoFecha}>
                {MESES.map((m, i) => <option key={m} value={i}>{capitalizar(m)}</option>)}
              </select>
              <input type="number" value={ancla.getFullYear()} min={2000} max={2100} aria-label="Año"
                onChange={(e) => { const a = Number(e.target.value); if (a >= 2000 && a <= 2100) setAncla(new Date(a, ancla.getMonth(), 1)); }}
                className={`${campoFecha} w-20`} />
            </div>
          )}
          {modo === 'anio' && (
            <input type="number" value={ancla.getFullYear()} min={2000} max={2100} aria-label="Año"
              onChange={(e) => { const a = Number(e.target.value); if (a >= 2000 && a <= 2100) setAncla(new Date(a, 0, 1)); }}
              className={`${campoFecha} w-20 ml-1`} />
          )}
          {modo === 'semana' && (
            <label className="text-[11px] text-[#6B6B6B] flex items-center gap-2 ml-1">
              Elegir un día de esa semana
              <input type="date" value={aISO(ancla)} max={hoyISO()}
                onChange={(e) => { if (e.target.value) { const [a, m, d] = e.target.value.split('-').map(Number); setAncla(new Date(a, m - 1, d)); } }}
                className={campoFecha} />
            </label>
          )}
        </div>
      )}
    </div>
  );

  if (cargando && !informe) {
    return (
      <div>
        {barraPeriodo}
        <div className="p-8 text-center text-xs text-[#6B6B6B] bg-white border border-[#E8E8E8] rounded-xl">Generando el informe…</div>
      </div>
    );
  }

  if (error || !informe) {
    return (
      <div>
        {barraPeriodo}
        {periodoListo && (
          <div className="p-6 bg-white border border-[#E8E8E8] rounded-xl text-xs space-y-2">
            <p className="font-semibold text-[#B91C1C]">No se pudo generar el informe</p>
            <p className="text-[#6B6B6B]">{error}</p>
            <button onClick={cargar} className="px-3 py-1.5 bg-[#EA580C] text-white rounded-lg">Reintentar</button>
          </div>
        )}
      </div>
    );
  }

  const { resumen } = informe;
  const totalFases = informe.fases.reduce((suma, f) => suma + f.total, 0) || 1;
  const totalEdades = informe.edades.reduce((s, e) => s + e.personas, 0) + informe.sinFechaNacimiento.personas;
  const hoy = hoyISO();
  const referenciaEdad = informe.periodo.hasta < hoy ? informe.periodo.hasta : hoy;

  const tarjetas = [
    { etiqueta: 'Discípulos activos', valor: resumen.personasActivas, color: 'text-[#0A0A0A]' },
    { etiqueta: 'Grupos de comunión', valor: resumen.gruposActivos, color: 'text-[#0A0A0A]' },
    { etiqueta: 'Asistencia del período', valor: `${resumen.asistenciaPromedio}%`, color: 'text-[#EA580C]' },
    { etiqueta: 'Reuniones del período', valor: resumen.sesionesPeriodo, color: 'text-[#0A0A0A]' },
    { etiqueta: 'Nuevos en el período', valor: resumen.nuevosPeriodo, color: 'text-[#16A34A]' },
    { etiqueta: 'Eventos del período', valor: resumen.eventosPeriodo, color: 'text-[#0A0A0A]' },
    { etiqueta: 'En atención urgente', valor: resumen.personasEnRojo, color: 'text-[#DC2626]' },
    { etiqueta: 'En seguimiento', valor: resumen.personasEnAmarillo, color: 'text-[#CA8A04]' },
  ];

  return (
    <div>
      {barraPeriodo}

      <div className="no-print flex items-center justify-between gap-3 mb-3">
        <p className="text-xs text-[#6B6B6B] flex items-center gap-1.5">
          <ClipboardList className="w-4 h-4 text-[#EA580C]" />
          Informe armado con los datos de la base de datos para el período elegido.
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
            <p className="text-xs text-[#6B6B6B] mt-1">Estado de los grupos de comunión, la asistencia y el acompañamiento de los discípulos.</p>
            <p className="text-xs text-[#0A0A0A] mt-1.5">
              <strong>Período:</strong> {periodo.etiqueta} ({fechaCorta(informe.periodo.desde)} a {fechaCorta(informe.periodo.hasta)})
            </p>
          </div>
          <div className="sm:text-right text-[11px] text-[#6B6B6B] shrink-0">
            <p><strong className="text-[#0A0A0A]">Generado:</strong> {fechaHoraLarga(informe.generado)}</p>
            <p><strong className="text-[#0A0A0A]">Elaborado para:</strong> {rolActivo}</p>
          </div>
        </header>

        <Seccion numero={1} titulo="Resumen general">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {tarjetas.map((t) => (
              <div key={t.etiqueta} className="p-3 border border-[#E8E8E8] rounded-lg bg-[#FAFAFA] print-avoid-break">
                <p className={`text-xl font-bold ${t.color}`}>{t.valor}</p>
                <p className="text-[10px] text-[#6B6B6B] leading-tight mt-0.5">{t.etiqueta}</p>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[10px] text-[#8A8A8A]">
            La asistencia, las reuniones, los nuevos y los eventos corresponden al período elegido. Discípulos activos, grupos y semáforo muestran el estado actual.
          </p>
        </Seccion>

        <Seccion numero={2} titulo="Discípulos por fase de formación">
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

        <Seccion numero={3} titulo="Discípulos por edad">
          <p className="text-[10px] text-[#8A8A8A] mb-2">
            Edades calculadas al {fechaLarga(referenciaEdad)} (a partir de la fecha de nacimiento). Incluye a los discípulos registrados hasta el final del período; la asistencia es la del período.
          </p>
          <div className="space-y-1.5 mb-3">
            {informe.edades.map((e) => (
              <div key={e.clave} className="flex items-center gap-3 text-[11px] print-avoid-break">
                <span className="w-44 text-[#404040] font-medium">{e.etiqueta}</span>
                <div className="flex-1 h-3 bg-[#F2F2F2] rounded-full overflow-hidden">
                  <div className="h-full bg-[#EA580C] rounded-full" style={{ width: `${totalEdades ? (e.personas / totalEdades) * 100 : 0}%` }} />
                </div>
                <span className="w-24 text-right text-[#404040]">{e.personas} ({totalEdades ? Math.round((e.personas / totalEdades) * 100) : 0}%)</span>
              </div>
            ))}
          </div>
          <Tabla
            columnas={['Rango de edad', 'Discípulos', 'Hombres', 'Mujeres', 'Asistencia del período', 'Faltas']}
            filas={[
              ...informe.edades.map((e) => [
                <strong className="text-[#0A0A0A]">{e.etiqueta}</strong>, e.personas, e.hombres, e.mujeres,
                e.registros > 0 ? `${e.asistencia}% (${e.presentes} de ${e.registros})` : 'Sin registros',
                <span className={e.faltas > 0 ? 'text-[#DC2626] font-semibold' : ''}>{e.faltas}</span>,
              ]),
              ...(informe.sinFechaNacimiento.personas > 0
                ? [[
                    <span className="text-[#6B6B6B]">Sin fecha de nacimiento</span>,
                    informe.sinFechaNacimiento.personas, informe.sinFechaNacimiento.hombres, informe.sinFechaNacimiento.mujeres,
                    informe.sinFechaNacimiento.registros > 0
                      ? `${informe.sinFechaNacimiento.asistencia}% (${informe.sinFechaNacimiento.presentes} de ${informe.sinFechaNacimiento.registros})`
                      : 'Sin registros',
                    informe.sinFechaNacimiento.faltas,
                  ]]
                : []),
            ]}
          />
        </Seccion>

        <Seccion numero={4} titulo="Grupos de comunión">
          <Tabla
            columnas={['Grupo', 'Zona', 'Líder', 'Reunión', 'Discípulos', 'Reuniones', 'Asistencia', 'Atención', 'Seguim.']}
            vacio="Todavía no hay grupos de comunión."
            filas={informe.grupos.map((g) => [
              <span><strong className="text-[#0A0A0A]">{g.nombre}</strong><br /><span className="text-[#A3A3A3]">{g.codigo}</span></span>,
              g.zona, g.lider, g.reunion, g.miembros, g.sesiones, g.sesiones > 0 ? `${g.asistencia}%` : 'Sin reuniones',
              <span className={g.rojos > 0 ? 'text-[#DC2626] font-semibold' : ''}>{g.rojos}</span>,
              <span className={g.amarillos > 0 ? 'text-[#CA8A04] font-semibold' : ''}>{g.amarillos}</span>,
            ])}
          />
        </Seccion>

        <Seccion numero={5} titulo="Discípulos que requieren acompañamiento (estado actual)">
          <Tabla
            columnas={['Código', 'Miembro', 'Grupo', 'Fase', 'Mentor', 'Faltas seguidas', 'Última asistencia', 'Estado']}
            vacio="Todos los discípulos asisten con regularidad."
            filas={informe.cuidado.map((c) => [
              c.codigo, <strong className="text-[#0A0A0A]">{c.nombre}</strong>, c.grupo, NOMBRE_FASE[c.fase] ?? c.fase, c.mentor,
              c.faltas, c.ultimaAsistencia === 'Sin registro' ? c.ultimaAsistencia : fechaCorta(c.ultimaAsistencia),
              <span className={c.semaforo === 'rojo' ? 'text-[#DC2626] font-semibold' : 'text-[#CA8A04] font-semibold'}>
                {c.semaforo === 'rojo' ? 'Atención urgente' : 'Seguimiento'}
              </span>,
            ])}
          />
        </Seccion>

        <Seccion numero={6} titulo="Asistencia por grupo en el período">
          <Tabla
            columnas={['Fecha', 'Grupo', 'Tema', 'Presentes', 'Con permiso', 'Sin aviso']}
            vacio="No hubo reuniones registradas en este período."
            filas={informe.sesiones.map((s) => [
              fechaCorta(s.fecha), s.grupo, s.tema, s.presentes, s.justificadas,
              <span className={s.injustificadas > 0 ? 'text-[#DC2626] font-semibold' : ''}>{s.injustificadas}</span>,
            ])}
          />
        </Seccion>

        <Seccion numero={7} titulo="Eventos del período">
          <Tabla
            columnas={['Fecha', 'Evento', 'Tipo', 'Lugar', 'Estado', 'Asistentes']}
            vacio="No hubo eventos en este período."
            filas={informe.eventos.map((e) => [
              `${fechaCorta(e.fecha)} ${e.hora}`, <strong className="text-[#0A0A0A]">{e.titulo}</strong>, capitalizar(e.tipo), e.lugar,
              NOMBRE_ESTADO_EVENTO[e.estado] ?? e.estado, e.asistentes,
            ])}
          />
        </Seccion>

        <Seccion numero={8} titulo="Equipo por rol">
          <Tabla
            columnas={['Nivel', 'Rol', 'Personas']}
            filas={informe.roles.map((r) => [r.nivel, <strong className="text-[#0A0A0A]">{r.rol}</strong>, r.personas])}
          />
        </Seccion>

        <Seccion numero={9} titulo="Nuevos discípulos del período">
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
