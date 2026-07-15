import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowUpRight } from "lucide-react";
import { AdviceCard } from "@/components/advice-card";
import { AdviceSearch } from "@/components/advice-search";
import { PageShell, PageSection } from "@/components/page-shell";
import { getAdviceArticles } from "@/lib/advice";
import { articleCategories } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Porady ogrodnicze — Ogrodio",
  description: "Praktyczne poradniki ogrodnicze: uprawa roślin, choroby, szkodniki, trawnik, warzywnik i pielęgnacja ogrodu przez cały rok.",
  alternates: { canonical: "/porady" },
  openGraph: {
    title: "Porady ogrodnicze — Ogrodio",
    description: "Praktyczne poradniki ogrodnicze podzielone tematycznie.",
    type: "website",
    url: "/porady",
  },
};

export default async function AdvicePage() {
  const articles = await getAdviceArticles();

  // Grupuj po topic, zachowaj kolejność z articleCategories
  const articlesByTopic = new Map<string, typeof articles>();
  for (const cat of articleCategories) {
    const hits = articles.filter(a => a.topic === cat.topic);
    if (hits.length > 0) articlesByTopic.set(cat.slug, hits);
  }

  const totalCount = articles.length;

  return (
    <PageShell
      breadcrumb={[{ href: "/", label: "Start" }, { label: "Porady" }]}
      description={`${totalCount} praktycznych poradników ogrodniczych podzielonych na kategorie tematyczne.`}
      eyebrow="Poradniki"
      title="Wiedza, która zostaje na lata"
    >
      <PageSection>
        {/* Wyszukiwarka */}
        <div className="mb-8">
          <Suspense>
            <AdviceSearch />
          </Suspense>
        </div>
        {/* Siatka kategorii */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-4">
          {articleCategories.map(cat => {
            const count = articlesByTopic.get(cat.slug)?.length ?? 0;
            if (count === 0) return null;
            return (
              <Link
                key={cat.slug}
                href={`/porady/${cat.slug}`}
                className="group flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
              >
                <div>
                  <p className="font-bold text-slate-900 group-hover:text-teal-800">
                    {cat.label}
                  </p>
                  <p className="mt-0.5 text-sm text-slate-500">
                    {count} {count === 1 ? "poradnik" : count < 5 ? "poradniki" : "poradników"}
                  </p>
                </div>
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition group-hover:border-teal-200 group-hover:bg-teal-50 group-hover:text-teal-700">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </Link>
            );
          })}
        </div>

        {/* Sekcje z artykułami per kategoria */}
        {articleCategories.map(cat => {
          const catArticles = articlesByTopic.get(cat.slug);
          if (!catArticles || catArticles.length === 0) return null;

          // Pokaż max 3 na stronie głównej kategorii, reszta pod linkiem
          const preview = catArticles.slice(0, 3);
          const hasMore = catArticles.length > 3;

          return (
            <div key={cat.slug} className="mt-14">
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-2xl font-bold text-slate-900">{cat.label}</h2>
                <Link
                  href={`/porady/${cat.slug}`}
                  className="shrink-0 text-sm font-semibold text-teal-700 transition hover:text-teal-800 hover:underline"
                >
                  {hasMore ? `Zobacz wszystkie (${catArticles.length})` : "Zobacz kategorię"}
                </Link>
              </div>
              <div className="mt-5 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {preview.map((article, index) => (
                  <AdviceCard
                    article={article}
                    categorySlug={cat.slug}
                    key={article.slug}
                    priority={index === 0}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </PageSection>
    </PageShell>
  );
}
