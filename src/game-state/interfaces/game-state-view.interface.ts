import { GamePhase, type GameState } from './game-state.interface';

export interface RoomReadySummaryPayload {
  phase: GamePhase;
  readyCount: number;
  totalCount: number;
  allReady: boolean;
}

export interface RoomPhasePlayerSnapshot {
  userId: number;
  isReady: boolean;
}

export interface RoomPhaseSnapshotPayload {
  players: RoomPhasePlayerSnapshot[];
  readySummary: RoomReadySummaryPayload;
}

export interface RoomUpdateGameStatePayload extends Partial<GameState> {
  phase: GamePhase;
  reason?: string;
  finalResults?: Array<{ userId: number; score: number; placement: number }>;
  finalRewards?: Record<string, unknown>;
  snapshot?: RoomPhaseSnapshotPayload;
}
