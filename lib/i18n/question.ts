import type { Question } from "@/types";
import type { Locale } from "./locales";

// 题目内容多语言（方案A）：展示用英文，判分仍用规范中文值。
// 选项按索引与规范 options 对齐，optionsEn[i] 缺失时回退到 options[i]。

export function localizedTitle(question: Question, locale: Locale): string {
  if (locale === "en" && question.titleEn) return question.titleEn;
  return question.title;
}

// 返回与 question.options 等长的展示标签数组（值仍取规范 options）。
export function localizedOptionLabel(question: Question, index: number, locale: Locale): string {
  const canonical = question.options?.[index] ?? "";
  if (locale === "en" && question.optionsEn && question.optionsEn[index]) {
    return question.optionsEn[index];
  }
  return canonical;
}

// Bingo 词库：根据规范标题查找其英文展示文本。
export function localizedWord(questions: Question[], canonicalTitle: string, locale: Locale): string {
  if (locale !== "en") return canonicalTitle;
  const match = questions.find((q) => q.title === canonicalTitle);
  return match?.titleEn || canonicalTitle;
}

// 将规范答案文本映射为展示文本（用于 review 展示正确答案）。
export function localizedAnswerText(question: Question, canonicalAnswer: string, locale: Locale): string {
  if (locale !== "en" || !question.options || !question.optionsEn) return canonicalAnswer;
  const idx = question.options.indexOf(canonicalAnswer);
  if (idx >= 0 && question.optionsEn[idx]) return question.optionsEn[idx];
  return canonicalAnswer;
}
