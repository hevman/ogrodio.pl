"use client";

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

export function CookieConsentBanner() {
  const [isOpen, setIsOpen] = useState(false);
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
    <div className="fixed inset-x-0 bottom-0 z-[80] border-t border-slate-200 bg-white px-4 py-4 shadow-[0_-16px_50px_rgba(15,23,42,0.16)]">
      <div className="mx-auto grid max-w-[1180px] gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-emerald-700">Prywatność i cookies</p>
          <h2 className="mt-1 text-lg font-black text-slate-950">Ustawienia zgód Ogrodio</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Używamy niezbędnych mechanizmów do działania strony, sklepu i aplikacji. Analitykę Google uruchamiamy
            dopiero po Twojej zgodzie. Zgody możesz później zmienić w stopce.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="flex items-start gap-3 rounded-lg border border-slate-200 p-3">
              <input checked disabled className="mt-1 size-4 accent-emerald-700" type="checkbox" />
              <span>
                <span className="block text-sm font-bold text-slate-950">Niezbędne</span>
                <span className="block text-xs leading-5 text-slate-500">Sesja, koszyk, bezpieczeństwo i działanie usługi.</span>
              </span>
            </label>
            <label className="flex items-start gap-3 rounded-lg border border-slate-200 p-3">
              <input
                checked={analytics}
                className="mt-1 size-4 accent-emerald-700"
                onChange={(event) => setAnalytics(event.target.checked)}
                type="checkbox"
              />
              <span>
                <span className="block text-sm font-bold text-slate-950">Analityczne</span>
                <span className="block text-xs leading-5 text-slate-500">Google Analytics pomaga mierzyć, które treści są użyteczne.</span>
              </span>
            </label>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row md:flex-col">
          <button
            className="rounded-md bg-emerald-700 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-800"
            onClick={() => save({ analytics: true, marketing: false })}
            type="button"
          >
            Akceptuję analitykę
          </button>
          <button
            className="rounded-md border border-slate-300 px-5 py-3 text-sm font-black text-slate-800 transition hover:border-slate-500"
            onClick={() => save({ analytics, marketing })}
            type="button"
          >
            Zapisz wybór
          </button>
          <button
            className="rounded-md px-5 py-3 text-sm font-bold text-slate-500 transition hover:text-slate-900"
            onClick={() => save({ analytics: false, marketing: false })}
            type="button"
          >
            Tylko niezbędne
          </button>
        </div>
      </div>
    </div>
  );
}
