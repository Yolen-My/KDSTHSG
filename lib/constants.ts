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

export const SEED_PLAYERS: Player[] = [];
