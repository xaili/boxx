import React from 'react';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

export const Effects: React.FC = () => {
  return (
    <EffectComposer enableNormalPass={false}>
      <Bloom 
        luminanceThreshold={1.0} // High threshold to only pick up emissive materials
        luminanceSmoothing={0.9} 
        height={300} 
        intensity={1.5} 
      />
      <Vignette
        offset={0.3}
        darkness={0.4} // Reduced darkness for lighter theme
        eskil={false}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  );
};