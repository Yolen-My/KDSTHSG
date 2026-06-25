"use client";

import { useTranslations } from "next-intl";

type ScorePanelProps = {
  totalScore: number;
  rank: number;
};

export default function ScorePanel({ totalScore, rank }: ScorePanelProps) {
  const t = useTranslations();
  return (
    <section className="lobbyScoreGrid">
      <div>
        <span>{t("scorePanel.totalPoints")}</span>
        <b>{totalScore}</b>
      </div>
      <div>
        <span>{t("scorePanel.currentRank")}</span>
        <b>{rank || "-"}</b>
      </div>
    </section>
  );
}
