import { calculateBingoSelection } from "@/lib/bingo-scoring";
import { GAME_ORDER } from "@/lib/constants";
import type { AppState, GameKey } from "@/types";

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
