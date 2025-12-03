import { create } from 'zustand';
import { AppPhase, AppState } from './types';

export const useStore = create<AppState>((set, get) => ({
  phase: AppPhase.IDLE,
  audioEnabled: false,
  setPhase: (phase) => set({ phase }),
  toggleAudio: () => set((state) => ({ audioEnabled: !state.audioEnabled })),
  nextPhase: () => {
    const current = get().phase;
    switch (current) {
      case AppPhase.IDLE:
        set({ phase: AppPhase.ACTIVATING });
        break;
      case AppPhase.ACTIVATING:
        set({ phase: AppPhase.LIGHTING_UP });
        break;
      case AppPhase.LIGHTING_UP:
        set({ phase: AppPhase.OPENING });
        break;
      case AppPhase.OPENING:
        set({ phase: AppPhase.EMERGING });
        break;
      case AppPhase.EMERGING:
        set({ phase: AppPhase.CELEBRATION });
        break;
      case AppPhase.CELEBRATION:
        // Celebration continues until manual reset
        break;
      case AppPhase.RESETTING:
        set({ phase: AppPhase.IDLE });
        break;
    }
  },
  reset: () => set({ phase: AppPhase.RESETTING }),
}));
