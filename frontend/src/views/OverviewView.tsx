import React, { useState } from 'react';
import {
  Ship,
  Fuel,
  Cloud,
  Award,
  AlertTriangle,
  Clock,
  TrendingDown,
  ArrowUpRight,
  ChevronDown,
} from 'lucide-react';
import { RealNetworkMap } from '../components/dashboard/RealNetworkMap';

interface AlertItem {
  id: string;
  type: 'warning' | 'congestion' | 'price' | 'risk';
  vesselOrPort: string;
  message: string;
  timeAgo: string;
}

const ALERTS: AlertItem[] = [
  {
    id: 'alt-1',
    type: 'warning',
    vesselOrPort: 'MV Orion',
    message: 'ETA delayed by 6 hours due to heavy seas in Arabian Sea.',
    timeAgo: '3h ago',
  },
  {
    id: 'alt-2',
    type: 'congestion',
    vesselOrPort: 'Port Congestion - Singapore',
    message: 'Waiting time currently 18 hours at Container Terminal 4.',
    timeAgo: '5h ago',
  },
  {
    id: 'alt-3',
    type: 'price',
    vesselOrPort: 'Fuel Price Update',
    message: 'LNG price adjusted +6% at Singapore bunkering hub.',
    timeAgo: '8h ago',
  },
  {
    id: 'alt-4',
    type: 'risk',
    vesselOrPort: 'CII Risk - MV Atlas',
    message: 'Projected rating: C (2025). Speed reduction recommended.',
    timeAgo: '1d ago',
  },
];

interface FleetRow {
  name: string;
  type: string;
  route: string;
  eta: string;
  fuel: 'LNG' | 'Methanol' | 'HFO' | 'Ammonia';
  speed: number;
  cii: 'A' | 'B' | 'C';
  status: 'Active' | 'Bunkering' | 'In Port';
}

const FLEET_DATA: FleetRow[] = [
  { name: 'MV Orion', type: 'Bulk Carrier', route: 'Mumbai–Chennai', eta: '26 Nov 2025', fuel: 'LNG', speed: 12.8, cii: 'A', status: 'Active' },
  { name: 'MV Polaris', type: 'Tanker', route: 'Mormugao–Kochi', eta: '26 Nov 2025', fuel: 'Methanol', speed: 11.5, cii: 'B', status: 'Active' },
  { name: 'MV Meridian', type: 'Container Ship', route: 'Chennai–Kolkata', eta: '26 Nov 2025', fuel: 'LNG', speed: 14.2, cii: 'A', status: 'Active' },
  { name: 'MV Atlas', type: 'Bulk Carrier', route: 'Kochi–Port Blair', eta: '26 Nov 2025', fuel: 'HFO', speed: 10.9, cii: 'C', status: 'Bunkering' },
  { name: 'MV Pacific', type: 'Container Ship', route: 'Mumbai–Mormugao', eta: '26 Nov 2025', fuel: 'Ammonia', speed: 13.5, cii: 'B', status: 'Active' },
  { name: 'MV Neptune', type: 'Tanker', route: 'Kolkata–Port Blair', eta: '26 Nov 2025', fuel: 'Methanol', speed: 12.1, cii: 'B', status: 'In Port' },
  { name: 'MV Titan', type: 'Bulk Carrier', route: 'Chennai–Mormugao', eta: '26 Nov 2025', fuel: 'LNG', speed: 13.8, cii: 'A', status: 'Active' },
  { name: 'MV Aurora', type: 'Container Ship', route: 'Kochi–Mumbai', eta: '26 Nov 2025', fuel: 'HFO', speed: 15.0, cii: 'C', status: 'Active' },
  { name: 'MV Sirius', type: 'Tanker', route: 'Mumbai–Kolkata', eta: '26 Nov 2025', fuel: 'Ammonia', speed: 14.1, cii: 'B', status: 'Active' },
  { name: 'MV Poseidon', type: 'Bulk Carrier', route: 'Mormugao–Chennai', eta: '26 Nov 2025', fuel: 'LNG', speed: 12.3, cii: 'A', status: 'Bunkering' },
];

export const OverviewView: React.FC = () => {
  const [timeRange, setTimeRange] = useState('Last 7 days');

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto">
      {/* View Header with Time Range Filter */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Overview</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operations, performance and environmental impact.
          </p>
        </div>

        <div className="relative">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="appearance-none bg-white border border-slate-200 text-xs font-medium text-slate-700 rounded-md pl-3 pr-8 py-1.5 focus:outline-none focus:border-[#008B7A] cursor-pointer shadow-2xs"
          >
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>This Quarter</option>
            <option>Year to Date</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Voyages */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-500">Active Voyages</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">8</div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium mt-1">
              <span>↗</span>
              <span>+1 since last week</span>
            </div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-[#008B7A]">
            <Ship className="h-5 w-5" />
          </div>
        </div>

        {/* Fuel Consumption */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-500">Fuel Consumption</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">1,842 <span className="text-sm font-semibold text-slate-500">t</span></div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium mt-1">
              <span>↘</span>
              <span>12% vs last week</span>
            </div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Fuel className="h-5 w-5" />
          </div>
        </div>

        {/* WtW Emissions */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-500">WtW Emissions</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">5,210 <span className="text-xs font-semibold text-slate-500">t CO₂eq</span></div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium mt-1">
              <span>↘</span>
              <span>18% vs last week</span>
            </div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
            <Cloud className="h-5 w-5" />
          </div>
        </div>

        {/* Avg. CII Rating */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs flex items-center justify-between">
          <div className="flex-1 pr-3">
            <span className="text-[11px] font-medium text-slate-500">Avg. CII Rating</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-emerald-600">B</span>
              <span className="text-[11px] text-slate-500 font-medium">6 A · 3 B · 1 C</span>
            </div>
            {/* Color progress bar */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full flex overflow-hidden mt-2">
              <div className="bg-emerald-500 h-full w-[60%]"></div>
              <div className="bg-teal-500 h-full w-[30%]"></div>
              <div className="bg-amber-400 h-full w-[10%]"></div>
            </div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Award className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Middle Section: Route Map & Operational Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Real Interactive Geospatial Network Map: 2 cols */}
        <RealNetworkMap />

        {/* Operational Alerts Card: 1 col */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-800">Operational Alerts</span>
            <button className="text-[11px] font-semibold text-[#008B7A] hover:underline">
              View all
            </button>
          </div>

          <div className="space-y-3 mt-3">
            {ALERTS.map((alert) => (
              <div key={alert.id} className="flex items-start gap-2.5">
                {/* Alert Icon */}
                <div className="mt-0.5 shrink-0">
                  {alert.type === 'warning' && (
                    <div className="h-5 w-5 rounded bg-amber-50 text-amber-600 flex items-center justify-center">
                      <AlertTriangle className="h-3.5 w-3.5" />
                    </div>
                  )}
                  {alert.type === 'congestion' && (
                    <div className="h-5 w-5 rounded bg-sky-50 text-sky-600 flex items-center justify-center">
                      <Clock className="h-3.5 w-3.5" />
                    </div>
                  )}
                  {alert.type === 'price' && (
                    <div className="h-5 w-5 rounded bg-teal-50 text-teal-600 flex items-center justify-center">
                      <Fuel className="h-3.5 w-3.5" />
                    </div>
                  )}
                  {alert.type === 'risk' && (
                    <div className="h-5 w-5 rounded bg-rose-50 text-rose-600 flex items-center justify-center">
                      <Award className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-1">
                    <span className="text-xs font-semibold text-slate-800 truncate">
                      {alert.vesselOrPort}
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                      {alert.timeAgo}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                    {alert.message}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>4 alerts in last 24h</span>
            <span className="text-emerald-600 font-medium">All telemetry healthy</span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Fleet Status Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Fleet Overview
            </h2>
            <p className="text-[11px] text-slate-500">
              Environmental compliance rating across fleet.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-4">Type</th>
                <th className="py-2.5 px-4">Current Route</th>
                <th className="py-2.5 px-4">ETA</th>
                <th className="py-2.5 px-4">Fuel</th>
                <th className="py-2.5 px-4">Speed (kn)</th>
                <th className="py-2.5 px-4">CII</th>
                <th className="py-2.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {FLEET_DATA.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-4 font-medium text-slate-900">{row.type}</td>
                  <td className="py-2.5 px-4 text-slate-600">{row.route}</td>
                  <td className="py-2.5 px-4 text-slate-500 font-mono text-[11px]">{row.eta}</td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded ${
                        row.fuel === 'LNG'
                          ? 'bg-sky-50 text-sky-600 border border-sky-200/60'
                          : row.fuel === 'Methanol'
                          ? 'bg-purple-50 text-purple-600 border border-purple-200/60'
                          : row.fuel === 'Ammonia'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/60'
                          : 'bg-slate-100 text-slate-600 border border-slate-200/60'
                      }`}
                    >
                      {row.fuel}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-mono font-medium">{row.speed}</td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`inline-flex items-center justify-center h-5 w-5 rounded text-[11px] font-bold ${
                        row.cii === 'A'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : row.cii === 'B'
                          ? 'bg-teal-50 text-teal-700 border border-teal-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {row.cii}
                    </span>
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="flex items-center gap-1.5 text-[11px] font-medium">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          row.status === 'Active'
                            ? 'bg-emerald-500'
                            : row.status === 'Bunkering'
                            ? 'bg-amber-500'
                            : 'bg-sky-500'
                        }`}
                      ></span>
                      <span
                        className={
                          row.status === 'Active'
                            ? 'text-emerald-700'
                            : row.status === 'Bunkering'
                            ? 'text-amber-700'
                            : 'text-sky-700'
                        }
                      >
                        {row.status}
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
