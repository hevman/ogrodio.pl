import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  BookOpen,
  BrainCircuit,
  CalendarDays,
  ClipboardList,
  Leaf,
  Link2,
  Smartphone,
} from "lucide-react";
import { PageSection, PageShell } from "@/components/page-shell";
import { plantCatalog } from "@/lib/plant-catalog";
import { site } from "@/lib/site-config";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Ogrodio Plant Intelligence - system sezonowej wiedzy o roślinach",
  description:
    "Ogrodio Plant Intelligence to własny system Ogrodio: kalendarz prac na cały rok, ryzyka sezonowe i powiązania z poradnikami. Działa w katalogu roślin i aplikacji ogrodniczej.",
  alternates: { canonical: "/ogrodio-plant-intelligence" },
  openGraph: {
    title: "Ogrodio Plant Intelligence - własny system Ogrodio",
    description:
      "Sezonowa inteligencja roślin: co zrobić teraz, na co uważać i jakie poradniki przeczytać. Jedna wiedza w katalogu i aplikacji.",
    type: "website",
    url: "/ogrodio-plant-intelligence",
  },
};

const faqItems = [
  {
    question: "Co to jest Ogrodio Plant Intelligence?",
    answer:
      "To własny system Ogrodio, który na podstawie danych o konkretnej roślinie pokazuje, co zrobić w danym miesiącu, jakie ryzyka są aktualne i do jakich poradników przejść dalej. Działa w publicznym katalogu roślin i w aplikacji ogrodniczej użytkownika.",
  },
  {
    question: "Skąd pochodzą dane w systemie?",
    answer:
      "Każda roślina ma własny plik wiedzy na cały rok: kalendarz prac miesiąc po miesiącu, problemy, ryzyka sezonowe, odmiany i linki do poradników Ogrodio. To jedno źródło prawdy dla katalogu, aplikacji i zadań sezonowych.",
  },
  {
    question: "Czy Ogrodio Plant Intelligence działa w aplikacji Ogrodio?",
    answer:
      "Tak. Po dodaniu rośliny do ogrodu użytkownik widzi ten sam panel intelligence co na stronie katalogowej: aktualne zadania, ryzyka i plan roku. System zasila też sugestie zadań w kalendarzu.",
  },
  {
    question: "Ile roślin obsługuje system?",
    answer:
      `Aktualnie ${plantCatalog.length} roślin testowych w katalogu Ogrodio. System jest budowany technologicznie pod skalowanie — nowe rośliny dodajemy po uzupełnieniu pełnej wiedzy sezonowej w JSON, nie przez osobny CMS.`,
  },
  {
    question: "Czym różni się od zwykłego kalendarza ogrodniczego?",
    answer:
      "Zwykły kalendarz mówi „w lipcu podlewaj”. Ogrodio Plant Intelligence łączy zadanie z konkretną rośliną, objawem problemu, ryzykiem sezonowym i poradnikiem Ogrodio. Wiedza jest powiązana w graf, a nie rozbita na osobne artykuły.",
  },
] as const;

const pillars = [
  {
    icon: CalendarDays,
    title: "Kalendarz na cały rok",
    text: "Każda roślina ma zadania na wszystkie miesiące — od zimowej kontroli po zbiór i przygotowanie na kolejny sezon.",
  },
  {
    icon: AlertTriangle,
    title: "Ryzyka sezonowe",
    text: "System pokazuje, na co uważać teraz: susza, chloroza, przymrozki — z objawem, działaniem i linkiem do porady.",
  },
  {
    icon: Link2,
    title: "Graf wiedzy",
    text: "Roślina łączy się z poradnikami, problemami i zadaniami. Jedna karta prowadzi do właściwej wiedzy w serwisie.",
  },
  {
    icon: Smartphone,
    title: "Katalog i aplikacja",
    text: "Ten sam silnik w SEO katalogu i w ogrodzie użytkownika. Dodajesz roślinę — dostajesz tę samą inteligencję.",
  },
] as const;

const flowSteps = [
  { label: "JSON rośliny", detail: "Pełna wiedza sezonowa w jednym pliku na cały rok" },
  { label: "Silnik Ogrodio Plant Intelligence", detail: "Wybiera zadania, ryzyka i porady na dziś" },
  { label: "Katalog roślin", detail: "Publiczne karty SEO z blokiem „Teraz”" },
  { label: "Aplikacja Ogrodio", detail: "Ten sam panel po dodaniu rośliny do ogrodu" },
] as const;

export default function PlantIntelligencePage() {
  const pageUrl = `${site.publicUrl}/plant-intelligence`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Ogrodio Plant Intelligence",
      description: metadata.description,
      url: pageUrl,
      isPartOf: {
        "@type": "WebSite",
        name: site.name,
        url: site.publicUrl,
      },
      about: {
        "@type": "SoftwareApplication",
        name: "Ogrodio Plant Intelligence",
        applicationCategory: "LifestyleApplication",
        operatingSystem: "Web",
        url: pageUrl,
        description:
          "Własny system sezonowej wiedzy o roślinach Ogrodio: kalendarz prac, ryzyka i powiązania z poradnikami.",
        creator: {
          "@type": "Organization",
          name: site.name,
          url: site.publicUrl,
        },
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "PLN",
        },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
  ];

  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        type="application/ld+json"
      />

      <PageShell
        breadcrumb={[
          { href: "/", label: "Start" },
          { href: "/katalog-roslin", label: "Katalog roślin" },
          { label: "Ogrodio Plant Intelligence" },
        ]}
        description="Sezonowa wiedza o roślinach w katalogu i aplikacji — kalendarz prac na cały rok, ryzyka i powiązania z poradnikami Ogrodio."
        eyebrow="Własny system Ogrodio"
        title="Ogrodio Plant Intelligence"
      >
        <PageSection>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
            <div className="space-y-8">
              <section className="rounded-2xl border border-teal-100 bg-[#f2fbf8] p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-teal-700 shadow-sm">
                    <BrainCircuit className="h-6 w-6" />
                  </span>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Co to jest?</h2>
                    <p className="mt-3 text-base leading-8 text-slate-700">
                      <strong>Ogrodio Plant Intelligence</strong> to nasz własny system, który odpowiada na pytanie:
                      „co z tą rośliną zrobić <em>teraz</em>”. Nie generuje ogólnych porad — czyta pełną wiedzę
                      sezonową zapisane w danych konkretnej rośliny i pokazuje aktualne zadania, ryzyka oraz
                      powiązane poradniki Ogrodio.
                    </p>
                    <p className="mt-3 text-base leading-8 text-slate-700">
                      To przewaga technologiczna serwisu: katalog SEO, aplikacja ogrodnicza i przyszły sklep mogą
                      korzystać z tego samego źródła wiedzy, zamiast duplikować treści w wielu miejscach.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <p className="text-sm font-bold uppercase tracking-wide text-teal-700">Jak działa</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">Od danych rośliny do „Teraz (VII)”</h2>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {flowSteps.map((step, index) => (
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" key={step.label}>
                      <p className="text-xs font-black uppercase tracking-wide text-teal-700">Krok {index + 1}</p>
                      <h3 className="mt-2 text-lg font-bold text-slate-900">{step.label}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{step.detail}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <p className="text-sm font-bold uppercase tracking-wide text-teal-700">Filary systemu</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">Co dostajesz na każdej karcie rośliny</h2>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {pillars.map((pillar) => {
                    const Icon = pillar.icon;
                    return (
                      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" key={pillar.title}>
                        <Icon className="h-5 w-5 text-teal-700" />
                        <h3 className="mt-3 text-lg font-bold text-slate-900">{pillar.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{pillar.text}</p>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-teal-700" />
                  <h2 className="text-2xl font-bold text-slate-900">Jedno źródło prawdy</h2>
                </div>
                <p className="mt-4 text-base leading-8 text-slate-700">
                  Wiedza o roślinie żyje w jednym pliku JSON na cały rok: kalendarz miesiąc po miesiącu, problemy,
                  ryzyka, odmiany i linki do poradników. Silnik intelligence tylko filtruje te dane według daty —
                  nie zgaduje z tekstu i nie buduje osobnego CMS.
                </p>
                <ul className="mt-5 grid gap-3 text-sm text-slate-700">
                  {[
                    "Katalog roślin — publiczne karty SEO z blokiem „Teraz”",
                    "Aplikacja Ogrodio — ten sam panel po dodaniu rośliny do ogrodu",
                    "Zadania sezonowe — sugestie w kalendarzu na podstawie tych samych danych",
                    "Sklep (w przygotowaniu) — produkty powiązane z zadaniami i ryzykami",
                  ].map((item) => (
                    <li className="flex gap-3 rounded-xl bg-slate-50 px-4 py-3" key={item}>
                      <Leaf className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <p className="text-sm font-bold uppercase tracking-wide text-teal-700">FAQ</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">Najczęstsze pytania</h2>
                <div className="mt-5 grid gap-3">
                  {faqItems.map((item) => (
                    <details className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" key={item.question}>
                      <summary className="cursor-pointer list-none font-bold text-slate-900 marker:content-none">
                        {item.question}
                      </summary>
                      <p className="mt-3 text-sm leading-7 text-slate-600">{item.answer}</p>
                    </details>
                  ))}
                </div>
              </section>
            </div>

            <aside className="space-y-4 lg:sticky lg:top-24">
              <div className="rounded-2xl border border-teal-200 bg-[#f4f7f2] p-5">
                <p className="text-sm font-bold uppercase tracking-wide text-teal-700">Zobacz w praktyce</p>
                <p className="mt-3 text-sm leading-6 text-slate-700">
                  Wejdź w kartę rośliny i sprawdź blok „Ogrodio Plant Intelligence” — zadania na dziś, ryzyka i plan roku.
                </p>
                <Link
                  className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-xl bg-teal-700 px-4 text-sm font-bold text-white transition hover:bg-teal-800"
                  href="/katalog-roslin/borowka-amerykanska"
                >
                  Przykład: borówka amerykańska
                </Link>
                <Link
                  className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-teal-200 hover:text-teal-700"
                  href="/katalog-roslin"
                >
                  Cały katalog
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <ClipboardList className="h-5 w-5 text-teal-700" />
                <p className="mt-3 text-sm font-bold text-slate-900">{plantCatalog.length} roślin w systemie</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Rozwijamy technologię na stałym zbiorze testowym. Kolejne gatunki dodamy po uzupełnieniu pełnej wiedzy rocznej.
                </p>
                <a
                  className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-bold text-white transition hover:bg-slate-800"
                  href={site.appUrl}
                >
                  Otwórz aplikację Ogrodio
                </a>
              </div>
            </aside>
          </div>
        </PageSection>
      </PageShell>
    </>
  );
}
