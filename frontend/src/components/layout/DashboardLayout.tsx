import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Sparkles, Play, CheckCircle2 } from 'lucide-react';
import { useFleet } from '../../context/FleetContext';

export const DashboardLayout: React.FC = () => {
  const [isQuickOptimizeOpen, setIsQuickOptimizeOpen] = useState(false);
  const [optimizationRunning, setOptimizationRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const { selectedVessel, notification, dismissNotification } = useFleet();

  const handleRunOptimization = () => {
    setOptimizationRunning(true);
    setTimeout(() => {
      setOptimizationRunning(false);
      setCompleted(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background-panel text-navy-primary relative">
      {/* Toast Notification Banner */}
      {notification && (
        <div className="fixed top-18 right-6 z-50 animate-in fade-in slide-in-from-top-3 duration-300">
          <div className="bg-navy-dark text-white px-4 py-3 rounded-lg shadow-xl border border-teal/40 flex items-center gap-3 text-xs max-w-md">
            <Sparkles className="h-4 w-4 text-teal shrink-0 animate-pulse" />
            <p className="flex-1 text-white/90 font-medium">{notification.message}</p>
            <button
              onClick={dismissNotification}
              className="text-white/60 hover:text-white text-base leading-none px-1"
            >
              ×
            </button>
          </div>
        </div>
      )}

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
              <li>Objective 1: Minimize Total Heavy Fuel Oil (HFO) consumption (Metric Tons)</li>
              <li>Objective 2: Minimize Estimated Time of Arrival (ETA) delay penalty (Hours)</li>
              <li>Constraint: Maintain IMO CII Rating &ge; B under sea state Beaufort 5+</li>
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
