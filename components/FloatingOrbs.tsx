import React, { useRef, useMemo, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store';
import { AppPhase } from '../types';
import { randomSpherePoint } from '../utils/math';

const COUNT = 150;
const tempObj = new THREE.Object3D();
const tempColor = new THREE.Color();
const tempVec = new THREE.Vector3();

export const FloatingOrbs: React.FC = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const phase = useStore((state) => state.phase);
  
  // Data for each instance
  const particles = useMemo(() => {
    return new Array(COUNT).fill(0).map(() => {
      // Chaos/Target logic
      // Target: A ring/cloud around the center
      const angle = Math.random() * Math.PI * 2;
      const radius = 3 + Math.random() * 5;
      const height = -2 + Math.random() * 8;
      
      const targetPos = new THREE.Vector3(
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      );

      const scale = 0.2 + Math.random() * 0.4;
      const speed = 0.2 + Math.random() * 0.5;
      const timeOffset = Math.random() * 100;
      
      // Romantic Color Palette
      const colors = [
        '#ffd700', // Gold
        '#ff006e', // Hot Pink
        '#ffb7b2', // Soft Pink
        '#ffffff'  // White
      ];
      const color = colors[Math.floor(Math.random() * colors.length)];

      return {
        targetPos,
        currentPos: new THREE.Vector3(0, 0, 0), // Start inside box
        velocity: new THREE.Vector3(0, 0, 0),
        scale,
        speed,
        timeOffset,
        color
      };
    });
  }, []);

  useLayoutEffect(() => {
    if (meshRef.current) {
      particles.forEach((p, i) => {
        tempColor.set(p.color);
        meshRef.current!.setColorAt(i, tempColor);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
      meshRef.current.instanceColor!.needsUpdate = true;
    }
  }, [particles]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const time = state.clock.elapsedTime;
    const isEmerging = phase === AppPhase.EMERGING;
    const isCelebration = phase === AppPhase.CELEBRATION;
    const isResetting = phase === AppPhase.RESETTING;
    const isIdle = phase === AppPhase.IDLE;

    particles.forEach((p, i) => {
      // Position Logic
      if (isIdle || phase === AppPhase.ACTIVATING || phase === AppPhase.LIGHTING_UP || phase === AppPhase.OPENING) {
        // Inside box, maybe slight jitter
        p.currentPos.lerp(new THREE.Vector3(0, 0, 0), delta * 5);
      } else if (isEmerging) {
        // Explosion out
        // Move towards target fast with easing
        p.currentPos.lerp(p.targetPos, delta * 2);
      } else if (isCelebration) {
        // Float around target using sine waves (Perlin-ish)
        const hoverX = Math.sin(time * p.speed + p.timeOffset) * 0.5;
        const hoverY = Math.cos(time * p.speed * 0.5 + p.timeOffset) * 0.5;
        const hoverZ = Math.sin(time * p.speed * 0.3 + p.timeOffset) * 0.5;
        
        tempVec.copy(p.targetPos).add(new THREE.Vector3(hoverX, hoverY, hoverZ));
        p.currentPos.lerp(tempVec, delta);
      } else if (isResetting) {
        // Suck back in
        p.currentPos.lerp(new THREE.Vector3(0, 0, 0), delta * 4);
      }

      // Update Matrix
      tempObj.position.copy(p.currentPos);
      
      // Scale logic: zero if inside box (hidden), normal otherwise
      let targetScale = p.scale;
      if (isIdle || phase === AppPhase.ACTIVATING || phase === AppPhase.LIGHTING_UP || phase === AppPhase.OPENING || isResetting) {
          if (p.currentPos.distanceTo(new THREE.Vector3(0,0,0)) < 0.5) targetScale = 0;
      }
      
      const dist = p.currentPos.length();
      if(dist < 1) targetScale = dist * p.scale; 

      tempObj.scale.setScalar(targetScale);
      tempObj.rotation.set(time * 0.5, time * 0.3, 0); // Tumbling
      
      tempObj.updateMatrix();
      meshRef.current!.setMatrixAt(i, tempObj.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]} castShadow receiveShadow>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial 
        roughness={0.1} 
        metalness={0.5} 
        emissive="#ff69b4" 
        emissiveIntensity={0.5} 
        toneMapped={false} 
      />
    </instancedMesh>
  );
};