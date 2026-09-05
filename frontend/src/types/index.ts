export type VesselStatus = 'Underway' | 'Anchored' | 'Moored' | 'Optimizing' | 'Alert';
export type CIIRating = 'A' | 'B' | 'C' | 'D' | 'E';

export type FuelType = 'VLSFO' | 'LNG' | 'Biofuel' | 'e-Methanol';
export type ShipZone = 'hull' | 'bridge' | 'cargo' | 'engine';

export interface ZoneSensorData {
  title: string;
  subtitle: string;
  status: 'optimal' | 'nominal' | 'warning' | 'critical';
  metrics: {
    label: string;
    value: string | number;
    unit?: string;
    delta?: string;
    isGood?: boolean;
  }[];
  notes: string;
}

export interface Vessel {
  id: string;
  name: string;
  imo: string;
  type: string;
  deadweightTons: number;
  lengthMeters: number;
  beamMeters?: number;
  speedKnots: number;
  targetSpeedKnots: number;
  enginePowerKW: number;
  rpm: number;
  fuelRateMTPerDay: number;
  fuelType: FuelType;
  wellToWakeEmissions: number; // gCO2e/MJ
  tankToWakeCO2Rate: number; // MT/day
  euEtsDailyCostEUR: number;
  imoTargetStatus: string;
  ciiRating: CIIRating;
  ciiScore: number;
  status: VesselStatus;
  origin: string;
  destination: string;
  eta: string;
  lat: number;
  lng: number;
  heading: number;
  draftMeters: number;
  trimMeters: number;
  trimDegrees?: number;
  seaStateBeaufort: number;
  waveHeightMeters: number;
  wavePeriodSeconds?: number;
  windSpeedKnots: number;
  currentVectorKnots: number;
  currentVectorDir: number;
  quantumOptimized: boolean;
  zoneDiagnostics?: Record<ShipZone, ZoneSensorData>;
}

export interface MetricDelta {
  value: number | string;
  percentage?: number;
  isPositiveGood?: boolean;
  trend?: 'up' | 'down' | 'neutral';
}

export interface NavigationItem {
  id: string;
  name: string;
  path: string;
  icon: string;
  badge?: string;
  badgeVariant?: 'teal' | 'violet' | 'amber' | 'success' | 'danger' | 'quantum';
}
