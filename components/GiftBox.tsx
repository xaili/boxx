import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useCursor } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../store';
import { AppPhase } from '../types';

export const GiftBox: React.FC = () => {
  const phase = useStore((state) => state.phase);
  const lidGroup = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const boxRef = useRef<THREE.Group>(null);
  const nextPhase = useStore((state) => state.nextPhase);
  const [hovered, setHover] = useState(false);

  // Change cursor on hover
  useCursor(hovered);

  // Procedurally creating a "velvet" like material look
  // Changed to Deep Romantic Red/Ruby
  const velvetMaterial = new THREE.MeshStandardMaterial({
    color: '#900C3F', // Deep Ruby Red
    roughness: 0.6,
    metalness: 0.2,
  });

  const goldMaterial = new THREE.MeshStandardMaterial({
    color: '#ffd700',
    roughness: 0.2,
    metalness: 0.9,
  });

  useFrame((state, delta) => {
    if (!lidGroup.current || !lightRef.current || !boxRef.current) return;

    // Opening Animation
    if (phase === AppPhase.OPENING || phase === AppPhase.EMERGING || phase === AppPhase.CELEBRATION) {
      // Lerp lid rotation to ~95 degrees
      lidGroup.current.rotation.x = THREE.MathUtils.lerp(lidGroup.current.rotation.x, -Math.PI / 1.8, delta * 2);
      
      // Increase internal light
      lightRef.current.intensity = THREE.MathUtils.lerp(lightRef.current.intensity, 8, delta * 3);

      // Trigger next phase once open enough
      if (phase === AppPhase.OPENING && lidGroup.current.rotation.x < -1.5) {
        nextPhase();
      }
    } else if (phase === AppPhase.RESETTING || phase === AppPhase.IDLE) {
      // Close lid
      lidGroup.current.rotation.x = THREE.MathUtils.lerp(lidGroup.current.rotation.x, 0, delta * 3);
      lightRef.current.intensity = THREE.MathUtils.lerp(lightRef.current.intensity, 0, delta * 5);
    }
    
    // Floating effect for the whole box in IDLE
    if (phase === AppPhase.IDLE) {
      boxRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
      boxRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    } else {
        // Stabilize
      boxRef.current.position.y = THREE.MathUtils.lerp(boxRef.current.position.y, 0, delta * 2);
      boxRef.current.rotation.y = THREE.MathUtils.lerp(boxRef.current.rotation.y, 0, delta * 2);
    }
  });

  const handleClick = () => {
    if (phase === AppPhase.IDLE) {
      useStore.getState().nextPhase(); // Go to ACTIVATING
    }
  };

  return (
    <group 
      ref={boxRef} 
      onClick={handleClick} 
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      {/* Internal Light - Golden Glow */}
      <pointLight ref={lightRef} position={[0, 0.5, 0]} color="#ffaa00" distance={8} decay={2} intensity={0} />

      {/* Base */}
      <mesh position={[0, 0, 0]} material={velvetMaterial} castShadow receiveShadow>
        <boxGeometry args={[2, 2, 2]} />
      </mesh>
      {/* Gold Ribbon Vertical */}
      <mesh position={[0, 0, 0]} material={goldMaterial}>
        <boxGeometry args={[2.05, 2, 0.3]} />
      </mesh>
      <mesh position={[0, 0, 0]} material={goldMaterial}>
        <boxGeometry args={[0.3, 2, 2.05]} />
      </mesh>

      {/* Lid Group - Pivot at the back edge */}
      <group ref={lidGroup} position={[0, 1, -1]}>
        {/* The Lid Itself (offset so pivot works) */}
        <group position={[0, 0.25, 1]}>
             <mesh material={velvetMaterial} castShadow receiveShadow>
                <boxGeometry args={[2.1, 0.5, 2.1]} />
            </mesh>
            {/* Lid Ribbon */}
            <mesh material={goldMaterial}>
                <boxGeometry args={[2.15, 0.52, 0.3]} />
            </mesh>
            <mesh material={goldMaterial}>
                <boxGeometry args={[0.3, 0.52, 2.15]} />
            </mesh>
            {/* Bow */}
            <mesh position={[0, 0.5, 0]} material={goldMaterial}>
                <torusKnotGeometry args={[0.4, 0.1, 100, 16]} />
            </mesh>
        </group>
      </group>
    </group>
  );
};