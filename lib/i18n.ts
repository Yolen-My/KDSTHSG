export const LOCALES = ["zh", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "zh";
export const LOCALE_STORAGE_KEY = "annual_game_locale";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/** Read the persisted locale (client only). Defaults to zh on the server or when unset. */
export function getStoredLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  try {
    const raw = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    return isLocale(raw) ? raw : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

export function htmlLang(locale: Locale): string {
  return locale === "zh" ? "zh-CN" : "en";
}

/** Custom request header carrying the active language; consumed by the PocketBase pb_hooks. */
export const LANG_HEADER = "ua";
