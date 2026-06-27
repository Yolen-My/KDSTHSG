import type { GameKey } from "@/types";

// 中文字典。键采用点分命名空间，例如 register.name。
export const zh = {
  // 游戏名称
  game: {
    bingo: "预言家验词",
    quiz: "猎人快答",
    story: "狼人悍跳",
    elimination: "守卫者之夜",
    review: "温故知新"
  } satisfies Record<GameKey | "review", string>,

  // 通用导航与公共文案
  common: {
    lobby: "活动大厅",
    ranking: "排行榜",
    review: "温故知新",
    backLobby: "回到大厅",
    backToLobby: "返回活动大厅",
    redirecting: "正在跳转...",
    loadingIdentity: "正在读取身份...",
    gameLoading: "游戏加载中，请耐心等待",
    questionLoading: "题库加载中，请稍候",
    questionReloading: "题库正在重新加载：{error}",
    noQuestion: "暂无题目",
    submit: "提交",
    submitting: "提交中...",
    submitFailed: "提交失败",
    completed: "已完成",
    finished: "已结束",
    notOpen: "未开放",
    waitingOpen: "等待开启",
    canAnswer: "可答题",
    continueAnswer: "继续答题",
    opened: "已开启",
    enterAnswer: "进入答题",
    waitingHost: "等待主持人开启",
    statusPrefix: "状态：",
    person: "人"
  },

  // 语言切换
  locale: {
    switchToEn: "EN",
    switchToZh: "中文"
  },

  // 首页
  landing: {
    title: "年会互动游戏系统",
    desc: "手机端四关游戏、自动判分、防重复提交、实时排行榜、大屏和简易后台控制。",
    start: "开始参与",
    screen: "大屏演示",
    admin: "后台控制",
    ranking: "排行榜"
  },

  // 注册页
  register: {
    name: "姓名",
    namePlaceholder: "请输入姓名",
    phone: "手机号",
    phonePlaceholder: "请输入手机号",
    office: "OFFICE",
    officePlaceholder: "请选择Office",
    officeNotFound: "未找到匹配 Office",
    submit: "确认",
    submitting: "处理中...",
    invalidName: "请输入有效姓名",
    emptyPhone: "手机号不能为空",
    registerFailed: "注册失败",
    welcomeBack: "欢迎回来，正在恢复您的参赛信息...",
    registerSuccess: "注册成功，正在进入活动大厅..."
  },

  // 大厅页
  lobby: {
    player: "PLAYER",
    cumulativeScore: "累计积分",
    currentRank: "当前总排名",
    maxScore: "满分 {score}分",
    statusDone: "已完成",
    statusFinished: "已结束",
    statusNotOpen: "未开放",
    statusOpened: "已开启",
    statusWaitingOpen: "等待开启",
    statusContinue: "继续答题",
    statusWaitingBoss: "等待 Boss 发言"
  },

  // 排行榜页
  ranking: {
    notRanked: "未上榜",
    rankNo: "第 {rank} 名",
    totalScore: "TOTAL SCORE",
    totalRanking: "总排行榜",
    officeAverage: "地区平均分排行榜",
    officeTop3: "各地区 TOP3",
    officeTop3Suffix: "TOP3",
    completedTime: "完成时间：",
    notCompleted: "未完成"
  },

  // 最终成绩页
  result: {
    loadingScore: "正在读取成绩...",
    notFound: "未找到当前用户，请重新注册。",
    pageTitle: "最终成绩",
    totalScore: "TOTAL SCORE",
    ranking: "排行",
    missingGames: "还有 {count} 个游戏未完成，当前展示的是已完成环节成绩。",
    distanceToTop10: "距离 TOP10 还差 {score} 分",
    previousPlayer: "当前上一名：{name}，差距 {gap} 分。",
    top10: "总排行榜 TOP10",
    officeAverage: "地区平均分",
    officeTop3: "各地区 TOP3"
  },

  // Bingo 预言家验词
  bingo: {
    bannerSub: "猜对词语，完成 Bingo",
    phaseNotice: "Boss 发言已完成，提交后系统将自动判分。",
    finished: "Bingo 已结束",
    timeUp: "时间到",
    autoSubmitting: "正在自动提交...",
    hint: "请从词库中选择9个词组成 Bingo 宫格",
    needNineWords: "请从 30 个词中选择 9 个组成 Bingo 宫格"
  },

  // Quiz 猎人快答
  quiz: {
    bannerProgress: "Quiz总进度已完成{completed}/{total}",
    startEyebrow: "游戏准备",
    startInfo1: "共5个板块，每板块1题",
    startInfo2: "每题20分，猎人快答总分100分",
    startButton: "开始答题",
    notOpen: "Quiz 尚未开放",
    syncing: "正在同步 Quiz 状态...",
    sectorNotExist: "该 Quiz 板块不存在",
    sectorCompleted: "该 Quiz 板块已完成",
    sectorNotOpen: "该 Quiz 板块尚未开放",
    sectorNoQuestion: "该 Quiz 板块暂无题目",
    backToSector: "返回 Quiz 板块选择",
    questionCount: "题目{current}/{total}",
    selectedCount: "本组已选择 {answered}/{total}",
    chooseToContinue: "选择答案后继续",
    selectFirst: "请先选择本题答案",
    submitGroup: "提交本组",
    continue: "继续",
    sectorDoneTitle: "{name} 已完成\n您该轮的得分",
    backPrev: "返回上一页"
  },

  // Story 狼人悍跳
  story: {
    bannerProgress: "Group总进度已完成{completed}/{total}",
    notOpen: "狼人悍跳尚未开放",
    groupNotExist: "该 Group 不存在",
    groupCompleted: "该 Group 已完成",
    groupNotOpen: "该 Group 尚未开放",
    groupNoQuestion: "该 Group 暂无题目",
    backToGroup: "返回 Group 选择",
    questionOneOfOne: "题目1/1",
    countdown: "答题倒计时",
    timeUp: "时间到",
    progress: "已完成 {completed}/{total}",
    submittingFinal: "正在提交最终成绩...",
    chooseToReturn: "选择答案后返回 Group 选择",
    alreadyDone: "该游戏已完成，本关得分 {score}，不能重复提交。",
    submitFinal: "提交最终成绩",
    backLobby: "返回大厅"
  },

  // Elimination 守卫者之夜
  elimination: {
    bannerProgress: "Mission总进度已完成{completed}/{total}",
    notOpen: "守卫者之夜尚未开放",
    missionNotExist: "该 Mission 不存在",
    missionCompleted: "该 Mission 已完成",
    missionNotOpen: "该 Mission 尚未开放",
    missionNoQuestion: "该 Mission 暂无题目",
    backToMission: "返回 Mission 选择",
    questionOneOfOne: "题目1/1",
    countdown: "答题倒计时",
    timeUp: "时间到",
    progress: "已完成 {completed}/{total}",
    submittingFinal: "正在提交最终成绩...",
    chooseToReturn: "选择答案后返回 Mission 选择",
    alreadyDone: "该游戏已完成，本关得分 {score}，不能重复提交。",
    submitFinal: "提交最终成绩",
    viewFinalScore: "查看最终成绩"
  },

  // 温故知新页
  review: {
    loadingIdentity: "正在读取身份...",
    empty: "暂无已完成的游戏记录",
    score: "得分：",
    correctTargets: "答对 {count} 个目标词",
    correctAnswer: "正确答案：",
    total: "总分：",
    sectorScore: "得分 {score} / 20",
    yourAnswer: "你的答案：",
    notAnswered: "未作答",
    rightAnswer: "正确答案："
  },

  // 结果弹窗 ResultModal / WaitingModal / CorrectAnswerModal / QuizStartModal
  modal: {
    gameCompleted: "游戏完成",
    gameOver: "游戏结束",
    eliminationWrong: "遗憾淘汰，请坐下",
    eliminationCorrect: "恭喜答对，保持站立",
    stats: "累计积分 {total} 当前排名 ",
    backLobby: "回到大厅",
    nextQuestion: "下一题",
    correctTitle: "恭喜答对",
    wrongTitle: "遗憾答错",
    timeoutTitle: "遗憾超时",
    submittedEyebrow: "已提交",
    timeoutEyebrow: "已超时",
    waitingSubmitted: "感谢提交，认真听讲时刻到了，演讲结束后，会揭幕结果",
    waitingTimeout: "很遗憾已超时，请继续认真听讲，演讲结束后，查看结果"
  },

  // 大屏页
  screen: {
    title: "互动游戏大厅",
    participantSuffix: "人参与",
    qrText: "微信扫一扫参加游戏",
    loading: "加载中...",
    totalRanking: "总排行榜",
    officeAverage: "地区平均分排行榜",
    officeTop3: "各地区 TOP3"
  }
};

export type Dictionary = typeof zh;
