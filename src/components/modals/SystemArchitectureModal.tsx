import React, { useState } from 'react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D1F17]/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-[#E8DFD7] rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#E8DFD7] bg-[#FAF7F2] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3B281C] text-[#FAF7F2] flex items-center justify-center shadow-xs">
              <BookOpen className="w-5 h-5 text-[#FAF7F2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-serif font-bold text-[#2D1F17]">
                  MISIONTEC: Fundamentos del Sistema & Cuidado Misionero
                </h2>
                <span className="text-[10px] bg-white text-[#8C5D36] border border-[#E8DFD7] font-mono px-2 py-0.5 rounded font-medium">
                  Guía Metodológica
                </span>
              </div>
              <p className="text-xs text-[#7D6B5E]">
                Modelo conceptual, arquitectura en capas, algoritmo pastoral de semáforo de cuidado y matriz de roles.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#998576] hover:text-[#2D1F17] rounded-lg hover:bg-[#F2ECE4]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 bg-white border-b border-[#E8DFD7] text-xs">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`pb-2.5 px-3 font-medium border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'architecture'
                ? 'border-[#8C5D36] text-[#2D1F17] font-serif font-bold'
                : 'border-transparent text-[#7D6B5E] hover:text-[#2D1F17]'
            }`}
          >
            <Layers className="w-4 h-4 text-[#8C5D36]" />
            <span>Arquitectura en Capas</span>
          </button>

          <button
            onClick={() => setActiveTab('algorithm')}
            className={`pb-2.5 px-3 font-medium border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'algorithm'
                ? 'border-[#8C5D36] text-[#2D1F17] font-serif font-bold'
                : 'border-transparent text-[#7D6B5E] hover:text-[#2D1F17]'
            }`}
          >
            <Calculator className="w-4 h-4 text-[#8C5D36]" />
            <span>Semáforo Pastoral</span>
          </button>

          <button
            onClick={() => setActiveTab('rbac')}
            className={`pb-2.5 px-3 font-medium border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'rbac'
                ? 'border-[#8C5D36] text-[#2D1F17] font-serif font-bold'
                : 'border-transparent text-[#7D6B5E] hover:text-[#2D1F17]'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-[#8C5D36]" />
            <span>Roles y Accesos (RBAC)</span>
          </button>

          <button
            onClick={() => setActiveTab('entities')}
            className={`pb-2.5 px-3 font-medium border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'entities'
                ? 'border-[#8C5D36] text-[#2D1F17] font-serif font-bold'
                : 'border-transparent text-[#7D6B5E] hover:text-[#2D1F17]'
            }`}
          >
            <Database className="w-4 h-4 text-[#8C5D36]" />
            <span>Modelo de Datos</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs custom-scrollbar">
          {activeTab === 'architecture' && (
            <div className="space-y-4">
              <div className="p-4.5 bg-[#FAF7F2] rounded-xl border border-[#E8DFD7]">
                <h3 className="font-serif font-bold text-[#2D1F17] mb-2 text-sm">
                  Patrón Arquitectónico: Plataforma Integral de Acompañamiento
                </h3>
                <p className="text-[#5C4535] leading-relaxed">
                  MISIONTEC implementa una estructura desacoplada que armoniza el registro fraterno, la georreferenciación de células en hogares de Villavicencio, el cálculo preventivo del semáforo de deserción y el seguimiento pastoral personalizado.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 bg-white border border-[#E8DFD7] rounded-xl">
                  <div className="flex items-center gap-2 mb-2 font-serif font-bold text-[#2D1F17]">
                    <Church className="w-4 h-4 text-[#8C5D36]" />
                    <span>Capa Visual & Pastoral</span>
                  </div>
                  <ul className="space-y-1 text-[#7D6B5E] text-[11px]">
                    <li>• Estética fraterna & tipografía serif</li>
                    <li>• Paleta serena blanco y café</li>
                    <li>• Mapa interactivo con vector SVG</li>
                    <li>• Interfaz accesible para pastores y líderes</li>
                  </ul>
                </div>

                <div className="p-4 bg-white border border-[#E8DFD7] rounded-xl">
                  <div className="flex items-center gap-2 mb-2 font-serif font-bold text-[#2D1F17]">
                    <HeartHandshake className="w-4 h-4 text-[#8C5D36]" />
                    <span>Capa de Cuidado</span>
                  </div>
                  <ul className="space-y-1 text-[#7D6B5E] text-[11px]">
                    <li>• Semáforo de acompañamiento espiritual</li>
                    <li>• Embudo de 4 etapas de discipulado</li>
                    <li>• Toma rápida de asistencia celular</li>
                    <li>• Bitácora histórica inmutable</li>
                  </ul>
                </div>

                <div className="p-4 bg-white border border-[#E8DFD7] rounded-xl">
                  <div className="flex items-center gap-2 mb-2 font-serif font-bold text-[#2D1F17]">
                    <Database className="w-4 h-4 text-[#8C5D36]" />
                    <span>Capa de Datos & Territorio</span>
                  </div>
                  <ul className="space-y-1 text-[#7D6B5E] text-[11px]">
                    <li>• Padrón unificado de miembros</li>
                    <li>• Coordenadas de los grupos en Villavicencio</li>
                    <li>• Trazabilidad y auditoría de cambios</li>
                    <li>• Agrupación celular por zonas</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'algorithm' && (
            <div className="space-y-3">
              <div className="p-4.5 bg-[#FAF7F2] rounded-xl border border-[#E8DFD7]">
                <h3 className="font-serif font-bold text-[#2D1F17] mb-2 text-sm">
                  Cálculo Preventivo del Semáforo de Deserción Pastoral
                </h3>
                <p className="text-[#5C4535] leading-relaxed mb-3">
                  Para que ningún hermano nuevo o miembro sea descuidado, el sistema pondera en tiempo real las inasistencias y los días sin contacto pastoral:
                </p>

                <div className="p-3 bg-white rounded-lg border border-[#E0D4C7] font-mono text-xs text-[#8C5D36]">
                  Índice_Atención = (AusenciasConsecutivas × 3.0) + (DíasSinContacto / 7 × 1.5)
                </div>
              </div>

              <div className="space-y-2">
                <div className="p-3.5 rounded-xl border border-[#F2D0CC] bg-[#FDF7F6] flex items-start gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-[#9E382A] mt-1 shrink-0" />
                  <div>
                    <h4 className="font-serif font-bold text-[#8C3527]">Atención Urgente (Semáforo ROJO):</h4>
                    <p className="text-[11px] text-[#8C3527]/90">
                      Inasistencias &ge; 3 consecutivas O más de 21 días sin llamada o visita pastoral. Dispara notificación inmediata al pastor del distrito.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-[#EBDCC2] bg-[#FAF2E1] flex items-start gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-[#B38646] mt-1 shrink-0" />
                  <div>
                    <h4 className="font-serif font-bold text-[#946A1B]">Seguimiento Preventivo (Semáforo AMARILLO):</h4>
                    <p className="text-[11px] text-[#946A1B]/90">
                      Inasistencias = 2 consecutivas O más de 15 días sin reporte de contacto. Se agenda en la lista prioritaria del líder de célula.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-[#D4E4CF] bg-[#EBF2E8] flex items-start gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-[#486341] mt-1 shrink-0" />
                  <div>
                    <h4 className="font-serif font-bold text-[#3D5636]">En Comunión Activa (Semáforo VERDE):</h4>
                    <p className="text-[11px] text-[#3D5636]/90">
                      Asistencia regular (máximo 1 falta esporádica) y contacto fraterno activo dentro de la semana.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rbac' && (
            <div className="space-y-3">
              <p className="text-[#5C4535] text-xs">
                Estructura de roles para proteger la intimidad y confidencialidad pastoral:
              </p>
              <div className="overflow-x-auto border border-[#E8DFD7] rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF7F2] text-[#7D6B5E] text-[10px] uppercase font-semibold border-b border-[#E8DFD7]">
                    <tr>
                      <th className="p-3">Rol Ministerial</th>
                      <th className="p-3">Alcance</th>
                      <th className="p-3">Toma de Asistencia</th>
                      <th className="p-3">Seguimientos</th>
                      <th className="p-3">Reportes & Bitácora</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F2ECE4]">
                    <tr>
                      <td className="p-3 font-medium text-[#2D1F17]">Pastor General</td>
                      <td className="p-3 text-[#7D6B5E]">Toda la Misión</td>
                      <td className="p-3 text-[#486341] font-medium">✓ Total</td>
                      <td className="p-3 text-[#486341] font-medium">✓ Total</td>
                      <td className="p-3 text-[#486341] font-medium">✓ Total + Bitácora</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-[#2D1F17]">Pastor de Zona</td>
                      <td className="p-3 text-[#7D6B5E]">Zona Territorial</td>
                      <td className="p-3 text-[#486341] font-medium">✓ Total Zona</td>
                      <td className="p-3 text-[#486341] font-medium">✓ Total Zona</td>
                      <td className="p-3 text-[#8C5D36] font-medium">✓ Reportes de Zona</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-[#2D1F17]">Líder de Célula</td>
                      <td className="p-3 text-[#7D6B5E]">Célula en Hogar</td>
                      <td className="p-3 text-[#486341] font-medium">✓ Su Grupo</td>
                      <td className="p-3 text-[#486341] font-medium">✓ Sus Discípulos</td>
                      <td className="p-3 text-[#998576]">Lectura Básica</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'entities' && (
            <div className="space-y-3">
              <p className="text-[#5C4535] text-xs">
                Entidades cardinales del sistema de gestión misionera:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#E8DFD7]">
                  <h4 className="font-serif font-bold text-[#2D1F17]">HERMANO / PERSONA</h4>
                  <p className="text-[11px] text-[#7D6B5E] mt-1">
                    id, código, DNI, nombres, teléfono, fase de discipulado, estado pastoral, célula asignada, mentor, inasistencias consecutivas.
                  </p>
                </div>
                <div className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#E8DFD7]">
                  <h4 className="font-serif font-bold text-[#2D1F17]">CÉLULA EN HOGAR</h4>
                  <p className="text-[11px] text-[#7D6B5E] mt-1">
                    id, nombre de célula, pastor/líder, zona, distrito, latitud, longitud, día y hora de comunión, total de hermanos.
                  </p>
                </div>
                <div className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#E8DFD7]">
                  <h4 className="font-serif font-bold text-[#2D1F17]">ASISTENCIA CELULAR</h4>
                  <p className="text-[11px] text-[#7D6B5E] mt-1">
                    id, célula, fecha, tema del mensaje bíblico, lista de asistencia (presente / falta justificada / ausente).
                  </p>
                </div>
                <div className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#E8DFD7]">
                  <h4 className="font-serif font-bold text-[#2D1F17]">SEGUIMIENTO PASTORAL</h4>
                  <p className="text-[11px] text-[#7D6B5E] mt-1">
                    id, hermano, fecha de visita o llamada, canal, estado anímico/espiritual, notas, compromisos, estado resultante.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E8DFD7] flex items-center justify-end bg-[#FAF7F2]">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#3B281C] hover:bg-[#2D1F17] text-[#FAF7F2] rounded-lg text-xs font-medium cursor-pointer transition-colors"
          >
            Cerrar Ficha Técnica
          </button>
        </div>
      </div>
    </div>
  );
};
