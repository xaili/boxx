import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader } from '@react-three/drei';
import { Experience } from './components/Experience';
import { useStore } from './store';
import { AppPhase } from './types';

const UIOverlay: React.FC = () => {
  const phase = useStore((state) => state.phase);
  const reset = useStore((state) => state.reset);
  const nextPhase = useStore((state) => state.nextPhase);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-10 font-sans text-gray-800">
      
      {/* Header/Title - Fades out when active */}
      <div className={`absolute top-10 transition-opacity duration-1000 ${phase !== AppPhase.IDLE ? 'opacity-0' : 'opacity-100'}`}>
        <h1 className="text-4xl md:text-6xl font-extralight tracking-[0.2em] text-center text-transparent bg-clip-text bg-gradient-to-b from-pink-500 to-red-500 drop-shadow-sm">
          A SURPRISE AWAITS
        </h1>
        <p className="text-center mt-4 text-pink-800 text-sm tracking-widest uppercase opacity-70">
          Turn up your volume & click the box
        </p>
      </div>

      {/* Start Hint - Blinking */}
      {phase === AppPhase.IDLE && (
         <div className="absolute bottom-20 animate-pulse text-pink-600 tracking-widest text-xs opacity-70">
            TAP THE BOX TO BEGIN
         </div>
      )}

      {/* Reset Button - Only in Celebration */}
      {phase === AppPhase.CELEBRATION && (
        <div className="absolute bottom-20 pointer-events-auto transition-all duration-700 transform translate-y-0 opacity-100">
          <button 
            onClick={reset}
            className="px-8 py-3 bg-white/30 backdrop-blur-md border border-white/50 rounded-full text-pink-900 font-bold tracking-widest hover:bg-white/50 transition-colors uppercase text-sm shadow-lg"
          >
            Replay Experience
          </button>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <div className="w-full h-screen bg-[#ffe4e1]">
      <UIOverlay />
      <Canvas shadows dpr={[1, 2]}>
        <Suspense fallback={null}>
          <Experience />
        </Suspense>
      </Canvas>
      <Loader 
        containerStyles={{ backgroundColor: '#ffe4e1' }}
        innerStyles={{ width: '200px', height: '2px', backgroundColor: '#eeb' }}
        barStyles={{ height: '2px', backgroundColor: '#ff006e' }}
        dataStyles={{ color: '#ff006e', fontSize: '12px', fontFamily: 'sans-serif' }}
      />
    </div>
  );
};

export default App;