"use client";

import Image from "next/image";
import { useI18n } from "@/lib/i18n";

type CorrectAnswerModalProps = {
  open: boolean;
  isCorrect: boolean;
  isTimeout?: boolean;
  onNext: () => void;
};

export default function CorrectAnswerModal({ open, isCorrect, isTimeout = false, onNext }: CorrectAnswerModalProps) {
  const { t } = useI18n();
  if (!open) return null;

  const getTitle = () => {
    if (isTimeout) return t("modal.timeoutTitle");
    return isCorrect ? t("modal.correctTitle") : t("modal.wrongTitle");
  };

  const getImage = () => {
    if (isTimeout) return { src: "/image/source/elimination/modal-wrong.png", width: 86, height: 86 };
    return isCorrect
      ? { src: "/image/source/elimination/modal-correct.png", width: 73, height: 73 }
      : { src: "/image/source/elimination/modal-wrong.png", width: 86, height: 86 };
  };

  const getBadgeClass = () => {
    if (isTimeout) return "resultModalCornerBadgeWrong";
    return isCorrect ? "resultModalCornerBadgeCorrect" : "resultModalCornerBadgeWrong";
  };

  const image = getImage();

  return (
    <div className="modalMask">
      <section className="resultModal resultModal--elimination resultModal--correctAnswer">
        <div
          aria-hidden="true"
          className={`resultModalCornerBadge ${getBadgeClass()}`}
        >
          <Image
            alt=""
            className="resultModalCornerBadgeImage"
            height={image.height}
            src={image.src}
            width={image.width}
          />
        </div>
        <div className="resultModalGlow" aria-hidden="true" />
        <div className="resultModalBody resultModalBody--centered">
          <div className="resultModalMain resultModalMain--centered">
            <div className="resultModalHeader resultModalHeader--centered">
              <span className="resultModalEyebrow">GAME COMPLETED</span>
              <h2 className="resultModalEliminationTitle">{getTitle()}</h2>
            </div>
          </div>

          <button
            className="resultModalButton"
            type="button"
            onClick={onNext}
          >
            {t("modal.nextQuestion")}
          </button>
        </div>
      </section>
    </div>
  );
}
