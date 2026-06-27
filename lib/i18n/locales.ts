export type Locale = "zh" | "en";

export const DEFAULT_LOCALE: Locale = "zh";
export const SUPPORTED_LOCALES: Locale[] = ["zh", "en"];
export const LOCALE_STORAGE_KEY = "annual_game_locale";

export function isLocale(value: unknown): value is Locale {
  return value === "zh" || value === "en";
}
