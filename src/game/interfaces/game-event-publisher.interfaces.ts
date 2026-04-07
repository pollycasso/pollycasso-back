import { type RoomUpdatePlayerPayload } from './game.interface';
import {
  type RoomReadySummaryPayload,
  type RoomUpdateGameStatePayload,
} from 'src/game-state/interfaces/game-state-view.interface';

export const GAME_EVENT_PUBLISHER = Symbol('GAME_EVENT_PUBLISHER');

export interface IGameEventPublisher {
  broadcastGameState(roomId: number, payload: RoomUpdateGameStatePayload): void;
  broadcastPlayerUpdate(roomId: number, payload: RoomUpdatePlayerPayload): void;
  broadcastReadySummary(roomId: number, payload: RoomReadySummaryPayload): void;
  emitThemeConfirmed(roomId: number, theme: string): void;
}
