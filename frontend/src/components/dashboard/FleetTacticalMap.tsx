import React, { useState } from 'react';
import {
  Compass,
  Waves,
  ShieldCheck,
  Anchor,
} from 'lucide-react';
import { Vessel } from '../../types';
import { Badge } from '../ui/Badge';

interface FleetTacticalMapProps {
  fleet: Vessel[];
  selectedVessel: Vessel;
  onSelectVessel: (id: string) => void;
}

interface GreenCorridor {
  id: string;
  name: string;
  from: string;
  to: string;
  distanceNm: number;
  fuelType: string;
  co2ReductionPct: number;
  path: { x: number; y: number }[];
}

const GREEN_CORRIDORS: GreenCorridor[] = [
  {
    id: 'gc-1',
    name: 'Asia-Europe Green Silk Corridor',
    from: 'Singapore (SGSIN)',
    to: 'Rotterdam (NLRTM)',
    distanceNm: 8420,
    fuelType: 'LNG / Bio-MGO',
    co2ReductionPct: 42.5,
    path: [
      { x: 720, y: 310 }, // Singapore
      { x: 620, y: 290 }, // Malacca
      { x: 520, y: 260 }, // Arabian Sea
      { x: 450, y: 230 }, // Gulf of Aden
      { x: 420, y: 190 }, // Red Sea / Suez
      { x: 380, y: 160 }, // Mediterranean
      { x: 340, y: 130 }, // Gibraltar
      { x: 350, y: 85 },  // Rotterdam
    ],
  },
  {
    id: 'gc-2',
    name: 'Transpacific Net-Zero Corridor',
    from: 'Qingdao (CNQDG)',
    to: 'Los Angeles (USLAX)',
    distanceNm: 5800,
    fuelType: 'e-Methanol',
    co2ReductionPct: 68.0,
    path: [
      { x: 760, y: 190 }, // Qingdao
      { x: 830, y: 160 }, // North Pacific
      { x: 920, y: 170 }, // Pacific Mid
      { x: 170, y: 180 }, // US West Coast
    ],
  },
  {
    id: 'gc-3',
    name: 'North Atlantic Bio-Corridor',
    from: 'Rotterdam (NLRTM)',
    to: 'New York (USNYC)',
    distanceNm: 3450,
    fuelType: 'Green e-Methanol',
    co2ReductionPct: 82.0,
    path: [
      { x: 350, y: 85 },  // Rotterdam
      { x: 280, y: 110 }, // English Channel
      { x: 200, y: 130 }, // North Atlantic
      { x: 140, y: 140 }, // New York
    ],
  },
  {
    id: 'gc-4',
    name: 'Australia-Asia Bulk Green Route',
    from: 'Port Hedland (AUPHE)',
    to: 'Qingdao (CNQDG)',
    distanceNm: 3920,
    fuelType: 'Biofuel B30 Blend',
    co2ReductionPct: 45.0,
    path: [
      { x: 740, y: 400 }, // Port Hedland
      { x: 720, y: 350 }, // Sunda Strait
      { x: 750, y: 260 }, // South China Sea
      { x: 760, y: 190 }, // Qingdao
    ],
  },
];

export const FleetTacticalMap: React.FC<FleetTacticalMapProps> = ({
  fleet,
  selectedVessel,
  onSelectVessel,
}) => {
  const [activeCorridorId, setActiveCorridorId] = useState<string>('gc-1');
  const [showWeatherOverlay, setShowWeatherOverlay] = useState<boolean>(true);
  const [showEcaZones, setShowEcaZones] = useState<boolean>(true);

  // Map coordinate projection helper for global SVG map (Mercator approximation)
  const projectToMap = (lat: number, lng: number) => {
    const x = ((lng + 180) / 360) * 900 + 40;
    const y = ((75 - lat) / 135) * 390 + 50;
    return { x: Math.max(30, Math.min(950, x)), y: Math.max(40, Math.min(450, y)) };
  };

  const activeCorridor = GREEN_CORRIDORS.find((c) => c.id === activeCorridorId) || GREEN_CORRIDORS[0];

  return (
    <div className="bg-white border border-border rounded-card shadow-xs overflow-hidden flex flex-col">
      {/* Map Header Toolbar */}
      <div className="p-4 border-b border-border flex flex-wrap items-center justify-between gap-3 bg-background-panel/60">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-teal-light text-teal rounded-lg border border-teal/20">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-navy-primary">
                Global Green Maritime Corridors & Tactical Fleet Routing
              </h2>
              <Badge variant="teal" size="sm" dot>
                Live AIS Satellite Link
              </Badge>
            </div>
            <p className="text-[11px] text-navy-secondary">
              Real-time vessel positions, ECA emission control areas, quantum-optimized green tracks, and weather overlays.
            </p>
          </div>
        </div>

        {/* Map Layer Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowWeatherOverlay(!showWeatherOverlay)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
              showWeatherOverlay
                ? 'bg-teal text-white border-teal shadow-xs'
                : 'bg-white text-navy-secondary border-border hover:bg-background-panel'
            }`}
          >
            <Waves className="h-3.5 w-3.5" />
            <span>Sea State & Wind</span>
          </button>

          <button
            onClick={() => setShowEcaZones(!showEcaZones)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
              showEcaZones
                ? 'bg-violet text-white border-violet shadow-xs'
                : 'bg-white text-navy-secondary border-border hover:bg-background-panel'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>ECA Zones (0.1% S)</span>
          </button>
        </div>
      </div>

      {/* SVG Tactical Maritime Map Canvas */}
      <div className="relative w-full h-[360px] bg-[#0E1E2E] overflow-hidden select-none">
        <svg
          viewBox="0 0 1000 480"
          className="w-full h-full object-cover"
          style={{ filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.5))' }}
        >
          <defs>
            <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0B1A28" />
              <stop offset="100%" stopColor="#081420" />
            </linearGradient>

            <filter id="corridorGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            <pattern id="grid" width="80" height="60" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 60" fill="none" stroke="#162E44" strokeWidth="0.5" strokeDasharray="3 3" />
            </pattern>
          </defs>

          {/* Ocean Base */}
          <rect width="1000" height="480" fill="url(#oceanGradient)" />
          <rect width="1000" height="480" fill="url(#grid)" opacity="0.6" />

          {/* Stylized Continents */}
          <g fill="#14283C" stroke="#1E3E5C" strokeWidth="0.8">
            <path d="M 100,60 L 220,60 L 240,90 L 230,140 L 190,160 L 160,200 L 140,180 L 110,130 Z" />
            <path d="M 180,220 L 240,230 L 270,290 L 240,380 L 210,380 L 190,290 Z" />
            <path d="M 330,60 L 440,65 L 430,120 L 390,140 L 350,140 L 330,100 Z" />
            <path d="M 350,160 L 460,160 L 490,240 L 460,340 L 410,370 L 370,280 L 350,200 Z" />
            <path d="M 460,70 L 780,75 L 810,180 L 760,240 L 640,240 L 580,180 L 460,140 Z" />
            <path d="M 580,210 L 640,210 L 620,290 L 590,280 Z" />
            <path d="M 700,280 L 770,290 L 750,340 L 690,320 Z" />
            <path d="M 720,350 L 830,340 L 840,420 L 740,430 Z" />
            <path d="M 800,140 L 830,140 L 820,190 L 795,180 Z" />
            <path d="M 330,80 L 350,80 L 340,110 Z" />
          </g>

          {/* ECA Zones */}
          {showEcaZones && (
            <g fill="#463C77" fillOpacity="0.25" stroke="#7E6FB5" strokeWidth="1" strokeDasharray="3 2">
              <circle cx="355" cy="95" r="32" />
              <ellipse cx="140" cy="150" rx="35" ry="50" />
              <ellipse cx="120" cy="120" rx="25" ry="40" />
              <ellipse cx="400" cy="150" rx="45" ry="18" />
            </g>
          )}

          {/* Weather Wave Overlays */}
          {showWeatherOverlay && (
            <g opacity="0.4" stroke="#00B4D8" strokeWidth="1" strokeDasharray="4 4" fill="none">
              <path d="M 220,110 Q 250,100 280,110 T 340,110" />
              <path d="M 210,125 Q 240,115 270,125 T 330,125" />
              <path d="M 500,310 Q 540,295 580,310 T 660,310" />
              <path d="M 820,200 Q 860,190 900,200" />
            </g>
          )}

          {/* Green Maritime Corridors Routes */}
          {GREEN_CORRIDORS.map((corridor) => {
            const isSelected = corridor.id === activeCorridorId;
            const pointsStr = corridor.path.map((p) => `${p.x},${p.y}`).join(' ');

            return (
              <g key={corridor.id} className="cursor-pointer" onClick={() => setActiveCorridorId(corridor.id)}>
                <polyline
                  points={pointsStr}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="24"
                />
                <polyline
                  points={pointsStr}
                  fill="none"
                  stroke={isSelected ? '#00E5FF' : '#0E7C7B'}
                  strokeWidth={isSelected ? '3.5' : '1.8'}
                  strokeDasharray={isSelected ? 'none' : '4 3'}
                  opacity={isSelected ? 1 : 0.6}
                  filter={isSelected ? 'url(#corridorGlow)' : undefined}
                />
                {corridor.path.map((pt, idx) => (
                  <circle
                    key={idx}
                    cx={pt.x}
                    cy={pt.y}
                    r={isSelected ? (idx === 0 || idx === corridor.path.length - 1 ? 4.5 : 2.5) : 2}
                    fill={idx === 0 ? '#0D8050' : idx === corridor.path.length - 1 ? '#00B4D8' : '#FFFFFF'}
                    stroke="#0A1826"
                    strokeWidth="1"
                  />
                ))}
              </g>
            );
          })}

          {/* Active Fleet Vessel Markers */}
          {fleet.map((vessel) => {
            const { x, y } = projectToMap(vessel.lat, vessel.lng);
            const isSelected = vessel.id === selectedVessel.id;
            const headingRad = ((vessel.heading - 90) * Math.PI) / 180;
            const vectorLen = 14;
            const vx = x + vectorLen * Math.cos(headingRad);
            const vy = y + vectorLen * Math.sin(headingRad);

            return (
              <g
                key={vessel.id}
                className="cursor-pointer transition-transform duration-300"
                onClick={() => onSelectVessel(vessel.id)}
              >
                {isSelected && (
                  <circle
                    cx={x}
                    cy={y}
                    r="16"
                    fill="none"
                    stroke="#00E5FF"
                    strokeWidth="1.5"
                    className="animate-ping opacity-75"
                  />
                )}

                <line
                  x1={x}
                  y1={y}
                  x2={vx}
                  y2={vy}
                  stroke={isSelected ? '#00E5FF' : '#0E7C7B'}
                  strokeWidth="2"
                  strokeLinecap="round"
                />

                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? '7' : '5'}
                  fill={
                    vessel.ciiRating === 'A'
                      ? '#0D8050'
                      : vessel.ciiRating === 'B'
                      ? '#0E7C7B'
                      : vessel.ciiRating === 'C'
                      ? '#B9790A'
                      : '#C5221F'
                  }
                  stroke="#FFFFFF"
                  strokeWidth={isSelected ? '2' : '1.2'}
                />

                <g transform={`translate(${x + 10}, ${y - 8})`}>
                  <rect
                    x="-2"
                    y="-12"
                    width={vessel.name.length * 6.5 + 28}
                    height="18"
                    rx="4"
                    fill="#081420"
                    fillOpacity="0.85"
                    stroke={isSelected ? '#00E5FF' : '#1E3E5C'}
                    strokeWidth="1"
                  />
                  <text
                    x="4"
                    y="1"
                    fill={isSelected ? '#00E5FF' : '#FFFFFF'}
                    fontSize="9.5"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {vessel.name.replace('MV ', '')}
                  </text>
                  <text
                    x={vessel.name.length * 6.5 + 6}
                    y="1"
                    fill={vessel.ciiRating === 'A' ? '#10B981' : '#F59E0B'}
                    fontSize="8.5"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    [{vessel.ciiRating}]
                  </text>
                </g>
              </g>
            );
          })}
        </svg>

        {/* Quick Stats Overlay on Map */}
        <div className="absolute bottom-3 left-3 bg-[#081420]/90 backdrop-blur-md border border-[#1E3E5C] rounded-lg p-2.5 text-white max-w-sm">
          <div className="flex items-center justify-between gap-4 pb-1 border-b border-[#1E3E5C]/60 text-[10px] font-mono text-cyan-400">
            <span className="font-bold flex items-center gap-1">
              <Anchor className="h-3 w-3" />
              {activeCorridor.name}
            </span>
            <span>{activeCorridor.distanceNm.toLocaleString()} nm</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-1.5 text-[11px]">
            <div>
              <span className="text-gray-400 text-[10px]">Optimal Fuel:</span>
              <div className="font-bold text-white">{activeCorridor.fuelType}</div>
            </div>
            <div>
              <span className="text-gray-400 text-[10px]">WTW Decarbonization:</span>
              <div className="font-bold text-emerald-400">-{activeCorridor.co2ReductionPct}% Net CO2</div>
            </div>
          </div>
        </div>

        {/* Corridor Switcher Pills */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 max-w-[210px]">
          {GREEN_CORRIDORS.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCorridorId(c.id)}
              className={`px-2.5 py-1.5 rounded-lg text-left text-[11px] transition-all border ${
                c.id === activeCorridorId
                  ? 'bg-teal text-white border-teal shadow-md font-semibold'
                  : 'bg-[#081420]/80 text-gray-300 border-[#1E3E5C] hover:bg-[#14283C]'
              }`}
            >
              <div className="truncate">{c.name}</div>
              <div className="text-[9.5px] opacity-80 flex justify-between">
                <span>{c.fuelType}</span>
                <span className="text-emerald-300">-{c.co2ReductionPct}%</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Vessel Quick-Bar beneath Map */}
      <div className="p-3 bg-white border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-2">
        {fleet.map((v) => {
          const isSelected = v.id === selectedVessel.id;
          return (
            <button
              key={v.id}
              onClick={() => onSelectVessel(v.id)}
              className={`p-2 rounded-lg border text-left transition-all ${
                isSelected
                  ? 'bg-teal-light/50 border-teal shadow-xs'
                  : 'bg-background-panel border-border hover:border-border-strong hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-navy-primary truncate">{v.name}</span>
                <Badge
                  variant={v.ciiRating === 'A' ? 'success' : v.ciiRating === 'B' ? 'teal' : 'amber'}
                  size="sm"
                >
                  CII {v.ciiRating}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-[11px] text-navy-secondary mt-1">
                <span>{v.speedKnots} kts • {v.fuelType}</span>
                <span className="font-mono font-semibold text-teal">{v.fuelRateMTPerDay} MT/d</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
