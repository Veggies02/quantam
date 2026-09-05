import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { FleetProvider } from './context/FleetContext';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { MainDashboardView } from './views/MainDashboardView';
import { PredictionView } from './views/PredictionView';
import { OptimizationView } from './views/OptimizationView';
import { BenchmarkView } from './views/BenchmarkView';
import { ComplianceView } from './views/ComplianceView';
import { QuantumAnnealerView } from './views/QuantumAnnealerView';

export const App: React.FC = () => {
  return (
    <FleetProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<MainDashboardView />} />
            <Route path="predict" element={<PredictionView />} />
            <Route path="optimize" element={<OptimizationView />} />
            <Route path="benchmark" element={<BenchmarkView />} />
            <Route path="compliance" element={<ComplianceView />} />
            <Route path="quantum" element={<QuantumAnnealerView />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </FleetProvider>
  );
};

export default App;
