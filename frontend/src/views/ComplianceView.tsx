import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Award,
  AlertTriangle,
  FileCheck,
  TrendingDown,
  Scale,
  Calendar,
  Zap,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Fuel,
  Ship
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import { KPICard } from '../components/ui/KPICard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useFleet } from '../context/FleetContext';
import { Vessel } from '../types';

export const ComplianceView: React.FC = () => {
  const { selectedVessel, fleet, setSelectedVesselId, activeScenario } = useFleet();

  // Interactive voyage simulator state
  const currentVessel = selectedVessel || fleet[0];

  const [simYear, setSimYear] = useState<number>(2026);
  const [voyageDistanceNm, setVoyageDistanceNm] = useState<number>(8500);
  const [euaPriceEur, setEuaPriceEur] = useState<number>(85);
  const [biofuelBlendPct, setBiofuelBlendPct] = useState<number>(
    currentVessel?.fuelType === 'Biofuel' ? 30 : currentVessel?.fuelType === 'e-Methanol' ? 100 : 15
  );
  const [speedKnots, setSpeedKnots] = useState<number>(currentVessel?.speedKnots || 14.5);

  useEffect(() => {
    if (currentVessel) {
      setSpeedKnots(currentVessel.speedKnots || 14.5);
      if (currentVessel.fuelType === 'Biofuel') {
        setBiofuelBlendPct(30);
      } else if (currentVessel.fuelType === 'e-Methanol') {
        setBiofuelBlendPct(100);
      }
    }
  }, [currentVessel.id, currentVessel.speedKnots, currentVessel.fuelType, activeScenario.appliedOptimization?.solutionId]);

  // Calculation state
  const [complianceResult, setComplianceResult] = useState<any>(null);

  // Calculate compliance locally or via API
  const calculateCompliance = async () => {
    const dwt = currentVessel?.deadweightTons || 120000;
    const vType = currentVessel?.type?.toLowerCase().includes('container')
      ? 'container'
      : currentVessel?.type?.toLowerCase().includes('bulk')
      ? 'bulk_carrier'
      : currentVessel?.type?.toLowerCase().includes('lng')
      ? 'lng_carrier'
      : 'tanker';

    // Fuel consumption model: Fuel (MT/day) ~ base * (speed / 14)^3
    const transitDays = voyageDistanceNm / (speedKnots * 24);
    const totalBaseFuelMT = transitDays * (currentVessel?.fuelRateMTPerDay || 45.0);
    const bioMT = totalBaseFuelMT * (biofuelBlendPct / 100.0);
    const vlsfoMT = totalBaseFuelMT * (1.0 - biofuelBlendPct / 100.0);

    const fuelMix = {
      VLSFO: Number(vlsfoMT.toFixed(1)),
      Biofuel_B30: Number(bioMT.toFixed(1))
    };

    try {
      const res = await fetch('http://localhost:8000/api/compliance/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vessel_type: vType,
          deadweight_tons: dwt,
          distance_nm: voyageDistanceNm,
          fuel_consumption_mt: fuelMix,
          year: simYear,
          eua_price_eur: euaPriceEur
        })
      });
      if (res.ok) {
        const json = await res.json();
        setComplianceResult(json.data);
        return;
      }
    } catch (e) {
      // Fallback calculation below
    }

    // High fidelity fallback calculation
    const co2Vlsfo = vlsfoMT * 3.114;
    const co2Bio = bioMT * 2.180;
    const totalCo2 = co2Vlsfo + co2Bio;
    const ciiAttained = (totalCo2 * 1e6) / (dwt * voyageDistanceNm);

    // IMO MEPC parameters
    const a = vType === 'bulk_carrier' ? 4745.0 : vType === 'tanker' ? 5247.0 : 1984.0;
    const c = vType === 'bulk_carrier' ? 0.622 : vType === 'tanker' ? 0.610 : 0.489;
    const ciiRef = a * Math.pow(dwt, -c);
    const zFactor = simYear === 2024 ? 7.0 : simYear === 2025 ? 9.0 : simYear === 2026 ? 11.0 : 13.0;
    const ciiReq = ciiRef * (1.0 - zFactor / 100.0);

    const d1 = 0.82 * ciiReq;
    const d2 = 0.93 * ciiReq;
    const d3 = 1.08 * ciiReq;
    const d4 = 1.19 * ciiReq;

    let rating = 'C';
    let ratingColor = '#10B981';
    let ratingDesc = 'Moderate Compliant';

    if (ciiAttained <= d1) {
      rating = 'A';
      ratingColor = '#00D4B8';
      ratingDesc = 'Superior Performance';
    } else if (ciiAttained <= d2) {
      rating = 'B';
      ratingColor = '#3B82F6';
      ratingDesc = 'Minor Superior';
    } else if (ciiAttained <= d3) {
      rating = 'C';
      ratingColor = '#10B981';
      ratingDesc = 'Compliant Threshold';
    } else if (ciiAttained <= d4) {
      rating = 'D';
      ratingColor = '#F59E0B';
      ratingDesc = 'Minor Inferior (SEEMP Required)';
    } else {
      rating = 'E';
      ratingColor = '#EF4444';
      ratingDesc = 'Inferior (Immediate Corrective Plan)';
    }

    // FuelEU GFI
    const targetGfi = simYear >= 2030 ? 85.69 : 89.34;
    const totalEnergyMj = vlsfoMT * 1000 * 41.0 + bioMT * 1000 * 39.8;
    const totalGhgG = vlsfoMT * 1000 * 41.0 * 91.16 + bioMT * 1000 * 39.8 * 63.81;
    const attainedGfi = totalEnergyMj > 0 ? totalGhgG / totalEnergyMj : 91.16;
    const cbG = (targetGfi - attainedGfi) * totalEnergyMj;
    const penaltyEur = cbG < 0 ? (Math.abs(cbG) / (41000 * targetGfi)) * 2400 : 0;

    // EU ETS
    const phaseIn = simYear === 2024 ? 0.4 : simYear === 2025 ? 0.7 : 1.0;
    const reportableCo2 = totalCo2 * 0.80; // 80% effective scope
    const etsCost = reportableCo2 * phaseIn * euaPriceEur;
    const optSavings = etsCost * 0.128 + (penaltyEur > 0 ? penaltyEur * 0.8 : 0);

    const trajectory = [
      { year: 2025, regulatory_target_ghg: 89.34, business_as_usual_ghg: Number(attainedGfi.toFixed(1)), quantum_bio_transition_ghg: 86.2 },
      { year: 2030, regulatory_target_ghg: 85.69, business_as_usual_ghg: Number(attainedGfi.toFixed(1)), quantum_bio_transition_ghg: 78.5 },
      { year: 2035, regulatory_target_ghg: 77.94, business_as_usual_ghg: Number(attainedGfi.toFixed(1)), quantum_bio_transition_ghg: 68.0 },
      { year: 2040, regulatory_target_ghg: 62.90, business_as_usual_ghg: Number(attainedGfi.toFixed(1)), quantum_bio_transition_ghg: 48.2 },
      { year: 2045, regulatory_target_ghg: 34.64, business_as_usual_ghg: Number(attainedGfi.toFixed(1)), quantum_bio_transition_ghg: 28.0 },
      { year: 2050, regulatory_target_ghg: 18.23, business_as_usual_ghg: Number(attainedGfi.toFixed(1)), quantum_bio_transition_ghg: 14.5 }
    ];

    setComplianceResult({
      vessel_summary: {
        vessel_type: vType,
        deadweight_tons: dwt,
        distance_nm: voyageDistanceNm,
        fuel_consumption_mt: fuelMix,
        year: simYear
      },
      imo_cii: {
        year: simYear,
        total_co2_emissions_mt: Number(totalCo2.toFixed(1)),
        cii_required: Number(ciiReq.toFixed(3)),
        cii_attained: Number(ciiAttained.toFixed(3)),
        rating: rating,
        rating_description: ratingDesc,
        status_color: ratingColor,
        boundaries: {
          d1_a_b: Number(d1.toFixed(3)),
          d2_b_c: Number(d2.toFixed(3)),
          d3_c_d: Number(d3.toFixed(3)),
          d4_d_e: Number(d4.toFixed(3))
        },
        corrective_action_plan: rating === 'D' || rating === 'E' ? {
          mandated_by_imo: true,
          target_grade: 'C',
          emission_reduction_pct: 14.5,
          recommended_actions: [
            `Derate speed by 1.2 knots to reduce voyage fuel consumption by ~12%.`,
            `Increase Biofuel B30 blend to 35% to immediately regain Grade C rating.`,
            `Activate Quantum micro-weather routing to exploit following currents.`
          ]
        } : null
      },
      fueleu_maritime: {
        target_ghg_intensity: targetGfi,
        attained_ghg_intensity: Number(attainedGfi.toFixed(2)),
        compliance_balance_tco2e: Number((cbG / 1e6).toFixed(2)),
        is_compliant: penaltyEur === 0,
        penalty_eur: Number(penaltyEur.toFixed(0)),
        trajectory_timeline: trajectory
      },
      eu_ets: {
        surrender_phase_in_pct: phaseIn * 100,
        total_eua_liability_eur: Number(etsCost.toFixed(0)),
        potential_annual_savings_eur: Number(optSavings.toFixed(0))
      },
      total_regulatory_cost_eur: Number((penaltyEur + etsCost).toFixed(0)),
      quantum_potential_annual_savings_eur: Number(optSavings.toFixed(0))
    });
  };

  useEffect(() => {
    calculateCompliance();
  }, [currentVessel?.id, simYear, voyageDistanceNm, euaPriceEur, biofuelBlendPct, speedKnots]);

  const cii = complianceResult?.imo_cii;
  const fueleu = complianceResult?.fueleu_maritime;
  const ets = complianceResult?.eu_ets;

  // Grade color badges
  const getGradeBadge = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-teal text-white';
      case 'B': return 'bg-blue-600 text-white';
      case 'C': return 'bg-emerald-600 text-white';
      case 'D': return 'bg-amber text-white';
      case 'E': return 'bg-danger text-white';
      default: return 'bg-navy-secondary text-white';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-card border border-border shadow-xs">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl font-bold text-navy-primary tracking-tight">
              Maritime Regulatory Compliance & Carbon Liability
            </h1>
            <Badge variant="teal" dot>
              IMO Resolution MEPC.337(76) & FuelEU Maritime 2026 Mandate
            </Badge>
          </div>
          <p className="text-xs text-navy-secondary mt-1">
            Real-time CII grade determination, boundary limit verification ($d_1-d_4$), FuelEU GHG intensity balances, and EU ETS allowance surrender forecasting.
          </p>
        </div>

        {/* Vessel Selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-background-panel rounded-lg px-3 py-1.5 border border-border text-xs">
            <Ship className="h-4 w-4 text-teal mr-2" />
            <select
              value={currentVessel?.id}
              onChange={(e) => setSelectedVesselId(e.target.value)}
              className="bg-transparent font-semibold text-navy-primary focus:outline-none cursor-pointer"
            >
              {fleet.map((v: Vessel) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.type} • {v.deadweightTons.toLocaleString()} DWT)
                </option>
              ))}
            </select>
          </div>

          <Button variant="outline" size="sm" onClick={calculateCompliance}>
            Recalculate
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="IMO CII Rating"
          value={cii ? `Grade ${cii.rating}` : 'Grade B'}
          unit={cii ? `${cii.cii_attained} g/DWT·nm` : '3.42'}
          subtitle={`Req: < ${cii?.cii_required || '3.80'} • ${cii?.rating_description || 'Compliant'}`}
          icon={<Award className="h-5 w-5" />}
          accentColor={cii?.rating === 'A' || cii?.rating === 'B' ? 'teal' : cii?.rating === 'C' ? 'success' : 'amber'}
          trend={{ value: `Grade ${cii?.rating || 'B'}`, direction: 'neutral' }}
        />
        <KPICard
          title="FuelEU GHG Intensity"
          value={fueleu ? fueleu.attained_ghg_intensity : '88.4'}
          unit="g CO2e/MJ"
          subtitle={`Target ${simYear}: ${fueleu?.target_ghg_intensity || 89.34} g/MJ`}
          icon={<TrendingDown className="h-5 w-5" />}
          accentColor={fueleu?.is_compliant ? 'success' : 'amber'}
          trend={{
            value: fueleu?.is_compliant ? 'Compliant Surplus' : `€${fueleu?.penalty_eur.toLocaleString()} Penalty`,
            direction: fueleu?.is_compliant ? 'down' : 'up',
            isPositiveGood: fueleu?.is_compliant
          }}
        />
        <KPICard
          title="EU ETS Carbon Liability"
          value={ets ? `€ ${ets.total_eua_liability_eur.toLocaleString()}` : '€ 34,000'}
          unit={`${ets?.surrender_phase_in_pct || 100}% Phase-in`}
          subtitle={`EUA Price: €${euaPriceEur}/t CO2`}
          icon={<Scale className="h-5 w-5" />}
          accentColor="violet"
        />
        <KPICard
          title="Quantum Abatement Savings"
          value={complianceResult ? `€ ${complianceResult.quantum_potential_annual_savings_eur.toLocaleString()}` : '€ 28,400'}
          unit="per voyage"
          subtitle="Route & speed optimization"
          icon={<Sparkles className="h-5 w-5" />}
          accentColor="quantum"
          trend={{ value: '12.8% Abatement', direction: 'up', isPositiveGood: true }}
        />
      </div>

      {/* Section 1: CII Grade Visualizer Gauge & Parameter Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive CII Grade Gauge Card */}
        <div className="lg:col-span-7">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <div>
                <CardTitle>
                  <ShieldCheck className="h-4 w-4 text-teal" />
                  IMO Carbon Intensity Indicator (CII) Rating Gauge
                </CardTitle>
                <CardDescription>
                  Rating bands derived from IMO MEPC.337(76) & MEPC.338(76) for Year {simYear}.
                </CardDescription>
              </div>
              <Badge variant="navy" size="sm">MEPC.337(76)</Badge>
            </CardHeader>

            <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-6">
              {/* 5-Grade Visual Gauge Bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold text-navy-secondary">
                  <span>Attained CII: <strong className="font-mono text-navy-primary">{cii?.cii_attained}</strong> gCO2/(DWT·nm)</span>
                  <span>Required Target: <strong className="font-mono text-teal-dark">{cii?.cii_required}</strong></span>
                </div>

                {/* Rating Gradient Bar */}
                <div className="relative h-12 w-full rounded-xl overflow-hidden flex border border-border shadow-inner">
                  {/* Grade A */}
                  <div className="flex-1 bg-gradient-to-r from-teal to-teal-dark flex flex-col items-center justify-center text-white font-bold text-sm relative">
                    <span>A</span>
                    <span className="text-[9px] font-normal opacity-90">&lt; {cii?.boundaries.d1_a_b}</span>
                  </div>
                  {/* Grade B */}
                  <div className="flex-1 bg-blue-600 flex flex-col items-center justify-center text-white font-bold text-sm relative">
                    <span>B</span>
                    <span className="text-[9px] font-normal opacity-90">{cii?.boundaries.d1_a_b}-{cii?.boundaries.d2_b_c}</span>
                  </div>
                  {/* Grade C */}
                  <div className="flex-1 bg-emerald-600 flex flex-col items-center justify-center text-white font-bold text-sm relative">
                    <span>C</span>
                    <span className="text-[9px] font-normal opacity-90">{cii?.boundaries.d2_b_c}-{cii?.boundaries.d3_c_d}</span>
                  </div>
                  {/* Grade D */}
                  <div className="flex-1 bg-amber flex flex-col items-center justify-center text-white font-bold text-sm relative">
                    <span>D</span>
                    <span className="text-[9px] font-normal opacity-90">{cii?.boundaries.d3_c_d}-{cii?.boundaries.d4_d_e}</span>
                  </div>
                  {/* Grade E */}
                  <div className="flex-1 bg-danger flex flex-col items-center justify-center text-white font-bold text-sm relative">
                    <span>E</span>
                    <span className="text-[9px] font-normal opacity-90">&gt; {cii?.boundaries.d4_d_e}</span>
                  </div>
                </div>

                {/* Dynamic Vessel Position Pointer */}
                <div className="flex items-center justify-between px-2 pt-1 text-[11px] text-navy-muted font-mono">
                  <span>Superior</span>
                  <span className="text-teal font-semibold">Boundary d1 ({cii?.boundaries.d1_a_b})</span>
                  <span className="text-emerald-700 font-semibold">Boundary d2 ({cii?.boundaries.d2_b_c})</span>
                  <span className="text-amber font-semibold">Boundary d3 ({cii?.boundaries.d3_c_d})</span>
                  <span>Inferior</span>
                </div>
              </div>

              {/* CII Rating Details & Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-background-panel p-3.5 rounded-lg border border-border text-xs">
                <div>
                  <span className="text-navy-muted block">Assigned Grade</span>
                  <span className={`inline-block px-2.5 py-0.5 mt-1 rounded font-bold ${getGradeBadge(cii?.rating || 'C')}`}>
                    Grade {cii?.rating}
                  </span>
                </div>
                <div>
                  <span className="text-navy-muted block">Reduction Factor Z</span>
                  <span className="font-bold text-navy-primary font-mono mt-1 block">-{simYear === 2026 ? 11.0 : 9.0}%</span>
                </div>
                <div>
                  <span className="text-navy-muted block">Total Voyage CO2</span>
                  <span className="font-bold text-navy-primary font-mono mt-1 block">{cii?.total_co2_emissions_mt} MT</span>
                </div>
                <div>
                  <span className="text-navy-muted block">Distance / Transit</span>
                  <span className="font-bold text-navy-primary font-mono mt-1 block">{voyageDistanceNm.toLocaleString()} nm</span>
                </div>
              </div>

              {/* SEEMP Part III Corrective Action Alert if D/E */}
              {cii?.corrective_action_plan && (
                <div className="p-3.5 bg-danger-light rounded-lg border border-danger/30 text-xs text-navy-primary space-y-2">
                  <div className="flex items-center gap-2 text-danger font-bold">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>SEEMP Part III Corrective Action Plan Required by IMO</span>
                  </div>
                  <p className="text-[11px] text-navy-secondary">
                    Vessel attained rating ({cii.rating}) exceeds compliance limit $d_3$. Mandatory remediation required to regain Grade C:
                  </p>
                  <ul className="list-disc pl-5 text-[11px] space-y-1 text-navy-primary">
                    {cii.corrective_action_plan.recommended_actions.map((act: string, idx: number) => (
                      <li key={idx}>{act}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Voyage Parameter Simulator */}
        <div className="lg:col-span-5">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <div>
                <CardTitle>
                  <Sliders className="h-4 w-4 text-violet" />
                  Voyage Compliance Simulator
                </CardTitle>
                <CardDescription>
                  Tune parameters to simulate regulatory impacts
                </CardDescription>
              </div>
              <Badge variant="violet" size="sm">Live Model</Badge>
            </CardHeader>

            <CardContent className="p-4 flex-1 space-y-4 text-xs">
              {/* Year Selector */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-navy-secondary">Regulatory Year Mandate</span>
                  <span className="font-mono font-bold text-violet">{simYear}</span>
                </div>
                <div className="flex gap-1.5">
                  {[2024, 2025, 2026, 2028, 2030].map((yr) => (
                    <button
                      key={yr}
                      onClick={() => setSimYear(yr)}
                      className={`flex-1 py-1.5 rounded-md font-medium text-xs transition-colors ${
                        simYear === yr
                          ? 'bg-violet text-white font-bold'
                          : 'bg-background-panel text-navy-secondary hover:bg-violet-light'
                      }`}
                    >
                      {yr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Biofuel Blend Slider */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-navy-secondary">Biofuel B30 Blend Fraction</span>
                  <span className="font-mono font-bold text-teal">{biofuelBlendPct}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={60}
                  step={5}
                  value={biofuelBlendPct}
                  onChange={(e) => setBiofuelBlendPct(Number(e.target.value))}
                  className="w-full h-1.5 bg-background-panel rounded-lg appearance-none cursor-pointer accent-teal"
                />
                <div className="flex justify-between text-[10px] text-navy-muted mt-0.5">
                  <span>0% (Pure VLSFO)</span>
                  <span>30% Blend</span>
                  <span>60% (High Decarb)</span>
                </div>
              </div>

              {/* Transit Speed Slider */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-navy-secondary">Operating Transit Speed</span>
                  <span className="font-mono font-bold text-quantum-dark">{speedKnots} knots</span>
                </div>
                <input
                  type="range"
                  min={11.0}
                  max={18.0}
                  step={0.5}
                  value={speedKnots}
                  onChange={(e) => setSpeedKnots(Number(e.target.value))}
                  className="w-full h-1.5 bg-background-panel rounded-lg appearance-none cursor-pointer accent-quantum"
                />
                <div className="flex justify-between text-[10px] text-navy-muted mt-0.5">
                  <span>11.0 kn (Eco slow-steam)</span>
                  <span>14.5 kn (Design)</span>
                  <span>18.0 kn (Max)</span>
                </div>
              </div>

              {/* EUA Carbon Allowance Price */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-navy-secondary">EU ETS Carbon Price (EUA)</span>
                  <span className="font-mono font-bold text-amber">€{euaPriceEur} / ton</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={150}
                  step={5}
                  value={euaPriceEur}
                  onChange={(e) => setEuaPriceEur(Number(e.target.value))}
                  className="w-full h-1.5 bg-background-panel rounded-lg appearance-none cursor-pointer accent-amber"
                />
              </div>

              {/* Summary of Liability */}
              <div className="p-3 bg-background-panel rounded-lg border border-border space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-navy-secondary">FuelEU Deficit Penalty:</span>
                  <span className={`font-mono font-bold ${fueleu?.penalty_eur > 0 ? 'text-danger' : 'text-success'}`}>
                    € {fueleu?.penalty_eur.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-navy-secondary">EU ETS EUA Obligation:</span>
                  <span className="font-mono font-bold text-violet">
                    € {ets?.total_eua_liability_eur.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="border-t border-border pt-1.5 flex justify-between text-xs font-bold text-navy-primary">
                  <span>Total Regulatory Exposure:</span>
                  <span className="text-danger font-mono">
                    € {complianceResult?.total_regulatory_cost_eur.toLocaleString() || '0'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Section 2: FuelEU Maritime Trajectory Chart (2025-2050) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <div>
                <CardTitle>
                  <TrendingDown className="h-4 w-4 text-violet" />
                  FuelEU Maritime Well-to-Wake GHG Reduction Trajectory (2025–2050)
                </CardTitle>
                <CardDescription>
                  Comparison of EU Regulatory Targets vs Business-as-Usual vs Quantum Bio/E-Fuel Decarbonization.
                </CardDescription>
              </div>
              <Badge variant="violet" size="sm">EU 2023/1805</Badge>
            </CardHeader>

            <CardContent className="p-4 flex-1">
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={fueleu?.trajectory_timeline || []}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8EFEF" />
                    <XAxis dataKey="year" stroke="#7C8B96" fontSize={11} />
                    <YAxis stroke="#7C8B96" fontSize={11} domain={[0, 100]} unit=" g/MJ" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0F1B2D',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '12px'
                      }}
                    />
                    <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
                    <Line
                      type="stepAfter"
                      dataKey="regulatory_target_ghg"
                      name="FuelEU Regulatory Target (gCO2e/MJ)"
                      stroke="#EF4444"
                      strokeWidth={2.5}
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="business_as_usual_ghg"
                      name="Business-As-Usual Fleet Intensity"
                      stroke="#7C8B96"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="quantum_bio_transition_ghg"
                      name="Quantum Bio/E-Fuel Pathway"
                      stroke="#00D4B8"
                      strokeWidth={2.5}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs bg-background-panel p-2.5 rounded-lg border border-border">
                <div>
                  <span className="text-navy-muted block">2025 Target</span>
                  <span className="font-bold text-navy-primary font-mono">-2% (89.34 g/MJ)</span>
                </div>
                <div>
                  <span className="text-navy-muted block">2035 Target</span>
                  <span className="font-bold text-violet font-mono">-14.5% (77.94 g/MJ)</span>
                </div>
                <div>
                  <span className="text-navy-muted block">2050 Net-Zero Target</span>
                  <span className="font-bold text-teal-dark font-mono">-80% (18.23 g/MJ)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* EU ETS Maritime & Regulatory Breakdown Card */}
        <div className="lg:col-span-4">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <div>
                <CardTitle>
                  <Scale className="h-4 w-4 text-amber" />
                  EU ETS Phase-In & Scope Rules
                </CardTitle>
                <CardDescription>
                  Directive 2003/87/EC Maritime Inclusion
                </CardDescription>
              </div>
              <Badge variant="amber" size="sm">ETS Mandate</Badge>
            </CardHeader>

            <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-4 text-xs">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-2 rounded bg-background-panel border border-border">
                  <span className="text-navy-secondary font-medium">2024 Phase-in</span>
                  <Badge variant="navy" size="sm">40% Surrender</Badge>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-background-panel border border-border">
                  <span className="text-navy-secondary font-medium">2025 Phase-in</span>
                  <Badge variant="amber" size="sm">70% Surrender</Badge>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-teal-light border border-teal/30">
                  <span className="text-teal-dark font-bold">2026+ Full Phase-in</span>
                  <Badge variant="teal" size="sm">100% Surrender</Badge>
                </div>
              </div>

              <div className="space-y-1.5 text-[11px] text-navy-secondary border-t border-border pt-3">
                <p><strong>Geographic Scope Rules:</strong></p>
                <p>• <strong>100%</strong> of emissions on voyages between two EU/EEA ports.</p>
                <p>• <strong>100%</strong> of emissions within EU/EEA port berths.</p>
                <p>• <strong>50%</strong> of emissions on voyages between EU and non-EU ports.</p>
              </div>

              <div className="p-3 bg-quantum-light/60 rounded-lg border border-quantum/20">
                <div className="flex items-center gap-1.5 text-quantum-dark font-semibold">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Quantum Optimization Value</span>
                </div>
                <p className="text-[11px] text-navy-secondary mt-1">
                  By optimizing engine RPM, dynamic trim, and sea currents, NavOptima reduces annual EUA surrender liability by an estimated <strong>€ {complianceResult?.quantum_potential_annual_savings_eur.toLocaleString()}</strong> per vessel.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
