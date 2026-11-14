import React, { useRef, useEffect, useState, Component, ErrorInfo, ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { CentralSculpture } from './CentralSculpture';
import { FloorRings } from './FloorRings';
import { SpatialNode } from './SpatialNode';
import { WebGLFallback } from './WebGLFallback';
import { FEATURES } from '../data/demoScenario';
import { FeatureId } from '../types/accessibility';

interface Scene3DProps {
  activeFeature: FeatureId | null;
  onFeatureSelect: (feature: FeatureId | null) => void;
  isCalm: boolean;
}

// Camera framing coordinates for each feature node
const CAMERA_TARGETS: Record<string, { pos: [number, number, number]; look: [number, number, number] }> = {
  default: {
    pos: [0, 1.2, 5.6],
    look: [0, 0, 0],
  },
  'what-if-pathways': {
    pos: [-1.8, 0.6, 3.4],
    look: [-2.0, 0.3, 0.5],
  },
  'live-sign-captions': {
    pos: [1.8, 1.0, 3.2],
    look: [2.0, 0.6, -0.5],
  },
  'vernacular-bridge': {
    pos: [0.2, -0.6, 4.0],
    look: [0.2, -1.4, 1.5],
  },
};

const CameraController: React.FC<{
  activeFeature: FeatureId | null;
  isCalm: boolean;
}> = ({ activeFeature, isCalm }) => {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);

  // Target vectors
  const targetPos = useRef(new THREE.Vector3(...CAMERA_TARGETS.default.pos));
  const targetLook = useRef(new THREE.Vector3(...CAMERA_TARGETS.default.look));
  const currentLook = useRef(new THREE.Vector3(...CAMERA_TARGETS.default.look));

  useEffect(() => {
    const config = activeFeature ? CAMERA_TARGETS[activeFeature] : CAMERA_TARGETS.default;
    targetPos.current.set(...config.pos);
    targetLook.current.set(...config.look);

    if (isCalm) {
      // In calm mode, snap immediately without camera sweep animation
      camera.position.set(...config.pos);
      if (controlsRef.current) {
        controlsRef.current.target.set(...config.look);
        controlsRef.current.update();
      }
      currentLook.current.set(...config.look);
    }
  }, [activeFeature, isCalm, camera]);

  useFrame((_, delta) => {
    if (!isCalm) {
      // Smooth damped lerp towards framing target
      const lerpSpeed = Math.min(delta * 2.8, 1);
      camera.position.lerp(targetPos.current, lerpSpeed);
      currentLook.current.lerp(targetLook.current, lerpSpeed);

      if (controlsRef.current) {
        controlsRef.current.target.copy(currentLook.current);
        controlsRef.current.update();
      } else {
        camera.lookAt(currentLook.current);
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableRotate={!isCalm}
      enableZoom={!isCalm}
      minDistance={3.2}
      maxDistance={8.0}
      minPolarAngle={Math.PI / 4}
      maxPolarAngle={Math.PI / 2 + 0.12}
      dampingFactor={0.06}
      rotateSpeed={0.5}
      zoomSpeed={0.6}
    />
  );
};

// Error Boundary for WebGL initialization or context losses
interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class WebGLErrorBoundary extends Component<
  { children: ReactNode; fallback: (error: string) => ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode; fallback: (error: string) => ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('WebGL Rendering Encountered Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback(this.state.errorMessage);
    }
    return this.props.children;
  }
}

export const Scene3D: React.FC<Scene3DProps> = ({
  activeFeature,
  onFeatureSelect,
  isCalm,
}) => {
  const [webglSupported, setWebglSupported] = useState<boolean>(true);

  useEffect(() => {
    // Quick hardware context check
    try {
      const canvas = document.createElement('canvas');
      const gl =
        canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setWebglSupported(false);
      }
    } catch {
      setWebglSupported(false);
    }
  }, []);

  if (!webglSupported) {
    return (
      <WebGLFallback
        activeFeature={activeFeature}
        onFeatureSelect={onFeatureSelect}
        reason="WebGL is not supported or was disabled by user/browser preference"
      />
    );
  }

  return (
    <WebGLErrorBoundary
      fallback={(error) => (
        <WebGLFallback
          activeFeature={activeFeature}
          onFeatureSelect={onFeatureSelect}
          reason={error || '3D scene failed to initialize cleanly'}
        />
      )}
    >
      <div
        className="relative w-full h-full min-h-[500px]"
        role="region"
        aria-label="AetherLens 3D Interactive Spatial Environment"
      >
        <Canvas
          camera={{ position: [0, 1.2, 5.6], fov: 45 }}
          className="w-full h-full block"
          gl={{ antialias: true, alpha: false, powerPreference: 'default' }}
          onPointerMissed={() => {
            // Clicking canvas background deselects or resets feature focus
            onFeatureSelect(null);
          }}
        >
          {/* Exact Palette: Scene background & Fog in #EDE8F5 */}
          <color attach="background" args={['#EDE8F5']} />
          <fog attach="fog" args={['#EDE8F5', 6, 15]} />

          {/* Gentle Lighting: soft ambient & #7091E6 directional */}
          <ambientLight intensity={1.1} />
          <directionalLight
            position={[4, 7, 5]}
            intensity={1.2}
            color="#7091E6"
          />
          <directionalLight
            position={[-4, -2, -3]}
            intensity={0.4}
            color="#ADBBDA"
          />

          {/* Central Architectural & Interaction Anchors */}
          <CentralSculpture isCalm={isCalm} />
          <FloorRings isCalm={isCalm} />

          {/* Orbiting Interactive Spatial Nodes */}
          {FEATURES.map((feature, idx) => (
            <SpatialNode
              key={feature.id}
              feature={feature}
              isActive={activeFeature === feature.id}
              isCalm={isCalm}
              onSelect={onFeatureSelect}
              nodeIndex={idx}
            />
          ))}

          {/* Bounded, Damped Camera Controller */}
          <CameraController activeFeature={activeFeature} isCalm={isCalm} />
        </Canvas>
      </div>
    </WebGLErrorBoundary>
  );
};
