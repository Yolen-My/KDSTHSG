"use client";

import Image from "next/image";

type WaitingModalProps = {
  open: boolean;
  gameName: string;
  timeout?: boolean;
};

export default function WaitingModal({ open, gameName, timeout = false }: WaitingModalProps) {
  if (!open) return null;

  const showTitleImage = /bingo/i.test(gameName);
  const eyebrowText = timeout ? "已超时" : "已提交";
  const waitingText = timeout
    ? "很遗憾已超时，请继续认真听讲，演讲结束后，查看结果"
    : "感谢提交，认真听讲时刻到了，演讲结束后，会揭幕结果";

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
