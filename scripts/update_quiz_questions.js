const PocketBase = require('pocketbase/cjs');

const PB_URL = process.env.PB_URL || 'http://127.0.0.1:8090';
const PB_ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL || 'admin@example.com';
const PB_ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD || 'password';

const newQuizQuestions = [
  {
    gameKey: "quiz",
    type: "single",
    title: "本系统推荐的大屏刷新频率是？",
    options: ["每1秒", "每3秒", "每10秒", "每30秒"],
    correctAnswer: "每3秒",
    score: 20,
    order: 1,
    isActive: true
  },
  {
    gameKey: "quiz",
    type: "single",
    title: "用户注册时用于防重复参赛的核心字段是？",
    options: ["手机号", "头像", "浏览器颜色", "屏幕尺寸"],
    correctAnswer: "手机号",
    score: 20,
    order: 2,
    isActive: true
  },
  {
    gameKey: "quiz",
    type: "single",
    title: "Quick Quiz 每题分值是多少？",
    options: ["5分", "10分", "20分", "30分"],
    correctAnswer: "20分",
    score: 20,
    order: 3,
    isActive: true
  },
  {
    gameKey: "quiz",
    type: "single",
    title: "本项目默认不强依赖哪种复杂架构？",
    options: ["复杂WebSocket房间系统", "Next.js页面", "PocketBase接口", "SQLite数据库"],
    correctAnswer: "复杂WebSocket房间系统",
    score: 20,
    order: 4,
    isActive: true
  },
  {
    gameKey: "quiz",
    type: "single",
    title: "活动结束后建议做什么？",
    options: ["导出数据复盘", "删除所有代码", "关闭所有题目不备份", "只看大屏不保存"],
    correctAnswer: "导出数据复盘",
    score: 20,
    order: 5,
    isActive: true
  }
];

async function updateQuizQuestions() {
  console.log('Connecting to PocketBase:', PB_URL);
  const pb = new PocketBase(PB_URL);

  try {
    await pb.health.check();
    console.log('PocketBase is healthy');
  } catch (error) {
    console.error('PocketBase not available:', error.message);
    process.exit(1);
  }

  try {
    await pb.collection('_superusers').authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD);
    console.log('Admin authentication successful');
  } catch (error) {
    try {
      await pb.admins.authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD);
      console.log('Admin authentication successful (legacy)');
    } catch (legacyError) {
      console.error('Admin authentication failed:', error.message);
      process.exit(1);
    }
  }

  console.log('Deleting existing quiz questions...');
  try {
    const existingQuestions = await pb.collection('questions').getFullList({ filter: 'gameKey = "quiz"' });
    for (const question of existingQuestions) {
      await pb.collection('questions').delete(question.id);
      console.log(`Deleted question: ${question.id}`);
    }
  } catch (error) {
    console.log('No existing quiz questions to delete');
  }

  console.log('Creating new quiz questions (5 sectors x 1 question x 20 points)...');
  for (const question of newQuizQuestions) {
    try {
      const created = await pb.collection('questions').create(question);
      console.log(`Created quiz question order ${question.order}: ${created.id}`);
    } catch (error) {
      console.warn(`Failed to create quiz question order ${question.order}:`, error.message);
    }
  }

  console.log('Quiz questions updated successfully!');
}

updateQuizQuestions().catch(console.error);
