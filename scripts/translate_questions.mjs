// 为 questions 集合的每道题填充 titleEn / optionsEn 并回写 PocketBase。
// 翻译按 id 精确映射；optionsEn 与 options 按索引一一对齐。
import { readFileSync } from "node:fs";

const BASE = process.env.PB_URL || "http://127.0.0.1:8090";
const ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL || "admin@example.com";
const ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD || "password";

// id -> { titleEn, optionsEn? }
const T = {
  // ── Bingo 词库 ──
  qibfy2nuy3oy6an: { titleEn: "Innovation Breakthrough" },
  phdp7ytirrk9utx: { titleEn: "Teamwork" },
  "7ke1uahwfvmrjon": { titleEn: "Customer First" },
  "6rpltaw5tl9tj6w": { titleEn: "Dedication" },
  k5ywnj5nhdvwk1p: { titleEn: "Experience" },
  "3cpm89zgtwu0o1q": { titleEn: "IC" },
  "8ejy4als0bnx5qe": { titleEn: "Value" },
  kisa2fxq299phoz: { titleEn: "Passion" },
  hqsba2gz3aesfng: { titleEn: "Mission" },
  "364qh7k90ns7rgh": { titleEn: "Cognition" },
  "2qode1bxz4jhdlr": { titleEn: "Competitiveness" },
  s5ugguozcb0y71s: { titleEn: "Challenge" },
  "9998w809ceh87zf": { titleEn: "Vision" },
  m6nqr28e508464j: { titleEn: "Computing Power" },
  rdcovnvwkz7zt2m: { titleEn: "AIDC" },
  d6hm7dqzjtulp7j: { titleEn: "Partnership Culture" },
  kta9au8hekjv5ng: { titleEn: "Geopolitics" },
  gscr89panrufm66: { titleEn: "Technological Change" },
  g6xi2voywvbu61y: { titleEn: "Domestic Substitution" },
  "0orq6rj7hpuquu0": { titleEn: "AI Agent" },
  "7bcwsemyouirzy3": { titleEn: "Post-investment Management" },
  "5quapr286juylw3": { titleEn: "Ecosystem Empowerment" },
  b7wmjp5aedzlbkz: { titleEn: "Technological Singularity" },
  e8hf6ktsvvyugsk: { titleEn: "Embodied Intelligence" },
  yk3ai411a2z84j2: { titleEn: "Going Global" },
  czgkgzspbcb5cix: { titleEn: "AGI Path" },
  feqxqs5agyquwwa: { titleEn: "Industry Depth" },
  g60w2dow4njwyse: { titleEn: "Offshore Fund" },
  jhwlgrfkhmzpkvd: { titleEn: "Energy Transition" },
  mocx8l1z7vdba0c: { titleEn: "Long-termism" },

  // ── Quiz 猎人快答 ──
  orztstlfytb48x7: {
    titleEn:
      "Professor Tang Jie of Zhipu AI sent an internal letter judging that \"2025 will surely be the year of the Agent,\" and then focused company resources on Coding and Agent. After which event was this internal letter sent?",
    optionsEn: [
      "After DeepSeek's release in January 2025",
      "After Manus's release in March 2025",
      "After Qwen 3's release in April 2025",
      "The year-end review internal letter in December 2025"
    ]
  },
  "2pp6s0htbtzsixy": {
    titleEn: "How many top-conference papers has the Xbench series published in total?",
    optionsEn: ["1 paper", "2 papers", "3 papers", "4 papers"]
  },
  "6ok741so38b8dtu": {
    titleEn: "What is the name of Mingming Hen Mang's new themed store?",
    optionsEn: ["Mingming Hen Da", "Snacks Are Huge", "Snack Kingdom", "Mingming Hen Xiao"]
  },
  zjt1iolw0gmzec6: {
    titleEn: "What indication is the world's first approved brain-computer interface product targeting?",
    optionsEn: [
      "Speech communication for ALS patients",
      "Hand function compensation for paralyzed patients",
      "Vision restoration for blind patients",
      "Motor control for Parkinson's patients"
    ]
  },
  "9wupp6zeb9bvrh0": {
    titleEn: "What is the advantage of Google's TPU over NVIDIA's GPU?",
    optionsEn: [
      "Single-chip compute power",
      "Interconnect bandwidth",
      "Cluster scale",
      "Software ecosystem compatibility"
    ]
  },

  // ── Story 狼人悍跳 ──
  et5grgtaqtvit4b: {
    titleEn: "Who is \"lying\" below?",
    optionsEn: [
      "Xing: When I started my internet venture, I hadn't even heard of the term \"VC\"",
      "Sindy: During my interview, Neil asked which high school I graduated from and why I came to Hong Kong for university instead of Europe or the US",
      "Brian: My four-year-old daughter now automatically asks whenever she sees me pulling my suitcase: where are you going to sell things with your boss this time?"
    ]
  },
  lq2qo877bdjvp1n: {
    titleEn: "Who is \"lying\" below?",
    optionsEn: [
      "Joe: The first time I met Qingsheng, he grabbed my phone and went through my photo album",
      "Taro: The first time I met Neil was at an Asian-style hotel in Paris",
      "Tiantian: I hand-built 6 apps, and my kid is a user of one of them"
    ]
  },

  // ── Elimination 守卫者之夜 ──
  h5gasmhe81v5rec: {
    titleEn: "Which ratio is closest to the headcount ratio of Deal Team to Function Team?",
    optionsEn: ["1:1", "1:1.5", "1:1.6", "1:2"]
  },
  "5ljcluwpd21gwfw": {
    titleEn: "In which year was HongShan's first overseas office established?",
    optionsEn: ["2022", "2023", "2024", "2025"]
  },
  k5zw8xd7e0mb3x3: {
    titleEn: "Which is closest to the total size of funds HongShan currently manages?",
    optionsEn: ["US$50B", "US$55B", "US$60B", "US$65B"]
  },
  "6dabfcyzsh7ymvm": {
    titleEn: "Which city does the HongShan team travel to most for business?",
    optionsEn: ["Shanghai", "Shenzhen", "Beijing", "Hong Kong"]
  },
  inmbfkwmhll7n9n: {
    titleEn: "How many colleagues won awards in today's Offsite AI session?",
    optionsEn: ["19", "20", "21", "22"]
  },
  "84vvgnpb9fjh9kl": {
    titleEn: "What is the largest age gap within the HongShan China team?",
    optionsEn: ["21", "22", "23", "24"]
  },
  "61512qnv2wa2apc": {
    titleEn: "Which is closest to the total number of companies HongShan has invested in?",
    optionsEn: ["1,000", "1,500", "2,000", "2,500"]
  },
  yceg5wz253frvbt: {
    titleEn: "How many employees have been with HongShan for over 5 years?",
    optionsEn: ["15", "16", "17", "18"]
  }
};

async function main() {
  const questions = JSON.parse(readFileSync("f:/HS/questions_export.json", "utf8"));

  // 以超级用户身份登录，获取写入 token
  let token = "";
  for (const path of ["/api/collections/_superusers/auth-with-password", "/api/admins/auth-with-password"]) {
    try {
      const res = await fetch(`${BASE}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identity: ADMIN_EMAIL, email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
      });
      if (res.ok) {
        const data = await res.json();
        token = data.token;
        break;
      }
    } catch {}
  }
  if (!token) {
    console.error("Admin auth failed. Set PB_ADMIN_EMAIL / PB_ADMIN_PASSWORD env vars.");
    process.exit(1);
  }

  // 完整性校验：每题都需有翻译；有选项的题 optionsEn 长度需对齐
  const missing = [];
  for (const q of questions) {
    const tr = T[q.id];
    if (!tr || !tr.titleEn) {
      missing.push(`${q.id} (${q.title})`);
      continue;
    }
    const optCount = Array.isArray(q.options) ? q.options.length : 0;
    if (optCount > 0) {
      if (!Array.isArray(tr.optionsEn) || tr.optionsEn.length !== optCount) {
        missing.push(`${q.id} optionsEn length mismatch (need ${optCount})`);
      }
    }
  }
  if (missing.length) {
    console.error("Missing/invalid translations:\n" + missing.join("\n"));
    process.exit(1);
  }

  let ok = 0;
  for (const q of questions) {
    const tr = T[q.id];
    const body = { titleEn: tr.titleEn };
    if (Array.isArray(q.options) && q.options.length > 0) {
      body.optionsEn = tr.optionsEn;
    }
    const res = await fetch(`${BASE}/api/collections/questions/records/${q.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: token },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const text = await res.text();
      console.error(`Failed ${q.id}: HTTP ${res.status} ${text}`);
      process.exit(1);
    }
    ok++;
  }
  console.log(`Updated ${ok}/${questions.length} questions with English translations.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
