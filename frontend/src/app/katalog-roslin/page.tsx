import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, Droplets, Search, SunMedium } from "lucide-react";
import { PageSection, PageShell } from "@/components/page-shell";
import { plantCatalog, plantGroups } from "@/lib/plant-catalog";
import { site } from "@/lib/site-config";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Katalog roślin - Ogrodio",
  description: "Praktyczny katalog roślin ogrodowych, balkonowych i domowych: wymagania, podlewanie, terminy prac i powiązane poradniki Ogrodio.",
  alternates: { canonical: "/katalog-roslin" },
  openGraph: {
    title: "Katalog roślin - Ogrodio",
    description: "Rośliny opisane praktycznie: stanowisko, gleba, podlewanie, kalendarz prac i najczęstsze problemy.",
    type: "website",
    url: "/katalog-roslin",
  },
};

const itemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Katalog roślin Ogrodio",
  numberOfItems: plantCatalog.length,
  itemListElement: plantCatalog.map((plant, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: plant.name,
    url: `${site.publicUrl}/katalog-roslin/${plant.slug}`,
  })),
};

function difficultyClass(difficulty: string) {
  if (difficulty === "łatwa") return "bg-emerald-50 text-emerald-700";
  if (difficulty === "średnia") return "bg-amber-50 text-amber-700";
  return "bg-rose-50 text-rose-700";
}

export default function PlantCatalogPage() {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        type="application/ld+json"
      />
      <PageShell
        breadcrumb={[{ href: "/", label: "Start" }, { label: "Katalog roślin" }]}
        description="Karty roślin z konkretnymi wymaganiami, najbliższymi pracami, typowymi problemami i przejściami do poradników Ogrodio."
        eyebrow="Katalog roślin"
        title="Rośliny opisane tak, żeby łatwiej o nie dbać"
      >
        <PageSection>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                    <Search className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-bold text-slate-900">{plantCatalog.length} roślin testowych</p>
                    <p className="text-sm text-slate-500">Owoce, warzywnik, zioła, iglaki i rośliny ozdobne.</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {plantGroups.map((group) => (
                    <a
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs font-bold text-slate-600 transition hover:border-teal-200 hover:text-teal-700"
                      href={`#${group.toLowerCase().replaceAll(" ", "-")}`}
                      key={group}
                    >
                      {group}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <aside className="rounded-2xl border border-slate-200 bg-[#f4f7f2] p-5">
              <p className="text-sm font-bold uppercase tracking-wide text-teal-700">Plan opieki</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                Każda karta pokazuje najbliższe prace, typowe problemy i przejścia do poradników. Po dodaniu rośliny do aplikacji te dane mogą zasilać kalendarz.
              </p>
              <Link
                className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-teal-700 transition hover:text-teal-900"
                href="/ogrodio-plant-intelligence"
              >
                Jak działa plan opieki
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </aside>
          </div>

          <div className="mt-8 space-y-12">
            {plantGroups.map((group) => {
              const plants = plantCatalog.filter((plant) => plant.group === group);
              return (
                <section id={group.toLowerCase().replaceAll(" ", "-")} key={group}>
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-wide text-teal-700">{group}</p>
                      <h2 className="mt-1 text-2xl font-bold text-slate-900">{plants.length} roślin</h2>
                    </div>
                  </div>
                  <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {plants.map((plant, index) => (
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
                            priority={index === 0 && group === plantGroups[0]}
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
              );
            })}
          </div>

          <div className="mt-12 grid gap-4 rounded-2xl border border-teal-100 bg-teal-50 p-5 sm:grid-cols-[auto,1fr] sm:items-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-teal-700">
              <CalendarDays className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Katalog połączony z aplikacją</h2>
              <p className="mt-1 text-sm leading-6 text-slate-700">
                Te same dane pomagają budować przypomnienia sezonowe w aplikacji: sadzenie, cięcie, nawożenie, zbiory i obserwację problemów.
              </p>
            </div>
          </div>
        </PageSection>
      </PageShell>
    </>
  );
}
