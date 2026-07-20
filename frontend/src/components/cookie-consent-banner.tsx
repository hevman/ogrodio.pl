"use client";

import { BarChart3, Check, ShieldCheck, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useState } from "react";
import { googleAnalyticsId } from "@/components/google-analytics";

type ConsentChoice = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  savedAt: string;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    ogrodioLoadGoogleAnalytics?: () => void;
  }
}

const storageKey = "ogrodio-cookie-consent-v1";

function readConsent(): ConsentChoice | null {
  try {
    return JSON.parse(window.localStorage.getItem(storageKey) || "null") as ConsentChoice | null;
  } catch {
    return null;
  }
}

function updateGoogleConsent(choice: ConsentChoice) {
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtagFallback(...args: unknown[]) {
      window.dataLayer?.push(args);
    };

  window.gtag("consent", "update", {
    analytics_storage: choice.analytics ? "granted" : "denied",
    ad_storage: choice.marketing ? "granted" : "denied",
    ad_user_data: choice.marketing ? "granted" : "denied",
    ad_personalization: choice.marketing ? "granted" : "denied",
  });

  if (choice.analytics) {
    window.ogrodioLoadGoogleAnalytics?.();
    window.gtag("config", googleAnalyticsId, { anonymize_ip: true });
  }
}

function ConsentSwitch({
  checked,
  disabled,
  label,
  description,
  icon,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  label: string;
  description: string;
  icon: React.ReactNode;
  onChange?: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 rounded-md border border-slate-200 bg-slate-50/70 p-3">
      <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-emerald-700 shadow-sm">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-3">
          <span className="text-sm font-black text-slate-950">{label}</span>
          <input
            checked={checked}
            className="size-4 accent-emerald-700"
            disabled={disabled}
            onChange={(event) => onChange?.(event.target.checked)}
            type="checkbox"
          />
        </span>
        <span className="mt-1 block text-xs leading-5 text-slate-500">{description}</span>
      </span>
    </label>
  );
}

export function CookieConsentBanner() {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const stored = readConsent();
    if (stored) {
      setAnalytics(stored.analytics);
      setMarketing(stored.marketing);
      updateGoogleConsent(stored);
      return;
    }
    setIsOpen(true);
  }, []);

  useEffect(() => {
    const openSettings = () => {
      const stored = readConsent();
      if (stored) {
        setAnalytics(stored.analytics);
        setMarketing(stored.marketing);
      }
      setShowSettings(true);
      setIsOpen(true);
    };
    window.addEventListener("ogrodio:open-cookie-settings", openSettings);
    return () => window.removeEventListener("ogrodio:open-cookie-settings", openSettings);
  }, []);

  const save = (next: { analytics: boolean; marketing: boolean }) => {
    const choice: ConsentChoice = {
      necessary: true,
      analytics: next.analytics,
      marketing: next.marketing,
      savedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(storageKey, JSON.stringify(choice));
    setAnalytics(choice.analytics);
    setMarketing(choice.marketing);
    updateGoogleConsent(choice);
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[80] px-3 pb-3 sm:px-5 sm:pb-5">
      <div className="mx-auto max-w-[980px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_22px_70px_rgba(15,23,42,0.24)]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div className="flex items-start gap-3">
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
              <ShieldCheck className="size-5" />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-emerald-700">Ogrodio cookies</p>
              <h2 className="mt-1 text-lg font-black text-slate-950">Dbamy o prywatność</h2>
            </div>
          </div>
          <button
            aria-label="Zamknij ustawienia cookies"
            className="inline-flex size-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            onClick={() => save({ analytics: false, marketing: false })}
            type="button"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="grid gap-5 px-5 py-5 lg:grid-cols-[1fr_360px]">
          <div>
            <p className="text-sm leading-6 text-slate-600">
              Korzystamy z plików cookie i podobnych technologii, aby strona działała prawidłowo, a za Twoją zgodą
              także do tworzenia anonimowych statystyk. Możesz zaakceptować wybrane kategorie, dostosować ustawienia
              albo pozostać wyłącznie przy niezbędnych mechanizmach.
            </p>

            {showSettings ? (
              <div className="mt-4 grid gap-3">
                <ConsentSwitch
                  checked
                  description="Sesja, koszyk, bezpieczeństwo i zapamiętanie wyboru zgód."
                  disabled
                  icon={<ShieldCheck className="size-4" />}
                  label="Niezbędne"
                />
                <ConsentSwitch
                  checked={analytics}
                  description="Pomiar odwiedzin, popularności treści i źródeł ruchu w Google Analytics."
                  icon={<BarChart3 className="size-4" />}
                  label="Analityczne"
                  onChange={setAnalytics}
                />
                <ConsentSwitch
                  checked={marketing}
                  description="Zarezerwowane pod przyszłe kampanie. Obecnie nie uruchamiamy reklam behawioralnych."
                  icon={<SlidersHorizontal className="size-4" />}
                  label="Marketingowe"
                  onChange={setMarketing}
                />
              </div>
            ) : (
              <button
                className="mt-4 inline-flex items-center gap-2 text-sm font-black text-emerald-700 transition hover:text-emerald-900"
                onClick={() => setShowSettings(true)}
                type="button"
              >
                <SlidersHorizontal className="size-4" />
                Dostosuj zgody
              </button>
            )}
          </div>

          <div className="grid content-start gap-2">
            <button
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-emerald-700 px-4 text-sm font-black text-white transition hover:bg-emerald-800"
              onClick={() => save({ analytics: true, marketing: false })}
              type="button"
            >
              <Check className="size-4" />
              Akceptuję analitykę
            </button>
            <button
              className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-black text-slate-800 transition hover:border-slate-500"
              onClick={() => save({ analytics, marketing })}
              type="button"
            >
              Zapisz mój wybór
            </button>
            <button
              className="inline-flex h-11 items-center justify-center rounded-md px-4 text-sm font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              onClick={() => save({ analytics: false, marketing: false })}
              type="button"
            >
              Tylko niezbędne
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
