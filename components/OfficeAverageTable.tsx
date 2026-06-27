"use client";

import type { OfficeAverageItem } from "@/types";
import { useI18n } from "@/lib/i18n";

type OfficeAverageTableProps = {
  data: OfficeAverageItem[];
  variant?: "default" | "ranking";
};

export default function OfficeAverageTable({ data, variant = "default" }: OfficeAverageTableProps) {
  const { t } = useI18n();
  if (variant === "ranking") {
    return (
      <div className="rankingList">
        {data.map((item) => (
          <div className="rankingRow" key={item.office}>
            <span className="rankingRankCircle">{item.rank}</span>
            <div className="rankingRowInfo">
              <b>{item.office}</b>
              <small>{item.playerCount}{t("common.person")}</small>
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
          <small>{item.playerCount} {t("common.person")}</small>
          <strong>{item.averageScore}</strong>
        </div>
      ))}
    </div>
  );
}
