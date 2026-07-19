import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Bell, BookOpen, CalendarDays, Leaf, Smartphone } from "lucide-react";
import { PageSection, PageShell } from "@/components/page-shell";
import { getPlantCatalog } from "@/lib/plant-catalog";
import { site } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Plan opieki nad roślinami - Ogrodio",
  description:
    "Ogrodio pokazuje, co zrobić przy konkretnej roślinie teraz, o czym pamiętać w kolejnych miesiącach i które poradniki warto przeczytać.",
  alternates: { canonical: "/ogrodio-plant-intelligence" },
  openGraph: {
    title: "Plan opieki nad roślinami w Ogrodio",
    description:
      "Katalog roślin połączony z kalendarzem w aplikacji: prace sezonowe, typowe problemy i poradniki w jednym miejscu.",
    type: "website",
    url: "/ogrodio-plant-intelligence",
  },
};

const faqItems = [
  {
    question: "Po co jest plan opieki przy roślinie?",
    answer:
      "Żeby szybko zobaczyć, co przy danej roślinie warto zrobić teraz: siać, podlewać, ciąć, zebrać plon albo sprawdzić typowy problem.",
  },
  {
    question: "Czy to działa też w aplikacji?",
    answer:
      "Tak. Po dodaniu rośliny do swojego ogrodu Ogrodio może pokazywać te same prace w kalendarzu i przypominać o nich wtedy, kiedy są potrzebne.",
  },
  {
    question: "Skąd biorą się poradniki przy roślinie?",
    answer:
      "Każda karta rośliny jest połączona z poradnikami Ogrodio. Jeśli problem albo praca wymaga szerszego wyjaśnienia, karta prowadzi do właściwego artykułu.",
  },
] as const;

const benefits = [
  {
    icon: CalendarDays,
    title: "Wiesz, co zrobić teraz",
    text: "Na karcie rośliny od razu widać najbliższe prace, zamiast szukać ich w długim artykule.",
  },
  {
    icon: Bell,
    title: "Nie gubisz terminów",
    text: "Po dodaniu rośliny do aplikacji te same prace mogą pojawić się w Twoim kalendarzu ogrodowym.",
  },
  {
    icon: BookOpen,
    title: "Masz przejście do poradników",
    text: "Katalog prowadzi do konkretnych tekstów o uprawie, chorobach, błędach i zbiorach.",
  },
  {
    icon: Smartphone,
    title: "Katalog i aplikacja mówią jednym głosem",
    text: "To, co czytasz publicznie, jest tym samym kierunkiem opieki, który dostajesz w aplikacji.",
  },
] as const;

export default async function PlantIntelligencePage() {
  const plantCatalog = await getPlantCatalog();
  const pageUrl = `${site.publicUrl}/ogrodio-plant-intelligence`;

  const jsonLd = [
    {
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
          { label: "Plan opieki" },
        ]}
        description="Katalog roślin w Ogrodio nie ma być encyklopedią do czytania raz. Ma podpowiadać, co zrobić przy roślinie teraz, a po dodaniu jej do aplikacji pomagać pamiętać o pracach w sezonie."
        eyebrow="Katalog i aplikacja"
        title="Plan opieki nad rośliną w Ogrodio"
      >
        <PageSection>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
            <div className="space-y-8">
              <section className="rounded-2xl border border-teal-100 bg-[#f2fbf8] p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-teal-700 shadow-sm">
                    <Leaf className="h-6 w-6" />
                  </span>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">O co chodzi?</h2>
                    <p className="mt-3 text-base leading-8 text-slate-700">
                      Przy każdej roślinie zbieramy najważniejsze prace sezonowe, typowe problemy i poradniki. Dzięki temu karta
                      nie kończy się na opisie „lubi słońce i żyzną ziemię”, tylko mówi prostym językiem: co zrobić teraz,
                      czego pilnować i gdzie przeczytać więcej.
                    </p>
                    <p className="mt-3 text-base leading-8 text-slate-700">
                      Ten sam plan może potem działać w aplikacji. Dodajesz roślinę do swojego ogrodu, a Ogrodio ma z czego
                      zbudować przypomnienia w kalendarzu.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <p className="text-sm font-bold uppercase tracking-wide text-teal-700">Korzyści</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">Co widzi użytkownik</h2>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {benefits.map((benefit) => {
                    const Icon = benefit.icon;
                    return (
                      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" key={benefit.title}>
                        <Icon className="h-5 w-5 text-teal-700" />
                        <h3 className="mt-3 text-lg font-bold text-slate-900">{benefit.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{benefit.text}</p>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-2xl font-bold text-slate-900">Jak to wygląda w praktyce</h2>
                <div className="mt-5 grid gap-3 text-sm text-slate-700">
                  {[
                    "Na stronie sałaty widzisz, kiedy siać i kiedy zbierać liście.",
                    "Przy borówce dostajesz przypomnienia o podlewaniu i kontroli pH.",
                    "Przy roślinie z typowym problemem karta prowadzi do poradnika, a nie do ogólnej listy artykułów.",
                    "W aplikacji ta sama roślina może zasilać kalendarz prac w Twoim ogrodzie.",
                  ].map((item) => (
                    <div className="flex gap-3 rounded-xl bg-slate-50 px-4 py-3" key={item}>
                      <Leaf className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" />
                      {item}
                    </div>
                  ))}
                </div>
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
                <p className="text-sm font-bold uppercase tracking-wide text-teal-700">Zobacz na karcie</p>
                <p className="mt-3 text-sm leading-6 text-slate-700">
                  Najlepiej widać to na konkretnej roślinie: plan opieki, problemy i poradniki są w jednym miejscu.
                </p>
                <Link
                  className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-xl bg-teal-700 px-4 text-sm font-bold text-white transition hover:bg-teal-800"
                  href="/katalog-roslin/salata-lisciowa"
                >
                  Przykład: sałata liściowa
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
                <p className="text-sm font-bold text-slate-900">{plantCatalog.length} roślin w pierwszym katalogu</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Wolimy mniej kart, ale takich, które można realnie połączyć z poradnikami i kalendarzem.
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
