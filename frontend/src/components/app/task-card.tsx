"use client";

import { CheckCircle2, ExternalLink, Plus } from "lucide-react";
import { t } from "@/i18n";
import type { GardenTask } from "@/lib/garden-api";
import { taskPriorityLabel } from "@/lib/garden-permissions";
import type { Product } from "@/lib/shop-api";
import { TaskProductLinks } from "@/components/app/task-product-links";
import { site } from "@/lib/site-config";

const priorityTone = {
  high: "bg-rose-50 text-rose-700 ring-rose-100",
  medium: "bg-amber-50 text-amber-700 ring-amber-100",
  low: "bg-emerald-50 text-emerald-700 ring-emerald-100",
} as const;

function formatDate(value?: string | null) {
  if (!value) return t("app.dashboard.thisMonth");
  return new Intl.DateTimeFormat("pl-PL", { day: "2-digit", month: "short" }).format(new Date(value));
}

function canComplete(task: GardenTask) {
  return task.source === "manual" && /^\d+$/.test(String(task.id));
}

type Props = {
  busySeasonalTaskId?: string | null;
  busyTaskId?: string | null;
  canWrite?: boolean;
  compact?: boolean;
  onAcceptSeasonal?: (task: GardenTask) => void;
  onComplete?: (task: GardenTask) => void;
  products?: Product[];
  showAssignee?: boolean;
  task: GardenTask;
};

export function TaskCard({
  busySeasonalTaskId,
  busyTaskId,
  canWrite,
  compact,
  onAcceptSeasonal,
  onComplete,
  products = [],
  showAssignee,
  task,
}: Props) {
  return (
    <article className={`rounded-xl border border-slate-200 bg-white ${compact ? "p-3" : "p-4"}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-1 text-xs font-black uppercase ring-1 ${priorityTone[task.priority]}`}>
              {taskPriorityLabel(task.priority)}
            </span>
            <span className="text-xs font-bold uppercase text-slate-500">
              {formatDate(task.dueDate || (task.source === "seasonal" ? null : undefined))}
            </span>
            {task.plantName ? <span className="text-xs font-bold uppercase text-emerald-700">{task.plantName}</span> : null}
          </div>
          <h3 className={`font-black text-slate-950 ${compact ? "mt-2 text-sm" : "mt-3 text-base"}`}>{task.title}</h3>
          {!compact && task.description ? <p className="mt-1 text-sm leading-6 text-slate-600">{task.description}</p> : null}
          {task.articleHref ? (
            <a className="mt-2 inline-flex items-center gap-1 text-xs font-black text-emerald-700 hover:text-emerald-800" href={`${site.publicUrl}${task.articleHref}`}>
              Zobacz poradnik <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : null}
          {showAssignee && task.assignedUserName ? (
            <p className="mt-2 text-xs font-bold uppercase text-slate-500">{t("app.common.assignedTo", { name: task.assignedUserName })}</p>
          ) : null}
          {!compact ? <TaskProductLinks products={products} /> : null}
        </div>
        {canWrite ? (
          <div className="flex shrink-0 flex-wrap gap-2">
            {onComplete && canComplete(task) ? (
              <button
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-900/15 px-3 py-2 text-sm font-black text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-50 disabled:cursor-wait disabled:opacity-60"
                disabled={busyTaskId === String(task.id)}
                onClick={() => onComplete(task)}
                type="button"
              >
                <CheckCircle2 className="h-4 w-4" />
                {busyTaskId === String(task.id) ? t("app.common.closing") : t("app.common.completed")}
              </button>
            ) : null}
            {onAcceptSeasonal && task.source === "seasonal" && task.templateId ? (
              <button
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-sm font-black text-white transition hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-60"
                disabled={busySeasonalTaskId === String(task.id)}
                onClick={() => onAcceptSeasonal(task)}
                type="button"
              >
                <Plus className="h-4 w-4" />
                {busySeasonalTaskId === String(task.id) ? t("app.common.adding") : t("app.common.add")}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}
