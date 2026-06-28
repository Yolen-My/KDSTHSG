"use client";

import { useLocaleSwitch } from "@/components/LanguageProvider";

type LanguageToggleProps = {
  className?: string;
};

export default function LanguageToggle({ className }: LanguageToggleProps) {
  const { locale, toggleLocale } = useLocaleSwitch();
  return (
    <button
      type="button"
      className={className ? `languageToggle ${className}` : "languageToggle"}
      onClick={toggleLocale}
      aria-label={locale === "zh" ? "Switch to English" : "切换为中文"}
    >
      {locale === "zh" ? "English" : "中文"}
    </button>
  );
}
