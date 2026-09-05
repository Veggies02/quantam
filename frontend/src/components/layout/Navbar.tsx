import React from 'react';
import {
  Ship,
  Compass,
  Cpu,
  ChevronDown,
  Bell,
  Sparkles,
} from 'lucide-react';
import { useFleet } from '../../context/FleetContext';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export interface NavbarProps {
  onOpenQuickAction?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenQuickAction }) => {
  const { fleet, selectedVessel, setSelectedVesselId, isSimulating, toggleSimulation } = useFleet();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-border h-16 px-4 lg:px-6 flex items-center justify-between shadow-xs">
      {/* Brand & Platform Emblem */}
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-teal to-violet flex items-center justify-center text-white shadow-sm ring-2 ring-teal/20">
          <Compass className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base tracking-tight text-navy-primary font-sans">
              NAV<span className="text-teal font-black">OPTIMA</span>
            </span>
            <Badge variant="quantum" size="sm" dot>
              AI-Hybrid
            </Badge>
          </div>
          <p className="text-[10px] text-navy-muted tracking-wider uppercase font-mono">
            Autonomous Maritime Fleet Intelligence
          </p>
        </div>
      </div>

      {/* Center: Vessel Fleet Selector & Quick Telemetry Bar */}
      <div className="hidden md:flex items-center gap-3 bg-background-panel border border-border px-3 py-1.5 rounded-lg">
        <Ship className="h-4 w-4 text-teal shrink-0" />
        <div className="flex items-center gap-2">
          <span className="text-xs text-navy-muted font-medium">Active Vessel:</span>
          <div className="relative">
            <select
              value={selectedVessel.id}
              onChange={(e) => setSelectedVesselId(e.target.value)}
              className="appearance-none bg-white border border-border/80 rounded-md pl-2.5 pr-8 py-1 text-xs font-semibold text-navy-primary hover:border-teal cursor-pointer focus:outline-none focus:ring-1 focus:ring-teal font-sans shadow-2xs"
            >
              {fleet.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.type.split(' ')[0]}) - {v.ciiRating} Rated
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-navy-muted pointer-events-none" />
          </div>
        </div>

        <div className="h-4 w-[1px] bg-border mx-1" />

        <div className="flex items-center gap-2 text-xs">
          <span className="text-navy-muted">Speed:</span>
          <span className="font-mono font-bold text-navy-primary">
            {selectedVessel.speedKnots} kts
          </span>
          <span className="text-navy-muted ml-1">Fuel:</span>
          <span className="font-mono font-bold text-teal">
            {selectedVessel.fuelRateMTPerDay} MT/d
          </span>
        </div>
      </div>

      {/* Right Controls: Engine Status, Simulation State, Notifications, Profile */}
      <div className="flex items-center gap-2.5">
        {/* Real-time Simulator Status Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={toggleSimulation}
          className="hidden sm:inline-flex text-xs h-8"
          leftIcon={
            isSimulating ? (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal"></span>
              </span>
            ) : (
              <span className="inline-flex rounded-full h-2 w-2 bg-amber"></span>
            )
          }
        >
          {isSimulating ? 'Live Telemetry' : 'Paused'}
        </Button>

        {/* Quantum Co-processor Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-quantum-light border border-quantum/30 text-[11px] font-mono font-medium text-quantum-dark">
          <Cpu className="h-3.5 w-3.5 text-quantum" />
          <span>D-Wave Leap: READY</span>
        </div>

        {/* Quick Action Button */}
        <Button
          variant="quantum"
          size="sm"
          onClick={onOpenQuickAction}
          className="h-8 text-xs font-semibold"
          leftIcon={<Sparkles className="h-3.5 w-3.5" />}
        >
          Run Optimize
        </Button>

        {/* System Notifications */}
        <div className="relative">
          <button className="h-8 w-8 rounded-lg border border-border bg-white hover:bg-background-panel flex items-center justify-center text-navy-secondary hover:text-navy-primary transition-colors">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-amber ring-2 ring-white" />
          </button>
        </div>

        {/* User Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-border">
          <div className="h-8 w-8 rounded-full bg-navy-primary text-white flex items-center justify-center text-xs font-bold ring-2 ring-teal/30">
            FO
          </div>
          <div className="hidden xl:block text-left">
            <p className="text-xs font-semibold text-navy-primary leading-tight">Capt. C. Reynolds</p>
            <p className="text-[10px] text-navy-muted">Fleet Ops Director</p>
          </div>
        </div>
      </div>
    </header>
  );
};
