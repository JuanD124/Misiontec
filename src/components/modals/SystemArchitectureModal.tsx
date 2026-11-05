import React, { useState } from 'react';
import { ROLES, FUNCIONES } from '../../data/roles';
import { 
  X, 
  Layers, 
  Database, 
  ShieldCheck, 
  Calculator, 
  BookOpen,
  Church,
  HeartHandshake
} from 'lucide-react';

interface SystemArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemArchitectureModal: React.FC<SystemArchitectureModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'algorithm' | 'rbac' | 'entities'>('architecture');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-[#E2E8F0] rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-[#E2E8F0] bg-[#F6F8FB] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4F46E5] text-[#F6F8FB] flex items-center justify-center shadow-xs">
              <BookOpen className="w-5 h-5 text-[#F6F8FB]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-serif font-bold text-[#0F172A]">
                  MISIONTEC: Fundamentos del Sistema & Cuidado Misionero
                </h2>
                <span className="text-[10px] bg-white text-[#4F46E5] border border-[#E2E8F0] font-mono px-2 py-0.5 rounded font-medium">
                  Guía Metodológica
                </span>
              </div>
              <p className="text-xs text-[#64748B]">
                Modelo conceptual, arquitectura en capas, algoritmo pastoral de semáforo de cuidado y matriz de roles.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#7B8BA3] hover:text-[#0F172A] rounded-lg hover:bg-[#EEF2F7]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2 px-6 pt-3 bg-white border-b border-[#E2E8F0] text-xs">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`pb-2.5 px-3 font-medium border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'architecture'
                ? 'border-[#4F46E5] text-[#0F172A] font-serif font-bold'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Layers className="w-4 h-4 text-[#4F46E5]" />
            <span>Arquitectura en Capas</span>
          </button>

          <button
            onClick={() => setActiveTab('algorithm')}
            className={`pb-2.5 px-3 font-medium border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'algorithm'
                ? 'border-[#4F46E5] text-[#0F172A] font-serif font-bold'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Calculator className="w-4 h-4 text-[#4F46E5]" />
            <span>Semáforo Pastoral</span>
          </button>

          <button
            onClick={() => setActiveTab('rbac')}
            className={`pb-2.5 px-3 font-medium border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'rbac'
                ? 'border-[#4F46E5] text-[#0F172A] font-serif font-bold'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-[#4F46E5]" />
            <span>Roles y Accesos (RBAC)</span>
          </button>

          <button
            onClick={() => setActiveTab('entities')}
            className={`pb-2.5 px-3 font-medium border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'entities'
                ? 'border-[#4F46E5] text-[#0F172A] font-serif font-bold'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Database className="w-4 h-4 text-[#4F46E5]" />
            <span>Modelo de Datos</span>
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 text-xs custom-scrollbar">
          {activeTab === 'architecture' && (
            <div className="space-y-4">
              <div className="p-4.5 bg-[#F6F8FB] rounded-xl border border-[#E2E8F0]">
                <h3 className="font-serif font-bold text-[#0F172A] mb-2 text-sm">
                  Patrón Arquitectónico: Plataforma Integral de Acompañamiento
                </h3>
                <p className="text-[#334155] leading-relaxed">
                  MISIONTEC implementa una estructura desacoplada que armoniza el registro fraterno, la georreferenciación de grupos de discipulado de Villavicencio, el cálculo preventivo del semáforo de deserción y el seguimiento pastoral personalizado.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 bg-white border border-[#E2E8F0] rounded-xl">
                  <div className="flex items-center gap-2 mb-2 font-serif font-bold text-[#0F172A]">
                    <Church className="w-4 h-4 text-[#4F46E5]" />
                    <span>Capa Visual & Pastoral</span>
                  </div>
                  <ul className="space-y-1 text-[#64748B] text-[11px]">
                    <li>• Estética fraterna & tipografía serif</li>
                    <li>• Paleta serena blanco y café</li>
                    <li>• Mapa interactivo con vector SVG</li>
                    <li>• Interfaz accesible para pastores y líderes</li>
                  </ul>
                </div>

                <div className="p-4 bg-white border border-[#E2E8F0] rounded-xl">
                  <div className="flex items-center gap-2 mb-2 font-serif font-bold text-[#0F172A]">
                    <HeartHandshake className="w-4 h-4 text-[#4F46E5]" />
                    <span>Capa de Cuidado</span>
                  </div>
                  <ul className="space-y-1 text-[#64748B] text-[11px]">
                    <li>• Semáforo de acompañamiento espiritual</li>
                    <li>• Embudo de 4 etapas de discipulado</li>
                    <li>• Toma rápida de asistencia de grupo</li>
                    <li>• Historial de fases de discipulado</li>
                  </ul>
                </div>

                <div className="p-4 bg-white border border-[#E2E8F0] rounded-xl">
                  <div className="flex items-center gap-2 mb-2 font-serif font-bold text-[#0F172A]">
                    <Database className="w-4 h-4 text-[#4F46E5]" />
                    <span>Capa de Datos & Territorio</span>
                  </div>
                  <ul className="space-y-1 text-[#64748B] text-[11px]">
                    <li>• Padrón unificado de miembros</li>
                    <li>• Coordenadas de los grupos en Villavicencio</li>
                    <li>• Historial de cambios de fase</li>
                    <li>• Organización de grupos por zonas</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'algorithm' && (
            <div className="space-y-3">
              <div className="p-4.5 bg-[#F6F8FB] rounded-xl border border-[#E2E8F0]">
                <h3 className="font-serif font-bold text-[#0F172A] mb-2 text-sm">
                  Cálculo Preventivo del Semáforo de Deserción Pastoral
                </h3>
                <p className="text-[#334155] leading-relaxed mb-3">
                  Para que ningún hermano nuevo o miembro sea descuidado, el sistema calcula en tiempo real las inasistencias consecutivas al grupo:
                </p>

                <div className="p-3 bg-white rounded-lg border border-[#D8DFEA] font-mono text-xs text-[#4F46E5]">
                  Semáforo = ROJO si Faltas ≥ 3 · AMARILLO si Faltas = 2 · VERDE si Faltas ≤ 1
                </div>
              </div>

              <div className="space-y-2">
                <div className="p-3.5 rounded-xl border border-[#FECACA] bg-[#FEF2F2] flex items-start gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-[#DC2626] mt-1 shrink-0" />
                  <div>
                    <h4 className="font-serif font-bold text-[#B91C1C]">Atención Urgente (Semáforo ROJO):</h4>
                    <p className="text-[11px] text-[#B91C1C]/90">
                      Tres o más inasistencias consecutivas al grupo. Aparece en las alertas del pastor y del asistente pastoral.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-[#FDE68A] bg-[#FEF3C7] flex items-start gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-[#D97706] mt-1 shrink-0" />
                  <div>
                    <h4 className="font-serif font-bold text-[#B45309]">Seguimiento Preventivo (Semáforo AMARILLO):</h4>
                    <p className="text-[11px] text-[#B45309]/90">
                      Dos inasistencias consecutivas. Se agenda en la lista prioritaria del líder de grupo.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-[#BBF7D0] bg-[#DCFCE7] flex items-start gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-[#16A34A] mt-1 shrink-0" />
                  <div>
                    <h4 className="font-serif font-bold text-[#166534]">En Comunión Activa (Semáforo VERDE):</h4>
                    <p className="text-[11px] text-[#166534]/90">
                      Asistencia regular al grupo (máximo 1 falta esporádica).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rbac' && (
            <div className="space-y-3">
              <p className="text-[#334155] text-xs">
                Cuatro roles en orden de jerarquía. Cada rol solo ve y hace lo que le corresponde:
              </p>
              <div className="overflow-x-auto border border-[#E2E8F0] rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F6F8FB] text-[#64748B] text-[10px] uppercase font-semibold border-b border-[#E2E8F0]">
                    <tr>
                      <th className="p-3">Nivel</th>
                      <th className="p-3">Rol</th>
                      <th className="p-3">Qué hace</th>
                      <th className="p-3">Funciones en la aplicación</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEF2F7]">
                    {ROLES.map((rol) => (
                      <tr key={rol.clave} className="align-top">
                        <td className="p-3 font-semibold text-[#4F46E5]">{rol.nivel}</td>
                        <td className="p-3 font-medium text-[#0F172A] whitespace-nowrap">{rol.nombre}</td>
                        <td className="p-3 text-[#64748B]">{rol.descripcion}</td>
                        <td className="p-3 text-[#334155]">
                          <ul className="space-y-0.5">
                            {rol.funciones.map((f) => (
                              <li key={f}>✓ {FUNCIONES[f]}</li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'entities' && (
            <div className="space-y-3">
              <p className="text-[#334155] text-xs">
                Entidades cardinales del sistema de gestión misionera:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-[#F6F8FB] rounded-xl border border-[#E2E8F0]">
                  <h4 className="font-serif font-bold text-[#0F172A]">HERMANO / PERSONA</h4>
                  <p className="text-[11px] text-[#64748B] mt-1">
                    id, código, DNI, nombres, teléfono, fase de discipulado, estado pastoral, grupo asignado, mentor, inasistencias consecutivas.
                  </p>
                </div>
                <div className="p-3.5 bg-[#F6F8FB] rounded-xl border border-[#E2E8F0]">
                  <h4 className="font-serif font-bold text-[#0F172A]">GRUPO DE DISCIPULADO</h4>
                  <p className="text-[11px] text-[#64748B] mt-1">
                    id, nombre del grupo, pastor/líder, zona, distrito, latitud, longitud, día y hora de comunión, total de hermanos.
                  </p>
                </div>
                <div className="p-3.5 bg-[#F6F8FB] rounded-xl border border-[#E2E8F0]">
                  <h4 className="font-serif font-bold text-[#0F172A]">ASISTENCIA DE GRUPO</h4>
                  <p className="text-[11px] text-[#64748B] mt-1">
                    id, grupo, fecha, tema del mensaje bíblico, lista de asistencia (presente / falta justificada / ausente).
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-[#E2E8F0] flex items-center justify-end bg-[#F6F8FB]">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-[#F6F8FB] rounded-lg text-xs font-medium cursor-pointer transition-colors"
          >
            Cerrar Ficha Técnica
          </button>
        </div>
      </div>
    </div>
  );
};
