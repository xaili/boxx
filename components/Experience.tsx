import React, { useEffect } from 'react';
import { PerspectiveCamera, Environment, Sparkles, OrbitControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { GiftBox } from './GiftBox';
import { SpiralLight } from './SpiralLight';
import { FloatingOrbs } from './FloatingOrbs';
import { BirthdayText } from './BirthdayText';
import { Effects } from './Effects';
import { useStore } from '../store';
import { AppPhase } from '../types';

export const Experience: React.FC = () => {
  const phase = useStore((state) => state.phase);
  const nextPhase = useStore((state) => state.nextPhase);

  // Phase management sequencer
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (phase === AppPhase.EMERGING) {
      // Wait for explosion then celebrate
      timeout = setTimeout(() => {
        nextPhase(); // To CELEBRATION
      }, 2000);
    }

    return () => clearTimeout(timeout);
  }, [phase, nextPhase]);

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.5, 9]} fov={50} />
      <OrbitControls 
        enablePan={false}
        enableZoom={true}
        minDistance={5}
        maxDistance={15}
        target={[0, 0, 0]}
        maxPolarAngle={Math.PI / 1.8}
      />
      
      {/* Romantic Lighting */}
      <ambientLight intensity={0.8} color="#fff0f5" />
      <spotLight 
        position={[10, 10, 10]} 
        angle={0.15} 
        penumbra={1} 
        intensity={8} 
        color="#ffccd5" 
        castShadow 
      />
      <spotLight 
        position={[-10, 5, 10]} 
        angle={0.3} 
        penumbra={1} 
        intensity={5} 
        color="#ffb7b2" 
      />
      
      {/* Background Ambience */}
      <Sparkles count={300} scale={12} size={4} speed={0.4} opacity={0.6} color="#ffd700" />
      <Environment preset="sunset" />

      {/* Main Elements - Centered at world origin */}
      <group position={[0, 0, 0]}>
        <GiftBox />
        <SpiralLight />
        <FloatingOrbs />
        <BirthdayText />
      </group>

      {/* Floor Reflection - Positioned just below the box */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.05, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial 
            color="#ffe4e1" 
            roughness={0.2} 
            metalness={0.5}
        />
      </mesh>

      <Effects />
    </>
  );
};