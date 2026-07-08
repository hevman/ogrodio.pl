"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Camera, Plus } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { useAppContext } from "@/components/app/app-context";
import { AppPageHeader } from "@/components/app/app-page-header";
import { t } from "@/i18n";
import {
  addGardenJournalEntry,
  fetchGardenJournal,
  fetchGardenPlants,
  uploadGardenJournalImage,
  type GardenJournalEntry,
  type GardenPlant,
} from "@/lib/garden-api";
import { canWriteGarden } from "@/lib/garden-permissions";

function nowLocalInputValue() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pl-PL", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

function JournalContent() {
  const { businessGarden, organization } = useAppContext();
  const [entries, setEntries] = useState<GardenJournalEntry[]>([]);
  const [plants, setPlants] = useState<GardenPlant[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [plantId, setPlantId] = useState("");
  const [happenedAt, setHappenedAt] = useState(nowLocalInputValue());
  const [filterPlantId, setFilterPlantId] = useState("");
  const [status, setStatus] = useState(t("app.loading.journal"));
  const [isSaving, setIsSaving] = useState(false);
  const canWrite = canWriteGarden(organization);

  async function refresh() {
    const [journalData, plantData] = await Promise.all([fetchGardenJournal(), fetchGardenPlants()]);
    setEntries(journalData.entries);
    setPlants(plantData.plants);
  }

  useEffect(() => {
    refresh().then(() => setStatus("")).catch((e) => setStatus(e instanceof Error ? e.message : t("app.errors.fetchJournalFailed")));
  }, []);

  const filteredEntries = useMemo(() => {
    if (!filterPlantId) return entries;
    return entries.filter((e) => String(e.plantId || "") === filterPlantId);
  }, [entries, filterPlantId]);

  async function createEntry(event: FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    setStatus("");
    try {
      const uploaded = imageFile ? await uploadGardenJournalImage(imageFile) : null;
      await addGardenJournalEntry({
        title: title || t("app.journal.defaultTitle"),
        body,
        imageUrl: uploaded?.url || "",
        happenedAt,
        plantId: plantId ? Number(plantId) : null,
      });
      setTitle("");
      setBody("");
      setImageFile(null);
      await refresh();
      setStatus(t("app.status.entryAdded"));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : t("app.errors.addEntryFailed"));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-[900px]">
      <AppPageHeader
        badge={t("app.nav.journal")}
        subtitle={t("app.journal.subtitlePrivate")}
        title={t("app.journal.pageTitlePrivate")}
      />

      {canWrite ? (
        <form className="mb-6 rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm" onSubmit={createEntry}>
          <p className="flex items-center gap-2 text-sm font-black uppercase text-emerald-700">
            <Plus className="h-4 w-4" />
            {t("app.journal.newEntry")}
          </p>
          <div className="mt-4 grid gap-3">
            <input className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold" onChange={(e) => setTitle(e.target.value)} placeholder={t("app.journal.titlePlaceholder")} value={title} />
            <select className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold" onChange={(e) => setPlantId(e.target.value)} value={plantId}>
              <option value="">{t("app.journal.noPlant")}</option>
              {plants.map((p) => <option key={p.id} value={p.id}>{p.displayName}</option>)}
            </select>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-emerald-200 bg-emerald-50/50 px-4 py-8 text-center">
              <Camera className="h-8 w-8 text-emerald-700" />
              <span className="mt-2 text-sm font-black text-emerald-900">{imageFile ? imageFile.name : t("app.journal.addPhoto")}</span>
              <input accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => setImageFile(e.target.files?.[0] || null)} type="file" />
            </label>
            <textarea className="min-h-24 rounded-xl border border-slate-200 px-3 py-3 text-sm font-bold" onChange={(e) => setBody(e.target.value)} placeholder={t("app.journal.observationsPlaceholder")} value={body} />
          </div>
          <button className="mt-4 h-11 w-full rounded-xl bg-emerald-700 text-sm font-black text-white disabled:opacity-50" disabled={isSaving} type="submit">
            {t("app.journal.addToJournal")}
          </button>
          {status ? <p className="mt-3 text-sm font-bold text-emerald-950">{status}</p> : null}
        </form>
      ) : null}

      {plants.length > 1 ? (
        <select className="mb-4 h-10 rounded-xl border border-slate-200 px-3 text-sm font-bold" onChange={(e) => setFilterPlantId(e.target.value)} value={filterPlantId}>
          <option value="">{t("app.common.allPlants")}</option>
          {plants.map((p) => <option key={p.id} value={p.id}>{p.displayName}</option>)}
        </select>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        {filteredEntries.length ? filteredEntries.map((entry) => (
          <Link className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-emerald-300" href={`/journal/${entry.id}`} key={entry.id}>
            {entry.imageUrl ? (
              <img alt={entry.title} className="aspect-[4/3] w-full object-cover" src={entry.imageUrl} />
            ) : (
              <div className="grid aspect-[4/3] place-items-center bg-emerald-50 text-emerald-800">
                <Camera className="h-8 w-8" />
              </div>
            )}
            <div className="p-4">
              <p className="text-xs font-bold uppercase text-slate-500">{formatDate(entry.happenedAt)}{entry.plantName ? ` · ${entry.plantName}` : ""}</p>
              <h2 className="mt-1 text-base font-black">{entry.title}</h2>
              {entry.body ? <p className="mt-1 line-clamp-2 text-sm text-slate-600">{entry.body}</p> : null}
            </div>
          </Link>
        )) : (
          <p className="col-span-full rounded-2xl bg-white p-8 text-center text-sm font-bold text-slate-500 sm:col-span-2">
            {t("app.journal.emptyPrivate")}
          </p>
        )}
      </div>

      {businessGarden ? <p className="mt-6 text-xs text-slate-500">{t("app.journal.businessHint")}</p> : null}
    </div>
  );
}

export default function JournalPage() {
  return (
    <AppShell>
      <JournalContent />
    </AppShell>
  );
}
