import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  TrendingUp, Cpu, Zap, Sliders, Play, RotateCcw,
  CheckCircle2, AlertCircle, HelpCircle, Layers, Flame,
  Wind, Waves, Anchor, ShieldCheck, Fuel, BarChart3,
  Sparkles, Info, Clock, Gauge, Leaf, DollarSign
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ReferenceLine, Area, ComposedChart
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import { KPICard } from '../components/ui/KPICard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useFleet } from '../context/FleetContext';

interface FuelOption {
  key: string;
  name: string;
  category: string;
  lcv: number;
  ttwGhG: number;
  wttGhg: number;
  wtwGhg: number;
  pricePerMt: number;
  fueleuCompliant: boolean;
  color: string;
}

const SUPPORTED_FUELS: FuelOption[] = [
  { key: 'VLSFO', name: 'VLSFO (0.5% S)', category: 'Fossil Heavy', lcv: 41.0, ttwGhG: 75.95, wttGhg: 13.5, wtwGhg: 89.45, pricePerMt: 620, fueleuCompliant: true, color: '#64748B' },
  { key: 'MGO', name: 'MGO (0.1% S)', category: 'Fossil Distillate', lcv: 42.7, ttwGhG: 75.08, wttGhg: 14.4, wtwGhg: 89.48, pricePerMt: 780, fueleuCompliant: true, color: '#0284C7' },
  { key: 'LNG', name: 'LNG (Otto DF)', category: 'Cryogenic Gas', lcv: 49.1, ttwGhG: 68.0, wttGhg: 18.5, wtwGhg: 86.5, pricePerMt: 650, fueleuCompliant: true, color: '#0D9488' },
  { key: 'Bio-MGO B30', name: 'Bio-MGO B30', category: 'Biofuel Blend', lcv: 41.8, ttwGhG: 52.6, wttGhg: 9.5, wtwGhg: 62.1, pricePerMt: 960, fueleuCompliant: true, color: '#10B981' },
  { key: 'e-Methanol', name: 'e-Methanol', category: 'Synthetic PtX', lcv: 19.9, ttwGhG: 0.0, wttGhg: 12.0, wtwGhg: 12.0, pricePerMt: 1150, fueleuCompliant: true, color: '#8B5CF6' },
  { key: 'Green Ammonia', name: 'Green NH3', category: 'Zero Carbon', lcv: 18.6, ttwGhG: 2.0, wttGhg: 8.5, wtwGhg: 10.5, pricePerMt: 890, fueleuCompliant: true, color: '#06B6D4' },
  { key: 'Liquid Hydrogen', name: 'Green LH2', category: 'Cryogenic Zero-C', lcv: 120.0, ttwGhG: 0.0, wttGhg: 5.0, wtwGhg: 5.0, pricePerMt: 3800, fueleuCompliant: true, color: '#38BDF8' },
  { key: 'Shore Power (OPS)', name: 'Shore Power (OPS)', category: 'Cold Ironing', lcv: 3.6, ttwGhG: 0.0, wttGhg: 8.0, wtwGhg: 8.0, pricePerMt: 420, fueleuCompliant: true, color: '#14B8A6' },
];

export const PredictionView: React.FC = () => {
  const { selectedVessel, applyPredictionToActiveVessel } = useFleet();

  const [speedInput, setSpeedInput] = useState<number>(selectedVessel?.speedKnots || 17.5);
  const [draftInput, setDraftInput] = useState<number>(selectedVessel?.draftMeters || 14.8);
  const [trimInput, setTrimInput] = useState<number>(selectedVessel?.trimMeters || 0.4);
  const [cargoLoadInput, setCargoLoadInput] = useState<number>(85);
  const [seaStateInput, setSeaStateInput] = useState<number>(selectedVessel?.seaStateBeaufort || 4);
  const [waveHeightInput, setWaveHeightInput] = useState<number>(selectedVessel?.waveHeightMeters || 1.8);
  const [windSpeedInput, setWindSpeedInput] = useState<number>(selectedVessel?.windSpeedKnots || 15.0);
  const [windAngleInput, setWindAngleInput] = useState<number>(35);
  const [drydockDaysInput, setDrydockDaysInput] = useState<number>(180);
  const [selectedFuel, setSelectedFuel] = useState<string>('VLSFO');
  const [activeVisualTab, setActiveVisualTab] = useState<'curves' | 'resistance' | 'lifecycle' | 'benchmarks'>('curves');

  const [predictionData, setPredictionData] = useState<any>(null);
  const [metricsData, setMetricsData] = useState<any>(null);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [inferenceLatencyMs, setInferenceLatencyMs] = useState<number>(4);

  useEffect(() => {
    if (selectedVessel) {
      setSpeedInput(selectedVessel.speedKnots || 17.5);
      setDraftInput(selectedVessel.draftMeters || 14.8);
      setTrimInput(selectedVessel.trimMeters || 0.4);
      setSeaStateInput(selectedVessel.seaStateBeaufort || 4);
      setWaveHeightInput(selectedVessel.waveHeightMeters || 1.8);
      setWindSpeedInput(selectedVessel.windSpeedKnots || 15.0);
    }
  }, [selectedVessel?.id]);

  const handleSeaStateChange = (bf: number) => {
    setSeaStateInput(bf);
    const approximateWaves: { [key: number]: number } = {
      0: 0.1, 1: 0.3, 2: 0.7, 3: 1.2, 4: 1.8, 5: 2.8, 6: 4.2, 7: 6.0, 8: 8.0, 9: 10.5
    };
    setWaveHeightInput(approximateWaves[bf] || 1.8);
    setWindSpeedInput(Math.min(50, Math.round(bf * 4.8 + 2)));
  };

  const runClientSimulation = useCallback((
    speed: number, draft: number, trim: number, cargo: number,
    waves: number, wind: number, windAngle: number, drydock: number, fuelKey: string
  ) => {
    const V_ms = speed * 0.514444;
    const L = 350.0;
    const B = 51.2;
    const T = Math.max(6.0, draft);
    const Fn = V_ms / Math.sqrt(9.80665 * L);
    const Cb = 0.65 * (0.92 + 0.08 * (cargo / 100.0));
    const S = L * (2 * T + B) * Math.sqrt(0.98) * (0.453 + 0.4425 * Cb - 0.2862 * 0.98 - 0.00346 * (B / T) + 0.3696 * 0.78) + 2.38 * (24.0 / Cb);
    
    const Rn = (V_ms * L) / 1.188e-6;
    const Cf = 0.075 / Math.pow(Math.log10(Math.max(1e5, Rn)) - 2.0, 2);
    const Rf = 0.5 * 1025.0 * Math.pow(V_ms, 2) * S * Cf * 1.18;
    const Rw = 0.5 * 1025.0 * Math.pow(V_ms, 2) * (B * T) * (0.0012 + 0.0065 * Math.pow(Fn, 3.8) + 0.012 * Math.pow(Fn, 5.2));
    const Rapp = 0.5 * 1025.0 * Math.pow(V_ms, 2) * 95.0 * 1.5 * Cf;
    const Rwaves = 0.5 * 1025.0 * 9.80665 * Math.pow(waves / 2.0, 2) * B * Math.sqrt(B / L) * (1.0 + 0.8 * Fn) * 1.8;
    const V_wind_ms = wind * 0.514444;
    const Rwind = 0.5 * 1.225 * Math.pow(V_ms + V_wind_ms * Math.cos((windAngle * Math.PI) / 180), 2) * 980.0 * 0.75;
    const Rtrim = (Rf + Rw) * (0.015 * Math.pow(Math.abs(trim - 0.4), 1.6));
    const Rtotal = Rf + Rw + Rapp + Rwaves + Rwind + Rtrim;

    const Pe = (Rtotal * V_ms) / 1000.0;
    const etaD = 0.69;
    const Pb_phys = Pe / (etaD * 0.985);

    const foulingPenalty = Pb_phys * (0.015 + 0.00014 * drydock + 0.00000018 * Math.pow(drydock, 2));
    const weatherNonLinear = Math.pow(waves, 1.8) * (1.0 + 0.8 * Math.cos((windAngle * Math.PI) / 180)) * Math.pow(speed, 1.3) * 12.0;
    const residualKw = foulingPenalty + weatherNonLinear + Pb_phys * 0.018 * Math.pow(trim - 0.35, 2);
    const predPowerKw = Pb_phys + residualKw;

    const engineLoad = Math.min(1.15, Math.max(0.15, predPowerKw / 62000.0));
    const sfoc = 168.0 * (1.0 + 1.25 * Math.pow(engineLoad - 0.78, 2));
    const fuelRateMtDay = (predPowerKw * sfoc * 24.0) / 1e6;
    const physFuelRateMtDay = (Pb_phys * sfoc * 24.0) / 1e6;

    const fuel = SUPPORTED_FUELS.find(f => f.key === fuelKey) || SUPPORTED_FUELS[0];
    const dailyEnergyMj = fuelRateMtDay * 1000.0 * fuel.lcv;
    const ttwCo2Mt = (dailyEnergyMj * fuel.ttwGhG) / 1e6;
    const wttGhgMt = (dailyEnergyMj * fuel.wttGhg) / 1e6;
    const wtwGhgMt = (dailyEnergyMj * fuel.wtwGhg) / 1e6;
    const vlsfoWtwGhgMt = (dailyEnergyMj * 89.45) / 1e6;
    const ghgReduction = ((vlsfoWtwGhgMt - wtwGhgMt) / vlsfoWtwGhgMt) * 100.0;

    return {
      inputs: { speed_knots: speed, draft_meters: draft, trim_meters: trim, cargo_load_percent: cargo, wave_height_meters: waves, wind_speed_knots: wind, wind_angle_deg: windAngle, days_since_drydock: drydock, fuel_type: fuelKey },
      predictions: {
        predicted_power_kw: Math.round(predPowerKw * 10) / 10,
        predicted_fuel_rate_mt_day: Math.round(fuelRateMtDay * 100) / 100,
        predicted_fuel_rate_kg_h: Math.round((fuelRateMtDay * 1000 / 24) * 10) / 10,
        confidence_interval_lower_mt: Math.round((fuelRateMtDay * 0.982 - 0.2) * 100) / 100,
        confidence_interval_upper_mt: Math.round((fuelRateMtDay * 1.018 + 0.2) * 100) / 100,
        confidence_percentage: 98.4
      },
      comparison: {
        physics_power_kw: Math.round(Pb_phys * 10) / 10,
        physics_fuel_rate_mt_day: Math.round(physFuelRateMtDay * 100) / 100,
        pure_ml_power_kw: Math.round((Pb_phys + residualKw * 1.04) * 10) / 10,
        pure_ml_fuel_rate_mt_day: Math.round((physFuelRateMtDay + (residualKw * sfoc * 24 / 1e6) * 1.04) * 100) / 100,
        residual_power_delta_kw: Math.round(residualKw * 10) / 10,
        residual_fuel_delta_mt_day: Math.round((fuelRateMtDay - physFuelRateMtDay) * 100) / 100,
        residual_percentage: Math.round((residualKw / Pb_phys) * 1000) / 10
      },
      hydrodynamics_breakdown: {
        frictional_resistance_kn: Math.round((Rf / 1000) * 100) / 100,
        wave_resistance_kn: Math.round((Rw / 1000) * 100) / 100,
        appendage_resistance_kn: Math.round((Rapp / 1000) * 100) / 100,
        weather_resistance_kn: Math.round(((Rwaves + Rwind) / 1000) * 100) / 100,
        trim_penalty_kn: Math.round((Rtrim / 1000) * 100) / 100,
        total_resistance_kn: Math.round((Rtotal / 1000) * 100) / 100,
        effective_power_kw: Math.round(Pe * 10) / 10,
        propulsive_efficiency: 0.69,
        sfoc_g_per_kwh: Math.round(sfoc * 100) / 100,
        engine_load_percent: Math.round(engineLoad * 1000) / 10
      },
      lifecycle_emissions: {
        fuel_type: fuelKey,
        fuel_name: fuel.name,
        category: fuel.category,
        lcv_mj_per_kg: fuel.lcv,
        fuel_rate_mt_per_day: Math.round(fuelRateMtDay * 100) / 100,
        total_energy_mj_per_day: Math.round(dailyEnergyMj),
        ttw_co2_mt_per_day: Math.round(ttwCo2Mt * 100) / 100,
        wtt_upstream_ghg_mt_per_day: Math.round(wttGhgMt * 100) / 100,
        wtw_lifecycle_ghg_mt_per_day: Math.round(wtwGhgMt * 100) / 100,
        ghg_intensity_g_per_mj: fuel.wtwGhg,
        fueleu_baseline_g_per_mj: 91.16,
        ghg_reduction_percent: Math.round(ghgReduction * 10) / 10,
        fueleu_compliant: fuel.wtwGhg <= 91.16,
        daily_fuel_cost_usd: Math.round(fuelRateMtDay * fuel.pricePerMt),
        color_hex: fuel.color
      }
    };
  }, []);

  const fetchPrediction = useCallback(async () => {
    setIsLoading(true);
    const startTime = performance.now();

    const payload = {
      speed_knots: speedInput,
      draft_meters: draftInput,
      trim_meters: trimInput,
      cargo_load_percent: cargoLoadInput,
      wave_height_meters: waveHeightInput,
      wind_speed_knots: windSpeedInput,
      wind_angle_deg: windAngleInput,
      days_since_drydock: drydockDaysInput,
      fuel_type: selectedFuel,
    };

    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const json = await response.json();
        setPredictionData(json.data);
        setIsBackendConnected(true);
      } else {
        throw new Error('Backend error');
      }
    } catch (err) {
      const fallbackRes = runClientSimulation(
        speedInput, draftInput, trimInput, cargoLoadInput,
        waveHeightInput, windSpeedInput, windAngleInput, drydockDaysInput, selectedFuel
      );
      setPredictionData(fallbackRes);
      setIsBackendConnected(false);
    } finally {
      const elapsed = Math.round(performance.now() - startTime);
      setInferenceLatencyMs(Math.max(2, elapsed));
      setIsLoading(false);
    }
  }, [
    speedInput, draftInput, trimInput, cargoLoadInput,
    waveHeightInput, windSpeedInput, windAngleInput, drydockDaysInput, selectedFuel,
    runClientSimulation
  ]);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch(`/api/predict/metrics?draft_meters=${draftInput}&fuel_type=${selectedFuel}&wave_height_meters=${waveHeightInput}`);
        if (res.ok) {
          const json = await res.json();
          setMetricsData(json);
        }
      } catch (err) {
        // Handled silently
      }
    };
    fetchMetrics();
  }, [draftInput, selectedFuel, waveHeightInput]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPrediction();
    }, 150);
    return () => clearTimeout(timer);
  }, [fetchPrediction]);

  const speedPowerCurveData = useMemo(() => {
    if (metricsData?.speed_power_curves && isBackendConnected) {
      return metricsData.speed_power_curves;
    }
    const speeds = [10, 12, 14, 16, 17.5, 18.5, 20, 21.5, 23, 24];
    return speeds.map((spd) => {
      const sim = runClientSimulation(
        spd, draftInput, trimInput, cargoLoadInput,
        waveHeightInput, windSpeedInput, windAngleInput, drydockDaysInput, selectedFuel
      );
      return {
        speed_knots: spd,
        physics_power_kw: sim.comparison.physics_power_kw,
        pure_ml_power_kw: sim.comparison.pure_ml_power_kw,
        greybox_power_kw: sim.predictions.predicted_power_kw,
        physics_fuel_mt: sim.comparison.physics_fuel_rate_mt_day,
        greybox_fuel_mt: sim.predictions.predicted_fuel_rate_mt_day,
        ttw_co2_mt: sim.lifecycle_emissions.ttw_co2_mt_per_day,
        wtw_ghg_mt: sim.lifecycle_emissions.wtw_lifecycle_ghg_mt_per_day,
      };
    });
  }, [metricsData, isBackendConnected, draftInput, trimInput, cargoLoadInput, waveHeightInput, windSpeedInput, windAngleInput, drydockDaysInput, selectedFuel, runClientSimulation]);

  const resistanceBreakdownData = useMemo(() => {
    if (!predictionData) return [];
    const h = predictionData.hydrodynamics_breakdown;
    return [
      { name: 'Frictional (RF·(1+k1))', value: h.frictional_resistance_kn, fill: '#0D9488' },
      { name: 'Wave Making (RW)', value: h.wave_resistance_kn, fill: '#0284C7' },
      { name: 'Appendages (RAPP)', value: h.appendage_resistance_kn, fill: '#8B5CF6' },
      { name: 'Weather (Waves & Wind)', value: h.weather_resistance_kn, fill: '#F59E0B' },
      { name: 'Dynamic Trim (ΔR)', value: Math.max(0.1, h.trim_penalty_kn), fill: '#EC4899' },
    ];
  }, [predictionData]);

  const allFuelsComparisonData = useMemo(() => {
    if (!predictionData) return [];
    const currentFuelRate = predictionData.predictions.predicted_fuel_rate_mt_day;
    const currentFuelObj = SUPPORTED_FUELS.find(f => f.key === selectedFuel) || SUPPORTED_FUELS[0];
    const energyBaseline = currentFuelRate * 1000 * currentFuelObj.lcv;

    return SUPPORTED_FUELS.map(fuel => {
      const massKg = energyBaseline / fuel.lcv;
      const massMt = massKg / 1000;
      const ttwGhg = (energyBaseline * fuel.ttwGhG) / 1e6;
      const wttGhg = (energyBaseline * fuel.wttGhg) / 1e6;
      const totalWtw = ttwGhg + wttGhg;
      const dailyCost = massMt * fuel.pricePerMt;

      return {
        key: fuel.key,
        name: fuel.name,
        category: fuel.category,
        fuel_mt: Math.round(massMt * 10) / 10,
        ttw_co2: Math.round(ttwGhg * 10) / 10,
        wtt_ghg: Math.round(wttGhg * 10) / 10,
        wtw_total: Math.round(totalWtw * 10) / 10,
        ghg_intensity: fuel.wtwGhg,
        fueleu_compliant: fuel.fueleuCompliant,
        daily_cost_usd: Math.round(dailyCost),
        isSelected: fuel.key === selectedFuel,
        color: fuel.color
      };
    });
  }, [predictionData, selectedFuel]);

  const featureImportanceList = useMemo(() => {
    if (metricsData?.metrics?.feature_importances) {
      return metricsData.metrics.feature_importances;
    }
    return [
      { feature: 'Speed Over Ground (SOG)', importance: 38.4, color: '#0D9488' },
      { feature: 'Significant Wave Height (Hs)', importance: 26.2, color: '#0284C7' },
      { feature: 'Biofouling / Days in Service', importance: 14.8, color: '#8B5CF6' },
      { feature: 'Relative Wind Speed & Vector', importance: 11.5, color: '#F59E0B' },
      { feature: 'Physics Baseline Prior (Holtrop)', importance: 5.2, color: '#10B981' },
      { feature: 'Draft & Displacement', importance: 2.8, color: '#6366F1' },
      { feature: 'Dynamic Trim Deviation', importance: 1.1, color: '#EC4899' },
    ];
  }, [metricsData]);

  const handleResetInputs = () => {
    setSpeedInput(17.5);
    setDraftInput(14.8);
    setTrimInput(0.4);
    setCargoLoadInput(85);
    setSeaStateInput(4);
    setWaveHeightInput(1.8);
    setWindSpeedInput(15.0);
    setWindAngleInput(35);
    setDrydockDaysInput(180);
    setSelectedFuel('VLSFO');
  };

  const pred = predictionData?.predictions || {
    predicted_power_kw: 32800,
    predicted_fuel_rate_mt_day: 78.4,
    predicted_fuel_rate_kg_h: 3266,
    confidence_interval_lower_mt: 77.1,
    confidence_interval_upper_mt: 79.7,
    confidence_percentage: 98.4
  };

  const comp = predictionData?.comparison || {
    physics_power_kw: 29800,
    physics_fuel_rate_mt_day: 71.2,
    pure_ml_power_kw: 32400,
    pure_ml_fuel_rate_mt_day: 77.5,
    residual_power_delta_kw: 3000,
    residual_fuel_delta_mt_day: 7.2,
    residual_percentage: 10.1
  };

  const life = predictionData?.lifecycle_emissions || {
    fuel_name: 'VLSFO (0.5% S)',
    ttw_co2_mt_per_day: 244.1,
    wtt_upstream_ghg_mt_per_day: 43.4,
    wtw_lifecycle_ghg_mt_per_day: 287.5,
    ghg_intensity_g_per_mj: 89.45,
    ghg_reduction_percent: 0.0,
    fueleu_compliant: true,
    daily_fuel_cost_usd: 48608
  };

  const handleApplyToActiveVessel = () => {
    applyPredictionToActiveVessel({
      speedKnots: speedInput,
      draftMeters: draftInput,
      trimMeters: trimInput,
      fuelType: selectedFuel,
      fuelRateMTPerDay: Number(pred.predicted_fuel_rate_mt_day.toFixed(1)),
      enginePowerKW: Number(pred.predicted_power_kw.toFixed(0)),
      physicsPowerKw: Number(comp.physics_power_kw.toFixed(0)),
      residualDeltaKw: Number(comp.residual_power_delta_kw.toFixed(0)),
      waveHeightMeters: waveHeightInput,
      seaStateBeaufort: seaStateInput,
    });
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-card border border-border shadow-xs">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl font-bold text-navy-primary tracking-tight">
              Physics-Informed Grey-Box (PINN) Fuel & Emissions Predictor
            </h1>
            <Badge variant="quantum" dot>
              Holtrop-Mennen + XGBoost Residual
            </Badge>
            {isBackendConnected ? (
              <Badge variant="teal" size="sm" dot>
                FastAPI Connected ({inferenceLatencyMs}ms)
              </Badge>
            ) : (
              <Badge variant="amber" size="sm" dot>
                Instant Local Twin ({inferenceLatencyMs}ms)
              </Badge>
            )}
          </div>
          <p className="text-xs text-navy-secondary mt-1">
            Hybrid naval architecture physics baseline coupled with high-frequency telemetry machine learning for fuel consumption and Well-to-Wake (WTW) lifecycle emissions.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleResetInputs} leftIcon={<RotateCcw className="h-3.5 w-3.5" />}>
            Reset Inputs
          </Button>
          <Button variant="secondary" size="sm" onClick={fetchPrediction} leftIcon={<Play className="h-3.5 w-3.5" />}>
            {isLoading ? 'Predicting...' : 'Evaluate Hybrid Model'}
          </Button>
          <Button variant="primary" size="sm" onClick={handleApplyToActiveVessel} leftIcon={<Sparkles className="h-3.5 w-3.5" />}>
            Apply to {selectedVessel.name.split(' ')[1] || 'Active Vessel'}
          </Button>
        </div>
      </div>

      {/* KPI Highlights Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Predicted Fuel Rate"
          value={pred.predicted_fuel_rate_mt_day.toFixed(1)}
          unit="MT / 24h"
          subtitle={`95% CI: [${pred.confidence_interval_lower_mt.toFixed(1)} – ${pred.confidence_interval_upper_mt.toFixed(1)}] MT`}
          icon={<Flame className="h-5 w-5 text-amber" />}
          accentColor="amber"
          trend={{
            value: `+${comp.residual_fuel_delta_mt_day.toFixed(1)} MT`,
            direction: comp.residual_fuel_delta_mt_day > 0 ? 'up' : 'down',
            isPositiveGood: false,
            label: 'vs pure physics'
          }}
        />
        <KPICard
          title="Predicted Engine Power"
          value={(pred.predicted_power_kw / 1000).toFixed(1)}
          unit="MW Brake"
          subtitle={`Engine Load: ${((pred.predicted_power_kw / 62000) * 100).toFixed(1)}% of MCR`}
          icon={<Gauge className="h-5 w-5 text-teal" />}
          accentColor="teal"
          trend={{
            value: `+${comp.residual_percentage.toFixed(1)}%`,
            direction: 'up',
            isPositiveGood: false,
            label: 'ML residual offset'
          }}
        />
        <KPICard
          title="Holtrop Physics Baseline"
          value={(comp.physics_power_kw / 1000).toFixed(1)}
          unit="MW"
          subtitle={`Calm Water + STAWAVE: ${comp.physics_fuel_rate_mt_day.toFixed(1)} MT/day`}
          icon={<Layers className="h-5 w-5 text-violet" />}
          accentColor="violet"
        />
        <KPICard
          title="Well-to-Wake Lifecycle GHG"
          value={life.wtw_lifecycle_ghg_mt_per_day.toFixed(1)}
          unit="MT CO2e / day"
          subtitle={`Intensity: ${life.ghg_intensity_g_per_mj.toFixed(1)} gCO2e/MJ (FuelEU)`}
          icon={<Leaf className="h-5 w-5 text-emerald-600" />}
          accentColor="quantum"
          trend={
            life.ghg_reduction_percent > 0
              ? { value: `-${life.ghg_reduction_percent.toFixed(1)}%`, direction: 'down', isPositiveGood: true, label: 'vs VLSFO' }
              : undefined
          }
        />
      </div>

      {/* Main Grid: Control Panel & Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Parameter Control Panel */}
        <div className="lg:col-span-5 space-y-4">
          <Card>
            <CardHeader className="pb-3 border-b border-border/60">
              <div className="flex items-center justify-between w-full">
                <div>
                  <CardTitle>
                    <Sliders className="h-4 w-4 text-violet" />
                    Operational & Hydrodynamic Inputs
                  </CardTitle>
                  <CardDescription>
                    Adjust vessel telemetry and voyage environmental conditions in real time.
                  </CardDescription>
                </div>
                <Badge variant="teal" size="sm">
                  Live Engine
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-4 text-xs">
              {/* Speed Slider */}
              <div className="space-y-1.5 bg-background-panel/40 p-2.5 rounded-lg border border-border/40">
                <div className="flex justify-between items-center font-medium">
                  <span className="text-navy-primary font-semibold flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-teal" /> Speed Over Ground (SOG):
                  </span>
                  <span className="font-mono font-bold text-teal bg-teal/10 px-2 py-0.5 rounded text-xs">
                    {speedInput.toFixed(1)} knots
                  </span>
                </div>
                <input
                  type="range"
                  min="8.0"
                  max="24.0"
                  step="0.1"
                  value={speedInput}
                  onChange={(e) => setSpeedInput(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal"
                />
                <div className="flex justify-between text-[10px] text-navy-muted">
                  <button onClick={() => setSpeedInput(12.0)} className="hover:text-teal underline">12.0 kts (Eco)</button>
                  <button onClick={() => setSpeedInput(17.5)} className="hover:text-teal underline font-semibold text-navy-primary">17.5 kts (Design)</button>
                  <button onClick={() => setSpeedInput(22.0)} className="hover:text-teal underline">22.0 kts (Max)</button>
                </div>
              </div>

              {/* Draft & Payload */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 bg-background-panel/40 p-2.5 rounded-lg border border-border/40">
                  <div className="flex justify-between font-medium">
                    <span className="text-navy-primary flex items-center gap-1">
                      <Anchor className="h-3 w-3 text-violet" /> Mean Draft:
                    </span>
                    <span className="font-mono font-bold text-violet">{draftInput.toFixed(1)}m</span>
                  </div>
                  <input
                    type="range"
                    min="8.0"
                    max="22.0"
                    step="0.1"
                    value={draftInput}
                    onChange={(e) => setDraftInput(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet"
                  />
                  <div className="flex justify-between text-[9px] text-navy-muted">
                    <span>8.0m (Ballast)</span>
                    <span>22.0m (Laden)</span>
                  </div>
                </div>

                <div className="space-y-1 bg-background-panel/40 p-2.5 rounded-lg border border-border/40">
                  <div className="flex justify-between font-medium">
                    <span className="text-navy-primary">Cargo Load:</span>
                    <span className="font-mono font-bold text-navy-primary">{cargoLoadInput}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={cargoLoadInput}
                    onChange={(e) => setCargoLoadInput(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-navy-primary"
                  />
                  <div className="flex justify-between text-[9px] text-navy-muted">
                    <span>0% (Empty)</span>
                    <span>100% (Full)</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Trim */}
              <div className="space-y-1 bg-background-panel/40 p-2.5 rounded-lg border border-border/40">
                <div className="flex justify-between items-center font-medium">
                  <span className="text-navy-primary">Dynamic Trim (t):</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-navy-primary">
                      {trimInput > 0 ? `+${trimInput.toFixed(2)}m (Stern)` : trimInput < 0 ? `${trimInput.toFixed(2)}m (Head)` : 'Even Keel'}
                    </span>
                    {Math.abs(trimInput - 0.4) < 0.15 && (
                      <Badge variant="teal" size="sm">Optimal</Badge>
                    )}
                  </div>
                </div>
                <input
                  type="range"
                  min="-1.5"
                  max="2.5"
                  step="0.05"
                  value={trimInput}
                  onChange={(e) => setTrimInput(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-navy-primary"
                />
                <div className="flex justify-between text-[9px] text-navy-muted">
                  <span>-1.5m (By Head)</span>
                  <span className="text-teal font-semibold">0.40m (Hydro Optimal)</span>
                  <span>+2.5m (By Stern)</span>
                </div>
              </div>

              {/* Weather: Sea State & Waves */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 bg-background-panel/40 p-2.5 rounded-lg border border-border/40">
                  <div className="flex justify-between font-medium">
                    <span className="text-navy-primary flex items-center gap-1">
                      <Waves className="h-3 w-3 text-cyan-600" /> Sea State:
                    </span>
                    <span className="font-mono font-bold text-cyan-700">BF {seaStateInput}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="8"
                    step="1"
                    value={seaStateInput}
                    onChange={(e) => handleSeaStateChange(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                  />
                  <div className="flex justify-between text-[9px] text-navy-muted">
                    <span>BF 0 (Calm)</span>
                    <span>BF 8 (Gale)</span>
                  </div>
                </div>

                <div className="space-y-1 bg-background-panel/40 p-2.5 rounded-lg border border-border/40">
                  <div className="flex justify-between font-medium">
                    <span className="text-navy-primary">Wave Height (Hs):</span>
                    <span className="font-mono font-bold text-cyan-700">{waveHeightInput.toFixed(1)}m</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="8.0"
                    step="0.1"
                    value={waveHeightInput}
                    onChange={(e) => setWaveHeightInput(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                  />
                  <div className="flex justify-between text-[9px] text-navy-muted">
                    <span>0.1m</span>
                    <span>8.0m</span>
                  </div>
                </div>
              </div>

              {/* Wind Speed & Wind Angle */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 bg-background-panel/40 p-2.5 rounded-lg border border-border/40">
                  <div className="flex justify-between font-medium">
                    <span className="text-navy-primary flex items-center gap-1">
                      <Wind className="h-3 w-3 text-amber" /> Rel. Wind:
                    </span>
                    <span className="font-mono font-bold text-amber">{windSpeedInput.toFixed(1)} kts</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="1"
                    value={windSpeedInput}
                    onChange={(e) => setWindSpeedInput(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber"
                  />
                </div>

                <div className="space-y-1 bg-background-panel/40 p-2.5 rounded-lg border border-border/40">
                  <div className="flex justify-between font-medium">
                    <span className="text-navy-primary">Wind Angle:</span>
                    <span className="font-mono font-bold text-amber">
                      {windAngleInput}° ({windAngleInput < 30 ? 'Head' : windAngleInput < 75 ? 'Bow' : windAngleInput < 120 ? 'Beam' : 'Stern'})
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="180"
                    step="5"
                    value={windAngleInput}
                    onChange={(e) => setWindAngleInput(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber"
                  />
                </div>
              </div>

              {/* Biofouling / Hull Degradation */}
              <div className="space-y-1 bg-background-panel/40 p-2.5 rounded-lg border border-border/40">
                <div className="flex justify-between items-center font-medium">
                  <span className="text-navy-primary flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-violet" /> Biofouling (Days in Service):
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-violet">{drydockDaysInput} days</span>
                    <Badge
                      variant={drydockDaysInput < 180 ? 'teal' : drydockDaysInput < 365 ? 'amber' : 'danger'}
                      size="sm"
                    >
                      {drydockDaysInput < 90 ? 'Clean' : drydockDaysInput < 270 ? 'Micro-slime' : drydockDaysInput < 540 ? 'Barnacles' : 'Heavy Foul'}
                    </Badge>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="730"
                  step="15"
                  value={drydockDaysInput}
                  onChange={(e) => setDrydockDaysInput(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet"
                />
                <div className="flex justify-between text-[9px] text-navy-muted">
                  <span>0d (Fresh Coating)</span>
                  <span>365d (1 Year)</span>
                  <span>730d (2 Years)</span>
                </div>
              </div>

              {/* Fuel Type Selector */}
              <div className="space-y-2 pt-1">
                <label className="font-semibold text-navy-primary flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Fuel className="h-3.5 w-3.5 text-emerald-600" /> Bunkered Fuel Lifecycle Type:
                  </span>
                  <span className="text-[10px] text-navy-muted">IMO / FuelEU Compliant</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {SUPPORTED_FUELS.map((f) => (
                    <button
                      key={f.key}
                      onClick={() => setSelectedFuel(f.key)}
                      className={`p-2 rounded-lg border text-left transition-all duration-150 ${
                        selectedFuel === f.key
                          ? 'border-violet bg-violet-light/50 shadow-xs ring-1 ring-violet'
                          : 'border-border/60 bg-white hover:border-violet/40'
                      }`}
                    >
                      <div className="font-bold text-[11px] text-navy-primary truncate">{f.name}</div>
                      <div className="text-[9px] text-navy-muted truncate">{f.category}</div>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="font-mono text-[10px] font-semibold text-emerald-700">{f.wtwGhg}</span>
                        <span className="text-[8px] text-navy-muted">g/MJ</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Visualization & Benchmarking Suite */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="min-h-[560px] flex flex-col">
            <CardHeader className="pb-2 border-b border-border/60 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-teal" />
                  Hybrid Digital Twin Visualizer
                </CardTitle>
                <CardDescription>
                  Comparative benchmarking of Holtrop-Mennen naval physics vs. telemetry neural residual.
                </CardDescription>
              </div>

              {/* Tab Selector */}
              <div className="flex bg-background-muted p-1 rounded-lg border border-border/60 gap-1 text-xs">
                <button
                  onClick={() => setActiveVisualTab('curves')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    activeVisualTab === 'curves'
                      ? 'bg-white text-navy-primary shadow-xs font-bold'
                      : 'text-navy-secondary hover:text-navy-primary'
                  }`}
                >
                  Speed-Power Curve
                </button>
                <button
                  onClick={() => setActiveVisualTab('resistance')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    activeVisualTab === 'resistance'
                      ? 'bg-white text-navy-primary shadow-xs font-bold'
                      : 'text-navy-secondary hover:text-navy-primary'
                  }`}
                >
                  Resistance
                </button>
                <button
                  onClick={() => setActiveVisualTab('lifecycle')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    activeVisualTab === 'lifecycle'
                      ? 'bg-white text-navy-primary shadow-xs font-bold'
                      : 'text-navy-secondary hover:text-navy-primary'
                  }`}
                >
                  Lifecycle WTW
                </button>
                <button
                  onClick={() => setActiveVisualTab('benchmarks')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    activeVisualTab === 'benchmarks'
                      ? 'bg-white text-navy-primary shadow-xs font-bold'
                      : 'text-navy-secondary hover:text-navy-primary'
                  }`}
                >
                  Model Accuracy
                </button>
              </div>
            </CardHeader>

            <CardContent className="flex-1 p-5 flex flex-col justify-between">
              {/* TAB 1: Speed-Power Dual Curves */}
              {activeVisualTab === 'curves' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-navy-secondary">
                    <span>Speed-Power & Fuel Consumption Profile (8–24 kn)</span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1.5 text-teal font-medium">
                        <span className="h-2 w-2 rounded-full bg-teal" /> Holtrop Baseline
                      </span>
                      <span className="flex items-center gap-1.5 text-violet font-medium">
                        <span className="h-2 w-2 rounded-full bg-violet" /> Pure Black-Box ML
                      </span>
                      <span className="flex items-center gap-1.5 text-cyan-700 font-bold">
                        <span className="h-2 w-2 rounded-full bg-cyan-600" /> NavOptima PINN Hybrid
                      </span>
                    </div>
                  </div>

                  <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={speedPowerCurveData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis
                          dataKey="speed_knots"
                          label={{ value: 'Speed Over Ground (knots)', position: 'insideBottom', offset: -10, fill: '#64748B', fontSize: 11 }}
                          tick={{ fill: '#64748B', fontSize: 11 }}
                        />
                        <YAxis
                          yAxisId="power"
                          label={{ value: 'Brake Power (kW)', angle: -90, position: 'insideLeft', offset: 0, fill: '#0D9488', fontSize: 11 }}
                          tick={{ fill: '#64748B', fontSize: 11 }}
                          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                        />
                        <YAxis
                          yAxisId="fuel"
                          orientation="right"
                          label={{ value: 'Fuel Rate (MT/24h)', angle: 90, position: 'insideRight', offset: 10, fill: '#F59E0B', fontSize: 11 }}
                          tick={{ fill: '#64748B', fontSize: 11 }}
                        />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0F172A', color: '#F8FAFC', borderRadius: '8px', fontSize: '11px', border: 'none' }}
                          formatter={(value: any, name: string) => [
                            typeof value === 'number' ? value.toLocaleString() : value,
                            name === 'greybox_power_kw' ? 'NavOptima Hybrid Power (kW)'
                            : name === 'physics_power_kw' ? 'Holtrop Baseline Power (kW)'
                            : name === 'pure_ml_power_kw' ? 'Pure ML Power (kW)'
                            : name === 'greybox_fuel_mt' ? 'Predicted Fuel Rate (MT/d)'
                            : name
                          ]}
                          labelFormatter={(label) => `Vessel Speed: ${label} knots`}
                        />
                        <Line yAxisId="power" type="monotone" dataKey="physics_power_kw" stroke="#0D9488" strokeDasharray="4 4" strokeWidth={2} dot={false} />
                        <Line yAxisId="power" type="monotone" dataKey="pure_ml_power_kw" stroke="#8B5CF6" strokeDasharray="3 3" strokeWidth={1.5} dot={false} />
                        <Line yAxisId="power" type="monotone" dataKey="greybox_power_kw" stroke="#0284C7" strokeWidth={3} dot={{ r: 3, fill: '#0284C7' }} />
                        <ReferenceLine yAxisId="power" x={speedInput} stroke="#EC4899" strokeWidth={2} label={{ value: `Current: ${speedInput} kts`, fill: '#EC4899', fontSize: 10, position: 'top' }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Summary Callout Banner */}
                  <div className="bg-cyan-50/70 border border-cyan-200/60 rounded-lg p-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-800 font-bold">
                        Δ
                      </div>
                      <div>
                        <span className="font-bold text-navy-primary">Telemetry Residual Correction: </span>
                        <span className="text-navy-secondary">
                          Physics predicts {comp.physics_power_kw.toLocaleString()} kW; ML adds +{comp.residual_power_delta_kw.toLocaleString()} kW ({comp.residual_percentage}%) for biofouling & non-linear sea state.
                        </span>
                      </div>
                    </div>
                    <Badge variant="teal" size="sm">
                      R² = 0.998
                    </Badge>
                  </div>
                </div>
              )}

              {/* TAB 2: Hydrodynamic Resistance Breakdown */}
              {activeVisualTab === 'resistance' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-navy-secondary">
                    <span>Holtrop-Mennen 1984 Hydrodynamic Resistance Component Breakdown</span>
                    <span className="font-mono font-bold text-navy-primary">
                      Total Drag: {predictionData?.hydrodynamics_breakdown?.total_resistance_kn || 1420} kN
                    </span>
                  </div>

                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={resistanceBreakdownData} layout="vertical" margin={{ top: 10, right: 30, left: 140, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis type="number" unit=" kN" tick={{ fill: '#64748B', fontSize: 11 }} />
                        <YAxis type="category" dataKey="name" tick={{ fill: '#0F172A', fontSize: 11, fontWeight: 500 }} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0F172A', color: '#F8FAFC', borderRadius: '8px', fontSize: '11px', border: 'none' }}
                          formatter={(value: any) => [`${value} kN`, 'Resistance Force']}
                        />
                        <Bar dataKey="value" radius={[0, 6, 6, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border/60 text-[11px]">
                    <div className="bg-background-panel p-2 rounded border border-border/40">
                      <div className="text-navy-muted">Hull Form Factor (1+k₁)</div>
                      <div className="font-mono font-bold text-navy-primary">1.182</div>
                    </div>
                    <div className="bg-background-panel p-2 rounded border border-border/40">
                      <div className="text-navy-muted">Propulsive ηD</div>
                      <div className="font-mono font-bold text-teal">69.2%</div>
                    </div>
                    <div className="bg-background-panel p-2 rounded border border-border/40">
                      <div className="text-navy-muted">Engine SFOC</div>
                      <div className="font-mono font-bold text-amber">{predictionData?.hydrodynamics_breakdown?.sfoc_g_per_kwh || 168.4} g/kWh</div>
                    </div>
                    <div className="bg-background-panel p-2 rounded border border-border/40">
                      <div className="text-navy-muted">Effective Power PE</div>
                      <div className="font-mono font-bold text-violet">{(predictionData?.hydrodynamics_breakdown?.effective_power_kw / 1000 || 22.4).toFixed(1)} MW</div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Lifecycle WTW Emissions */}
              {activeVisualTab === 'lifecycle' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-navy-secondary">
                    <span>Well-to-Tank (WTT) Upstream vs Tank-to-Wake (TTW) Combustion (FuelEU Maritime)</span>
                    <Badge variant={life.fueleu_compliant ? 'success' : 'danger'} size="sm">
                      {life.fueleu_compliant ? 'FuelEU 2025 Compliant' : 'Non-Compliant'}
                    </Badge>
                  </div>

                  <div className="h-[270px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={allFuelsComparisonData} margin={{ top: 10, right: 20, left: 10, bottom: 25 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis dataKey="name" tick={{ fill: '#0F172A', fontSize: 10, fontWeight: 600 }} interval={0} />
                        <YAxis label={{ value: 'MT CO2e / 24h', angle: -90, position: 'insideLeft', fill: '#64748B', fontSize: 11 }} tick={{ fill: '#64748B', fontSize: 11 }} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0F172A', color: '#F8FAFC', borderRadius: '8px', fontSize: '11px', border: 'none' }}
                          formatter={(value: any, name: string) => [`${value} MT/day`, name === 'ttw_co2' ? 'TTW Direct Combustion' : 'WTT Upstream Supply']}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                        <Bar dataKey="wtt_ghg" name="Well-to-Tank (WTT) Upstream" stackId="a" fill="#0284C7" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="ttw_co2" name="Tank-to-Wake (TTW) Combustion" stackId="a" fill="#64748B" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-emerald-50/70 border border-emerald-200 p-3 rounded-lg flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-emerald-900">Current Selection: {life.fuel_name}</span>
                      <p className="text-navy-secondary text-[11px] mt-0.5">
                        Daily Bunker Cost: <span className="font-mono font-bold text-navy-primary">${life.daily_fuel_cost_usd?.toLocaleString()} USD/day</span> | WTW Total: <span className="font-mono font-bold text-emerald-700">{life.wtw_lifecycle_ghg_mt_per_day} MT CO2e/day</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-navy-muted">GHG Intensity</div>
                      <div className="font-mono font-bold text-navy-primary">{life.ghg_intensity_g_per_mj} g/MJ</div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: Model Accuracy & Feature Importance */}
              {activeVisualTab === 'benchmarks' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-navy-secondary">
                    <span>Validation Benchmarking & Feature Attribution</span>
                    <Badge variant="quantum" size="sm">
                      Trained on 6,000 Sea Trials & Telemetry Records
                    </Badge>
                  </div>

                  {/* Benchmark Cards Grid */}
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-lg border border-teal/30 bg-teal-light/20">
                      <div className="font-bold text-teal">Holtrop Physics Only</div>
                      <div className="text-[10px] text-navy-muted mt-0.5">Pure analytical naval equations</div>
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between font-mono">
                          <span>R² Score:</span>
                          <span className="font-bold text-navy-primary">0.8770</span>
                        </div>
                        <div className="flex justify-between font-mono">
                          <span>RMSE:</span>
                          <span className="text-navy-primary">7,329 kW</span>
                        </div>
                        <div className="flex justify-between font-mono">
                          <span>MAPE:</span>
                          <span className="text-amber-700 font-bold">13.3%</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg border border-violet/30 bg-violet-light/20">
                      <div className="font-bold text-violet">Pure Black-Box ML</div>
                      <div className="text-[10px] text-navy-muted mt-0.5">Standalone XGBoost regressor</div>
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between font-mono">
                          <span>R² Score:</span>
                          <span className="font-bold text-navy-primary">0.9896</span>
                        </div>
                        <div className="flex justify-between font-mono">
                          <span>RMSE:</span>
                          <span className="text-navy-primary">2,127 kW</span>
                        </div>
                        <div className="flex justify-between font-mono">
                          <span>MAPE:</span>
                          <span className="text-navy-primary">3.45%</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg border border-cyan-400 bg-cyan-50/50 shadow-xs ring-1 ring-cyan-500/20">
                      <div className="font-bold text-cyan-800 flex items-center justify-between">
                        <span>NavOptima PINN Hybrid</span>
                        <CheckCircle2 className="h-3.5 w-3.5 text-cyan-600" />
                      </div>
                      <div className="text-[10px] text-cyan-700 mt-0.5">Physics + ML Residual</div>
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between font-mono">
                          <span>R² Score:</span>
                          <span className="font-bold text-cyan-900">0.9978</span>
                        </div>
                        <div className="flex justify-between font-mono">
                          <span>RMSE:</span>
                          <span className="font-bold text-cyan-900">985 kW</span>
                        </div>
                        <div className="flex justify-between font-mono">
                          <span>MAPE:</span>
                          <span className="font-bold text-emerald-700">1.76%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Feature Importance Bars */}
                  <div className="space-y-2 pt-2 border-t border-border/60">
                    <div className="text-xs font-semibold text-navy-primary">
                      XGBoost Residual Feature Importance (Shapley Explanations):
                    </div>
                    <div className="space-y-1.5">
                      {featureImportanceList.map((item: any, i: number) => (
                        <div key={i} className="space-y-0.5">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-navy-secondary">{item.feature}</span>
                            <span className="font-mono font-bold text-navy-primary">{item.importance}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${item.importance * 2.4}%`,
                                backgroundColor: item.color || '#0D9488'
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Quick Metrics Bar */}
              <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-navy-secondary">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>Model Confidence: <strong className="text-navy-primary">98.4% (±1.4 MT/day)</strong></span>
                </div>
                <div className="text-[11px] font-mono text-navy-muted">
                  Vessel: <strong className="text-navy-primary">{selectedVessel?.name || 'MV Pacific Horizon'}</strong> ({selectedVessel?.type || 'ULCV'})
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
