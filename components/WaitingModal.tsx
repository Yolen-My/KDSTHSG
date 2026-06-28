"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import type { GameKey } from "@/types";

type WaitingModalProps = {
  open: boolean;
  gameName: string;
  gameKey?: GameKey;
  timeout?: boolean;
};

export default function WaitingModal({ open, gameName, gameKey, timeout = false }: WaitingModalProps) {
  const t = useTranslations();
  if (!open) return null;

  const showTitleImage = gameKey === "bingo";
  const eyebrowText = timeout ? t("waitingModal.timeoutEyebrow") : t("waitingModal.submittedEyebrow");
  const waitingText = timeout ? t("waitingModal.timeoutText") : t("waitingModal.submittedText");

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
