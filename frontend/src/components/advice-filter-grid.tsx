"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { AdviceGrid } from "@/components/advice-grid";
import type { AdviceArticle } from "@/lib/advice-types";
import { textMatchesQuery } from "@/lib/local-search";

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

export function AdviceFilterGrid({
  articles,
  categorySlug,
  placeholder = "Filtruj porady: malina, cięcie, żółte liście...",
}: {
  articles: AdviceArticle[];
  categorySlug?: string;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () => articles.filter((article) => textMatchesQuery(articleSearchText(article), query)),
    [articles, query],
  );

  return (
    <>
      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            aria-label="Filtruj porady"
            className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-11 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
            onChange={(event) => setQuery(event.target.value)}
            placeholder={placeholder}
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

      {filtered.length > 0 ? (
        <AdviceGrid articles={filtered} categorySlug={categorySlug} />
      ) : (
        <div className="py-16 text-center text-slate-500">
          <p className="text-lg font-bold text-slate-700">Brak porad dla tego filtra.</p>
          <p className="mt-2 text-sm">Spróbuj wpisać krótszą frazę, nazwę rośliny albo objaw problemu.</p>
        </div>
      )}
    </>
  );
}
