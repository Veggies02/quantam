import os

files = {}

# Mock Fleet Data & Context
files["frontend/src/context/FleetContext.tsx"] = """import React, { createContext, useContext, useState } from 'react';
import { Vessel } from '../types';

export const MOCK_FLEET: Vessel[] = [
  {
    id: 'VES-901',
    name: 'MV Pacific Horizon',
    imo: 'IMO 9842145',
    type: 'Ultra Large Container Vessel (ULCV)',
    deadweightTons: 198000,
    lengthMeters: 399.9,
    speedKnots: 18.4,
    targetSpeedKnots: 17.2,
    enginePowerKW: 68400,
    rpm: 72.4,
    fuelRateMTPerDay: 84.6,
    ciiRating: 'B',
    ciiScore: 3.42,
    status: 'Optimizing',
    origin: 'Port of Singapore (SGSIN)',
    destination: 'Port of Rotterdam (NLRTM)',
    eta: '2026-09-14 06:00 UTC',
    lat: 12.842,
    lng: 45.213,
    heading: 312,
    draftMeters: 14.8,
    trimMeters: 0.35,
    seaStateBeaufort: 4,
    waveHeightMeters: 2.1,
    windSpeedKnots: 16.5,
    quantumOptimized: true,
  },
  {
    id: 'VES-842',
    name: 'MV Atlantic Pioneer',
    imo: 'IMO 9734589',
    type: 'Capesize Bulk Carrier',
    deadweightTons: 179500,
    lengthMeters: 292.0,
    speedKnots: 13.8,
    targetSpeedKnots: 13.5,
    enginePowerKW: 18500,
    rpm: 65.2,
    fuelRateMTPerDay: 42.1,
    ciiRating: 'A',
    ciiScore: 2.15,
    status: 'Underway',
    origin: 'Port Hedland (AUPHE)',
    destination: 'Qingdao Port (CNQDG)',
    eta: '2026-09-09 18:30 UTC',
    lat: -12.35,
    lng: 118.44,
    heading: 355,
    draftMeters: 16.2,
    trimMeters: -0.1,
    seaStateBeaufort: 3,
    waveHeightMeters: 1.4,
    windSpeedKnots: 11.2,
    quantumOptimized: true,
  },
  {
    id: 'VES-719',
    name: 'MV Nordic Sentinel',
    imo: 'IMO 9651204',
    type: 'LNG Carrier (Membrane)',
    deadweightTons: 94000,
    lengthMeters: 288.0,
    speedKnots: 16.2,
    targetSpeedKnots: 15.8,
    enginePowerKW: 24000,
    rpm: 68.0,
    fuelRateMTPerDay: 58.4,
    ciiRating: 'C',
    ciiScore: 4.88,
    status: 'Alert',
    origin: 'Ras Laffan (QARLF)',
    destination: 'Zeebrugge (BEZEE)',
    eta: '2026-09-18 12:00 UTC',
    lat: 28.12,
    lng: 33.45,
    heading: 330,
    draftMeters: 11.5,
    trimMeters: 0.15,
    seaStateBeaufort: 6,
    waveHeightMeters: 3.8,
    windSpeedKnots: 27.8,
    quantumOptimized: false,
  },
  {
    id: 'VES-604',
    name: 'MV Hellenic Voyager',
    imo: 'IMO 9823901',
    type: 'VLCC Crude Oil Tanker',
    deadweightTons: 318000,
    lengthMeters: 333.0,
    speedKnots: 14.1,
    targetSpeedKnots: 14.0,
    enginePowerKW: 29800,
    rpm: 62.0,
    fuelRateMTPerDay: 51.2,
    ciiRating: 'B',
    ciiScore: 3.12,
    status: 'Underway',
    origin: 'Ras Tanura (SARAS)',
    destination: 'Ulsan Port (KRULS)',
    eta: '2026-09-22 08:00 UTC',
    lat: 5.72,
    lng: 82.11,
    heading: 85,
    draftMeters: 20.4,
    trimMeters: 0.05,
    seaStateBeaufort: 2,
    waveHeightMeters: 0.8,
    windSpeedKnots: 8.4,
    quantumOptimized: true,
  }
];

interface FleetContextType {
  fleet: Vessel[];
  selectedVessel: Vessel;
  setSelectedVesselId: (id: string) => void;
  isSimulating: boolean;
  toggleSimulation: () => void;
}

const FleetContext = createContext<FleetContextType | undefined>(undefined);

export const FleetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fleet] = useState<Vessel[]>(MOCK_FLEET);
  const [selectedVesselId, setSelectedVesselId] = useState<string>(MOCK_FLEET[0].id);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);

  const selectedVessel = fleet.find((v) => v.id === selectedVesselId) || fleet[0];

  const toggleSimulation = () => setIsSimulating((prev) => !prev);

  return (
    <FleetContext.Provider
      value={{
        fleet,
        selectedVessel,
        setSelectedVesselId,
        isSimulating,
        toggleSimulation,
      }}
    >
      {children}
    </FleetContext.Provider>
  );
};

export const useFleet = () => {
  const context = useContext(FleetContext);
  if (!context) {
    throw new Error('useFleet must be used within a FleetProvider');
  }
  return context;
};
"""

# Navbar.tsx
files["frontend/src/components/layout/Navbar.tsx"] = """import React from 'react';
import {
  Ship,
  Compass,
  Activity,
  Cpu,
  ChevronDown,
  Bell,
  Search,
  Sparkles,
  Play,
  Pause,
  RefreshCw,
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
          <Compass className="h-5 w-5 animate-spin-slow" />
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
"""

# Sidebar.tsx
files["frontend/src/components/layout/Sidebar.tsx"] = """import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  GitFork,
  BarChart3,
  ShieldCheck,
  Cpu,
  Layers,
  Settings,
  HelpCircle,
  Radio,
  FileCode2,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Badge } from '../ui/Badge';

export interface SidebarProps {
  collapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = () => {
  const navItems = [
    {
      to: '/dashboard',
      label: 'Fleet Overview',
      subtitle: '3D Twin & Telemetry',
      icon: LayoutDashboard,
      badge: 'Live',
      badgeVariant: 'teal' as const,
    },
    {
      to: '/predict',
      label: 'PINN Fuel Predictor',
      subtitle: 'Hybrid Residual Models',
      icon: TrendingUp,
      badge: 'PINN',
      badgeVariant: 'violet' as const,
    },
    {
      to: '/optimize',
      label: 'Multi-Obj Route Optimizer',
      subtitle: 'Pareto Front Speed & Path',
      icon: GitFork,
      badge: 'Pareto',
      badgeVariant: 'teal' as const,
    },
    {
      to: '/benchmark',
      label: 'Algorithm Benchmark',
      subtitle: 'NSGA-II vs MOEA/D vs Leap',
      icon: BarChart3,
      badge: 'Stats',
      badgeVariant: 'navy' as const,
    },
    {
      to: '/compliance',
      label: 'IMO CII & Carbon ETS',
      subtitle: 'FuelEU Maritime Trajectory',
      icon: ShieldCheck,
      badge: 'CII Grade',
      badgeVariant: 'amber' as const,
    },
    {
      to: '/quantum',
      label: 'Quantum Annealer Lab',
      subtitle: 'D-Wave QUBO Berth & Dispatch',
      icon: Cpu,
      badge: 'QUBO',
      badgeVariant: 'quantum' as const,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-border flex flex-col justify-between shrink-0 select-none">
      {/* Navigation Group */}
      <div className="py-4 px-3 space-y-6">
        <div>
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-navy-muted font-mono">
            Navigation Modules
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    clsx(
                      'group flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150',
                      isActive
                        ? 'bg-teal-light text-teal font-semibold shadow-xs border border-teal/20'
                        : 'text-navy-secondary hover:text-navy-primary hover:bg-background-panel'
                    )
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
                    <div>
                      <div className="leading-tight">{item.label}</div>
                      <div className="text-[10px] text-navy-muted font-normal">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>
                  {item.badge && (
                    <Badge variant={item.badgeVariant} size="sm">
                      {item.badge}
                    </Badge>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Operational Status Box */}
        <div className="bg-background-panel border border-border rounded-lg p-3 mx-1">
          <div className="flex items-center justify-between pb-1.5 border-b border-border/60">
            <span className="text-[11px] font-semibold text-navy-primary flex items-center gap-1.5">
              <Radio className="h-3 w-3 text-teal animate-pulse" />
              Satellite Uplink
            </span>
            <span className="text-[10px] font-mono text-success font-bold">100% ONLINE</span>
          </div>
          <div className="mt-2 text-[11px] text-navy-secondary space-y-1 font-mono">
            <div className="flex justify-between">
              <span className="text-navy-muted">Inmarsat Ping:</span>
              <span className="font-semibold text-navy-primary">34 ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-navy-muted">AIS Feeds:</span>
              <span className="font-semibold text-teal">2,410 active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Settings & Platform Info */}
      <div className="p-3 border-t border-border space-y-1">
        <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-navy-secondary hover:text-navy-primary hover:bg-background-panel transition-colors">
          <Settings className="h-4 w-4 text-navy-muted" />
          <span>System Settings & API Keys</span>
        </button>
        <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-navy-secondary hover:text-navy-primary hover:bg-background-panel transition-colors">
          <HelpCircle className="h-4 w-4 text-navy-muted" />
          <span>Documentation & Architecture</span>
        </button>
        <div className="pt-2 px-3 text-[10px] text-navy-muted font-mono">
          NavOptima Engine v2.4.0-enterprise
        </div>
      </div>
    </aside>
  );
};
"""

# DashboardLayout.tsx
files["frontend/src/components/layout/DashboardLayout.tsx"] = """import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Sparkles, Play, Sliders, CheckCircle2 } from 'lucide-react';
import { useFleet } from '../../context/FleetContext';

export const DashboardLayout: React.FC = () => {
  const [isQuickOptimizeOpen, setIsQuickOptimizeOpen] = useState(false);
  const [optimizationRunning, setOptimizationRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const { selectedVessel } = useFleet();

  const handleRunOptimization = () => {
    setOptimizationRunning(true);
    setTimeout(() => {
      setOptimizationRunning(false);
      setCompleted(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background-panel text-navy-primary">
      {/* Top Navbar */}
      <Navbar onOpenQuickAction={() => {
        setCompleted(false);
        setIsQuickOptimizeOpen(true);
      }} />

      {/* Main App Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Fixed / Collapsible Sidebar */}
        <Sidebar />

        {/* Dynamic View Route Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-background-panel">
          <Outlet />
        </main>
      </div>

      {/* Quick Optimization Dispatch Modal */}
      <Modal
        isOpen={isQuickOptimizeOpen}
        onClose={() => setIsQuickOptimizeOpen(false)}
        title={
          <span className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-teal" />
            Instant Route & Speed Co-Optimization
          </span>
        }
        description={`Target Vessel: ${selectedVessel.name} (${selectedVessel.imo})`}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsQuickOptimizeOpen(false)}>
              Close
            </Button>
            <Button
              variant="quantum"
              isLoading={optimizationRunning}
              onClick={handleRunOptimization}
              leftIcon={<Play className="h-4 w-4" />}
            >
              {completed ? 'Re-execute Solver' : 'Execute NSGA-II + D-Wave Hybrid'}
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-teal-light rounded-lg border border-teal/20 text-navy-primary">
            <p className="font-semibold text-teal mb-1">Active Multi-Objective Solver Objectives:</p>
            <ul className="list-disc list-inside space-y-1 text-navy-secondary">
              <li>Objective 1: Minimize Total Heavy Fuel Oil (HFO) consumption (\(\text{MT}\))</li>
              <li>Objective 2: Minimize Estimated Time of Arrival (ETA) delay penalty (\(\text{Hours}\))</li>
              <li>Constraint: Maintain IMO CII Rating \(\ge\) B under sea state Beaufort 5+</li>
            </ul>
          </div>

          {completed && (
            <div className="p-3 bg-success-light rounded-lg border border-success/30 flex items-start gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-success">Optimal Pareto Solution Dispatched!</p>
                <p className="text-navy-secondary mt-0.5">
                  Calculated recommended speed reduction to <strong>17.2 kts</strong> with 5.8 MT/day fuel savings
                  and verified 0% CII downgrade risk.
                </p>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
"""

for path, content in files.items():
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Wrote {path}")
