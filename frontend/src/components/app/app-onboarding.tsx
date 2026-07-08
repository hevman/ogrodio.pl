import Link from "next/link";
import { ArrowRight, Leaf, Sprout } from "lucide-react";
import { appPath } from "@/lib/app-url";
import { t } from "@/i18n";

export function AppOnboarding() {
  const steps = [
    { n: 1, titleKey: "app.onboarding.step1Title" as const, textKey: "app.onboarding.step1Text" as const },
    { n: 2, titleKey: "app.onboarding.step2Title" as const, textKey: "app.onboarding.step2Text" as const },
    { n: 3, titleKey: "app.onboarding.step3Title" as const, textKey: "app.onboarding.step3Text" as const },
  ];

  return (
    <section className="mb-6 overflow-hidden rounded-lg border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wide text-emerald-800">
            <Sprout className="h-4 w-4" />
            {t("app.onboarding.badge")}
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">{t("app.onboarding.title")}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{t("app.onboarding.subtitle")}</p>
        </div>
        <Link
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-emerald-700 px-4 text-sm font-black text-white"
          href="/plants"
        >
          <Leaf className="h-4 w-4" />
          {t("app.onboarding.cta")}
        </Link>
      </div>
      <ol className="mt-6 grid gap-3 md:grid-cols-3">
        {steps.map((step) => (
          <li className="rounded-lg border border-emerald-100 bg-white p-4" key={step.n}>
            <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-700 text-sm font-black text-white">
              {step.n}
            </span>
            <p className="mt-3 text-sm font-black text-slate-950">{t(step.titleKey)}</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">{t(step.textKey)}</p>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-xs font-semibold text-slate-500">{t("app.onboarding.scope")}</p>
    </section>
  );
}

export function HomeAppSection() {
  return (
    <section className="bg-[#eef1f6] py-14 sm:py-16">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black uppercase text-emerald-800">
            {t("home.appBadge")}
          </p>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{t("home.appTitle")}</h2>
          <p className="mt-4 text-base leading-7 text-slate-600">{t("home.appText")}</p>
          <Link
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-lg bg-emerald-700 px-4 text-sm font-black text-white transition hover:bg-emerald-800"
            href={appPath("/register")}
          >
            {t("home.appCta")}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-3 text-xs font-semibold text-slate-500">{t("home.appNote")}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          {(["home.appFeature1", "home.appFeature2", "home.appFeature3"] as const).map((key) => (
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" key={key}>
              <Sprout className="h-5 w-5 text-emerald-700" />
              <p className="mt-3 text-sm font-black text-slate-950">{t(key)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
