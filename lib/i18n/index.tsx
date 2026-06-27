"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, isLocale, type Locale } from "./locales";
import { zh, type Dictionary } from "./zh";
import { en } from "./en";

const DICTS: Record<Locale, Dictionary> = { zh, en };

// 从点分路径读取字典值，例如 "register.title"。
function resolvePath(dict: Dictionary, path: string): string {
  const value = path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, dict);
  return typeof value === "string" ? value : path;
}

// 用 {name} 占位符进行变量替换。
function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : match
  );
}

type TranslateFn = (key: string, vars?: Record<string, string | number>) => string;

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslateFn;
  dict: Dictionary;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function detectSystemLocale(): Locale | null {
  try {
    const candidates = [navigator.language, ...(navigator.languages ?? [])];
    for (const lang of candidates) {
      if (!lang) continue;
      const lower = lang.toLowerCase();
      if (lower.startsWith("zh")) return "zh";
      if (lower.startsWith("en")) return "en";
    }
  } catch {}
  return null;
}

function readInitialLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  try {
    // 1. 用户手动选择优先级最高
    const saved = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (isLocale(saved)) return saved;
  } catch {}
  // 2. 其次根据系统/浏览器语言自动适配
  const system = detectSystemLocale();
  if (system) return system;
  // 3. 最后回退默认中文
  return DEFAULT_LOCALE;
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  // 首次挂载时从 localStorage 恢复，避免 SSR/CSR 不一致。
  useEffect(() => {
    const initial = readInitialLocale();
    if (initial !== locale) setLocaleState(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale === "en" ? "en" : "zh-CN";
    }
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {}
  }, []);

  const value = useMemo<LocaleContextValue>(() => {
    const dict = DICTS[locale] ?? zh;
    return {
      locale,
      setLocale,
      dict,
      t: (key: string, vars?: Record<string, string | number>) => interpolate(resolvePath(dict, key), vars)
    };
  }, [locale, setLocale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

// 强制固定语言的 Provider，用于大屏页等需要锁定语言、不随全局切换的场景。
export function FixedLocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const value = useMemo<LocaleContextValue>(() => {
    const dict = DICTS[locale] ?? zh;
    return {
      locale,
      setLocale: () => {},
      dict,
      t: (key: string, vars?: Record<string, string | number>) => interpolate(resolvePath(dict, key), vars)
    };
  }, [locale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useI18n(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useI18n must be used within a LocaleProvider");
  }
  return ctx;
}
