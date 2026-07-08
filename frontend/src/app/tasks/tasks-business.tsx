"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CalendarCheck, Check, Plus } from "lucide-react";
import { AppPageHeader } from "@/components/app/app-page-header";
import { t } from "@/i18n";
import { me, type ShopUser } from "@/lib/auth-api";
import { acceptSeasonalGardenTask, fetchGardenMembers, fetchGardenOrganization, fetchGardenTasks, updateGardenTask, type GardenMember, type GardenOrganization, type GardenTask } from "@/lib/garden-api";
import { canWriteGarden, roleLabel, taskPriorityLabel } from "@/lib/garden-permissions";

export default function BusinessTasksPage() {
  const [user, setUser] = useState<ShopUser | null>(null);
  const [organization, setOrganization] = useState<GardenOrganization | null>(null);
  const [tasks, setTasks] = useState<GardenTask[]>([]);
  const [members, setMembers] = useState<GardenMember[]>([]);
  const [filter, setFilter] = useState<"all" | "mine" | "unassigned">("all");
  const [status, setStatus] = useState(t("app.loading.tasks"));
  const [busySeasonalId, setBusySeasonalId] = useState<string | null>(null);

  async function refresh() {
    const [userData, organizationData, taskData, memberData] = await Promise.all([me(), fetchGardenOrganization(), fetchGardenTasks(), fetchGardenMembers()]);
    setUser(userData.user);
    setOrganization(organizationData);
    setTasks(taskData.tasks);
    setMembers(memberData.members);
  }

  useEffect(() => {
    refresh()
      .then(() => setStatus(""))
      .catch((error) => setStatus(error instanceof Error ? error.message : t("app.errors.fetchTasksFailed")));
  }, []);

  const visibleTasks = useMemo(() => {
    if (filter === "mine") return tasks.filter((task) => task.assignedUserId === user?.id);
    if (filter === "unassigned") return tasks.filter((task) => !task.assignedUserId);
    return tasks;
  }, [filter, tasks, user?.id]);
  const canWrite = canWriteGarden(organization);

  async function assignTask(task: GardenTask, value: string) {
    await updateGardenTask(task.id, { assignedUserId: value ? Number(value) : null });
    await refresh();
  }

  async function completeTask(task: GardenTask) {
    if (task.source !== "manual") return;
    await updateGardenTask(task.id, { status: "done" });
    await refresh();
  }

  async function acceptSeasonalTask(task: GardenTask) {
    if (!task.plantId || !task.templateId) return;
    setBusySeasonalId(String(task.id));
    setStatus("");
    try {
      await acceptSeasonalGardenTask({ plantId: task.plantId, templateId: task.templateId, month: task.month });
      await refresh();
      setStatus(t("app.status.recommendationAdded"));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : t("app.errors.addRecommendationFailed"));
    } finally {
      setBusySeasonalId(null);
    }
  }

  return (
    <div className="mx-auto max-w-[960px]">
      <AppPageHeader
        actions={canWrite ? (
          <Link className="inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-700 px-3 text-sm font-black text-white hover:bg-emerald-800" href="/tasks/new">
            <Plus className="h-4 w-4" />
            {t("app.tasks.newTask")}
          </Link>
        ) : undefined}
        badge={t("app.tasks.title")}
        subtitle={t("app.common.role", { role: roleLabel(organization?.role) })}
        title={t("app.tasks.pageTitle")}
      />
      <div className="mb-4 flex flex-wrap gap-2">
        <button className={`h-10 rounded-lg px-3 text-sm font-black ${filter === "all" ? "bg-emerald-700 text-white" : "bg-white text-slate-700"}`} onClick={() => setFilter("all")} type="button">{t("common.all")}</button>
        <button className={`h-10 rounded-lg px-3 text-sm font-black ${filter === "mine" ? "bg-emerald-700 text-white" : "bg-white text-slate-700"}`} onClick={() => setFilter("mine")} type="button">{t("app.tasks.mine")}</button>
        <button className={`h-10 rounded-lg px-3 text-sm font-black ${filter === "unassigned" ? "bg-emerald-700 text-white" : "bg-white text-slate-700"}`} onClick={() => setFilter("unassigned")} type="button">{t("app.tasks.unassigned")}</button>
      </div>
      {status ? <p className="mb-5 rounded-lg border border-emerald-900/10 bg-white px-4 py-3 text-sm font-bold text-emerald-950">{status}</p> : null}
      <div className="grid gap-3">
        {visibleTasks.length ? visibleTasks.map((task) => (
          <article className="rounded-lg border border-emerald-900/10 bg-white p-5 shadow-sm" key={task.id}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-black uppercase text-emerald-900">{taskPriorityLabel(task.priority)}</span>
                <span className="text-xs font-bold uppercase text-slate-500">{task.plantName}</span>
                {task.assignedUserName ? <span className="text-xs font-bold uppercase text-slate-500">{t("app.common.person", { name: task.assignedUserName })}</span> : null}
              </div>
              {canWrite ? (
                <div className="flex flex-wrap gap-2">
                  <select className="h-9 rounded-lg border border-slate-200 px-3 text-sm font-bold" onChange={(event) => assignTask(task, event.target.value)} value={task.assignedUserId || ""}>
                    <option value="">{t("app.common.unassigned")}</option>
                    {members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
                  </select>
                  {task.source === "manual" && task.status !== "done" ? (
                    <button className="inline-flex h-9 items-center gap-2 rounded-lg border border-emerald-700 px-3 text-xs font-black text-emerald-800" onClick={() => completeTask(task)} type="button">
                      <Check className="h-4 w-4" />
                      {t("app.common.done")}
                    </button>
                  ) : null}
                  {task.source === "seasonal" && task.templateId ? (
                    <button className="inline-flex h-9 items-center gap-2 rounded-lg bg-emerald-700 px-3 text-xs font-black text-white disabled:cursor-wait disabled:opacity-60" disabled={busySeasonalId === String(task.id)} onClick={() => acceptSeasonalTask(task)} type="button">
                      <Plus className="h-4 w-4" />
                      {busySeasonalId === String(task.id) ? t("app.common.adding") : t("app.common.addToCalendar")}
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
            <h2 className="mt-3 text-lg font-black">
              {task.source === "manual" ? <Link className="hover:text-emerald-700" href={`/tasks/${task.id}`}>{task.title}</Link> : task.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{task.description}</p>
          </article>
        )) : (
          <p className="rounded-lg bg-white p-5 text-sm font-bold text-slate-600">{t("app.tasks.noTasks")}</p>
        )}
      </div>
    </div>
  );
}
