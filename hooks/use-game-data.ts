"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AppState, GameKey, Player, Question } from "@/types";
import {
  getCurrentPlayer,
  getCurrentPlayerId,
  getGameResult,
  getInitialState,
  getLobbySnapshot,
  getQuestions,
  getQuizSessionSnapshot,
  getRankingSnapshot,
  isGameOpen,
  loadGamesOnly,
  loadState,
  registerPlayer,
  submitGameResult,
  toggleGameOpen,
  triggerBingoScore,
  closeBingoGame,
  advanceQuizGroup,
  openQuizGroup,
  closeQuizGroup,
  subscribeToState,
  isRealtimeSubscribed,
} from "@/lib/storage";

// ============================================================================
// P0-2 / P1-2: 轮询策略
// ============================================================================
const FALLBACK_POLLING_MS = 30000;
const PLAYER_POLLING_MS = 5000;
const GAME_POLLING_MS = 10000;

function jitteredInterval(base: number): number {
  return base + Math.floor(Math.random() * (base / 2));
}

function usePollingWithVisibility(
  refresh: () => void,
  getInterval: () => number
) {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;

  const setup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const interval = jitteredInterval(getInterval());
    timerRef.current = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") {
        return;
      }
      refreshRef.current();
    }, interval);
  }, [getInterval]);

  useEffect(() => {
    setup();
    const checkSub = setInterval(setup, 10000);

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        refreshRef.current();
      }
    };
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", onVisible);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      clearInterval(checkSub);
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", onVisible);
      }
    };
  }, [setup]);
}

// ============================================================================
// P0-1: useAppState — 只加载 games 表（4 行），不再全量 loadState()
// ============================================================================

export function useAppState(intervalMs?: number) {
  const [state, setState] = useState<AppState>(getInitialState());
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    if (!mountedRef.current) return;
    const newState = await loadGamesOnly();
    if (mountedRef.current) {
      setState(newState);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true; // React Strict Mode 重建时重置
    refresh();
    const unsubscribe = subscribeToState(refresh);
    return () => {
      mountedRef.current = false;
      unsubscribe();
    };
  }, [refresh]);

  usePollingWithVisibility(refresh, () =>
    isRealtimeSubscribed() ? FALLBACK_POLLING_MS : (intervalMs || GAME_POLLING_MS)
  );

  return { state, refresh, loading };
}

// 管理后台专用 — 需要完整 state（单用户，可全量加载）
export function useAdminState(intervalMs?: number) {
  const [state, setState] = useState<AppState>(getInitialState());
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    if (!mountedRef.current) return;
    const newState = await loadState();
    if (mountedRef.current) {
      setState(newState);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    refresh();
    const unsubscribe = subscribeToState(refresh);
    return () => {
      mountedRef.current = false;
      unsubscribe();
    };
  }, [refresh]);

  usePollingWithVisibility(refresh, () => intervalMs || 5000);

  return { state, refresh, loading };
}

// ============================================================================
// useCurrentPlayer
// ============================================================================

export function useCurrentPlayer() {
  const [player, setPlayer] = useState<Player | null>(null);
  const [playerId, setPlayerId] = useState<string | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    if (!mountedRef.current) return;
    try {
      const id = await getCurrentPlayerId();
      setPlayerId(id);
      if (!id) {
        setPlayer(null);
        setLoading(false);
        return;
      }
      const p = await getCurrentPlayer();
      if (mountedRef.current) {
        setPlayer(p);
        setLoading(false);
      }
    } catch {
      if (mountedRef.current) {
        setPlayer(null);
        setPlayerId(null);
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    refresh();
    const unsubscribe = subscribeToState(refresh);
    return () => {
      mountedRef.current = false;
      unsubscribe();
    };
  }, [refresh]);

  usePollingWithVisibility(refresh, () => PLAYER_POLLING_MS);

  return { player, playerId, refresh, loading };
}

export function useRegisterPlayer() {
  return registerPlayer;
}

// ============================================================================
// useQuestions — P2: 题库内存缓存 + 指数退避
// ============================================================================

const questionsCache = new Map<string, { data: Question[]; locale: string }>();

export type QuestionsState = Question[] & {
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

function getCurrentLocale(): string {
  if (typeof document === "undefined") return "zh";
  return document.documentElement.lang === "en" ? "en" : "zh";
}

export function useQuestions(gameKey: GameKey): QuestionsState {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    if (!mountedRef.current) return;
    const locale = getCurrentLocale();

    const cached = questionsCache.get(gameKey);
    if (cached && cached.locale === locale && cached.data.length > 0) {
      setQuestions(cached.data);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const backoffMs = [600, 2000, 5000];
    let lastError: unknown = null;

    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const q = await getQuestions(gameKey);
        if (q.length > 0) {
          questionsCache.set(gameKey, { data: q, locale });
          if (mountedRef.current) {
            setQuestions(q);
            setError(null);
            setLoading(false);
          }
          return;
        }
        lastError = new Error(`${gameKey} 题库为空`);
      } catch (err) {
        lastError = err;
        console.error(`❌ useQuestions 加载 ${gameKey} 题库失败，第 ${attempt + 1} 次:`, err);
      }

      if (attempt < 2) {
        await new Promise((resolve) => window.setTimeout(resolve, backoffMs[attempt]));
      }
    }

    if (mountedRef.current) {
      setQuestions([]);
      setError(lastError instanceof Error ? lastError.message : "题库加载失败");
      setLoading(false);
    }
  }, [gameKey]);

  useEffect(() => {
    mountedRef.current = true;
    refresh();
    return () => { mountedRef.current = false; };
  }, [refresh]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = () => {
      questionsCache.delete(gameKey);
      refresh();
    };
    window.addEventListener("annual-game-locale-change", handler);
    return () => window.removeEventListener("annual-game-locale-change", handler);
  }, [refresh, gameKey]);

  return Object.assign([...questions], { loading, error, refresh });
}

// ============================================================================
// useGameStatus
// ============================================================================

export function useGameStatus(gameKey: GameKey) {
  const [open, setOpen] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    if (!mountedRef.current) return;
    const isOpenVal = await isGameOpen(gameKey);
    if (mountedRef.current) {
      setOpen(isOpenVal);
      setLoading(false);
    }
  }, [gameKey]);

  useEffect(() => {
    mountedRef.current = true;
    refresh();
    const unsubscribe = subscribeToState(refresh);
    return () => {
      mountedRef.current = false;
      unsubscribe();
    };
  }, [refresh]);

  usePollingWithVisibility(refresh, () =>
    isRealtimeSubscribed() ? FALLBACK_POLLING_MS : GAME_POLLING_MS
  );

  return open;
}

export function useSubmitGameResult() {
  return submitGameResult;
}

// ============================================================================
// useExistingResult
// ============================================================================

export function useExistingResult(playerId: string | null | undefined, gameKey: GameKey) {
  const [exists, setExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    if (!mountedRef.current) return;
    if (playerId) {
      const result = await getGameResult(playerId, gameKey);
      if (mountedRef.current) setExists(Boolean(result));
    }
    if (mountedRef.current) setLoading(false);
  }, [playerId, gameKey]);

  useEffect(() => {
    mountedRef.current = true;
    refresh();
    const unsubscribe = subscribeToState(refresh);
    return () => {
      mountedRef.current = false;
      unsubscribe();
    };
  }, [refresh]);

  usePollingWithVisibility(refresh, () => PLAYER_POLLING_MS);

  return { exists, loading };
}

// ============================================================================
// useLobbySnapshot
// ============================================================================

export function useLobbySnapshot(playerId: string | null | undefined) {
  const [snapshot, setSnapshot] = useState<Awaited<ReturnType<typeof getLobbySnapshot>> | null>(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    if (!mountedRef.current) return;
    try {
      if (playerId) {
        const s = await getLobbySnapshot(playerId);
        if (mountedRef.current) {
          setSnapshot(s);
          setLoading(false);
        }
      } else {
        if (mountedRef.current) {
          setSnapshot(null);
          setLoading(false);
        }
      }
    } catch {
      if (mountedRef.current) {
        setSnapshot(null);
        setLoading(false);
      }
    }
  }, [playerId]);

  useEffect(() => {
    mountedRef.current = true;
    refresh();
    const unsubscribe = subscribeToState(refresh);
    return () => {
      mountedRef.current = false;
      unsubscribe();
    };
  }, [refresh]);

  usePollingWithVisibility(refresh, () => PLAYER_POLLING_MS);

  return { snapshot, refresh, loading };
}

// ============================================================================
// useRanking
// ============================================================================

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
  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    if (!mountedRef.current) return;
    try {
      const r = await getRankingSnapshot(playerId);
      if (mountedRef.current) {
        setRanking(r);
        setLoading(false);
      }
    } catch (error) {
      console.error("❌ useRanking 加载数据库排行榜失败:", error);
      if (mountedRef.current) {
        setRanking(getEmptyRankingSnapshot());
        setLoading(false);
      }
    }
  }, [playerId]);

  useEffect(() => {
    mountedRef.current = true;
    refresh();
    const unsubscribe = subscribeToState(refresh);
    return () => {
      mountedRef.current = false;
      unsubscribe();
    };
  }, [refresh]);

  usePollingWithVisibility(refresh, () => intervalMs || PLAYER_POLLING_MS);

  return { ranking, refresh, loading };
}

// ============================================================================
// useQuizSession
// ============================================================================

export function useQuizSession(playerId: string | null | undefined) {
  const [snapshot, setSnapshot] = useState<Awaited<ReturnType<typeof getQuizSessionSnapshot>>>({ openGroups: [], completedGroups: [], results: [] });
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    if (!mountedRef.current) return;
    if (!playerId) {
      setSnapshot({ openGroups: [], completedGroups: [], results: [] });
      setLoading(false);
      return;
    }
    try {
      const s = await getQuizSessionSnapshot(playerId);
      if (mountedRef.current) {
        setSnapshot(s);
        setLoading(false);
      }
    } catch {
      if (mountedRef.current) {
        setSnapshot({ openGroups: [], completedGroups: [], results: [] });
        setLoading(false);
      }
    }
  }, [playerId]);

  useEffect(() => {
    mountedRef.current = true;
    refresh();
    const unsubscribe = subscribeToState(refresh);
    return () => {
      mountedRef.current = false;
      unsubscribe();
    };
  }, [refresh]);

  usePollingWithVisibility(refresh, () => PLAYER_POLLING_MS);

  return { snapshot, loading, refresh };
}

export function useAdminActions() {
  return { toggleGameOpen, triggerBingoScore, closeBingoGame, advanceQuizGroup, openQuizGroup, closeQuizGroup };
}
