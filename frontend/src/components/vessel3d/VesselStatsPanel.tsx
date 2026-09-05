import React from 'react';
import {
  Ship,
  Fuel,
  Gauge,
  Wind,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Activity,
  Waves,
  Compass,
  Zap,
  Leaf,
  Layers,
  Euro,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Anchor,
  Flame,
  Radio,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Vessel, ShipZone, FuelType, CIIRating } from '../../types';

interface VesselStatsPanelProps {
  vessel: Vessel;
  fleet: Vessel[];
  onSelectVessel: (id: string) => void;
  selectedZone: ShipZone | null;
  onSelectZone: (zone: ShipZone | null) => void;
}

export const VesselStatsPanel: React.FC<VesselStatsPanelProps> = ({
  vessel,
  fleet,
  onSelectVessel,
  selectedZone,
  onSelectZone,
}) => {
  // Fuel type badge styling helper
  const getFuelBadge = (fuel: FuelType) => {
    switch (fuel) {
      case 'e-Methanol':
        return <Badge variant="quantum">e-Methanol (Net Zero)</Badge>;
      case 'Biofuel':
        return <Badge variant="success">Biofuel (B30 HVO)</Badge>;
      case 'LNG':
        return <Badge variant="teal">LNG Cryo (Low GHG)</Badge>;
      case 'VLSFO':
        return <Badge variant="amber">VLSFO 0.50% S</Badge>;
      default:
        return <Badge variant="navy">{fuel}</Badge>;
    }
  };

  // CII Badge styling helper
  const getCIIBadgeColor = (grade: CIIRating) => {
    switch (grade) {
      case 'A':
        return 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30 dark:text-emerald-400';
      case 'B':
        return 'bg-teal/15 text-teal border-teal/30';
      case 'C':
        return 'bg-amber-500/15 text-amber-600 border-amber-500/30 dark:text-amber-400';
      case 'D':
      case 'E':
        return 'bg-rose-500/15 text-rose-600 border-rose-500/30 dark:text-rose-400';
      default:
        return 'bg-navy-muted/20 text-navy-primary';
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Vessel Selector Carousel / Dropdown Bar */}
      <Card className="p-3.5 bg-white border-border shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <Ship className="h-4 w-4 text-teal" />
            <span className="text-xs font-bold text-navy-primary uppercase tracking-wider font-mono">
              Vessel Digital Twin Fleet
            </span>
          </div>
          <span className="text-[11px] font-mono text-navy-muted">
            {fleet.length} Vessels Synced
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {fleet.map((v) => {
            const isSelected = v.id === vessel.id;
            return (
              <button
                key={v.id}
                onClick={() => onSelectVessel(v.id)}
                className={`p-2 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'border-teal bg-teal-light/40 shadow-xs ring-1 ring-teal'
                    : 'border-border bg-background-panel/40 hover:bg-background-panel hover:border-border-dark'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-bold text-navy-primary truncate">{v.name}</span>
                  <span
                    className={`text-[10px] font-mono px-1 rounded font-semibold ${
                      v.ciiRating === 'A'
                        ? 'bg-emerald-100 text-emerald-700'
                        : v.ciiRating === 'B'
                        ? 'bg-teal/20 text-teal-dark'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {v.ciiRating}
                  </span>
                </div>
                <div className="text-[10px] text-navy-muted truncate mt-0.5">
                  {v.fuelType} • {v.speedKnots} kts
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* 2. Live Telemetry Matrix */}
      <Card className="p-4 bg-white border-border shadow-xs">
        <CardHeader className="p-0 pb-3 mb-3 border-b border-border">
          <div className="flex items-center justify-between w-full">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-navy-primary flex items-center gap-2">
              <Activity className="h-3.5 w-3.5 text-teal" />
              Live Telemetry & Hydrodynamics
            </CardTitle>
            {getFuelBadge(vessel.fuelType)}
          </div>
        </CardHeader>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* Speed SOG vs Target */}
          <div className="p-2.5 rounded-lg bg-background-panel/60 border border-border/80">
            <div className="flex items-center justify-between text-navy-muted text-[11px]">
              <span>Speed (SOG)</span>
              <Gauge className="h-3.5 w-3.5 text-teal" />
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-base font-bold font-mono text-navy-primary">
                {vessel.speedKnots}
              </span>
              <span className="text-[10px] font-mono text-navy-muted">knots</span>
            </div>
            <div className="text-[10px] text-navy-secondary mt-0.5">
              Target: {vessel.targetSpeedKnots} kts
            </div>
          </div>

          {/* Engine RPM */}
          <div className="p-2.5 rounded-lg bg-background-panel/60 border border-border/80">
            <div className="flex items-center justify-between text-navy-muted text-[11px]">
              <span>Main Shaft RPM</span>
              <Zap className="h-3.5 w-3.5 text-violet" />
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-base font-bold font-mono text-navy-primary">{vessel.rpm}</span>
              <span className="text-[10px] font-mono text-navy-muted">RPM</span>
            </div>
            <div className="text-[10px] text-navy-secondary mt-0.5">
              Power: {(vessel.enginePowerKW / 1000).toFixed(1)} MW
            </div>
          </div>

          {/* Draft (m) */}
          <div className="p-2.5 rounded-lg bg-background-panel/60 border border-border/80">
            <div className="flex items-center justify-between text-navy-muted text-[11px]">
              <span>Hydro Draft</span>
              <Anchor className="h-3.5 w-3.5 text-teal" />
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-base font-bold font-mono text-navy-primary">
                {vessel.draftMeters}
              </span>
              <span className="text-[10px] font-mono text-navy-muted">meters</span>
            </div>
            <div className="text-[10px] text-navy-secondary mt-0.5">
              Even Keel Ref: 14.0m
            </div>
          </div>

          {/* Trim (m & deg) */}
          <div className="p-2.5 rounded-lg bg-background-panel/60 border border-border/80">
            <div className="flex items-center justify-between text-navy-muted text-[11px]">
              <span>Dynamic Trim</span>
              <Compass className="h-3.5 w-3.5 text-quantum" />
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-base font-bold font-mono text-teal">
                {vessel.trimMeters > 0 ? `+${vessel.trimMeters}` : vessel.trimMeters}m
              </span>
              <span className="text-[10px] font-mono text-navy-muted">
                ({vessel.trimDegrees !== undefined ? `${vessel.trimDegrees > 0 ? `+${vessel.trimDegrees}` : vessel.trimDegrees}°` : '0.1°'})
              </span>
            </div>
            <div className="text-[10px] text-emerald-600 font-medium mt-0.5">
              {vessel.trimMeters >= 0 ? 'Trim by Stern (Opt)' : 'Trim by Bow'}
            </div>
          </div>

          {/* Displacement (DWT) */}
          <div className="p-2.5 rounded-lg bg-background-panel/60 border border-border/80">
            <div className="flex items-center justify-between text-navy-muted text-[11px]">
              <span>Displacement</span>
              <Layers className="h-3.5 w-3.5 text-navy-secondary" />
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-base font-bold font-mono text-navy-primary">
                {(vessel.deadweightTons / 1000).toFixed(0)}k
              </span>
              <span className="text-[10px] font-mono text-navy-muted">DWT</span>
            </div>
            <div className="text-[10px] text-navy-secondary mt-0.5">
              LOA: {vessel.lengthMeters}m
            </div>
          </div>

          {/* Active Status */}
          <div className="p-2.5 rounded-lg bg-background-panel/60 border border-border/80">
            <div className="flex items-center justify-between text-navy-muted text-[11px]">
              <span>AIS Status</span>
              <Radio className="h-3.5 w-3.5 text-teal animate-pulse" />
            </div>
            <div className="mt-1">
              <Badge
                variant={vessel.status === 'Optimizing' ? 'quantum' : vessel.status === 'Alert' ? 'danger' : 'teal'}
                size="sm"
              >
                {vessel.status}
              </Badge>
            </div>
            <div className="text-[10px] text-navy-muted truncate mt-1">
              Heading: {vessel.heading}°
            </div>
          </div>
        </div>
      </Card>

      {/* 3. Live Predicted Metrics & Carbon Emissions */}
      <Card className="p-4 bg-white border-border shadow-xs">
        <CardHeader className="p-0 pb-3 mb-3 border-b border-border">
          <CardTitle className="text-xs font-mono uppercase tracking-wider text-navy-primary flex items-center gap-2">
            <Leaf className="h-3.5 w-3.5 text-emerald-500" />
            Predicted Energy & Emissions Profile
          </CardTitle>
        </CardHeader>

        <div className="space-y-3">
          {/* Fuel Burn Rate */}
          <div className="p-3 rounded-lg bg-gradient-to-r from-violet/5 to-transparent border border-violet/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-violet/15 flex items-center justify-center text-violet">
                <Fuel className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-navy-primary">Daily Fuel Burn Rate</div>
                <div className="text-[11px] text-navy-muted">Residual PINN Corrected</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-base font-bold font-mono text-violet">
                {vessel.fuelRateMTPerDay} <span className="text-xs font-normal">MT/day</span>
              </div>
              <div className="text-[10px] text-emerald-600 font-mono font-semibold flex items-center justify-end gap-0.5">
                <TrendingDown className="h-3 w-3" /> -7.8% vs Baseline
              </div>
            </div>
          </div>

          {/* Well-to-Wake Emissions */}
          <div className="p-3 rounded-lg bg-gradient-to-r from-teal/5 to-transparent border border-teal/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-teal/15 flex items-center justify-center text-teal">
                <Flame className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-navy-primary">Well-to-Wake (WtW)</div>
                <div className="text-[11px] text-navy-muted">Lifecycle GHG Intensity</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-base font-bold font-mono text-teal">
                {vessel.wellToWakeEmissions}{' '}
                <span className="text-xs font-normal">gCO₂e/MJ</span>
              </div>
              <div className="text-[10px] text-teal-dark font-mono font-semibold">
                IMO 2026 Target: 89.3
              </div>
            </div>
          </div>

          {/* Tank-to-Wake CO2 Rate */}
          <div className="p-3 rounded-lg bg-gradient-to-r from-navy-primary/5 to-transparent border border-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-navy-primary/10 flex items-center justify-center text-navy-primary">
                <Leaf className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-navy-primary">Tank-to-Wake (TtW) CO₂</div>
                <div className="text-[11px] text-navy-muted">Direct Stack Emission Rate</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-base font-bold font-mono text-navy-primary">
                {vessel.tankToWakeCO2Rate}{' '}
                <span className="text-xs font-normal">MT/day</span>
              </div>
              <div className="text-[10px] text-navy-muted font-mono">
                {((vessel.tankToWakeCO2Rate * 365) / 1000).toFixed(1)}k MT/yr est.
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 4. Regulatory Badges & EU ETS Carbon Tax Liability */}
      <Card className="p-4 bg-white border-border shadow-xs">
        <CardHeader className="p-0 pb-3 mb-3 border-b border-border">
          <CardTitle className="text-xs font-mono uppercase tracking-wider text-navy-primary flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-teal" />
            Regulatory Compliance & Carbon Liabilities
          </CardTitle>
        </CardHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* IMO CII Rating Grade Badge */}
          <div className="p-3 rounded-lg border border-border bg-background-panel/40 flex items-center gap-3">
            <div
              className={`h-11 w-11 rounded-xl flex items-center justify-center text-lg font-black font-mono border ${getCIIBadgeColor(
                vessel.ciiRating
              )}`}
            >
              {vessel.ciiRating}
            </div>
            <div>
              <div className="text-xs font-bold text-navy-primary">IMO CII Rating</div>
              <div className="text-[11px] font-mono text-navy-secondary">
                Score: {vessel.ciiScore} g/dwt·nm
              </div>
              <div className="text-[10px] text-emerald-600 font-medium">
                {vessel.ciiRating === 'A' || vessel.ciiRating === 'B'
                  ? 'Exceeds 2026 Target'
                  : 'Marginal Band'}
              </div>
            </div>
          </div>

          {/* EU ETS Daily Carbon Tax Liability */}
          <div className="p-3 rounded-lg border border-border bg-background-panel/40 flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Euro className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-navy-primary">EU ETS Carbon Tax</div>
              <div className="text-xs font-bold font-mono text-navy-primary">
                €{vessel.euEtsDailyCostEUR.toLocaleString()}{' '}
                <span className="text-[10px] font-normal text-navy-muted">/ day</span>
              </div>
              <div className="text-[10px] text-navy-secondary">
                @ €70/t EUA (Maritime 70%)
              </div>
            </div>
          </div>
        </div>

        {/* IMO Carbon Target Status Bar */}
        <div className="mt-3 p-2.5 rounded-lg bg-teal/10 border border-teal/20 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-teal shrink-0" />
            <span className="text-navy-primary font-medium">IMO Carbon Target 2030:</span>
          </div>
          <span className="font-bold font-mono text-teal-dark">{vessel.imoTargetStatus}</span>
        </div>
      </Card>

      {/* 5. Sea State & Weather Status Widget */}
      <Card className="p-4 bg-white border-border shadow-xs">
        <CardHeader className="p-0 pb-3 mb-3 border-b border-border">
          <CardTitle className="text-xs font-mono uppercase tracking-wider text-navy-primary flex items-center gap-2">
            <Waves className="h-3.5 w-3.5 text-teal" />
            Atmospheric & Sea State Vector
          </CardTitle>
        </CardHeader>

        <div className="grid grid-cols-3 gap-2 text-center">
          {/* Beaufort Scale */}
          <div className="p-2 rounded-lg bg-background-panel border border-border">
            <div className="text-[10px] font-mono text-navy-muted uppercase">Beaufort</div>
            <div className="text-sm font-bold font-mono text-navy-primary mt-0.5">
              BF {vessel.seaStateBeaufort}
            </div>
            <div className="text-[10px] text-navy-secondary mt-0.5">
              {vessel.windSpeedKnots} kts wind
            </div>
          </div>

          {/* Significant Wave Height (Hs) */}
          <div className="p-2 rounded-lg bg-background-panel border border-border">
            <div className="text-[10px] font-mono text-navy-muted uppercase">Wave (Hs)</div>
            <div className="text-sm font-bold font-mono text-navy-primary mt-0.5">
              {vessel.waveHeightMeters}m
            </div>
            <div className="text-[10px] text-navy-secondary mt-0.5">
              Tp: {vessel.wavePeriodSeconds || 6.5}s
            </div>
          </div>

          {/* Current Vector */}
          <div className="p-2 rounded-lg bg-background-panel border border-border">
            <div className="text-[10px] font-mono text-navy-muted uppercase">Current Vector</div>
            <div className="text-sm font-bold font-mono text-teal mt-0.5">
              {vessel.currentVectorKnots} kts
            </div>
            <div className="text-[10px] text-navy-secondary mt-0.5">
              Dir: {vessel.currentVectorDir}°
            </div>
          </div>
        </div>
      </Card>

      {/* 6. Interactive Zone Selector Hotspots */}
      <Card className="p-3.5 bg-white border-border shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-navy-primary font-mono uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-teal" />
            3D Zone Telemetry Inspection
          </span>
          {selectedZone && (
            <button
              onClick={() => onSelectZone(null)}
              className="text-[10px] font-mono text-navy-muted hover:text-navy-primary underline"
            >
              Clear Zone
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'hull', label: '1. Hull & Hydro (PINN)', desc: 'Skin Friction & Wave Drag' },
            { id: 'bridge', label: '2. Bridge Nav AI', desc: 'Quantum Path Waypoints' },
            { id: 'cargo', label: '3. Cargo Hold Bay', desc: 'TEU Reefer Power Matrix' },
            { id: 'engine', label: '4. Engine / Propeller', desc: 'Shaft RPM & Torque' },
          ].map((zone) => {
            const isSelected = selectedZone === zone.id;
            return (
              <button
                key={zone.id}
                onClick={() => onSelectZone(isSelected ? null : (zone.id as ShipZone))}
                className={`p-2 rounded-lg border text-left transition-all flex items-start justify-between ${
                  isSelected
                    ? 'border-teal bg-teal-light/50 ring-1 ring-teal text-teal-dark shadow-xs'
                    : 'border-border bg-background-panel/40 hover:bg-background-panel text-navy-primary'
                }`}
              >
                <div>
                  <div className="text-xs font-bold font-mono">{zone.label}</div>
                  <div className="text-[10px] text-navy-muted mt-0.5">{zone.desc}</div>
                </div>
                <ChevronRight
                  className={`h-3.5 w-3.5 mt-0.5 transition-transform ${
                    isSelected ? 'text-teal rotate-90' : 'text-navy-muted'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
