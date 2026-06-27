"use client";

import { useI18n } from "@/lib/i18n";

type QuizStartModalProps = {
  open: boolean;
  onStart: () => void;
};

export default function QuizStartModal({ open, onStart }: QuizStartModalProps) {
  const { t } = useI18n();
  if (!open) return null;

  return (
    <div className="modalMask">
      <section className="resultModal">
        <div className="resultModalGlow" aria-hidden="true" />
        <div className="resultModalBody">
          <div className="resultModalHeader">
            <span className="resultModalEyebrow">{t("quiz.startEyebrow")}</span>
            <h2 className="resultModalTitle">{t("game.quiz")}</h2>
          </div>

          <div className="resultModalMain">
            <p className="resultModalWaiting">{t("quiz.startInfo1")}</p>
            <p className="resultModalWaiting">{t("quiz.startInfo2")}</p>
          </div>

          <div className="resultModalFooter">
            <button className="resultModalButton" type="button" onClick={onStart}>
              {t("quiz.startButton")}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
