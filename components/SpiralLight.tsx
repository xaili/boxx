import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store';
import { AppPhase } from '../types';
import { generateSpiralPoints } from '../utils/math';

export const SpiralLight: React.FC = () => {
  const phase = useStore((state) => state.phase);
  const nextPhase = useStore((state) => state.nextPhase);
  const pointsRef = useRef<THREE.Points>(null);
  
  // Configuration
  const pointCount = 600;
  const positions = useMemo(() => {
    // Spiral configuration: 5 turns, height 6, radius 4.5
    const spiral = generateSpiralPoints(5, 6, pointCount / 5, 4.5);
    
    // Flatten for BufferAttribute
    const pos = new Float32Array(pointCount * 3);
    for (let i = 0; i < pointCount; i++) {
        const p = spiral[Math.min(i, spiral.length - 1)];
        pos[i * 3] = p.x;
        pos[i * 3 + 1] = p.y; // Centered at 0
        pos[i * 3 + 2] = p.z;
    }
    return pos;
  }, []);

  // Custom Shader Material
  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uProgress: { value: 0 }, // 0 to 1
      uColor1: { value: new THREE.Color('#ff006e') }, // Deep Pink
      uColor2: { value: new THREE.Color('#ffd700') }  // Gold
    },
    vertexShader: `
      attribute float aIndex;
      uniform float uTime;
      uniform float uProgress;
      varying vec3 vColor;
      
      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        
        // Size attenuation
        gl_PointSize = (100.0 / -mvPosition.z);
        
        // Visibility logic
        float totalPoints = ${pointCount}.0;
        float normalizedIndex = aIndex / totalPoints;
        
        // Hide if not yet reached by progress
        float visible = step(normalizedIndex, uProgress);
        
        // Scale down if not visible (or fade)
        gl_PointSize *= visible;
        
        // Color mix based on height/index
        vColor = mix(vec3(1.0, 0.0, 0.43), vec3(1.0, 0.84, 0.0), normalizedIndex);
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      void main() {
        // Circular particle
        vec2 uv = gl_PointCoord.xy - 0.5;
        float r = length(uv);
        if (r > 0.5) discard;
        
        // Soft glow
        float glow = 1.0 - (r * 2.0);
        glow = pow(glow, 2.0);
        
        gl_FragColor = vec4(vColor, glow);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  }), []);

  // Create attributes for the shader
  const indices = useMemo(() => {
    const arr = new Float32Array(pointCount);
    for (let i = 0; i < pointCount; i++) arr[i] = i;
    return arr;
  }, []);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      material.uniforms.uTime.value = state.clock.elapsedTime;
      
      // Rotate the whole spiral slowly
      pointsRef.current.rotation.y += delta * 0.2;

      // Logic for LIGHTING_UP phase
      if (phase === AppPhase.ACTIVATING || phase === AppPhase.LIGHTING_UP) {
        // Automatically transition to LIGHTING_UP if in ACTIVATING
        if (phase === AppPhase.ACTIVATING) {
           useStore.getState().setPhase(AppPhase.LIGHTING_UP); 
        }

        // Animate progress 0 -> 1
        const current = material.uniforms.uProgress.value;
        const target = 1.1; // Slightly over to ensure all are lit
        const speed = 0.5;
        
        material.uniforms.uProgress.value = THREE.MathUtils.lerp(current, target, delta * speed);

        // If complete, move to next phase
        if (current > 0.99 && phase === AppPhase.LIGHTING_UP) {
           nextPhase(); // Go to OPENING
        }
      } else if (phase === AppPhase.IDLE) {
          material.uniforms.uProgress.value = 0;
      } else {
        // Fade out spiral in later stages
         material.uniforms.uProgress.value = THREE.MathUtils.lerp(material.uniforms.uProgress.value, 0, delta * 2);
      }
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={pointCount} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-aIndex" count={pointCount} array={indices} itemSize={1} />
      </bufferGeometry>
      <primitive object={material} attach="material" />
    </points>
  );
};