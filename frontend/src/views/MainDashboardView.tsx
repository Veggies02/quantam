import React, { useState } from 'react';
import {
  Ship,
  Fuel,
  Gauge,
  TrendingDown,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  FileSpreadsheet,
  Layers,
  Award,
} from 'lucide-react';
import { KPICard } from '../components/ui/KPICard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useFleet } from '../context/FleetContext';
import { FleetTacticalMap } from '../components/dashboard/FleetTacticalMap';
import { FleetScenarioSimulator } from '../components/dashboard/FleetScenarioSimulator';
import { DeliveryTableCard } from '../components/dashboard/DeliveryTableCard';
import { VesselTelemetryCard } from '../components/dashboard/VesselTelemetryCard';
import { ExecutiveReportModal } from '../components/dashboard/ExecutiveReportModal';

export const MainDashboardView: React.FC = () => {
  const { fleet, selectedVessel, setSelectedVesselId, activeScenario, resetActiveScenario } = useFleet();
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

  const fuelSavedPct = activeScenario.globalKpiDeltas.fuelSavedPct;
  const wtwCo2SavedPct = activeScenario.globalKpiDeltas.wtwCo2ReducedPct;
  const complianceBadge = activeScenario.globalKpiDeltas.fleetComplianceBadge;

  return (
    <div className="space-y-6 pb-10">
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-card border border-border shadow-xs">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl font-bold text-navy-primary tracking-tight">
              NavOptima Green Fleet Command & Decision Support Center
            </h1>
            <Badge variant="teal" dot>
              SIH 2026 PS 26138
            </Badge>
            {activeScenario.appliedOptimization && (
              <Badge variant="quantum" dot>
                {activeScenario.appliedOptimization.solutionName} Active
              </Badge>
            )}
          </div>
          <p className="text-xs text-navy-secondary mt-1">
            Quantum-inspired fleet routing, hydrodynamic fuel prediction, alternative fuel pathway simulation, and full regulatory compliance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeScenario.appliedOptimization && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetActiveScenario}
              leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
            >
              Reset Baseline
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsReportModalOpen(true)}
            leftIcon={<FileSpreadsheet className="h-3.5 w-3.5 text-teal" />}
          >
            Audit Report
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsReportModalOpen(true)}
            leftIcon={<Award className="h-3.5 w-3.5" />}
          >
            View Certificate
          </Button>
        </div>
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Active Vessel Speed"
          value={selectedVessel.speedKnots}
          unit="knots"
          subtitle={`Target: ${selectedVessel.targetSpeedKnots} kts • Draft: ${selectedVessel.draftMeters}m`}
          icon={<Gauge className="h-5 w-5" />}
          accentColor="teal"
          trend={{
            value: selectedVessel.quantumOptimized ? 'Quantum Tuned' : 'Nominal',
            direction: 'up',
            isPositiveGood: true,
            label: `Trim: ${selectedVessel.trimMeters > 0 ? '+' : ''}${selectedVessel.trimMeters}m`,
          }}
        />

        <KPICard
          title="Fuel Saved & Consumption"
          value={`-${fuelSavedPct.toFixed(1)}%`}
          unit={`(${selectedVessel.fuelRateMTPerDay} MT/d)`}
          subtitle={`Fuel Type: ${selectedVessel.fuelType}`}
          icon={<Fuel className="h-5 w-5" />}
          accentColor="violet"
          trend={{
            value: `-${fuelSavedPct.toFixed(1)}%`,
            direction: 'down',
            isPositiveGood: true,
            label: 'voyage fuel cut',
          }}
        />

        <KPICard
          title="WTW CO2 Reduction"
          value={`-${wtwCo2SavedPct.toFixed(1)}%`}
          unit="Lifecycle"
          subtitle={`Rate: ${selectedVessel.tankToWakeCO2Rate} MT/d • ETS: €${(selectedVessel.euEtsDailyCostEUR / 1000).toFixed(1)}k/d`}
          icon={<TrendingDown className="h-5 w-5" />}
          accentColor="success"
          trend={{
            value: `-${wtwCo2SavedPct.toFixed(1)}%`,
            direction: 'down',
            isPositiveGood: true,
            label: 'Net-Zero trajectory',
          }}
        />

        <KPICard
          title="IMO CII & Fleet Badge"
          value={`Grade ${selectedVessel.ciiRating}`}
          unit={`(${selectedVessel.ciiScore} g/dwt·nm)`}
          subtitle={complianceBadge}
          icon={<ShieldCheck className="h-5 w-5" />}
          accentColor={selectedVessel.ciiRating === 'A' ? 'success' : selectedVessel.ciiRating === 'B' ? 'teal' : 'amber'}
          trend={{
            value: selectedVessel.ciiRating === 'A' || selectedVessel.ciiRating === 'B' ? '100% Compliant' : 'Warning',
            direction: 'neutral',
            label: 'IMO 2026 Target',
          }}
        />
      </div>

      {/* Main Grid: Left (Tactical Map, Scenario Simulator, Deliverables Table) vs Right (Vessel Telemetry Card) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Primary Column */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          {/* 1. Tactical Green Corridors Route Map */}
          <FleetTacticalMap
            fleet={fleet}
            selectedVessel={selectedVessel}
            onSelectVessel={setSelectedVesselId}
          />

          {/* 2. Alternative Fuel & Fleet Deployment Scenario Hub (Deliverables 2 & 4) */}
          <FleetScenarioSimulator />

          {/* 3. Expected Deliverables Table (Deliverables 1 to 5) */}
          <DeliveryTableCard onOpenReportModal={() => setIsReportModalOpen(true)} />
        </div>

        {/* Right / Secondary Column: High-Density Vessel Profile & Telemetry Card */}
        <div className="lg:col-span-5 xl:col-span-4 sticky top-4">
          <VesselTelemetryCard
            vessel={selectedVessel}
            fleet={fleet}
            onSelectVessel={setSelectedVesselId}
          />
        </div>
      </div>

      {/* Executive Report & Compliance Certificate Modal */}
      <ExecutiveReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
};
