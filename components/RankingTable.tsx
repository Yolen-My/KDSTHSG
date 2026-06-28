"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import type { RankingItem } from "@/types";

type RankingTableProps = {
  data: RankingItem[];
  currentPlayerId?: string;
  variant?: "default" | "ranking";
  bilingual?: boolean;
};

function formatTime(completedAt: string) {
  return new Date(completedAt).toLocaleTimeString("zh-CN", {
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

export default function RankingTable({ data, currentPlayerId, variant = "default", bilingual = false }: RankingTableProps) {
  const t = useTranslations();
  const completedLabel = (completedAt?: string) =>
    bilingual
      ? `${t("screen.completionLabel")} ${completedAt ? formatTime(completedAt) : t("screen.notStarted")}`
      : t("table.completedTime", { time: completedAt ? formatTime(completedAt) : t("table.notCompleted") });

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
              <small>{completedLabel(item.completedAt)}</small>
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
