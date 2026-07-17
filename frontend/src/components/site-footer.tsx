import Link from "next/link";
import { siteContainer, siteGutter } from "@/lib/layout";
import { navLinks, site } from "@/lib/site-config";
import { appPath } from "@/lib/app-url";
import { t } from "@/i18n";

function FacebookLink({ tone = "dark" }: { tone?: "light" | "dark" }) {
  const classes = tone === "light"
    ? "border-white/20 text-white hover:border-white hover:bg-white hover:text-slate-950"
    : "border-slate-200 text-slate-600 hover:border-teal-700 hover:bg-teal-700 hover:text-white";

  return (
    <a
      aria-label="Facebook Ogrodio"
      className={`inline-flex size-9 items-center justify-center rounded-full border transition ${classes}`}
      href={site.facebook}
      rel="noopener noreferrer"
      target="_blank"
      title="Facebook Ogrodio"
    >
      <svg aria-hidden="true" className="size-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M13.8 21v-8h2.7l.4-3.1h-3.1V7.95c0-.9.25-1.5 1.54-1.5H16.9V3.67c-.28-.04-1.23-.12-2.34-.12-2.31 0-3.9 1.4-3.9 4v2.35H8.04V13h2.62v8h3.14Z" />
      </svg>
      <span className="sr-only">Facebook Ogrodio</span>
    </a>
  );
}

function YouTubeLink({ tone = "dark" }: { tone?: "light" | "dark" }) {
  const classes = tone === "light"
    ? "border-white/20 text-white hover:border-red-500 hover:bg-red-600 hover:text-white"
    : "border-slate-200 text-slate-600 hover:border-red-600 hover:bg-red-600 hover:text-white";

  return (
    <a
      aria-label="YouTube Ogrodio"
      className={`inline-flex size-9 items-center justify-center rounded-full border transition ${classes}`}
      href="https://www.youtube.com/@ogrodio-pl"
      rel="noopener noreferrer"
      target="_blank"
      title="YouTube Ogrodio"
    >
      <svg aria-hidden="true" className="size-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.7 15.5V8.5l6.3 3.5-6.3 3.5Z" />
      </svg>
      <span className="sr-only">YouTube Ogrodio</span>
    </a>
  );
}

function ShopFooter() {
  return (
    <footer className="mt-auto border-t border-emerald-900/10 bg-slate-950 px-6 py-10 text-white 2xl:px-8">
      <div className="mx-auto grid max-w-[1680px] gap-8 text-sm md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="max-w-lg">
          <p className="text-xl font-black">{t("footer.shop.title")}</p>
          <p className="mt-3 leading-6 text-slate-400">{t("footer.shop.description")}</p>
          <p className="mt-4 font-bold text-emerald-200">
            <a className="transition hover:text-white" href={`mailto:${site.email}`}>
              {site.email}
            </a>
          </p>
          <p className="mt-2 font-bold text-emerald-200">
            <a className="transition hover:text-white" href="tel:+48791172155">
              +48 791 172 155
            </a>
          </p>
          <div className="mt-5 flex gap-2">
            <FacebookLink tone="light" />
            <YouTubeLink tone="light" />
          </div>
        </div>

        <div>
          <p className="font-black uppercase tracking-wide text-slate-200">{t("footer.shop.shopping")}</p>
          <div className="mt-4 grid gap-3 text-slate-400">
            <Link className="transition hover:text-white" href="/">
              {t("footer.shop.shopHome")}
            </Link>
            <Link className="transition hover:text-white" href="/szukaj">
              {t("footer.shop.catalog")}
            </Link>
            <Link className="transition hover:text-white" href="/checkout">
              {t("footer.shop.cartAndOrder")}
            </Link>
            <a className="transition hover:text-white" href={appPath("/login")}>
              {t("common.login")}
            </a>
            <a className="transition hover:text-white" href={appPath("/register")}>
              {t("common.register")}
            </a>
          </div>
        </div>

        <div>
          <p className="font-black uppercase tracking-wide text-slate-200">{t("footer.shop.customerService")}</p>
          <div className="mt-4 grid gap-3 text-slate-400">
            <Link className="transition hover:text-white" href="/dostawa">
              {t("footer.shop.deliveryAndPayment")}
            </Link>
            <Link className="transition hover:text-white" href="/zwroty">
              {t("footer.shop.returns")}
            </Link>
            <Link className="transition hover:text-white" href="/status-zamowienia">
              {t("footer.shop.orderStatus")}
            </Link>
            <Link className="transition hover:text-white" href="/reklamacje">
              {t("footer.shop.fileComplaint")}
            </Link>
            <a className="transition hover:text-white" href={`mailto:${site.email}`}>
              {t("common.contactUs")}
            </a>
            <a className="transition hover:text-white" href={`mailto:${site.email}`}>
              {site.email}
            </a>
          </div>
        </div>

        <div>
          <p className="font-black uppercase tracking-wide text-slate-200">{t("footer.shop.advice")}</p>
          <div className="mt-4 grid gap-3 text-slate-400">
            <a className="transition hover:text-white" href={site.siteUrl}>
              {t("footer.shop.siteHome")}
            </a>
            <a className="transition hover:text-white" href={`${site.siteUrl}/porady`}>
              {t("footer.shop.gardenAdvice")}
            </a>
            <a className="transition hover:text-white" href={site.appUrl}>
              {t("footer.shop.gardenApp")}
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-8 flex max-w-[1680px] flex-col gap-2 border-t border-white/10 pt-5 text-xs font-semibold text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>{t("footer.shop.copyright", { year: new Date().getFullYear() })}</p>
        <div className="flex flex-wrap gap-4">
          <Link className="transition hover:text-white" href="/dostawa">
            {t("footer.shop.delivery")}
          </Link>
          <Link className="transition hover:text-white" href="/zwroty">
            {t("footer.shop.returnsShort")}
          </Link>
          <Link className="transition hover:text-white" href="/status-zamowienia">
            {t("footer.shop.orderStatus")}
          </Link>
          <Link className="transition hover:text-white" href="/regulamin">
            Regulamin sklepu
          </Link>
          <Link className="transition hover:text-white" href="/polityka-prywatnosci">
            Polityka prywatności
          </Link>
        </div>
      </div>
    </footer>
  );
}

export function SiteFooter({ variant = "site" }: { variant?: "site" | "shop" }) {
  if (variant === "shop") return <ShopFooter />;

  return (
    <footer className={`mt-auto border-t border-slate-200 bg-white py-12 text-slate-900 ${siteGutter}`}>
      <div className={`grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr] ${siteContainer}`}>
        <div>
          <p className="text-xl font-bold tracking-tight">{t("site.name")}</p>
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">{site.description}</p>
          <div className="mt-5 flex gap-2">
            <FacebookLink />
            <YouTubeLink />
          </div>
          <p className="mt-4 text-sm text-slate-500">© {new Date().getFullYear()} {t("site.name")}</p>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900">{t("footer.site.advice")}</p>
          <div className="mt-3 grid gap-2.5">
            <Link className="text-sm text-slate-500 transition hover:text-teal-700" href="/porady">
              {t("footer.site.allAdvice")}
            </Link>
            <Link className="text-sm text-slate-500 transition hover:text-teal-700" href="/porady?topic=trawnik">
              {t("footer.site.lawn")}
            </Link>
            <Link className="text-sm text-slate-500 transition hover:text-teal-700" href="/porady?topic=owoce-w-ogrodzie">
              {t("footer.site.fruits")}
            </Link>
            <Link className="text-sm text-slate-500 transition hover:text-teal-700" href="/porady?topic=choroby-roslin">
              {t("footer.site.plantDiseases")}
            </Link>
            <Link className="text-sm text-slate-500 transition hover:text-teal-700" href="/porady?topic=pielegnacja">
              {t("footer.site.care")}
            </Link>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900">{t("footer.site.appAndShop")}</p>
          <div className="mt-3 grid gap-2.5">
            <a className="text-sm text-slate-500 transition hover:text-teal-700" href={site.appUrl}>
              {t("footer.site.gardenAssistant")}
            </a>
            <a className="text-sm text-slate-500 transition hover:text-teal-700" href={appPath("/login")}>
              {t("common.login")}
            </a>
            <a className="text-sm text-slate-500 transition hover:text-teal-700" href={appPath("/register")}>
              {t("common.register")}
            </a>
            <a className="text-sm text-slate-500 transition hover:text-teal-700" href={site.shopUrl}>
              {t("footer.site.gardenShop")}
            </a>
            <a className="text-sm text-slate-500 transition hover:text-teal-700" href={`${site.shopUrl}/szukaj`}>
              {t("footer.site.productCatalog")}
            </a>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900">{t("footer.site.trust")}</p>
          <div className="mt-3 grid gap-2.5">
            <Link className="text-sm text-slate-500 transition hover:text-teal-700" href="/katalog-roslin">
              Katalog roślin
            </Link>
            <Link className="text-sm text-slate-500 transition hover:text-teal-700" href="/ogrodio-plant-intelligence">
              Plan opieki nad roślinami
            </Link>
            <Link className="text-sm text-slate-500 transition hover:text-teal-700" href="/o-nas">
              {t("footer.site.about")}
            </Link>
            <Link className="text-sm text-slate-500 transition hover:text-teal-700" href="/kontakt">
              {t("footer.site.contact")}
            </Link>
            <Link className="text-sm text-slate-500 transition hover:text-teal-700" href="/polityka-redakcyjna">
              {t("footer.site.editorialPolicy")}
            </Link>
            <a className="text-sm text-slate-500 transition hover:text-teal-700" href={`mailto:${site.email}`}>
              {site.email}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
