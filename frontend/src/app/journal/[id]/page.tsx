"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CalendarDays, Camera, ClipboardList, Leaf, MapPin, UserRound } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { t } from "@/i18n";
import { fetchGardenJournalEntry, type GardenJournalEntry } from "@/lib/garden-api";

function formatDate(value?: string | null) {
  if (!value) return t("app.common.none");
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function JournalEntryPage() {
  const params = useParams<{ id: string }>();
  const [entry, setEntry] = useState<GardenJournalEntry | null>(null);
  const [status, setStatus] = useState(t("app.loading.entry"));

  useEffect(() => {
    fetchGardenJournalEntry(params.id)
      .then((data) => {
        setEntry(data.entry);
        setStatus("");
      })
      .catch((error) => setStatus(error instanceof Error ? error.message : t("app.errors.fetchEntryFailed")));
  }, [params.id]);

  return (
    <AppShell>
      <div className="mx-auto max-w-[1100px]">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Link className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-slate-800 hover:border-emerald-600 hover:text-emerald-800" href="/journal">
            <ArrowLeft className="h-4 w-4" />
            {t("app.nav.journal")}
          </Link>
          <Link className="inline-flex h-10 items-center rounded-lg bg-emerald-700 px-3 text-sm font-black text-white hover:bg-emerald-800" href="/journal">
            {t("app.journal.newEntry")}
          </Link>
        </div>

        {status ? <p className="mb-5 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-950">{status}</p> : null}

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section className="overflow-hidden rounded-lg border border-emerald-900/10 bg-white shadow-sm">
            {entry?.imageUrl ? (
              <a href={entry.imageUrl} rel="noreferrer" target="_blank">
                <img alt={entry.title} className="max-h-[560px] w-full object-cover" src={entry.imageUrl} />
              </a>
            ) : (
              <div className="grid h-64 place-items-center bg-emerald-50 text-emerald-800">
                <Camera className="h-10 w-10" />
              </div>
            )}
            <div className="p-5 sm:p-6">
              <p className="text-sm font-black uppercase text-emerald-700">{t("app.common.journalEntry")}</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">{entry?.title || t("app.common.entryFallback")}</h1>
              {entry?.body ? <p className="mt-5 whitespace-pre-line text-sm font-semibold leading-7 text-slate-700">{entry.body}</p> : null}
            </div>
          </section>

          <aside className="grid gap-5">
            <section className="rounded-lg border border-emerald-900/10 bg-white p-5 shadow-sm">
              <p className="text-sm font-black uppercase text-emerald-700">{t("app.common.context")}</p>
              <div className="mt-4 grid gap-3">
                <Metric icon={<CalendarDays className="h-4 w-4" />} label={t("app.common.date")} value={formatDate(entry?.happenedAt)} />
                <Metric icon={<UserRound className="h-4 w-4" />} label={t("app.common.author")} value={entry?.authorName || t("app.common.none")} />
                <Metric icon={<Leaf className="h-4 w-4" />} label={t("app.common.plant")} value={entry?.plantName || t("app.common.none")} />
                <Metric icon={<MapPin className="h-4 w-4" />} label={t("app.common.location")} value={entry?.locationName || t("app.common.none")} />
                <Metric icon={<ClipboardList className="h-4 w-4" />} label={t("app.common.task")} value={entry?.taskTitle || t("app.common.none")} />
              </div>
            </section>

            <section className="rounded-lg border border-emerald-900/10 bg-slate-950 p-5 text-white shadow-sm">
              <p className="text-sm font-black uppercase text-emerald-300">{t("app.common.links")}</p>
              <div className="mt-4 grid gap-2">
                {entry?.plantId ? (
                  <Link className="h-10 rounded-lg bg-white px-3 py-2 text-sm font-black text-slate-950" href={`/plants/${entry.plantId}`}>
                    {t("app.common.plantCard")}
                  </Link>
                ) : null}
                {entry?.taskId ? (
                  <Link className="h-10 rounded-lg bg-white/10 px-3 py-2 text-sm font-black text-white ring-1 ring-white/15" href={`/tasks/${entry.taskId}`}>
                    {t("app.common.taskCard")}
                  </Link>
                ) : null}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="flex items-center gap-2 text-xs font-black uppercase text-slate-500">
        {icon}
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-slate-950">{value}</p>
    </div>
  );
}
