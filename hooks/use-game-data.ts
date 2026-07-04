"use client";

import { useCallback, useEffect, useState } from "react";
import type { AppState, GameKey, Player, Question } from "@/types";
import {
  getCurrentPlayer,
  getCurrentPlayerId,
  getGameResult,
  getInitialState,
  getLobbySnapshot,
  getQuestions,
  getRankingSnapshot,
  isGameOpen,
  loadState,
  registerPlayer,
  submitGameResult,
  toggleGameOpen,
  triggerBingoScore,
  closeBingoGame,
  advanceQuizGroup,
  openQuizGroup,
  closeQuizGroup,
  subscribeToState
} from "@/lib/storage";

const STATE_REFRESH_INTERVAL_MS = Number(process.env.NEXT_PUBLIC_POLLING_INTERVAL) || 3000;
const STATE_CACHE_TTL_MS = 1500;
let appStateCache: { state: AppState; timestamp: number } | null = null;
let appStateRequest: Promise<AppState> | null = null;

async function loadCachedAppState(): Promise<AppState> {
  if (appStateCache && Date.now() - appStateCache.timestamp < STATE_CACHE_TTL_MS) {
    return appStateCache.state;
  }
  if (appStateRequest) return appStateRequest;

  appStateRequest = loadState();
  try {
    const state = await appStateRequest;
    appStateCache = { state, timestamp: Date.now() };
    return state;
  } finally {
    appStateRequest = null;
  }
}

function startJitteredPolling(callback: () => void, intervalMs: number): () => void {
  let timer: number | null = null;
  let stopped = false;

  const schedule = () => {
    const jitter = intervalMs * 0.2 * (Math.random() * 2 - 1);
    timer = window.setTimeout(() => {
      if (document.visibilityState !== "hidden") callback();
      if (!stopped) schedule();
    }, Math.max(500, Math.round(intervalMs + jitter)));
  };

  schedule();
  return () => {
    stopped = true;
    if (timer !== null) window.clearTimeout(timer);
  };
}

export function useAppState(intervalMs?: number) {
  const [state, setState] = useState<AppState>(getInitialState());
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const newState = await loadCachedAppState();
    setState(newState);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const unsubscribe = subscribeToState(() => {
      appStateCache = null;
      refresh();
    });

    const stopPolling = startJitteredPolling(refresh, intervalMs || STATE_REFRESH_INTERVAL_MS);
    return () => {
      unsubscribe();
      stopPolling();
    };
  }, [refresh, intervalMs]);

  return { state, refresh, loading };
}

export function useCurrentPlayer() {
  const [player, setPlayer] = useState<Player | null>(null);
  const [playerId, setPlayerId] = useState<string | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const id = await getCurrentPlayerId();
      setPlayerId(id);
      if (!id) {
        setPlayer(null);
        return;
      }
      const p = await getCurrentPlayer();
      setPlayer(p);
    } catch {
      setPlayer(null);
      setPlayerId(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const unsubscribe = subscribeToState(refresh);

    const stopPolling = startJitteredPolling(refresh, STATE_REFRESH_INTERVAL_MS);
    return () => {
      unsubscribe();
      stopPolling();
    };
  }, [refresh]);

  return { player, playerId, refresh, loading };
}

export function useRegisterPlayer() {
  return registerPlayer;
}

export type QuestionsState = Question[] & {
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export function useQuestions(gameKey: GameKey): QuestionsState {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    let lastError: unknown = null;

    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        const q = await getQuestions(gameKey);
        if (q.length > 0) {
          setQuestions(q);
          setError(null);
          setLoading(false);
          return;
        }
        lastError = new Error(`${gameKey} 题库为空`);
      } catch (err) {
        lastError = err;
        console.error(`❌ useQuestions 加载 ${gameKey} 题库失败，第 ${attempt} 次:`, err);
      }

      if (attempt < 3) {
        await new Promise((resolve) => window.setTimeout(resolve, 600));
      }
    }

    setQuestions([]);
    setError(lastError instanceof Error ? lastError.message : "题库加载失败");
    setLoading(false);
  }, [gameKey]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // 语言切换后重新拉取，使题目跟随当前语言（ua 头由 pb.beforeSend 注入）。
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.addEventListener("annual-game-locale-change", refresh);
    return () => window.removeEventListener("annual-game-locale-change", refresh);
  }, [refresh]);

  useEffect(() => {
    if (loading || questions.length > 0) return;
    const timer = window.setTimeout(() => {
      refresh();
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [error, loading, questions.length, refresh]);

  return Object.assign([...questions], { loading, error, refresh });
}

export function useGameStatus(gameKey: GameKey) {
  const [open, setOpen] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const isOpenVal = await isGameOpen(gameKey);
    setOpen(isOpenVal);
    setLoading(false);
  }, [gameKey]);

  useEffect(() => {
    refresh();
    const unsubscribe = subscribeToState(refresh);

    const stopPolling = startJitteredPolling(refresh, STATE_REFRESH_INTERVAL_MS);
    return () => {
      unsubscribe();
      stopPolling();
    };
  }, [refresh]);

  return open;
}

export function useSubmitGameResult() {
  return submitGameResult;
}

export function useExistingResult(playerId: string | null | undefined, gameKey: GameKey) {
  const [exists, setExists] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (playerId) {
      const result = await getGameResult(playerId, gameKey);
      setExists(Boolean(result));
    }
    setLoading(false);
  }, [playerId, gameKey]);

  useEffect(() => {
    refresh();
    const unsubscribe = subscribeToState(refresh);

    const stopPolling = startJitteredPolling(refresh, STATE_REFRESH_INTERVAL_MS);
    return () => {
      unsubscribe();
      stopPolling();
    };
  }, [refresh]);

  return exists;
}

export function useLobbySnapshot(playerId: string | null | undefined) {
  const [snapshot, setSnapshot] = useState<Awaited<ReturnType<typeof getLobbySnapshot>> | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      if (playerId) {
        const s = await getLobbySnapshot(playerId);
        setSnapshot(s);
      } else {
        setSnapshot(null);
      }
    } catch {
      setSnapshot(null);
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  useEffect(() => {
    refresh();
    const unsubscribe = subscribeToState(refresh);
    const stopPolling = startJitteredPolling(refresh, STATE_REFRESH_INTERVAL_MS);
    return () => {
      unsubscribe();
      stopPolling();
    };
  }, [refresh]);

  return { snapshot, refresh, loading };
}

function getEmptyRankingSnapshot(): Awaited<ReturnType<typeof getRankingSnapshot>> {
  return {
    players: [],
    games: [],
    results: [],
    top10: [],
    officeAverage: [],
    officeTop3: [],
    context: null
  };
}

export function useRanking(playerId?: string | null, intervalMs?: number) {
  const [ranking, setRanking] = useState<Awaited<ReturnType<typeof getRankingSnapshot>>>(() => getEmptyRankingSnapshot());
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const r = await getRankingSnapshot(playerId);
      setRanking(r);
    } catch (error) {
      console.error("❌ useRanking 加载数据库排行榜失败:", error);
      setRanking(getEmptyRankingSnapshot());
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  useEffect(() => {
    refresh();
    const unsubscribe = subscribeToState(refresh);

    const stopPolling = startJitteredPolling(refresh, intervalMs || STATE_REFRESH_INTERVAL_MS);
    return () => {
      unsubscribe();
      stopPolling();
    };
  }, [refresh, intervalMs]);

  return { ranking, refresh, loading };
}

export function useAdminActions() {
  return { toggleGameOpen, triggerBingoScore, closeBingoGame, advanceQuizGroup, openQuizGroup, closeQuizGroup };
}
