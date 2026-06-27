"use client";

import { useI18n } from "@/lib/i18n";

type ScorePanelProps = {
  totalScore: number;
  rank: number;
};

export default function ScorePanel({ totalScore, rank }: ScorePanelProps) {
  const { t } = useI18n();
  return (
    <section className="lobbyScoreGrid">
      <div>
        <span>{t("lobby.cumulativeScore")}</span>
        <b>{totalScore}</b>
      </div>
      <div>
        <span>{t("lobby.currentRank")}</span>
        <b>{rank || "-"}</b>
      </div>
    </section>
  );
}
