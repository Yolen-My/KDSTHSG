import { calculateBingoScore } from "@/lib/scoring";
import type { Question } from "@/types";

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function normalizeBingoWord(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

function getQuestionWords(question: Question): string[] {
  return [question.title, question.titleEn].filter((word): word is string => Boolean(word));
}

function getCorrectAnswerWords(question: Question): string[] {
  const raw = Array.isArray(question.correctAnswer) ? question.correctAnswer : [question.correctAnswer];
  const rawEn = Array.isArray(question.correctAnswerEn)
    ? question.correctAnswerEn
    : question.correctAnswerEn !== undefined
      ? [question.correctAnswerEn]
      : [];
  return [...raw, ...rawEn].filter((word): word is string => typeof word === "string" && word.trim().length > 0);
}

function questionMatchesWord(question: Question, word: string): boolean {
  const normalized = normalizeBingoWord(word);
  return getQuestionWords(question).some((candidate) => normalizeBingoWord(candidate) === normalized);
}

export function isBingoCorrectQuestion(question: Question): boolean {
  if (question.gameKey !== "bingo") return false;
  const questionWords = getQuestionWords(question).map(normalizeBingoWord);
  const correctWords = getCorrectAnswerWords(question).map(normalizeBingoWord);
  return correctWords.some((answer) => questionWords.includes(answer));
}

export function getBingoTargetWords(questions: Question[]): string[] {
  return questions.filter(isBingoCorrectQuestion).map((question) => question.title);
}

export function calculateBingoSelection(
  questions: Question[],
  answers: Record<string, unknown>,
  fallbackScore = 0
): {
  selectedWords: string[];
  targetWords: string[];
  correctCount: number;
  score: number;
} {
  const bingoQuestions = questions.filter((question) => question.gameKey === "bingo");
  const selectedQuestionIds = asStringArray(answers.selectedQuestionIds);
  const selectedQuestions = selectedQuestionIds
    .map((id) => bingoQuestions.find((question) => question.id === id))
    .filter((question): question is Question => Boolean(question));

  const fallbackWords = asStringArray(answers.selectedWords);
  const selectedWords = selectedQuestions.length > 0
    ? selectedQuestions.map((question) => question.title)
    : fallbackWords;
  const targetWords = getBingoTargetWords(bingoQuestions);
  const targetWordSet = new Set(targetWords.map(normalizeBingoWord));

  const correctCount = selectedQuestions.length > 0
    ? selectedQuestions.filter(isBingoCorrectQuestion).length +
      (selectedQuestions.length === 9 && selectedQuestions.every(isBingoCorrectQuestion) ? 1 : 0)
    : fallbackWords.filter((word) => {
        const matchedQuestion = bingoQuestions.find((question) => questionMatchesWord(question, word));
        return matchedQuestion ? isBingoCorrectQuestion(matchedQuestion) : targetWordSet.has(normalizeBingoWord(word));
      }).length +
      (fallbackWords.length === 9 && fallbackWords.every((word) => {
        const matchedQuestion = bingoQuestions.find((question) => questionMatchesWord(question, word));
        return matchedQuestion ? isBingoCorrectQuestion(matchedQuestion) : targetWordSet.has(normalizeBingoWord(word));
      }) ? 1 : 0);

  const score = selectedWords.length === 0 && selectedQuestions.length === 0
    ? Math.max(0, Math.min(100, Math.round(fallbackScore)))
    : Math.max(0, Math.min(100, Math.round(calculateBingoScore(correctCount))));

  return { selectedWords, targetWords, correctCount, score };
}
