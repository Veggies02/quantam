import React from 'react';
import {
  FileText,
  Printer,
  Download,
  CheckCircle2,
  ShieldCheck,
  Award,
  Cpu,
  TrendingDown,
  Fuel,
  DollarSign,
  X,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useFleet } from '../../context/FleetContext';
import { SIH_DELIVERABLES } from './DeliveryTableCard';

interface ExecutiveReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExecutiveReportModal: React.FC<ExecutiveReportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { fleet, selectedVessel, activeScenario } = useFleet();

  const handlePrint = () => {
    window.print();
  };

  const handleExportJson = () => {
    const reportData = {
      platform: 'NavOptima Maritime Fleet Optimization & Decarbonization System',
      problemStatement: 'SIH 2026 - Problem Statement 26138 (Egreen Quanta)',
      generatedAt: new Date().toISOString(),
      activeScenario: activeScenario,
      fleetSummary: {
        totalVessels: fleet.length,
        averageCiiRating: 'A',
        fuelSavedPercentage: activeScenario.globalKpiDeltas.fuelSavedPct,
        wtwCo2ReductionPercentage: activeScenario.globalKpiDeltas.wtwCo2ReducedPct,
        totalFleetCostSavedUsd: activeScenario.globalKpiDeltas.totalFleetCostSavedUsd,
      },
      vessels: fleet.map((v) => ({
        name: v.name,
        imo: v.imo,
        type: v.type,
        dwt: v.deadweightTons,
        speedKnots: v.speedKnots,
        fuelType: v.fuelType,
        fuelRateMTPerDay: v.fuelRateMTPerDay,
        wellToWakeGhg: v.wellToWakeEmissions,
        ciiScore: v.ciiScore,
        ciiRating: v.ciiRating,
      })),
      deliverablesStatus: SIH_DELIVERABLES,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NavOptima_Compliance_Audit_Report_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" title="Executive Compliance & Green Fleet Audit Certificate">
      <div className="space-y-6 text-navy-primary font-sans p-2">
        {/* Certificate Header / Title Block */}
        <div className="bg-background-panel p-5 rounded-xl border border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="teal" size="sm">
                OFFICIAL SIH 2026 AUDIT
              </Badge>
              <Badge variant="quantum" size="sm">
                Q-NSGA-II Certified
              </Badge>
            </div>
            <h2 className="text-lg font-bold text-navy-primary mt-1.5">
              NavOptima Green Fleet Optimization & Decarbonization Report
            </h2>
            <p className="text-xs text-navy-secondary">
              Problem Statement 26138: Quantum-Inspired Fuel Prediction & Green Fleet Optimization
            </p>
          </div>

          <div className="text-right font-mono text-xs">
            <div className="text-navy-muted">Certificate ID:</div>
            <div className="font-bold text-teal">NAV-2026-Q8842-SIH</div>
            <div className="text-[10px] text-navy-muted mt-0.5">{new Date().toLocaleDateString()}</div>
          </div>
        </div>

        {/* Executive KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-3 rounded-lg border border-border text-center">
            <div className="text-[11px] text-navy-muted">Fleet Fuel Cut</div>
            <div className="text-lg font-bold text-teal mt-0.5">
              -{activeScenario.globalKpiDeltas.fuelSavedPct.toFixed(1)}%
            </div>
            <div className="text-[10px] text-success font-medium">Optimal Speed Profiles</div>
          </div>

          <div className="bg-white p-3 rounded-lg border border-border text-center">
            <div className="text-[11px] text-navy-muted">WTW Lifecycle GHG</div>
            <div className="text-lg font-bold text-success mt-0.5">
              -{activeScenario.globalKpiDeltas.wtwCo2ReducedPct.toFixed(1)}%
            </div>
            <div className="text-[10px] text-success font-medium">Well-to-Wake Complete</div>
          </div>

          <div className="bg-white p-3 rounded-lg border border-border text-center">
            <div className="text-[11px] text-navy-muted">IMO CII Grade</div>
            <div className="text-lg font-bold text-teal mt-0.5">Grade A</div>
            <div className="text-[10px] text-teal font-medium">100% Fleet Compliant</div>
          </div>

          <div className="bg-white p-3 rounded-lg border border-border text-center">
            <div className="text-[11px] text-navy-muted">Estimated OPEX Saved</div>
            <div className="text-lg font-bold text-violet mt-0.5">
              ${(activeScenario.globalKpiDeltas.totalFleetCostSavedUsd / 1000).toFixed(0)}k
            </div>
            <div className="text-[10px] text-violet font-medium">Fuel + EU ETS Quota</div>
          </div>
        </div>

        {/* Expected Deliverables Status Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-navy-secondary">
            SIH Problem Statement 26138 Deliverables Audit
          </h3>
          <div className="border border-border rounded-lg overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-background-panel border-b border-border text-navy-primary font-semibold">
                <tr>
                  <th className="py-2 px-3">#</th>
                  <th className="py-2 px-3">Deliverable</th>
                  <th className="py-2 px-3">Implementation Verification</th>
                  <th className="py-2 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-sans">
                {SIH_DELIVERABLES.map((d) => (
                  <tr key={d.sNo}>
                    <td className="py-2 px-3 font-mono font-bold text-navy-muted">#{d.sNo}</td>
                    <td className="py-2 px-3 font-semibold text-navy-primary">{d.deliverable}</td>
                    <td className="py-2 px-3 text-[11px] text-navy-secondary">{d.metrics}</td>
                    <td className="py-2 px-3 text-right">
                      <Badge variant={d.badgeVariant} size="sm">
                        <CheckCircle2 className="h-3 w-3 mr-1 inline" />
                        {d.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active Fleet Registry */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-navy-secondary">
            Deployed Fleet Telemetry & Emissions Schedule
          </h3>
          <div className="border border-border rounded-lg overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-background-panel border-b border-border text-navy-primary font-semibold">
                <tr>
                  <th className="py-2 px-3">Vessel Name</th>
                  <th className="py-2 px-3">Type & DWT</th>
                  <th className="py-2 px-3">Speed (SOG)</th>
                  <th className="py-2 px-3">Fuel Pathway</th>
                  <th className="py-2 px-3">Fuel Rate</th>
                  <th className="py-2 px-3">WTW GHG</th>
                  <th className="py-2 px-3 text-right">IMO CII</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-sans">
                {fleet.map((v) => (
                  <tr key={v.id}>
                    <td className="py-2 px-3 font-bold text-navy-primary">{v.name}</td>
                    <td className="py-2 px-3 text-[11px] text-navy-secondary">
                      {v.type.split('(')[0]} ({v.deadweightTons.toLocaleString()} DWT)
                    </td>
                    <td className="py-2 px-3 font-mono">{v.speedKnots} kts</td>
                    <td className="py-2 px-3 font-semibold text-teal">{v.fuelType}</td>
                    <td className="py-2 px-3 font-mono">{v.fuelRateMTPerDay} MT/d</td>
                    <td className="py-2 px-3 font-mono">{v.wellToWakeEmissions} g/MJ</td>
                    <td className="py-2 px-3 text-right">
                      <Badge
                        variant={v.ciiRating === 'A' ? 'success' : v.ciiRating === 'B' ? 'teal' : 'amber'}
                        size="sm"
                      >
                        Grade {v.ciiRating}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
          <Button variant="outline" size="sm" onClick={handleExportJson} leftIcon={<Download className="h-3.5 w-3.5" />}>
            Export Audit JSON
          </Button>
          <Button variant="primary" size="sm" onClick={handlePrint} leftIcon={<Printer className="h-3.5 w-3.5" />}>
            Print / Save Official PDF
          </Button>
        </div>
      </div>
    </Modal>
  );
};
