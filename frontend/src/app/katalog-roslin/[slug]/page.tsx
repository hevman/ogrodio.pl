import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Droplets,
  Leaf,
  Ruler,
  Sprout,
  SunMedium,
} from "lucide-react";
import { Breadcrumb } from "@/components/breadcrumb";
import { PageSection } from "@/components/page-shell";
import { getPlantBySlug, getPlantIntelligence, plantCatalog } from "@/lib/plant-catalog";
import { site } from "@/lib/site-config";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return plantCatalog.map((plant) => ({ slug: plant.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const plant = getPlantBySlug(slug);
  if (!plant) return { title: "Roślina - Ogrodio" };

  return {
    title: `${plant.name} - wymagania, ryzyka i kalendarz prac | Ogrodio`,
    description: `${plant.summary} Sprawdź wymagania, najbliższe prace, typowe problemy i powiązane poradniki Ogrodio.`,
    alternates: { canonical: `/katalog-roslin/${plant.slug}` },
    openGraph: {
      title: `${plant.name} - katalog roślin Ogrodio`,
      description: plant.summary,
      images: [{ url: plant.image, alt: plant.imageAlt }],
      type: "article",
      url: `/katalog-roslin/${plant.slug}`,
    },
  };
}

function calendarClass(type: string) {
  if (type === "start") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (type === "harvest") return "border-amber-200 bg-amber-50 text-amber-800";
  return "border-sky-200 bg-sky-50 text-sky-800";
}

function taskTypeLabel(type: string) {
  if (type === "start") return "Start";
  if (type === "harvest") return "Zbiory";
  return "Opieka";
}

function riskClass(level: string) {
  if (level === "wysokie") return "border-rose-200 bg-rose-50 text-rose-900";
  return "border-amber-200 bg-amber-50 text-amber-900";
}

export default async function PlantPage({ params }: Props) {
  const { slug } = await params;
  const plant = getPlantBySlug(slug);
  if (!plant) notFound();

  const intelligence = getPlantIntelligence(plant);
  const appAddUrl = `${site.appUrl}/plants?plantType=${encodeURIComponent(intelligence.appPlantType)}`;

  const plantJsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Thing",
      name: plant.name,
      alternateName: plant.latinName,
      description: plant.summary,
      image: `${site.publicUrl}${plant.image}`,
      url: `${site.publicUrl}/katalog-roslin/${plant.slug}`,
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `Kalendarz prac: ${plant.name}`,
      itemListElement: plant.calendar.map((entry, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: `${entry.month}: ${entry.task}`,
      })),
    },
  ];

  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(plantJsonLd) }}
        type="application/ld+json"
      />

      <section className="relative overflow-hidden bg-slate-950 text-white">
        <Image
          alt={plant.imageAlt}
          className="object-cover opacity-70"
          fill
          priority
          sizes="100vw"
          src={plant.image}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/65 to-slate-950/20" />
        <div className="relative mx-auto flex min-h-[24rem] max-w-7xl flex-col justify-end px-4 pb-10 pt-28 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { href: "/", label: "Start" },
              { href: "/katalog-roslin", label: "Katalog roślin" },
              { label: plant.name },
            ]}
            variant="dark"
          />
          <span className="mt-5 inline-flex w-fit rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-teal-200 backdrop-blur">
            {plant.group}
          </span>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl">{plant.name}</h1>
          <p className="mt-2 text-lg italic text-slate-200">{plant.latinName}</p>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-100 sm:text-lg">{plant.summary}</p>
        </div>
      </section>

      <PageSection>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          <article className="space-y-8">
            <section className="rounded-2xl border border-teal-100 bg-[#f2fbf8] p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-teal-700">Ogrodio Plant Intelligence</p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-900">{intelligence.actionWindow.label}: co zrobić</h2>
                  <div className="mt-4 grid gap-3">
                    {intelligence.actionWindow.entries.map((entry) => (
                      <div className={`rounded-xl border p-4 ${calendarClass(entry.type)}`} key={`${entry.month}-${entry.task}`}>
                        <p className="text-xs font-black uppercase tracking-wide">{taskTypeLabel(entry.type)} / {entry.month}</p>
                        <p className="mt-1 text-sm leading-6">{entry.task}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-teal-200 bg-white p-4 md:w-64">
                  <ClipboardList className="h-5 w-5 text-teal-700" />
                  <p className="mt-3 text-sm font-bold text-slate-900">
                    {intelligence.appTaskCount} sezonowe wpisy z tej karty zasilają kalendarz aplikacji.
                  </p>
                  <a
                    className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-lg bg-teal-700 px-4 text-sm font-bold text-white transition hover:bg-teal-800"
                    href={appAddUrl}
                  >
                    Dodaj do mojego ogrodu
                  </a>
                </div>
              </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: SunMedium, label: "Stanowisko", value: plant.sun },
                { icon: Leaf, label: "Gleba", value: plant.soil },
                { icon: Droplets, label: "Podlewanie", value: plant.water },
                { icon: Ruler, label: "Rozstaw", value: plant.spacing },
              ].map((item) => (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" key={item.label}>
                  <item.icon className="h-5 w-5 text-teal-700" />
                  <h2 className="mt-3 text-sm font-bold uppercase tracking-wide text-slate-500">{item.label}</h2>
                  <p className="mt-1 text-base font-semibold leading-6 text-slate-900">{item.value}</p>
                </div>
              ))}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <p className="text-sm font-bold uppercase tracking-wide text-teal-700">Profil uprawy</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">Jak prowadzić {plant.name.toLowerCase()}</h2>
              <div className="mt-4 space-y-3 text-base leading-7 text-slate-700">
                <p>
                  {plant.name} najlepiej sprawdza się w warunkach: {plant.sun.toLowerCase()}. Podłoże powinno być: {plant.soil.toLowerCase()}.
                </p>
                <p>
                  Podlewanie: {plant.water.toLowerCase()}. Przy planowaniu miejsca zostaw {plant.spacing.toLowerCase()}, a efekt lub zbiory przypadają na: {plant.harvest.toLowerCase()}.
                </p>
              </div>
            </section>

            {intelligence.seasonalRisks.length > 0 ? (
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wide text-teal-700">Ryzyka sezonowe</p>
                    <h2 className="text-2xl font-bold text-slate-900">Na co uważać teraz</h2>
                  </div>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {intelligence.seasonalRisks.map((risk) => (
                    <div className={`rounded-xl border p-4 ${riskClass(risk.level)}`} key={risk.title}>
                      <p className="text-xs font-black uppercase tracking-wide">Ryzyko: {risk.level}</p>
                      <h3 className="mt-1 font-bold">{risk.title}</h3>
                      <p className="mt-2 text-sm leading-6">{risk.detail}</p>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-3">
                <CalendarDays className="h-5 w-5 text-teal-700" />
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-teal-700">Kalendarz prac</p>
                  <h2 className="text-2xl font-bold text-slate-900">Plan sezonu</h2>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {plant.calendar.map((entry) => (
                  <div className={`rounded-xl border p-4 ${calendarClass(entry.type)}`} key={`${entry.month}-${entry.task}`}>
                    <p className="text-sm font-black">{entry.month}</p>
                    <p className="mt-1 text-sm leading-6">{entry.task}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-3">
                <Sprout className="h-5 w-5 text-teal-700" />
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-teal-700">Problemy</p>
                  <h2 className="text-2xl font-bold text-slate-900">Najczęstsze błędy i objawy</h2>
                </div>
              </div>
              <div className="mt-5 grid gap-3">
                {plant.problems.map((problem) => (
                  <div className="flex gap-3 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700" key={problem}>
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" />
                    {problem}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <p className="text-sm font-bold uppercase tracking-wide text-teal-700">Tematy powiązane</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">Pytania, które prowadzą do poradników</h2>
              <div className="mt-5 flex flex-wrap gap-2">
                {intelligence.searchTopics.map((topic) => (
                  <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700" key={topic}>
                    {topic}
                  </span>
                ))}
              </div>
            </section>

            {plant.relatedArticles.length > 0 ? (
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <p className="text-sm font-bold uppercase tracking-wide text-teal-700">Poradniki Ogrodio</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">Czytaj dalej</h2>
                <div className="mt-5 grid gap-3">
                  {plant.relatedArticles.map((article) => (
                    <Link
                      className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-800 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800"
                      href={article.href}
                      key={article.href}
                    >
                      {article.title}
                      <ArrowUpRight className="h-4 w-4 shrink-0" />
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}
          </article>

          <aside className="space-y-4 lg:sticky lg:top-24">
            <div className="rounded-2xl border border-slate-200 bg-[#f4f7f2] p-5">
              <p className="text-sm font-bold uppercase tracking-wide text-teal-700">Profil</p>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Trudność</dt>
                  <dd className="font-bold text-slate-900">{plant.difficulty}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Zbiory/efekt</dt>
                  <dd className="text-right font-bold text-slate-900">{plant.harvest}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Grupa</dt>
                  <dd className="font-bold text-slate-900">{plant.group}</dd>
                </div>
              </dl>
              <div className="mt-4 flex flex-wrap gap-2">
                {plant.tags.map((tag) => (
                  <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-600" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <a
              className="inline-flex w-full items-center justify-center rounded-xl bg-teal-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-teal-800"
              href={appAddUrl}
            >
              Dodaj do ogrodu i ustaw przypomnienia
            </a>

            <Link
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-teal-200 hover:text-teal-700"
              href="/katalog-roslin"
            >
              <ArrowLeft className="h-4 w-4" />
              Wróć do katalogu
            </Link>
          </aside>
        </div>
      </PageSection>
    </>
  );
}
