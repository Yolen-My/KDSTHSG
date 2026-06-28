import type { Question } from "@/types";
import type { Locale } from "./locales";

// 题目内容多语言：中文界面使用 title/options/correctAnswer；英文界面使用 titleEn/optionsEn/correctAnswerEn。
// 数据库字段是 snake_case(title_en/options_en/correctAnswer_en)，在 pb-storage 映射为 camelCase 供前端使用。

export function localizedTitle(question: Question, locale: Locale): string {
  if (locale === "en" && question.titleEn) return question.titleEn;
  return question.title;
}

export function localizedOptions(question: Question, locale: Locale): string[] {
  if (locale === "en" && Array.isArray(question.optionsEn) && question.optionsEn.length > 0) {
    return question.optionsEn;
  }
  return question.options || [];
}

export function localizedOptionLabel(question: Question, index: number, locale: Locale): string {
  return localizedOptions(question, locale)[index] ?? "";
}

export function answerValueForLocale(question: Question, index: number, locale: Locale): string {
  return localizedOptionLabel(question, index, locale);
}

export function correctAnswerForLocale(question: Question, locale: Locale): string | string[] {
  if (locale === "en" && question.correctAnswerEn) return question.correctAnswerEn;
  return question.correctAnswer;
}

export function isCorrectAnswerForLocale(question: Question, answer: string | undefined, locale: Locale, normalize?: (value: unknown) => string): boolean {
  if (!answer) return false;
  const correctAnswer = correctAnswerForLocale(question, locale);
  if (!normalize) {
    return Array.isArray(correctAnswer) ? correctAnswer.includes(answer) : correctAnswer === answer;
  }
  return Array.isArray(correctAnswer)
    ? correctAnswer.map(normalize).includes(normalize(answer))
    : normalize(correctAnswer) === normalize(answer);
}

// Bingo 词库：根据规范标题或英文标题查找当前语言展示文本。
export function localizedWord(questions: Question[], word: string, locale: Locale): string {
  if (locale !== "en") return word;
  const match = questions.find((q) => q.title === word || q.titleEn === word);
  return match?.titleEn || word;
}

export function localizedAnswerText(question: Question, answer: string, locale: Locale): string {
  if (locale === "en") {
    if (Array.isArray(question.options) && Array.isArray(question.optionsEn)) {
      const idx = question.options.indexOf(answer);
      if (idx >= 0 && question.optionsEn[idx]) return question.optionsEn[idx];
    }
    if (question.correctAnswerEn && !Array.isArray(question.correctAnswerEn)) return question.correctAnswerEn;
  }
  return answer;
}
