"use client";

import { NextIntlClientProvider } from "next-intl";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, getStoredLocale, htmlLang, type Locale } from "@/lib/i18n";
import zhMessages from "@/messages/zh.json";
import enMessages from "@/messages/en.json";

const MESSAGES: Record<Locale, typeof zhMessages> = {
  zh: zhMessages,
  en: enMessages
};

type LocaleContextValue = {
  locale: Locale;
  setLocale: (next: Locale) => void;
  toggleLocale: () => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function useLocaleSwitch(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocaleSwitch must be used within LanguageProvider");
  return ctx;
}

export default function LanguageProvider({ children }: { children: ReactNode }) {
  // Always start from DEFAULT_LOCALE so SSR and the first client render match,
  // then adopt the persisted locale after mount.
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const stored = getStoredLocale();
    setLocaleState(stored);
    document.documentElement.lang = htmlLang(stored);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      // ignore persistence failures (private mode, etc.)
    }
    document.documentElement.lang = htmlLang(next);
    // Let data hooks (e.g. useQuestions) refetch localized content with the new `ua` header.
    window.dispatchEvent(new Event("annual-game-locale-change"));
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === "zh" ? "en" : "zh");
  }, [locale, setLocale]);

  const value = useMemo<LocaleContextValue>(() => ({ locale, setLocale, toggleLocale }), [locale, setLocale, toggleLocale]);

  return (
    <LocaleContext.Provider value={value}>
      <NextIntlClientProvider locale={locale} messages={MESSAGES[locale]}>
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}
