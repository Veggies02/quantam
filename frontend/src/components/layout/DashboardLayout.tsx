import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
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
  const { selectedVessel } = useFleet();
  const navigate = useNavigate();

  const handleRunOptimizer = () => {
    navigate('/optimization');
  };

  const handleExecuteModalOptimizer = () => {
    setOptimizationRunning(true);
    setTimeout(() => {
      setOptimizationRunning(false);
      setCompleted(true);
    }, 1200);
  };

  return (
    <div className="h-screen w-screen flex bg-[#F8FAFC] text-slate-800 font-sans overflow-hidden">
      {/* Dark Sidebar */}
      <Sidebar onRunOptimizer={handleRunOptimizer} />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <Navbar />

        {/* Scrollable View Container */}
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC] p-6">
          <Outlet />
        </main>
      </div>

      {/* Quick Optimization Modal */}
      <Modal
        isOpen={isQuickOptimizeOpen}
        onClose={() => setIsQuickOptimizeOpen(false)}
        title={
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#008B7A]" />
            Fast Fleet Pareto Optimizer
          </span>
        }
        description={`Active Dispatch: ${selectedVessel.name}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsQuickOptimizeOpen(false)}>
              Close
            </Button>
            <Button
              variant="primary"
              isLoading={optimizationRunning}
              onClick={handleExecuteModalOptimizer}
              leftIcon={<Play className="h-3.5 w-3.5" />}
            >
              {completed ? 'Re-execute Solver' : 'Execute QIEA-NSGA-II'}
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-xs text-slate-600">
          <p>
            Initiates simulated quantum rotation gates across speed, draft trim, and alternative bunkering schedules.
          </p>
          {completed && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Optimal Pareto Solution Dispatched!</span>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
