"use client";

import Image from "next/image";
import type { RankingItem } from "@/types";
import { useI18n } from "@/lib/i18n";

type RankingTableProps = {
  data: RankingItem[];
  currentPlayerId?: string;
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

function RankingRankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="rankingMedal" aria-hidden="true">
        <Image src="/image/source/ranking/medal-top1.png" alt="" width={58} height={58} />
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="rankingMedal" aria-hidden="true">
        <Image src="/image/source/ranking/medal-top2.png" alt="" width={58} height={58} />
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="rankingMedal" aria-hidden="true">
        <Image src="/image/source/ranking/medal-top3.png" alt="" width={58} height={58} />
      </div>
    );
  }
  return <span className="rankingRankCircle">{rank}</span>;
}

export default function RankingTable({ data, currentPlayerId, variant = "default" }: RankingTableProps) {
  const { t, locale } = useI18n();
  if (variant === "ranking") {
    return (
      <div className="rankingList">
        {data.map((item) => (
          <div
            className={`rankingRow ${item.playerId === currentPlayerId ? "current" : ""}`}
            key={item.playerId}
          >
            <RankingRankBadge rank={item.rank} />
            <div className="rankingRowInfo">
              <b>{item.name}</b>
              <small>{item.office}</small>
              <small>{t("ranking.completedTime")}{formatCompletedTime(item.completedAt, t("ranking.notCompleted"), locale)}</small>
            </div>
            <strong>{item.totalScore}</strong>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="tablePanel">
      {data.map((item) => (
        <div className={`tableRow ${item.playerId === currentPlayerId ? "current" : ""}`} key={item.playerId}>
          <span>#{item.rank}</span>
          <b>{item.name}</b>
          <small>{item.office} / {item.team}</small>
          <strong>{item.totalScore}</strong>
        </div>
      ))}
    </div>
  );
}
