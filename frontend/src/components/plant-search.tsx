'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Loader2, Search, X } from 'lucide-react';
import { searchPlants, type PlantHit } from '@/lib/search-api';

export function PlantSearch() {
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<PlantHit[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestRef = useRef(0);

  // Zamknij po kliknięciu poza
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
      const results = await searchPlants(query);
      if (requestId !== requestRef.current) return;
      setHits(results.slice(0, 8));
      setOpen(results.length > 0);
      setLoading(false);
    }, 220);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  function clear() {
    setQuery('');
    setHits([]);
    setOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, hits.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActiveIndex(-1);
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      window.location.href = `/katalog-roslin/${hits[activeIndex].slug}`;
    }
  }

  const difficultyClass: Record<string, string> = {
    łatwa: 'bg-emerald-50 text-emerald-700',
    średnia: 'bg-amber-50 text-amber-700',
    trudna: 'bg-rose-50 text-rose-700',
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl">
      <div className="relative flex items-center" role="search">
        <Search className="pointer-events-none absolute left-4 h-4 w-4 text-slate-400" aria-hidden />
        <input
          ref={inputRef}
          aria-autocomplete="list"
          aria-controls="plant-search-dropdown"
          aria-expanded={open}
          aria-label="Szukaj rośliny"
          autoComplete="off"
          className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-12 text-sm font-medium text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
          onChange={e => setQuery(e.target.value)}
          onFocus={() => { if (hits.length > 0) setOpen(true); }}
          onKeyDown={handleKeyDown}
          placeholder="Szukaj rośliny po nazwie, np. borówka, lawenda…"
          role="combobox"
          spellCheck={false}
          type="search"
          value={query}
        />
        <div className="absolute right-3 flex items-center gap-1">
          {loading && <Loader2 className="h-4 w-4 animate-spin text-teal-500" aria-hidden />}
          {query && !loading && (
            <button
              aria-label="Wyczyść"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100"
              onClick={clear}
              type="button"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {open && hits.length > 0 && (
        <div
          id="plant-search-dropdown"
          role="listbox"
          className="absolute left-0 right-0 top-[52px] z-50 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
        >
          {hits.map((hit, i) => (
            <a
              key={hit.slug}
              role="option"
              aria-selected={i === activeIndex}
              href={`/katalog-roslin/${hit.slug}`}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 transition ${i === activeIndex ? 'bg-teal-50' : 'hover:bg-slate-50'}`}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">{hit.name}</p>
                <p className="mt-0.5 text-xs text-slate-400">
                  {hit.latinName && <span className="italic">{hit.latinName}</span>}
                  {hit.latinName && hit.group && <span> · </span>}
                  <span>{hit.group}</span>
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {hit.difficulty && (
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${difficultyClass[hit.difficulty] ?? 'bg-slate-100 text-slate-600'}`}>
                    {hit.difficulty}
                  </span>
                )}
                <ArrowUpRight className="h-4 w-4 text-slate-300" aria-hidden />
              </div>
            </a>
          ))}
        </div>
      )}

      {open && hits.length === 0 && !loading && query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-[52px] z-50 rounded-xl border border-slate-200 bg-white px-4 py-5 text-center shadow-2xl">
          <p className="text-sm text-slate-500">Brak roślin dla „{query}"</p>
        </div>
      )}
    </div>
  );
}
