// 从 PocketBase 导出 questions 集合全部题目为干净 UTF-8 JSON
import { writeFileSync } from "node:fs";

const BASE = process.env.PB_URL || "http://127.0.0.1:8090";

async function main() {
  const all = [];
  let page = 1;
  let totalPages = 1;
  do {
    const res = await fetch(`${BASE}/api/collections/questions/records?perPage=200&page=${page}&sort=order`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    all.push(...data.items);
    totalPages = data.totalPages;
    page++;
  } while (page <= totalPages);

  writeFileSync("f:/HS/questions_export.json", JSON.stringify(all, null, 2), "utf8");
  console.log(`Exported ${all.length} questions`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
