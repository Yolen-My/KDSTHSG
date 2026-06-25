import type { Game, GameKey, Player, Question } from "@/types";

export const PLAYER_ID_KEY = "annual_game_player_id_v2";
export const PLAYER_PHONE_KEY = "annual_game_player_phone_v2";
export const PLAYER_CACHE_KEY = "annual_game_player_cache_v2";
export const STATE_KEY = "annual_game_demo_state_v3";

export const OFFICES = ["北京", "上海", "深圳", "香港"];
export const TEAMS = ["Alpha", "Beta", "Gamma", "Delta"];

export const GAME_ORDER: GameKey[] = ["bingo", "quiz", "story", "elimination"];

export const GAME_DISPLAY_NAMES: Record<GameKey, string> = {
  bingo: "预言家验词",
  quiz: "猎人快答",
  story: "狼人悍跳",
  elimination: "守卫者之夜"
};

export const GAMES: Game[] = [
  { id: "game-bingo", key: "bingo", name: GAME_DISPLAY_NAMES.bingo, maxScore: 100, isOpen: false, order: 1, bingoScored: false, bingoPhase: "open" },
  { id: "game-quiz", key: "quiz", name: GAME_DISPLAY_NAMES.quiz, maxScore: 100, isOpen: false, order: 2, quizCurrentGroup: 0, quizOpenGroups: [] },
  { id: "game-story", key: "story", name: GAME_DISPLAY_NAMES.story, maxScore: 100, isOpen: false, order: 3, quizOpenGroups: [] },
  { id: "game-elimination", key: "elimination", name: GAME_DISPLAY_NAMES.elimination, maxScore: 200, isOpen: false, order: 4, quizOpenGroups: [] }
];

export const QUESTIONS: Question[] = [];

export const SEED_PLAYERS: Player[] = [];
