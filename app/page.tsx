"use client";

import { useI18n } from "@/lib/i18n";

export default function Home() {
  const { t } = useI18n();
  return (
    <main className="landingPage">
      <section className="landingHero">
        <div className="heroMark">HSG</div>
        <span className="eyebrow">ANNUAL GAME </span>
        <h1>
          HSG
          <span>{t("landing.title")}</span>
        </h1>
        <p>{t("landing.desc")}</p>
        <a className="primaryButton landingButton" href="/register">
          {t("landing.start")}
        </a>
        <div className="landingLinks">
          <a href="/screen">{t("landing.screen")}</a>
          <a href="/admin-control">{t("landing.admin")}</a>
          <a href="/ranking">{t("landing.ranking")}</a>
        </div>
      </section>
    </main>
  );
}
