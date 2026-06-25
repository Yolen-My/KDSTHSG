/**
 * 生成 Question 导入模板 Excel
 * 运行: node scripts/generate-question-template.js
 */
const XLSX = require("xlsx");
const path = require("path");

const headers = [
  "gameKey",
  "type",
  "title",
  "title_en",
  "options",
  "options_en",
  "correctAnswer",
  "correctAnswer_en",
  "score",
  "order",
  "isActive",
  "sectorKey",
  "sectorName",
  "quizSessionIndex"
];

const descriptions = [
  "游戏类型(必填): bingo / quiz / story / elimination",
  "题目类型(必填): word / single / boolean / story",
  "题目文本(必填)",
  "题目文本(英文): 留空则英文模式回退中文",
  "选项(JSON数组): 如 [\"A\",\"B\",\"C\",\"D\"]，bingo词题留空",
  "选项英文(JSON数组): 顺序需与 options 一致",
  "正确答案(必填): 单选填答案文本，bingo词题填空串",
  "正确答案(英文): 需与 options_en 中对应项一致；bingo 正确词需等于 title_en",
  "分值(必填): 数字",
  "排序序号(必填): 数字，从小到大",
  "是否启用: true/false，默认true",
  "Sector键(quiz专用): 如 sector-1",
  "Sector名(quiz专用): 如 Sector 1",
  "Session索引(quiz专用): 0-4"
];

const examples = [
  ["bingo", "word", "年会互动", "Annual Party", "", "", "年会互动", "Annual Party", 10, 1, true, "", "", ""],
  ["bingo", "word", "团队协作", "Teamwork", "", "", "INCORRECT", "INCORRECT", 10, 2, true, "", "", ""],
  ["quiz", "single", "公司年会互动系统的现场目标人数约为？", "Roughly how many on-site participants is the system designed for?", "[\"100\",\"300\",\"500\",\"2000\"]", "[\"100\",\"300\",\"500\",\"2000\"]", "500", "500", 20, 1, true, "sector-1", "Sector 1", 0],
  ["quiz", "single", "本系统推荐使用哪个轻量数据库？", "Which lightweight database does the system recommend?", "[\"MongoDB\",\"SQLite\",\"Oracle\",\"Redis\"]", "[\"MongoDB\",\"SQLite\",\"Oracle\",\"Redis\"]", "SQLite", "SQLite", 20, 2, true, "sector-2", "Sector 2", 1],
  ["story", "story", "同事A的三个故事里，哪个是假故事？", "Which of colleague A's three stories is fake?", "[\"A.访谈12场\",\"B.误当生产服上线\",\"C.Excel做排行榜\"]", "[\"A. 12 interviews\",\"B. Hit prod by mistake\",\"C. Leaderboard in Excel\"]", "B.误当生产服上线", "B. Hit prod by mistake", 50, 1, true, "", "", ""],
  ["elimination", "single", "活动大屏不应展示什么？", "What should NOT be shown on the big screen?", "[\"姓名\",\"Office\",\"Team\",\"手机号\"]", "[\"Name\",\"Office\",\"Team\",\"Phone\"]", "手机号", "Phone", 20, 1, true, "", "", ""],
];

const ws = XLSX.utils.aoa_to_sheet([
  headers,
  descriptions,
  ...examples,
]);

// 列宽
ws["!cols"] = [
  { wch: 14 },  // gameKey
  { wch: 10 },  // type
  { wch: 40 },  // title
  { wch: 40 },  // title_en
  { wch: 40 },  // options
  { wch: 40 },  // options_en
  { wch: 25 },  // correctAnswer
  { wch: 25 },  // correctAnswer_en
  { wch: 8 },   // score
  { wch: 8 },   // order
  { wch: 10 },  // isActive
  { wch: 12 },  // sectorKey
  { wch: 12 },  // sectorName
  { wch: 14 },  // quizSessionIndex
];

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Questions");

const outPath = path.join(__dirname, "..", "question-template.xlsx");
XLSX.writeFile(wb, outPath);
console.log("模板已生成:", outPath);
