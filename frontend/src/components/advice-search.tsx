'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';
import { Loader2, Search, X } from 'lucide-react';
import { searchArticles, type ArticleHit } from '@/lib/search-api';
import { getArticleCategorySlug } from '@/lib/site-config';

function articleHref(hit: ArticleHit): string {
  const cat = getArticleCategorySlug(hit.topic);
  return cat ? `/porady/${cat}/${hit.slug}` : `/porady/${hit.slug}`;
}

export function AdviceSearch({ initialQuery = '' }: { initialQuery?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [hits, setHits] = useState<ArticleHit[]>([]);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    if (query.trim().length < 2) {
      setHits([]);
      setOpen(false);
      return;
    }
    debounce.current = setTimeout(() => {
      startTransition(async () => {
        const results = await searchArticles(query);
        setHits(results.slice(0, 6));
        setOpen(results.length > 0);
      });
    }, 200);
    return () => { if (debounce.current) clearTimeout(debounce.current); };
  }, [query]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    setOpen(false);
    if (q) router.push(`/porady?q=${encodeURIComponent(q)}`);
  }

  function clear() {
    setQuery('');
    setHits([]);
    setOpen(false);
    inputRef.current?.focus();
  }

  return (
    <div className="relative w-full max-w-xl">
      <form onSubmit={handleSubmit}>
        <div className="relative flex items-center">
          <Search className="pointer-events-none absolute left-4 h-4 w-4 text-slate-400" />
          <input
            ref={inputRef}
            autoComplete="off"
            className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-24 text-sm font-medium text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
            onChange={e => setQuery(e.target.value)}
            onFocus={() => hits.length > 0 && setOpen(true)}
            placeholder="Szukaj porad, roślin, problemów…"
            type="search"
            value={query}
          />
          <div className="absolute right-2 flex items-center gap-1">
            {isPending && <Loader2 className="h-4 w-4 animate-spin text-teal-600" />}
            {query && !isPending && (
              <button
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                onClick={clear}
                type="button"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              className="h-8 rounded-lg bg-teal-700 px-3 text-xs font-bold text-white transition hover:bg-teal-800"
              type="submit"
            >
              Szukaj
            </button>
          </div>
        </div>
      </form>

      {open && hits.length > 0 && (
        <div className="absolute left-0 right-0 top-[52px] z-50 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
          {hits.map(hit => (
            <a
              className="flex items-start gap-3 px-4 py-3 transition hover:bg-teal-50"
              href={articleHref(hit)}
              key={hit.slug}
              onClick={() => setOpen(false)}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-900">{hit.title}</p>
                <p className="text-xs text-teal-700">{hit.topic}</p>
              </div>
            </a>
          ))}
          <button
            className="flex w-full items-center justify-between border-t border-slate-100 px-4 py-3 text-sm font-bold text-teal-700 transition hover:bg-teal-50"
            onClick={handleSubmit as any}
            type="button"
          >
            Zobacz wszystkie wyniki dla „{query}"
            <Search className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
