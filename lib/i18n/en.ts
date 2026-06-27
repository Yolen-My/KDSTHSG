import type { Dictionary } from "./zh";

// 英文字典。结构必须与 zh 完全一致（由 Dictionary 类型保证）。
export const en: Dictionary = {
  game: {
    bingo: "Word Guess",
    quiz: "Speed Answer",
    story: "True or False",
    elimination: "Quiz Round",
    review: "Review"
  },

  common: {
    lobby: "Lobby",
    ranking: "Ranking",
    review: "Review",
    backLobby: "Back to Lobby",
    backToLobby: "Back to Lobby",
    redirecting: "Redirecting...",
    loadingIdentity: "Loading identity...",
    gameLoading: "Loading game, please wait...",
    questionLoading: "Loading questions, please wait...",
    questionReloading: "Reloading questions: {error}",
    noQuestion: "No questions available",
    submit: "Submit",
    submitting: "Submitting...",
    submitFailed: "Submission failed",
    completed: "Completed",
    finished: "Finished",
    notOpen: "Not open",
    waitingOpen: "Waiting to open",
    canAnswer: "Available",
    continueAnswer: "Continue",
    opened: "Open",
    enterAnswer: "Enter",
    waitingHost: "Waiting for host",
    statusPrefix: "Status: ",
    person: ""
  },

  locale: {
    switchToEn: "EN",
    switchToZh: "中文"
  },

  landing: {
    title: "Annual Game System",
    desc: "Mobile four-round games, auto scoring, anti-resubmission, live ranking, big screen and simple admin control.",
    start: "Get Started",
    screen: "Big Screen",
    admin: "Admin",
    ranking: "Ranking"
  },

  register: {
    name: "Name",
    namePlaceholder: "Enter your name",
    phone: "Phone",
    phonePlaceholder: "Enter your phone number",
    office: "OFFICE",
    officePlaceholder: "Select office",
    officeNotFound: "No matching office",
    submit: "Enter",
    submitting: "Processing...",
    invalidName: "Please enter a valid name",
    emptyPhone: "Phone number is required",
    registerFailed: "Registration failed",
    welcomeBack: "Welcome back, restoring your info...",
    registerSuccess: "Registered successfully, entering lobby..."
  },

  lobby: {
    player: "PLAYER",
    cumulativeScore: "Total Score",
    currentRank: "Current Rank",
    maxScore: "Max {score} pts",
    statusDone: "Completed",
    statusFinished: "Finished",
    statusNotOpen: "Not open",
    statusOpened: "Open",
    statusWaitingOpen: "Waiting to open",
    statusContinue: "Continue",
    statusWaitingBoss: "Waiting for Boss"
  },

  ranking: {
    notRanked: "Not ranked",
    rankNo: "Rank {rank}",
    totalScore: "TOTAL SCORE",
    totalRanking: "Overall Ranking",
    officeAverage: "Office Average Ranking",
    officeTop3: "Top 3 by Office",
    officeTop3Suffix: "TOP3",
    completedTime: "Completed: ",
    notCompleted: "Not completed"
  },

  result: {
    loadingScore: "Loading results...",
    notFound: "Player not found, please register again.",
    pageTitle: "Final Score",
    totalScore: "TOTAL SCORE",
    ranking: "Ranking",
    missingGames: "{count} game(s) not completed. Showing results for completed rounds only.",
    distanceToTop10: "{score} pts to reach TOP10",
    previousPlayer: "Player above you: {name}, {gap} pts behind.",
    top10: "Overall Ranking TOP10",
    officeAverage: "Office Average",
    officeTop3: "Top 3 by Office"
  },

  bingo: {
    bannerSub: "Guess the words to complete Bingo",
    phaseNotice: "Boss has finished speaking. Scores will be calculated automatically after you submit.",
    finished: "Bingo has ended",
    timeUp: "Time's up",
    autoSubmitting: "Auto-submitting...",
    hint: "Select 9 words to form your Bingo grid",
    needNineWords: "Select 9 of the 30 words to form your Bingo grid"
  },

  quiz: {
    bannerProgress: "Quiz progress {completed}/{total}",
    startEyebrow: "Get Ready",
    startInfo1: "5 sectors, 1 question each",
    startInfo2: "20 pts per question, 100 pts total",
    startButton: "Start",
    notOpen: "Quiz is not open yet",
    syncing: "Syncing quiz status...",
    sectorNotExist: "This quiz sector does not exist",
    sectorCompleted: "This quiz sector is completed",
    sectorNotOpen: "This quiz sector is not open yet",
    sectorNoQuestion: "No questions in this quiz sector",
    backToSector: "Back to Sector Selection",
    questionCount: "Question {current}/{total}",
    selectedCount: "Selected {answered}/{total}",
    chooseToContinue: "Choose an answer to continue",
    selectFirst: "Please select an answer first",
    submitGroup: "Submit",
    continue: "Continue",
    sectorDoneTitle: "{name} Completed\nYour score this round",
    backPrev: "Back"
  },

  story: {
    bannerProgress: "Group progress {completed}/{total}",
    notOpen: "True or False is not open yet",
    groupNotExist: "This group does not exist",
    groupCompleted: "This group is completed",
    groupNotOpen: "This group is not open yet",
    groupNoQuestion: "No questions in this group",
    backToGroup: "Back to Group Selection",
    questionOneOfOne: "Question 1/1",
    countdown: "Countdown",
    timeUp: "Time's up",
    progress: "Completed {completed}/{total}",
    submittingFinal: "Submitting final score...",
    chooseToReturn: "Choose an answer to return to Group Selection",
    alreadyDone: "Game completed. Your score: {score}. Cannot resubmit.",
    submitFinal: "Submit Final Score",
    backLobby: "Back to Lobby"
  },

  elimination: {
    bannerProgress: "Mission progress {completed}/{total}",
    notOpen: "Quiz Round is not open yet",
    missionNotExist: "This mission does not exist",
    missionCompleted: "This mission is completed",
    missionNotOpen: "This mission is not open yet",
    missionNoQuestion: "No questions in this mission",
    backToMission: "Back to Mission Selection",
    questionOneOfOne: "Question 1/1",
    countdown: "Countdown",
    timeUp: "Time's up",
    progress: "Completed {completed}/{total}",
    submittingFinal: "Submitting final score...",
    chooseToReturn: "Choose an answer to return to Mission Selection",
    alreadyDone: "Game completed. Your score: {score}. Cannot resubmit.",
    submitFinal: "Submit Final Score",
    viewFinalScore: "View Final Score"
  },

  review: {
    loadingIdentity: "Loading identity...",
    empty: "No completed game records yet",
    score: "Score: ",
    correctTargets: "{count} target words correct",
    correctAnswer: "Correct answers: ",
    total: "Total: ",
    sectorScore: "Score {score} / 20",
    yourAnswer: "Your answer: ",
    notAnswered: "Not answered",
    rightAnswer: "Correct answer: "
  },

  modal: {
    gameCompleted: "Game Completed",
    gameOver: "Game Over",
    eliminationWrong: "Eliminated, please sit down",
    eliminationCorrect: "Correct! Stay standing",
    stats: "Total {total} · Rank ",
    backLobby: "Back to Lobby",
    nextQuestion: "Next",
    correctTitle: "Correct!",
    wrongTitle: "Wrong answer",
    timeoutTitle: "Time's up",
    submittedEyebrow: "Submitted",
    timeoutEyebrow: "Timed out",
    waitingSubmitted: "Thanks for submitting. Time to listen carefully — results will be revealed after the speech.",
    waitingTimeout: "Unfortunately time's up. Please keep listening — results will be shown after the speech."
  },

  screen: {
    title: "Interactive Game Hall",
    participantSuffix: " joined",
    qrText: "Scan with WeChat to join",
    loading: "Loading...",
    totalRanking: "Overall Ranking",
    officeAverage: "Office Average Ranking",
    officeTop3: "Top 3 by Office"
  }
};
