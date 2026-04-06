import { GamePhase, type GameState } from 'src/game-state/interfaces/game-state.interface';
import {
  type RoomPhaseSnapshotPayload,
  type RoomReadySummaryPayload,
} from 'src/game-state/interfaces/game-state-view.interface';

type ReadySummarySource = Pick<GameState, 'phase' | 'phaseContext' | 'roomMemberIdByUserId'>;

function isActiveReadyPhaseContext(
  ctx: ReadySummarySource['phaseContext'],
): ctx is Extract<
  ReadySummarySource['phaseContext'],
  { kind: GamePhase.DRAWING | GamePhase.EVALUATING }
> {
  return !!ctx && (ctx.kind === GamePhase.DRAWING || ctx.kind === GamePhase.EVALUATING);
}

function isRoundSummaryPhaseContext(
  ctx: ReadySummarySource['phaseContext'],
): ctx is Extract<ReadySummarySource['phaseContext'], { kind: GamePhase.ROUND_SUMMARY }> {
  return !!ctx && ctx.kind === GamePhase.ROUND_SUMMARY;
}

function getReadyUserIds(state: ReadySummarySource): number[] {
  const ctx = state.phaseContext;
  if (isActiveReadyPhaseContext(ctx) || isRoundSummaryPhaseContext(ctx)) {
    return ctx.readyUserIds ?? [];
  }
  return [];
}

export function getReadySummaryFromState(state: ReadySummarySource): RoomReadySummaryPayload {
  switch (state.phase) {
    case GamePhase.DRAWING:
    case GamePhase.EVALUATING: {
      const ctx = state.phaseContext;
      if (!isActiveReadyPhaseContext(ctx)) {
        return { phase: state.phase, readyCount: 0, totalCount: 0 };
      }

      return {
        phase: state.phase,
        readyCount: ctx.readyUserIds.length,
        totalCount: ctx.activeUserIds.length,
      };
    }

    case GamePhase.ROUND_SUMMARY: {
      const ctx = state.phaseContext;
      return {
        phase: state.phase,
        readyCount: isRoundSummaryPhaseContext(ctx) ? ctx.readyUserIds.length : 0,
        totalCount: Object.keys(state.roomMemberIdByUserId ?? {}).length,
      };
    }

    default:
      return {
        phase: state.phase,
        readyCount: 0,
        totalCount: 0,
      };
  }
}

function getPhaseReadyTargetUserIds(state: ReadySummarySource): number[] {
  switch (state.phase) {
    case GamePhase.DRAWING:
    case GamePhase.EVALUATING: {
      const ctx = state.phaseContext;
      return isActiveReadyPhaseContext(ctx) ? [...ctx.activeUserIds] : [];
    }

    case GamePhase.ROUND_SUMMARY:
      return Object.keys(state.roomMemberIdByUserId ?? {}).map(Number);

    default:
      return [];
  }
}

export function buildPhaseSnapshotFromState(state: ReadySummarySource): RoomPhaseSnapshotPayload {
  const readySet = new Set<number>(getReadyUserIds(state));
  const targetUserIds = getPhaseReadyTargetUserIds(state);

  return {
    players: targetUserIds.map((userId) => ({
      userId,
      isReady: readySet.has(userId),
    })),
    readySummary: getReadySummaryFromState(state),
  };
}
