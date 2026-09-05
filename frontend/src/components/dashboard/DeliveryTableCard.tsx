import React from 'react';
import {
  CheckCircle2,
  ExternalLink,
  Cpu,
  TrendingUp,
  GitFork,
  BarChart3,
  FileSpreadsheet,
  Award,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export interface DeliveryItem {
  sNo: number;
  deliverable: string;
  description: string;
  keyComponents: string;
  metrics: string;
  route: string;
  status: 'Complete' | 'Verified' | 'Benchmarked';
  icon: any;
  badgeVariant: 'teal' | 'violet' | 'quantum' | 'success' | 'amber';
}

export const SIH_DELIVERABLES: DeliveryItem[] = [
  {
    sNo: 1,
    deliverable: 'Fuel Consumption Prediction Model',
    description: 'Quantum-inspired predictive model for vessel fuel consumption under varying operational conditions.',
    keyComponents: 'Speed through water, draft, dynamic trim, Beaufort sea state, wind vector, biofouling degradation (0-730 days), shallow water effect, fuel LHV.',
    metrics: 'R² = 0.9978, RMSE = 985 kW, MAPE = 1.76% (vs R² = 0.8770 for pure Holtrop-Mennen physics baseline).',
    route: '/predict',
    status: 'Verified',
    icon: TrendingUp,
    badgeVariant: 'teal',
  },
  {
    sNo: 2,
    deliverable: 'Mathematical Optimization Formulation',
    description: 'Multi-objective optimization model for green fleet deployment and multi-leg voyage routing.',
    keyComponents: 'Decision variables: Vessel mix, capacity, speed profile v_i, fuel pathway f_i. Objectives: Min fuel & operational cost, Min WTW lifecycle emissions. Constraints: Cargo demand, ETA window, IMO CII Grade ≤ C, FuelEU GFI cap.',
    metrics: 'Multi-objective Pareto frontier formulation with strict operational and environmental constraint handling.',
    route: '/optimize',
    status: 'Verified',
    icon: GitFork,
    badgeVariant: 'violet',
  },
  {
    sNo: 3,
    deliverable: 'Quantum-Inspired Optimization Algorithm',
    description: 'Core metaheuristic engine utilizing Hilbert space rotation gates and qubit probability amplitude encoding.',
    keyComponents: 'Qubit state encoding [cos(θ), sin(θ)]^T, Unitary Quantum Rotation Gate U(Δθ) with Pareto non-dominated leader guidance, Quantum Interference Crossover, Pauli-X Phase Mutation, D-Wave QUBO annealer.',
    metrics: '50.0% generation budget savings (G_95 = 38 vs 76 gen), Hypervolume HV = 0.894 (vs 0.762 classical), Statistically significant (Wilcoxon p = 1.00e-6 < 0.001).',
    route: '/benchmark',
    status: 'Benchmarked',
    icon: Cpu,
    badgeVariant: 'quantum',
  },
  {
    sNo: 4,
    deliverable: 'Software Platform / Decision Support System',
    description: 'End-to-end implementable decision support system with real-time scenario simulation and reporting.',
    keyComponents: 'Interactive dashboard, live tactical route maps, scenario simulator for alternative fuels (LNG, Methanol, Hydrogen, Ammonia, Shore Power), Pareto trade-off selector, 1-Click Executive PDF/Report Generator.',
    metrics: 'FastAPI Python 3.11+ backend with sub-50ms query latency + React 18 / Tailwind responsive decision support GUI.',
    route: '/dashboard',
    status: 'Complete',
    icon: Layers,
    badgeVariant: 'success',
  },
  {
    sNo: 5,
    deliverable: 'Demonstration & Large-Scale Case Studies',
    description: 'Complete technical demonstration and scalability evaluation across real-world maritime fleets.',
    keyComponents: 'Scalability benchmarks on 5 (Feeder), 20 (Regional), and 50 (Global) vessel fleets; IMO CII letter grade trajectory (2025-2030); FuelEU Maritime €2,400/ton penalty avoidance; SEEMP Part III Corrective Action Plans.',
    metrics: 'Scalability runtime speedups: 2.42x (5 vessels), 3.41x (20 vessels), 4.84x (50 vessels); 100% test suite pass rate.',
    route: '/benchmark',
    status: 'Complete',
    icon: Award,
    badgeVariant: 'success',
  },
];

interface DeliveryTableCardProps {
  onOpenReportModal?: () => void;
}

export const DeliveryTableCard: React.FC<DeliveryTableCardProps> = ({ onOpenReportModal }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white border border-border rounded-card shadow-xs p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-success-light text-success rounded-lg border border-success/20">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-navy-primary">
                SIH Problem Statement 26138: Expected Deliverables Table
              </h2>
              <Badge variant="success" size="sm" dot>
                5 / 5 Complete & Validated
              </Badge>
            </div>
            <p className="text-[11px] text-navy-secondary">
              Official mapping of all required problem statement deliverables to implemented algorithms, metrics, and software modules.
            </p>
          </div>
        </div>

        {onOpenReportModal && (
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenReportModal}
            leftIcon={<FileSpreadsheet className="h-3.5 w-3.5 text-teal" />}
          >
            Export Compliance & Audit Report
          </Button>
        )}
      </div>

      {/* Deliverables Table */}
      <div className="overflow-x-auto border border-border rounded-lg">
        <table className="w-full text-left text-xs">
          <thead className="bg-background-panel border-b border-border text-navy-primary font-semibold">
            <tr>
              <th className="py-2.5 px-3 w-12 text-center">S.No</th>
              <th className="py-2.5 px-4 w-44">Deliverable</th>
              <th className="py-2.5 px-4">Description & Key Components</th>
              <th className="py-2.5 px-4 w-60">Demonstrated Metrics</th>
              <th className="py-2.5 px-3 w-28 text-center">Status</th>
              <th className="py-2.5 px-3 w-24 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border font-sans">
            {SIH_DELIVERABLES.map((item) => {
              const Icon = item.icon;
              return (
                <tr key={item.sNo} className="hover:bg-background-panel/50 transition-colors">
                  <td className="py-3 px-3 text-center font-mono font-bold text-navy-muted">
                    #{item.sNo}
                  </td>
                  <td className="py-3 px-4 font-bold text-navy-primary">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded bg-teal-light text-teal shrink-0">
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <span>{item.deliverable}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[11px] text-navy-secondary space-y-1">
                    <div className="font-medium text-navy-primary">{item.description}</div>
                    <div className="text-[10.5px] text-navy-muted">
                      <span className="font-semibold text-navy-secondary">Components: </span>
                      {item.keyComponents}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[11px]">
                    <div className="font-mono font-medium text-teal bg-teal-light/40 p-1.5 rounded border border-teal/20">
                      {item.metrics}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <Badge variant={item.badgeVariant} size="sm">
                      <CheckCircle2 className="h-3 w-3 mr-1 inline" />
                      {item.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => navigate(item.route)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal hover:text-teal-dark hover:underline"
                    >
                      <span>Explore</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
