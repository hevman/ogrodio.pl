import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Bell, BookOpen, CalendarDays, CheckCircle2, ClipboardList, Leaf, Smartphone } from "lucide-react";
import { PageSection, PageShell } from "@/components/page-shell";
import { getPlantCatalog, getPlantIntelligence } from "@/lib/plant-catalog";
import { site } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Plan opieki nad roślinami | Ogrodio",
  description:
    "Sprawdź, co warto zrobić teraz przy swoich roślinach. Ogrodio łączy katalog, sezonowy plan prac, poradniki i kalendarz w aplikacji.",
  alternates: { canonical: "/ogrodio-plant-intelligence" },
  openGraph: {
    title: "Plan opieki nad roślinami | Ogrodio",
    description: "Katalog roślin, sezonowe prace, ryzyka i przypomnienia w jednym planie.",
    type: "website",
    url: "/ogrodio-plant-intelligence",
  },
};

const steps = [
  {
    icon: Leaf,
    title: "Wybierasz roślinę",
    text: "Karta pokazuje wymagania, sezonowe ryzyka i sprawdzone poradniki, bez przepisywania całej encyklopedii.",
  },
  {
    icon: ClipboardList,
    title: "Dodajesz ją do swojego ogrodu",
    text: "W aplikacji zapisujesz odmianę, miejsce, datę posadzenia i kondycję konkretnego egzemplarza.",
  },
  {
    icon: CalendarDays,
    title: "Dostajesz plan prac",
    text: "Kalendarz pokazuje zadania właściwe dla sezonu. Możesz je przyjąć, zaplanować na dzień i oznaczyć jako wykonane.",
  },
  {
    icon: Bell,
    title: "Zapisujesz obserwacje",
    text: "Zdjęcia i notatki pozostają przy roślinie, więc kolejna decyzja ma historię, a nie tylko ogólną poradę z internetu.",
  },
] as const;

function taskTypeLabel(type: string) {
  if (type === "start") return "sadzenie i siew";
  if (type === "harvest") return "zbiory";
  return "pielęgnacja";
}

export default async function PlantIntelligencePage() {
  const plantCatalog = await getPlantCatalog();
  const livePlans = plantCatalog
    .map((plant) => ({ plant, intelligence: getPlantIntelligence(plant) }))
    .filter(({ intelligence }) => intelligence.actionWindow.entries.length > 0)
    .slice(0, 3);
  const pageUrl = `${site.publicUrl}/ogrodio-plant-intelligence`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Plan opieki nad roślinami Ogrodio",
    description: metadata.description,
    url: pageUrl,
    isPartOf: {
      "@type": "WebSite",
      name: site.name,
      url: site.publicUrl,
    },
  };

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} type="application/ld+json" />
      <PageShell
        breadcrumb={[
          { href: "/", label: "Start" },
          { href: "/katalog-roslin", label: "Katalog roślin" },
          { label: "Plan opieki" },
        ]}
        description="Nie kolejny opis rośliny. Jeden system, który zamienia dane z katalogu w konkretne decyzje, zadania i historię Twojego ogrodu."
        eyebrow="Ogrodio Plant Intelligence"
        title="Wiesz, co robić przy roślinie teraz"
      >
        <PageSection>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
            <div className="space-y-10">
              <section className="rounded-2xl border border-teal-200 bg-[#f2fbf8] p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-teal-700 shadow-sm">
                    <CalendarDays className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wide text-teal-700">Plan na bieżący sezon</p>
                    <h2 className="mt-1 text-2xl font-bold text-slate-900">Katalog, który prowadzi do działania</h2>
                    <p className="mt-3 max-w-3xl text-base leading-8 text-slate-700">
                      Każda karta rośliny zawiera ten sam zestaw danych: kalendarz prac, ryzyka sezonowe, objawy, odmiany i linki do poradników.
                      Po dodaniu rośliny do aplikacji te dane stają się planem Twojego ogrodu.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <p className="text-sm font-bold uppercase tracking-wide text-teal-700">Teraz w katalogu</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">Przykładowe najbliższe prace</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">To żywe dane z kart roślin, a nie przykładowy tekst marketingowy.</p>
                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  {livePlans.map(({ plant, intelligence }) => {
                    const task = intelligence.actionWindow.entries[0];
                    return (
                      <Link
                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-300 hover:bg-teal-50/40"
                        href={`/katalog-roslin/${plant.slug}`}
                        key={plant.slug}
                      >
                        <p className="text-xs font-black uppercase tracking-wide text-teal-700">{intelligence.actionWindow.label}</p>
                        <h3 className="mt-2 text-lg font-bold text-slate-900">{plant.name}</h3>
                        <p className="mt-3 text-sm font-bold text-slate-700">{taskTypeLabel(task.type)}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-600">{task.task}</p>
                        <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-teal-700">
                          Zobacz pełny plan <ArrowUpRight className="h-4 w-4" />
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </section>

              <section>
                <p className="text-sm font-bold uppercase tracking-wide text-teal-700">Jeden obieg danych</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">Od wiedzy do własnego ogrodu</h2>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {steps.map((step) => {
                    const Icon = step.icon;
                    return (
                      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" key={step.title}>
                        <Icon className="h-5 w-5 text-teal-700" />
                        <h3 className="mt-3 text-lg font-bold text-slate-900">{step.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{step.text}</p>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-start gap-4">
                  <BookOpen className="mt-1 h-5 w-5 shrink-0 text-teal-700" />
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Poradnik wtedy, gdy jest potrzebny</h2>
                    <p className="mt-3 text-base leading-7 text-slate-700">
                      Karta nie zastępuje poradnika. Ma rozpoznać moment: sadzenie, żółknące liście, suszę lub zbiór, a potem prowadzić do tekstu,
                      który rozwija właśnie ten temat. Dzięki temu katalog jest narzędziem, a poradniki odpowiadają na konkretne pytania.
                    </p>
                  </div>
                </div>
              </section>
            </div>

            <aside className="space-y-4 lg:sticky lg:top-24">
              <div className="rounded-2xl border border-teal-200 bg-[#f4f7f2] p-5">
                <p className="text-sm font-bold uppercase tracking-wide text-teal-700">Zacznij od rośliny</p>
                <p className="mt-3 text-sm leading-6 text-slate-700">
                  W katalogu jest dziś {plantCatalog.length} roślin z danymi gotowymi do użycia w planie opieki.
                </p>
                <Link className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 text-sm font-bold text-white transition hover:bg-teal-800" href="/katalog-roslin">
                  Otwórz katalog <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <Smartphone className="h-5 w-5 text-teal-700" />
                <h2 className="mt-3 text-lg font-bold text-slate-900">Masz już roślinę?</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">Dodaj ją do aplikacji, aby przypisać plan do swojego miejsca, odmiany i historii uprawy.</p>
                <a className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-bold text-white transition hover:bg-slate-800" href={`${site.appUrl}/plants`}>
                  Otwórz mój ogród
                </a>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <CheckCircle2 className="h-5 w-5 text-emerald-700" />
                <p className="mt-3 text-sm font-bold text-slate-900">Najpierw reguły i dane, potem automatyzacja.</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Ogrodio nie zgaduje. Podpowiedź zawsze wynika z opisu konkretnej rośliny i sezonu.</p>
              </div>
            </aside>
          </div>
        </PageSection>
      </PageShell>
    </>
  );
}
