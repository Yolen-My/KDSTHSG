"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import GameBannerIcon from "@/components/GameBannerIcon";
import Layout from "@/components/Layout";
import PageBackground from "@/components/PageBackground";
import ResultModal from "@/components/ResultModal";
import { calculateStoryScore } from "@/lib/scoring";
import { getGameResult } from "@/lib/storage";
import { useCurrentPlayer, useGameStatus, useQuestions, useSubmitGameResult } from "@/hooks/use-game-data";

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
  const [modal, setModal] = useState({ open: false, score: 0, total: 0, rank: 0 });
  const [message, setMessage] = useState("");
  const [isLeaving, setIsLeaving] = useState(false);

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

  const currentQuestion = questions[currentIndex];
  const selectedAnswer = currentQuestion ? answers[currentQuestion.id] : "";
  const isLastQuestion = currentIndex === questions.length - 1;
  const results = useMemo(() => questions.map((question) => answers[question.id] === question.correctAnswer), [answers, questions]);
  const score = calculateStoryScore(results);
  const completedCount = Object.keys(answers).length;

  function goLobby() {
    setIsLeaving(true);
    router.push("/lobby");
  }

  function chooseAnswer(option: string) {
    if (!currentQuestion || isOpen !== true || existing) return;
    setAnswers((current) => ({ ...current, [currentQuestion.id]: option }));
    setMessage("");
  }

  function goNext() {
    if (!selectedAnswer) {
      setMessage("请先完成本题判断");
      return;
    }
    setCurrentIndex((index) => Math.min(index + 1, questions.length - 1));
    setMessage("");
  }

  async function submit() {
    if (!playerId) return;
    if (isOpen !== true) {
      setMessage("该游戏暂未开放");
      return;
    }
    if (!selectedAnswer || Object.keys(answers).length < questions.length) {
      setMessage("请完成当前故事题后再提交");
      return;
    }
    try {
      const outcome = await submitGameResult({ playerId, gameKey: "story", answers, score });
      refresh();
      setExisting(outcome.result);
      setModal({ open: true, score: outcome.result.score, total: outcome.player.totalScore, rank: outcome.rank });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "提交失败");
    }
  }

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
          <div className="storyOptions">
            {currentQuestion.options?.map((option) => (
              <button
                className={selectedAnswer === option ? "selected" : ""}
                disabled={Boolean(existing) || isOpen !== true}
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
        <span>{message || "手动进入下一题"}</span>
      </section>

      {isLastQuestion ? (
        <button
          className="storySubmitButton"
          disabled={Boolean(existing) || isOpen !== true || !selectedAnswer}
          type="button"
          onClick={submit}
        >
          提交真假故事
        </button>
      ) : (
        <button
          className="storySubmitButton"
          disabled={Boolean(existing) || isOpen !== true || !selectedAnswer}
          type="button"
          onClick={goNext}
        >
          下一题
        </button>
      )}

      <ResultModal
        open={modal.open}
        gameName="真假故事"
        roundScore={modal.score}
        totalScore={modal.total}
        rank={modal.rank}
        onBackLobby={goLobby}
      />
    </StoryShell>
  );
}
