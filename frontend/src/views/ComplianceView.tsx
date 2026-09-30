import React, { useState } from 'react';
import {
  ShieldCheck,
  ChevronDown,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface VesselComplianceRow {
  id: string;
  name: string;
  type: string;
  cii2024: 'A' | 'B' | 'C' | 'D' | 'E';
  cii2025: 'A' | 'B' | 'C' | 'D' | 'E';
  trend: 'up' | 'stable' | 'down';
  status: 'Compliant' | 'At Risk' | 'Non-Compliant';
  requiredAction: string;
}

const COMPLIANCE_ROWS: VesselComplianceRow[] = [
  { id: '1', name: 'MV Meridian', type: 'Container Ship', cii2024: 'A', cii2025: 'A', trend: 'up', status: 'Compliant', requiredAction: '-' },
  { id: '2', name: 'MV Atlas', type: 'Bulk Carrier', cii2024: 'C', cii2025: 'C', trend: 'stable', status: 'At Risk', requiredAction: 'Speed reduction plan' },
  { id: '3', name: 'MV Polaris', type: 'Tanker', cii2024: 'B', cii2025: 'A', trend: 'up', status: 'Compliant', requiredAction: '-' },
  { id: '4', name: 'MV Pacific', type: 'Container Ship', cii2024: 'B', cii2025: 'B', trend: 'stable', status: 'Compliant', requiredAction: '-' },
  { id: '5', name: 'MV Orion', type: 'Bulk Carrier', cii2024: 'C', cii2025: 'C', trend: 'down', status: 'At Risk', requiredAction: 'Monitor and improve efficiency' },
  { id: '6', name: 'MV Titan', type: 'Bulk Carrier', cii2024: 'A', cii2025: 'A', trend: 'stable', status: 'Compliant', requiredAction: '-' },
  { id: '7', name: 'MV Neptune', type: 'Tanker', cii2024: 'B', cii2025: 'B', trend: 'stable', status: 'Compliant', requiredAction: '-' },
];

export const ComplianceView: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState('2025');
  const [activeTab, setActiveTab] = useState<'cii' | 'fueleu' | 'gfi'>('cii');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Compliant' | 'At Risk' | 'Non-Compliant'>('All');

  // CII Breakdown Data
  const ciiPieData = [
    { name: 'A', value: 18, pct: '36%', color: '#10B981' },
    { name: 'B', value: 20, pct: '42%', color: '#008B7A' },
    { name: 'C', value: 7, pct: '16%', color: '#F59E0B' },
    { name: 'D', value: 2, pct: '4%', color: '#F97316' },
    { name: 'E', value: 0, pct: '0%', color: '#EF4444' },
  ];

  // CII Trajectory (2023 - 2030)
  const trajectoryData = [
    { year: '2023', fleet: 17.8, imoReq: 18.5, baseline: 19.2 },
    { year: '2024', fleet: 16.9, imoReq: 17.6, baseline: 18.3 },
    { year: '2025', fleet: 15.8, imoReq: 16.7, baseline: 17.4 },
    { year: '2026', fleet: 14.9, imoReq: 15.9, baseline: 16.6 },
    { year: '2027', fleet: 14.1, imoReq: 15.1, baseline: 15.8 },
    { year: '2028', fleet: 13.4, imoReq: 14.3, baseline: 15.0 },
    { year: '2029', fleet: 12.8, imoReq: 13.6, baseline: 14.3 },
    { year: '2030', fleet: 12.2, imoReq: 12.9, baseline: 13.6 },
  ];

  const filteredRows = COMPLIANCE_ROWS.filter(r => {
    if (filterStatus === 'All') return true;
    return r.status === filterStatus;
  });

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Compliance</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            CII ratings, FuelEU Maritime, and GFI readiness across your fleet.
          </p>
        </div>

        {/* Year Dropdown */}
        <div className="relative">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="appearance-none bg-white border border-slate-200 text-xs font-semibold text-slate-700 rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:border-[#008B7A] cursor-pointer shadow-2xs"
          >
            <option>Year: 2025</option>
            <option>Year: 2026</option>
            <option>Year: 2027</option>
            <option>Year: 2030</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-slate-200/80 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('cii')}
          className={`transition-colors pb-1 ${
            activeTab === 'cii'
              ? 'text-[#008B7A] border-b-2 border-[#008B7A]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          CII &amp; Ratings
        </button>
        <button
          onClick={() => setActiveTab('fueleu')}
          className={`transition-colors pb-1 ${
            activeTab === 'fueleu'
              ? 'text-[#008B7A] border-b-2 border-[#008B7A]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          FuelEU Maritime
        </button>
        <button
          onClick={() => setActiveTab('gfi')}
          className={`transition-colors pb-1 ${
            activeTab === 'gfi'
              ? 'text-[#008B7A] border-b-2 border-[#008B7A]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          GFI Readiness
        </button>
      </div>

      {/* Top Row: 3 Compliance Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Card 1: Fleet CII Distribution */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-800">Fleet CII Distribution</h3>
            <p className="text-[11px] text-slate-500">Projected breakdown (2025).</p>
          </div>

          <div className="flex items-center justify-between mt-2">
            {/* Donut Chart */}
            <div className="h-[140px] w-[140px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ciiPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={62}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {ciiPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-sm font-bold text-slate-900">48</span>
                <span className="text-[9px] text-slate-400 font-medium">Vessels</span>
              </div>
            </div>

            {/* Legend Breakdown */}
            <div className="space-y-1.5 text-xs">
              {ciiPieData.map((d) => (
                <div key={d.name} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }}></span>
                  <span className="font-semibold text-slate-800">{d.name}</span>
                  <span className="text-slate-500 text-[11px]">{d.pct} ({d.value})</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>IMO MEPC.337(76) Compliant</span>
            <span className="text-emerald-600 font-medium">96% Feasible</span>
          </div>
        </div>

        {/* Card 2: CII Trajectory (2023-2030) */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-800">CII Trajectory (2023–2030)</h3>
            <p className="text-[11px] text-slate-500">
              Fleet average CII vs IMO required trajectory (2% annual improvement).
            </p>
          </div>

          <div className="h-[150px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trajectoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis domain={[10, 20]} ticks={[10, 13, 16, 20]} tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#06141D', borderColor: '#1E293B', color: '#fff', fontSize: '11px', borderRadius: '8px' }}
                />
                <Line type="monotone" dataKey="fleet" stroke="#008B7A" strokeWidth={2.5} dot={false} name="Fleet Average" />
                <Line type="monotone" dataKey="imoReq" stroke="#0284C7" strokeWidth={1.5} strokeDasharray="3 3" dot={false} name="IMO Required" />
                <Line type="monotone" dataKey="baseline" stroke="#F59E0B" strokeWidth={1.5} strokeDasharray="2 2" dot={false} name="Reference Line" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-3 bg-[#008B7A]"></span> Fleet Trend
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-3 border-b border-dashed border-sky-500"></span> IMO Target
            </span>
          </div>
        </div>

        {/* Card 3: GFI Readiness */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-800">GFI Readiness</h3>
            <p className="text-[11px] text-slate-500">Estimated compliance with IMO GFI (well-to-wake).</p>
          </div>

          <div className="flex flex-col items-center justify-center my-2">
            {/* Circular Progress Gauge */}
            <div className="relative h-28 w-28 flex items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="#F1F5F9" strokeWidth="8" fill="none" />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#008B7A"
                  strokeWidth="8"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 * (1 - 0.72)}
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-slate-900 font-mono">72%</span>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">On Track</span>
              </div>
            </div>
          </div>

          <div className="p-2.5 bg-slate-50 border border-slate-200/70 rounded-lg text-[11px] text-slate-500 text-center leading-snug">
            Current fleet trajectory aligns with IMO GFI direct compliance targets for 2025.
          </div>
        </div>
      </div>

      {/* Bottom Row: Status Table & Regulatory Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Fleet Compliance Status Table (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Fleet Compliance Status
              </h2>
              <p className="text-[11px] text-slate-500">Required actions for at-risk vessels.</p>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-2 text-xs font-semibold">
              {(['All', 'Compliant', 'At Risk', 'Non-Compliant'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-2 py-0.5 rounded-md transition-colors ${
                    filterStatus === st
                      ? 'bg-[#008B7A] text-white'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {st} {st === 'All' ? '(48)' : st === 'Compliant' ? '(41)' : st === 'At Risk' ? '(5)' : '(2)'}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-4">Vessel / Type</th>
                  <th className="py-2.5 px-4">CII 2024</th>
                  <th className="py-2.5 px-4">CII 2025</th>
                  <th className="py-2.5 px-4">Trend</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Required Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredRows.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-4">
                      <div className="font-semibold text-slate-900">{r.name}</div>
                      <div className="text-[10px] text-slate-400">{r.type}</div>
                    </td>
                    <td className="py-2.5 px-4 font-mono font-bold">{r.cii2024}</td>
                    <td className="py-2.5 px-4 font-mono font-bold text-[#008B7A]">{r.cii2025}</td>
                    <td className="py-2.5 px-4">
                      {r.trend === 'up' && <ArrowUp className="h-3.5 w-3.5 text-emerald-600" />}
                      {r.trend === 'stable' && <ArrowRight className="h-3.5 w-3.5 text-slate-400" />}
                      {r.trend === 'down' && <ArrowDown className="h-3.5 w-3.5 text-rose-500" />}
                    </td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                          r.status === 'Compliant'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : r.status === 'At Risk'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 text-[11px]">
                      {r.requiredAction}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Regulatory Timeline (1 col) */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-800 mb-1">Regulatory Timeline</h3>
            <p className="text-[11px] text-slate-500 mb-4">Upcoming global decarbonization milestones.</p>

            <div className="relative pl-5 space-y-4 border-l border-slate-200">
              {/* 2023 */}
              <div className="relative">
                <span className="absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-white"></span>
                <div className="text-xs font-bold text-slate-800">2023</div>
                <div className="text-[11px] text-slate-500">EEXI &amp; CII mandatory baseline year</div>
              </div>

              {/* 2024 */}
              <div className="relative">
                <span className="absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-white"></span>
                <div className="text-xs font-bold text-slate-800">2024</div>
                <div className="text-[11px] text-slate-500">EU ETS (shipping) in force</div>
              </div>

              {/* 2025 */}
              <div className="relative">
                <span className="absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-white"></span>
                <div className="text-xs font-bold text-slate-800">2025</div>
                <div className="text-[11px] text-slate-500">FuelEU Maritime in force</div>
              </div>

              {/* 2026 */}
              <div className="relative">
                <span className="absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full bg-amber-500 ring-4 ring-white"></span>
                <div className="text-xs font-bold text-slate-800">2026</div>
                <div className="text-[11px] text-slate-500">EU ETS (CH₄, N₂O) extended &amp; IMO GFI adoption expected</div>
              </div>

              {/* 2030 */}
              <div className="relative">
                <span className="absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full bg-sky-500 ring-4 ring-white"></span>
                <div className="text-xs font-bold text-slate-800">2030</div>
                <div className="text-[11px] text-slate-500">-20/30% IMO GHG target; 2% annual CII improvement</div>
              </div>

              {/* 2050 */}
              <div className="relative">
                <span className="absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full bg-purple-500 ring-4 ring-white"></span>
                <div className="text-xs font-bold text-slate-800">2050</div>
                <div className="text-[11px] text-slate-500">Net-zero GHG emissions target</div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>EU ETS Penalty</span>
            <span className="font-mono text-slate-700">€2,400 / t VLSFO eq</span>
          </div>
        </div>
      </div>
    </div>
  );
};
