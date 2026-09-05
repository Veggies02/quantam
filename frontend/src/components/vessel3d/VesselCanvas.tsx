import React, { useState, useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import {
  Camera,
  Compass,
  Eye,
  Crosshair,
  Layers,
  Sparkles,
  RotateCcw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Info,
  Maximize2,
  X,
  Radio,
} from 'lucide-react';
import { ShipModel } from './ShipModel';
import { OceanWater } from './OceanWater';
import { Vessel, ShipZone } from '../../types';

export type CameraPreset = 'orbit' | 'bridge' | 'stern' | 'drone' | 'profile';

interface CameraPresetConfig {
  name: string;
  label: string;
  position: [number, number, number];
  target: [number, number, number];
}

const CAMERA_PRESETS: Record<CameraPreset, CameraPresetConfig> = {
  orbit: {
    name: 'orbit',
    label: 'Orbit 3/4',
    position: [22, 14, 26],
    target: [0, 1.5, 0],
  },
  bridge: {
    name: 'bridge',
    label: 'Bridge View',
    position: [0, 5.2, -4.8],
    target: [0, 4.2, 22],
  },
  stern: {
    name: 'stern',
    label: 'Stern / Prop',
    position: [-10, 2.2, -18],
    target: [0, -0.2, -11],
  },
  drone: {
    name: 'drone',
    label: 'Overhead Drone',
    position: [0.1, 38, 0.1],
    target: [0, 0, 0],
  },
  profile: {
    name: 'profile',
    label: 'Side Profile',
    position: [32, 2.5, 0],
    target: [0, 1.2, 0],
  },
};

interface CameraControllerProps {
  currentPreset: CameraPreset;
  controlsRef: React.RefObject<OrbitControlsImpl>;
}

const CameraController: React.FC<CameraControllerProps> = ({ currentPreset, controlsRef }) => {
  const targetConfig = CAMERA_PRESETS[currentPreset];
  const desiredPos = useRef(new THREE.Vector3(...targetConfig.position));
  const desiredTarget = useRef(new THREE.Vector3(...targetConfig.target));

  useEffect(() => {
    desiredPos.current.set(...targetConfig.position);
    desiredTarget.current.set(...targetConfig.target);
  }, [currentPreset, targetConfig]);

  useFrame((state, delta) => {
    if (controlsRef.current) {
      // Smooth interpolation (lerp) toward target preset
      state.camera.position.lerp(desiredPos.current, delta * 3.5);
      controlsRef.current.target.lerp(desiredTarget.current, delta * 3.5);
      controlsRef.current.update();
    }
  });

  return null;
};

interface VesselCanvasProps {
  vessel: Vessel;
  activeZone?: ShipZone | null;
  onZoneSelect?: (zone: ShipZone | null) => void;
  className?: string;
}

export const VesselCanvas: React.FC<VesselCanvasProps> = ({
  vessel,
  activeZone: externalActiveZone,
  onZoneSelect,
  className = '',
}) => {
  const [internalActiveZone, setInternalActiveZone] = useState<ShipZone | null>(null);
  const [preset, setPreset] = useState<CameraPreset>('orbit');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControlsImpl>(null);

  const activeZone = externalActiveZone !== undefined ? externalActiveZone : internalActiveZone;

  const handleZoneSelect = (zone: ShipZone) => {
    const newZone = activeZone === zone ? null : zone;
    if (onZoneSelect) {
      onZoneSelect(newZone);
    } else {
      setInternalActiveZone(newZone);
    }
  };

  const handleClearZone = () => {
    if (onZoneSelect) {
      onZoneSelect(null);
    } else {
      setInternalActiveZone(null);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const zoneData = activeZone && vessel.zoneDiagnostics ? vessel.zoneDiagnostics[activeZone] : null;

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[460px] bg-gradient-to-b from-[#020b14] via-[#05192d] to-[#04111d] rounded-card overflow-hidden border border-border shadow-md flex flex-col ${className}`}
    >
      {/* ========================================================================= */}
      {/* 3D WebGL Three.js Canvas                                                 */}
      {/* ========================================================================= */}
      <div className="flex-1 w-full h-full relative">
        <Canvas
          shadows
          camera={{ position: [22, 14, 26], fov: 42, near: 0.1, far: 1000 }}
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
          className="w-full h-full"
        >
          {/* Atmospheric marine sky/fog */}
          <color attach="background" args={['#05192d']} />
          <fog attach="fog" args={['#05192d', 35, 140]} />

          {/* Smooth OrbitControls with water level constraints */}
          <OrbitControls
            ref={controlsRef}
            enableDamping
            dampingFactor={0.06}
            minDistance={4}
            maxDistance={85}
            maxPolarAngle={Math.PI / 2 - 0.04} // Disallows dipping below water plane
            minPolarAngle={0.08}
          />

          <CameraController currentPreset={preset} controlsRef={controlsRef} />

          {/* Atmospheric Marine Lighting Rig */}
          <ambientLight intensity={0.55} color="#bde0fe" />
          <directionalLight
            position={[45, 60, 30]}
            intensity={1.85}
            color="#fff8eb"
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-near={10}
            shadow-camera-far={120}
            shadow-camera-left={-25}
            shadow-camera-right={25}
            shadow-camera-top={25}
            shadow-camera-bottom={-25}
            shadow-bias={-0.0005}
          />
          {/* Cyan/Teal Ocean Surface Bounce Light */}
          <directionalLight position={[-20, -10, -20]} intensity={0.6} color="#00b4d8" />
          {/* Superstructure Soft Warm Rim Light */}
          <pointLight position={[0, 15, -15]} intensity={0.9} color="#ffd166" distance={40} />
          {/* Bulbous Bow Torpedo Glow Light */}
          <pointLight position={[0, 1.2, 14.5]} intensity={0.6} color="#00f5d4" distance={12} />

          <Suspense fallback={null}>
            {/* 3D Vessel Digital Twin Model */}
            <ShipModel
              vessel={vessel}
              selectedZone={activeZone}
              onSelectZone={handleZoneSelect}
            />

            {/* Dynamic Ocean Water & Stern Wake Trails */}
            <OceanWater
              speedKnots={vessel.speedKnots}
              waveHeight={vessel.waveHeightMeters}
            />
          </Suspense>
        </Canvas>

        {/* ========================================================================= */}
        {/* TOP HUD: Live Vessel Info & Camera Presets                                */}
        {/* ========================================================================= */}
        <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none z-10">
          {/* Left: Vessel Badge & Status */}
          <div className="flex items-center gap-2 bg-navy-dark/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/15 text-white pointer-events-auto shadow-sm">
            <Radio className="h-3.5 w-3.5 text-teal animate-pulse" />
            <span className="text-xs font-bold font-mono tracking-wide">{vessel.name}</span>
            <span className="text-[11px] text-white/60 font-mono">({vessel.type.split(' ')[0]})</span>
            <span className="h-3 w-px bg-white/20" />
            <span className="text-[10px] font-mono text-quantum font-semibold uppercase">
              {vessel.fuelType} Hybrid Twin
            </span>
          </div>

          {/* Right: Camera Preset Selector Pills */}
          <div className="flex items-center gap-1 bg-navy-dark/85 backdrop-blur-md p-1 rounded-lg border border-white/15 pointer-events-auto shadow-sm">
            {(Object.keys(CAMERA_PRESETS) as CameraPreset[]).map((key) => {
              const cfg = CAMERA_PRESETS[key];
              const isActive = preset === key;
              return (
                <button
                  key={key}
                  onClick={() => setPreset(key)}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-teal text-white font-bold shadow-xs'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                  title={cfg.label}
                >
                  {key === 'orbit' && <Compass className="h-3 w-3" />}
                  {key === 'bridge' && <Eye className="h-3 w-3" />}
                  {key === 'stern' && <RotateCcw className="h-3 w-3" />}
                  {key === 'drone' && <Layers className="h-3 w-3" />}
                  {key === 'profile' && <Crosshair className="h-3 w-3" />}
                  <span className="hidden sm:inline">{cfg.label}</span>
                </button>
              );
            })}

            <button
              onClick={toggleFullscreen}
              className="p-1 rounded text-white/60 hover:text-white hover:bg-white/10 ml-1"
              title="Toggle Fullscreen"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* FLOATING HUD CARD: Selected Ship Zone Telemetry                           */}
        {/* ========================================================================= */}
        {zoneData && (
          <div className="absolute top-14 left-3 max-w-sm w-full bg-navy-dark/95 backdrop-blur-lg border border-teal/40 rounded-card p-4 text-white shadow-xl z-20 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-2.5 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-teal" />
                  <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-quantum">
                    {zoneData.title}
                  </h4>
                </div>
                <p className="text-[11px] text-white/70 mt-0.5">{zoneData.subtitle}</p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold ${
                    zoneData.status === 'optimal'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : zoneData.status === 'warning'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-teal/20 text-teal-light border border-teal/30'
                  }`}
                >
                  {zoneData.status}
                </span>
                <button
                  onClick={handleClearZone}
                  className="text-white/50 hover:text-white p-0.5 rounded hover:bg-white/10 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Metrics List */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              {zoneData.metrics.map((m, idx) => (
                <div key={idx} className="bg-white/5 p-2 rounded border border-white/10">
                  <div className="text-[10px] text-white/60 truncate">{m.label}</div>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-xs font-bold font-mono text-white">{m.value}</span>
                    {m.unit && <span className="text-[10px] font-mono text-white/60">{m.unit}</span>}
                  </div>
                  {m.delta && (
                    <div
                      className={`text-[9px] font-mono mt-0.5 ${
                        m.isGood ? 'text-emerald-400' : 'text-amber-300'
                      }`}
                    >
                      {m.delta}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* AI PINN Diagnostics Note */}
            <div className="text-[10px] text-white/80 bg-teal/10 border border-teal/20 p-2 rounded flex items-start gap-1.5 font-sans leading-relaxed">
              <Info className="h-3.5 w-3.5 text-teal shrink-0 mt-0.5" />
              <span>{zoneData.notes}</span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* BOTTOM HUD: Interactive Zone Selection Buttons & Quick Telemetry          */}
        {/* ========================================================================= */}
        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none z-10">
          {/* Zone Hotspot Shortcuts */}
          <div className="flex items-center gap-1.5 bg-navy-dark/85 backdrop-blur-md p-1.5 rounded-lg border border-white/15 pointer-events-auto shadow-sm">
            <span className="text-[10px] font-mono text-white/60 uppercase px-1.5 font-semibold">
              Sensor Zones:
            </span>
            {(['hull', 'bridge', 'cargo', 'engine'] as ShipZone[]).map((zone) => {
              const isSelected = activeZone === zone;
              return (
                <button
                  key={zone}
                  onClick={() => handleZoneSelect(zone)}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono capitalize transition-all ${
                    isSelected
                      ? 'bg-quantum text-navy-dark font-bold shadow-xs'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {zone === 'hull' && 'Hull (PINN)'}
                  {zone === 'bridge' && 'Bridge (AI)'}
                  {zone === 'cargo' && 'Cargo Deck'}
                  {zone === 'engine' && 'Engine / Shaft'}
                </button>
              );
            })}
          </div>

          {/* Quick HUD Metrics */}
          <div className="flex items-center gap-3 bg-navy-dark/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/15 text-[11px] font-mono text-white pointer-events-auto shadow-sm">
            <div>
              <span className="text-white/50">SOG: </span>
              <span className="text-quantum font-bold">{vessel.speedKnots} kts</span>
            </div>
            <span className="text-white/20">•</span>
            <div>
              <span className="text-white/50">RPM: </span>
              <span className="text-white font-bold">{vessel.rpm}</span>
            </div>
            <span className="text-white/20">•</span>
            <div>
              <span className="text-white/50">Draft: </span>
              <span className="text-white font-bold">{vessel.draftMeters}m</span>
            </div>
            <span className="text-white/20">•</span>
            <div>
              <span className="text-white/50">Trim: </span>
              <span className="text-teal font-bold">{vessel.trimMeters > 0 ? `+${vessel.trimMeters}` : vessel.trimMeters}m</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
