import { NextRequest, NextResponse } from "next/server";

const CACHE_TTL_MS = 2000;
const SUPPORTED_LOCALES = new Set(["zh", "en"]);
const POCKETBASE_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://127.0.0.1:8090";

interface CacheEntry {
  body: string;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const refreshes = new Map<string, Promise<string>>();

async function fetchCollection(path: string, locale: string): Promise<unknown[]> {
  const response = await fetch(`${POCKETBASE_URL}${path}`, {
    cache: "no-store",
    headers: { "x-annual-game-language": locale }
  });
  if (!response.ok) {
    throw new Error(`PocketBase ${path} returned ${response.status}`);
  }
  const payload = await response.json() as { items?: unknown[] };
  return payload.items || [];
}

async function fetchFreshData(locale: string): Promise<string> {
  const [players, gameResults, games, questions] = await Promise.all([
    fetchCollection("/api/collections/players/records?perPage=100000", locale),
    fetchCollection("/api/collections/game_results/records?perPage=100000&sort=completedAt", locale),
    fetchCollection("/api/collections/games/records?perPage=100&sort=order", locale),
    fetchCollection("/api/collections/questions/records?perPage=10000&sort=order", locale)
  ]);
  return JSON.stringify({ players, gameResults, games, questions });
}

function stateResponse(body: string): NextResponse {
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "private, no-store"
    }
  });
}

export async function GET(request: NextRequest) {
  const requestedLocale = request.nextUrl.searchParams.get("locale") || "zh";
  const locale = SUPPORTED_LOCALES.has(requestedLocale) ? requestedLocale : "zh";
  const cached = cache.get(locale);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return stateResponse(cached.body);
  }

  const activeRefresh = refreshes.get(locale);
  if (activeRefresh && cached) {
    return stateResponse(cached.body);
  }

  const refresh = activeRefresh || fetchFreshData(locale);
  refreshes.set(locale, refresh);

  try {
    const body = await refresh;
    cache.set(locale, { body, timestamp: Date.now() });
    return stateResponse(body);
  } catch (error) {
    if (cached) {
      console.warn("game-state refresh failed; returning stale cache.", error);
      return stateResponse(cached.body);
    }
    console.error("game-state refresh failed.", error);
    return NextResponse.json({ error: "PocketBase unavailable" }, { status: 503 });
  } finally {
    if (refreshes.get(locale) === refresh) refreshes.delete(locale);
  }
}
