"use client";

import type { OfficeTop3Group } from "@/types";
import { useI18n } from "@/lib/i18n";

type OfficeTop3PanelProps = {
  data: OfficeTop3Group[];
  variant?: "default" | "ranking";
};

function formatCompletedTime(completedAt: string | undefined, notCompleted: string, locale: string) {
  if (!completedAt) return notCompleted;
  return new Date(completedAt).toLocaleTimeString(locale === "en" ? "en-US" : "zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });
}

export default function OfficeTop3Panel({ data, variant = "default" }: OfficeTop3PanelProps) {
  const { t, locale } = useI18n();
  if (variant === "ranking") {
    return (
      <div className="rankingOfficeTopList">
        {data.map((group) => (
          <section className="rankingOfficeGroup" key={group.office}>
            <div className="rankingOfficeGroupHeader">{group.office} {t("ranking.officeTop3Suffix")}</div>
            {group.players.map((player) => (
              <div className="rankingRow compact" key={player.playerId}>
                <span className="rankingRankCircle">{player.rank}</span>
                <div className="rankingRowInfo">
                  <b>{player.name}</b>
                  <small>{t("ranking.completedTime")}{formatCompletedTime(player.completedAt, t("ranking.notCompleted"), locale)}</small>
                </div>
                <strong>{player.totalScore}</strong>
              </div>
            ))}
          </section>
        ))}
      </div>
    );
  }

  return (
    <div className="officeTopGrid">
      {data.map((group) => (
        <section className="demoCard" key={group.office}>
          <h3>{group.office} {t("ranking.officeTop3Suffix")}</h3>
          {group.players.map((player) => (
            <div className="miniRank" key={player.playerId}>
              <span>#{player.rank}</span>
              <b>{player.name}</b>
              <strong>{player.totalScore}</strong>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
