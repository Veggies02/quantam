import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { Vessel, ShipZone } from '../../types';

interface ShipModelProps {
  vessel: Vessel;
  selectedZone: ShipZone | null;
  onSelectZone: (zone: ShipZone) => void;
}

export const ShipModel: React.FC<ShipModelProps> = ({ vessel, selectedZone, onSelectZone }) => {
  const groupRef = useRef<THREE.Group>(null);
  const radarRef1 = useRef<THREE.Group>(null);
  const radarRef2 = useRef<THREE.Group>(null);
  const propellerRef = useRef<THREE.Group>(null);
  const exhaustPlumeRef = useRef<THREE.Points>(null);

  // Vessel trim and draft displacement calculations
  const trimAngle = (vessel.trimMeters || 0.2) * 0.035; // radians pitch
  const draftOffset = -((vessel.draftMeters || 12) - 10) * 0.08; // Y translation

  // Procedural container colors
  const containerColors = [
    '#0077b6', // Maersk / Ocean blue
    '#00b4d8', // Teal
    '#023e8a', // Deep Navy
    '#e76f51', // Terracotta Orange
    '#2a9d8f', // Emerald Green
    '#e63946', // Crimson
    '#f4a261', // Sandy Gold
    '#457b9d', // Steel Slate
  ];

  // Procedural Container Stacks Generation (Midship deck)
  const containerStacks = useMemo(() => {
    const stacks: { pos: [number, number, number]; size: [number, number, number]; color: string }[] = [];
    const bayCount = 6;
    const rows = 4;
    const maxTiers = 3;

    for (let b = 0; b < bayCount; b++) {
      const zPos = 7.5 - b * 2.2;
      for (let r = 0; r < rows; r++) {
        const xPos = (r - (rows - 1) / 2) * 0.95;
        const tiers = Math.floor(Math.sin((b + 1) * 1.3 + r) * 1.2 + 2.2); // Tier variation 2-3

        for (let t = 0; t < Math.min(maxTiers, tiers); t++) {
          const yPos = 1.35 + t * 0.65;
          const colorIdx = (b * 7 + r * 3 + t * 5) % containerColors.length;
          stacks.push({
            pos: [xPos, yPos, zPos],
            size: [0.88, 0.6, 2.0],
            color: containerColors[colorIdx],
          });
        }
      }
    }
    return stacks;
  }, []);

  // Exhaust particle plume setup
  const { exhaustPositions } = useMemo(() => {
    const count = 35;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 0.2; // X
      positions[i * 3 + 1] = 6.2 + i * 0.15; // Y
      positions[i * 3 + 2] = -7.5 - i * 0.35 + (Math.random() - 0.5) * 0.2; // Z drifting back
    }
    return { exhaustPositions: positions };
  }, []);

  // Frame animation loop: Radars, Propeller, Exhaust Plume, Gentle Vessel Sea Heave
  useFrame((state, delta) => {
    // Spin radars
    if (radarRef1.current) radarRef1.current.rotation.y += delta * 3.5;
    if (radarRef2.current) radarRef2.current.rotation.y += delta * 2.2;

    // Spin propeller proportional to vessel RPM
    if (propellerRef.current) {
      const rpmSpeed = ((vessel.rpm || 70) / 60) * Math.PI * 2 * 2;
      propellerRef.current.rotation.z += delta * rpmSpeed;
    }

    // Animate subtle sea buoyancy heave & roll
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      const waveFreq = 1.2;
      const heave = Math.sin(t * waveFreq) * 0.06;
      const roll = Math.cos(t * waveFreq * 0.8) * 0.015;
      const pitch = Math.sin(t * waveFreq * 0.5) * 0.01 + trimAngle;

      groupRef.current.position.y = draftOffset + heave;
      groupRef.current.rotation.z = roll;
      groupRef.current.rotation.x = pitch;
    }

    // Animate exhaust smoke trail
    if (exhaustPlumeRef.current) {
      const geom = exhaustPlumeRef.current.geometry;
      const pos = geom.attributes.position.array as Float32Array;
      const speed = delta * (vessel.speedKnots * 0.2 + 2.5);

      for (let i = 0; i < pos.length / 3; i++) {
        pos[i * 3 + 2] -= speed; // Drift back
        pos[i * 3 + 1] += delta * 0.8; // Drift up
        pos[i * 3] += (Math.sin(state.clock.elapsedTime + i) * 0.02) * delta;

        if (pos[i * 3 + 2] < -18.0) {
          pos[i * 3 + 2] = -7.4;
          pos[i * 3 + 1] = 6.2;
          pos[i * 3] = (Math.random() - 0.5) * 0.15;
        }
      }
      geom.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef} position={[0, draftOffset, 0]}>
      {/* ========================================================================= */}
      {/* 1. HULL STRUCTURE & WATERLINE CONTRAST                                   */}
      {/* ========================================================================= */}
      <group
        onClick={(e) => {
          e.stopPropagation();
          onSelectZone('hull');
        }}
      >
        {/* Main Upper Hull (Dark Navy / Charcoal Topsides) */}
        <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.4, 1.4, 26]} />
          <meshStandardMaterial
            color={selectedZone === 'hull' ? '#00b4d8' : '#14213d'}
            roughness={0.35}
            metalness={0.65}
            emissive={selectedZone === 'hull' ? '#0077b6' : '#000000'}
            emissiveIntensity={selectedZone === 'hull' ? 0.45 : 0}
          />
        </mesh>

        {/* Lower Hull (Antifouling Crimson Red - Below Waterline) */}
        <mesh position={[0, -0.2, 0]} receiveShadow>
          <boxGeometry args={[4.2, 0.6, 25.8]} />
          <meshStandardMaterial color="#9b2226" roughness={0.6} metalness={0.2} />
        </mesh>

        {/* Crisp Waterline White/Teal Pinstripe */}
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[4.45, 0.08, 26.05]} />
          <meshStandardMaterial color="#e0fbfc" roughness={0.2} metalness={0.8} />
        </mesh>

        {/* Bow Wedge / Taper (Forward Churn Form) */}
        <mesh position={[0, 0.7, 14]} rotation={[0, 0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.2, 2.2, 3.2, 4]} />
          <meshStandardMaterial
            color={selectedZone === 'hull' ? '#00b4d8' : '#14213d'}
            roughness={0.35}
            metalness={0.65}
          />
        </mesh>

        {/* Bulbous Bow (Hydrodynamic Torpedo under forward waterline) */}
        <mesh position={[0, -0.15, 14.2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <capsuleGeometry args={[0.75, 1.8, 16, 16]} />
          <meshStandardMaterial
            color={selectedZone === 'hull' ? '#00f5d4' : '#9b2226'}
            roughness={0.4}
            metalness={0.4}
            emissive={selectedZone === 'hull' ? '#00b4d8' : '#000000'}
            emissiveIntensity={selectedZone === 'hull' ? 0.6 : 0}
          />
        </mesh>

        {/* Stern Transom Taper (Aft Run) */}
        <mesh position={[0, 0.6, -13.5]} castShadow>
          <boxGeometry args={[4.0, 1.2, 1.5]} />
          <meshStandardMaterial color="#14213d" roughness={0.35} metalness={0.65} />
        </mesh>

        {/* Mooring Deck Forecastle & Forward Railings */}
        <mesh position={[0, 1.55, 12.8]}>
          <boxGeometry args={[3.8, 0.3, 2.6]} />
          <meshStandardMaterial color="#e5e5e5" roughness={0.4} />
        </mesh>
        <mesh position={[0, 1.75, 13.9]}>
          <boxGeometry args={[3.6, 0.15, 0.1]} />
          <meshStandardMaterial color="#4a4e69" />
        </mesh>
      </group>

      {/* ========================================================================= */}
      {/* 2. CARGO DECK & MULTICOLORED CONTAINER STACKS                            */}
      {/* ========================================================================= */}
      <group
        onClick={(e) => {
          e.stopPropagation();
          onSelectZone('cargo');
        }}
      >
        {/* Main Cargo Deck Base Plane */}
        <mesh position={[0, 1.42, 1.5]} receiveShadow>
          <boxGeometry args={[4.2, 0.1, 18.5]} />
          <meshStandardMaterial color="#22223b" roughness={0.8} />
        </mesh>

        {/* Cellular Container Guide Rails (Cross-deck separators) */}
        {[-3.5, -1.2, 1.1, 3.4, 5.7, 8.0].map((z, idx) => (
          <mesh key={`guide-${idx}`} position={[0, 1.6, z]}>
            <boxGeometry args={[4.25, 0.45, 0.1]} />
            <meshStandardMaterial color="#4a4e69" metalness={0.8} />
          </mesh>
        ))}

        {/* Procedural Container Stacks */}
        {containerStacks.map((c, i) => (
          <mesh key={`cont-${i}`} position={c.pos} castShadow receiveShadow>
            <boxGeometry args={c.size} />
            <meshStandardMaterial
              color={selectedZone === 'cargo' ? '#00f5d4' : c.color}
              roughness={0.45}
              metalness={0.3}
              emissive={selectedZone === 'cargo' ? '#0077b6' : '#000000'}
              emissiveIntensity={selectedZone === 'cargo' ? 0.35 : 0}
            />
          </mesh>
        ))}
      </group>

      {/* ========================================================================= */}
      {/* 3. SUPERSTRUCTURE / BRIDGE TOWER & MASTS                                 */}
      {/* ========================================================================= */}
      <group
        onClick={(e) => {
          e.stopPropagation();
          onSelectZone('bridge');
        }}
      >
        {/* Accommodation Tower Base (Deck 1-3) */}
        <mesh position={[0, 2.6, -6.8]} castShadow receiveShadow>
          <boxGeometry args={[3.8, 2.4, 3.2]} />
          <meshStandardMaterial
            color={selectedZone === 'bridge' ? '#00b4d8' : '#f8f9fa'}
            roughness={0.3}
            metalness={0.2}
            emissive={selectedZone === 'bridge' ? '#0077b6' : '#000000'}
            emissiveIntensity={selectedZone === 'bridge' ? 0.3 : 0}
          />
        </mesh>

        {/* Portholes / Accommodation Windows Strip */}
        <mesh position={[0, 2.4, -5.18]}>
          <boxGeometry args={[3.4, 0.25, 0.05]} />
          <meshStandardMaterial color="#001845" roughness={0.1} />
        </mesh>
        <mesh position={[0, 3.1, -5.18]}>
          <boxGeometry args={[3.4, 0.25, 0.05]} />
          <meshStandardMaterial color="#001845" roughness={0.1} />
        </mesh>

        {/* Navigation Bridge Level (Deck 4) with Overhanging Wings */}
        <mesh position={[0, 4.1, -6.6]} castShadow receiveShadow>
          <boxGeometry args={[4.6, 0.7, 2.4]} />
          <meshStandardMaterial color="#f8f9fa" roughness={0.3} />
        </mesh>

        {/* Panoramic Navigation Glass Windows (Forward Bridge Face) */}
        <mesh position={[0, 4.18, -5.38]}>
          <boxGeometry args={[4.2, 0.42, 0.08]} />
          <meshStandardMaterial
            color="#00b4d8"
            roughness={0.05}
            metalness={0.9}
            emissive="#0077b6"
            emissiveIntensity={0.6}
            transparent
            opacity={0.88}
          />
        </mesh>

        {/* Bridge Wing Port/Starboard Consoles */}
        <mesh position={[-2.2, 4.05, -6.6]}>
          <boxGeometry args={[0.3, 0.5, 1.2]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        <mesh position={[2.2, 4.05, -6.6]}>
          <boxGeometry args={[0.3, 0.5, 1.2]} />
          <meshStandardMaterial color="#333" />
        </mesh>

        {/* Bridge Roof Deck & Main Communication Mast */}
        <mesh position={[0, 4.5, -6.6]}>
          <boxGeometry args={[3.4, 0.15, 2.0]} />
          <meshStandardMaterial color="#e9ecef" />
        </mesh>
        <mesh position={[0, 5.5, -6.6]} castShadow>
          <cylinderGeometry args={[0.06, 0.12, 1.9, 8]} />
          <meshStandardMaterial color="#ced4da" metalness={0.8} />
        </mesh>
        <mesh position={[0, 5.8, -6.6]}>
          <boxGeometry args={[1.6, 0.08, 0.08]} />
          <meshStandardMaterial color="#495057" />
        </mesh>

        {/* Rotating Radar Antenna 1 (Upper X-Band Radar) */}
        <group ref={radarRef1} position={[0, 6.4, -6.6]}>
          <mesh position={[0, 0.08, 0]}>
            <boxGeometry args={[1.2, 0.1, 0.08]} />
            <meshStandardMaterial color="#00f5d4" emissive="#00b4d8" emissiveIntensity={0.4} />
          </mesh>
        </group>

        {/* Rotating Radar Antenna 2 (Lower S-Band Radar) */}
        <group ref={radarRef2} position={[0, 5.8, -6.6]}>
          <mesh position={[0, 0.08, 0]}>
            <boxGeometry args={[1.6, 0.12, 0.1]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        </group>

        {/* SATCOM Satellite Domes */}
        <mesh position={[-0.9, 4.8, -6.3]} castShadow>
          <sphereGeometry args={[0.26, 16, 16]} />
          <meshStandardMaterial color="#ffffff" roughness={0.2} />
        </mesh>
        <mesh position={[0.9, 4.8, -6.3]} castShadow>
          <sphereGeometry args={[0.26, 16, 16]} />
          <meshStandardMaterial color="#ffffff" roughness={0.2} />
        </mesh>
      </group>

      {/* ========================================================================= */}
      {/* 4. ENGINE ROOM CASING, EXHAUST FUNNEL & PROPELLER                        */}
      {/* ========================================================================= */}
      <group
        onClick={(e) => {
          e.stopPropagation();
          onSelectZone('engine');
        }}
      >
        {/* Engine Casing House (Aft Superstructure Deck) */}
        <mesh position={[0, 2.2, -9.6]} castShadow receiveShadow>
          <boxGeometry args={[3.2, 1.6, 2.6]} />
          <meshStandardMaterial
            color={selectedZone === 'engine' ? '#00b4d8' : '#dee2e6'}
            roughness={0.4}
            metalness={0.4}
            emissive={selectedZone === 'engine' ? '#0077b6' : '#000000'}
            emissiveIntensity={selectedZone === 'engine' ? 0.3 : 0}
          />
        </mesh>

        {/* Modern Aerodynamic Exhaust Funnel Stack */}
        <mesh position={[0, 4.2, -9.6]} rotation={[-0.15, 0, 0]} castShadow>
          <cylinderGeometry args={[0.65, 0.9, 2.8, 16]} />
          <meshStandardMaterial
            color={selectedZone === 'engine' ? '#00f5d4' : '#14213d'}
            roughness={0.3}
            metalness={0.7}
            emissive={selectedZone === 'engine' ? '#00b4d8' : '#000000'}
            emissiveIntensity={selectedZone === 'engine' ? 0.5 : 0}
          />
        </mesh>

        {/* Funnel Top Lip & Piping */}
        <mesh position={[0, 5.5, -9.8]}>
          <cylinderGeometry args={[0.6, 0.6, 0.25, 16]} />
          <meshStandardMaterial color="#212529" roughness={0.8} />
        </mesh>

        {/* Dynamic Exhaust Plume Smoke Particle System */}
        <points ref={exhaustPlumeRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={exhaustPositions.length / 3}
              array={exhaustPositions}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.55}
            color="#ced4da"
            transparent
            opacity={0.32}
            blending={THREE.NormalBlending}
            depthWrite={false}
          />
        </points>

        {/* Stern Propeller Boss / Shaft Hub */}
        <mesh position={[0, -0.3, -13.6]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.9, 16]} />
          <meshStandardMaterial color="#b08968" metalness={0.85} roughness={0.25} />
        </mesh>

        {/* Rotating 4-Blade Bronze Propeller Assembly */}
        <group ref={propellerRef} position={[0, -0.3, -14.1]}>
          <mesh rotation={[0, 0, 0]}>
            <sphereGeometry args={[0.26, 16, 16]} />
            <meshStandardMaterial color="#ddb892" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Blade 1 (0 deg) */}
          <mesh position={[0, 0.48, 0]} rotation={[0.3, 0, 0]}>
            <boxGeometry args={[0.24, 0.75, 0.06]} />
            <meshStandardMaterial
              color={selectedZone === 'engine' ? '#00f5d4' : '#c68b59'}
              metalness={0.9}
              roughness={0.2}
            />
          </mesh>
          {/* Blade 2 (90 deg) */}
          <mesh position={[0.48, 0, 0]} rotation={[0, 0.3, Math.PI / 2]}>
            <boxGeometry args={[0.24, 0.75, 0.06]} />
            <meshStandardMaterial
              color={selectedZone === 'engine' ? '#00f5d4' : '#c68b59'}
              metalness={0.9}
              roughness={0.2}
            />
          </mesh>
          {/* Blade 3 (180 deg) */}
          <mesh position={[0, -0.48, 0]} rotation={[-0.3, 0, Math.PI]}>
            <boxGeometry args={[0.24, 0.75, 0.06]} />
            <meshStandardMaterial
              color={selectedZone === 'engine' ? '#00f5d4' : '#c68b59'}
              metalness={0.9}
              roughness={0.2}
            />
          </mesh>
          {/* Blade 4 (270 deg) */}
          <mesh position={[-0.48, 0, 0]} rotation={[0, -0.3, -Math.PI / 2]}>
            <boxGeometry args={[0.24, 0.75, 0.06]} />
            <meshStandardMaterial
              color={selectedZone === 'engine' ? '#00f5d4' : '#c68b59'}
              metalness={0.9}
              roughness={0.2}
            />
          </mesh>
        </group>

        {/* Semi-balanced Rudder Blade */}
        <mesh position={[0, -0.3, -14.6]} castShadow>
          <boxGeometry args={[0.12, 1.4, 0.9]} />
          <meshStandardMaterial color="#14213d" metalness={0.8} />
        </mesh>
      </group>

      {/* ========================================================================= */}
      {/* 5. INTERACTIVE 3D HOTSPOT BILLBOARDS & PULSING HIGHLIGHTS                 */}
      {/* ========================================================================= */}

      {/* Hotspot 1: Hull & Hydrodynamics (Forward Bow) */}
      <group position={[0, 1.2, 13.8]}>
        <mesh
          onClick={(e) => {
            e.stopPropagation();
            onSelectZone('hull');
          }}
        >
          <sphereGeometry args={[0.32, 16, 16]} />
          <meshBasicMaterial
            color={selectedZone === 'hull' ? '#00f5d4' : '#00b4d8'}
            wireframe={selectedZone !== 'hull'}
          />
        </mesh>
        <Html distanceFactor={18} position={[0, 0.6, 0]} center>
          <button
            onClick={() => onSelectZone('hull')}
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase transition-all shadow-lg flex items-center gap-1 cursor-pointer select-none ${
              selectedZone === 'hull'
                ? 'bg-quantum text-navy-dark ring-2 ring-white scale-110 shadow-quantum-glow'
                : 'bg-navy-dark/90 text-teal-light border border-teal/50 hover:bg-teal hover:text-white'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-quantum animate-ping" />
            Hull PINN
          </button>
        </Html>
      </group>

      {/* Hotspot 2: Bridge & AI Routing (Top Tower) */}
      <group position={[0, 5.2, -6.6]}>
        <mesh
          onClick={(e) => {
            e.stopPropagation();
            onSelectZone('bridge');
          }}
        >
          <sphereGeometry args={[0.32, 16, 16]} />
          <meshBasicMaterial
            color={selectedZone === 'bridge' ? '#00f5d4' : '#00b4d8'}
            wireframe={selectedZone !== 'bridge'}
          />
        </mesh>
        <Html distanceFactor={18} position={[0, 0.6, 0]} center>
          <button
            onClick={() => onSelectZone('bridge')}
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase transition-all shadow-lg flex items-center gap-1 cursor-pointer select-none ${
              selectedZone === 'bridge'
                ? 'bg-quantum text-navy-dark ring-2 ring-white scale-110 shadow-quantum-glow'
                : 'bg-navy-dark/90 text-teal-light border border-teal/50 hover:bg-teal hover:text-white'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-teal animate-ping" />
            Bridge AI
          </button>
        </Html>
      </group>

      {/* Hotspot 3: Cargo Bay (Midship) */}
      <group position={[0, 3.2, 3.2]}>
        <mesh
          onClick={(e) => {
            e.stopPropagation();
            onSelectZone('cargo');
          }}
        >
          <sphereGeometry args={[0.32, 16, 16]} />
          <meshBasicMaterial
            color={selectedZone === 'cargo' ? '#00f5d4' : '#00b4d8'}
            wireframe={selectedZone !== 'cargo'}
          />
        </mesh>
        <Html distanceFactor={18} position={[0, 0.6, 0]} center>
          <button
            onClick={() => onSelectZone('cargo')}
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase transition-all shadow-lg flex items-center gap-1 cursor-pointer select-none ${
              selectedZone === 'cargo'
                ? 'bg-quantum text-navy-dark ring-2 ring-white scale-110 shadow-quantum-glow'
                : 'bg-navy-dark/90 text-teal-light border border-teal/50 hover:bg-teal hover:text-white'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
            Cargo Bay
          </button>
        </Html>
      </group>

      {/* Hotspot 4: Engine Room & Propulsion (Stern) */}
      <group position={[0, 1.8, -11.5]}>
        <mesh
          onClick={(e) => {
            e.stopPropagation();
            onSelectZone('engine');
          }}
        >
          <sphereGeometry args={[0.32, 16, 16]} />
          <meshBasicMaterial
            color={selectedZone === 'engine' ? '#00f5d4' : '#00b4d8'}
            wireframe={selectedZone !== 'engine'}
          />
        </mesh>
        <Html distanceFactor={18} position={[0, 0.6, 0]} center>
          <button
            onClick={() => onSelectZone('engine')}
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase transition-all shadow-lg flex items-center gap-1 cursor-pointer select-none ${
              selectedZone === 'engine'
                ? 'bg-quantum text-navy-dark ring-2 ring-white scale-110 shadow-quantum-glow'
                : 'bg-navy-dark/90 text-teal-light border border-teal/50 hover:bg-teal hover:text-white'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-ping" />
            Engine/Prop
          </button>
        </Html>
      </group>
    </group>
  );
};
