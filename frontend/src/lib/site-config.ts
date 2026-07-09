import { messages, t } from "@/i18n";

export const site = {
  name: messages.site.name,
  tagline: messages.site.tagline,
  description: messages.site.description,
  email: "kontakt@ogrodio.pl",
  instagram: "",
  facebook: "",
  publicUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://ogrodio.pl",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://ogrodio.localhost",
  shopUrl: process.env.NEXT_PUBLIC_SHOP_URL || "http://sklep.ogrodio.localhost",
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://app.ogrodio.localhost",
  panelUrl: process.env.NEXT_PUBLIC_PANEL_URL || "http://panel.ogrodio.localhost",
  authorName: messages.site.name,
  authorDescription: messages.site.authorDescription,
};

export const navLinks = [
  { href: "/", label: t("site.nav.start") },
  { href: "/app", label: t("site.nav.app") },
  { href: "/katalog-roslin", label: "Rośliny" },
  { href: "/porady", label: t("site.nav.advice") },
  { href: "/sklep", label: t("site.nav.shop") },
] as const;

/** Kanoniczne kategorie artykułów. slug → nazwa tematu w bazie */
export const articleCategories = [
  { slug: "owoce-w-ogrodzie", topic: "Owoce w ogrodzie", label: "Owoce w ogrodzie" },
  { slug: "choroby-i-szkodniki", topic: "Choroby i szkodniki", label: "Choroby i szkodniki" },
  { slug: "pielegnacja", topic: "Pielęgnacja", label: "Pielęgnacja" },
  { slug: "przyroda-w-ogrodzie", topic: "Przyroda w ogrodzie", label: "Przyroda w ogrodzie" },
  { slug: "rosliny-ozdobne", topic: "Rośliny ozdobne", label: "Rośliny ozdobne" },
  { slug: "trawnik", topic: "Trawnik", label: "Trawnik" },
  { slug: "rosliny-domowe-i-balkonowe", topic: "Rośliny domowe i balkonowe", label: "Rośliny domowe i balkonowe" },
  { slug: "warzywnik", topic: "Warzywnik", label: "Warzywnik" },
  { slug: "wysiew-nasion-i-sadzenie", topic: "Wysiew nasion i sadzenie", label: "Wysiew nasion i sadzenie" },
  { slug: "oczko-wodne", topic: "Oczko wodne", label: "Oczko wodne" },
] as const;

export type ArticleCategory = (typeof articleCategories)[number];

export function getArticleCategorySlug(topic: string) {
  return articleCategories.find((c) => c.topic === topic)?.slug;
}

export function getArticlePath(article: { slug: string; topic: string }) {
  const categorySlug = getArticleCategorySlug(article.topic);
  return categorySlug ? `/porady/${categorySlug}/${article.slug}` : `/porady/${article.slug}`;
}

/** blogCategories zostaje dla kompatybilności wstecznej */
export const blogCategories = articleCategories.map((c) => ({ slug: c.slug, label: c.label }));

export const faqItems = [
  { question: t("site.faq.q1"), answer: t("site.faq.a1") },
  { question: t("site.faq.q2"), answer: t("site.faq.a2") },
  { question: t("site.faq.q3"), answer: t("site.faq.a3") },
  { question: t("site.faq.q4"), answer: t("site.faq.a4") },
] as const;
