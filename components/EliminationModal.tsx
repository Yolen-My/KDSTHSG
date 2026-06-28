"use client";

import { useTranslations } from "next-intl";
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
  const t = useTranslations();
  return (
    <ResultModal
      open={open}
      gameKey="elimination"
      gameName={t("game.name.elimination")}
      roundScore={roundScore}
      totalScore={totalScore}
      rank={rank}
      eliminationModalStyle="correct"
      buttonText={t("common.nextQuestion")}
      onClose={onNext}
      onBackLobby={() => onNext?.()}
      hideScore={hideScore}
    />
  );
}
