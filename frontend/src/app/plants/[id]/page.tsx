"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Camera, Check, Leaf, Save } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { useAppContext } from "@/components/app/app-context";
import { PlantIntelligencePanel } from "@/components/plant-intelligence-panel";
import { TaskCard } from "@/components/app/task-card";
import { t } from "@/i18n";
import {
  addGardenJournalEntry,
  fetchGardenCatalog,
  fetchGardenJournal,
  fetchGardenPlant,
  fetchGardenTasks,
  uploadGardenJournalImage,
  updateGardenPlant,
  updateGardenTask,
  type GardenJournalEntry,
  type GardenPlant,
  type GardenTask,
  type PlantDefinition,
} from "@/lib/garden-api";
import { canWriteGarden, plantHealthLabel, plantStatusLabel } from "@/lib/garden-permissions";
import { getCatalogPlantByAppType } from "@/lib/plant-intelligence/engine";
import { normalizePlantCatalog, type PlantCatalogItem } from "@/lib/plant-catalog";

function PrivatePlantDetail({ plantId }: { plantId: string }) {
  const { organization } = useAppContext();
  const [plant, setPlant] = useState<GardenPlant | null>(null);
  const [catalog, setCatalog] = useState<PlantDefinition[]>([]);
  const [publicCatalog, setPublicCatalog] = useState<PlantCatalogItem[]>([]);
  const [tasks, setTasks] = useState<GardenTask[]>([]);
  const [entries, setEntries] = useState<GardenJournalEntry[]>([]);
  const [displayName, setDisplayName] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [photoTitle, setPhotoTitle] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [status, setStatus] = useState(t("app.loading.plant"));
  const [saving, setSaving] = useState(false);
  const canWrite = canWriteGarden(organization);

  const plantDef = useMemo(() => catalog.find((c) => c.type === plant?.plantType), [catalog, plant]);
  const catalogPlant = useMemo(
    () => (plant ? getCatalogPlantByAppType(plant.plantType, publicCatalog) : undefined),
    [plant, publicCatalog],
  );
  const plantTasks = useMemo(() => tasks.filter((t) => String(t.plantId) === plantId && t.status !== "done"), [plantId, tasks]);
  const photos = useMemo(() => entries.filter((e) => e.imageUrl), [entries]);

  async function refresh() {
    const month = new Date().getMonth() + 1;
    const [plantData, catalogData, tasksData, journalData, publicCatalogData] = await Promise.all([
      fetchGardenPlant(plantId),
      fetchGardenCatalog(),
      fetchGardenTasks(month),
      fetchGardenJournal(),
      fetch("/api/plants", { credentials: "include" }).then((res) => res.json()).catch(() => []),
    ]);
    setPlant(plantData.plant);
    setCatalog(catalogData.plants);
    try {
      setPublicCatalog(normalizePlantCatalog(publicCatalogData));
    } catch {
      setPublicCatalog([]);
    }
    setTasks(tasksData.tasks);
    setEntries(journalData.entries.filter((e) => String(e.plantId) === plantId));
  }

  useEffect(() => {
    refresh().then(() => setStatus("")).catch((e) => setStatus(e.message));
  }, [plantId]);

  useEffect(() => {
    if (!plant) return;
    setDisplayName(plant.displayName);
    setLocation(plant.location || "");
    setNotes(plant.notes || "");
  }, [plant]);

  async function savePlant(event: FormEvent) {
    event.preventDefault();
    if (!plant) return;
    setSaving(true);
    try {
      const saved = await updateGardenPlant(plant.id, { displayName, location, notes });
      setPlant(saved.plant);
      setStatus(t("app.status.plantSaved"));
    } finally {
      setSaving(false);
    }
  }

  async function addPhoto(event: FormEvent) {
    event.preventDefault();
    if (!plant || !photoFile) return;
    setSaving(true);
    try {
      const uploaded = await uploadGardenJournalImage(photoFile);
      await addGardenJournalEntry({ plantId: plant.id, title: photoTitle || t("app.journal.defaultTitle"), imageUrl: uploaded.url, happenedAt: new Date().toISOString() });
      setPhotoTitle("");
      setPhotoFile(null);
      await refresh();
      setStatus(t("app.status.entryAdded"));
    } finally {
      setSaving(false);
    }
  }

  async function completeTask(task: GardenTask) {
    if (task.source !== "manual") return;
    await updateGardenTask(task.id, { status: "done" });
    await refresh();
  }

  if (!plant && !status) return null;

  return (
    <div className="mx-auto max-w-[720px]">
      <Link className="mb-4 inline-flex items-center gap-2 text-sm font-black text-slate-600" href="/plants">
        <ArrowLeft className="h-4 w-4" />
        {t("app.nav.plants")}
      </Link>

      <header className="rounded-2xl border border-emerald-900/10 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-100 text-emerald-800">
            <Leaf className="h-7 w-7" />
          </span>
          <div>
            <h1 className="text-2xl font-black">{plant?.displayName}</h1>
            <p className="mt-1 text-sm font-bold text-emerald-700">{plantDef?.label}</p>
            <p className="mt-1 text-sm text-slate-600">{plant?.location || t("app.common.noLocation")}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-black uppercase text-emerald-900">{plantStatusLabel(plant?.status || "active")}</span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black uppercase">{plantHealthLabel(plant?.healthStatus || "good")}</span>
            </div>
          </div>
        </div>
      </header>

      {status ? <p className="my-4 text-sm font-bold text-emerald-950">{status}</p> : null}

      {catalogPlant ? (
        <section className="mt-5">
          <PlantIntelligencePanel plant={catalogPlant} variant="app" />
        </section>
      ) : null}

      {plantTasks.length ? (
        <section className="mt-5">
          <h2 className="mb-3 text-sm font-black uppercase text-emerald-700">{t("app.plants.plantTasks")}</h2>
          <div className="grid gap-3">
            {plantTasks.map((task) => (
              <TaskCard canWrite={canWrite} compact key={task.id} onComplete={completeTask} task={task} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-5">
        <h2 className="mb-3 text-sm font-black uppercase text-emerald-700">{t("app.plants.photoHistory")}</h2>
        {photos.length ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {photos.map((entry) => (
              <Link className="overflow-hidden rounded-xl border border-slate-200" href={`/journal/${entry.id}`} key={entry.id}>
                <img alt={entry.title} className="aspect-square w-full object-cover" src={entry.imageUrl!} />
              </Link>
            ))}
          </div>
        ) : (
          <p className="rounded-xl bg-white p-5 text-sm font-bold text-slate-500">{t("app.plants.noPhotos")}</p>
        )}
      </section>

      {canWrite ? (
        <>
          <form className="mt-5 rounded-2xl border border-emerald-200 bg-white p-5" onSubmit={addPhoto}>
            <p className="text-sm font-black uppercase text-emerald-700">{t("app.plants.addPhoto")}</p>
            <label className="mt-3 flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-emerald-200 bg-emerald-50/50 py-6">
              <Camera className="h-7 w-7 text-emerald-700" />
              <span className="mt-2 text-sm font-bold">{photoFile ? photoFile.name : t("app.journal.addPhoto")}</span>
              <input accept="image/*" className="sr-only" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} type="file" />
            </label>
            <input className="mt-3 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold" onChange={(e) => setPhotoTitle(e.target.value)} placeholder={t("app.journal.titlePlaceholder")} value={photoTitle} />
            <button className="mt-3 h-10 w-full rounded-xl bg-emerald-700 text-sm font-black text-white disabled:opacity-50" disabled={!photoFile || saving} type="submit">{t("app.plants.addPhoto")}</button>
          </form>

          <form className="mt-5 rounded-2xl border border-slate-200 bg-white p-5" onSubmit={savePlant}>
            <p className="flex items-center gap-2 text-sm font-black uppercase text-emerald-700"><Save className="h-4 w-4" />{t("app.plants.editPlant")}</p>
            <div className="mt-3 grid gap-3">
              <input className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-bold" onChange={(e) => setDisplayName(e.target.value)} value={displayName} />
              <input className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-bold" onChange={(e) => setLocation(e.target.value)} placeholder={t("app.plants.locationPlaceholder")} value={location} />
              <textarea className="min-h-20 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold" onChange={(e) => setNotes(e.target.value)} placeholder={t("app.plants.notesPlaceholder")} value={notes} />
            </div>
            <button className="mt-3 h-10 w-full rounded-xl bg-emerald-700 text-sm font-black text-white disabled:opacity-50" disabled={saving} type="submit">{t("common.save")}</button>
          </form>
        </>
      ) : null}

      <Link className="mt-5 inline-flex items-center gap-2 text-sm font-black text-emerald-700" href="/calendar">
        <Check className="h-4 w-4" />
        {t("app.dashboard.seeCalendar")}
      </Link>
    </div>
  );
}

function PlantDetailRouter() {
  const params = useParams<{ id: string }>();
  return <PrivatePlantDetail plantId={params.id} />;
}

export default function PlantDetailPage() {
  return (
    <AppShell>
      <PlantDetailRouter />
    </AppShell>
  );
}
