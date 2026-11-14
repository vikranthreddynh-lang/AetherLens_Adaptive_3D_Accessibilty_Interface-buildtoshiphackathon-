import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CentralSculptureProps {
  isCalm: boolean;
}

export const CentralSculpture: React.FC<CentralSculptureProps> = ({ isCalm }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const wireframeRef = useRef<THREE.LineSegments>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (!isCalm) {
      const t = state.clock.getElapsedTime();
      if (meshRef.current) {
        meshRef.current.rotation.x = Math.sin(t * 0.3) * 0.2;
        meshRef.current.rotation.y += delta * 0.25;
        meshRef.current.position.y = Math.sin(t * 0.8) * 0.12;

        // Gentle breathing morph scale
        const scale = 1 + Math.sin(t * 1.2) * 0.04;
        meshRef.current.scale.set(scale, scale, scale);
      }

      if (wireframeRef.current && meshRef.current) {
        wireframeRef.current.rotation.x = meshRef.current.rotation.x;
        wireframeRef.current.rotation.y = meshRef.current.rotation.y;
        wireframeRef.current.position.y = meshRef.current.position.y;
        wireframeRef.current.scale.copy(meshRef.current.scale);
      }

      if (ringRef.current) {
        ringRef.current.rotation.x = Math.PI / 2 + Math.sin(t * 0.4) * 0.15;
        ringRef.current.rotation.z += delta * 0.15;
        ringRef.current.position.y = Math.sin(t * 0.8) * 0.08;
      }
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Central Morphing Icosahedron Clay Core */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <icosahedronGeometry args={[1.1, 1]} />
        <meshStandardMaterial
          color="#7091E6"
          roughness={0.65}
          metalness={0.05}
          flatShading
        />
      </mesh>

      {/* Crisp #3D52A0 Wireframe Contours */}
      <lineSegments ref={wireframeRef} position={[0, 0, 0]}>
        <wireframeGeometry args={[new THREE.IcosahedronGeometry(1.108, 1)]} />
        <lineBasicMaterial color="#3D52A0" linewidth={1.5} transparent opacity={0.85} />
      </lineSegments>

      {/* Delicate floating gyro ring around the sculpture */}
      <mesh ref={ringRef} position={[0, 0, 0]}>
        <torusGeometry args={[1.65, 0.02, 16, 64]} />
        <meshStandardMaterial
          color="#8697C4"
          roughness={0.65}
          metalness={0.05}
        />
      </mesh>
    </group>
  );
};
