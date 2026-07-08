"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Leaf, Plus, Search, Trash2 } from "lucide-react";
import {
  ColumnDef,
  ExpandedState,
  GroupingState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getGroupedRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { AppShell } from "@/components/app/app-shell";
import { useAppContext } from "@/components/app/app-context";
import { AppPageHeader } from "@/components/app/app-page-header";
import { PlantCard } from "@/components/app/plant-card";
import { t } from "@/i18n";
import {
  addGardenPlant,
  fetchGardenCatalog,
  fetchGardenPlants,
  removeGardenPlant,
  type GardenPlant,
  type PlantDefinition,
} from "@/lib/garden-api";
import { canWriteGarden, plantHealthLabel, plantStatusLabel, roleLabel } from "@/lib/garden-permissions";

function PrivatePlantsView() {
  const { organization } = useAppContext();
  const [catalog, setCatalog] = useState<PlantDefinition[]>([]);
  const [plants, setPlants] = useState<GardenPlant[]>([]);
  const [plantType, setPlantType] = useState("borowka");
  const [displayName, setDisplayName] = useState("");
  const [location, setLocation] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [status, setStatus] = useState(t("app.loading.plants"));
  const [isSaving, setIsSaving] = useState(false);
  const canWrite = canWriteGarden(organization);

  const selectedPlant = useMemo(() => catalog.find((p) => p.type === plantType), [catalog, plantType]);
  const typeById = useMemo(() => new Map(catalog.map((item) => [item.type, item])), [catalog]);

  async function refresh() {
    const [catalogData, plantsData] = await Promise.all([fetchGardenCatalog(), fetchGardenPlants()]);
    setCatalog(catalogData.plants);
    setPlants(plantsData.plants);
  }

  useEffect(() => {
    refresh()
      .then(() => setStatus(""))
      .catch((error) => setStatus(error instanceof Error ? error.message : t("app.errors.fetchPlantsFailed")));
  }, []);

  async function addPlant(event: FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    setStatus("");
    try {
      await addGardenPlant({
        plantType,
        displayName: displayName || selectedPlant?.defaultName || "",
        location,
      });
      setDisplayName("");
      setLocation("");
      setShowForm(false);
      await refresh();
      setStatus(t("app.status.plantAdded"));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : t("app.errors.addPlantFailed"));
    } finally {
      setIsSaving(false);
    }
  }

  async function deletePlant(id: number) {
    await removeGardenPlant(id);
    await refresh();
  }

  return (
    <div className="mx-auto max-w-[900px]">
      <AppPageHeader
        actions={canWrite ? (
          <button className="inline-flex h-11 items-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-black text-white" onClick={() => setShowForm((v) => !v)} type="button">
            <Plus className="h-4 w-4" />
            {t("app.plants.addPlant")}
          </button>
        ) : undefined}
        badge={t("app.nav.plants")}
        subtitle={t("app.plants.privateSubtitle")}
        title={t("app.plants.pageTitlePrivate")}
      />

      {status ? <p className="mb-5 rounded-xl bg-white px-4 py-3 text-sm font-bold text-emerald-950">{status}</p> : null}

      {showForm && canWrite ? (
        <form className="mb-6 rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm" onSubmit={addPlant}>
          <p className="text-sm font-black uppercase text-emerald-700">{t("app.plants.addPlant")}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <select className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold" onChange={(e) => setPlantType(e.target.value)} value={plantType}>
              {catalog.map((plant) => <option key={plant.type} value={plant.type}>{plant.label}</option>)}
            </select>
            <input className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold" onChange={(e) => setDisplayName(e.target.value)} placeholder={t("app.plants.nameDefaultPlaceholder", { name: selectedPlant?.defaultName || "" })} value={displayName} />
            <input className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold sm:col-span-2" onChange={(e) => setLocation(e.target.value)} placeholder={t("app.plants.locationPlaceholder")} value={location} />
          </div>
          <button className="mt-4 h-11 rounded-xl bg-emerald-700 px-5 text-sm font-black text-white disabled:opacity-50" disabled={isSaving} type="submit">
            {t("app.plants.addToRegistry")}
          </button>
        </form>
      ) : null}

      {plants.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {plants.map((plant) => (
            <PlantCard
              canWrite={canWrite}
              key={plant.id}
              onRemove={deletePlant}
              plant={plant}
              typeLabel={typeById.get(plant.plantType)?.label || plant.plantType}
            />
          ))}
        </div>
      ) : (
        <section className="rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/50 p-8 text-center">
          <Leaf className="mx-auto h-8 w-8 text-emerald-700" />
          <h2 className="mt-3 text-xl font-black">{t("app.plants.emptyTitle")}</h2>
          <p className="mt-2 text-sm text-slate-600">{t("app.plants.emptyText")}</p>
          {canWrite ? (
            <button className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-black text-white" onClick={() => setShowForm(true)} type="button">
              <Plus className="h-4 w-4" />
              {t("app.onboarding.cta")}
            </button>
          ) : null}
        </section>
      )}
    </div>
  );
}

// --- Business registry (table) below ---

type PlantRow = GardenPlant & { typeLabel: string; locationLabel: string; statusLabel: string };

const statusFilterOptions = [
  { value: "all", labelKey: "app.plants.statusAll" as const },
  { value: "active", labelKey: "app.plants.statusActive" as const },
  { value: "observation", labelKey: "app.plantStatus.observation" as const },
  { value: "problem", labelKey: "app.plantStatus.problem" as const },
  { value: "finished", labelKey: "app.plants.statusFinished" as const },
];

const groupOptionKeys = [
  { value: "locationLabel", labelKey: "app.plants.groupLocation" as const },
  { value: "typeLabel", labelKey: "app.plants.groupType" as const },
  { value: "statusLabel", labelKey: "app.plants.groupStatus" as const },
  { value: "none", labelKey: "app.plants.groupNone" as const },
] as const;

function BusinessPlantsView() {
  const { organization } = useAppContext();
  const [catalog, setCatalog] = useState<PlantDefinition[]>([]);
  const [plants, setPlants] = useState<GardenPlant[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [groupBy, setGroupBy] = useState<(typeof groupOptionKeys)[number]["value"]>("locationLabel");
  const [sorting, setSorting] = useState<SortingState>([{ id: "displayName", desc: false }]);
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [status, setStatus] = useState(t("app.loading.plants"));
  const canWrite = canWriteGarden(organization);

  const typeById = useMemo(() => new Map(catalog.map((item) => [item.type, item])), [catalog]);
  const grouping = useMemo<GroupingState>(() => groupBy === "none" ? [] : [groupBy], [groupBy]);

  const rows = useMemo<PlantRow[]>(() => plants
    .map((plant) => ({
      ...plant,
      typeLabel: typeById.get(plant.plantType)?.label || plant.plantType,
      locationLabel: plant.locationName || plant.location || t("app.common.noLocation"),
      statusLabel: plantStatusLabel(plant.status || "active"),
    }))
    .filter((plant) => statusFilter === "all" || plant.status === statusFilter), [plants, statusFilter, typeById]);

  const columns = useMemo<ColumnDef<PlantRow>[]>(() => [
    {
      accessorKey: "displayName",
      header: t("app.common.plant"),
      cell: ({ row, getValue }) => (
        <div className="flex items-center gap-2">
          {row.getCanExpand() ? (
            <button className="grid h-7 w-7 place-items-center rounded-md hover:bg-slate-100" onClick={row.getToggleExpandedHandler()} type="button">
              {row.getIsExpanded() ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          ) : null}
          {row.getIsGrouped() ? <span className="font-black text-emerald-800">{String(getValue())}</span> : (
            <Link className="font-black text-slate-950 hover:text-emerald-700" href={`/plants/${row.original.id}`}>{String(getValue())}</Link>
          )}
        </div>
      ),
    },
    { accessorKey: "typeLabel", header: t("app.common.type") },
    { accessorKey: "locationLabel", header: t("app.common.location") },
    { accessorKey: "variety", header: t("app.common.variety"), cell: ({ getValue }) => String(getValue() || "—") },
    { accessorKey: "batchCode", header: t("app.common.batch"), cell: ({ getValue }) => String(getValue() || "—") },
    { accessorKey: "quantity", header: t("app.common.quantity") },
    { accessorKey: "statusLabel", header: t("app.common.status") },
  ], []);

  const table = useReactTable({ columns, data: rows, state: { expanded, globalFilter, grouping, sorting }, onExpandedChange: setExpanded, onGlobalFilterChange: setGlobalFilter, onSortingChange: setSorting, getCoreRowModel: getCoreRowModel(), getExpandedRowModel: getExpandedRowModel(), getFilteredRowModel: getFilteredRowModel(), getGroupedRowModel: getGroupedRowModel(), getSortedRowModel: getSortedRowModel(), groupedColumnMode: "remove" });

  useEffect(() => {
    Promise.all([fetchGardenCatalog(), fetchGardenPlants()])
      .then(([catalogData, plantsData]) => { setCatalog(catalogData.plants); setPlants(plantsData.plants); setStatus(""); })
      .catch((error) => setStatus(error instanceof Error ? error.message : t("app.errors.fetchPlantsFailed")));
  }, []);

  return (
    <div className="mx-auto max-w-[1440px]">
      <AppPageHeader badge={t("app.plants.registry")} title={t("app.plants.pageTitle")} />
      {status ? <p className="mb-5 text-sm font-bold">{status}</p> : null}
      {!canWrite ? <p className="mb-5 text-sm font-bold text-slate-500">{t("app.plants.noEditText", { role: roleLabel(organization?.role) })}</p> : null}
      <div className="mb-4 flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm font-bold" onChange={(e) => setGlobalFilter(e.target.value)} placeholder={t("app.plants.searchPlaceholder")} value={globalFilter} />
        </div>
        <select className="h-10 rounded-lg border border-slate-200 px-3 text-sm font-black" onChange={(e) => setStatusFilter(e.target.value)} value={statusFilter}>
          {statusFilterOptions.map((o) => <option key={o.value} value={o.value}>{t(o.labelKey)}</option>)}
        </select>
        <select className="h-10 rounded-lg border border-slate-200 px-3 text-sm font-black" onChange={(e) => setGroupBy(e.target.value as typeof groupBy)} value={groupBy}>
          {groupOptionKeys.map((o) => <option key={o.value} value={o.value}>{t(o.labelKey)}</option>)}
        </select>
      </div>
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[900px] border-collapse text-sm">
          <thead className="bg-slate-50 text-left text-xs font-black uppercase text-slate-500">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>{hg.headers.map((h) => <th className="border-b px-4 py-3" key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</th>)}</tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr className="border-b border-slate-100" key={row.id}>
                {row.getVisibleCells().map((cell) => <td className="px-4 py-3" key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PlantsContent() {
  const { businessGarden } = useAppContext();
  return businessGarden ? <BusinessPlantsView /> : <PrivatePlantsView />;
}

export default function PlantsPage() {
  return (
    <AppShell>
      <PlantsContent />
    </AppShell>
  );
}
