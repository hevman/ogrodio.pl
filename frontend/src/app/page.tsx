import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Leaf,
  Search,
  ShoppingBag,
  Sprout,
} from "lucide-react";
import { AdviceCard } from "@/components/advice-card";
import { HomeAppSection } from "@/components/app/app-onboarding";
import { t } from "@/i18n";
import { getFeaturedAdvice } from "@/lib/advice";
import { siteShell } from "@/lib/layout";
import { blogCategories, getArticlePath, site } from "@/lib/site-config";
import { shopPath } from "@/lib/shop-url";

export const revalidate = 300;

export const metadata: Metadata = {
  title: t("home.metaTitle"),
  description: t("home.metaDescription"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: t("home.metaTitle"),
    description: site.description,
    images: [
      {
        url: "/images/articles/wiosenne-prace-ogrod.webp",
        width: 1200,
        height: 900,
        alt: t("home.heroAlt"),
      },
    ],
    type: "website",
  },
};

const quickLinks = [
  { href: "/porady?topic=trawnik", labelKey: "home.quickLawn" as const, textKey: "home.quickLawnText" as const },
  { href: "/porady?topic=owoce-w-ogrodzie", labelKey: "home.quickFruits" as const, textKey: "home.quickFruitsText" as const },
  { href: "/porady?topic=choroby-roslin", labelKey: "home.quickDiseases" as const, textKey: "home.quickDiseasesText" as const },
  { href: shopPath(), labelKey: "home.quickShop" as const, textKey: "home.quickShopText" as const },
];

const shopCategoryKeys = [
  { titleKey: "home.shopPlants" as const, textKey: "home.shopPlantsText" as const },
  { titleKey: "home.shopSoil" as const, textKey: "home.shopSoilText" as const },
  { titleKey: "home.shopAccessories" as const, textKey: "home.shopAccessoriesText" as const },
];

export default async function HomePage() {
  const featured = await getFeaturedAdvice(6);
  const [leadArticle, ...moreArticles] = featured;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    description: site.description,
    url: site.publicUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${site.publicUrl}/porady?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        type="application/ld+json"
      />

      <section className="relative min-h-[640px] overflow-hidden bg-slate-950 text-white">
        <Image
          alt={t("home.heroAlt")}
          className="object-cover opacity-70"
          fetchPriority="high"
          fill
          priority
          quality={66}
          sizes="100vw"
          src="/images/articles/wiosenne-prace-ogrod.webp"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,.92),rgba(2,6,23,.62)_46%,rgba(2,6,23,.18))]" />
        <div className={`relative flex min-h-[640px] flex-col justify-end pb-10 pt-28 sm:pb-14 ${siteShell}`}>
          <div className="max-w-4xl">
            <p className="inline-flex items-center gap-2 text-sm font-bold uppercase text-emerald-200">
              <Leaf className="h-4 w-4" />
              {t("home.heroEyebrow")}
            </p>
            <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              {t("home.heroTitle")}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-100 sm:text-lg">
              {t("home.heroText")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                className="inline-flex h-12 items-center gap-2 rounded-lg bg-emerald-500 px-5 text-sm font-black text-slate-950 transition hover:bg-emerald-300"
                href="/porady"
              >
                <BookOpen className="h-4 w-4" />
                {t("home.readAdvice")}
              </Link>
              <Link
                className="inline-flex h-12 items-center gap-2 rounded-lg border border-white/25 px-5 text-sm font-black text-white transition hover:bg-white/10"
                href={shopPath()}
              >
                <ShoppingBag className="h-4 w-4" />
                {t("home.goToShop")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-8">
        <div className={`grid gap-3 sm:grid-cols-2 lg:grid-cols-4 ${siteShell}`}>
          {quickLinks.map((item) => (
            <Link
              className="group border-b border-slate-200 py-4 transition hover:border-emerald-400"
              href={item.href}
              key={item.href}
            >
              <span className="text-sm font-black uppercase text-emerald-700">{t(item.labelKey)}</span>
              <span className="mt-2 flex items-center justify-between gap-4 text-base font-semibold text-slate-950">
                {t(item.textKey)}
                <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:text-emerald-700" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-[#eef1f6] py-14 sm:py-18">
        <div className={siteShell}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-black uppercase tracking-wide text-emerald-700">
                {t("home.latestAdvice")}
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                {t("home.latestAdviceTitle")}
              </h2>
              <p className="mt-3 text-base leading-7 text-slate-600">
                {t("home.latestAdviceText")}
              </p>
            </div>
            <Link
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-black text-slate-800 transition hover:border-emerald-300 hover:text-emerald-800"
              href="/porady"
            >
              {t("home.allAdvice")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {leadArticle ? (
            <div className="mt-9 grid gap-6 lg:grid-cols-[1.08fr_.92fr]">
              <Link
                className="group grid overflow-hidden rounded-lg bg-slate-950 text-white shadow-sm md:grid-cols-[.95fr_1.05fr]"
                href={getArticlePath(leadArticle)}
              >
                <div className="relative min-h-[280px]">
                  <Image
                    alt={leadArticle.coverAlt}
                    className="object-cover transition duration-500 group-hover:scale-105"
                    fill
                    quality={62}
                    sizes="(max-width: 1024px) 100vw, 44vw"
                    src={leadArticle.coverImage}
                  />
                </div>
                <div className="flex flex-col justify-end p-6 sm:p-8">
                  <p className="text-sm font-black uppercase text-emerald-300">
                    {leadArticle.topic}
                  </p>
                  <h3 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">
                    {leadArticle.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-slate-200">{leadArticle.summary}</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-black text-emerald-200">
                    {t("home.readArticle")}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                {moreArticles.slice(0, 2).map((article) => (
                  <Link
                    className="group flex gap-4 rounded-lg border border-slate-200 bg-white p-4 transition hover:border-emerald-300 hover:shadow-sm"
                    href={getArticlePath(article)}
                    key={article.slug}
                  >
                    <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-md bg-slate-100">
                      <Image
                        alt={article.coverAlt}
                        className="object-cover transition duration-500 group-hover:scale-105"
                        fill
                        quality={56}
                        sizes="112px"
                        src={article.coverImage}
                      />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase text-emerald-700">
                        {article.topic}
                      </p>
                      <h3 className="mt-1 font-black leading-snug text-slate-950">
                        {article.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {t("home.readingMinutes", { count: article.readingMinutes })}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          {moreArticles.length > 2 ? (
            <div className="mt-6 grid gap-5 lg:grid-cols-3">
              {moreArticles.slice(2, 5).map((article) => (
                <AdviceCard article={article} key={article.slug} />
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="bg-white py-14 sm:py-18">
        <div className={`grid gap-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center ${siteShell}`}>
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-black uppercase text-emerald-700">
              <ShoppingBag className="h-4 w-4" />
              {t("home.shopSection")}
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              {t("home.shopTitle")}
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              {t("home.shopText")}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-black text-white transition hover:bg-emerald-800"
                href={shopPath()}
              >
                {t("home.openShop")}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-black text-slate-800 transition hover:border-emerald-300 hover:text-emerald-800"
                href={shopPath("/szukaj")}
              >
                <Search className="h-4 w-4" />
                {t("home.searchProduct")}
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {shopCategoryKeys.map(({ titleKey, textKey }) => (
              <div className="border-l border-slate-200 pl-5" key={titleKey}>
                <Sprout className="h-5 w-5 text-emerald-700" />
                <h3 className="mt-3 text-lg font-black text-slate-950">{t(titleKey)}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{t(textKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <HomeAppSection />

      <section className="bg-slate-950 py-12 text-white">
        <div className={`flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between ${siteShell}`}>
          <div>
            <p className="text-sm font-black uppercase text-emerald-300">{t("home.categoriesTitle")}</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight">
              {t("home.categoriesHeading")}
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {blogCategories.map((category) => (
              <Link
                className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-emerald-300 hover:text-white"
                href={`/porady?topic=${category.slug}`}
                key={category.slug}
              >
                {category.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
