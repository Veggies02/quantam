import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface OceanWaterProps {
  speedKnots: number;
  waveHeight: number;
}

export const OceanWater: React.FC<OceanWaterProps> = ({ speedKnots, waveHeight }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const wakeRef = useRef<THREE.Group>(null);
  const wakeParticlesRef = useRef<THREE.Points>(null);

  // Dynamic wave parameters
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSpeed: { value: speedKnots },
      uWaveHeight: { value: Math.max(0.3, waveHeight * 0.25) },
      uDeepColor: { value: new THREE.Color('#031926') },
      uShallowColor: { value: new THREE.Color('#0f4c5c') },
      uFoamColor: { value: new THREE.Color('#cbf3f0') },
    }),
    []
  );

  // Create wake particles behind the stern
  const { wakePositions } = useMemo(() => {
    const count = 120;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const z = -(i * 0.4) - 5; // Trail back from stern (at z ~ -5)
      const spread = (Math.abs(z) - 5) * 0.35 + (Math.random() - 0.5) * 0.8;
      const x = (Math.random() > 0.5 ? 1 : -1) * (1.2 + spread);
      const y = -0.05 + Math.random() * 0.08;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }

    return { wakePositions: positions };
  }, []);

  useFrame((state, delta) => {
    if (meshRef.current) {
      uniforms.uTime.value += delta * (1.2 + speedKnots * 0.05);
      uniforms.uSpeed.value = speedKnots;
      uniforms.uWaveHeight.value = Math.max(0.2, waveHeight * 0.22);
    }

    // Animate wake particles drifting backward
    if (wakeParticlesRef.current) {
      const geom = wakeParticlesRef.current.geometry;
      const pos = geom.attributes.position.array as Float32Array;
      const streamSpeed = delta * (speedKnots * 0.45 + 2.0);

      for (let i = 0; i < pos.length / 3; i++) {
        pos[i * 3 + 2] -= streamSpeed; // Move back along Z
        if (pos[i * 3 + 2] < -50) {
          pos[i * 3 + 2] = -5.0 + (Math.random() - 0.5) * 1.0;
          const spread = 0.8 + (Math.random() - 0.5) * 0.4;
          pos[i * 3] = (Math.random() > 0.5 ? 1 : -1) * spread;
        }
      }
      geom.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group position={[0, -0.2, 0]}>
      {/* Primary Ocean Surface Plane */}
      <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[220, 220, 96, 96]} />
        <meshStandardMaterial
          color="#06283D"
          roughness={0.12}
          metalness={0.88}
          wireframe={false}
          transparent
          opacity={0.94}
        />
      </mesh>

      {/* Underwater Depth Haze Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, 0]}>
        <planeGeometry args={[260, 260]} />
        <meshBasicMaterial color="#021018" depthWrite={false} />
      </mesh>

      {/* Stern Wake Trail V-Plume */}
      <group ref={wakeRef}>
        {/* Port Stern Wake Wing */}
        <mesh position={[-2.2, 0.02, -18]} rotation={[-Math.PI / 2, 0, 0.12]}>
          <planeGeometry args={[3.2, 28]} />
          <meshBasicMaterial
            color="#99e2b4"
            transparent
            opacity={0.35}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Starboard Stern Wake Wing */}
        <mesh position={[2.2, 0.02, -18]} rotation={[-Math.PI / 2, 0, -0.12]}>
          <planeGeometry args={[3.2, 28]} />
          <meshBasicMaterial
            color="#99e2b4"
            transparent
            opacity={0.35}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Central Stern Foam Churn */}
        <mesh position={[0, 0.03, -12]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3.6, 16]} />
          <meshBasicMaterial
            color="#d8f3dc"
            transparent
            opacity={0.42}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Dynamic Wake Foam Particles */}
        <points ref={wakeParticlesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={wakePositions.length / 3}
              array={wakePositions}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.45}
            color="#e0fbfc"
            transparent
            opacity={0.7}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>

        {/* Bow Wave Foam Rings */}
        <mesh position={[0, 0.04, 13.8]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.8, 2.2, 32]} />
          <meshBasicMaterial
            color="#b5e48c"
            transparent
            opacity={0.45}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
};
