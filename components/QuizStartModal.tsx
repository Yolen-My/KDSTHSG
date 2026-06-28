"use client";

import { useTranslations } from "next-intl";

type QuizStartModalProps = {
  open: boolean;
  onStart: () => void;
};

export default function QuizStartModal({ open, onStart }: QuizStartModalProps) {
  const t = useTranslations();
  if (!open) return null;

  return (
    <div className="modalMask">
      <section className="resultModal">
        <div className="resultModalGlow" aria-hidden="true" />
        <div className="resultModalBody">
          <div className="resultModalHeader">
            <span className="resultModalEyebrow">{t("quizStartModal.eyebrow")}</span>
            <h2 className="resultModalTitle">{t("game.name.quiz")}</h2>
          </div>

          <div className="resultModalMain">
            <p className="resultModalWaiting">{t("quizStartModal.line1")}</p>
            <p className="resultModalWaiting">{t("quizStartModal.line2")}</p>
          </div>

          <div className="resultModalFooter">
            <button className="resultModalButton" type="button" onClick={onStart}>
              {t("quizStartModal.start")}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
