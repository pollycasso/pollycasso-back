import { PhaseContext } from 'src/game-state/interfaces/game-state.interface';

export interface PhaseDisconnectResult {
  nextPhaseContext: PhaseContext;
  shouldAdvance: boolean;
  playerUpdate?: { userId: number; changes: { isConnected: boolean } };
  transitionPayload?: {
    selectedTopic?: string;
    selectedBy?: 'selector' | 'system';
  };
}
