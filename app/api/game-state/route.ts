import { NextResponse } from "next/server";

// 服务端内存缓存：将 loadStateFromPB 的全量查询结果缓存，TTL=2s。
// 200 个客户端不再各自全量拉取，而是共享同一份缓存数据。
// 收益：高并发下同一时间窗内只触发 1 次全量 DB 查询，其余请求近乎零成本命中。

interface CacheEntry {
  body: string;      // 预序列化的 JSON 字符串，避免每次响应重新序列化
  timestamp: number;
}

let cache: CacheEntry | null = null;
const TTL_MS = 2000;

// 缓存过期后允许一个请求去刷新，其他请求继续返回旧缓存（防止缓存击穿）
let refreshInProgress = false;

async function fetchFreshData(): Promise<string> {
  // 通过 Next.js rewrite 代理访问 PocketBase
  const baseUrl = "http://127.0.0.1:8090";

  const [playersRes, resultsRes, gamesRes, questionsRes] = await Promise.all([
    fetch(`${baseUrl}/api/collections/players/records?perPage=100000`),
    fetch(`${baseUrl}/api/collections/game_results/records?perPage=100000&sort=completedAt`),
    fetch(`${baseUrl}/api/collections/games/records?perPage=100&sort=order`),
    fetch(`${baseUrl}/api/collections/questions/records?perPage=10000&sort=order`),
  ]);

  const [playersData, resultsData, gamesData, questionsData] = await Promise.all([
    playersRes.json(),
    resultsRes.json(),
    gamesRes.json(),
    questionsRes.json(),
  ]);

  const body = JSON.stringify({
    players: playersData.items || [],
    gameResults: resultsData.items || [],
    games: gamesData.items || [],
    questions: questionsData.items || [],
  });

  return body;
}

export async function GET() {
  const now = Date.now();

  // 缓存命中：直接返回
  if (cache && now - cache.timestamp < TTL_MS) {
    return new NextResponse(cache.body, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=1, s-maxage=1",
      },
    });
  }

  // 缓存过期但其他请求正在刷新：返回旧缓存（防止缓存击穿）
  if (refreshInProgress && cache) {
    return new NextResponse(cache.body, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=1, s-maxage=1",
      },
    });
  }

  // 刷新缓存
  refreshInProgress = true;
  try {
    const body = await fetchFreshData();
    cache = { body, timestamp: Date.now() };
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=1, s-maxage=1",
      },
    });
  } catch (error) {
    // 刷新失败但有旧缓存：返回旧缓存兜底
    if (cache) {
      console.warn("⚠️ game-state 刷新失败，返回旧缓存:", error);
      return new NextResponse(cache.body, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=1, s-maxage=1",
        },
      });
    }
    return NextResponse.json({ error: "PocketBase 不可用" }, { status: 503 });
  } finally {
    refreshInProgress = false;
  }
}
