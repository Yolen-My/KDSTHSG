"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import GameBannerIcon from "@/components/GameBannerIcon";
import Layout from "@/components/Layout";
import PageBackground from "@/components/PageBackground";
import ResultModal from "@/components/ResultModal";
import CorrectAnswerModal from "@/components/CorrectAnswerModal";
import { calculateStoryScore } from "@/lib/scoring";
import { getGameResult } from "@/lib/storage";
import { useAppState, useCurrentPlayer, useQuestions, useRanking, useSubmitGameResult } from "@/hooks/use-game-data";
import type { Question } from "@/types";

const STORY_SECONDS = 10;
const STORY_GROUP_COUNT = 2;
const STORY_ANSWERS_KEY_PREFIX = "story_group_answers";
const STORY_TIMER_KEY_PREFIX = "story_group_timer_start";

function normalizeAnswerValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  const raw = String(value).trim();
  try {
    const decoded = JSON.parse(raw);
    if (typeof decoded === "string" || typeof decoded === "number" || typeof decoded === "boolean") {
      return String(decoded).trim();
    }
  } catch {}
  return raw;
}

function isCorrectAnswer(question: Question, answer: string | undefined): boolean {
  if (!answer) return false;
  return Array.isArray(question.correctAnswer)
    ? question.correctAnswer.map(normalizeAnswerValue).includes(normalizeAnswerValue(answer))
    : normalizeAnswerValue(question.correctAnswer) === normalizeAnswerValue(answer);
}

function getGroupName(index: number): string {
  return `Group ${index + 1}`;
}

function getAnswersKey(playerId?: string | null): string {
  return playerId ? `${STORY_ANSWERS_KEY_PREFIX}_${playerId}` : `${STORY_ANSWERS_KEY_PREFIX}_guest`;
}

function getTimerKey(playerId: string | null | undefined, index: number): string {
  return playerId ? `${STORY_TIMER_KEY_PREFIX}_${playerId}_${index}` : `${STORY_TIMER_KEY_PREFIX}_guest_${index}`;
}

function hasAnswer(answers: Record<string, string>, question?: Question): boolean {
  return Boolean(question && Object.prototype.hasOwnProperty.call(answers, question.id));
}

function StoryNav({ hideActions = false }: { hideActions?: boolean }) {
  return (
    <header className="quizNav">
      {hideActions ? <span /> : (
        <Link className="quizNavLink" href="/lobby">
          活动大厅
        </Link>
      )}
      <h1>狼人悍跳</h1>
      {hideActions ? <span /> : (
        <Link className="quizNavLink" href="/ranking">
          排行榜
        </Link>
      )}
    </header>
  );
}

function StoryShell({ children, hideNavActions = false }: { children: ReactNode; hideNavActions?: boolean }) {
  return (
    <Layout title="狼人悍跳" hideHeader>
      <section className="quizPage">
        <PageBackground />
        <div className="quizPageContent">
          <StoryNav hideActions={hideNavActions} />
          {children}
        </div>
      </section>
    </Layout>
  );
}

export default function StoryClient({ initialGroupIndex = null }: { initialGroupIndex?: number | null }) {
  const router = useRouter();
  const { playerId, refresh: refreshPlayer, player } = useCurrentPlayer();
  const { state, refresh: refreshState, loading: stateLoading } = useAppState();
  const { ranking } = useRanking(playerId);
  const questions = useQuestions("story");
  const submitGameResult = useSubmitGameResult();

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [existing, setExisting] = useState<Awaited<ReturnType<typeof getGameResult>>>(null);
  const [existingLoading, setExistingLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, score: 0, total: 0, rank: 0 });
  const [correctModalOpen, setCorrectModalOpen] = useState(false);
  const [correctModalIsCorrect, setCorrectModalIsCorrect] = useState(true);
  const [correctModalIsTimeout, setCorrectModalIsTimeout] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [seconds, setSeconds] = useState(STORY_SECONDS);
  const [timeUp, setTimeUp] = useState(false);

  const submittingRef = useRef(false);
  const timeUpSubmittingRef = useRef(false);
  const handleTimeUpRef = useRef<() => Promise<void>>(async () => {});

  const storyGame = state.games.find((game) => game.key === "story");
  const openGroups = storyGame?.quizOpenGroups || [];
  const storyIsOpen = Boolean(storyGame?.isOpen);

  const gameQuestions = useMemo(() => (
    questions
      .filter((question) => question.gameKey === "story" && question.isActive === true)
      .sort((a, b) => a.order - b.order)
      .slice(0, STORY_GROUP_COUNT)
  ), [questions]);

  const groups = useMemo(() => (
    Array.from({ length: STORY_GROUP_COUNT }, (_, index) => {
      const question = gameQuestions[index];
      return {
        index,
        groupName: getGroupName(index),
        question,
        isOpen: openGroups.includes(index),
        answered: hasAnswer(answers, question)
      };
    })
  ), [answers, gameQuestions, openGroups]);

  const activeGroup = initialGroupIndex === null ? null : groups[initialGroupIndex];
  const currentQuestion = activeGroup?.question;
  const selectedAnswer = currentQuestion ? answers[currentQuestion.id] || "" : "";
  const completedCount = groups.filter((group) => group.answered).length;
  const allGroupsAnswered = gameQuestions.length >= STORY_GROUP_COUNT && gameQuestions.every((question) => hasAnswer(answers, question));
  const resultModalOpen = modal.open || Boolean(existing && !existingLoading);
  const resultRoundScore = modal.open ? modal.score : existing?.score ?? 0;
  const resultTotalScore = modal.open ? modal.total : player?.totalScore ?? existing?.score ?? 0;
  const resultRank = modal.open ? modal.rank : ranking.context?.rank ?? 0;

  useEffect(() => {
    if (playerId === null) router.push("/register");
  }, [playerId, router]);

  useEffect(() => {
    if (!playerId) {
      setExisting(null);
      setExistingLoading(playerId === undefined);
      setAnswers({});
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

    try {
      const raw = window.localStorage.getItem(getAnswersKey(currentPlayerId));
      setAnswers(raw ? JSON.parse(raw) : {});
    } catch {
      setAnswers({});
    }

    return () => {
      active = false;
    };
  }, [playerId]);

  function persistAnswers(nextAnswers: Record<string, string>) {
    setAnswers(nextAnswers);
    if (playerId) {
      window.localStorage.setItem(getAnswersKey(playerId), JSON.stringify(nextAnswers));
    }
  }

  function goLobby() {
    setIsLeaving(true);
    router.push("/lobby");
  }

  function startGroup(index: number) {
    const group = groups[index];
    if (!group || group.answered || !group.isOpen || !group.question || existing) return;
    setIsLeaving(true);
    router.push(`/game/story/group/${index + 1}`);
  }

  async function submitFinal(nextAnswers: Record<string, string>) {
    if (!playerId || existing || submittingRef.current) return;
    if (gameQuestions.length < STORY_GROUP_COUNT) return;
    if (!gameQuestions.every((question) => hasAnswer(nextAnswers, question))) return;

    submittingRef.current = true;
    setSubmitting(true);
    const results = gameQuestions.map((question) => isCorrectAnswer(question, nextAnswers[question.id]));
    const finalScore = calculateStoryScore(results);

    try {
      const outcome = await submitGameResult({
        playerId,
        gameKey: "story",
        answers: nextAnswers,
        score: finalScore
      });
      await refreshState();
      await refreshPlayer();
      setExisting(outcome.result);
      setModal({ open: true, score: outcome.result.score, total: outcome.player.totalScore, rank: outcome.rank });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "提交失败";
      if (errorMessage.includes("已完成") && playerId) {
        const completedResult = await getGameResult(playerId, "story");
        if (completedResult) {
          await refreshState();
          await refreshPlayer();
          setExisting(completedResult);
          setModal({
            open: true,
            score: completedResult.score,
            total: player?.totalScore ?? completedResult.score,
            rank: ranking.context?.rank ?? 0
          });
          return;
        }
      }
      setMessage(errorMessage);
    } finally {
      setSubmitting(false);
      submittingRef.current = false;
    }
  }

  async function completeGroup(answer: string) {
    if (!currentQuestion || !activeGroup || existing || submitting) return;

    window.localStorage.removeItem(getTimerKey(playerId, activeGroup.index));
    const nextAnswers = { ...answers, [currentQuestion.id]: answer };
    persistAnswers(nextAnswers);
    setMessage("");

    const completedAll = gameQuestions.length >= STORY_GROUP_COUNT && gameQuestions.every((question) => hasAnswer(nextAnswers, question));

    if (activeGroup.index < STORY_GROUP_COUNT - 1) {
      const correct = isCorrectAnswer(currentQuestion, answer);
      setCorrectModalIsCorrect(correct);
      setCorrectModalIsTimeout(false);
      setCorrectModalOpen(true);
      return;
    }

    if (completedAll) {
      await submitFinal(nextAnswers);
      return;
    }
    setIsLeaving(true);
    router.replace("/game/story");
  }

  function handleCorrectModalNext() {
    setCorrectModalOpen(false);
    setIsLeaving(true);
    router.replace("/game/story");
  }

  handleTimeUpRef.current = async () => {
    if (!currentQuestion || !activeGroup || existing || modal.open || timeUpSubmittingRef.current || submitting) return;
    timeUpSubmittingRef.current = true;
    setTimeUp(true);
    if (activeGroup.index < STORY_GROUP_COUNT - 1) {
      setCorrectModalIsCorrect(false);
      setCorrectModalIsTimeout(true);
      setCorrectModalOpen(true);
      const nextAnswers = { ...answers, [currentQuestion.id]: "" };
      persistAnswers(nextAnswers);
      timeUpSubmittingRef.current = false;
      return;
    }
    await completeGroup(answers[currentQuestion.id] ?? "");
    timeUpSubmittingRef.current = false;
  };

  useEffect(() => {
    if (!playerId || !currentQuestion || !activeGroup || !activeGroup.isOpen || existing || modal.open || correctModalOpen || submitting) return;

    const timerKey = getTimerKey(playerId, activeGroup.index);
    let start = Number(window.localStorage.getItem(timerKey));
    if (!start) {
      start = Date.now();
      window.localStorage.setItem(timerKey, String(start));
    }

    setTimeUp(false);
    const tick = () => {
      const elapsed = (Date.now() - start) / 1000;
      const nextSeconds = Math.max(0, Math.ceil(STORY_SECONDS - elapsed));
      setSeconds(nextSeconds);
      if (nextSeconds <= 0) {
        window.localStorage.removeItem(timerKey);
        handleTimeUpRef.current();
      }
    };

    tick();
    const t = window.setInterval(tick, 250);
    return () => window.clearInterval(t);
  }, [playerId, currentQuestion, activeGroup, existing, modal.open, correctModalOpen, submitting]);

  function chooseAnswer(option: string) {
    if (!currentQuestion || !activeGroup?.isOpen || existing || timeUp || submitting) return;
    completeGroup(option);
  }

  if (isLeaving) {
    return (
      <StoryShell>
        <section className="quizStatusCard">
          <p className="quizStatusMessage">正在跳转...</p>
        </section>
      </StoryShell>
    );
  }

  if (stateLoading || playerId === undefined || existingLoading) {
    return (
      <StoryShell>
        <section className="quizStatusCard">
          <p className="quizStatusMessage">游戏加载中，请耐心等待</p>
        </section>
      </StoryShell>
    );
  }

  if (!questions.length) {
    return (
      <StoryShell>
        <section className="quizStatusCard">
          <p className="quizStatusMessage">{questions.loading ? "题库加载中，请稍候" : `题库正在重新加载：${questions.error || "暂无题目"}`}</p>
        </section>
      </StoryShell>
    );
  }

  if (!storyIsOpen && !existing) {
    return (
      <StoryShell>
        <section className="quizStatusCard">
          <p className="quizStatusMessage">狼人悍跳尚未开放</p>
        </section>
        <button className="quizBackButton" type="button" onClick={goLobby}>
          返回活动大厅
        </button>
      </StoryShell>
    );
  }

  if (!modal.open && !correctModalOpen && initialGroupIndex !== null && (!activeGroup || !currentQuestion || activeGroup.answered || !activeGroup.isOpen)) {
    return (
      <StoryShell>
        <section className="quizStatusCard">
          <p className="quizStatusMessage">
            {!activeGroup
              ? "该 Group 不存在"
              : activeGroup.answered
                ? "该 Group 已完成"
                : !activeGroup.isOpen
                  ? "该 Group 尚未开放"
                  : "该 Group 暂无题目"}
          </p>
        </section>
        <button className="quizBackButton" type="button" onClick={() => router.replace("/game/story")}>
          返回 Group 选择
        </button>
      </StoryShell>
    );
  }

  if (activeGroup && currentQuestion) {
    return (
      <StoryShell hideNavActions>
        <div className="quizPlayHeader">
          <h2>{activeGroup.groupName}</h2>
          <p>题目1/1</p>
        </div>

        {!existing && activeGroup.isOpen && (
          <div className="quizTimer">
            <div className="quizTimerMeta">
              <span>答题倒计时</span>
              <span className="quizTimerClock">{timeUp ? "时间到" : `${seconds}s`}</span>
            </div>
            {!timeUp && (
              <div className="quizTimerTrack">
                <span style={{ width: `${(seconds / STORY_SECONDS) * 100}%` }} />
              </div>
            )}
          </div>
        )}

        <section className="quizQuestionCard">
          <h3>{currentQuestion.title}</h3>
          <div className="storyOptions">
            {currentQuestion.options?.map((option) => (
              <button
                className={selectedAnswer === option ? "selected" : ""}
                disabled={Boolean(existing) || !activeGroup.isOpen || timeUp || submitting}
                key={option}
                type="button"
                onClick={() => chooseAnswer(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </section>

        <section className="quizHintCard">
          <b>已完成 {completedCount}/{STORY_GROUP_COUNT}</b>
          <span>{message || (submitting ? "正在提交最终成绩..." : "选择答案后返回 Group 选择")}</span>
        </section>

        <button className="quizBackButton" type="button" onClick={() => router.replace("/game/story")}>
          返回 Group 选择
        </button>

        <ResultModal
          open={resultModalOpen}
          gameName="狼人悍跳"
          roundScore={resultRoundScore}
          totalScore={resultTotalScore}
          rank={resultRank}
          onBackLobby={goLobby}
          buttonText="返回大厅"
        />

        <CorrectAnswerModal
          open={correctModalOpen}
          isCorrect={correctModalIsCorrect}
          isTimeout={correctModalIsTimeout}
          onNext={handleCorrectModalNext}
        />
      </StoryShell>
    );
  }

  return (
    <StoryShell hideNavActions={resultModalOpen}>
      <div className="quizBanner">
        <div className="quizBannerText">
          <Image
            alt="狼人悍跳"
            className="quizBannerTitle"
            height={20}
            src="/image/source/story/story-title.png"
            width={244}
          />
          <p>Group总进度已完成{completedCount}/{STORY_GROUP_COUNT}</p>
        </div>
        <GameBannerIcon
          className="quizBannerLogo"
          src="/image/source/story/story-book.png"
          width={95}
          height={66}
          left={5}
          offsetY={19}
          containerSize={96}
          reflectionHeight={76}
          reflectionOverlap={12}
        />
      </div>

      {existing && (
        <section className="quizStatusCard" style={{ flex: "initial", minHeight: 96, marginBottom: 16 }}>
          <p className="quizStatusMessage">该游戏已完成，本关得分 {existing.score}，不能重复提交。</p>
        </section>
      )}

      <section className="quizSectorCard">
        {groups.map((group) => {
          const status = existing || group.answered ? "已完成" : group.isOpen ? "可答题" : "未开放";
          return (
            <div className="quizSectorRow" key={group.index}>
              <div className="quizSectorInfo">
                <b>{group.groupName}</b>
                <div className="quizSectorMeta">
                  <span>状态：{status}</span>
                </div>
              </div>
              {existing || group.answered ? (
                <button className="quizSectorAction quizSectorAction--ghost" disabled type="button">
                  已完成
                </button>
              ) : group.isOpen && group.question ? (
                <button className="quizSectorAction quizSectorAction--primary" type="button" onClick={() => startGroup(group.index)}>
                  进入答题
                </button>
              ) : (
                <button className="quizSectorAction quizSectorAction--ghost" disabled type="button">
                  等待主持人开启
                </button>
              )}
            </div>
          );
        })}
      </section>

      {allGroupsAnswered && !existing && !modal.open && (
        <button className="quizBackButton" disabled={submitting} type="button" onClick={() => submitFinal(answers)}>
          {submitting ? "提交中..." : "提交最终成绩"}
        </button>
      )}

      <button className="quizBackButton" type="button" onClick={goLobby}>
        返回活动大厅
      </button>

      <ResultModal
        open={resultModalOpen}
        gameName="狼人悍跳"
        roundScore={resultRoundScore}
        totalScore={resultTotalScore}
        rank={resultRank}
        onBackLobby={goLobby}
        buttonText="返回大厅"
      />
    </StoryShell>
  );
}
