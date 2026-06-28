"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import type { GameKey } from "@/types";

const RESULT_TITLE_IMAGES: Record<
  GameKey,
  { src: string; width: number; height: number; className?: string }
> = {
  bingo: { src: "/image/source/bingo/bingo-title.png", width: 246, height: 20 },
  story: {
    src: "/image/source/story/story-title.png",
    width: 244,
    height: 20,
    className: "resultModalTitleImage resultModalTitleImageStory"
  },
  elimination: {
    src: "/image/source/elimination/modal-title.png",
    width: 212,
    height: 20,
    className: "resultModalTitleImage resultModalTitleImageElimination"
  },
  quiz: { src: "/image/source/quiz/quiz-title.png", width: 242, height: 20 }
};

type EliminationModalStyle = "auto" | "standard" | "correct" | "wrong";

type ResultModalProps = {
  open: boolean;
  gameName: string;
  gameKey?: GameKey;
  roundScore: number;
  totalScore: number;
  rank: number;
  onBackLobby: () => void;
  buttonText?: string;
  isEliminated?: boolean;
  onClose?: () => void;
  eliminationModalStyle?: EliminationModalStyle;
  hideScore?: boolean;
};

const ELIMINATION_CORNER_BADGES = {
  wrong: { src: "/image/source/elimination/modal-wrong.png", width: 86, height: 86 },
  correct: { src: "/image/source/elimination/modal-correct.png", width: 73, height: 73 }
} as const;

export default function ResultModal({
  open,
  gameName,
  gameKey,
  roundScore,
  totalScore,
  rank,
  onBackLobby,
  buttonText,
  isEliminated = false,
  onClose,
  eliminationModalStyle = "auto",
  hideScore = false
}: ResultModalProps) {
  const t = useTranslations();
  if (!open) return null;

  const handleClick = onClose || onBackLobby;
  const titleImage = gameKey ? RESULT_TITLE_IMAGES[gameKey] : undefined;
  const isElimination = gameKey === "elimination";
  const resolvedEliminationStyle: Exclude<EliminationModalStyle, "auto"> = isElimination
    ? eliminationModalStyle === "auto"
      ? isEliminated
        ? "wrong"
        : "correct"
      : eliminationModalStyle
    : "standard";
  const showEliminationStatus =
    isElimination && (resolvedEliminationStyle === "wrong" || resolvedEliminationStyle === "correct");
  const cornerBadge =
    showEliminationStatus && resolvedEliminationStyle === "wrong"
      ? ELIMINATION_CORNER_BADGES.wrong
      : showEliminationStatus && resolvedEliminationStyle === "correct"
        ? ELIMINATION_CORNER_BADGES.correct
        : null;
  const eliminationTitleImage = titleImage ?? RESULT_TITLE_IMAGES.elimination;

  return (
    <div className="modalMask">
      <section className={`resultModal${isElimination ? " resultModal--elimination" : ""}`}>
        {cornerBadge ? (
          <div
            aria-hidden="true"
            className={`resultModalCornerBadge${resolvedEliminationStyle === "wrong" ? " resultModalCornerBadgeWrong" : " resultModalCornerBadgeCorrect"}`}
          >
            <Image
              alt=""
              className="resultModalCornerBadgeImage"
              height={cornerBadge.height}
              src={cornerBadge.src}
              width={cornerBadge.width}
            />
          </div>
        ) : null}
        <div className="resultModalGlow" aria-hidden="true" />
        <div className="resultModalBody">
          <div className="resultModalHeader">
            {isElimination ? (
              <>
                <span className="resultModalEyebrow">{t("resultModal.eyebrowComplete")}</span>
                {showEliminationStatus ? (
                  <h2 className="resultModalEliminationTitle">
                    {resolvedEliminationStyle === "wrong" ? t("resultModal.eliminated") : t("resultModal.survived")}
                  </h2>
                ) : eliminationTitleImage ? (
                  <Image
                    alt={gameName}
                    className={eliminationTitleImage.className ?? "resultModalTitleImage"}
                    height={eliminationTitleImage.height}
                    src={eliminationTitleImage.src}
                    width={eliminationTitleImage.width}
                  />
                ) : (
                  <h2 className="resultModalTitle">
                    {gameName.includes("\n") ? (
                      gameName.split("\n").map((line, i) => <span key={i}>{line}</span>)
                    ) : (
                      gameName
                    )}
                  </h2>
                )}
              </>
            ) : isEliminated ? (
              <>
                <span className="resultModalEyebrow">{t("resultModal.eyebrowOver")}</span>
                <h2 className="resultModalTitle">{t("resultModal.eliminated")}</h2>
              </>
            ) : (
              <>
                <span className="resultModalEyebrow">{t("resultModal.eyebrowComplete")}</span>
                {titleImage ? (
                  <Image
                    alt={gameName}
                    className={titleImage.className ?? "resultModalTitleImage"}
                    height={titleImage.height}
                    src={titleImage.src}
                    width={titleImage.width}
                  />
                ) : (
                  <h2 className="resultModalTitle">
                    {gameName.includes("\n") ? (
                      gameName.split("\n").map((line, i) => <span key={i}>{line}</span>)
                    ) : (
                      gameName
                    )}
                  </h2>
                )}
              </>
            )}
          </div>

          <div className="resultModalMain">
            <div className="resultModalScore">{roundScore}</div>
            {!hideScore && (!isEliminated || isElimination) && (
              <p className="resultModalStats">
                {t.rich("resultModal.stats", {
                  total: totalScore,
                  rank: rank || "-",
                  r: (chunks) => <span className="resultModalRank">{chunks}</span>
                })}
              </p>
            )}
          </div>

          <div className="resultModalFooter">
            <button className="resultModalButton" type="button" onClick={handleClick}>
              {buttonText || t("common.backToLobbyShort")}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
