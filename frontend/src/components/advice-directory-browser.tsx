"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, Search, X } from "lucide-react";
import { AdviceCard } from "@/components/advice-card";
import type { AdviceArticle } from "@/lib/advice-types";
import { textMatchesQuery } from "@/lib/local-search";
import { articleCategories } from "@/lib/site-config";

function articleSearchText(article: AdviceArticle) {
  return [
    article.title,
    article.slug,
    article.topic,
    article.summary,
    article.seo.title,
    article.seo.description,
    ...(article.seo.keywords || []),
    ...(article.tips || []),
    ...(article.sections || []).flatMap((section) => [section.heading, ...(section.paragraphs || [])]),
    ...(article.faq || []).flatMap((item) => [item.question, item.answer]),
  ].join(" ");
}

export function AdviceDirectoryBrowser({ articles }: { articles: AdviceArticle[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () => articles.filter((article) => textMatchesQuery(articleSearchText(article), query)),
    [articles, query],
  );

  const articlesByTopic = useMemo(() => {
    const grouped = new Map<string, AdviceArticle[]>();
    for (const cat of articleCategories) {
      const hits = filtered.filter((article) => article.topic === cat.topic);
      if (hits.length > 0) grouped.set(cat.slug, hits);
    }
    return grouped;
  }, [filtered]);

  return (
    <>
      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            aria-label="Filtruj porady"
            className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-11 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filtruj porady: borówka, mszyce, cięcie, żółte liście..."
            type="search"
            value={query}
          />
          {query ? (
            <button
              aria-label="Wyczyść filtr"
              className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              onClick={() => setQuery("")}
              type="button"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
        <p className="mt-3 text-sm text-slate-500">
          Pokazuję <span className="font-bold text-slate-800">{filtered.length}</span> z{" "}
          <span className="font-bold text-slate-800">{articles.length}</span> poradników.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-4">
        {articleCategories.map((cat) => {
          const count = articlesByTopic.get(cat.slug)?.length ?? 0;
          if (count === 0) return null;
          return (
            <Link
              className="group flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
              href={`/porady/${cat.slug}`}
              key={cat.slug}
            >
              <div>
                <p className="font-bold text-slate-900 group-hover:text-teal-800">{cat.label}</p>
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

      {filtered.length === 0 ? (
        <div className="py-16 text-center text-slate-500">
          <p className="text-lg font-bold text-slate-700">Brak porad dla tego filtra.</p>
          <p className="mt-2 text-sm">Spróbuj wpisać krótszą frazę, nazwę rośliny albo objaw problemu.</p>
        </div>
      ) : (
        articleCategories.map((cat) => {
          const catArticles = articlesByTopic.get(cat.slug);
          if (!catArticles || catArticles.length === 0) return null;

          const preview = query ? catArticles : catArticles.slice(0, 3);
          const hasMore = !query && catArticles.length > 3;

          return (
            <div className="mt-14" key={cat.slug}>
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-2xl font-bold text-slate-900">{cat.label}</h2>
                <Link
                  className="shrink-0 text-sm font-semibold text-teal-700 transition hover:text-teal-800 hover:underline"
                  href={`/porady/${cat.slug}`}
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
        })
      )}
    </>
  );
}
