"use client";

type QuizStartModalProps = {
  open: boolean;
  onStart: () => void;
};

export default function QuizStartModal({ open, onStart }: QuizStartModalProps) {
  if (!open) return null;

  return (
    <div className="modalMask">
      <section className="resultModal">
        <div className="resultModalGlow" aria-hidden="true" />
        <div className="resultModalBody">
          <div className="resultModalHeader">
            <span className="resultModalEyebrow">游戏准备</span>
            <h2 className="resultModalTitle">猎人快答</h2>
          </div>

          <div className="resultModalMain">
            <p className="resultModalWaiting">共5个板块，每板块1题</p>
            <p className="resultModalWaiting">每题20分，猎人快答总分100分</p>
          </div>

          <div className="resultModalFooter">
            <button className="resultModalButton" type="button" onClick={onStart}>
              开始答题
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
