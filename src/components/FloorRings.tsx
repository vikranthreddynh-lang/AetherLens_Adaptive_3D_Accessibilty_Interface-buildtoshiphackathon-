import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface FloorRingsProps {
  isCalm: boolean;
}

export const FloorRings: React.FC<FloorRingsProps> = ({ isCalm }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!isCalm && groupRef.current) {
      groupRef.current.rotation.z += delta * 0.04;
    }
  });

  return (
    <group position={[0, -2.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <group ref={groupRef}>
        {/* Outer subtle ring */}
        <mesh>
          <ringGeometry args={[4.4, 4.45, 64]} />
          <meshBasicMaterial color="#ADBBDA" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>

        {/* Mid wire ring */}
        <mesh>
          <ringGeometry args={[3.2, 3.24, 64]} />
          <meshBasicMaterial color="#8697C4" transparent opacity={0.8} side={THREE.DoubleSide} />
        </mesh>

        {/* Inner focus ring */}
        <mesh>
          <ringGeometry args={[1.8, 1.83, 64]} />
          <meshBasicMaterial color="#ADBBDA" transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>

        {/* Segmented radial markers */}
        <mesh>
          <ringGeometry args={[0.8, 0.82, 32]} />
          <meshBasicMaterial color="#8697C4" transparent opacity={0.9} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Static grid-like floor plate */}
      <mesh position={[0, 0, -0.01]}>
        <circleGeometry args={[5.2, 48]} />
        <meshBasicMaterial color="#EDE8F5" transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};
