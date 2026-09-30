import React, { useState } from 'react';
import {
  Play,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  Award,
  Clock,
  Layers,
  Star,
  Sliders,
} from 'lucide-react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
} from 'recharts';

export const OptimizationView: React.FC = () => {
  const [scenario, setScenario] = useState('Green Transition');
  const [algorithm, setAlgorithm] = useState('QIEA-NSGA-II');
  const [minSpeed, setMinSpeed] = useState(8);
  const [maxSpeed, setMaxSpeed] = useState(18);
  const [ciiConstraint, setCiiConstraint] = useState('C or above');
  const [fuels, setFuels] = useState({
    Methanol: true,
    HFO: true,
    LNG: true,
    Ammonia: true,
  });

  // Pareto Frontier scatter data
  const meridianData = [
    { cost: 88, emissions: 1040, plan: 'Plan #1' },
    { cost: 91, emissions: 980, plan: 'Plan #2' },
    { cost: 95, emissions: 920, plan: 'Plan #3' },
    { cost: 100, emissions: 860, plan: 'Plan #4' },
    { cost: 106, emissions: 800, plan: 'Plan #5' },
    { cost: 112, emissions: 750, plan: 'Plan #6' },
    { cost: 119, emissions: 710, plan: 'Plan #7 (Optimal)' },
    { cost: 125, emissions: 670, plan: 'Plan #8' },
    { cost: 132, emissions: 620, plan: 'Plan #9' },
    { cost: 140, emissions: 570, plan: 'Plan #10' },
    { cost: 152, emissions: 520, plan: 'Plan #11' },
    { cost: 165, emissions: 480, plan: 'Plan #12' },
    { cost: 178, emissions: 430, plan: 'Plan #13' },
    { cost: 195, emissions: 360, plan: 'Plan #14' },
    { cost: 212, emissions: 290, plan: 'Plan #15' },
  ];

  const classicalData = [
    { cost: 96, emissions: 1090 },
    { cost: 108, emissions: 980 },
    { cost: 120, emissions: 890 },
    { cost: 135, emissions: 810 },
    { cost: 150, emissions: 720 },
    { cost: 170, emissions: 640 },
    { cost: 190, emissions: 550 },
    { cost: 215, emissions: 480 },
  ];

  const selectedPlanData = [
    { cost: 92.4, emissions: 412, plan: 'Selected Plan #7' },
  ];

  // Convergence curve data
  const convergenceData = [
    { gen: 0, qiea: 0.28, classical: 0.21 },
    { gen: 20, qiea: 0.42, classical: 0.28 },
    { gen: 40, qiea: 0.54, classical: 0.35 },
    { gen: 60, qiea: 0.62, classical: 0.41 },
    { gen: 80, qiea: 0.67, classical: 0.46 },
    { gen: 100, qiea: 0.70, classical: 0.50 },
    { gen: 120, qiea: 0.72, classical: 0.52 },
    { gen: 140, qiea: 0.73, classical: 0.53 },
    { gen: 160, qiea: 0.74, classical: 0.54 },
    { gen: 180, qiea: 0.74, classical: 0.54 },
    { gen: 200, qiea: 0.75, classical: 0.55 },
  ];

  const metricsBarData = [
    { name: 'Hypervolume (HV)', score: 0.682 },
    { name: 'Front Coverage', score: 0.548 },
    { name: 'Uniform Spacing', score: 0.421 },
    { name: 'Gen Distance (GD)', score: 0.312 },
  ];

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Optimization Workbench</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Multi-objective optimization for cost, emissions and operational constraints.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              className="appearance-none bg-white border border-slate-200 text-xs font-semibold text-slate-700 rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:border-[#008B7A] cursor-pointer shadow-2xs"
            >
              <option>Scenario: Green Transition</option>
              <option>Scenario: Minimum OPEX</option>
              <option>Scenario: Net Zero 2030</option>
              <option>Scenario: High Bunker Price</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>

          <button
            onClick={() => {}}
            className="bg-[#008B7A] hover:bg-[#007768] text-white text-xs font-semibold px-4 py-1.5 rounded-lg flex items-center gap-2 transition-colors shadow-2xs"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>Run Optimization</span>
          </button>
        </div>
      </div>

      {/* Top Section: Form + Pareto Plot & Selected Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Form: Parameters */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Algorithm
              </label>
              <span className="text-[10px] font-mono text-[#008B7A] font-semibold">QIEA-NSGA-II</span>
            </div>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
              className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-[#008B7A] cursor-pointer"
            >
              <option>QIEA-NSGA-II (Quantum-Inspired Rotation Gate)</option>
              <option>Simulated Quantum Annealing (Transverse-Field)</option>
              <option>Classical NSGA-II (Baseline)</option>
              <option>Particle Swarm Optimization (PSO)</option>
            </select>
          </div>

          {/* Speed Range Slider */}
          <div>
            <div className="flex items-center justify-between text-xs font-medium mb-1">
              <span className="text-slate-600">Speed Range</span>
              <span className="font-mono font-bold text-slate-800">{minSpeed} - {maxSpeed} kn</span>
            </div>
            <input
              type="range"
              min="8"
              max="22"
              value={maxSpeed}
              onChange={(e) => setMaxSpeed(parseInt(e.target.value))}
              className="w-full accent-[#008B7A] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
              <span>8 kn (Min)</span>
              <span>22 kn (Max)</span>
            </div>
          </div>

          {/* Fuel Selection Checkboxes */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Allowed Bunker Fuels
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.keys(fuels).map((fuel) => (
                <label key={fuel} className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={fuels[fuel as keyof typeof fuels]}
                    onChange={(e) =>
                      setFuels({ ...fuels, [fuel]: e.target.checked })
                    }
                    className="rounded border-slate-300 text-[#008B7A] focus:ring-[#008B7A] h-3.5 w-3.5"
                  />
                  <span className="text-slate-700 font-medium">{fuel}</span>
                </label>
              ))}
            </div>
          </div>

          {/* CII Rating Constraint */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Minimum CII Rating
            </label>
            <div className="relative">
              <select
                value={ciiConstraint}
                onChange={(e) => setCiiConstraint(e.target.value)}
                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-[#008B7A] cursor-pointer"
              >
                <option>C or above</option>
                <option>B or above</option>
                <option>A only (Strict Green)</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="pt-2">
            <div className="p-3 bg-teal-50/70 border border-teal-100 rounded-lg text-xs text-slate-600">
              <div className="font-semibold text-[#008B7A] mb-1">Quantum Superposition Engine</div>
              <p className="text-[11px] leading-relaxed">
                Unitary rotation gates explore Pareto trade-offs 2.4&times; faster than classical tournament selection.
              </p>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Pareto Plot + Banner Card */}
        <div className="lg:col-span-2 space-y-4">
          {/* Main Pareto Front Scatter Plot */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
              <div>
                <h3 className="text-xs font-bold text-slate-800">Pareto Front: Cost vs Lifecycle Emissions</h3>
                <p className="text-[11px] text-slate-500">
                  Each point represents a feasible fleet deployment plan. Bottom-left is optimal trade-off.
                </p>
              </div>

              {/* Legends */}
              <div className="flex items-center gap-3 text-[11px] text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#008B7A]"></span> MERIDIAN (QIEA-NSGA-II)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-slate-400"></span> Classical NSGA-II
                </span>
                <span className="flex items-center gap-1.5">
                  <Star className="h-3 w-3 text-purple-600 fill-purple-600" /> Selected Plan
                </span>
              </div>
            </div>

            {/* Scatter Plot */}
            <div className="h-[210px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis
                    type="number"
                    dataKey="cost"
                    name="Cost"
                    domain={[50, 220]}
                    tick={{ fontSize: 10, fill: '#64748B' }}
                    label={{ value: 'Total Fleet Cost (Million USD/year)', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#64748B' }}
                  />
                  <YAxis
                    type="number"
                    dataKey="emissions"
                    name="Emissions"
                    domain={[200, 1100]}
                    tick={{ fontSize: 10, fill: '#64748B' }}
                    label={{ value: 'WtW Emissions (kt CO₂eq)', angle: -90, position: 'insideLeft', offset: 0, fontSize: 10, fill: '#64748B' }}
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    contentStyle={{ backgroundColor: '#06141D', borderColor: '#1E293B', color: '#fff', fontSize: '11px', borderRadius: '8px' }}
                  />
                  <Scatter name="Classical NSGA-II" data={classicalData} fill="#94A3B8" shape="circle" />
                  <Scatter name="MERIDIAN (QIEA-NSGA-II)" data={meridianData} fill="#008B7A" shape="circle" />
                  <Scatter name="Selected Plan" data={selectedPlanData} fill="#9333EA" shape="star" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Selected Plan Dark Banner Card */}
          <div className="bg-[#06141D] text-white rounded-xl p-4 shadow-sm border border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#008B7A]/20 text-[#00E5FF] border border-[#008B7A]/40 uppercase tracking-wider">
                Plan #7 Pareto Optimal
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Recommended by Quantum Rotation Gates</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
              <div>
                <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Total Cost</div>
                <div className="text-xl font-bold text-white mt-0.5 font-mono">$92.4 M</div>
                <div className="text-[10px] text-emerald-400 font-medium mt-0.5">&darr; 18% vs baseline</div>
              </div>

              <div>
                <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Lifecycle Emissions</div>
                <div className="text-xl font-bold text-white mt-0.5 font-mono">412 <span className="text-xs text-slate-300 font-normal">kt CO₂eq</span></div>
                <div className="text-[10px] text-emerald-400 font-medium mt-0.5">&darr; 22% vs baseline</div>
              </div>

              <div>
                <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Average Speed</div>
                <div className="text-xl font-bold text-white mt-0.5 font-mono">13.6 kn</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Optimized slow steaming</div>
              </div>

              <div>
                <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">CII Compliance</div>
                <div className="text-xl font-bold text-emerald-400 mt-0.5 font-mono">100%</div>
                <div className="text-[10px] text-slate-400 mt-0.5">10/10 vessels Grade A/B</div>
              </div>
            </div>
          </div>

          {/* 4 Metrics Under Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs">
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Pareto Solutions</div>
              <div className="text-lg font-bold text-slate-900 mt-0.5 font-mono">23</div>
              <div className="text-[10px] text-slate-500">Non-dominated plans</div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs">
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Computation Time</div>
              <div className="text-lg font-bold text-slate-900 mt-0.5 font-mono">4.8 min</div>
              <div className="text-[10px] text-slate-500">200 generations</div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs">
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Hypervolume</div>
              <div className="text-lg font-bold text-[#008B7A] mt-0.5 font-mono">0.682</div>
              <div className="text-[10px] text-emerald-600 font-medium">+24% vs classical</div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs">
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Convergence</div>
              <div className="text-lg font-bold text-emerald-600 mt-0.5">Accepted</div>
              <div className="text-[10px] text-slate-500">Stable Pareto front</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Metrics Bar Chart + Convergence Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Card: Horizontal Performance Bar Chart */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
          <div className="mb-2">
            <h3 className="text-xs font-bold text-slate-800">Optimization Quality Metrics</h3>
            <p className="text-[11px] text-slate-500">Higher is better performance.</p>
          </div>

          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={metricsBarData}
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis type="number" domain={[0, 0.8]} tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#334155' }} width={120} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#06141D', borderColor: '#1E293B', color: '#fff', fontSize: '11px', borderRadius: '8px' }}
                />
                <Bar dataKey="score" fill="#008B7A" radius={[0, 4, 4, 0]} label={{ position: 'right', fill: '#0F172A', fontSize: 10, fontWeight: 600 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Card: Convergence Curve */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-2">
            <div>
              <h3 className="text-xs font-bold text-slate-800">Convergence Curve</h3>
              <p className="text-[11px] text-slate-500">Best solution value vs generations (mean of 5 runs).</p>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="h-0.5 w-3 bg-[#008B7A]"></span> QIEA-NSGA-II
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-0.5 w-3 border-b border-dashed border-slate-400"></span> Classical NSGA-II
              </span>
            </div>
          </div>

          <div className="h-[180px] w-full mt-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={convergenceData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="gen" tick={{ fontSize: 10, fill: '#64748B' }} label={{ value: 'Generations', position: 'insideBottom', offset: -4, fontSize: 10, fill: '#64748B' }} />
                <YAxis domain={[0.2, 0.8]} tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#06141D', borderColor: '#1E293B', color: '#fff', fontSize: '11px', borderRadius: '8px' }}
                />
                <Line type="monotone" dataKey="qiea" stroke="#008B7A" strokeWidth={2.2} dot={false} name="QIEA-NSGA-II" />
                <Line type="monotone" dataKey="classical" stroke="#94A3B8" strokeWidth={1.8} strokeDasharray="4 4" dot={false} name="Classical NSGA-II" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
