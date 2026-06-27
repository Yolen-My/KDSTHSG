"use client";

import Image from "next/image";
import { useI18n } from "@/lib/i18n";

const RESULT_TITLE_IMAGES: Record<
  string,
  { src: string; width: number; height: number; className?: string }
> = {
  "预言家验词": { src: "/image/source/bingo/bingo-title.png", width: 246, height: 20 },
  "狼人悍跳": {
    src: "/image/source/story/story-title.png",
    width: 244,
    height: 20,
    className: "resultModalTitleImage resultModalTitleImageStory"
  },
  守卫者之夜: {
    src: "/image/source/elimination/modal-title.png",
    width: 212,
    height: 20,
    className: "resultModalTitleImage resultModalTitleImageElimination"
  },
  "猎人快答": { src: "/image/source/quiz/quiz-title.png", width: 242, height: 20 }
};

type EliminationModalStyle = "auto" | "standard" | "correct" | "wrong";

type ResultModalProps = {
  open: boolean;
  gameName: string;
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
  const { t } = useI18n();
  if (!open) return null;

  const handleClick = onClose || onBackLobby;
  const titleImage = RESULT_TITLE_IMAGES[gameName];
  const isElimination = gameName === "守卫者之夜";
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
  const eliminationTitleImage = titleImage ?? RESULT_TITLE_IMAGES["守卫者之夜"];

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
                <span className="resultModalEyebrow">{t("modal.gameCompleted")}</span>
                {showEliminationStatus ? (
                  <h2 className="resultModalEliminationTitle">
                    {resolvedEliminationStyle === "wrong" ? t("modal.eliminationWrong") : t("modal.eliminationCorrect")}
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
                <span className="resultModalEyebrow">{t("modal.gameOver")}</span>
                <h2 className="resultModalTitle">{t("modal.eliminationWrong")}</h2>
              </>
            ) : (
              <>
                <span className="resultModalEyebrow">{t("modal.gameCompleted")}</span>
                {titleImage ? (
                  <Image
                    alt={gameName}
                    className={titleImage.className ?? "resultModalTitleImage"}
                    height={titleImage.height}
                    src={titleImage.src}
                    width={titleImage.width}
                  />
                ) : (
                  <h2 className="resultModalTitle">{gameName}</h2>
                )}
              </>
            )}
          </div>

          <div className="resultModalMain">
            <div className="resultModalScore">{roundScore}</div>
            {!hideScore && (!isEliminated || isElimination) && (
              <p className="resultModalStats">
                {t("modal.stats", { total: totalScore })}<span className="resultModalRank">{rank || "-"}</span>
              </p>
            )}
          </div>

          <div className="resultModalFooter">
            <button className="resultModalButton" type="button" onClick={handleClick}>
              {buttonText || t("modal.backLobby")}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
