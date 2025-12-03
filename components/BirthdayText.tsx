import React, { useRef, useState, useEffect } from 'react';
import { Text3D, Center } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store';
import { AppPhase } from '../types';

export const BirthdayText: React.FC = () => {
  const phase = useStore((state) => state.phase);
  const groupRef = useRef<THREE.Group>(null);
  const [show, setShow] = useState(false);
  const { viewport } = useThree();

  useEffect(() => {
    if (phase === AppPhase.CELEBRATION) {
      setShow(true);
    } else if (phase === AppPhase.RESETTING || phase === AppPhase.IDLE) {
      setShow(false);
    }
  }, [phase]);

  useFrame((state) => {
    if (groupRef.current) {
      // Calculate responsive scale based on viewport width
      // Base text width is approx 10-12 units.
      // If viewport width is small (e.g. mobile ~3-4), we need to scale down significantly.
      const responsiveScale = Math.min(1, viewport.width / 13);
      
      const targetY = 3.5;
      
      if (show) {
        groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.05);
        
        // Lerp scale to responsive target
        const currentScale = groupRef.current.scale.x;
        const newScale = THREE.MathUtils.lerp(currentScale, responsiveScale, 0.05);
        groupRef.current.scale.setScalar(newScale);
        
        // Bobbing
        groupRef.current.position.y += Math.sin(state.clock.elapsedTime * 2) * 0.005;
      } else {
        groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0, 0.1);
        groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, 0, 0.1));
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]} scale={[0, 0, 0]}>
      <Center>
        <Text3D
          font="https://threejs.org/examples/fonts/helvetiker_bold.typeface.json"
          size={1.2}
          height={0.2}
          curveSegments={12}
          bevelEnabled
          bevelThickness={0.02}
          bevelSize={0.02}
          bevelOffset={0}
          bevelSegments={5}
        >
          HAPPY BIRTHDAY
          <meshStandardMaterial
            color="#ffd700"
            metalness={0.8}
            roughness={0.2}
            emissive="#ff0055"
            emissiveIntensity={1.5}
            toneMapped={false}
          />
        </Text3D>
      </Center>
      <Center position={[0, -1.5, 0]}>
         <Text3D
          font="https://threejs.org/examples/fonts/helvetiker_bold.typeface.json"
          size={0.6}
          height={0.1}
          curveSegments={12}
        >
          Wishing you a magical year!
          <meshStandardMaterial 
            color="#ff69b4" 
            emissive="#ff1493" 
            emissiveIntensity={0.8} 
            toneMapped={false} 
          />
        </Text3D>
      </Center>
    </group>
  );
};