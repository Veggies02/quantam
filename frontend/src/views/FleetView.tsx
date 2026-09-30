import React, { useState } from 'react';
import {
  Ship,
  Plus,
  FileDown,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { RealCorridorMap } from '../components/dashboard/RealCorridorMap';

interface VoyageItem {
  id: string;
  route: string;
  departure: string;
  arrival: string;
  distance: string;
  fuel: 'LNG' | 'HFO' | 'Ammonia' | 'Methanol';
  speed: string;
  status: 'Underway' | 'Planned' | 'Completed';
}

const ACTIVE_VOYAGES: VoyageItem[] = [
  { id: 'v1', route: 'Mumbai → Mombasa', departure: '18 Nov 2025', arrival: '30 Nov 2025', distance: '3,245 nm', fuel: 'LNG', speed: '14.2 kn', status: 'Underway' },
  { id: 'v2', route: 'Singapore → Tokyo', departure: '20 Nov 2025', arrival: '02 Dec 2025', distance: '2,890 nm', fuel: 'HFO', speed: '13.8 kn', status: 'Underway' },
  { id: 'v3', route: 'Chennai → Singapore', departure: '16 Nov 2025', arrival: '28 Nov 2025', distance: '2,870 nm', fuel: 'Ammonia', speed: '15.1 kn', status: 'Underway' },
  { id: 'v4', route: 'Kolkata → Dubai', departure: '18 Nov 2025', arrival: '05 Dec 2025', distance: '3,120 nm', fuel: 'Methanol', speed: '16.3 kn', status: 'Planned' },
  { id: 'v5', route: 'Kochi → Colombo', departure: '22 Nov 2025', arrival: '25 Nov 2025', distance: '760 nm', fuel: 'HFO', speed: '12.9 kn', status: 'Underway' },
  { id: 'v6', route: 'Visakhapatnam → Singapore', departure: '15 Nov 2025', arrival: '26 Nov 2025', distance: '1,980 nm', fuel: 'LNG', speed: '14.0 kn', status: 'Underway' },
  { id: 'v7', route: 'JNPT → Salalah', departure: '10 Nov 2025', arrival: '22 Nov 2025', distance: '1,650 nm', fuel: 'HFO', speed: '13.5 kn', status: 'Completed' },
];

export const FleetView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVoyages = ACTIVE_VOYAGES.filter(v => {
    if (activeTab === 'active' && v.status === 'Completed') return false;
    if (activeTab === 'completed' && v.status !== 'Completed') return false;
    if (searchTerm) {
      return (
        v.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.fuel.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return true;
  });

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Fleet Management & Tracking</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Individual voyages with real-time and predicted performance.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button className="bg-[#008B7A] hover:bg-[#007768] text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs">
            <Plus className="h-3.5 w-3.5" />
            <span>New Voyage</span>
          </button>
          <button className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs">
            <FileDown className="h-3.5 w-3.5 text-slate-400" />
            <span>Import Plan</span>
          </button>
        </div>
      </div>

      {/* Top Section: Active Vessel & Voyage Route Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Vessel Card: MV Meridian */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">MV Meridian</h2>
                <p className="text-[11px] text-slate-400 font-medium">68,000 DWT</p>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Underway
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span>Position:</span>
              <span className="font-semibold text-slate-700">13.1°N, 72.8°E</span>
            </div>

            {/* Dark Telemetry Stats Panel */}
            <div className="mt-3 bg-[#06141D] text-white rounded-lg p-3.5 space-y-3">
              <div className="grid grid-cols-2 gap-2 border-b border-slate-800 pb-3">
                <div>
                  <div className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Fuel (Current)</div>
                  <div className="text-lg font-bold text-[#00E5FF] mt-0.5 font-mono">42.1 <span className="text-xs text-slate-300">t/d</span></div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">ETA</div>
                  <div className="text-lg font-bold text-white mt-0.5">28 Nov</div>
                </div>
              </div>

              <div className="space-y-1.5 text-[11px] text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Route:</span>
                  <span className="font-semibold text-white">Chennai → Singapore</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Distance & Time:</span>
                  <span>2,870 nm · 12 days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Sea State:</span>
                  <span className="text-emerald-400">Moderate (BF 3)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <button className="text-xs font-semibold text-[#008B7A] hover:underline flex items-center gap-1">
              <span>View Live Map Details</span>
              <ArrowRight className="h-3 w-3" />
            </button>
            <span className="text-[11px] text-slate-400 font-mono">AIS Signal: Active</span>
          </div>
        </div>

        {/* Right Route & Live Position Map - Real Leaflet Interactive Nautical Map */}
        <RealCorridorMap />
      </div>

      {/* Bottom Section: Active / Completed Voyages Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {/* Table Filters & Search */}
        <div className="px-5 py-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('active')}
              className={`pb-1 transition-colors ${
                activeTab === 'active'
                  ? 'text-[#008B7A] border-b-2 border-[#008B7A]'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Active (8)
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`pb-1 transition-colors ${
                activeTab === 'completed'
                  ? 'text-[#008B7A] border-b-2 border-[#008B7A]'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Completed (11)
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search voyage or vessel..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-56 pl-8 pr-3 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#008B7A] focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-4">Route</th>
                <th className="py-2.5 px-4">Departure</th>
                <th className="py-2.5 px-4">Arrival</th>
                <th className="py-2.5 px-4">Distance</th>
                <th className="py-2.5 px-4">Fuel</th>
                <th className="py-2.5 px-4">Speed</th>
                <th className="py-2.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredVoyages.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-4 font-medium text-slate-900">{v.route}</td>
                  <td className="py-2.5 px-4 text-slate-500 font-mono text-[11px]">{v.departure}</td>
                  <td className="py-2.5 px-4 text-slate-500 font-mono text-[11px]">{v.arrival}</td>
                  <td className="py-2.5 px-4 font-mono">{v.distance}</td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded ${
                        v.fuel === 'LNG'
                          ? 'bg-sky-50 text-sky-600 border border-sky-200/60'
                          : v.fuel === 'Methanol'
                          ? 'bg-purple-50 text-purple-600 border border-purple-200/60'
                          : v.fuel === 'Ammonia'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/60'
                          : 'bg-slate-100 text-slate-600 border border-slate-200/60'
                      }`}
                    >
                      {v.fuel}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-mono font-medium">{v.speed}</td>
                  <td className="py-2.5 px-4">
                    <span className="flex items-center gap-1.5 text-[11px] font-medium">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          v.status === 'Underway'
                            ? 'bg-emerald-500'
                            : v.status === 'Planned'
                            ? 'bg-sky-500'
                            : 'bg-slate-400'
                        }`}
                      ></span>
                      <span
                        className={
                          v.status === 'Underway'
                            ? 'text-emerald-700'
                            : v.status === 'Planned'
                            ? 'text-sky-700'
                            : 'text-slate-600'
                        }
                      >
                        {v.status}
                      </span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
