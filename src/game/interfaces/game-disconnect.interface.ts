import { PhaseContext } from 'src/game-state/interfaces/game-state.interface';
import { RoomUpdatePlayerPayload } from './game.interface';

export interface PhaseDisconnectResult {
  nextPhaseContext: PhaseContext;
  shouldAdvance: boolean;
  playerUpdate?: RoomUpdatePlayerPayload;
  transitionPayload?: {
    selectedTopic?: string;
    selectedBy?: 'selector' | 'system';
  };
}
