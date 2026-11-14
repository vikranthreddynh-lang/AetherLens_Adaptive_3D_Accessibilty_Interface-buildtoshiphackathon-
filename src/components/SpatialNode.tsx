import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FeatureMetadata, FeatureId } from '../types/accessibility';

interface SpatialNodeProps {
  feature: FeatureMetadata;
  isActive: boolean;
  isCalm: boolean;
  onSelect: (id: FeatureId) => void;
  nodeIndex: number;
}

export const SpatialNode: React.FC<SpatialNodeProps> = ({
  feature,
  isActive,
  isCalm,
  onSelect,
  nodeIndex,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Gentle individual orbital float
  useFrame((state, delta) => {
    if (!isCalm && meshRef.current) {
      const t = state.clock.getElapsedTime() + nodeIndex * 2.1;
      meshRef.current.rotation.y += delta * 0.5;
      meshRef.current.rotation.x = Math.sin(t * 0.7) * 0.3;
      meshRef.current.position.y = feature.position[1] + Math.sin(t * 1.2) * 0.12;

      if (ringRef.current) {
        ringRef.current.rotation.z += delta * 0.8;
        ringRef.current.position.y = meshRef.current.position.y;
      }

      if (haloRef.current) {
        haloRef.current.rotation.y -= delta * 0.6;
        haloRef.current.position.y = meshRef.current.position.y + 0.65;
      }
    } else if (meshRef.current) {
      meshRef.current.position.y = feature.position[1];
      if (ringRef.current) {
        ringRef.current.position.y = feature.position[1];
      }
      if (haloRef.current) {
        haloRef.current.position.y = feature.position[1] + 0.65;
      }
    }
  });

  const nodeColor = isActive || isHovered ? '#7091E6' : '#ADBBDA';
  const showFocusRing = isActive || isHovered;

  return (
    <group position={[feature.position[0], feature.position[1], feature.position[2]]}>
      {/* Interactive 3D Mesh */}
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(feature.id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setIsHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setIsHovered(false);
          document.body.style.cursor = 'default';
        }}
      >
        {nodeIndex === 0 && <octahedronGeometry args={[0.42, 0]} />}
        {nodeIndex === 1 && <dodecahedronGeometry args={[0.38, 0]} />}
        {nodeIndex === 2 && <sphereGeometry args={[0.36, 16, 16]} />}
        <meshStandardMaterial
          color={nodeColor}
          roughness={0.65}
          metalness={0.05}
          flatShading={nodeIndex !== 2}
        />
      </mesh>

      {/* Focus & Active Indicator Ring in #3D52A0 */}
      {showFocusRing && (
        <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.54, 0.59, 32]} />
          <meshBasicMaterial
            color="#3D52A0"
            side={THREE.DoubleSide}
            transparent
            opacity={0.9}
          />
        </mesh>
      )}

      {/* Floating 3D Node Marker Halo */}
      <mesh
        ref={haloRef}
        position={[0, 0.65, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(feature.id);
        }}
        onPointerOver={() => {
          setIsHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setIsHovered(false);
          document.body.style.cursor = 'default';
        }}
      >
        <octahedronGeometry args={[0.12, 0]} />
        <meshStandardMaterial
          color={isActive ? '#3D52A0' : '#7091E6'}
          roughness={0.65}
          metalness={0.05}
        />
      </mesh>
    </group>
  );
};
