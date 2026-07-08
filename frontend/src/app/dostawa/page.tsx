import { PackageCheck, Truck } from "lucide-react";
import { t } from "@/i18n";

export const metadata = {
  title: t("pages.delivery.metaTitle"),
  description: t("pages.delivery.metaDescription"),
};

export default function DeliveryPage() {
  return (
    <main className="bg-[#f6f7f2] px-6 py-12 text-slate-950">
      <section className="mx-auto max-w-[1200px]">
        <p className="text-sm font-black uppercase text-emerald-700">{t("common.help")}</p>
        <h1 className="mt-2 text-4xl font-black">{t("pages.delivery.title")}</h1>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <article className="rounded-lg border border-emerald-900/10 bg-white p-6 shadow-sm">
            <Truck className="h-7 w-7 text-emerald-700" />
            <h2 className="mt-4 text-2xl font-black">{t("pages.delivery.courierTitle")}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {t("pages.delivery.courierText")}
            </p>
          </article>
          <article className="rounded-lg border border-emerald-900/10 bg-white p-6 shadow-sm">
            <PackageCheck className="h-7 w-7 text-emerald-700" />
            <h2 className="mt-4 text-2xl font-black">{t("pages.delivery.paymentTitle")}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {t("pages.delivery.paymentText")}
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
