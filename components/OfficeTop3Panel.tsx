"use client";

import { useTranslations } from "next-intl";
import type { OfficeTop3Group } from "@/types";

type OfficeTop3PanelProps = {
  data: OfficeTop3Group[];
  variant?: "default" | "ranking";
};

function formatTime(completedAt: string) {
  return new Date(completedAt).toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });
}

export default function OfficeTop3Panel({ data, variant = "default" }: OfficeTop3PanelProps) {
  const t = useTranslations();
  const completedLabel = (completedAt?: string) =>
    t("table.completedTime", { time: completedAt ? formatTime(completedAt) : t("table.notCompleted") });

  if (variant === "ranking") {
    return (
      <div className="rankingOfficeTopList">
        {data.map((group) => (
          <section className="rankingOfficeGroup" key={group.office}>
            <div className="rankingOfficeGroupHeader">{t("table.officeTop3Header", { office: group.office })}</div>
            {group.players.map((player) => (
              <div className="rankingRow compact" key={player.playerId}>
                <span className="rankingRankCircle">{player.rank}</span>
                <div className="rankingRowInfo">
                  <b>{player.name}</b>
                  <small>{completedLabel(player.completedAt)}</small>
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
          <h3>{t("table.officeTop3HeaderSpaced", { office: group.office })}</h3>
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
