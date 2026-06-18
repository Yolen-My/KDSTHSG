import { calculateBingoSelection } from "@/lib/bingo-scoring";
import { GAME_ORDER } from "@/lib/constants";
import type { AppState, GameKey, GameResult } from "@/types";

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function settlePendingBingoResults(state: AppState, settledAt = new Date().toISOString()): AppState {
  const gameResults = state.gameResults.map((result) => {
    if (result.gameKey !== "bingo" || !result.pendingBingoScore) return result;
    const settled = calculateBingoSelection(state.questions, result.answers, result.score);
    return {
      ...result,
      answers: {
        ...result.answers,
        selectedWords: settled.selectedWords,
        targetWords: settled.targetWords,
        correctCount: settled.correctCount,
        pendingBingoScore: false
      },
      score: settled.score,
      pendingBingoScore: false
    };
  });

  // 为没有 Bingo 提交记录的玩家自动创建空 Bingo 记录（review 页面可显示正确答案）
  const playersWithoutBingo = state.players.filter(
    (p) => !gameResults.some((r) => r.player === p.id && r.gameKey === "bingo")
  );
  for (const player of playersWithoutBingo) {
    const settled = calculateBingoSelection(state.questions, {}, 0);
    const autoResult: GameResult = {
      id: createId("result"),
      player: player.id,
      gameKey: "bingo",
      answers: {
        selectedWords: settled.selectedWords,
        targetWords: settled.targetWords,
        correctCount: settled.correctCount
      },
      score: 0,
      maxScore: 100,
      completedAt: settledAt,
      pendingBingoScore: false
    };
    gameResults.push(autoResult);
  }

  const players = state.players.map((player) => {
    const playerResults = gameResults.filter((result) => result.player === player.id && !result.pendingBingoScore);
    const completedGames = [...new Set(playerResults.map((result) => result.gameKey))] as GameKey[];
    const finalSubmitted = GAME_ORDER.every((key) => completedGames.includes(key));

    return {
      ...player,
      totalScore: playerResults.reduce((sum, result) => sum + result.score, 0),
      completedGames,
      finalSubmitted,
      finalCompletedAt: finalSubmitted ? player.finalCompletedAt || settledAt : player.finalCompletedAt,
      updated: settledAt
    };
  });

  return { ...state, players, gameResults };
}
