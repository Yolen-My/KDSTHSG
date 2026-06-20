"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import GameBannerIcon from "@/components/GameBannerIcon";
import Layout from "@/components/Layout";
import PageBackground from "@/components/PageBackground";
import ResultModal from "@/components/ResultModal";
import { calculateStoryScore } from "@/lib/scoring";
import { getGameResult } from "@/lib/storage";
import { useCurrentPlayer, useGameStatus, useQuestions, useSubmitGameResult } from "@/hooks/use-game-data";

const STORY_SECONDS = 10;
const LEGACY_STORY_TIMER_KEY = "story_timer_start";
const LEGACY_STORY_INDEX_KEY = "story_current_index";
const LEGACY_STORY_ANSWERS_KEY = "story_answers";
const LEGACY_STORY_FIRST_MODAL_KEY = "story_first_modal_open";

function getStoryTimerKey(playerId?: string | null): string {
  return playerId ? `story_timer_start_${playerId}` : LEGACY_STORY_TIMER_KEY;
}
function getStoryIndexKey(playerId?: string | null): string {
  return playerId ? `story_current_index_${playerId}` : LEGACY_STORY_INDEX_KEY;
}
function getStoryAnswersKey(playerId?: string | null): string {
  return playerId ? `story_answers_${playerId}` : LEGACY_STORY_ANSWERS_KEY;
}
function getStoryFirstModalKey(playerId?: string | null): string {
  return playerId ? `story_first_modal_open_${playerId}` : LEGACY_STORY_FIRST_MODAL_KEY;
}

function StoryNav() {
  return (
    <header className="storyNav">
      <span />
      <h1>真假故事</h1>
      <span />
    </header>
  );
}

function StoryShell({ children }: { children: ReactNode }) {
  return (
    <Layout title="真假故事" hideHeader>
      <section className="storyPage">
        <PageBackground />
        <div className="storyPageContent">
          <StoryNav />
          <div className="storyBanner">
            <GameBannerIcon
              className="storyBannerLogo"
              src="/image/source/story/story-book.png"
              width={95}
              height={66}
              left={5}
              offsetY={19}
              showReflection={false}
            />
            <Image
              className="storyBannerTitle"
              src="/image/source/story/story-title.png"
              alt="真假故事"
              width={86}
              height={20}
            />
            <p>Guess if the story is ture or false</p>
          </div>
          {children}
        </div>
      </section>
    </Layout>
  );
}

export default function StoryPage() {
  const router = useRouter();
  const { playerId, refresh } = useCurrentPlayer();
  const questions = useQuestions("story");
  const submitGameResult = useSubmitGameResult();
  const isOpen = useGameStatus("story");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [existing, setExisting] = useState<Awaited<ReturnType<typeof getGameResult>>>(null);
  const [existingLoading, setExistingLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, score: 0, total: 0, rank: 0, buttonText: "", onClose: null as (() => void) | null, hideScore: false, gameName: "真假故事" });
  const [message, setMessage] = useState("");
  const [isLeaving, setIsLeaving] = useState(false);
  const [seconds, setSeconds] = useState(STORY_SECONDS);
  const [timeUp, setTimeUp] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [restoredFromStorage, setRestoredFromStorage] = useState(false);
  const [shouldAutoTriggerOnReentry, setShouldAutoTriggerOnReentry] = useState(false);
  const timerKey = getStoryTimerKey(playerId);
  const indexKey = getStoryIndexKey(playerId);
  const answersKey = getStoryAnswersKey(playerId);
  const firstModalKey = getStoryFirstModalKey(playerId);

  useEffect(() => {
    if (playerId === null) router.push("/register");
  }, [playerId, router]);

  useEffect(() => {
    if (!playerId) {
      setExisting(null);
      setExistingLoading(playerId === undefined);
      return;
    }

    let active = true;
    const currentPlayerId = playerId;
    async function loadExisting() {
      setExistingLoading(true);
      try {
        const result = await getGameResult(currentPlayerId, "story");
        if (!active) return;
        setExisting(result);
      } finally {
        if (active) setExistingLoading(false);
      }
    }
    loadExisting();
    return () => {
      active = false;
    };
  }, [playerId]);

  // 从 localStorage 恢复进度（题号 + 答案 + 倒计时）
  useEffect(() => {
    if (!playerId || restoredFromStorage) return;
    localStorage.removeItem(LEGACY_STORY_TIMER_KEY);
    localStorage.removeItem(LEGACY_STORY_INDEX_KEY);
    localStorage.removeItem(LEGACY_STORY_ANSWERS_KEY);
    localStorage.removeItem(LEGACY_STORY_FIRST_MODAL_KEY);

    const savedIndex = localStorage.getItem(indexKey);
    const savedAnswers = localStorage.getItem(answersKey);
    const savedStart = localStorage.getItem(timerKey);

    if (savedIndex) {
      const idx = Number(savedIndex);
      if (!Number.isNaN(idx) && idx >= 0) setCurrentIndex(idx);
    }
    if (savedAnswers) {
      try {
        const parsed = JSON.parse(savedAnswers);
        if (parsed && typeof parsed === "object") setAnswers(parsed);
      } catch {
        /* ignore */
      }
    }
    if (savedStart) {
      const elapsed = (Date.now() - Number(savedStart)) / 1000;
      const next = Math.max(0, Math.ceil(STORY_SECONDS - elapsed));
      setSeconds(next);
      const expired = elapsed >= STORY_SECONDS;
      setTimeUp(expired);
      if (expired) {
        // 重新进入时倒计时已结束，标记需要自动跳题/提交
        setShouldAutoTriggerOnReentry(true);
      }
    }
    setRestoredFromStorage(true);
  }, [playerId, restoredFromStorage, indexKey, answersKey, timerKey, firstModalKey]);

  // 答案变化时持久化
  useEffect(() => {
    if (!playerId || !restoredFromStorage) return;
    localStorage.setItem(answersKey, JSON.stringify(answers));
  }, [answers, playerId, restoredFromStorage, answersKey]);

  // 当前题号变化时持久化
  useEffect(() => {
    if (!playerId || !restoredFromStorage) return;
    localStorage.setItem(indexKey, String(currentIndex));
  }, [currentIndex, playerId, restoredFromStorage, indexKey]);

  const currentQuestion = questions[currentIndex];
  const selectedAnswer = currentQuestion ? answers[currentQuestion.id] : "";
  const isLastQuestion = currentIndex === questions.length - 1;
  const results = useMemo(() => questions.map((question) => answers[question.id] === question.correctAnswer), [answers, questions]);
  const score = calculateStoryScore(results);
  const completedCount = Object.keys(answers).length;

  // 倒计时引用，供 useEffect 调用最新逻辑
  const handleTimeoutRef = useRef<() => void>(() => {});

  function goLobby() {
    setIsLeaving(true);
    router.push("/lobby");
  }

  function chooseAnswer(option: string) {
    if (!currentQuestion || isOpen !== true || existing || timeUp) return;
    setAnswers((current) => ({ ...current, [currentQuestion.id]: option }));
    setMessage("");
  }

  function resetQuestionTimer() {
    setMessage("");
    localStorage.removeItem(timerKey);
    setSeconds(STORY_SECONDS);
    setTimeUp(false);
  }

  function openFirstQuestionModal(nextAnswers: Record<string, string>) {
    const firstQuestion = questions[0];
    if (!firstQuestion) return;

    const firstAnswer = nextAnswers[firstQuestion.id] ?? "";
    const roundScore = firstAnswer === firstQuestion.correctAnswer ? firstQuestion.score || 0 : 0;

    setTimeUp(false);
    setMessage("");
    localStorage.setItem(firstModalKey, "1");
    localStorage.removeItem(timerKey);

    setModal({
      open: true,
      score: roundScore,
      total: calculateStoryScore(questions.map((question) => nextAnswers[question.id] === question.correctAnswer)),
      rank: 0,
      buttonText: "继续答题",
      hideScore: true,
      gameName: "答题完成",
      onClose: () => {
        localStorage.removeItem(firstModalKey);
        setModal((prev) => ({ ...prev, open: false }));
        setCurrentIndex((index) => Math.min(index + 1, questions.length - 1));
        resetQuestionTimer();
      }
    });
  }

  function goNext(autoTrigger = false) {
    if (!autoTrigger && !selectedAnswer) {
      setMessage("请先完成本题判断");
      return;
    }

    const nextAnswers = autoTrigger && currentQuestion && answers[currentQuestion.id] == null
      ? { ...answers, [currentQuestion.id]: "" }
      : answers;

    if (nextAnswers !== answers) {
      setAnswers(nextAnswers);
    }

    // 第一题答完后显示分数弹窗
    if (currentIndex === 0) {
      openFirstQuestionModal(nextAnswers);
    } else {
      setCurrentIndex((index) => Math.min(index + 1, questions.length - 1));
      resetQuestionTimer();
    }
  }

  useEffect(() => {
    if (!playerId || !restoredFromStorage || existingLoading || existing || !questions.length || modal.open) return;
    if (localStorage.getItem(firstModalKey) !== "1") return;

    const firstQuestion = questions[0];
    if (answers[firstQuestion.id] == null) {
      localStorage.removeItem(firstModalKey);
      return;
    }

    setCurrentIndex(0);
    openFirstQuestionModal(answers);
  }, [playerId, restoredFromStorage, existingLoading, existing, questions, answers, modal.open, firstModalKey]);

  async function submit(autoTrigger = false) {
    if (!playerId || submitting) return;
    if (isOpen !== true) {
      if (autoTrigger) {
        // 自动触发但游戏未开放：仍展示完成弹窗，避免用户卡住
        setModal({ open: true, score: 0, total: score, rank: 0, buttonText: "", onClose: null, hideScore: false, gameName: "真假故事" });
        return;
      }
      setMessage("该游戏暂未开放");
      return;
    }
    if (!autoTrigger && (!selectedAnswer || Object.keys(answers).length < questions.length)) {
      setMessage("请完成当前故事题后再提交");
      return;
    }
    setSubmitting(true);
    // 自动触发（超时）时：把所有未作答题目以空字符串占位，便于 review 页展示题目与正确答案
    const finalAnswers: Record<string, string> = { ...answers };
    if (autoTrigger) {
      questions.forEach((q) => {
        if (finalAnswers[q.id] == null) finalAnswers[q.id] = "";
      });
    }
    try {
      const outcome = await submitGameResult({ playerId, gameKey: "story", answers: finalAnswers, score });
      refresh();
      setExisting(outcome.result);
      // 提交后清理 localStorage 缓存
      localStorage.removeItem(timerKey);
      localStorage.removeItem(indexKey);
      localStorage.removeItem(answersKey);
      localStorage.removeItem(firstModalKey);
      setModal({ open: true, score: outcome.result.score, total: outcome.player.totalScore, rank: outcome.rank, buttonText: "", onClose: null, hideScore: false, gameName: "真假故事" });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "提交失败");
      if (autoTrigger) {
        // 自动触发提交失败：仍展示完成弹窗，避免用户卡住
        setModal({ open: true, score: 0, total: score, rank: 0, buttonText: "", onClose: null, hideScore: false, gameName: "真假故事" });
      }
    } finally {
      setSubmitting(false);
    }
  }

  // 保持 ref 指向最新的超时处理逻辑
  useEffect(() => {
    handleTimeoutRef.current = () => {
      if (isLastQuestion) {
        submit(true);
      } else {
        goNext(true);
      }
    };
  });

  // 每题倒计时：时间到禁止作答，自动跳转/提交（基于 localStorage 时间戳，刷新/返回后不重置）
  useEffect(() => {
    if (!playerId || !restoredFromStorage) return;
    if (isOpen !== true || existing || existingLoading || !questions.length || modal.open || submitting) return;
    if (timeUp) return;
    // 首次进入或新题：写入开始时间戳
    let startTs = Number(localStorage.getItem(timerKey));
    if (!startTs) {
      startTs = Date.now();
      localStorage.setItem(timerKey, String(startTs));
      setSeconds(STORY_SECONDS);
    }
    // 基于时间戳计算真实剩余秒数（避免渲染节流导致的 seconds state 滞后）
    const elapsedNow = (Date.now() - startTs) / 1000;
    const realSeconds = Math.max(0, Math.ceil(STORY_SECONDS - elapsedNow));
    if (realSeconds <= 0 || seconds <= 0) {
      setTimeUp(true);
      localStorage.removeItem(timerKey);
      // 使用 setTimeout 让 setTimeUp 先生效，避免渲染过程中 ref 调用引发的状态错乱
      setTimeout(() => {
        handleTimeoutRef.current();
      }, 0);
      return;
    }
    const timer = window.setInterval(() => {
      const start = Number(localStorage.getItem(timerKey));
      if (!start) return;
      const elapsed = (Date.now() - start) / 1000;
      const next = Math.max(0, Math.ceil(STORY_SECONDS - elapsed));
      setSeconds(next);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [seconds, timeUp, isOpen, existing, existingLoading, questions.length, modal.open, submitting, playerId, restoredFromStorage, timerKey, currentIndex]);

  // 重新进入页面：若倒计时已结束，自动跳题/提交
  useEffect(() => {
    if (!shouldAutoTriggerOnReentry) return;
    if (!playerId || !restoredFromStorage) return;
    if (isOpen !== true || existingLoading) return;
    if (existing) {
      setShouldAutoTriggerOnReentry(false);
      return;
    }
    if (!questions.length) return;
    if (modal.open || submitting) return;
    setShouldAutoTriggerOnReentry(false);
    localStorage.removeItem(timerKey);
    handleTimeoutRef.current();
  }, [shouldAutoTriggerOnReentry, playerId, restoredFromStorage, isOpen, existing, existingLoading, questions.length, modal.open, submitting, timerKey]);

  if (isLeaving) {
    return (
      <StoryShell>
        <section className="storyStatusCard">
          <p className="storyStatusMessage">正在跳转...</p>
        </section>
      </StoryShell>
    );
  }

  if (isOpen === false) {
    return (
      <StoryShell>
        <section className="storyStatusCard">
          <p className="storyStatusMessage">游戏加载中，请耐心等待</p>
        </section>
        <button className="storySubmitButton" type="button" onClick={goLobby}>
          回到大厅
        </button>
      </StoryShell>
    );
  }

  if (existingLoading) {
    return (
      <StoryShell>
        <section className="storyStatusCard">
          <p className="storyStatusMessage">游戏加载中，请耐心等待</p>
        </section>
      </StoryShell>
    );
  }

  if (!questions.length) {
    return (
      <StoryShell>
        <section className="storyStatusCard">
          <p className="storyStatusMessage">{questions.loading ? "题库加载中，请稍候" : `题库正在重新加载：${questions.error || "暂无题目"}`}</p>
        </section>
      </StoryShell>
    );
  }

  return (
    <StoryShell>
      {!existingLoading && existing && (
        <section className="storyStatusCard">
          <p className="storyStatusMessage">该游戏已完成，本关得分 {existing.score}，不能重复提交。</p>
        </section>
      )}

      {currentQuestion && (
        <section className="storyQuestionCard">
          <h3>Story{currentIndex + 1}：{currentQuestion.title}</h3>
          {!existing && (
            <>
              <div className="bingoStatus storyCardTimer">
                <span />
                {!timeUp && (
                  <span className="bingoTimer">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <circle cx="8" cy="8.5" r="6.5" stroke="currentColor" strokeWidth="1.2" />
                      <path d="M8 5.5V8.5L10 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                    {seconds}s
                  </span>
                )}
                {timeUp && (
                  <span className="bingoTimer bingoTimer--up">时间到</span>
                )}
              </div>
              {!timeUp && (
                <div className="bingoProgressTrack">
                  <span
                    className="bingoProgressBar"
                    style={{ width: `${(seconds / STORY_SECONDS) * 100}%` }}
                  />
                </div>
              )}
            </>
          )}
          <div className="storyOptions">
            {currentQuestion.options?.map((option) => (
              <button
                className={selectedAnswer === option ? "selected" : ""}
                disabled={Boolean(existing) || isOpen !== true || timeUp}
                key={option}
                type="button"
                onClick={() => chooseAnswer(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="storyHintCard">
        <b>已完成 {completedCount}/{questions.length}</b>
        <span>{message || (timeUp && !submitting ? "时间到，正在自动提交..." : "手动进入下一题")}</span>
      </section>

      {isLastQuestion ? (
        <button
          className="storySubmitButton"
          disabled={Boolean(existing) || isOpen !== true || !selectedAnswer || timeUp || submitting}
          type="button"
          onClick={() => submit()}
        >
          提交真假故事
        </button>
      ) : (
        <button
          className="storySubmitButton"
          disabled={Boolean(existing) || isOpen !== true || !selectedAnswer || timeUp}
          type="button"
          onClick={() => goNext()}
        >
          下一题
        </button>
      )}

      <ResultModal
        open={modal.open}
        gameName={modal.gameName}
        roundScore={modal.score}
        totalScore={modal.total}
        rank={modal.rank}
        onBackLobby={goLobby}
        buttonText={modal.buttonText}
        onClose={modal.onClose || undefined}
        hideScore={modal.hideScore}
      />
    </StoryShell>
  );
}
