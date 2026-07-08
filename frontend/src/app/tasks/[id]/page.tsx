"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CalendarDays, Camera, CheckCircle2, Leaf, Save, UserRound } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { t } from "@/i18n";
import {
  addGardenJournalEntry,
  fetchGardenMembers,
  fetchGardenOrganization,
  fetchGardenTask,
  uploadGardenJournalImage,
  updateGardenTask,
  type GardenMember,
  type GardenOrganization,
  type GardenTask,
} from "@/lib/garden-api";
import {
  canWriteGarden,
  repeatRuleLabel,
  taskPriorityLabel,
  taskStatusLabel,
  taskTypeLabel,
} from "@/lib/garden-permissions";

function formatDate(value?: string | null) {
  if (!value) return t("app.common.noDueDate");
  return new Intl.DateTimeFormat("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value));
}

function canMutate(task: GardenTask | null) {
  return task?.source === "manual" && /^\d+$/.test(String(task.id));
}

export default function TaskDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const taskId = params.id;
  const [task, setTask] = useState<GardenTask | null>(null);
  const [organization, setOrganization] = useState<GardenOrganization | null>(null);
  const [members, setMembers] = useState<GardenMember[]>([]);
  const [assignedUserId, setAssignedUserId] = useState("");
  const [taskStatus, setTaskStatus] = useState<"open" | "done" | "skipped">("open");
  const [completionNote, setCompletionNote] = useState("");
  const [completionFile, setCompletionFile] = useState<File | null>(null);
  const [status, setStatus] = useState(t("app.loading.task"));
  const [isSaving, setIsSaving] = useState(false);
  const [isCompletingWithJournal, setIsCompletingWithJournal] = useState(false);

  async function refresh() {
    const [taskData, organizationData, memberData] = await Promise.all([fetchGardenTask(taskId), fetchGardenOrganization(), fetchGardenMembers()]);
    setTask(taskData.task);
    setOrganization(organizationData);
    setMembers(memberData.members);
    setAssignedUserId(taskData.task.assignedUserId ? String(taskData.task.assignedUserId) : "");
    setTaskStatus(taskData.task.status === "done" || taskData.task.status === "skipped" ? taskData.task.status : "open");
  }

  useEffect(() => {
    refresh()
      .then(() => setStatus(""))
      .catch((error) => setStatus(error instanceof Error ? error.message : t("app.errors.fetchTaskFailed")));
  }, [taskId]);

  async function saveTask() {
    if (!task || !canMutate(task)) return;
    setIsSaving(true);
    setStatus("");
    try {
      await updateGardenTask(task.id, {
        status: taskStatus,
        assignedUserId: assignedUserId ? Number(assignedUserId) : null,
      });
      await refresh();
      setStatus(t("app.status.taskSaved"));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : t("app.errors.saveTaskFailed"));
    } finally {
      setIsSaving(false);
    }
  }

  async function completeTask() {
    setTaskStatus("done");
    if (!task || !canMutate(task)) return;
    setIsSaving(true);
    setStatus("");
    try {
      await updateGardenTask(task.id, { status: "done" });
      await refresh();
      setStatus(t("app.status.taskCompleted"));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : t("app.errors.closeTaskFailed"));
    } finally {
      setIsSaving(false);
    }
  }

  async function completeTaskWithJournal() {
    if (!task || !canMutate(task)) return;
    setIsCompletingWithJournal(true);
    setStatus("");
    try {
      const uploaded = completionFile ? await uploadGardenJournalImage(completionFile) : null;
      await addGardenJournalEntry({
        plantId: task.plantId || null,
        locationId: task.locationId || null,
        taskId: Number(task.id),
        title: t("app.status.completedTitle", { title: task.title }),
        body: completionNote || task.description || t("app.status.completedBody"),
        imageUrl: uploaded?.url || "",
        happenedAt: new Date().toISOString(),
      });
      await updateGardenTask(task.id, { status: "done" });
      setCompletionNote("");
      setCompletionFile(null);
      await refresh();
      setStatus(t("app.status.taskCompletedWithJournal"));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : t("app.errors.completeTaskFailed"));
    } finally {
      setIsCompletingWithJournal(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-[1100px]">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Link className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-slate-800 hover:border-emerald-600 hover:text-emerald-800" href="/tasks">
            <ArrowLeft className="h-4 w-4" />
            {t("app.tasks.title")}
          </Link>
          <div className="flex flex-wrap gap-2">
            <Link className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 hover:border-emerald-600 hover:text-emerald-800" href="/calendar">
              <CalendarDays className="h-4 w-4" />
              {t("app.nav.calendar")}
            </Link>
            <Link className="inline-flex h-10 items-center rounded-lg bg-emerald-700 px-3 text-sm font-black text-white hover:bg-emerald-800" href="/tasks/new">
              {t("app.tasks.newTask")}
            </Link>
          </div>
        </div>

        {status ? <p className="mb-5 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-950">{status}</p> : null}

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-lg border border-emerald-900/10 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-sm font-black uppercase text-emerald-700">{t("app.tasks.taskLabel")}</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">{task?.title || t("app.tasks.taskFallback")}</h1>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black uppercase text-emerald-900">{taskPriorityLabel(task?.priority || "medium")}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase text-slate-700">{taskStatusLabel(task?.status || "open")}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase text-slate-700">{taskTypeLabel(task?.kind || "custom")}</span>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Metric label={t("app.common.dueDate")} value={formatDate(task?.dueDate)} />
              <Metric label={t("app.common.repeat")} value={repeatRuleLabel(task?.repeatRule)} />
              <Metric label={t("app.common.plant")} value={task?.plantName || t("app.common.none")} />
              <Metric label={t("app.common.location")} value={task?.locationName || t("app.common.none")} />
              <Metric label={t("app.common.assignedTo", { name: "" }).replace(/:\s*$/, "").trim()} value={task?.assignedUserName || t("app.common.unassigned")} />
              <Metric label={t("app.common.created")} value={formatDate(task?.createdAt)} />
            </div>

            {task?.description ? (
              <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-black uppercase text-slate-500">{t("app.common.description")}</p>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">{task.description}</p>
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-2">
              {task?.plantId ? (
                <Link className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-black text-slate-700 hover:border-emerald-600 hover:text-emerald-800" href={`/plants/${task.plantId}`}>
                  <Leaf className="h-4 w-4" />
                  {t("app.common.plantCard")}
                </Link>
              ) : null}
              {canWriteGarden(organization) && canMutate(task) && task?.status !== "done" ? (
                <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-700 px-3 text-sm font-black text-white hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-60" disabled={isSaving} onClick={completeTask} type="button">
                  <CheckCircle2 className="h-4 w-4" />
                  {t("app.tasks.markCompleted")}
                </button>
              ) : null}
            </div>
          </section>

          <aside className="grid gap-5">
            <section className="rounded-lg border border-emerald-900/10 bg-white p-5 shadow-sm">
              <p className="flex items-center gap-2 text-sm font-black uppercase text-emerald-700">
                <Camera className="h-4 w-4" />
                {t("app.tasks.completionTitle")}
              </p>
              {canWriteGarden(organization) && canMutate(task) && task?.status !== "done" ? (
                <div className="mt-4 grid gap-3">
                  <textarea
                    className="min-h-28 rounded-lg border border-slate-200 px-3 py-3 text-sm font-bold outline-none focus:border-emerald-600"
                    onChange={(event) => setCompletionNote(event.target.value)}
                    placeholder={t("app.tasks.completionPlaceholder")}
                    value={completionNote}
                  />
                  <input
                    accept="image/jpeg,image/png,image/webp"
                    className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold file:mr-3 file:rounded-md file:border-0 file:bg-emerald-700 file:px-3 file:py-2 file:text-sm file:font-black file:text-white"
                    onChange={(event) => setCompletionFile(event.target.files?.[0] || null)}
                    type="file"
                  />
                  <button
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 text-sm font-black text-white hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-60"
                    disabled={isCompletingWithJournal}
                    onClick={completeTaskWithJournal}
                    type="button"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {isCompletingWithJournal ? t("app.common.saving") : t("app.tasks.completeAndJournal")}
                  </button>
                </div>
              ) : (
                <p className="mt-4 rounded-lg bg-slate-50 p-4 text-sm font-bold text-slate-600">
                  {t("app.tasks.taskDoneOrLocked")}
                </p>
              )}
            </section>

            <section className="rounded-lg border border-emerald-900/10 bg-white p-5 shadow-sm">
              <p className="flex items-center gap-2 text-sm font-black uppercase text-emerald-700">
                <UserRound className="h-4 w-4" />
                {t("app.common.management")}
              </p>
              {canWriteGarden(organization) && canMutate(task) ? (
                <div className="mt-4 grid gap-3">
                  <label>
                    <span className="text-xs font-black uppercase text-slate-500">{t("app.common.status")}</span>
                    <select className="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-bold outline-none focus:border-emerald-600" onChange={(event) => setTaskStatus(event.target.value as "open" | "done" | "skipped")} value={taskStatus}>
                      <option value="open">{taskStatusLabel("open")}</option>
                      <option value="done">{taskStatusLabel("done")}</option>
                      <option value="skipped">{taskStatusLabel("skipped")}</option>
                    </select>
                  </label>
                  <label>
                    <span className="text-xs font-black uppercase text-slate-500">{t("app.common.assignedTo", { name: "" }).replace(/:\s*$/, "").trim()}</span>
                    <select className="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-bold outline-none focus:border-emerald-600" onChange={(event) => setAssignedUserId(event.target.value)} value={assignedUserId}>
                      <option value="">{t("app.common.unassigned")}</option>
                      {members.map((member) => <option key={member.id} value={member.id}>{member.name} ({member.role})</option>)}
                    </select>
                  </label>
                  <button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 text-sm font-black text-white hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-60" disabled={isSaving} onClick={saveTask} type="button">
                    <Save className="h-4 w-4" />
                    {isSaving ? t("app.common.saving") : t("app.common.save")}
                  </button>
                </div>
              ) : (
                <p className="mt-4 rounded-lg bg-slate-50 p-4 text-sm font-bold text-slate-600">
                  {t("app.tasks.seasonalOrLocked")}
                </p>
              )}
            </section>

            <section className="rounded-lg border border-emerald-900/10 bg-slate-950 p-5 text-white shadow-sm">
              <p className="text-sm font-black uppercase text-emerald-300">{t("app.tasks.nextStep")}</p>
              <p className="mt-3 text-sm font-semibold leading-6 text-slate-200">
                {t("app.tasks.nextStepHint")}
              </p>
              <button className="mt-4 h-10 rounded-lg bg-white px-3 text-sm font-black text-slate-950" onClick={() => router.push(task?.plantId ? `/plants/${task.plantId}` : "/journal")} type="button">
                {t("app.common.goToJournal")}
              </button>
            </section>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-black uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-base font-black text-slate-950">{value}</p>
    </div>
  );
}
