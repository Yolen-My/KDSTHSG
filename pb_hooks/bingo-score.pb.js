/// <reference path="../pb_data/types.d.ts" />

// P0-3: Bingo 判分服务端批量化
// 把判分逻辑从客户端 N+1 串行更新移到服务端，在一个请求内完成所有成绩结算与 totalScore 重算。
// 客户端只发一个 POST /api/bingo-score 请求，判分从"全场卡死"变为秒级完成。
//
// 逻辑：
// 1. 加载所有 bingo 题目
// 2. 加载所有 pending bingo 结果，在内存中判分并批量更新
// 3. 为没有 bingo 记录的玩家自动创建空 bingo 记录
// 4. 重算所有玩家的 totalScore / completedGames / finalSubmitted
// 5. 更新 bingo 游戏状态为 closed
// 6. 批量写入，避免 N+1 串行

routerAdd("POST", "/api/bingo-score", (e) => {
  try {
    const now = new Date().toISOString();

    // 1. 加载 bingo 题目
    const bingoQuestions = e.app.findRecordsByFilter("questions", "gameKey = 'bingo' && isActive = true", "order", 1000, 0);
    const targetWords = [];
    const bingoQuestionMap = {};
    for (let i = 0; i < bingoQuestions.length; i++) {
      const q = bingoQuestions[i];
      const title = q.getString("title");
      const correctAnswer = q.getString("correctAnswer");
      // isBingoCorrectQuestion: correctAnswer === title
      if (correctAnswer === title) {
        targetWords.push(title);
      }
      bingoQuestionMap[q.id] = q;
    }

    // calculateBingoScore: correctCount * 10, max 100
    function calcBingoScore(correctCount) {
      return Math.max(0, Math.min(correctCount * 10, 100));
    }

    // 2. 加载所有 pending bingo 结果并判分
    const allBingoResults = e.app.findRecordsByFilter("game_results", "gameKey = 'bingo'", "", 100000, 0);
    const settledResults = [];
    const playerHasBingo = new Set();

    for (let i = 0; i < allBingoResults.length; i++) {
      const result = allBingoResults[i];
      const playerId = result.getString("player");
      playerHasBingo.add(playerId);

      const isPending = result.getBool("pendingBingoScore") ||
        (result.get("answers") && result.get("answers").pendingBingoScore);

      if (!isPending) {
        settledResults.push({ id: result.id, playerId, score: result.getFloat("score"), settled: false });
        continue;
      }

      // 判分
      const answers = result.get("answers") || {};
      const selectedQuestionIds = Array.isArray(answers.selectedQuestionIds) ? answers.selectedQuestionIds : [];
      const selectedWords = [];
      let correctCount = 0;

      for (let j = 0; j < selectedQuestionIds.length; j++) {
        const qid = selectedQuestionIds[j];
        const q = bingoQuestionMap[qid];
        if (q) {
          const title = q.getString("title");
          selectedWords.push(title);
          if (q.getString("correctAnswer") === title) {
            correctCount++;
          }
        }
      }

      // 全对加 1 分奖励
      if (selectedQuestionIds.length === 9 && selectedQuestionIds.every(function(qid) {
        var q = bingoQuestionMap[qid];
        return q && q.getString("correctAnswer") === q.getString("title");
      })) {
        correctCount += 1;
      }

      const score = selectedWords.length === 0 && selectedQuestionIds.length === 0
        ? Math.max(0, Math.min(100, Math.round(result.getFloat("score"))))
        : calcBingoScore(correctCount);

      // 更新记录
      const updatedAnswers = JSON.parse(JSON.stringify(answers));
      updatedAnswers.selectedWords = selectedWords;
      updatedAnswers.targetWords = targetWords;
      updatedAnswers.correctCount = correctCount;
      updatedAnswers.pendingBingoScore = false;

      e.app.dao().saveRecord(e.app.dao().findRecordById("game_results", result.id), {
        pendingBingoScore: false,
        score: score,
        answers: updatedAnswers
      });

      settledResults.push({ id: result.id, playerId, score: score, settled: true });
    }

    // 3. 为没有 bingo 记录的玩家自动创建空 bingo 记录
    const allPlayers = e.app.findRecordsByFilter("players", "id != ''", "", 100000, 0);
    const autoCreatedPlayers = [];
    for (let i = 0; i < allPlayers.length; i++) {
      const p = allPlayers[i];
      const pid = p.id;
      if (!playerHasBingo.has(pid)) {
        autoCreatedPlayers.push(pid);
        // 创建空 bingo 记录
        const newResult = e.app.dao().createRecord("game_results", {
          player: pid,
          gameKey: "bingo",
          answers: { selectedWords: [], targetWords: targetWords, correctCount: 0 },
          score: 0,
          maxScore: 100,
          completedAt: now,
          pendingBingoScore: false
        });
        settledResults.push({ id: newResult.id, playerId: pid, score: 0, settled: true });
      }
    }

    // 4. 重算所有玩家的 totalScore / completedGames / finalSubmitted
    // 加载所有非 pending 的游戏结果
    const allResults = e.app.findRecordsByFilter("game_results", "pendingBingoScore = false", "", 100000, 0);

    // 按 player 分组
    const resultsByPlayer = {};
    for (let i = 0; i < allResults.length; i++) {
      const r = allResults[i];
      const pid = r.getString("player");
      if (!resultsByPlayer[pid]) resultsByPlayer[pid] = [];
      resultsByPlayer[pid].push({
        gameKey: r.getString("gameKey"),
        score: r.getFloat("score"),
        quizSessionIndex: r.get("quizSessionIndex") || null
      });
    }

    const gameOrder = ["bingo", "quiz", "story", "elimination"];

    for (let i = 0; i < allPlayers.length; i++) {
      const playerRecord = allPlayers[i];
      const pid = playerRecord.id;
      const playerResults = resultsByPlayer[pid] || [];

      // totalScore
      const totalScore = playerResults.reduce(function(sum, r) { return sum + r.score; }, 0);

      // completedGames
      const completedGames = (playerRecord.get("completedGames") || []).filter(function(key) { return key !== "quiz"; });
      var completedQuizGroups = new Set();
      for (var j = 0; j < playerResults.length; j++) {
        var r = playerResults[j];
        if (r.gameKey !== "quiz") {
          completedGames.push(r.gameKey);
        } else if (r.quizSessionIndex !== null && r.quizSessionIndex !== undefined) {
          completedQuizGroups.add(r.quizSessionIndex);
        }
      }
      if (completedQuizGroups.size >= 5) {
        completedGames.push("quiz");
      }
      // 去重
      var uniqueCompleted = [];
      var seen = new Set();
      for (var k = 0; k < completedGames.length; k++) {
        if (!seen.has(completedGames[k])) {
          seen.add(completedGames[k]);
          uniqueCompleted.push(completedGames[k]);
        }
      }
      // 过滤为 GAME_ORDER 中的
      var finalCompleted = gameOrder.filter(function(key) { return seen.has(key); });

      // finalSubmitted
      var finalSubmitted = finalCompleted.length === gameOrder.length;
      var existingFinalCompletedAt = playerRecord.getString("finalCompletedAt");
      var finalCompletedAt = finalSubmitted ? (existingFinalCompletedAt || now) : existingFinalCompletedAt;

      e.app.dao().saveRecord(e.app.dao().findRecordById("players", pid), {
        totalScore: totalScore,
        completedGames: finalCompleted,
        finalSubmitted: finalSubmitted,
        finalCompletedAt: finalCompletedAt
      });
    }

    // 5. 更新 bingo 游戏状态为 closed
    const bingoGames = e.app.findRecordsByFilter("games", "key = 'bingo'", "", 10, 0);
    for (let i = 0; i < bingoGames.length; i++) {
      e.app.dao().saveRecord(bingoGames[i], {
        isOpen: false,
        bingoScored: true,
        bingoPhase: "closed"
      });
    }

    return e.json(200, { ok: true, settled: settledResults.length, autoCreated: autoCreatedPlayers.length });
  } catch (err) {
    return e.json(500, { err: String(err && err.message ? err.message : err) });
  }
});
