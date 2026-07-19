"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, Droplets, Search, SunMedium, X } from "lucide-react";
import type { PlantCatalogItem } from "@/lib/plant-catalog";
import { textMatchesQuery } from "@/lib/local-search";

function groupAnchor(group: string) {
  return group.toLowerCase().replaceAll(" ", "-");
}

function difficultyClass(difficulty: string) {
  if (difficulty === "łatwa") return "bg-emerald-50 text-emerald-700";
  if (difficulty === "średnia") return "bg-amber-50 text-amber-700";
  return "bg-rose-50 text-rose-700";
}

function plantSearchText(plant: PlantCatalogItem) {
  return [
    plant.name,
    plant.latinName,
    plant.slug,
    plant.group,
    plant.summary,
    plant.difficulty,
    plant.sun,
    plant.soil,
    plant.water,
    plant.harvest,
    ...(plant.tags || []),
    ...(plant.searchIntents || []),
    ...(plant.problems || []).map((problem) => problem.symptom),
    ...(plant.signals || []).flatMap((signal) => [signal.title, signal.means, signal.action]),
  ].join(" ");
}

export function PlantCatalogBrowser({
  groups,
  plants,
}: {
  groups: string[];
  plants: PlantCatalogItem[];
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () => plants.filter((plant) => textMatchesQuery(plantSearchText(plant), query)),
    [plants, query],
  );

  const visibleGroups = useMemo(
    () => groups
      .map((group) => ({
        group,
        plants: filtered.filter((plant) => plant.group === group),
      }))
      .filter((entry) => entry.plants.length > 0),
    [filtered, groups],
  );

  return (
    <>
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            aria-label="Filtruj katalog roślin"
            className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-11 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filtruj rośliny: malina, borówka, cień, podlewanie..."
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
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-bold text-slate-900">
              {filtered.length} z {plants.length} roślin
            </p>
            <p className="text-sm text-slate-500">Filtr działa od razu na danych katalogu.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {groups.map((group) => (
              <a
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-bold text-slate-600 transition hover:border-teal-200 hover:text-teal-700"
                href={`#${groupAnchor(group)}`}
                key={group}
              >
                {group}
              </a>
            ))}
          </div>
        </div>
      </div>

      {visibleGroups.length === 0 ? (
        <div className="py-16 text-center text-slate-500">
          <p className="text-lg font-bold text-slate-700">Brak roślin dla tego filtra.</p>
          <p className="mt-2 text-sm">Spróbuj wpisać nazwę, grupę, objaw albo wymaganie rośliny.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {visibleGroups.map(({ group, plants: groupPlants }) => (
            <section id={groupAnchor(group)} key={group}>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-teal-700">{group}</p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-900">{groupPlants.length} roślin</h2>
                </div>
              </div>
              <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {groupPlants.map((plant, index) => (
                  <Link
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
                    href={`/katalog-roslin/${plant.slug}`}
                    key={plant.slug}
                  >
                    <div className="relative aspect-[4/3] bg-slate-100">
                      <Image
                        alt={plant.imageAlt}
                        className="object-cover transition duration-300 group-hover:scale-[1.03]"
                        fill
                        priority={index === 0 && group === groups[0]}
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        src={plant.image}
                      />
                    </div>
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-teal-700">{plant.group}</p>
                          <h3 className="mt-1 text-xl font-bold text-slate-900">{plant.name}</h3>
                          <p className="mt-0.5 text-sm italic text-slate-500">{plant.latinName}</p>
                        </div>
                        <ArrowUpRight className="mt-1 h-5 w-5 shrink-0 text-slate-400 transition group-hover:text-teal-700" />
                      </div>
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{plant.summary}</p>
                      <div className="mt-4 grid gap-2 text-xs text-slate-600">
                        <span className="flex items-center gap-2">
                          <SunMedium className="h-4 w-4 text-amber-500" />
                          {plant.sun}
                        </span>
                        <span className="flex items-center gap-2">
                          <Droplets className="h-4 w-4 text-sky-500" />
                          {plant.water}
                        </span>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${difficultyClass(plant.difficulty)}`}>
                          {plant.difficulty}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                          {plant.harvest}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
