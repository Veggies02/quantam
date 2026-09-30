import React, { useState } from 'react';
import {
  Navigation,
  Calendar,
  Compass,
  Ship,
  Clock,
  CheckCircle2,
  Filter,
  Plus,
  ArrowRight,
  TrendingUp,
  MapPin,
} from 'lucide-react';

interface ScheduledVoyage {
  id: string;
  vessel: string;
  type: string;
  origin: string;
  destination: string;
  departureDate: string;
  arrivalDate: string;
  distanceNM: number;
  estFuelMT: number;
  fuelType: string;
  status: 'In Transit' | 'Scheduled' | 'Delayed' | 'Completed';
  cargo: string;
}

const SCHEDULED_VOYAGES: ScheduledVoyage[] = [
  { id: 'VY-101', vessel: 'MV Meridian', type: 'Container Ship', origin: 'Chennai (INMAA)', destination: 'Singapore (SGSIN)', departureDate: '16 Nov 2025', arrivalDate: '28 Nov 2025', distanceNM: 2870, estFuelMT: 505.2, fuelType: 'Ammonia', status: 'In Transit', cargo: '2,800 TEU High-Value Electronics' },
  { id: 'VY-102', vessel: 'MV Orion', type: 'Bulk Carrier', origin: 'Mumbai (INBOM)', destination: 'Chennai (INMAA)', departureDate: '18 Nov 2025', arrivalDate: '26 Nov 2025', distanceNM: 1420, estFuelMT: 182.4, fuelType: 'LNG', status: 'In Transit', cargo: '55,000 MT Clean Iron Ore' },
  { id: 'VY-103', vessel: 'MV Polaris', type: 'Tanker', origin: 'Mormugao (INMRM)', destination: 'Kochi (INCOK)', departureDate: '20 Nov 2025', arrivalDate: '26 Nov 2025', distanceNM: 410, estFuelMT: 68.2, fuelType: 'Methanol', status: 'In Transit', cargo: '32,000 m³ Chemical Feedstock' },
  { id: 'VY-104', vessel: 'MV Atlas', type: 'Bulk Carrier', origin: 'Kochi (INCOK)', destination: 'Port Blair (INIXZ)', departureDate: '21 Nov 2025', arrivalDate: '26 Nov 2025', distanceNM: 980, estFuelMT: 142.0, fuelType: 'HFO', status: 'Scheduled', cargo: '42,000 MT Construction Aggregates' },
  { id: 'VY-105', vessel: 'MV Pacific', type: 'Container Ship', origin: 'Mumbai (INBOM)', destination: 'Mormugao (INMRM)', departureDate: '22 Nov 2025', arrivalDate: '26 Nov 2025', distanceNM: 250, estFuelMT: 45.6, fuelType: 'Ammonia', status: 'In Transit', cargo: '1,200 TEU Coastal Feeder' },
  { id: 'VY-106', vessel: 'MV Neptune', type: 'Tanker', origin: 'Kolkata (INCCU)', destination: 'Port Blair (INIXZ)', departureDate: '24 Nov 2025', arrivalDate: '28 Nov 2025', distanceNM: 720, estFuelMT: 104.5, fuelType: 'Methanol', status: 'Scheduled', cargo: '18,000 MT Clean Refined Fuels' },
  { id: 'VY-107', vessel: 'MV Titan', type: 'Bulk Carrier', origin: 'Chennai (INMAA)', destination: 'Mormugao (INMRM)', departureDate: '25 Nov 2025', arrivalDate: '30 Nov 2025', distanceNM: 1100, estFuelMT: 168.0, fuelType: 'LNG', status: 'Scheduled', cargo: '60,000 MT Bauxite Ore' },
];

export const VoyagesView: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<string>('All');

  const filtered = SCHEDULED_VOYAGES.filter(v => {
    if (filterStatus === 'All') return true;
    return v.status === filterStatus;
  });

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Voyage Scheduling &amp; Tracking</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active corridors, bunkering stops, and carbon intensity management.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button className="bg-[#008B7A] hover:bg-[#007768] text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs">
            <Plus className="h-3.5 w-3.5" />
            <span>Create Voyage Plan</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-500">Active Corridors</div>
          <div className="text-xl font-bold text-slate-900 mt-1">7 Routes</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">100% Weather Monitored</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-500">Total Scheduled Cargo</div>
          <div className="text-xl font-bold text-slate-900 mt-1">268,200 MT</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">+ 4,000 TEU Containers</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-500">Estimated Voyage Fuel</div>
          <div className="text-xl font-bold text-slate-900 mt-1">1,215.9 MT</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">↓ 14.8% vs Standard Route</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-500">On-Time Performance</div>
          <div className="text-xl font-bold text-emerald-600 mt-1">98.4%</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">±1.8 hr avg deviation</div>
        </div>
      </div>

      {/* Scheduled Voyages List */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {/* Table Filters */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <div className="flex items-center gap-2 text-xs font-semibold">
              {['All', 'In Transit', 'Scheduled', 'Delayed'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    filterStatus === st
                      ? 'bg-[#008B7A] text-white'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
          <div className="text-xs text-slate-400">
            Showing {filtered.length} of {SCHEDULED_VOYAGES.length} voyages
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-4">Voyage ID &amp; Vessel</th>
                <th className="py-2.5 px-4">Origin &rarr; Destination</th>
                <th className="py-2.5 px-4">Schedule</th>
                <th className="py-2.5 px-4">Distance</th>
                <th className="py-2.5 px-4">Fuel &amp; Consumption</th>
                <th className="py-2.5 px-4">Cargo</th>
                <th className="py-2.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{v.vessel}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{v.id} · {v.type}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 font-medium text-slate-800">
                      <span>{v.origin.split(' ')[0]}</span>
                      <ArrowRight className="h-3 w-3 text-slate-400" />
                      <span>{v.destination.split(' ')[0]}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">Green Indian Ocean Transit</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px]">
                    <div>Dep: {v.departureDate}</div>
                    <div className="text-slate-500">Arr: {v.arrivalDate}</div>
                  </td>
                  <td className="py-3 px-4 font-mono font-medium">
                    {v.distanceNM} nm
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-mono font-medium">{v.estFuelMT} MT</div>
                    <span
                      className={`inline-block px-1.5 py-0.5 text-[10px] font-semibold rounded mt-0.5 ${
                        v.fuelType === 'LNG'
                          ? 'bg-sky-50 text-sky-600'
                          : v.fuelType === 'Methanol'
                          ? 'bg-purple-50 text-purple-600'
                          : v.fuelType === 'Ammonia'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {v.fuelType}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 text-[11px]">
                    {v.cargo}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        v.status === 'In Transit'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : v.status === 'Scheduled'
                          ? 'bg-sky-50 text-sky-700 border border-sky-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
                      {v.status}
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
