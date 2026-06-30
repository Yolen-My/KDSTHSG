/// <reference path="../pb_data/types.d.ts" />
// 性能优化：为高频查询字段补充数据库索引
// - players.phone     注册查重 / 登录（唯一索引，同时在 DB 层防止并发注册产生重复手机号）
// - players.totalScore 排行榜排序
// - game_results.player           大厅按玩家拉取结果
// - game_results.gameKey          Bingo 判分等按游戏过滤
// - game_results.(player,gameKey) 提交时的重复校验（覆盖索引）
migrate((app) => {
  const players = app.findCollectionByNameOrId("players")
  players.indexes = [
    ...(players.indexes || []).filter((sql) => !/idx_players_(phone|totalScore)\b/.test(sql)),
    "CREATE UNIQUE INDEX `idx_players_phone` ON `players` (`phone`)",
    "CREATE INDEX `idx_players_totalScore` ON `players` (`totalScore`)"
  ]
  app.save(players)

  const results = app.findCollectionByNameOrId("game_results")
  results.indexes = [
    ...(results.indexes || []).filter((sql) => !/idx_results_/.test(sql)),
    "CREATE INDEX `idx_results_player` ON `game_results` (`player`)",
    "CREATE INDEX `idx_results_gameKey` ON `game_results` (`gameKey`)",
    "CREATE INDEX `idx_results_player_game` ON `game_results` (`player`, `gameKey`)"
  ]
  app.save(results)
}, (app) => {
  const players = app.findCollectionByNameOrId("players")
  players.indexes = (players.indexes || []).filter((sql) => !/idx_players_(phone|totalScore)\b/.test(sql))
  app.save(players)

  const results = app.findCollectionByNameOrId("game_results")
  results.indexes = (results.indexes || []).filter((sql) => !/idx_results_/.test(sql))
  app.save(results)
})
