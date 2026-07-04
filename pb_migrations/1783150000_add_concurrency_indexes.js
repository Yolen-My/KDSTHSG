/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const statements = [
    "CREATE INDEX IF NOT EXISTS `idx_players_totalScore` ON `players` (`totalScore`)",
    "CREATE INDEX IF NOT EXISTS `idx_results_game_pending` ON `game_results` (`gameKey`, `pendingBingoScore`)",
    "CREATE INDEX IF NOT EXISTS `idx_results_completedAt` ON `game_results` (`completedAt`)",
    "CREATE UNIQUE INDEX IF NOT EXISTS `idx_results_unique_non_quiz` ON `game_results` (`player`, `gameKey`) WHERE `gameKey` <> 'quiz'",
    "CREATE UNIQUE INDEX IF NOT EXISTS `idx_results_unique_quiz_session` ON `game_results` (`player`, `gameKey`, `quizSessionIndex`) WHERE `gameKey` = 'quiz'"
  ];

  for (let index = 0; index < statements.length; index += 1) {
    app.db().newQuery(statements[index]).execute();
  }
}, (app) => {
  const statements = [
    "DROP INDEX IF EXISTS `idx_results_unique_quiz_session`",
    "DROP INDEX IF EXISTS `idx_results_unique_non_quiz`",
    "DROP INDEX IF EXISTS `idx_results_completedAt`",
    "DROP INDEX IF EXISTS `idx_results_game_pending`",
    "DROP INDEX IF EXISTS `idx_players_totalScore`"
  ];

  for (let index = 0; index < statements.length; index += 1) {
    app.db().newQuery(statements[index]).execute();
  }
});
