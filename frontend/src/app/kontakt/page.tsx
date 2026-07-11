import type { Metadata } from "next";
import { Mail, MessageSquareWarning, Phone, Send } from "lucide-react";
import { PageSection, PageShell } from "@/components/page-shell";
import { t } from "@/i18n";
import { site } from "@/lib/site-config";

export const metadata: Metadata = {
  title: t("pages.contact.metaTitle"),
  description: t("pages.contact.metaDescription"),
};

export default function ContactPage() {
  return (
    <>
      <PageShell
        breadcrumb={[{ href: "/", label: t("site.nav.start") }, { label: t("pages.contact.breadcrumb") }]}
        description={t("pages.contact.description")}
        eyebrow={t("pages.contact.eyebrow")}
        title={t("pages.contact.title")}
      />

      <PageSection>
        <div className="grid gap-6 lg:grid-cols-4">
          <a
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-teal-200 hover:shadow-md"
            href={`mailto:${site.email}`}
          >
            <Mail className="h-6 w-6 text-teal-700" />
            <h2 className="mt-4 text-xl font-bold text-slate-900">{t("pages.contact.emailTitle")}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{site.email}</p>
          </a>

          <a
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-teal-200 hover:shadow-md"
            href="tel:+48791172155"
          >
            <Phone className="h-6 w-6 text-teal-700" />
            <h2 className="mt-4 text-xl font-bold text-slate-900">Telefon</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">+48 791 172 155</p>
          </a>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <MessageSquareWarning className="h-6 w-6 text-teal-700" />
            <h2 className="mt-4 text-xl font-bold text-slate-900">{t("pages.contact.reportErrorTitle")}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {t("pages.contact.reportErrorText")}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <Send className="h-6 w-6 text-teal-700" />
            <h2 className="mt-4 text-xl font-bold text-slate-900">{t("pages.contact.cooperationTitle")}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {t("pages.contact.cooperationText")}
            </p>
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-teal-100 bg-teal-50 p-6">
          <h2 className="text-xl font-bold text-slate-900">{t("pages.contact.plantProblemTitle")}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">
            {t("pages.contact.plantProblemText")}
          </p>
        </div>
      </PageSection>
    </>
  );
}
