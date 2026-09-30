import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { FleetProvider } from './context/FleetContext';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { OverviewView } from './views/OverviewView';
import { FleetView } from './views/FleetView';
import { VoyagesView } from './views/VoyagesView';
import { PredictionView } from './views/PredictionView';
import { OptimizationView } from './views/OptimizationView';
import { FuelsView } from './views/FuelsView';
import { ComplianceView } from './views/ComplianceView';
import { BenchmarkView } from './views/BenchmarkView';

export const App: React.FC = () => {
  return (
    <FleetProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/overview" replace />} />
            <Route path="overview" element={<OverviewView />} />
            <Route path="dashboard" element={<Navigate to="/overview" replace />} />
            <Route path="fleet" element={<FleetView />} />
            <Route path="voyages" element={<VoyagesView />} />
            <Route path="prediction" element={<PredictionView />} />
            <Route path="predict" element={<Navigate to="/prediction" replace />} />
            <Route path="optimization" element={<OptimizationView />} />
            <Route path="optimize" element={<Navigate to="/optimization" replace />} />
            <Route path="fuels" element={<FuelsView />} />
            <Route path="compliance" element={<ComplianceView />} />
            <Route path="benchmark" element={<BenchmarkView />} />
            <Route path="*" element={<Navigate to="/overview" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </FleetProvider>
  );
};

export default App;
