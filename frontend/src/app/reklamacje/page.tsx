import Link from "next/link";
import { Clock3, Mail } from "lucide-react";
import { t } from "@/i18n";
import { site } from "@/lib/site-config";

export const metadata = {
  title: t("shop.complaints.metaTitle"),
  description: t("shop.complaints.metaDescription"),
};

export default function ComplaintPage() {
  return (
    <main className="bg-[#f6f7f2] px-6 py-12 text-slate-950">
      <section className="mx-auto max-w-[720px] rounded-lg border border-amber-200 bg-white p-8 shadow-sm">
        <p className="inline-flex items-center gap-2 text-sm font-black uppercase text-amber-700">
          <Clock3 className="h-4 w-4" />
          {t("common.inPreparation")}
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight">{t("shop.complaints.pageTitle")}</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">{t("shop.complaints.description")}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-emerald-700 px-4 text-sm font-black text-white"
            href={`mailto:${site.email}?subject=${encodeURIComponent(t("shop.complaints.emailSubject"))}`}
          >
            <Mail className="h-4 w-4" />
            {t("shop.complaints.emailButton")}
          </a>
          <Link
            className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-black text-slate-700"
            href="/zwroty"
          >
            {t("shop.complaints.returnsLink")}
          </Link>
        </div>
      </section>
    </main>
  );
}
