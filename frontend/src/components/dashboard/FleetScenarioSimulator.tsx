import React, { useState } from 'react';
import {
  Sliders,
  Fuel,
  TrendingDown,
  DollarSign,
  ShieldCheck,
  Zap,
  Sparkles,
  RefreshCw,
  Layers,
  CheckCircle2,
  PlugZap,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useFleet } from '../../context/FleetContext';

export const FleetScenarioSimulator: React.FC = () => {
  const { fleet, activeScenario, applyOptimizationSolution } = useFleet();

  // Scenario Input Controls
  const [cruisingSpeed, setCruisingSpeed] = useState<number>(14.8);
  const [primaryFuel, setPrimaryFuel] = useState<string>('LNG');
  const [altFuelBlendPct, setAltFuelBlendPct] = useState<number>(35); // % of fleet on e-fuel / bio
  const [cargoLoadPct, setCargoLoadPct] = useState<number>(85);
  const [weatherAdversity, setWeatherAdversity] = useState<number>(3); // Beaufort 0-8
  const [shorePowerEnabled, setShorePowerEnabled] = useState<boolean>(true);

  // Hydrodynamic & Decarbonization Physics Calculations
  // Base power ~ v^3.2 hydrodynamic scaling
  const powerIndex = Math.pow(cruisingSpeed / 15.0, 3.2) * (cargoLoadPct / 85) * (1 + weatherAdversity * 0.035);
  
  // Fuel specifics
  const fuelMetrics: Record<string, { lcv: number; wtwGhg: number; costPerMt: number; baseFuelRate: number }> = {
    'VLSFO': { lcv: 40.5, wtwGhg: 91.16, costPerMt: 620, baseFuelRate: 58.0 },
    'LNG': { lcv: 49.1, wtwGhg: 76.4, costPerMt: 580, baseFuelRate: 46.5 },
    'Biofuel B30': { lcv: 41.2, wtwGhg: 61.2, costPerMt: 780, baseFuelRate: 56.2 },
    'e-Methanol': { lcv: 19.9, wtwGhg: 18.5, costPerMt: 920, baseFuelRate: 88.0 },
    'Green Ammonia': { lcv: 18.6, wtwGhg: 8.2, costPerMt: 1050, baseFuelRate: 98.0 },
    'Green Hydrogen': { lcv: 120.0, wtwGhg: 4.5, costPerMt: 2800, baseFuelRate: 18.5 },
  };

  const selectedFuelInfo = fuelMetrics[primaryFuel] || fuelMetrics['LNG'];
  
  // Composite fleet metrics
  const totalFleetDailyFuel = Number((selectedFuelInfo.baseFuelRate * powerIndex * 4 * (1 - (altFuelBlendPct / 100) * 0.15)).toFixed(1));
  const wtwIntensity = Number((selectedFuelInfo.wtwGhg * (1 - (altFuelBlendPct / 100) * 0.45)).toFixed(1));
  const baselineWtwIntensity = 91.16; // IMO / FuelEU baseline
  const co2ReductionPct = Number((((baselineWtwIntensity - wtwIntensity) / baselineWtwIntensity) * 100).toFixed(1));
  
  const dailyFuelCostUsd = Math.round(totalFleetDailyFuel * selectedFuelInfo.costPerMt);
  const baselineDailyCost = 185000;
  const costSavingsPct = Number((((baselineDailyCost - dailyFuelCostUsd) / baselineDailyCost) * 100).toFixed(1));

  // CII Score estimation
  const attainedCii = Number((2.84 * Math.pow(cruisingSpeed / 17.2, 2.2) * (wtwIntensity / 76.4)).toFixed(2));
  const ciiGrade = attainedCii <= 2.2 ? 'A' : attainedCii <= 3.2 ? 'B' : attainedCii <= 4.2 ? 'C' : attainedCii <= 5.0 ? 'D' : 'E';

  const handleApplyToFleet = () => {
    applyOptimizationSolution({
      id: `scenario-${primaryFuel.toLowerCase()}`,
      is_knee_point: true,
      total_cost_usd: dailyFuelCostUsd * 14,
      total_wtw_ghg_mt: Math.round(totalFleetDailyFuel * 3.1 * 14 * (wtwIntensity / 91.16)),
      total_fuel_mt: Math.round(totalFleetDailyFuel * 14),
      attained_cii: attainedCii,
      cii_grade: ciiGrade,
      attained_gfi: wtwIntensity,
      leg_details: [
        { speed_knots: cruisingSpeed, fuel_type: primaryFuel },
      ],
    });
  };

  return (
    <div className="bg-white border border-border rounded-card shadow-xs p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-violet-light text-violet rounded-lg border border-violet/20">
            <Sliders className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-navy-primary">
                Alternative Fuel & Green Fleet Deployment Simulator
              </h2>
              <Badge variant="violet" size="sm">
                Deliverables 2 & 4
              </Badge>
            </div>
            <p className="text-[11px] text-navy-secondary">
              Simulate vessel mixes, speeds, alternative fuel pathways (LNG, e-Methanol, Hydrogen, Ammonia), and cold-ironing shore power.
            </p>
          </div>
        </div>

        <Button
          variant="quantum"
          size="sm"
          onClick={handleApplyToFleet}
          leftIcon={<Sparkles className="h-3.5 w-3.5" />}
        >
          Deploy Scenario to Fleet
        </Button>
      </div>

      {/* Simulator Grid: Inputs (Left) vs Real-Time Impact (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Controls Column */}
        <div className="lg:col-span-7 space-y-4">
          {/* Alternative Fuel Selector */}
          <div>
            <label className="text-xs font-semibold text-navy-primary flex items-center justify-between mb-1.5">
              <span>Primary Marine Fuel Pathway:</span>
              <span className="text-teal font-bold">{primaryFuel}</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {['LNG', 'Biofuel B30', 'e-Methanol', 'Green Ammonia', 'Green Hydrogen', 'VLSFO'].map((fuel) => (
                <button
                  key={fuel}
                  onClick={() => setPrimaryFuel(fuel)}
                  className={`px-2.5 py-2 rounded-lg text-xs font-semibold border transition-all text-left ${
                    primaryFuel === fuel
                      ? 'bg-teal text-white border-teal shadow-xs'
                      : 'bg-background-panel border-border text-navy-secondary hover:text-navy-primary hover:bg-white'
                  }`}
                >
                  <div className="truncate">{fuel}</div>
                  <div className="text-[9.5px] opacity-80 font-normal">
                    {fuelMetrics[fuel]?.wtwGhg} gCO2e/MJ
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Sliders Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Speed Slider */}
            <div className="bg-background-panel/60 p-3 rounded-lg border border-border">
              <div className="flex justify-between text-xs font-medium text-navy-primary mb-1">
                <span>Cruising Speed:</span>
                <span className="font-mono font-bold text-teal">{cruisingSpeed} knots</span>
              </div>
              <input
                type="range"
                min="10.0"
                max="22.0"
                step="0.2"
                value={cruisingSpeed}
                onChange={(e) => setCruisingSpeed(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-teal"
              />
              <div className="flex justify-between text-[10px] text-navy-muted mt-1">
                <span>10.0 kn (Eco-Slow)</span>
                <span>16.0 kn</span>
                <span>22.0 kn (Max)</span>
              </div>
            </div>

            {/* Alt Fuel Blend Slider */}
            <div className="bg-background-panel/60 p-3 rounded-lg border border-border">
              <div className="flex justify-between text-xs font-medium text-navy-primary mb-1">
                <span>E-Fuel / Bio-Blend Ratio:</span>
                <span className="font-mono font-bold text-violet">{altFuelBlendPct}% Blend</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={altFuelBlendPct}
                onChange={(e) => setAltFuelBlendPct(parseInt(e.target.value))}
                className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-violet"
              />
              <div className="flex justify-between text-[10px] text-navy-muted mt-1">
                <span>0% Baseline</span>
                <span>50%</span>
                <span>100% Net-Zero</span>
              </div>
            </div>

            {/* Cargo Load Utilization Slider */}
            <div className="bg-background-panel/60 p-3 rounded-lg border border-border">
              <div className="flex justify-between text-xs font-medium text-navy-primary mb-1">
                <span>Cargo Payload Capacity:</span>
                <span className="font-mono font-bold text-navy-primary">{cargoLoadPct}% TEU/DWT</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                step="5"
                value={cargoLoadPct}
                onChange={(e) => setCargoLoadPct(parseInt(e.target.value))}
                className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-navy-primary"
              />
              <div className="flex justify-between text-[10px] text-navy-muted mt-1">
                <span>50% Ballast</span>
                <span>85% Nominal</span>
                <span>100% Laden</span>
              </div>
            </div>

            {/* Weather Sea State */}
            <div className="bg-background-panel/60 p-3 rounded-lg border border-border">
              <div className="flex justify-between text-xs font-medium text-navy-primary mb-1">
                <span>Sea State & Headwinds:</span>
                <span className="font-mono font-bold text-amber">Beaufort {weatherAdversity}</span>
              </div>
              <input
                type="range"
                min="0"
                max="7"
                step="1"
                value={weatherAdversity}
                onChange={(e) => setWeatherAdversity(parseInt(e.target.value))}
                className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-amber"
              />
              <div className="flex justify-between text-[10px] text-navy-muted mt-1">
                <span>BF 0 (Calm)</span>
                <span>BF 3 (Moderate)</span>
                <span>BF 7 (Severe Gale)</span>
              </div>
            </div>
          </div>

          {/* Shore Power Cold-Ironing Switch */}
          <div className="flex items-center justify-between p-2.5 bg-teal-light/40 border border-teal/20 rounded-lg">
            <div className="flex items-center gap-2">
              <PlugZap className="h-4 w-4 text-teal" />
              <div>
                <div className="text-xs font-bold text-navy-primary">Port Shore Power (Cold-Ironing) Ready</div>
                <div className="text-[10px] text-navy-secondary">Zero in-port auxiliary emissions via 100% green grid power</div>
              </div>
            </div>
            <button
              onClick={() => setShorePowerEnabled(!shorePowerEnabled)}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                shorePowerEnabled
                  ? 'bg-teal text-white shadow-xs'
                  : 'bg-border text-navy-secondary'
              }`}
            >
              {shorePowerEnabled ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>
        </div>

        {/* Live Simulation Results Column */}
        <div className="lg:col-span-5 bg-background-panel p-4 rounded-xl border border-border flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <span className="text-xs font-bold uppercase tracking-wider text-navy-secondary">
              Simulated Scenario Performance
            </span>
            <Badge
              variant={ciiGrade === 'A' ? 'success' : ciiGrade === 'B' ? 'teal' : 'amber'}
              size="sm"
            >
              CII Grade {ciiGrade}
            </Badge>
          </div>

          <div className="space-y-2.5">
            {/* Metric 1 */}
            <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-border">
              <div className="flex items-center gap-2">
                <Fuel className="h-4 w-4 text-teal" />
                <span className="text-xs text-navy-secondary">Total Fleet Daily Fuel:</span>
              </div>
              <span className="text-sm font-mono font-bold text-navy-primary">
                {totalFleetDailyFuel} <span className="text-xs font-normal text-navy-muted">MT/day</span>
              </span>
            </div>

            {/* Metric 2 */}
            <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-border">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-success" />
                <span className="text-xs text-navy-secondary">WTW Carbon Reduction:</span>
              </div>
              <span className="text-sm font-mono font-bold text-success">
                -{co2ReductionPct}% <span className="text-xs font-normal text-navy-muted">({wtwIntensity} g/MJ)</span>
              </span>
            </div>

            {/* Metric 3 */}
            <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-border">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-violet" />
                <span className="text-xs text-navy-secondary">Daily OPEX & EU ETS:</span>
              </div>
              <span className="text-sm font-mono font-bold text-violet">
                ${dailyFuelCostUsd.toLocaleString()} <span className="text-xs font-normal text-navy-muted">/day</span>
              </span>
            </div>

            {/* Metric 4 */}
            <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-border">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-teal" />
                <span className="text-xs text-navy-secondary">Attained IMO CII Index:</span>
              </div>
              <span className="text-sm font-mono font-bold text-navy-primary">
                {attainedCii} <span className="text-xs font-normal text-navy-muted">gCO2/dwt·nm</span>
              </span>
            </div>
          </div>

          <div className="text-[10px] text-navy-muted pt-2 border-t border-border flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
            <span>Compliant with IMO 2026 MEPC.337(76) and FuelEU Maritime Article 4.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
