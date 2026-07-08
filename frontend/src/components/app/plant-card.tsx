import Link from "next/link";
import { ChevronRight, Leaf, Trash2 } from "lucide-react";
import { t } from "@/i18n";
import type { GardenPlant } from "@/lib/garden-api";
import { plantHealthLabel, plantStatusLabel } from "@/lib/garden-permissions";

type Props = {
  canWrite?: boolean;
  onRemove?: (id: number) => void;
  plant: GardenPlant;
  typeLabel: string;
};

export function PlantCard({ canWrite, onRemove, plant, typeLabel }: Props) {
  const status = plant.status || "active";
  const statusTone =
    status === "problem" ? "bg-red-100 text-red-800" :
    status === "observation" ? "bg-amber-100 text-amber-900" :
    "bg-emerald-100 text-emerald-900";

  return (
    <article className="group relative overflow-hidden rounded-xl border border-emerald-900/10 bg-white shadow-sm transition hover:border-emerald-300 hover:shadow-md">
      <Link className="block p-5" href={`/plants/${plant.id}`}>
        <div className="flex items-start justify-between gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-100 text-emerald-800">
            <Leaf className="h-5 w-5" />
          </span>
          <ChevronRight className="h-5 w-5 text-slate-300 transition group-hover:text-emerald-600" />
        </div>
        <h2 className="mt-4 text-lg font-black text-slate-950">{plant.displayName}</h2>
        <p className="mt-1 text-sm font-bold text-emerald-700">{typeLabel}</p>
        <p className="mt-2 text-sm text-slate-600">{plant.location || plant.locationName || t("app.common.noLocation")}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-black uppercase ${statusTone}`}>
            {plantStatusLabel(status)}
          </span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-black uppercase text-slate-700">
            {plantHealthLabel(plant.healthStatus || "good")}
          </span>
        </div>
      </Link>
      {canWrite && onRemove ? (
        <button
          aria-label={t("app.common.removePlant")}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-lg text-red-600 opacity-0 transition hover:bg-red-50 group-hover:opacity-100"
          onClick={() => onRemove(plant.id)}
          type="button"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      ) : null}
    </article>
  );
}
