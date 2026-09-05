import React, { useState } from 'react';
import {
  Ship,
  Gauge,
  Fuel,
  TrendingDown,
  ShieldCheck,
  Wind,
  Waves,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Activity,
  Layers,
  PlugZap,
} from 'lucide-react';
import { Vessel, ShipZone } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface VesselTelemetryCardProps {
  vessel: Vessel;
  fleet: Vessel[];
  onSelectVessel: (id: string) => void;
}

export const VesselTelemetryCard: React.FC<VesselTelemetryCardProps> = ({
  vessel,
  fleet,
  onSelectVessel,
}) => {
  const [activeZone, setActiveZone] = useState<ShipZone>('hull');

  const zoneData = vessel.zoneDiagnostics?.[activeZone];

  // Resistance breakdown proportions based on Holtrop-Mennen
  const resistanceItems = [
    { label: 'Frictional Skin Resistance (RF)', pct: 58, value: '382 kN', color: 'bg-teal' },
    { label: 'Wave-Making Drag (RW)', pct: 22, value: '145 kN', color: 'bg-cyan-500' },
    { label: 'Appendages & Rudder (RAPP)', pct: 9, value: '59 kN', color: 'bg-indigo-400' },
    { label: 'Bulbous Bow Pressure (RB)', pct: 4, value: '26 kN', color: 'bg-violet' },
    { label: 'Weather Waves & Wind (RA)', pct: 7, value: '46 kN', color: 'bg-amber' },
  ];

  return (
    <div className="bg-white border border-border rounded-card shadow-xs p-5 space-y-5 flex flex-col justify-between">
      {/* Vessel Profile Header & Vessel Selector */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-light text-teal rounded-lg border border-teal/20">
              <Ship className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-navy-primary">{vessel.name}</h3>
                <Badge
                  variant={vessel.ciiRating === 'A' ? 'success' : vessel.ciiRating === 'B' ? 'teal' : 'amber'}
                  size="sm"
                >
                  CII Grade {vessel.ciiRating}
                </Badge>
              </div>
              <div className="text-[11px] text-navy-muted font-mono">
                {vessel.imo} • {vessel.type}
              </div>
            </div>
          </div>

          <Badge variant={vessel.quantumOptimized ? 'quantum' : 'teal'} size="sm" dot>
            {vessel.quantumOptimized ? 'Quantum Tuned' : 'Nominal AIS'}
          </Badge>
        </div>

        {/* Vessel Selector Buttons */}
        <div className="grid grid-cols-4 gap-1.5 mt-3">
          {fleet.map((v) => (
            <button
              key={v.id}
              onClick={() => onSelectVessel(v.id)}
              className={`p-1.5 rounded-lg text-center text-xs font-semibold border transition-all ${
                v.id === vessel.id
                  ? 'bg-teal text-white border-teal shadow-xs'
                  : 'bg-background-panel border-border text-navy-secondary hover:text-navy-primary hover:bg-white'
              }`}
            >
              <div className="truncate text-[11px]">{v.name.replace('MV ', '')}</div>
              <div className="text-[9.5px] opacity-80 font-mono">{v.fuelType}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Hydrodynamic & Operational Telemetry Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        <div className="bg-background-panel/70 p-2.5 rounded-lg border border-border">
          <div className="text-[10.5px] text-navy-muted flex items-center gap-1">
            <Gauge className="h-3 w-3 text-teal" />
            Speed (SOG)
          </div>
          <div className="text-sm font-mono font-bold text-navy-primary mt-0.5">
            {vessel.speedKnots} <span className="text-[10px] font-normal text-navy-muted">kts</span>
          </div>
          <div className="text-[9.5px] text-teal">Target: {vessel.targetSpeedKnots} kts</div>
        </div>

        <div className="bg-background-panel/70 p-2.5 rounded-lg border border-border">
          <div className="text-[10.5px] text-navy-muted flex items-center gap-1">
            <Zap className="h-3 w-3 text-violet" />
            Shaft Power
          </div>
          <div className="text-sm font-mono font-bold text-navy-primary mt-0.5">
            {Math.round(vessel.enginePowerKW / 1000)} <span className="text-[10px] font-normal text-navy-muted">MW</span>
          </div>
          <div className="text-[9.5px] text-navy-secondary font-mono">{vessel.rpm} RPM</div>
        </div>

        <div className="bg-background-panel/70 p-2.5 rounded-lg border border-border">
          <div className="text-[10.5px] text-navy-muted flex items-center gap-1">
            <Fuel className="h-3 w-3 text-teal" />
            Daily Fuel Burn
          </div>
          <div className="text-sm font-mono font-bold text-teal mt-0.5">
            {vessel.fuelRateMTPerDay} <span className="text-[10px] font-normal text-navy-muted">MT/d</span>
          </div>
          <div className="text-[9.5px] text-navy-muted">{vessel.fuelType}</div>
        </div>

        <div className="bg-background-panel/70 p-2.5 rounded-lg border border-border">
          <div className="text-[10.5px] text-navy-muted flex items-center gap-1">
            <TrendingDown className="h-3 w-3 text-success" />
            WTW Intensity
          </div>
          <div className="text-sm font-mono font-bold text-success mt-0.5">
            {vessel.wellToWakeEmissions} <span className="text-[10px] font-normal text-navy-muted">g/MJ</span>
          </div>
          <div className="text-[9.5px] text-navy-muted">Lifecycle GHG</div>
        </div>

        <div className="bg-background-panel/70 p-2.5 rounded-lg border border-border">
          <div className="text-[10.5px] text-navy-muted flex items-center gap-1">
            <Activity className="h-3 w-3 text-amber" />
            Draft & Trim
          </div>
          <div className="text-sm font-mono font-bold text-navy-primary mt-0.5">
            {vessel.draftMeters}m <span className="text-[10px] font-normal text-navy-muted">T</span>
          </div>
          <div className="text-[9.5px] text-teal font-mono">Trim: +{vessel.trimMeters}m</div>
        </div>

        <div className="bg-background-panel/70 p-2.5 rounded-lg border border-border">
          <div className="text-[10.5px] text-navy-muted flex items-center gap-1">
            <Waves className="h-3 w-3 text-cyan-500" />
            Sea State (Hs)
          </div>
          <div className="text-sm font-mono font-bold text-navy-primary mt-0.5">
            {vessel.waveHeightMeters}m <span className="text-[10px] font-normal text-navy-muted">Hs</span>
          </div>
          <div className="text-[9.5px] text-navy-muted">Beaufort {vessel.seaStateBeaufort}</div>
        </div>
      </div>

      {/* Holtrop-Mennen Hydrodynamic Resistance Breakdown */}
      <div className="bg-background-panel/50 p-3 rounded-lg border border-border space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-navy-primary">
          <span>Holtrop-Mennen Hydrodynamic Resistance</span>
          <span className="font-mono text-teal">Total RT: 658 kN</span>
        </div>

        {/* Stacked Progress Bar */}
        <div className="w-full h-2 bg-border rounded-full flex overflow-hidden">
          {resistanceItems.map((item, idx) => (
            <div
              key={idx}
              className={`h-full ${item.color}`}
              style={{ width: `${item.pct}%` }}
              title={`${item.label}: ${item.pct}% (${item.value})`}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-navy-secondary pt-1">
          {resistanceItems.slice(0, 4).map((item, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${item.color}`} />
              <span className="truncate">{item.label.split('(')[0]}:</span>
              <span className="font-mono font-semibold text-navy-primary">{item.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sensor Zone Diagnostics Tabs (Clean 2D View) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-navy-primary">Engineering Sensor Diagnostics</span>
          <div className="flex gap-1">
            {(['hull', 'bridge', 'cargo', 'engine'] as ShipZone[]).map((zone) => (
              <button
                key={zone}
                onClick={() => setActiveZone(zone)}
                className={`px-2 py-0.5 rounded text-[10.5px] font-semibold uppercase transition-colors ${
                  activeZone === zone
                    ? 'bg-navy-primary text-white'
                    : 'bg-background-panel text-navy-secondary hover:bg-border'
                }`}
              >
                {zone}
              </button>
            ))}
          </div>
        </div>

        {zoneData && (
          <div className="bg-background-panel p-3 rounded-lg border border-border space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-1.5">
              <span className="font-bold text-navy-primary">{zoneData.title}</span>
              <Badge
                variant={zoneData.status === 'optimal' ? 'success' : 'amber'}
                size="sm"
              >
                {zoneData.status.toUpperCase()}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {zoneData.metrics.map((m, idx) => (
                <div key={idx} className="bg-white p-2 rounded border border-border">
                  <div className="text-[10px] text-navy-muted">{m.label}</div>
                  <div className="font-mono font-bold text-navy-primary mt-0.5">
                    {m.value} {m.unit}
                  </div>
                  {m.delta && (
                    <div className="text-[9.5px] text-success font-semibold">{m.delta}</div>
                  )}
                </div>
              ))}
            </div>

            <p className="text-[10.5px] text-navy-secondary italic">{zoneData.notes}</p>
          </div>
        )}
      </div>

      {/* Voyage Leg ETA & Green Corridor Info */}
      <div className="p-3 bg-teal-light/40 border border-teal/20 rounded-lg text-xs space-y-1">
        <div className="flex items-center justify-between font-semibold text-navy-primary">
          <span>{vessel.origin} → {vessel.destination}</span>
          <span className="text-teal font-mono">ETA: {vessel.eta.split(' ')[0]}</span>
        </div>
        <div className="text-[10.5px] text-navy-secondary flex justify-between">
          <span>Status: {vessel.status}</span>
          <span className="text-success font-semibold">{vessel.imoTargetStatus}</span>
        </div>
      </div>
    </div>
  );
};
