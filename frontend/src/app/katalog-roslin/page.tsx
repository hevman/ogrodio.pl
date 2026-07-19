import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import { PlantCatalogBrowser } from "@/components/plant-catalog-browser";
import { PageSection, PageShell } from "@/components/page-shell";
import { getPlantCatalog, getPlantGroups, type PlantCatalogItem } from "@/lib/plant-catalog";
import { site } from "@/lib/site-config";

export const dynamic = "force-dynamic";

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

function itemListJsonLd(plants: PlantCatalogItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Katalog roślin Ogrodio",
    numberOfItems: plants.length,
    itemListElement: plants.map((plant, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: plant.name,
      url: `${site.publicUrl}/katalog-roslin/${plant.slug}`,
    })),
  };
}

export default async function PlantCatalogPage() {
  const plants = await getPlantCatalog();
  const groups = getPlantGroups(plants);

  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd(plants)) }}
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
            <PlantCatalogBrowser groups={groups} plants={plants} />

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
