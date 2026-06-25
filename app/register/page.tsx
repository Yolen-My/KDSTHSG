"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Layout from "@/components/Layout";
import LanguageToggle from "@/components/LanguageToggle";
import PageBackground from "@/components/PageBackground";
import { registerPlayer, restoreCurrentPlayerFromLocal } from "@/lib/storage";

const DEFAULT_TEAM = "Alpha";
const OFFICE_OPTIONS = [
  { value: "Beijing", labelKey: "beijing" },
  { value: "Shanghai", labelKey: "shanghai" },
  { value: "Hong Kong & Others", labelKey: "hkOthers" }
] as const;

export default function RegisterPage() {
  const router = useRouter();
  const t = useTranslations();
  const [form, setForm] = useState({ name: "", phone: "", office: "", team: DEFAULT_TEAM });
  const [message, setMessage] = useState("");
  const [officeQuery, setOfficeQuery] = useState("");
  const [officeOpen, setOfficeOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checking, setChecking] = useState(true);
  const [isComposing, setIsComposing] = useState(false);
  const officeDropdownRef = useRef<HTMLDivElement>(null);

  const officeOptions = useMemo(
    () => OFFICE_OPTIONS.map((office) => ({ value: office.value, label: t(`register.office.${office.labelKey}`) })),
    [t]
  );

  const filteredOffices = useMemo(() => {
    const query = officeQuery.trim().toLowerCase();
    if (!query || officeOptions.some((office) => office.label === officeQuery)) return officeOptions;
    return officeOptions.filter((office) => office.label.toLowerCase().includes(query));
  }, [officeQuery, officeOptions]);

  useEffect(() => {
    let active = true;
    async function check() {
      try {
        const player = await Promise.race([
          restoreCurrentPlayerFromLocal(),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000))
        ]);
        if (!active) return;
        if (player) {
          router.replace("/lobby");
          return;
        }
      } catch {
        // Continue to registration form when restore fails.
      } finally {
        if (active) setChecking(false);
      }
    }
    check();
    return () => { active = false; };
  }, [router]);

  function updateField(field: keyof typeof form, value: string) {
    if (field === "name" && isComposing) {
      setForm((current) => ({ ...current, [field]: value }));
      return;
    }

    let processedValue = value;
    if (field === "name") {
      processedValue = value.replace(/[^\p{L}\s]/gu, "").replace(/\s+/g, " ");
    }
    if (field === "phone") {
      processedValue = value.replace(/[^0-9]/g, "");
    }
    setForm((current) => ({ ...current, [field]: processedValue }));
  }

  function selectOffice(office: { label: string; value: string }) {
    updateField("office", office.value);
    setOfficeQuery(office.label);
    setOfficeOpen(false);
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (officeDropdownRef.current && !officeDropdownRef.current.contains(event.target as Node)) {
        setOfficeOpen(false);
      }
    }

    if (officeOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [officeOpen]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setMessage("");
    const name = form.name.trim();
    if (!name || name.length < 2 || name.length > 50 || !/[\p{L}]/u.test(name)) {
      setMessage(t("register.invalidName"));
      setIsSubmitting(false);
      return;
    }
    if (!form.phone) {
      setMessage(t("register.phoneRequired"));
      setIsSubmitting(false);
      return;
    }
    setIsSubmitting(true);

    try {
      const result = await registerPlayer({ ...form, name, team: DEFAULT_TEAM });
      setMessage(result.reused ? t("register.welcomeBack") : t("register.registerSuccess"));
      router.replace("/lobby");
      window.setTimeout(() => {
        if (window.location.pathname !== "/lobby") {
          window.location.assign("/lobby");
        }
      }, 300);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t("register.registerFailed"));
      setIsSubmitting(false);
    }
  }

  if (checking) {
    return (
      <Layout title="入场登记" eyebrow="REGISTER" hideLeftButton rightSlot={<div />} hideHeader>
        <section className="registerPage registerPage--checking">
          <PageBackground />
          <div className="registerPageContent">
            <Image
              className="registerLogo"
              src="/image/source/logo-hongshan.png"
              alt="HONGSHAN 红杉中国"
              width={100}
              height={33}
              priority
            />
            <p className="restoreMessage">{t("register.welcomeBack")}</p>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout title="入场登记" eyebrow="REGISTER" hideLeftButton rightSlot={<div />} hideHeader>
      <section className="registerPage">
        <PageBackground />

        <div className="registerPageContent">
          <Image
            className="registerHero"
            src="/image/source/define-the-game.png"
            alt="DEFINE THE GAME"
            width={197}
            height={129}
            priority
          />

          <form className="registerForm" onSubmit={handleSubmit}>
            <label className="registerField">
              <span>{t("register.name")}</span>
              <input
                value={form.name}
                maxLength={16}
                placeholder={t("register.namePlaceholder")}
                onChange={(event) => updateField("name", event.target.value)}
                onCompositionStart={() => setIsComposing(true)}
                onCompositionEnd={() => setIsComposing(false)}
              />
            </label>

            <label className="registerField">
              <span>{t("register.phone")}</span>
              <input
                className="registerPhoneInput"
                value={form.phone}
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder={t("register.phonePlaceholder")}
                onChange={(event) => updateField("phone", event.target.value)}
              />
            </label>

            <div className="registerField registerField--office" ref={officeDropdownRef}>
              <span>OFFICE</span>
              <div className="registerSelectWrap">
                <input
                  value={officeQuery}
                  placeholder={t("register.officePlaceholder")}
                  autoComplete="off"
                  onFocus={() => setOfficeOpen(true)}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    setOfficeOpen((open) => !open);
                  }}
                  onChange={(event) => {
                    const value = event.target.value;
                    setOfficeQuery(value);
                    updateField("office", officeOptions.find((office) => office.label === value)?.value || "");
                    setOfficeOpen(true);
                  }}
                />
                <svg className="registerChevron" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {officeOpen && (
                  <div className="officeDropdown">
                    {filteredOffices.length > 0 ? (
                      filteredOffices.map((office) => (
                        <button key={office.value} type="button" onClick={() => selectOffice(office)}>
                          {office.label}
                        </button>
                      ))
                    ) : (
                      <em>{t("register.officeNotFound")}</em>
                    )}
                  </div>
                )}
              </div>
            </div>

            {message && <p className="registerMessage">{message}</p>}

            <button className="registerSubmit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? t("register.processing") : t("register.confirm")}
            </button>
          </form>

          <LanguageToggle />

          <Image
            className="registerLogo"
            src="/image/source/logo-hongshan.png"
            alt="HONGSHAN 红杉中国"
            width={100}
            height={33}
          />
        </div>
      </section>
    </Layout>
  );
}
