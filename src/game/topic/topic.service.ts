import { Injectable } from '@nestjs/common';
import { RANDOM_THEMES } from './constants/topic.constant';
import { WaitingStore } from 'src/waiting/waiting.store';
import { GamePhase, GameState } from 'src/game-state/interfaces/game-state.interface';
import type { PhaseDisconnectResult } from '../interfaces/game-disconnect.interface';

@Injectable()
export class TopicService {
  constructor(private readonly waitingState: WaitingStore) {}

  // 랜덤 주제자 선정
  async buildThemeSelectionContext(roomId: number) {
    const players = await this.waitingState.getPlayers(roomId);
    if (!players.length) return null;

    const selector = players[Math.floor(Math.random() * players.length)];

    return {
      selectorId: selector.userId,
      selectorNickname: selector.nickname,
    };
  }

  // 랜덤 주제 가져오기
  getAllThemes(): string[] {
    return RANDOM_THEMES;
  }

  /**
   * THEME_SELECTING 페이즈에서 disconnect 발생 시 순수 비즈니스 로직으로 결과 도출.
   * - Selector 퇴장: 시스템이 랜덤 주제 선택 후 shouldAdvance: true 반환
   * - 일반 참가자 퇴장: phaseContext 유지, shouldAdvance: false 반환
   *
   * DB/Redis I/O 없이 결과만 반환한다.
   */
  computeDisconnect(params: { state: GameState; userId: number }): PhaseDisconnectResult | null {
    const { state, userId } = params;

    if (state.phase !== GamePhase.THEME_SELECTING) return null;

    const ctx = state.phaseContext;
    if (!ctx || ctx.kind !== GamePhase.THEME_SELECTING) return null;

    const isSelectorDisconnected = ctx.selectorId === userId;

    if (isSelectorDisconnected) {
      // Selector 퇴장 → 시스템이 랜덤 주제를 선택하고 즉시 DRAWING으로 전환
      const selectedTopic = this.pickRandomTheme(state.recentThemes ?? []);

      return {
        nextPhaseContext: ctx, // DRAWING 전환 시 덮어쓰므로 기존 유지
        shouldAdvance: true,
        playerUpdate: { userId, changes: { isConnected: false } },
        transitionPayload: {
          selectedTopic,
          selectedBy: 'system',
        },
      };
    }

    // 일반 참가자 퇴장 → selector 관련 상태 영향 없음, 현재 컨텍스트 유지
    return {
      nextPhaseContext: ctx,
      shouldAdvance: false,
      playerUpdate: { userId, changes: { isConnected: false } },
    };
  }

  /**
   * recentThemes를 제외한 풀에서 랜덤 주제 하나를 선택한다.
   */
  private pickRandomTheme(recentThemes: string[]): string {
    const candidates = RANDOM_THEMES.filter((t) => !recentThemes.includes(t));
    const pool = candidates.length > 0 ? candidates : RANDOM_THEMES;
    return pool[Math.floor(Math.random() * pool.length)];
  }
}
