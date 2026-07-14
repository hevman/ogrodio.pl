'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { Loader2, Search, X } from 'lucide-react';
import { searchPlants, type PlantHit } from '@/lib/search-api';

export function PlantSearch() {
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<PlantHit[]>([]);
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
        const results = await searchPlants(query);
        setHits(results.slice(0, 8));
        setOpen(results.length > 0);
      });
    }, 200);
    return () => { if (debounce.current) clearTimeout(debounce.current); };
  }, [query]);

  function clear() {
    setQuery('');
    setHits([]);
    setOpen(false);
    inputRef.current?.focus();
  }

  return (
    <div className="relative w-full max-w-xl">
      <div className="relative flex items-center">
        <Search className="pointer-events-none absolute left-4 h-4 w-4 text-slate-400" />
        <input
          ref={inputRef}
          autoComplete="off"
          className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-12 text-sm font-medium text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
          onChange={e => setQuery(e.target.value)}
          onFocus={() => hits.length > 0 && setOpen(true)}
          placeholder="Szukaj rośliny po nazwie…"
          type="search"
          value={query}
        />
        <div className="absolute right-3 flex items-center gap-1">
          {isPending && <Loader2 className="h-4 w-4 animate-spin text-teal-600" />}
          {query && !isPending && (
            <button
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
        <div className="absolute left-0 right-0 top-[52px] z-50 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
          {hits.map(hit => (
            <a
              className="flex items-center gap-3 px-4 py-3 transition hover:bg-teal-50"
              href={`/katalog-roslin/${hit.slug}`}
              key={hit.slug}
              onClick={() => setOpen(false)}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-900">{hit.name}</p>
                <p className="text-xs text-slate-500">
                  {hit.latinName && <span className="italic">{hit.latinName}</span>}
                  {hit.latinName && hit.group && ' · '}
                  {hit.group}
                </p>
              </div>
              {hit.difficulty && (
                <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                  {hit.difficulty}
                </span>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
