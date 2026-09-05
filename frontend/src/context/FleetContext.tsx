import React, { createContext, useContext, useState } from 'react';
import { Vessel, FuelType, CIIRating } from '../types';

export const MOCK_FLEET: Vessel[] = [
  {
    id: 'VES-901',
    name: 'MV Quanta Horizon',
    imo: 'IMO 9842145',
    type: 'Ultra Large Container Vessel (ULCV)',
    deadweightTons: 198000,
    lengthMeters: 399.9,
    beamMeters: 61.3,
    speedKnots: 18.4,
    targetSpeedKnots: 17.2,
    enginePowerKW: 68400,
    rpm: 72.4,
    fuelRateMTPerDay: 84.6,
    fuelType: 'LNG',
    wellToWakeEmissions: 76.4, // gCO2e/MJ
    tankToWakeCO2Rate: 232.8, // MT/day
    euEtsDailyCostEUR: 16296,
    imoTargetStatus: 'On Track (-42% vs 2008)',
    ciiRating: 'A',
    ciiScore: 2.84,
    status: 'Optimizing',
    origin: 'Port of Singapore (SGSIN)',
    destination: 'Port of Rotterdam (NLRTM)',
    eta: '2026-09-14 06:00 UTC',
    lat: 12.842,
    lng: 45.213,
    heading: 312,
    draftMeters: 14.8,
    trimMeters: 0.35,
    trimDegrees: 0.18,
    seaStateBeaufort: 4,
    waveHeightMeters: 2.1,
    wavePeriodSeconds: 7.2,
    windSpeedKnots: 16.5,
    currentVectorKnots: 1.4,
    currentVectorDir: 295,
    quantumOptimized: true,
    zoneDiagnostics: {
      hull: {
        title: 'Hull & Hydrodynamics',
        subtitle: 'Bulbous Bow & Antifouling Skin Friction',
        status: 'optimal',
        metrics: [
          { label: 'Frictional Resistance (Cf)', value: '0.00142', unit: '', delta: '-3.8%', isGood: true },
          { label: 'Wave-Making Resistance (Cw)', value: '0.00038', unit: '', delta: '-6.2%', isGood: true },
          { label: 'Biofouling Penalty', value: '1.2', unit: '%', delta: 'Nominal' },
          { label: 'Skin Temp / Boundary Layer', value: '24.2', unit: '°C' },
        ],
        notes: 'PINN hydro-model predicts negligible bow wave slamming at current 0.35m trim by stern.',
      },
      bridge: {
        title: 'Bridge & Navigational AI',
        subtitle: 'Quantum Annealer Waypoint Telemetry',
        status: 'optimal',
        metrics: [
          { label: 'Autopilot Mode', value: 'Quantum Path Track', unit: '' },
          { label: 'Lookahead Horizon', value: '72', unit: 'hrs' },
          { label: 'Cross-Track Error (XTE)', value: '0.012', unit: 'nm', delta: '±0.004', isGood: true },
          { label: 'Sensor Mesh Integrity', value: '99.98', unit: '%', isGood: true },
        ],
        notes: 'Bridge tactical console locked on 312° true heading with dynamic weather avoidance routing active.',
      },
      cargo: {
        title: 'Cargo Bay & Hold Telemetry',
        subtitle: 'Reefer Monitoring & Stack Stability',
        status: 'nominal',
        metrics: [
          { label: 'Container TEU Utilization', value: '21,420 / 23,000', unit: 'TEU' },
          { label: 'Reefer Plugs Active', value: '1,840', unit: 'units' },
          { label: 'Reefer Auxiliary Load', value: '4,280', unit: 'kW' },
          { label: 'GM Metacentric Height', value: '2.45', unit: 'm', delta: 'Optimal Stability', isGood: true },
        ],
        notes: 'All 8 cargo holds within atmospheric parameters. Reefer power load optimized via smart peak-shaving.',
      },
      engine: {
        title: 'Engine Room & Propulsion',
        subtitle: 'Dual-Fuel ME-GI 2-Stroke & Propeller Shaft',
        status: 'optimal',
        metrics: [
          { label: 'Shaft Power Output', value: '52,400', unit: 'kW', delta: '-7.5%', isGood: true },
          { label: 'Main Shaft RPM', value: '72.4', unit: 'RPM' },
          { label: 'Brake Specific Fuel (BSFC)', value: '162.4', unit: 'g/kWh', delta: '-4.1%', isGood: true },
          { label: 'Scavenge Air Pressure', value: '3.82', unit: 'bar' },
        ],
        notes: 'Propeller cavitation margin > 28%. LNG boil-off gas reliquefaction operating at 98.4% thermal efficiency.',
      },
    },
  },
  {
    id: 'VES-842',
    name: 'MV Stellar Voyager',
    imo: 'IMO 9734589',
    type: 'Capesize Bulk Carrier',
    deadweightTons: 179500,
    lengthMeters: 292.0,
    beamMeters: 45.0,
    speedKnots: 13.8,
    targetSpeedKnots: 13.5,
    enginePowerKW: 18500,
    rpm: 65.2,
    fuelRateMTPerDay: 42.1,
    fuelType: 'Biofuel',
    wellToWakeEmissions: 61.2,
    tankToWakeCO2Rate: 114.2,
    euEtsDailyCostEUR: 7994,
    imoTargetStatus: 'On Track (-45% vs 2008)',
    ciiRating: 'A',
    ciiScore: 2.15,
    status: 'Underway',
    origin: 'Port Hedland (AUPHE)',
    destination: 'Qingdao Port (CNQDG)',
    eta: '2026-09-09 18:30 UTC',
    lat: -12.35,
    lng: 118.44,
    heading: 355,
    draftMeters: 16.2,
    trimMeters: -0.1,
    trimDegrees: -0.06,
    seaStateBeaufort: 3,
    waveHeightMeters: 1.4,
    wavePeriodSeconds: 5.8,
    windSpeedKnots: 11.2,
    currentVectorKnots: 0.8,
    currentVectorDir: 10,
    quantumOptimized: true,
    zoneDiagnostics: {
      hull: {
        title: 'Hull & Hydrodynamics',
        subtitle: 'Full-Form Bulk Carrier Hull Form',
        status: 'optimal',
        metrics: [
          { label: 'Frictional Resistance', value: '0.00164', unit: '', isGood: true },
          { label: 'Draft Uniformity', value: '16.20 / 16.10', unit: 'm' },
          { label: 'Ultrasonic Antifouling', value: 'Active (Zone 1-4)', unit: '' },
        ],
        notes: 'Trim adjusted for deep laden voyage, minimal slamming detected.',
      },
      bridge: {
        title: 'Bridge & Navigational AI',
        subtitle: 'Great Circle Eco-Track',
        status: 'optimal',
        metrics: [
          { label: 'Routing Engine', value: 'QUBO Waveform Sync', unit: '' },
          { label: 'ETA Variance', value: '-1.2', unit: 'hrs', isGood: true },
          { label: 'AIS Transmission', value: 'Continuous 1W', unit: '' },
        ],
        notes: 'Navigating Sunda Strait egress on optimal current assist corridor.',
      },
      cargo: {
        title: 'Cargo Holds (Iron Ore)',
        subtitle: 'Moisture & Stress Sensor Grid',
        status: 'optimal',
        metrics: [
          { label: 'Cargo Tonnage', value: '174,200', unit: 'WMT' },
          { label: 'Hold Moisture Content', value: '4.2', unit: '%', isGood: true },
          { label: 'Hull Girder Stress', value: '62', unit: '% Max' },
        ],
        notes: 'Hold atmosphere dry and inerted. Bending moments well below DNV safety threshold.',
      },
      engine: {
        title: 'Engine Room & Propulsion',
        subtitle: 'MAN B&W 6S70ME-C9 with B30 Biofuel Blend',
        status: 'optimal',
        metrics: [
          { label: 'Shaft Power', value: '14,800', unit: 'kW' },
          { label: 'RPM', value: '65.2', unit: 'RPM' },
          { label: 'Biofuel Blend Ratio', value: '30% HVO / 70% VLSFO', unit: '' },
          { label: 'Exhaust Gas Temp', value: '284', unit: '°C' },
        ],
        notes: 'Direct torque meter indicates 94.2% mechanical transmission efficiency.',
      },
    },
  },
  {
    id: 'VES-719',
    name: 'MV Ocean Pioneer',
    imo: 'IMO 9651204',
    type: 'LNG Carrier (Membrane Mark III)',
    deadweightTons: 94000,
    lengthMeters: 288.0,
    beamMeters: 44.2,
    speedKnots: 16.2,
    targetSpeedKnots: 15.8,
    enginePowerKW: 24000,
    rpm: 68.0,
    fuelRateMTPerDay: 58.4,
    fuelType: 'VLSFO',
    wellToWakeEmissions: 91.8,
    tankToWakeCO2Rate: 182.2,
    euEtsDailyCostEUR: 12754,
    imoTargetStatus: 'Action Needed (-24% vs 2008)',
    ciiRating: 'C',
    ciiScore: 4.88,
    status: 'Alert',
    origin: 'Ras Laffan (QARLF)',
    destination: 'Zeebrugge (BEZEE)',
    eta: '2026-09-18 12:00 UTC',
    lat: 28.12,
    lng: 33.45,
    heading: 330,
    draftMeters: 11.5,
    trimMeters: 0.15,
    trimDegrees: 0.09,
    seaStateBeaufort: 6,
    waveHeightMeters: 3.8,
    wavePeriodSeconds: 8.6,
    windSpeedKnots: 27.8,
    currentVectorKnots: 1.9,
    currentVectorDir: 150,
    quantumOptimized: false,
    zoneDiagnostics: {
      hull: {
        title: 'Hull & Hydrodynamics',
        subtitle: 'High Sea State Resistance',
        status: 'warning',
        metrics: [
          { label: 'Added Wave Resistance (Raw)', value: '+18.4', unit: '%', isGood: false },
          { label: 'Bow Slamming Accel', value: '0.42', unit: 'g', isGood: false },
          { label: 'Roll Angle (RMS)', value: '4.8', unit: 'deg' },
        ],
        notes: 'Red Sea headwinds creating significant added wave resistance. Speed reduction advised.',
      },
      bridge: {
        title: 'Bridge & Navigational AI',
        subtitle: 'Weather Warning Advisory',
        status: 'warning',
        metrics: [
          { label: 'Weather Front', value: 'Gale BF 6', unit: '' },
          { label: 'Quantum Override', value: 'Recommended', unit: '', isGood: false },
          { label: 'Suez Slot Time', value: '18:45 UTC Sep 11', unit: '' },
        ],
        notes: 'Quantum optimization solver has generated an alternate waypoint sequence to reduce pitch slamming.',
      },
      cargo: {
        title: 'Cargo Tanks (Membrane Mark III)',
        subtitle: 'Cryogenic Boil-Off Gas (BOG)',
        status: 'nominal',
        metrics: [
          { label: 'Cargo Volume', value: '174,000', unit: 'm³' },
          { label: 'Cargo Temp', value: '-161.4', unit: '°C' },
          { label: 'Tank Pressure', value: '106.2', unit: 'kPa' },
          { label: 'BOG Generation Rate', value: '0.11', unit: '%/day' },
        ],
        notes: 'Secondary insulation barrier integrity verified. Reliquefaction skid on standby.',
      },
      engine: {
        title: 'Engine Room & Propulsion',
        subtitle: 'Dual-Fuel Diesel Electric (DFDE)',
        status: 'nominal',
        metrics: [
          { label: 'Current Output', value: '19,200', unit: 'kW' },
          { label: 'Fuel Mode', value: 'VLSFO (Transitioning to Gas)', unit: '' },
          { label: 'CII Penalty Rate', value: '+0.44', unit: 'g/nm' },
        ],
        notes: 'Engine switching to Gas mode planned upon exiting northern Red Sea traffic separation zone.',
      },
    },
  },
  {
    id: 'VES-604',
    name: 'MV Green Aeon',
    imo: 'IMO 9823901',
    type: 'Next-Gen e-Methanol Neo-Panamax',
    deadweightTons: 115000,
    lengthMeters: 333.0,
    beamMeters: 48.0,
    speedKnots: 15.2,
    targetSpeedKnots: 15.0,
    enginePowerKW: 29800,
    rpm: 64.0,
    fuelRateMTPerDay: 51.2,
    fuelType: 'e-Methanol',
    wellToWakeEmissions: 18.5, // Ultra clean green fuel
    tankToWakeCO2Rate: 68.4,
    euEtsDailyCostEUR: 4788,
    imoTargetStatus: 'Surpassed 2050 Net-Zero',
    ciiRating: 'A',
    ciiScore: 1.08,
    status: 'Underway',
    origin: 'Rotterdam (NLRTM)',
    destination: 'New York (USNYC)',
    eta: '2026-09-12 14:00 UTC',
    lat: 44.72,
    lng: -32.11,
    heading: 260,
    draftMeters: 13.4,
    trimMeters: 0.20,
    trimDegrees: 0.11,
    seaStateBeaufort: 3,
    waveHeightMeters: 1.8,
    wavePeriodSeconds: 6.4,
    windSpeedKnots: 12.4,
    currentVectorKnots: 1.1,
    currentVectorDir: 240,
    quantumOptimized: true,
    zoneDiagnostics: {
      hull: {
        title: 'Hull & Hydrodynamics',
        subtitle: 'Air Lubrication System (ALS) Active',
        status: 'optimal',
        metrics: [
          { label: 'Air Lubrication Effect', value: '-8.4%', unit: 'Resistance', isGood: true },
          { label: 'Skin Friction Drag', value: '0.00128', unit: '', isGood: true },
          { label: 'Trim Optimization Delta', value: '+0.20', unit: 'm aft', isGood: true },
        ],
        notes: 'Micro-bubble carpet uniformly distributed along flat bottom hull floor.',
      },
      bridge: {
        title: 'Bridge & Navigational AI',
        subtitle: 'North Atlantic Eco-Corridor',
        status: 'optimal',
        metrics: [
          { label: 'Quantum Weather Routing', value: 'Active', unit: '' },
          { label: 'EU ETS Savings', value: '€34,200', unit: 'voyage to date', isGood: true },
          { label: 'Fuel EU Maritime Surplus', value: '+2.8', unit: 'gCO2eq/MJ', isGood: true },
        ],
        notes: 'Following quantum-optimized transatlantic great circle routing with 1.1 kn tail-current assist.',
      },
      cargo: {
        title: 'Cargo Holds & Battery Energy System',
        subtitle: 'Container Decks + 5MWh Peak Shaving BESS',
        status: 'optimal',
        metrics: [
          { label: 'BESS State of Charge', value: '88.4', unit: '%', isGood: true },
          { label: 'Shaft Generator Power', value: '1,200', unit: 'kW' },
          { label: 'Peak Shaving Margin', value: '15', unit: '%' },
        ],
        notes: 'Battery energy storage system buffering auxiliary electrical loads dynamically.',
      },
      engine: {
        title: 'Engine Room & Propulsion',
        subtitle: 'MAN Energy Solutions Dual-Fuel 8G95ME-C10.5-LGIM',
        status: 'optimal',
        metrics: [
          { label: 'Fuel Blend', value: '100% Green e-Methanol', unit: '' },
          { label: 'NOx Tier III Reduction', value: 'Selective Catalytic 92%', unit: '' },
          { label: 'Net Lifecycle Carbon', value: '-82%', unit: 'vs VLSFO Baseline', isGood: true },
        ],
        notes: 'Green e-Methanol combustion is clean and soot-free with near-zero particulate emissions.',
      },
    },
  },
];

export interface AppliedOptimizationProfile {
  solutionId: string;
  solutionName: string;
  costSavedUsd: number;
  costSavedPct: number;
  fuelSavedMt: number;
  fuelSavedPct: number;
  ghgSavedMt: number;
  ghgSavedPct: number;
  attainedCii: number;
  ciiGrade: 'A' | 'B' | 'C' | 'D' | 'E';
  attainedGfi: number;
  recommendedSpeedKnots: number;
  recommendedFuelRate: number;
  recommendedFuel: FuelType;
  timestamp: string;
  isApplied: boolean;
  legDetails?: any[];
}

export interface PredictionOverride {
  speedKnots: number;
  draftMeters: number;
  trimMeters: number;
  predictedPowerKw: number;
  predictedFuelRateMtDay: number;
  physicsPowerKw: number;
  residualDeltaKw: number;
  fuelType: FuelType;
  waveHeightMeters: number;
  seaStateBeaufort: number;
  isApplied: boolean;
  timestamp: string;
}

export interface ActiveScenario {
  appliedOptimization: AppliedOptimizationProfile | null;
  appliedPrediction: PredictionOverride | null;
  globalKpiDeltas: {
    fuelSavedPct: number;
    wtwCo2ReducedPct: number;
    fleetComplianceBadge: string;
    totalFleetCostSavedUsd: number;
  };
}

export interface FleetNotification {
  id: number;
  message: string;
  type: 'success' | 'info' | 'quantum';
}

interface FleetContextType {
  fleet: Vessel[];
  selectedVessel: Vessel;
  setSelectedVesselId: (id: string) => void;
  isSimulating: boolean;
  toggleSimulation: () => void;
  activeScenario: ActiveScenario;
  applyOptimizationSolution: (solution: any, customVesselId?: string) => void;
  applyPredictionToActiveVessel: (predictionData: any) => void;
  updateVessel: (id: string, updates: Partial<Vessel>) => void;
  resetActiveScenario: () => void;
  notification: FleetNotification | null;
  dismissNotification: () => void;
}

const FleetContext = createContext<FleetContextType | undefined>(undefined);

export const FleetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fleet, setFleet] = useState<Vessel[]>(MOCK_FLEET);
  const [selectedVesselId, setSelectedVesselId] = useState<string>(MOCK_FLEET[0].id);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [notification, setNotification] = useState<FleetNotification | null>(null);

  const [activeScenario, setActiveScenario] = useState<ActiveScenario>({
    appliedOptimization: {
      solutionId: 'sol-3-knee',
      solutionName: 'Q-NSGA-II Utopian Knee Schedule',
      costSavedUsd: 310800,
      costSavedPct: 18.3,
      fuelSavedMt: 284,
      fuelSavedPct: 20.0,
      ghgSavedMt: 8400,
      ghgSavedPct: 55.3,
      attainedCii: 2.15,
      ciiGrade: 'A',
      attainedGfi: 68.4,
      recommendedSpeedKnots: 15.4,
      recommendedFuelRate: 68.4,
      recommendedFuel: 'LNG',
      timestamp: new Date().toISOString(),
      isApplied: true,
    },
    appliedPrediction: null,
    globalKpiDeltas: {
      fuelSavedPct: 20.0,
      wtwCo2ReducedPct: 55.3,
      fleetComplianceBadge: 'Grade A (100% Compliant)',
      totalFleetCostSavedUsd: 310800,
    },
  });

  const selectedVessel = fleet.find((v) => v.id === selectedVesselId) || fleet[0];

  const toggleSimulation = () => setIsSimulating((prev) => !prev);

  const dismissNotification = () => setNotification(null);

  const showNotification = (message: string, type: 'success' | 'info' | 'quantum' = 'success') => {
    setNotification({
      id: Date.now(),
      message,
      type,
    });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4500);
  };

  const updateVessel = (id: string, updates: Partial<Vessel>) => {
    setFleet((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...updates } : v))
    );
  };

  const applyOptimizationSolution = (solution: any, customVesselId?: string) => {
    const targetId = customVesselId || selectedVesselId;
    const target = fleet.find((v) => v.id === targetId) || selectedVessel;

    // Determine representative speed and fuel from leg details or solution vector
    let speed = target.speedKnots;
    let fuel: FuelType = target.fuelType;

    if (solution.leg_details && solution.leg_details.length > 0) {
      const speeds = solution.leg_details.map((l: any) => l.speed_knots || 15.0);
      speed = Number((speeds.reduce((a: number, b: number) => a + b, 0) / speeds.length).toFixed(1));
      
      const fuelName = solution.leg_details[0]?.fuel_type || '';
      if (fuelName.includes('Methanol')) fuel = 'e-Methanol';
      else if (fuelName.includes('Bio')) fuel = 'Biofuel';
      else if (fuelName.includes('LNG')) fuel = 'LNG';
      else if (fuelName.includes('VLSFO')) fuel = 'VLSFO';
    }

    const baselineCost = 1695400;
    const baselineGhg = 15200;
    const baselineFuel = 1420;

    const costSavedUsd = Math.max(0, baselineCost - (solution.total_cost_usd || 1350000));
    const costSavedPct = (costSavedUsd / baselineCost) * 100;
    const ghgSavedMt = Math.max(0, baselineGhg - (solution.total_wtw_ghg_mt || 6800));
    const ghgSavedPct = (ghgSavedMt / baselineGhg) * 100;
    const fuelSavedMt = Math.max(0, baselineFuel - (solution.total_fuel_mt || 1136));
    const fuelSavedPct = (fuelSavedMt / baselineFuel) * 100;

    const recommendedFuelRate = Number((target.fuelRateMTPerDay * (1 - fuelSavedPct / 100 * 0.5)).toFixed(1));
    const attainedCii = Number((solution.attained_cii || 2.15).toFixed(2));
    const ciiGrade: 'A' | 'B' | 'C' | 'D' | 'E' = solution.cii_grade || (attainedCii <= 3.0 ? 'A' : 'B');

    const optProfile: AppliedOptimizationProfile = {
      solutionId: solution.id || 'sol-opt',
      solutionName: solution.is_knee_point ? 'Q-NSGA-II Utopian Knee Point' : `Pareto Solution #${solution.id}`,
      costSavedUsd,
      costSavedPct: Number(costSavedPct.toFixed(1)),
      fuelSavedMt,
      fuelSavedPct: Number(fuelSavedPct.toFixed(1)),
      ghgSavedMt,
      ghgSavedPct: Number(ghgSavedPct.toFixed(1)),
      attainedCii,
      ciiGrade,
      attainedGfi: Number((solution.attained_gfi || 68.4).toFixed(1)),
      recommendedSpeedKnots: speed,
      recommendedFuelRate,
      recommendedFuel: fuel,
      timestamp: new Date().toISOString(),
      isApplied: true,
      legDetails: solution.leg_details,
    };

    setActiveScenario((prev) => ({
      ...prev,
      appliedOptimization: optProfile,
      globalKpiDeltas: {
        fuelSavedPct: Number(fuelSavedPct.toFixed(1)),
        wtwCo2ReducedPct: Number(ghgSavedPct.toFixed(1)),
        fleetComplianceBadge: `Grade ${ciiGrade} (100% Compliant)`,
        totalFleetCostSavedUsd: costSavedUsd,
      },
    }));

    // Propagate changes to active vessel in fleet
    updateVessel(targetId, {
      speedKnots: speed,
      targetSpeedKnots: speed,
      fuelRateMTPerDay: recommendedFuelRate,
      fuelType: fuel,
      ciiRating: ciiGrade,
      ciiScore: attainedCii,
      quantumOptimized: true,
      status: 'Optimizing',
      imoTargetStatus: `On Track (-${Math.round(ghgSavedPct)}% vs 2008)`,
    });

    showNotification(
      `Quantum Pareto Profile applied to ${target.name}! Speed set to ${speed} kts, Fuel rate -${fuelSavedPct.toFixed(1)}%, Grade ${ciiGrade} achieved.`,
      'quantum'
    );
  };

  const applyPredictionToActiveVessel = (predictionData: any) => {
    const target = selectedVessel;
    const speed = predictionData.speedKnots || target.speedKnots;
    const draft = predictionData.draftMeters || target.draftMeters;
    const trim = predictionData.trimMeters !== undefined ? predictionData.trimMeters : target.trimMeters;
    const fuelType = (predictionData.fuelType || target.fuelType) as FuelType;
    const fuelRate = predictionData.fuelRateMTPerDay || target.fuelRateMTPerDay;
    const powerKw = predictionData.enginePowerKW || target.enginePowerKW;

    const override: PredictionOverride = {
      speedKnots: speed,
      draftMeters: draft,
      trimMeters: trim,
      predictedPowerKw: powerKw,
      predictedFuelRateMtDay: fuelRate,
      physicsPowerKw: predictionData.physicsPowerKw || powerKw * 0.92,
      residualDeltaKw: predictionData.residualDeltaKw || powerKw * 0.08,
      fuelType,
      waveHeightMeters: predictionData.waveHeightMeters || target.waveHeightMeters,
      seaStateBeaufort: predictionData.seaStateBeaufort || target.seaStateBeaufort,
      isApplied: true,
      timestamp: new Date().toISOString(),
    };

    setActiveScenario((prev) => ({
      ...prev,
      appliedPrediction: override,
    }));

    updateVessel(target.id, {
      speedKnots: speed,
      targetSpeedKnots: speed,
      draftMeters: draft,
      trimMeters: trim,
      fuelType,
      fuelRateMTPerDay: fuelRate,
      enginePowerKW: powerKw,
      waveHeightMeters: override.waveHeightMeters,
      seaStateBeaufort: override.seaStateBeaufort,
    });

    showNotification(
      `PINN Hydrodynamic Predictions applied to ${target.name}: Draft ${draft}m, Trim ${trim}m, Power ${Math.round(powerKw).toLocaleString()} kW.`,
      'success'
    );
  };

  const resetActiveScenario = () => {
    setFleet(MOCK_FLEET);
    setActiveScenario({
      appliedOptimization: null,
      appliedPrediction: null,
      globalKpiDeltas: {
        fuelSavedPct: 12.4,
        wtwCo2ReducedPct: 38.2,
        fleetComplianceBadge: 'Grade A (Fleet Compliant)',
        totalFleetCostSavedUsd: 142000,
      },
    });
    showNotification('Active fleet scenario restored to baseline telemetry.', 'info');
  };

  return (
    <FleetContext.Provider
      value={{
        fleet,
        selectedVessel,
        setSelectedVesselId,
        isSimulating,
        toggleSimulation,
        activeScenario,
        applyOptimizationSolution,
        applyPredictionToActiveVessel,
        updateVessel,
        resetActiveScenario,
        notification,
        dismissNotification,
      }}
    >
      {children}
    </FleetContext.Provider>
  );
};

export const useFleet = () => {
  const context = useContext(FleetContext);
  if (!context) {
    throw new Error('useFleet must be used within a FleetProvider');
  }
  return context;
};

