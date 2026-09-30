import React, { useState } from 'react';
import {
  Droplets,
  Fuel,
  Zap,
  Atom,
  ChevronDown,
  Info,
  ShieldCheck,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from 'recharts';

export const FuelsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'emissions' | 'infra' | 'constraints'>('emissions');
  const [region, setRegion] = useState('Indian Ports');

  const fuelCards = [
    {
      id: 'lng',
      name: 'LNG',
      icon: Droplets,
      iconBg: 'bg-sky-50 text-sky-600 border border-sky-100',
      emissions: '76',
      unit: 'gCO₂eq/MJ',
      cost: '1.4x',
      density: '50.0 MJ/kg',
      infra: 'Growing availability',
      tag: 'Methane slip risk',
      tagBg: 'bg-slate-100 text-slate-700',
    },
    {
      id: 'bio-methanol',
      name: 'Bio-Methanol',
      icon: Fuel,
      iconBg: 'bg-purple-50 text-purple-600 border border-purple-100',
      emissions: '~18',
      unit: 'gCO₂eq/MJ',
      cost: '3-5x',
      density: '19.9 MJ/kg',
      infra: 'Limited availability',
      tag: 'Short-sea, ferry',
      tagBg: 'bg-purple-50 text-purple-700 border border-purple-200/60',
    },
    {
      id: 'ammonia',
      name: 'Green Ammonia',
      icon: Atom,
      iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
      emissions: '24',
      unit: 'gCO₂eq/MJ',
      cost: '4-7x',
      density: '18.6 MJ/kg',
      infra: 'Early deployment',
      tag: 'Deep-sea potential',
      tagBg: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
    },
    {
      id: 'hydrogen',
      name: 'Green Hydrogen',
      icon: Zap,
      iconBg: 'bg-cyan-50 text-cyan-600 border border-cyan-100',
      emissions: '11',
      unit: 'gCO₂eq/MJ',
      cost: '6-10x',
      density: '120 MJ/kg',
      infra: 'Very limited',
      tag: 'Niche applications',
      tagBg: 'bg-cyan-50 text-cyan-700 border border-cyan-200/60',
    },
  ];

  const emissionsData = [
    { fuel: 'HFO', emissions: 91.5, fill: '#64748B' },
    { fuel: 'LNG', emissions: 76.0, fill: '#0284C7' },
    { fuel: 'Methanol', emissions: 28.0, fill: '#9333EA' },
    { fuel: 'Ammonia', emissions: 24.0, fill: '#10B981' },
    { fuel: 'Hydrogen', emissions: 11.0, fill: '#06B6D4' },
  ];

  const costData = [
    { fuel: 'HFO', cost: 1.0, fill: '#64748B' },
    { fuel: 'LNG', cost: 1.4, fill: '#0284C7' },
    { fuel: 'Methanol', cost: 3.5, fill: '#9333EA' },
    { fuel: 'Ammonia', cost: 5.2, fill: '#10B981' },
    { fuel: 'Hydrogen', cost: 8.0, fill: '#06B6D4' },
  ];

  const radarData = [
    { subject: 'Lower Emissions', LNG: 50, Methanol: 85, Ammonia: 80, Hydrogen: 95 },
    { subject: 'Lower Cost', LNG: 80, Methanol: 45, Ammonia: 35, Hydrogen: 20 },
    { subject: 'Energy Density', LNG: 75, Methanol: 40, Ammonia: 38, Hydrogen: 98 },
    { subject: 'Safety', LNG: 70, Methanol: 80, Ammonia: 40, Hydrogen: 50 },
    { subject: 'Infrastructure', LNG: 78, Methanol: 42, Ammonia: 25, Hydrogen: 15 },
  ];

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Alternative Fuels Comparison</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cost, operational characteristics and infrastructure availability.
          </p>
        </div>

        {/* Region selector */}
        <div className="relative">
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="appearance-none bg-white border border-slate-200 text-xs font-semibold text-slate-700 rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:border-[#008B7A] cursor-pointer shadow-2xs"
          >
            <option>Region: Indian Ports</option>
            <option>Region: Singapore Hub</option>
            <option>Region: European ARA</option>
            <option>Region: Middle East Gulf</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-slate-200/80 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('emissions')}
          className={`transition-colors pb-1 ${
            activeTab === 'emissions'
              ? 'text-[#008B7A] border-b-2 border-[#008B7A]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Emissions Analysis
        </button>
        <button
          onClick={() => setActiveTab('infra')}
          className={`transition-colors pb-1 ${
            activeTab === 'infra'
              ? 'text-[#008B7A] border-b-2 border-[#008B7A]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Infrastructure
        </button>
        <button
          onClick={() => setActiveTab('constraints')}
          className={`transition-colors pb-1 ${
            activeTab === 'constraints'
              ? 'text-[#008B7A] border-b-2 border-[#008B7A]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Operational Constraints
        </button>
      </div>

      {/* Top 4 Fuel Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {fuelCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${card.iconBg}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{card.name}</h3>
                </div>

                {/* Big Emissions Stat */}
                <div className="mt-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900 font-mono">{card.emissions}</span>
                    <span className="text-[10px] text-slate-500 font-medium">{card.unit}</span>
                  </div>
                  <div className="text-[10px] text-slate-400">WtW emissions</div>
                </div>

                {/* Metrics List */}
                <div className="mt-3 space-y-1.5 text-xs border-t border-slate-100 pt-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-[11px]">Relative cost:</span>
                    <span className="font-semibold text-slate-800 font-mono">{card.cost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-[11px]">Energy density:</span>
                    <span className="font-semibold text-slate-800 font-mono">{card.density}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-[11px]">Infrastructure:</span>
                    <span className="font-medium text-slate-700">{card.infra}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Tag */}
              <div className="mt-4 pt-2">
                <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${card.tagBg}`}>
                  {card.tag}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom 3 Comparison Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Emissions Comparison */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
          <div className="mb-2">
            <h3 className="text-xs font-bold text-slate-800">Emissions Comparison</h3>
            <p className="text-[11px] text-slate-500">Well-to-Wake GHG intensity (gCO₂eq/MJ).</p>
          </div>

          <div className="h-[210px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={emissionsData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="fuel" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#06141D', borderColor: '#1E293B', color: '#fff', fontSize: '11px', borderRadius: '8px' }}
                />
                <Bar dataKey="emissions" fill="#008B7A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Center: Fuel Cost Comparison */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
          <div className="mb-2">
            <h3 className="text-xs font-bold text-slate-800">Fuel Cost Comparison</h3>
            <p className="text-[11px] text-slate-500">Relative cost per energy unit (vs HFO).</p>
          </div>

          <div className="h-[210px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="fuel" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis domain={[0, 10]} ticks={[0, 3, 6, 9, 12]} tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#06141D', borderColor: '#1E293B', color: '#fff', fontSize: '11px', borderRadius: '8px' }}
                />
                <Bar dataKey="cost" fill="#0284C7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Fuel Properties Radar */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
          <div className="mb-2">
            <h3 className="text-xs font-bold text-slate-800">Fuel Properties Radar</h3>
            <p className="text-[11px] text-slate-500">Multi-dimensional comparison across key factors.</p>
          </div>

          <div className="h-[210px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: '#475569' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="LNG" dataKey="LNG" stroke="#0284C7" fill="#0284C7" fillOpacity={0.2} />
                <Radar name="Ammonia" dataKey="Ammonia" stroke="#10B981" fill="#10B981" fillOpacity={0.2} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#06141D', borderColor: '#1E293B', color: '#fff', fontSize: '10px', borderRadius: '6px' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
