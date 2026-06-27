"use client";

import Image from "next/image";
import { useI18n } from "@/lib/i18n";

type WaitingModalProps = {
  open: boolean;
  gameName: string;
  timeout?: boolean;
};

export default function WaitingModal({ open, gameName, timeout = false }: WaitingModalProps) {
  const { t } = useI18n();
  if (!open) return null;

  const showTitleImage = /bingo/i.test(gameName);
  const eyebrowText = timeout ? t("modal.timeoutEyebrow") : t("modal.submittedEyebrow");
  const waitingText = timeout ? t("modal.waitingTimeout") : t("modal.waitingSubmitted");

  return (
    <div className="modalMask">
      <section className="resultModal">
        <div className="resultModalGlow" aria-hidden="true" />
        <div className="resultModalBody">
          <div className="resultModalHeader">
            <span className="resultModalEyebrow">{eyebrowText}</span>
            {showTitleImage ? (
              <Image
                alt={gameName}
                className="resultModalTitleImage"
                height={20}
                src="/image/source/bingo/bingo-title.png"
                width={246}
              />
            ) : (
              <h2 className="resultModalTitle">{gameName}</h2>
            )}
          </div>

          <div className="resultModalMain">
            <p className="resultModalWaiting">{waitingText}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
