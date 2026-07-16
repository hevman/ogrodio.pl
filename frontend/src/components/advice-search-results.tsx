'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowUpRight, Clock3, Loader2, SearchX } from 'lucide-react';
import { AdviceSearch } from '@/components/advice-search';
import { PageShell, PageSection } from '@/components/page-shell';
import { searchArticles, type ArticleHit } from '@/lib/search-api';
import { getArticleCategorySlug } from '@/lib/site-config';

function articleHref(hit: ArticleHit): string {
  const cat = getArticleCategorySlug(hit.topic);
  return cat ? `/porady/${cat}/${hit.slug}` : `/porady/${hit.slug}`;
}

export function AdviceSearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') ?? '';
  const [hits, setHits] = useState<ArticleHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!q.trim()) {
      setHits([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(false);
    searchArticles(q).then(results => {
      setHits(results);
      setSearched(true);
      setLoading(false);
    });
  }, [q]);

  return (
    <PageShell
      breadcrumb={[
        { href: '/', label: 'Start' },
        { href: '/porady', label: 'Porady' },
        { label: 'Wyniki wyszukiwania' },
      ]}
      description={q ? `Wyniki wyszukiwania dla „${q}" w poradnikach ogrodniczych.` : 'Wyszukaj poradniki ogrodnicze.'}
      eyebrow="Wyszukiwarka"
      title={q ? `Wyniki dla „${q}"` : 'Szukaj porad'}
    >
      <PageSection>
        <div className="mb-8 max-w-xl">
          <AdviceSearch initialQuery={q} />
        </div>

        {loading && (
          <div className="flex items-center gap-3 py-12 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm font-medium">Szukam…</span>
          </div>
        )}

        {!loading && searched && hits.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <SearchX className="h-10 w-10 text-slate-300" />
            <p className="text-lg font-bold text-slate-700">
              Brak wyników dla „{q}"
            </p>
            <p className="max-w-md text-sm text-slate-500">
              Spróbuj innych słów kluczowych lub przeglądaj porady według kategorii.
            </p>
            <Link
              className="mt-2 inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-bold text-teal-700 transition hover:border-teal-200 hover:bg-teal-50"
              href="/porady"
            >
              Przeglądaj wszystkie porady
            </Link>
          </div>
        )}

        {!loading && hits.length > 0 && (
          <>
            <p className="mb-6 text-sm text-slate-500">
              Znaleziono <span className="font-bold text-slate-800">{hits.length}</span>{' '}
              {hits.length === 1 ? 'poradnik' : hits.length < 5 ? 'poradniki' : 'poradników'}
            </p>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {hits.map(hit => (
                <Link
                  key={hit.slug}
                  href={articleHref(hit)}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
                >
                  {hit.cover_image && (
                    <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
                      <img
                        src={hit.cover_image}
                        alt={hit.cover_alt ?? hit.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                        loading="lazy"
                      />
                      <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-teal-700 shadow-sm">
                        {hit.topic}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="flex-1 text-base font-bold leading-snug text-slate-900 group-hover:text-teal-800">
                        {hit.title}
                      </h2>
                      <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 group-hover:text-teal-700" />
                    </div>
                    <p className="mt-2 flex-1 text-sm leading-6 text-slate-600 line-clamp-2">
                      {hit.summary}
                    </p>
                    {hit.reading_minutes > 0 && (
                      <span className="mt-3 inline-flex items-center gap-1.5 text-xs text-slate-400">
                        <Clock3 className="h-3.5 w-3.5" />
                        {hit.reading_minutes} min czytania
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {!q && !loading && (
          <div className="py-12 text-center text-slate-500">
            <p className="text-sm">Wpisz frazę w pole powyżej, żeby wyszukać porady.</p>
          </div>
        )}
      </PageSection>
    </PageShell>
  );
}
