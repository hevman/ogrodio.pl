import Link from "next/link";
import { AlertTriangle, ArrowUpRight, CalendarDays, ClipboardList, Leaf, MessageCircleQuestion, Sprout } from "lucide-react";
import type { PlantCatalogItem } from "@/lib/plant-intelligence/schema";
import { getPlantIntelligence } from "@/lib/plant-intelligence/engine";

type Props = {
  plant: PlantCatalogItem;
  appAddUrl?: string;
  variant?: "catalog" | "app";
};

function calendarClass(type: string) {
  if (type === "start") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (type === "harvest") return "border-amber-200 bg-amber-50 text-amber-800";
  return "border-sky-200 bg-sky-50 text-sky-800";
}

function taskTypeLabel(type: string) {
  if (type === "start") return "Sadzenie i siew";
  if (type === "harvest") return "Zbiory";
  return "Pielęgnacja";
}

function riskClass(level: string) {
  if (level === "wysokie") return "border-rose-200 bg-rose-50 text-rose-900";
  if (level === "niskie") return "border-slate-200 bg-slate-50 text-slate-800";
  return "border-amber-200 bg-amber-50 text-amber-900";
}

function weekLabel(week: string | null | undefined) {
  if (!week || week === "cały") return null;
  if (week === "1-2") return "tydzień 1-2";
  if (week === "3-4") return "tydzień 3-4";
  return `tydzień ${week}`;
}

const careGuideLabels: Record<string, string> = {
  sowingOrPlanting: "Start",
  watering: "Podlewanie",
  feeding: "Nawożenie",
  pruning: "Cięcie",
  wintering: "Zima",
  harvest: "Zbiory",
};

export function PlantIntelligencePanel({ plant, appAddUrl, variant = "catalog" }: Props) {
  const intelligence = getPlantIntelligence(plant);
  const accentText = variant === "catalog" ? "text-teal-700" : "text-emerald-700";
  const accentBg = variant === "catalog" ? "bg-teal-700 hover:bg-teal-800" : "bg-emerald-700 hover:bg-emerald-800";
  const panelBg = variant === "catalog" ? "border-teal-100 bg-[#f2fbf8]" : "border-emerald-100 bg-emerald-50/40";
  const careGuideEntries = Object.entries(intelligence.careGuide)
    .filter((entry): entry is [string, string] => Boolean(entry[1]))
    .slice(0, 6);

  return (
    <div className="space-y-5">
      <section className={`rounded-2xl border p-5 shadow-sm sm:p-6 ${panelBg}`}>
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 flex-1">
            <p className={`text-sm font-bold uppercase tracking-wide ${accentText}`}>
              Plan opieki
              {variant === "catalog" ? (
                <Link className="ml-2 font-semibold normal-case underline" href="/ogrodio-plant-intelligence">
                  jak działa w Ogrodio
                </Link>
              ) : null}
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">{intelligence.actionWindow.label}: najbliższa praca</h2>
            <div className="mt-4 grid gap-3">
              {intelligence.actionWindow.entries.map((entry) => (
                <div className={`rounded-xl border p-4 ${calendarClass(entry.type)}`} key={`${entry.month}-${entry.task}-${entry.week}`}>
                  <p className="text-xs font-black uppercase tracking-wide">
                    {taskTypeLabel(entry.type)} / {entry.month}
                    {weekLabel(entry.week) ? ` · ${weekLabel(entry.week)}` : ""}
                  </p>
                  <p className="mt-1 text-sm leading-6">{entry.task}</p>
                  {entry.articleHref ? (
                    <Link className="mt-2 inline-flex items-center gap-1 text-xs font-bold underline" href={entry.articleHref}>
                      Przeczytaj poradnik
                      <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          {appAddUrl ? (
            <div className={`rounded-xl border bg-white p-4 md:w-64 ${variant === "catalog" ? "border-teal-200" : "border-emerald-200"}`}>
              <ClipboardList className={`h-5 w-5 ${accentText}`} />
              <p className="mt-3 text-sm font-bold text-slate-900">
                Dodaj roślinę do ogrodu, a Ogrodio przypomni o tych pracach w kalendarzu.
              </p>
              <a
                className={`mt-4 inline-flex h-10 w-full items-center justify-center rounded-lg px-4 text-sm font-bold text-white transition ${accentBg}`}
                href={appAddUrl}
              >
                Dodaj do mojego ogrodu
              </a>
            </div>
          ) : null}
        </div>
      </section>

      {careGuideEntries.length > 0 ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <Leaf className={`h-5 w-5 ${accentText}`} />
            <div>
              <p className={`text-sm font-bold uppercase tracking-wide ${accentText}`}>Jak prowadzić</p>
              <h2 className="text-2xl font-bold text-slate-900">Najważniejsze decyzje w uprawie</h2>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {careGuideEntries.map(([key, value]) => (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4" key={key}>
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">{careGuideLabels[key] || key}</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{value}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {intelligence.seasonalRisks.length > 0 ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <div>
              <p className={`text-sm font-bold uppercase tracking-wide ${accentText}`}>Na co uważać</p>
              <h2 className="text-2xl font-bold text-slate-900">Typowe problemy w tym czasie</h2>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {intelligence.seasonalRisks.map((risk) => (
              <div className={`rounded-xl border p-4 ${riskClass(risk.level)}`} key={risk.title}>
                <p className="text-xs font-black uppercase tracking-wide">Uwaga: {risk.level}</p>
                <h3 className="mt-1 font-bold">{risk.title}</h3>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide opacity-80">{risk.symptom}</p>
                <p className="mt-2 text-sm leading-6">{risk.action}</p>
                {risk.articleHref ? (
                  <Link className="mt-2 inline-flex items-center gap-1 text-xs font-bold underline" href={risk.articleHref}>
                    Zobacz poradnik
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {intelligence.activeSignals.length > 0 ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <MessageCircleQuestion className={`h-5 w-5 ${accentText}`} />
            <div>
              <p className={`text-sm font-bold uppercase tracking-wide ${accentText}`}>Sygnały z ogrodu</p>
              <h2 className="text-2xl font-bold text-slate-900">Co oznaczają objawy na roślinie</h2>
            </div>
          </div>
          <div className="mt-5 grid gap-3">
            {intelligence.activeSignals.map((signal) => (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4" key={signal.title}>
                <p className="font-bold text-slate-900">{signal.title}</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{signal.means}</p>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-800">{signal.action}</p>
                {signal.articleHref ? (
                  <Link className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-teal-700 underline" href={signal.articleHref}>
                    Zobacz poradnik
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {intelligence.varieties.length > 0 ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <Sprout className={`h-5 w-5 ${accentText}`} />
            <div>
              <p className={`text-sm font-bold uppercase tracking-wide ${accentText}`}>Odmiany</p>
              <h2 className="text-2xl font-bold text-slate-900">Co wybrać do ogrodu</h2>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {intelligence.varieties.map((variety) => (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4" key={variety.name}>
                <p className="font-bold text-slate-900">{variety.name}</p>
                <p className="mt-1 text-sm font-semibold text-slate-700">Zbiór: {variety.harvest}</p>
                {variety.notes ? <p className="mt-2 text-sm leading-6 text-slate-600">{variety.notes}</p> : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3">
          <CalendarDays className={`h-5 w-5 ${accentText}`} />
          <div>
            <p className={`text-sm font-bold uppercase tracking-wide ${accentText}`}>Kalendarz</p>
            <h2 className="text-2xl font-bold text-slate-900">Prace w ciągu roku</h2>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {intelligence.yearCalendar.map((block) => (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4" key={block.month}>
              <p className="text-sm font-black text-slate-900">{block.month}</p>
              <ul className="mt-2 space-y-2">
                {block.tasks.map((task) => (
                  <li className="text-sm leading-6 text-slate-700" key={`${block.month}-${task.task}`}>
                    <span className={`mr-2 inline-flex rounded px-1.5 py-0.5 text-[10px] font-black uppercase ${calendarClass(task.type)}`}>
                      {taskTypeLabel(task.type)}
                    </span>
                    {task.task}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
