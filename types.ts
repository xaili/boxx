export enum AppPhase {
  IDLE = 'IDLE',
  ACTIVATING = 'ACTIVATING',
  LIGHTING_UP = 'LIGHTING_UP',
  OPENING = 'OPENING',
  EMERGING = 'EMERGING',
  CELEBRATION = 'CELEBRATION',
  RESETTING = 'RESETTING'
}

export interface AppState {
  phase: AppPhase;
  audioEnabled: boolean;
  setPhase: (phase: AppPhase) => void;
  toggleAudio: () => void;
  nextPhase: () => void;
  reset: () => void;
}
