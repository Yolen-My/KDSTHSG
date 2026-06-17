import type { Game, GameKey, Player, Question } from "@/types";

export const PLAYER_ID_KEY = "annual_game_player_id_v2";
export const PLAYER_PHONE_KEY = "annual_game_player_phone_v2";
export const PLAYER_CACHE_KEY = "annual_game_player_cache_v2";
export const STATE_KEY = "annual_game_demo_state_v3";

export const OFFICES = ["北京", "上海", "深圳", "香港"];
export const TEAMS = ["Alpha", "Beta", "Gamma", "Delta"];

export const GAME_ORDER: GameKey[] = ["bingo", "quiz", "story", "elimination"];

export const GAMES: Game[] = [
  { id: "game-bingo", key: "bingo", name: "Bingo 猜词", maxScore: 100, isOpen: false, order: 1, bingoScored: false, bingoPhase: "open" },
  { id: "game-quiz", key: "quiz", name: "Sector Quiz", maxScore: 100, isOpen: false, order: 2, quizCurrentGroup: 0, quizOpenGroups: [] },
  { id: "game-story", key: "story", name: "真假故事", maxScore: 100, isOpen: false, order: 3 },
  { id: "game-elimination", key: "elimination", name: "站立淘汰", maxScore: 100, isOpen: false, order: 4 }
];

export const QUESTIONS: Question[] = [];

export const SEED_PLAYERS: Player[] = [
  { id: "seed-1", name: "李明", phone: "13900000001", office: "上海", team: "Alpha", totalScore: 360, completedGames: GAME_ORDER, finalSubmitted: true, created: "2026-01-01T09:00:00.000Z", updated: "2026-01-01T09:20:00.000Z", finalCompletedAt: "2026-01-01T09:20:00.000Z" },
  { id: "seed-2", name: "刘洋", phone: "13900000002", office: "北京", team: "Beta", totalScore: 330, completedGames: GAME_ORDER, finalSubmitted: true, created: "2026-01-01T09:01:00.000Z", updated: "2026-01-01T09:23:00.000Z", finalCompletedAt: "2026-01-01T09:23:00.000Z" },
  { id: "seed-3", name: "周琳", phone: "13900000003", office: "深圳", team: "Gamma", totalScore: 310, completedGames: GAME_ORDER, finalSubmitted: true, created: "2026-01-01T09:02:00.000Z", updated: "2026-01-01T09:18:00.000Z", finalCompletedAt: "2026-01-01T09:18:00.000Z" },
  { id: "seed-4", name: "陈一", phone: "13900000004", office: "香港", team: "Delta", totalScore: 280, completedGames: ["bingo", "quiz", "story"], finalSubmitted: false, created: "2026-01-01T09:03:00.000Z", updated: "2026-01-01T09:18:00.000Z" }
];
