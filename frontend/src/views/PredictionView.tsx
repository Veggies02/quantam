import React, { useState } from 'react';
import {
  Play,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Cpu,
  Sliders,
  Zap,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

export const PredictionView: React.FC = () => {
  const [speed, setSpeed] = useState<number>(13);
  const [distance, setDistance] = useState<number>(1200);
  const [draft, setDraft] = useState<number>(0.7);
  const [seaState, setSeaState] = useState<number>(2);
  const [vesselType, setVesselType] = useState<string>('Container Ship');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [windSpeed, setWindSpeed] = useState<number>(14);
  const [foulingDays, setFoulingDays] = useState<number>(65);

  // Generate dynamic speed-power-fuel curve
  const chartData = [
    { speed: 8, physics: 12.4, ml: 12.1, actual: 12.2 },
    { speed: 9, physics: 15.2, ml: 15.0, actual: null },
    { speed: 10, physics: 19.8, ml: 20.2, actual: 20.5 },
    { speed: 11, physics: 26.1, ml: 26.9, actual: null },
    { speed: 12, physics: 34.5, ml: 35.8, actual: 36.0 },
    { speed: 13, physics: 45.2, ml: 47.4, actual: 47.2 },
    { speed: 14, physics: 58.4, ml: 61.8, actual: null },
    { speed: 15, physics: 74.8, ml: 79.5, actual: 80.1 },
    { speed: 16, physics: 94.6, ml: 101.2, actual: null },
    { speed: 17, physics: 118.5, ml: 127.4, actual: 128.0 },
    { speed: 18, physics: 147.2, ml: 158.9, actual: null },
  ];

  // Dynamic calculations based on speed slider
  const predictedFuel = (2.2 * Math.pow(speed / 10, 3.2) * (1 + draft * 0.4) * (1 + seaState * 0.05) * 10).toFixed(1);
  const physicsBaseline = (2.0 * Math.pow(speed / 10, 3.1) * (1 + draft * 0.35) * 10).toFixed(1);

  const accuracyData = [
    { name: 'Container Ship', score: 0.94 },
    { name: 'Bulk Carrier', score: 0.91 },
    { name: 'Oil Tanker', score: 0.96 },
    { name: 'Chemical Tanker', score: 0.88 },
  ];

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto">
      {/* Top Header & Run Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Fuel Consumption Prediction</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Hybrid physics &amp; machine learning correction for accurate fuel consumption estimates.
          </p>
        </div>

        <button
          onClick={() => {}}
          className="bg-[#008B7A] hover:bg-[#007768] text-white text-xs font-semibold px-4 py-1.5 rounded-lg flex items-center gap-2 transition-colors shadow-2xs self-start sm:self-auto"
        >
          <Play className="h-3.5 w-3.5 fill-current" />
          <span>Run Prediction</span>
        </button>
      </div>

      {/* Top Row: Parameters Panel + Main Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Voyage Parameters Form */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Target Vessel Type
              </label>
              <div className="relative">
                <select
                  value={vesselType}
                  onChange={(e) => setVesselType(e.target.value)}
                  className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-[#008B7A] cursor-pointer"
                >
                  <option>Container Ship (Ultra Large)</option>
                  <option>Bulk Carrier (Capesize)</option>
                  <option>Oil Tanker (VLCC)</option>
                  <option>Chemical Tanker (Handymax)</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Speed Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-medium mb-1">
                <span className="text-slate-600">Voyage Speed</span>
                <span className="font-mono font-bold text-[#008B7A]">{speed} kn</span>
              </div>
              <input
                type="range"
                min="8"
                max="18"
                step="0.5"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-full accent-[#008B7A] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                <span>8 kn</span>
                <span>18 kn</span>
              </div>
            </div>

            {/* Distance Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-medium mb-1">
                <span className="text-slate-600">Voyage Distance</span>
                <span className="font-mono font-bold text-slate-800">{distance} nm</span>
              </div>
              <input
                type="range"
                min="500"
                max="5000"
                step="100"
                value={distance}
                onChange={(e) => setDistance(parseInt(e.target.value))}
                className="w-full accent-[#008B7A] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                <span>500 nm</span>
                <span>5000 nm</span>
              </div>
            </div>

            {/* Draft / Displacement */}
            <div>
              <div className="flex items-center justify-between text-xs font-medium mb-1">
                <span className="text-slate-600">Draft / Displacement Ratio</span>
                <span className="font-mono font-bold text-slate-800">{draft.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0.4"
                max="1.0"
                step="0.1"
                value={draft}
                onChange={(e) => setDraft(parseFloat(e.target.value))}
                className="w-full accent-[#008B7A] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                <span>0.4 (Ballast)</span>
                <span>1.0 (Full Load)</span>
              </div>
            </div>

            {/* Sea State */}
            <div>
              <div className="flex items-center justify-between text-xs font-medium mb-1">
                <span className="text-slate-600">Sea State (Beaufort)</span>
                <span className="font-mono font-bold text-slate-800">BF {seaState}</span>
              </div>
              <input
                type="range"
                min="1"
                max="6"
                step="1"
                value={seaState}
                onChange={(e) => setSeaState(parseInt(e.target.value))}
                className="w-full accent-[#008B7A] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                <span>Calm (BF 1)</span>
                <span>Rough (BF 6)</span>
              </div>
            </div>

            {/* Advanced Conditions Expandable */}
            <div className="border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1 text-xs font-semibold text-[#008B7A] hover:underline"
              >
                <span>Advanced Conditions</span>
                <ChevronRight className={`h-3 w-3 transition-transform ${showAdvanced ? 'rotate-90' : ''}`} />
              </button>

              {showAdvanced && (
                <div className="mt-3 space-y-3 bg-slate-50 p-3 rounded-lg border border-slate-200/70 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-600">Wind Speed</span>
                      <span className="font-mono font-bold">{windSpeed} kts</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="35"
                      value={windSpeed}
                      onChange={(e) => setWindSpeed(parseInt(e.target.value))}
                      className="w-full accent-[#008B7A]"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-600">Days Since Last Drydock (Fouling)</span>
                      <span className="font-mono font-bold">{foulingDays} days</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="365"
                      value={foulingDays}
                      onChange={(e) => setFoulingDays(parseInt(e.target.value))}
                      className="w-full accent-[#008B7A]"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Chart + 4 Stat Pills */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            {/* Chart Title and Legend */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
              <div>
                <h3 className="text-xs font-bold text-slate-800">Fuel Consumption vs Speed</h3>
                <p className="text-[11px] text-slate-500">
                  Comparison of physics baseline, ML prediction and actual data points.
                </p>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span className="h-0.5 w-3 bg-slate-700"></span> Physics Baseline
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-0.5 w-3 bg-[#008B7A]"></span> ML Prediction
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-purple-600"></span> Actual Data
                </span>
              </div>
            </div>

            {/* Line Chart */}
            <div className="h-[240px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="speed" tick={{ fontSize: 11, fill: '#64748B' }} unit=" kn" />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} unit=" t" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#06141D', borderColor: '#1E293B', color: '#fff', fontSize: '11px', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="physics"
                    stroke="#475569"
                    strokeWidth={1.8}
                    strokeDasharray="4 4"
                    dot={false}
                    name="Physics Baseline"
                  />
                  <Line
                    type="monotone"
                    dataKey="ml"
                    stroke="#008B7A"
                    strokeWidth={2.5}
                    dot={false}
                    name="ML Prediction"
                  />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="#9333EA"
                    strokeWidth={0}
                    dot={{ r: 4, fill: '#9333EA', stroke: '#fff', strokeWidth: 1.5 }}
                    name="Actual Data"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 4 Stat Pills */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-100">
            <div className="bg-teal-50/60 border border-teal-100/80 rounded-lg p-2.5">
              <div className="flex items-center gap-1 text-[10px] text-teal-800 font-semibold uppercase tracking-wider">
                <Zap className="h-3 w-3 text-[#008B7A]" />
                Predicted Fuel
              </div>
              <div className="text-base font-bold text-slate-900 mt-0.5 font-mono">
                {predictedFuel} <span className="text-xs text-slate-500 font-normal">t/day</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">ML model prediction</div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5">
              <div className="flex items-center gap-1 text-[10px] text-slate-600 font-semibold uppercase tracking-wider">
                <Cpu className="h-3 w-3 text-slate-500" />
                Physics Baseline
              </div>
              <div className="text-base font-bold text-slate-900 mt-0.5 font-mono">
                {physicsBaseline} <span className="text-xs text-slate-500 font-normal">t/day</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">From vessel physics model</div>
            </div>

            <div className="bg-emerald-50/60 border border-emerald-100/80 rounded-lg p-2.5">
              <div className="flex items-center gap-1 text-[10px] text-emerald-800 font-semibold uppercase tracking-wider">
                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                Model Accuracy (R²)
              </div>
              <div className="text-base font-bold text-emerald-700 mt-0.5 font-mono">
                0.94
              </div>
              <div className="text-[10px] text-emerald-600 mt-0.5 font-medium">Excellent fit</div>
            </div>

            <div className="bg-amber-50/60 border border-amber-100/80 rounded-lg p-2.5">
              <div className="flex items-center gap-1 text-[10px] text-amber-800 font-semibold uppercase tracking-wider">
                <Sliders className="h-3 w-3 text-amber-600" />
                Residual Error
              </div>
              <div className="text-base font-bold text-amber-700 mt-0.5 font-mono">
                4.2%
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">MAPE accuracy</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Accuracy by Vessel Type + Model Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Card: Horizontal Bar Chart */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
          <div className="mb-2">
            <h3 className="text-xs font-bold text-slate-800">Accuracy by Vessel Type</h3>
            <p className="text-[11px] text-slate-500">Higher is better.</p>
          </div>

          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={accuracyData}
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis type="number" domain={[0, 1.0]} tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#334155' }} width={100} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#06141D', borderColor: '#1E293B', color: '#fff', fontSize: '11px', borderRadius: '8px' }}
                />
                <Bar dataKey="score" fill="#008B7A" radius={[0, 4, 4, 0]} label={{ position: 'right', fill: '#0F172A', fontSize: 10, fontWeight: 600 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Card: Model Insights */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-800 mb-3">Model Insights</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-xs text-slate-600 leading-relaxed">
                  Model explains <strong>94%</strong> of fuel variation across tested voyage conditions.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-xs text-slate-600 leading-relaxed">
                  ML correction improves accuracy by <strong>28%</strong> over physics-only baseline models.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-xs text-slate-600 leading-relaxed">
                  Higher uncertainty at speeds &gt; 16 knots due to wave-making resistance non-linearities.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-xs text-slate-600 leading-relaxed">
                  Sea state and load ratio are top influencing factors after vessel speed.
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Hybrid PINN Architecture</span>
            <span className="font-mono text-[#008B7A]">v2.4 Holtrop-XGBoost</span>
          </div>
        </div>
      </div>
    </div>
  );
};
