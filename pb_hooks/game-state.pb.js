/// <reference path="../pb_data/types.d.ts" />

// P1-1: 服务端聚合 /api/game-state（TTL=2s）
// 返回 games 状态 + 各游戏开放分组等公共状态
// 公共状态所有客户端拿到的是同一份缓存，无论 300 还是 1000 人在线，
// 数据库在每个 TTL 窗口内只被读 1 次

routerAdd("GET", "/api/game-state", (e) => {
  try {
    const TTL_MS = 2000;
    const store = e.app.store();
    const now = Date.now();

    const at = store.get("gameStateAt");
    const body = store.get("gameStateBody");
    if (at && body && now - at <= TTL_MS) {
      return e.blob(200, "application/json", body);
    }

    const games = e.app.findRecordsByFilter("games", "id != ''", "order", 100, 0);
    const mapped = [];
    for (let i = 0; i < games.length; i++) {
      const g = games[i];
      var bingoPhase = g.getString("bingoPhase");
      if (g.getString("key") === "bingo" && !bingoPhase) {
        bingoPhase = g.getBool("bingoScored") ? "auto_score" : "open";
      }
      // 规范化 quizOpenGroups
      var rawOpenGroups = g.get("quizOpenGroups");
      var quizOpenGroups = [];
      if (Array.isArray(rawOpenGroups)) {
        var seen = new Set();
        for (var j = 0; j < rawOpenGroups.length; j++) {
          var num = Number(rawOpenGroups[j]);
          if (Number.isInteger(num) && num >= 0 && num <= 7 && !seen.has(num)) {
            seen.add(num);
            quizOpenGroups.push(num);
          }
        }
        quizOpenGroups.sort(function(a, b) { return a - b; });
      }
      mapped.push({
        id: g.id,
        key: g.getString("key"),
        name: g.getString("name"),
        maxScore: g.getString("key") === "elimination" ? 200 : g.getFloat("maxScore"),
        isOpen: g.getBool("isOpen"),
        order: g.getInt("order"),
        bingoScored: g.getBool("bingoScored"),
        bingoPhase: bingoPhase,
        quizCurrentGroup: g.getInt("quizCurrentGroup") || 0,
        quizOpenGroups: quizOpenGroups
      });
    }

    const newBody = JSON.stringify({ games: mapped, cachedAt: now });
    store.set("gameStateAt", now);
    store.set("gameStateBody", newBody);
    return e.blob(200, "application/json", newBody);
  } catch (err) {
    return e.json(500, { err: String(err && err.message ? err.message : err) });
  }
});
