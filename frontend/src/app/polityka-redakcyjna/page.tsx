import type { Metadata } from "next";
import { BookOpenCheck, Camera, RefreshCw, ShieldAlert } from "lucide-react";
import { PageSection, PageShell } from "@/components/page-shell";
import { t } from "@/i18n";

export const metadata: Metadata = {
  title: t("pages.editorialPolicy.metaTitle"),
  description: t("pages.editorialPolicy.metaDescription"),
};

const rules = [
  {
    icon: Camera,
    titleKey: "pages.editorialPolicy.photosTitle" as const,
    textKey: "pages.editorialPolicy.photosText" as const,
  },
  {
    icon: BookOpenCheck,
    titleKey: "pages.editorialPolicy.structureTitle" as const,
    textKey: "pages.editorialPolicy.structureText" as const,
  },
  {
    icon: RefreshCw,
    titleKey: "pages.editorialPolicy.updatesTitle" as const,
    textKey: "pages.editorialPolicy.updatesText" as const,
  },
  {
    icon: ShieldAlert,
    titleKey: "pages.editorialPolicy.safetyTitle" as const,
    textKey: "pages.editorialPolicy.safetyText" as const,
  },
];

export default function EditorialPolicyPage() {
  return (
    <>
      <PageShell
        breadcrumb={[{ href: "/", label: t("site.nav.start") }, { label: t("pages.editorialPolicy.breadcrumb") }]}
        description={t("pages.editorialPolicy.description")}
        eyebrow={t("pages.editorialPolicy.eyebrow")}
        title={t("pages.editorialPolicy.title")}
      />

      <PageSection>
        <div className="grid gap-4 md:grid-cols-2">
          {rules.map((item) => {
            const Icon = item.icon;
            return (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" key={item.titleKey}>
                <Icon className="h-6 w-6 text-teal-700" />
                <h2 className="mt-4 text-xl font-bold text-slate-900">{t(item.titleKey)}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{t(item.textKey)}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-10 max-w-4xl space-y-5 text-base leading-8 text-slate-600">
          <p>{t("pages.editorialPolicy.p1")}</p>
          <p>{t("pages.editorialPolicy.p2")}</p>
          <p>{t("pages.editorialPolicy.p3")}</p>
        </div>
      </PageSection>
    </>
  );
}
