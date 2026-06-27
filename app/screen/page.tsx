"use client";

import Image from "next/image";
import { useRanking } from "@/hooks/use-game-data";

// ─── 大屏专用工具函数 ──────────────────────────────────────────────────────
function ScreenStatus({ completedAt }: { completedAt?: string }) {
  if (!completedAt) {
    return (
      <>
        <span className="zh">完成时间</span>{" "}
        <span className="en">Completion Time:</span>{" "}
        <span className="zh">未完成</span>{" "}
        <span className="en">Not Completed</span>
      </>
    );
  }
  const time = new Date(completedAt).toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });
  return (
    <>
      <span className="zh">完成时间</span>{" "}
      <span className="en">Completion Time:</span> {time}
    </>
  );
}

// ─── 大屏专用组件 ───────────────────────────────────────────────────────────

function ScreenRankingTable({ data }: { data: Array<{ rank: number; name: string; office: string; totalScore: number; completedAt?: string; playerId: string }> }) {
  return (
    <div className="screenRankingList">
      {data.map((item) => (
        <div className="screenRankingRow" key={item.playerId}>
          {item.rank === 1 ? (
            <div className="screenRankMedal">
              <Image src="/image/source/ranking/medal-top1.png" alt="" width={34} height={34} />
            </div>
          ) : item.rank === 2 ? (
            <div className="screenRankMedal">
              <Image src="/image/source/ranking/medal-top2.png" alt="" width={34} height={34} />
            </div>
          ) : item.rank === 3 ? (
            <div className="screenRankMedal">
              <Image src="/image/source/ranking/medal-top3.png" alt="" width={34} height={34} />
            </div>
          ) : (
            <span className="screenRankCircle">{item.rank}</span>
          )}
          <div className="screenRankingRowInfo">
            <b>{item.name}</b>
            <small>{item.office}</small>
            <small><ScreenStatus completedAt={item.completedAt} /></small>
          </div>
          <strong>{item.totalScore}</strong>
        </div>
      ))}
    </div>
  );
}

function ScreenOfficeAverageTable({ data }: { data: Array<{ office: string; averageScore: number; playerCount: number }> }) {
  return (
    <div className="screenOfficeAvgList">
      {data.map((item, idx) => (
        <div className="screenOfficeAvgRow" key={item.office}>
          <span className="screenRankCircle">{idx + 1}</span>
          <div className="screenOfficeAvgRowInfo">
            <b>{item.office}</b>
            <small><span className="zh">{item.playerCount}人</span><span className="en">Participants</span></small>
          </div>
          <strong>{item.averageScore}</strong>
        </div>
      ))}
    </div>
  );
}

function ScreenOfficeTop3Panel({ data }: { data: Array<{ office: string; players: Array<{ rank: number; name: string; totalScore: number; completedAt?: string; playerId: string }> }> }) {
  return (
    <div className="screenOfficeTop3List">
      {data.map((group) => (
        <section className="screenOfficeTop3Group" key={group.office}>
          <div className="screenOfficeTop3Header"><span className="en">{group.office} TOP 3</span></div>
          {group.players.map((player) => (
            <div className="screenOfficeTop3Row" key={player.playerId}>
              <span className="screenRankCircle small">{player.rank}</span>
              <div className="screenOfficeTop3RowInfo">
                <b>{player.name}</b>
                <small><ScreenStatus completedAt={player.completedAt} /></small>
              </div>
              <strong>{player.totalScore}</strong>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}

// ─── 主页面 ────────────────────────────────────────────────────────────────

export default function ScreenPage() {
  const { ranking, loading } = useRanking(null, 3000);

  return (
    <main className="screenPage">
      <div className="screenPageBg" aria-hidden="true">
        <Image
          className="screenPageBgImage"
          src="/image/source/screen/page-bg.png"
          alt=""
          fill
          priority
          sizes="100vw"
        />
        <div className="screenPageBgGradient" />
      </div>

      <div className="screenPageContent">
        <div className="screenPageInner">
          <header className="screenHeader">
            <div className="screenHeaderMain">
              <span className="screenEyebrow">LIVE SCREEN</span>
              <h1 className="screenTitle"><span className="zh">互动游戏大厅</span><span className="en">Live Game Hub</span></h1>
              <p className="screenParticipantCount">
                <strong>{loading || !ranking ? "—" : ranking.players.length || 0}</strong>
                <span><span className="zh">人参与</span><span className="en">Participants</span></span>
              </p>
            </div>

            <div className="screenQrBlock">
              <div className="screenQrRow">
                <div className="screenDefineLogoWrap">
                  <Image
                    className="screenDefineLogo"
                    src="/image/source/screen/screen-define-the-game.png"
                    alt="Define The Game"
                    width={218}
                    height={132}
                    priority
                  />
                </div>
                <div className="screenQrWithText">
                  <div className="screenQrFrame">
                    <Image
                      className="screenQrImage"
                      src="/image/source/screen/qr-code.png"
                      alt="微信扫码参加游戏"
                      width={136}
                      height={136}
                      priority
                    />
                  </div>
                  <div className="screenQrTextGroup">
                    <p className="screenQrTextZh">微信扫一扫参加游戏</p>
                    <p className="screenQrTextEn">Scan to Join The Game</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {loading || !ranking ? (
            <div className="screenLoading">
              <div className="loadingSpinner">
                <div className="spinner"></div>
                <p>加载中...</p>
              </div>
            </div>
          ) : (
            <section className="screenGrid">
              <section className="screenPanel top10Panel">
                <div className="screenPanelHeader">
                  <div className="screenPanelTitle">
                    <span className="zh">总排行榜</span>
                    <span className="en">Overall Leaderboard</span>
                  </div>
                  <Image
                    className="screenTop10Watermark"
                    src="/image/source/ranking/top10-watermark.png"
                    alt=""
                    width={163}
                    height={40}
                    aria-hidden="true"
                  />
                </div>
                <ScreenRankingTable data={ranking.top10 || []} />
              </section>

              <div className="screenSideColumn">
                <section className="screenPanel">
                  <div className="screenPanelHeader compact">
                    <div className="screenPanelTitle">
                      <span className="zh">地区平均分排行榜</span>
                      <span className="en">Regional Average Score Leaderboard</span>
                    </div>
                  </div>
                  <ScreenOfficeAverageTable data={ranking.officeAverage || []} />
                </section>

                <section className="screenPanel">
                  <div className="screenPanelHeader compact">
                    <div className="screenPanelTitle">
                      <span className="zh">各地区TOP3</span>
                      <span className="en">Regional TOP 3</span>
                    </div>
                  </div>
                  <ScreenOfficeTop3Panel data={ranking.officeTop3 || []} />
                </section>
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
