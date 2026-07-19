'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowUpRight, Loader2, Search, X } from 'lucide-react';
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
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestRef = useRef(0);

  // Zamknij dropdown po kliknięciu poza komponentem
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  // Fetch z debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setActiveIndex(-1);
    if (query.trim().length < 2) {
      setHits([]);
      setOpen(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    const requestId = ++requestRef.current;
    debounceRef.current = setTimeout(async () => {
      const results = await searchArticles(query);
      if (requestId !== requestRef.current) return;
      setHits(results.slice(0, 7));
      setOpen(results.length > 0);
      setLoading(false);
    }, 220);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  const goToSearch = useCallback(() => {
    const q = query.trim();
    setOpen(false);
    if (q) router.push(`/porady/szukaj?q=${encodeURIComponent(q)}`);
  }, [query, router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    goToSearch();
  }

  function clear() {
    setQuery('');
    setHits([]);
    setOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return;
    const total = hits.length + 1; // +1 za "Zobacz wszystkie"
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => (i + 1) % total);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => (i - 1 + total) % total);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActiveIndex(-1);
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      if (activeIndex < hits.length) {
        router.push(articleHref(hits[activeIndex]));
        setOpen(false);
      } else {
        goToSearch();
      }
    }
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl">
      <form onSubmit={handleSubmit} role="search">
        <div className="relative flex items-center">
          <Search className="pointer-events-none absolute left-4 h-4 w-4 text-slate-400" aria-hidden />
          <input
            ref={inputRef}
            aria-autocomplete="list"
            aria-controls="advice-search-dropdown"
            aria-expanded={open}
            aria-label="Szukaj porad ogrodniczych"
            autoComplete="off"
            className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-28 text-sm font-medium text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
            onChange={e => { setQuery(e.target.value); }}
            onFocus={() => { if (hits.length > 0) setOpen(true); }}
            onKeyDown={handleKeyDown}
            placeholder="Szukaj porad, roślin, problemów…"
            role="combobox"
            spellCheck={false}
            type="search"
            value={query}
          />
          <div className="absolute right-2 flex items-center gap-1.5">
            {loading && <Loader2 className="h-4 w-4 animate-spin text-teal-500" aria-hidden />}
            {query && !loading && (
              <button
                aria-label="Wyczyść"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                onClick={clear}
                type="button"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              className="h-8 rounded-lg bg-teal-700 px-3 text-xs font-bold text-white transition hover:bg-teal-800 active:scale-95"
              type="submit"
            >
              Szukaj
            </button>
          </div>
        </div>
      </form>

      {open && (
        <div
          id="advice-search-dropdown"
          role="listbox"
          className="absolute left-0 right-0 top-[52px] z-50 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
        >
          {hits.map((hit, i) => (
            <a
              key={hit.slug}
              role="option"
              aria-selected={i === activeIndex}
              href={articleHref(hit)}
              onClick={() => setOpen(false)}
              className={`flex items-start gap-3 px-4 py-3 transition ${i === activeIndex ? 'bg-teal-50' : 'hover:bg-slate-50'}`}
            >
              <Search className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-300" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">{hit.title}</p>
                <p className="mt-0.5 text-xs text-teal-600">{hit.topic}</p>
              </div>
            </a>
          ))}
          <button
            role="option"
            aria-selected={activeIndex === hits.length}
            onClick={goToSearch}
            className={`flex w-full items-center justify-between border-t border-slate-100 px-4 py-3 text-sm font-bold text-teal-700 transition ${activeIndex === hits.length ? 'bg-teal-50' : 'hover:bg-slate-50'}`}
          >
            <span>Zobacz wszystkie wyniki dla „{query}"</span>
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
}
