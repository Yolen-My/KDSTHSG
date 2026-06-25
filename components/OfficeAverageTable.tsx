"use client";

import { useTranslations } from "next-intl";
import type { OfficeAverageItem } from "@/types";

type OfficeAverageTableProps = {
  data: OfficeAverageItem[];
  variant?: "default" | "ranking";
};

export default function OfficeAverageTable({ data, variant = "default" }: OfficeAverageTableProps) {
  const t = useTranslations();
  if (variant === "ranking") {
    return (
      <div className="rankingList">
        {data.map((item) => (
          <div className="rankingRow" key={item.office}>
            <span className="rankingRankCircle">{item.rank}</span>
            <div className="rankingRowInfo">
              <b>{item.office}</b>
              <small>{t("table.peopleCount", { count: item.playerCount })}</small>
            </div>
            <strong>{item.averageScore}</strong>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="tablePanel compactTable">
      {data.map((item) => (
        <div className="tableRow" key={item.office}>
          <span>#{item.rank}</span>
          <b>{item.office}</b>
          <small>{t("table.peopleCountSpaced", { count: item.playerCount })}</small>
          <strong>{item.averageScore}</strong>
        </div>
      ))}
    </div>
  );
}
