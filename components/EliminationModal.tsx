"use client";

import ResultModal from "@/components/ResultModal";

type EliminationModalProps = {
  open: boolean;
  roundScore: number;
  totalScore: number;
  rank: number;
  onNext?: () => void;
  hideScore?: boolean;
};

export default function EliminationModal({
  open,
  roundScore,
  totalScore,
  rank,
  onNext,
  hideScore = false
}: EliminationModalProps) {
  return (
    <ResultModal
      open={open}
      gameName="守卫者之夜"
      roundScore={roundScore}
      totalScore={totalScore}
      rank={rank}
      eliminationModalStyle="correct"
      buttonText="下一题"
      onClose={onNext}
      onBackLobby={() => onNext?.()}
      hideScore={hideScore}
    />
  );
}
