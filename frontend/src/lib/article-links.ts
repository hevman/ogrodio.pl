import type { AdviceArticle } from "@/lib/advice-types";
import { getArticlePath } from "@/lib/site-config";

export type ArticleLinkTarget = {
  slug: string;
  title: string;
  topic: string;
  href: string;
};

type ClusterConfig = {
  hub: string;
  sectionTitle: string;
  match: (slug: string) => boolean;
};

/** Pillary SEO — artykuł główny klastra tematycznego. */
const CLUSTERS: ClusterConfig[] = [
  {
    hub: "odmiany-borowki-terminy-dojrzewania",
    sectionTitle: "Poradnik borówki amerykańskiej",
    match: (slug) => slug.includes("borowk"),
  },
  {
    hub: "jagoda-kamczacka-uprawa-i-pielegnacja",
    sectionTitle: "Jagoda kamczacka — powiązane porady",
    match: (slug) => slug.includes("jagoda-kamczack") || slug.includes("jagody-kamczack"),
  },
  {
    hub: "przygotowanie-gleby-pod-trawnik",
    sectionTitle: "Trawnik — powiązane porady",
    match: (slug) => slug.includes("trawnik"),
  },
  {
    hub: "jak-zalozyc-warzywnik-w-ogrodzie",
    sectionTitle: "Warzywnik — powiązane porady",
    match: (slug) =>
      slug.includes("warzywnik") ||
      slug === "salata-lisciowa-uprawa-zbiory" ||
      slug === "marchew-uprawa-siew-zbiory" ||
      slug === "rzodkiewka-siew-kiedy-i-jak" ||
      slug === "burak-uprawa-i-pielegnacja" ||
      slug === "pietruszka-koper-uprawa-w-ogrodzie",
  },
  {
    hub: "jak-zalozyc-oczko-wodne-w-ogrodzie",
    sectionTitle: "Oczko wodne — powiązane porady",
    match: (slug) => slug.includes("oczko") || slug.includes("oczku") || slug === "rosliny-wodne-w-oczku-uprawa" || slug === "maly-staw-filtr-pompa-czy-konieczne",
  },
  {
    hub: "jak-przygotowac-ogrod-na-wiosne",
    sectionTitle: "Pielęgnacja — powiązane porady",
    match: (slug) =>
      slug === "jak-przygotowac-ogrod-na-wiosne" ||
      slug === "lawenda-sadzenie-i-pielegnacja" ||
      slug === "hortensja-uprawa-pielegnacja" ||
      slug === "zielnik-jak-zalozyc-i-uprawiac" ||
      slug === "tymianek-rozmaryn-uprawa" ||
      slug === "roza-pnaca-uprawa-i-pielegnacja" ||
      slug === "lilie-w-ogrodzie-uprawa" ||
      slug === "hiacynty-uprawa-i-pielegnacja" ||
      slug === "chabry-uprawa-i-odmiany" ||
      slug === "ciecie-odmładzajace-borowki" ||
      slug === "powoj-polny-jak-sie-pozbyc",
  },
  {
    hub: "wierzba-bzygowate-ogrod",
    sectionTitle: "Przyroda w ogrodzie — powiązane porady",
    match: (slug) =>
      slug === "wierzba-bzygowate-ogrod" ||
      slug === "jez-w-ogrodzie" ||
      slug === "mrowki-w-ogrodzie-ochrona-gniazdo" ||
      slug === "konik-polny-w-ogrodzie" ||
      slug === "kot-w-ogrodzie" ||
      slug === "brudnica-nieparzysta-gasienica" ||
      slug === "duzy-czarny-pajak-w-domu",
  },
  {
    hub: "hortensja-uprawa-pielegnacja",
    sectionTitle: "Rośliny ozdobne — powiązane porady",
    match: (slug) =>
      slug === "hortensja-uprawa-pielegnacja" ||
      slug === "hortensja-bukietowa-uprawa-ciecie-limonkowe-kwiaty" ||
      slug === "rozowe-lilie-azjatyckie-w-ogrodzie" ||
      slug === "kostrzewa-sina-trawa-ozdobna" ||
      slug === "sosna-gorska-mugo-uprawa-skalniak" ||
      slug === "paulownia-uprawa-w-polsce" ||
      slug === "albicja-jedwabista-uprawa-polska" ||
      slug === "aksamitka-uprawa-i-zastosowanie" ||
      slug === "tuja-zolte-szyszki-kwitnienie" ||
      slug === "oliwka-w-donicy-uprawa-brazowe-liscie",
  },
];

function articleTarget(article: AdviceArticle): ArticleLinkTarget {
  return {
    slug: article.slug,
    title: article.title,
    topic: article.topic,
    href: getArticlePath(article),
  };
}

export function getArticleCluster(articleSlug: string): ClusterConfig | null {
  return CLUSTERS.find((cluster) => cluster.match(articleSlug)) ?? null;
}

export function resolveRelatedArticles(article: AdviceArticle, all: AdviceArticle[], limit = 6): ArticleLinkTarget[] {
  const bySlug = new Map(all.map((item) => [item.slug, item]));
  const seen = new Set<string>([article.slug]);
  const result: ArticleLinkTarget[] = [];

  const push = (slug: string) => {
    if (seen.has(slug)) return false;
    const match = bySlug.get(slug);
    if (!match) return false;
    result.push(articleTarget(match));
    seen.add(slug);
    return true;
  };

  const cluster = getArticleCluster(article.slug);
  if (cluster && article.slug !== cluster.hub) {
    push(cluster.hub);
  }

  for (const slug of article.relatedArticles || []) {
    push(slug);
    if (result.length >= limit) return result;
  }

  if (cluster) {
    const clusterMatches = all
      .filter((item) => item.slug !== article.slug && cluster.match(item.slug))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    for (const match of clusterMatches) {
      push(match.slug);
      if (result.length >= limit) return result;
    }
  }

  for (const match of all.filter((item) => item.topic === article.topic && item.slug !== article.slug)) {
    push(match.slug);
    if (result.length >= limit) return result;
  }

  return result.slice(0, limit);
}

export function getRelatedSectionTitle(article: AdviceArticle): string | undefined {
  return getArticleCluster(article.slug)?.sectionTitle;
}
