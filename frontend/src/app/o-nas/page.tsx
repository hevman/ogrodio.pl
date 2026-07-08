import type { Metadata } from "next";
import { Camera, Leaf, ShieldCheck, Sprout } from "lucide-react";
import { PageSection, PageShell } from "@/components/page-shell";
import { t } from "@/i18n";
import { site } from "@/lib/site-config";

export const metadata: Metadata = {
  title: t("pages.about.metaTitle"),
  description: t("pages.about.metaDescription"),
};

const values = [
  {
    icon: Camera,
    titleKey: "pages.about.valuePhotosTitle" as const,
    textKey: "pages.about.valuePhotosText" as const,
  },
  {
    icon: Leaf,
    titleKey: "pages.about.valuePracticeTitle" as const,
    textKey: "pages.about.valuePracticeText" as const,
  },
  {
    icon: Sprout,
    titleKey: "pages.about.valueClimateTitle" as const,
    textKey: "pages.about.valueClimateText" as const,
  },
  {
    icon: ShieldCheck,
    titleKey: "pages.about.valueEditorialTitle" as const,
    textKey: "pages.about.valueEditorialText" as const,
  },
];

export default function AboutPage() {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: site.publicUrl,
    email: site.email,
    description: site.description,
    logo: `${site.publicUrl}/icon-512.png`,
  };

  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        type="application/ld+json"
      />

      <PageShell
        breadcrumb={[{ href: "/", label: t("site.nav.start") }, { label: t("pages.about.breadcrumb") }]}
        description={t("pages.about.description")}
        eyebrow={t("pages.about.eyebrow")}
        title={t("pages.about.title")}
      />

      <PageSection>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <div className="space-y-6 text-base leading-8 text-slate-600">
            <p>{t("pages.about.p1", { name: site.name })}</p>
            <p>{t("pages.about.p2")}</p>
            <p>{t("pages.about.p3")}</p>
            <p>{t("pages.about.p4")}</p>
            <p>{t("pages.about.p5")}</p>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-lg font-bold text-slate-900">{t("pages.about.editorialTitle")}</h2>
              <p className="mt-3">{t("pages.about.editorialP1")}</p>
              <p className="mt-3">{t("pages.about.editorialP2", { email: site.email })}</p>
            </div>
          </div>

          <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-black uppercase tracking-wide text-teal-700">{t("pages.about.authorship")}</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">{site.authorName}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{site.authorDescription}</p>
            <a
              className="mt-5 inline-flex h-11 items-center justify-center rounded-lg bg-teal-600 px-4 text-sm font-bold text-white transition hover:bg-teal-700"
              href={`mailto:${site.email}`}
            >
              {t("pages.about.contactUs")}
            </a>
            <a
              className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-bold text-slate-700 transition hover:border-teal-200 hover:bg-teal-50"
              href="/porady"
            >
              Przeglądaj poradniki
            </a>
          </aside>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {values.map((item) => {
            const Icon = item.icon;
            return (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" key={item.titleKey}>
                <Icon className="h-6 w-6 text-teal-700" />
                <h2 className="mt-4 text-lg font-bold text-slate-900">{t(item.titleKey)}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{t(item.textKey)}</p>
              </div>
            );
          })}
        </div>
      </PageSection>
    </>
  );
}
