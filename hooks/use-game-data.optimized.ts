"use client";

import { useCallback, useEffect, useState, useRef } from "react";
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

// 根据环境动态设置轮询间隔
const getPollingInterval = () => {
  if (typeof window !== 'undefined') {
    const envInterval = (window as Window & { __NEXT_PUBLIC_POLLING_INTERVAL__?: string }).__NEXT_PUBLIC_POLLING_INTERVAL__;
    if (envInterval) return parseInt(envInterval, 10);
  }
  return process.env.NEXT_PUBLIC_POLLING_INTERVAL 
    ? parseInt(process.env.NEXT_PUBLIC_POLLING_INTERVAL, 10) 
    : 3000; // 生产环境默认3秒（配合服务端缓存降低 DB 压力）
};

const STATE_REFRESH_INTERVAL_MS = getPollingInterval();

// 随机抖动（jitter）：在基础间隔上增加 ±20% 随机偏移，防止所有客户端同时发起请求（惊群效应）
function getJitteredInterval(): number {
  const base = STATE_REFRESH_INTERVAL_MS;
  const jitter = base * 0.2 * (Math.random() * 2 - 1); // ±20%
  return Math.round(base + jitter);
}

// 请求缓存管理
const requestCache = new Map<string, {
  data: any;
  timestamp: number;
}>();

const CACHE_DURATION = 1500; // 缓存1.5秒

function getCachedRequest<T>(key: string): T | null {
  const cached = requestCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as T;
  }
  return null;
}

function setCachedRequest<T>(key: string, data: T): void {
  requestCache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

// 全局状态管理，减少重复请求
let globalState: AppState | null = null;
let globalStateLoading = false;
let globalStateSubscribers = new Set<() => void>();

async function getGlobalState(): Promise<AppState> {
  if (globalState && !globalStateLoading) {
    return globalState;
  }
  
  if (globalStateLoading) {
    // 等待正在进行的请求
    await new Promise(resolve => {
      const checkInterval = setInterval(() => {
        if (!globalStateLoading) {
          clearInterval(checkInterval);
          resolve(null);
        }
      }, 50);
    });
    return globalState!;
  }
  
  globalStateLoading = true;
  try {
    globalState = await loadState();
    return globalState;
  } finally {
    globalStateLoading = false;
  }
}

export function useAppState() {
  const [state, setState] = useState<AppState>(getInitialState());
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    if (!mountedRef.current) return;
    
    const cacheKey = 'app-state';
    const cached = getCachedRequest<AppState>(cacheKey);
    if (cached) {
      setState(cached);
      setLoading(false);
      return;
    }

    const newState = await getGlobalState();
    if (mountedRef.current) {
      setState(newState);
      setCachedRequest(cacheKey, newState);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const unsubscribe = subscribeToState(() => {
      // 订阅更新时清除缓存
      requestCache.clear();
      globalState = null; // 强制下次刷新走服务端缓存
      refresh();
    });

    // 使用 jitter 防止惊群效应
    let timer = window.setInterval(() => {
      requestCache.clear(); // 定期清除缓存
      globalState = null;
      refresh();
    }, getJitteredInterval());

    // 定时重置 jitter，避免间隔固化
    const jitterResetTimer = window.setInterval(() => {
      window.clearInterval(timer);
      timer = window.setInterval(() => {
        requestCache.clear();
        globalState = null;
        refresh();
      }, getJitteredInterval());
    }, 30000);
    
    return () => {
      mountedRef.current = false;
      unsubscribe();
      window.clearInterval(timer);
      window.clearInterval(jitterResetTimer);
    };
  }, [refresh]);

  return { state, refresh, loading };
}

export function useCurrentPlayer() {
  const [player, setPlayer] = useState<Player | null>(null);
  const [playerId, setPlayerId] = useState<string | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);
  const retryCountRef = useRef(0);
  const MAX_RETRIES = 5;

  const refresh = useCallback(async () => {
    if (!mountedRef.current) return;
    
    try {
      const id = await getCurrentPlayerId();
      setPlayerId(id);
      if (!id) {
        setPlayer(null);
        setLoading(false);
        retryCountRef.current = 0;
        return;
      }
      
      const cacheKey = `player-${id}`;
      const cached = getCachedRequest<Player>(cacheKey);
      if (cached) {
        setPlayer(cached);
        setLoading(false);
        retryCountRef.current = 0;
        return;
      }
      
      const p = await getCurrentPlayer();
      if (mountedRef.current) {
        if (p) {
          setPlayer(p);
          setCachedRequest(cacheKey, p);
          setLoading(false);
          retryCountRef.current = 0;
        } else if (retryCountRef.current < MAX_RETRIES) {
          // player 为 null 但 playerId 存在，说明查询失败，保留 playerId 等待重试
          retryCountRef.current++;
          console.warn(`⏳ getCurrentPlayer 返回 null (playerId=${id})，第 ${retryCountRef.current}/${MAX_RETRIES} 次重试...`);
          // 不 setLoading(false)，让页面继续显示 loading 状态等待重试
        } else {
          // 超过最大重试次数，放弃
          console.error(`❌ getCurrentPlayer 重试 ${MAX_RETRIES} 次后仍然失败，playerId=${id}`);
          setLoading(false);
        }
      }
    } catch {
      if (mountedRef.current) {
        // catch 中不要清除 playerId，保留等待重试
        retryCountRef.current++;
        if (retryCountRef.current >= MAX_RETRIES) {
          setPlayer(null);
          setPlayerId(null);
          setLoading(false);
        }
      }
    }
  }, []);

  useEffect(() => {
    refresh();
    const unsubscribe = subscribeToState(() => {
      requestCache.clear();
      retryCountRef.current = 0;
      refresh();
    });

    // 使用 jitter 防止惊群效应
    let timer = window.setInterval(refresh, getJitteredInterval());
    const jitterResetTimer = window.setInterval(() => {
      window.clearInterval(timer);
      timer = window.setInterval(refresh, getJitteredInterval());
    }, 30000);

    return () => {
      mountedRef.current = false;
      unsubscribe();
      window.clearInterval(timer);
      window.clearInterval(jitterResetTimer);
    };
  }, [refresh]);

  return { player, playerId, refresh, loading };
}

export function useRegisterPlayer() {
  return registerPlayer;
}

export function useQuestions(gameKey: GameKey) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    if (!mountedRef.current) return;
    
    const cacheKey = `questions-${gameKey}`;
    const cached = getCachedRequest<Question[]>(cacheKey);
    if (cached) {
      setQuestions(cached);
      setLoading(false);
      return;
    }
    
    const q = await getQuestions(gameKey);
    if (mountedRef.current) {
      setQuestions(q);
      setCachedRequest(cacheKey, q);
      setLoading(false);
    }
  }, [gameKey]);

  useEffect(() => {
    refresh();
    return () => {
      mountedRef.current = false;
    };
  }, [refresh]);

  return questions;
}

export function useGameStatus(gameKey: GameKey) {
  const [open, setOpen] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    if (!mountedRef.current) return;
    
    const cacheKey = `game-status-${gameKey}`;
    const cached = getCachedRequest<boolean>(cacheKey);
    if (cached !== null) {
      setOpen(cached);
      setLoading(false);
      return;
    }
    
    const isOpenVal = await isGameOpen(gameKey);
    if (mountedRef.current) {
      setOpen(isOpenVal);
      setCachedRequest(cacheKey, isOpenVal);
      setLoading(false);
    }
  }, [gameKey]);

  useEffect(() => {
    refresh();
    const unsubscribe = subscribeToState(() => {
      requestCache.clear();
      refresh();
    });

    let timer = window.setInterval(refresh, getJitteredInterval());
    const jitterResetTimer = window.setInterval(() => {
      window.clearInterval(timer);
      timer = window.setInterval(refresh, getJitteredInterval());
    }, 30000);

    return () => {
      mountedRef.current = false;
      unsubscribe();
      window.clearInterval(timer);
      window.clearInterval(jitterResetTimer);
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
  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    if (!mountedRef.current) return;
    
    if (!playerId) {
      setExists(false);
      setLoading(false);
      return;
    }
    
    const cacheKey = `result-${playerId}-${gameKey}`;
    const cached = getCachedRequest<boolean>(cacheKey);
    if (cached !== null) {
      setExists(cached);
      setLoading(false);
      return;
    }
    
    const result = await getGameResult(playerId, gameKey);
    if (mountedRef.current) {
      setExists(Boolean(result));
      setCachedRequest(cacheKey, Boolean(result));
      setLoading(false);
    }
  }, [playerId, gameKey]);

  useEffect(() => {
    refresh();
    const unsubscribe = subscribeToState(() => {
      requestCache.clear();
      refresh();
    });

    let timer = window.setInterval(refresh, getJitteredInterval());
    const jitterResetTimer = window.setInterval(() => {
      window.clearInterval(timer);
      timer = window.setInterval(refresh, getJitteredInterval());
    }, 30000);

    return () => {
      mountedRef.current = false;
      unsubscribe();
      window.clearInterval(timer);
      window.clearInterval(jitterResetTimer);
    };
  }, [refresh]);

  return exists;
}

export function useLobbySnapshot(playerId: string | null | undefined) {
  const [snapshot, setSnapshot] = useState<Awaited<ReturnType<typeof getLobbySnapshot>> | null>(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    if (!mountedRef.current) return;
    
    try {
      if (playerId) {
        const cacheKey = `lobby-${playerId}`;
        const cached = getCachedRequest<Awaited<ReturnType<typeof getLobbySnapshot>>>(cacheKey);
        if (cached) {
          setSnapshot(cached);
          setLoading(false);
          return;
        }
        
        const s = await getLobbySnapshot(playerId);
        if (mountedRef.current) {
          setSnapshot(s);
          setCachedRequest(cacheKey, s);
          setLoading(false);
        }
      } else {
        setSnapshot(null);
        setLoading(false);
      }
    } catch {
      if (mountedRef.current) {
        setSnapshot(null);
        setLoading(false);
      }
    }
  }, [playerId]);

  useEffect(() => {
    refresh();
    const unsubscribe = subscribeToState(() => {
      requestCache.clear();
      refresh();
    });

    let timer = window.setInterval(refresh, getJitteredInterval());
    const jitterResetTimer = window.setInterval(() => {
      window.clearInterval(timer);
      timer = window.setInterval(refresh, getJitteredInterval());
    }, 30000);

    return () => {
      mountedRef.current = false;
      unsubscribe();
      window.clearInterval(timer);
      window.clearInterval(jitterResetTimer);
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
  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    if (!mountedRef.current) return;
    
    try {
      const cacheKey = `ranking-${playerId || 'all'}`;
      const cached = getCachedRequest<Awaited<ReturnType<typeof getRankingSnapshot>>>(cacheKey);
      if (cached) {
        setRanking(cached);
        setLoading(false);
        return;
      }
      
      const r = await getRankingSnapshot(playerId);
      if (mountedRef.current) {
        setRanking(r);
        setCachedRequest(cacheKey, r);
        setLoading(false);
      }
    } catch (error) {
      console.error("❌ useRanking 加载数据库排行榜失败:", error);
      if (mountedRef.current) {
        setRanking(getEmptyRankingSnapshot());
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [playerId]);

  useEffect(() => {
    refresh();
    const unsubscribe = subscribeToState(() => {
      requestCache.clear();
      refresh();
    });

    const baseInterval = intervalMs || STATE_REFRESH_INTERVAL_MS;
    let timer = window.setInterval(refresh, baseInterval + Math.round(baseInterval * 0.2 * (Math.random() * 2 - 1)));
    const jitterResetTimer = window.setInterval(() => {
      window.clearInterval(timer);
      timer = window.setInterval(refresh, baseInterval + Math.round(baseInterval * 0.2 * (Math.random() * 2 - 1)));
    }, 30000);

    return () => {
      mountedRef.current = false;
      unsubscribe();
      window.clearInterval(timer);
      window.clearInterval(jitterResetTimer);
    };
  }, [refresh, intervalMs]);

  return { ranking, refresh, loading };
}

export function useAdminActions() {
  return { toggleGameOpen, triggerBingoScore, closeBingoGame, advanceQuizGroup, openQuizGroup, closeQuizGroup };
}

// 在客户端设置环境变量
if (typeof window !== 'undefined') {
  (window as Window & { __NEXT_PUBLIC_POLLING_INTERVAL__?: string }).__NEXT_PUBLIC_POLLING_INTERVAL__ = process.env.NEXT_PUBLIC_POLLING_INTERVAL || '3000';
}
