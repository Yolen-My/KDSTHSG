"use client";

import ResultModal from "@/components/ResultModal";
import { useI18n } from "@/lib/i18n";

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
  const { t } = useI18n();
  return (
    <ResultModal
      open={open}
      gameName={t("game.elimination")}
      roundScore={roundScore}
      totalScore={totalScore}
      rank={rank}
      eliminationModalStyle="correct"
      buttonText={t("modal.nextQuestion")}
      onClose={onNext}
      onBackLobby={() => onNext?.()}
      hideScore={hideScore}
    />
  );
}
