import React, { useState } from 'react';
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

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  groups,
  onSelectGroup,
  onQuickAttendanceForGroup
}) => {
  const [selectedGroup, setSelectedGroup] = useState<MissionaryGroup | null>(groups[0] || null);
  const [searchRadiusKm, setSearchRadiusKm] = useState<number>(10);
  const [mapLayer, setMapLayer] = useState<'streets' | 'satellite' | 'heatmap'>('streets');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const mapWidth = 800;
  const mapHeight = 460;

  const latToY = (lat: number) => {
    const minLat = -12.22;
    const maxLat = -11.95;
    const ratio = (lat - minLat) / (maxLat - minLat);
    return mapHeight - ratio * mapHeight;
  };

  const lngToX = (lng: number) => {
    const minLng = -77.16;
    const maxLng = -76.95;
    const ratio = (lng - minLng) / (maxLng - minLng);
    return ratio * mapWidth;
  };

  const radiusInPixels = (km: number) => {
    return km * 18 * zoomLevel;
  };

  const handlePinClick = (group: MissionaryGroup) => {
    setSelectedGroup(group);
    if (onSelectGroup) onSelectGroup(group);
  };

  const resetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setSelectedGroup(groups[0]);
  };

  return (
    <div className="bg-white border border-[#E8DFD7] rounded-xl shadow-xs overflow-hidden flex flex-col">
      {/* Map Header Toolbar */}
      <div className="p-4.5 border-b border-[#E8DFD7] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-serif font-bold text-[#2D1F17] flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#8C5D36]" />
              Geolocalización de Células y Hogares de Oración
            </h2>
            <span className="text-xs bg-[#FAF7F2] text-[#7D6B5E] border border-[#E8DFD7] font-medium px-2 py-0.5 rounded">
              {groups.length} Células
            </span>
          </div>
          <p className="text-xs text-[#7D6B5E] mt-0.5">
            Distribución territorial de puntos de reunión, cobertura pastoral y comunidades fraternas.
          </p>
        </div>

        {/* Controls: Search radius, Layer toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-[#FAF7F2] border border-[#E0D4C7] px-2.5 py-1 rounded-lg text-xs">
            <Navigation className="w-3.5 h-3.5 text-[#8C5D36]" />
            <span className="text-[#7D6B5E] text-[11px]">Radio de Cobertura:</span>
            <select
              value={searchRadiusKm}
              onChange={(e) => setSearchRadiusKm(Number(e.target.value))}
              className="bg-transparent font-medium text-[#2D1F17] focus:outline-none text-xs cursor-pointer"
            >
              <option value={2}>2 km (Barrial)</option>
              <option value={5}>5 km (Distrital)</option>
              <option value={10}>10 km (Inter-Zonas)</option>
              <option value={20}>20 km (Metropolitano)</option>
            </select>
          </div>

          <div className="flex items-center gap-1 bg-[#FAF7F2] border border-[#E0D4C7] p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setMapLayer('streets')}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                mapLayer === 'streets' 
                  ? 'bg-white text-[#2D1F17] shadow-xs' 
                  : 'text-[#7D6B5E] hover:text-[#2D1F17]'
              }`}
            >
              Cartográfico
            </button>
            <button
              onClick={() => setMapLayer('satellite')}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                mapLayer === 'satellite' 
                  ? 'bg-white text-[#2D1F17] shadow-xs' 
                  : 'text-[#7D6B5E] hover:text-[#2D1F17]'
              }`}
            >
              Territorial
            </button>
            <button
              onClick={() => setMapLayer('heatmap')}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                mapLayer === 'heatmap' 
                  ? 'bg-white text-[#2D1F17] shadow-xs' 
                  : 'text-[#7D6B5E] hover:text-[#2D1F17]'
              }`}
            >
              Densidad
            </button>
          </div>
        </div>
      </div>

      {/* Map Visual Stage */}
      <div className="relative w-full h-[380px] sm:h-[420px] bg-[#F7F3EC] overflow-hidden select-none border-b border-[#E8DFD7]">
        <svg 
          viewBox={`0 0 ${mapWidth} ${mapHeight}`} 
          className="w-full h-full object-cover transition-transform duration-300"
          style={{
            transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
            transformOrigin: 'center center'
          }}
        >
          <defs>
            <pattern id="grid-pattern-coffee" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E6DDD2" strokeWidth="0.75" />
            </pattern>

            <radialGradient id="radar-glow-coffee" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#8C5D36" stopOpacity="0.25" />
              <stop offset="70%" stopColor="#8C5D36" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#8C5D36" stopOpacity="0.0" />
            </radialGradient>

            <filter id="heat-blur-coffee">
              <feGaussianBlur stdDeviation="25" />
            </filter>
          </defs>

          {/* Base Paper Canvas */}
          <rect width={mapWidth} height={mapHeight} fill={mapLayer === 'satellite' ? '#EFE9DE' : '#F7F3EC'} />
          <rect width={mapWidth} height={mapHeight} fill="url(#grid-pattern-coffee)" />

          {/* Pacific Coastline in soft warm linen/water */}
          <path
            d="M 0,0 L 140,0 Q 180,120 160,220 T 130,340 Q 110,410 70,460 L 0,460 Z"
            fill="#E2DBD0"
            opacity="0.9"
          />
          <text x="35" y="240" fill="#998576" fontSize="11" opacity="0.6" transform="rotate(-75 35 240)" fontFamily="Cinzel, serif" letterSpacing="4">
            OCÉANO PACÍFICO
          </text>

          {/* Road Network / Boundaries */}
          <g stroke="#DDD3C5" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.8">
            <path d="M 160,50 Q 280,180 320,320 T 360,460" stroke="#C7B8A6" strokeWidth="2" strokeDasharray="none" />
            <path d="M 180,240 Q 380,220 540,260 T 780,290" stroke="#C7B8A6" strokeWidth="2" strokeDasharray="none" />
            <path d="M 140,140 Q 260,110 400,90" />
            <path d="M 170,280 Q 290,300 480,310" />
            <path d="M 320,100 L 320,380" />
            <path d="M 500,60 L 500,420" />
          </g>

          {/* District Labels */}
          <text x="240" y="80" fill="#7D6B5E" fontSize="10" fontWeight="600" opacity="0.8" fontFamily="serif">ZONA NORTE (Los Olivos)</text>
          <text x="330" y="220" fill="#7D6B5E" fontSize="10" fontWeight="600" opacity="0.8" fontFamily="serif">ZONA CENTRO (Jesús María)</text>
          <text x="270" y="380" fill="#7D6B5E" fontSize="10" fontWeight="600" opacity="0.8" fontFamily="serif">ZONA SUR (Chorrillos)</text>
          <text x="560" y="160" fill="#7D6B5E" fontSize="10" fontWeight="600" opacity="0.8" fontFamily="serif">ZONA ESTE (SJL)</text>
          <text x="180" y="200" fill="#7D6B5E" fontSize="10" fontWeight="600" opacity="0.8" fontFamily="serif">CALLAO</text>

          {/* Heatmap Layer */}
          {mapLayer === 'heatmap' && (
            <g filter="url(#heat-blur-coffee)">
              {groups.map((g) => (
                <circle
                  key={`heat-${g.id}`}
                  cx={lngToX(g.lng)}
                  cy={latToY(g.lat)}
                  r={g.memberCount * 2.2}
                  fill={g.averageAttendanceRate > 85 ? '#486341' : g.averageAttendanceRate > 70 ? '#B38646' : '#9E382A'}
                  opacity="0.45"
                />
              ))}
            </g>
          )}

          {/* Radius Radar Circle */}
          {selectedGroup && (
            <g>
              <circle
                cx={lngToX(selectedGroup.lng)}
                cy={latToY(selectedGroup.lat)}
                r={radiusInPixels(searchRadiusKm)}
                fill="url(#radar-glow-coffee)"
                stroke="#8C5D36"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <circle
                cx={lngToX(selectedGroup.lng)}
                cy={latToY(selectedGroup.lat)}
                r={radiusInPixels(searchRadiusKm) * 0.5}
                fill="none"
                stroke="#B8A18E"
                strokeWidth="1"
                strokeDasharray="2 2"
                opacity="0.5"
              />
            </g>
          )}

          {/* Pins */}
          {groups.map((grp) => {
            const x = lngToX(grp.lng);
            const y = latToY(grp.lat);
            const isSelected = selectedGroup?.id === grp.id;
            const isCritical = grp.status === 'watch' || grp.criticalMembersCount > 1;

            return (
              <g 
                key={grp.id} 
                className="cursor-pointer"
                onClick={() => handlePinClick(grp)}
              >
                {isSelected && (
                  <circle
                    cx={x}
                    cy={y}
                    r="16"
                    fill="none"
                    stroke="#8C5D36"
                    strokeWidth="1.5"
                    className="animate-ping opacity-60"
                  />
                )}

                {/* Outer Pin circle */}
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? "13" : "10"}
                  fill={isCritical ? "#9E382A" : grp.averageAttendanceRate >= 85 ? "#486341" : "#B38646"}
                  stroke="#FFFFFF"
                  strokeWidth={isSelected ? "2" : "1.5"}
                />

                {/* Inner member count */}
                <text
                  x={x}
                  y={y + 3.5}
                  fill="#FFFFFF"
                  fontSize={isSelected ? "9" : "8"}
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {grp.memberCount}
                </text>

                {/* Tooltip Label */}
                <text
                  x={x}
                  y={y - 14}
                  fill="#2D1F17"
                  fontSize="10"
                  fontWeight="600"
                  textAnchor="middle"
                  className="pointer-events-none"
                >
                  {grp.name.split(' ')[0]} {grp.name.split(' ')[1] || ''}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Map Zoom Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-1.5 z-10">
          <button
            onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 2.5))}
            className="w-8 h-8 rounded-lg bg-white border border-[#E0D4C7] text-[#4A3425] hover:bg-[#FAF7F2] flex items-center justify-center shadow-xs transition-colors"
            title="Acercar"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.75))}
            className="w-8 h-8 rounded-lg bg-white border border-[#E0D4C7] text-[#4A3425] hover:bg-[#FAF7F2] flex items-center justify-center shadow-xs transition-colors"
            title="Alejar"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={resetView}
            className="w-8 h-8 rounded-lg bg-white border border-[#E0D4C7] text-[#4A3425] hover:bg-[#FAF7F2] flex items-center justify-center shadow-xs transition-colors"
            title="Centrar"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Floating Legend */}
        <div className="absolute bottom-3 left-3 bg-white/95 border border-[#E8DFD7] rounded-lg p-2.5 backdrop-blur-xs text-[10px] text-[#7D6B5E] z-10 space-y-1.5 shadow-sm hidden sm:block">
          <p className="font-semibold text-[#2D1F17] uppercase tracking-wider text-[9px]">Simbología de Células:</p>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#486341]" />
            <span>Perseverancia Alta (&gt;85%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B38646]" />
            <span>Asistencia Media (70-84%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#9E382A]" />
            <span>Atención Pastoral Requerida (&lt;70%)</span>
          </div>
        </div>

        {/* Selected Group Detail Card */}
        {selectedGroup && (
          <div className="absolute bottom-3 right-3 max-w-sm w-80 bg-white border border-[#E0D4C7] rounded-xl shadow-md p-3.5 z-20">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <span className="text-[10px] font-medium text-[#8C5D36] bg-[#FAF7F2] border border-[#E8DFD7] px-1.5 py-0.5 rounded">
                  {selectedGroup.code}
                </span>
                <h3 className="text-xs font-serif font-bold text-[#2D1F17] mt-1 flex items-center gap-1.5">
                  <Church className="w-3.5 h-3.5 text-[#8C5D36]" />
                  {selectedGroup.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedGroup(null)}
                className="text-[#998576] hover:text-[#2D1F17] p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 text-xs text-[#5C4535] mb-3">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#998576] shrink-0" />
                <span className="truncate">{selectedGroup.address} ({selectedGroup.zone})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#998576] shrink-0" />
                <span>Anfitrión/Líder: <strong className="text-[#2D1F17]">{selectedGroup.leaderName}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#998576] shrink-0" />
                <span>Día: <strong>{selectedGroup.meetingDay}s, {selectedGroup.meetingTime} hrs</strong></span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 p-2 bg-[#FAF7F2] border border-[#E8DFD7] rounded-lg text-center mb-3">
              <div>
                <p className="text-[10px] text-[#7D6B5E]">Miembros en Célula</p>
                <p className="text-sm font-serif font-bold text-[#2D1F17]">{selectedGroup.memberCount}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#7D6B5E]">Perseverancia</p>
                <p className={`text-sm font-serif font-bold ${
                  selectedGroup.averageAttendanceRate >= 85 ? 'text-[#486341]' :
                  selectedGroup.averageAttendanceRate >= 75 ? 'text-[#B38646]' : 'text-[#9E382A]'
                }`}>
                  {selectedGroup.averageAttendanceRate}%
                </p>
              </div>
            </div>

            <button
              onClick={() => onQuickAttendanceForGroup && onQuickAttendanceForGroup(selectedGroup.id)}
              className="w-full py-1.5 px-2.5 bg-[#3B281C] hover:bg-[#2D1F17] text-[#FAF7F2] rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Registrar Asistencia en este Hogar</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
