type ScorePanelProps = {
  totalScore: number;
  rank: number;
};

export default function ScorePanel({ totalScore, rank }: ScorePanelProps) {
  return (
    <section className="lobbyScoreGrid">
      <div>
        <span>累计积分</span>
        <b>{totalScore}</b>
      </div>
      <div>
        <span>当前总排名</span>
        <b>{rank || "-"}</b>
      </div>
    </section>
  );
}
