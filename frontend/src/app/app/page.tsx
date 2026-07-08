"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, BookOpen, CalendarCheck, Leaf, Plus, Sprout, Users } from "lucide-react";
import { AppOnboarding } from "@/components/app/app-onboarding";
import { AppShell } from "@/components/app/app-shell";
import { useAppContext } from "@/components/app/app-context";
import { AppPageHeader } from "@/components/app/app-page-header";
import { TaskCard } from "@/components/app/task-card";
import { WeatherForecastCard } from "@/components/app/weather-forecast-card";
import { t } from "@/i18n";
import {
  acceptGardenInvitation,
  acceptSeasonalGardenTask,
  fetchGardenPlants,
  fetchGardenRecommendations,
  fetchGardenTasks,
  fetchMyGardenInvitations,
  updateGardenTask,
  type GardenInvitation,
  type GardenPlant,
  type GardenRecommendedArticle,
  type GardenTask,
} from "@/lib/garden-api";
import { canWriteGarden } from "@/lib/garden-permissions";
import { getArticlePath } from "@/lib/site-config";
import type { Product } from "@/lib/shop-api";

function dateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function taskDate(task: GardenTask) {
  if (task.dueDate) return task.dueDate.slice(0, 10);
  return `${new Date().getFullYear()}-${String(task.month).padStart(2, "0")}-01`;
}

function isOpenTask(task: GardenTask) {
  return task.status !== "done" && task.status !== "skipped";
}

function weekEndDate(from: Date) {
  const end = new Date(from);
  end.setDate(end.getDate() + 7);
  return dateInputValue(end);
}

function DashboardContent() {
  const { businessGarden, organization } = useAppContext();
  const [plants, setPlants] = useState<GardenPlant[]>([]);
  const [tasks, setTasks] = useState<GardenTask[]>([]);
  const [articles, setArticles] = useState<GardenRecommendedArticle[]>([]);
  const [invitations, setInvitations] = useState<GardenInvitation[]>([]);
  const [taskProducts, setTaskProducts] = useState<Record<string, Product[]>>({});
  const [status, setStatus] = useState(t("app.loading.dashboard"));
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null);
  const [busySeasonalTaskId, setBusySeasonalTaskId] = useState<string | null>(null);
  const [busyInvitationId, setBusyInvitationId] = useState<number | null>(null);

  const refresh = useCallback(() => {
    setStatus(t("app.loading.dashboard"));
    return Promise.all([
      fetchGardenPlants(),
      fetchGardenTasks(new Date().getMonth() + 1),
      fetchGardenRecommendations(),
      fetchMyGardenInvitations(),
    ])
      .then(([plantsData, tasksData, recommendations, invitationData]) => {
        setPlants(plantsData.plants);
        setTasks(tasksData.tasks);
        setArticles(recommendations.articles);
        setInvitations(invitationData.invitations.filter((i) => i.status === "pending"));
        setStatus("");
      })
      .catch((error) => setStatus(error instanceof Error ? error.message : t("app.errors.fetchFailed")));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const today = dateInputValue(new Date());
  const weekEnd = weekEndDate(new Date());

  const dashboard = useMemo(() => {
    const openTasks = tasks.filter(isOpenTask);
    const todayTasks = openTasks.filter((task) => task.dueDate && taskDate(task) === today);
    const overdueTasks = openTasks.filter((task) => task.source === "manual" && task.dueDate && taskDate(task) < today);
    const weekTasks = openTasks.filter((task) => {
      if (task.dueDate) return taskDate(task) >= today && taskDate(task) <= weekEnd;
      return task.source === "seasonal";
    }).slice(0, 8);
    const focusTasks = todayTasks.length ? todayTasks : weekTasks;
    return { weekTasks, focusTasks, overdueTasks };
  }, [tasks, today, weekEnd]);

  useEffect(() => {
    const visible = [...dashboard.focusTasks, ...dashboard.overdueTasks.slice(0, 3)];
    if (!visible.length) { setTaskProducts({}); return; }
    fetch("/api/app/task-products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tasks: visible.map((task) => ({ id: String(task.id), kind: task.kind, plantType: task.plantType })) }),
    })
      .then((r) => r.json())
      .then((data) => setTaskProducts(data.products || {}))
      .catch(() => setTaskProducts({}));
  }, [dashboard.focusTasks, dashboard.overdueTasks]);

  const completeTask = (task: GardenTask) => {
    if (!canWriteGarden(organization) || task.source !== "manual") return;
    setBusyTaskId(String(task.id));
    updateGardenTask(task.id, { status: "done" }).then(refresh).finally(() => setBusyTaskId(null));
  };

  const acceptSeasonalTask = (task: GardenTask) => {
    if (!task.plantId || !task.templateId) return;
    setBusySeasonalTaskId(String(task.id));
    acceptSeasonalGardenTask({ plantId: task.plantId, templateId: task.templateId, month: task.month })
      .then(refresh)
      .finally(() => setBusySeasonalTaskId(null));
  };

  return (
    <div className="mx-auto max-w-[900px]">
      <AppPageHeader
        actions={canWriteGarden(organization) ? (
          <Link className="inline-flex h-11 items-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-black text-white" href="/plants">
            <Sprout className="h-4 w-4" />
            {plants.length ? t("app.dashboard.addPlant") : t("app.onboarding.cta")}
          </Link>
        ) : undefined}
        badge={t("app.dashboard.myGardenBadge")}
        subtitle={t("app.dashboard.myGardenSubtitle")}
        title={t("app.dashboard.myGardenTitle")}
      />

      {status ? <p className="mb-4 rounded-xl bg-white px-4 py-3 text-sm font-bold">{status}</p> : null}
      {!status && plants.length === 0 ? <AppOnboarding /> : null}

      <WeatherForecastCard />

      {invitations.length ? invitations.map((inv) => (
        <article className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4" key={inv.id}>
          <p className="text-sm font-bold text-amber-900">
            <Users className="mr-1 inline h-4 w-4" />
            {t("app.common.invitationAs", { name: inv.organizationName || "", role: inv.role })}
          </p>
          <button className="rounded-lg bg-amber-900 px-3 py-2 text-sm font-black text-white" disabled={busyInvitationId === inv.id} onClick={() => {
            setBusyInvitationId(inv.id);
            acceptGardenInvitation(inv.id).then(refresh).finally(() => setBusyInvitationId(null));
          }} type="button">{t("app.common.accept")}</button>
        </article>
      )) : null}

      {plants.length > 0 ? (
        <div className="mb-5 grid grid-cols-3 gap-3">
          <StatCard icon={<CalendarCheck className="h-5 w-5" />} label={t("app.dashboard.weekTasksCount")} value={dashboard.weekTasks.length} />
          <StatCard icon={<Leaf className="h-5 w-5" />} label={t("app.dashboard.plantsCount")} value={plants.length} />
          <StatCard icon={<BookOpen className="h-5 w-5" />} label={t("app.dashboard.adviceCount")} value={Math.min(articles.length, 3)} />
        </div>
      ) : null}

      <section className="mb-5">
        <h2 className="mb-3 text-sm font-black uppercase text-emerald-700">
          {dashboard.focusTasks.some((t) => t.dueDate && taskDate(t) === today) ? t("app.dashboard.todayTasksTitle") : t("app.dashboard.weekTasksTitle")}
        </h2>
        <div className="grid gap-3">
          {dashboard.focusTasks.length ? dashboard.focusTasks.map((task) => (
            <TaskCard
              busySeasonalTaskId={busySeasonalTaskId}
              busyTaskId={busyTaskId}
              canWrite={canWriteGarden(organization)}
              key={task.id}
              onAcceptSeasonal={acceptSeasonalTask}
              onComplete={completeTask}
              products={taskProducts[String(task.id)] || []}
              showAssignee={businessGarden}
              task={task}
            />
          )) : (
            <p className="rounded-xl bg-white p-5 text-sm font-bold text-slate-600">{t("app.dashboard.noWeekTasks")}</p>
          )}
        </div>
        {dashboard.focusTasks.length ? (
          <Link className="mt-3 inline-flex text-sm font-black text-emerald-700" href="/calendar">{t("app.dashboard.seeCalendar")}</Link>
        ) : null}
      </section>

      {dashboard.overdueTasks.length ? (
        <section className="mb-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-black uppercase text-rose-700">
            <AlertTriangle className="h-4 w-4" />
            {t("app.dashboard.overdueTitle")}
          </h2>
          <div className="grid gap-3">
            {dashboard.overdueTasks.slice(0, 3).map((task) => (
              <TaskCard busyTaskId={busyTaskId} canWrite={canWriteGarden(organization)} key={task.id} onComplete={completeTask} products={taskProducts[String(task.id)] || []} task={task} />
            ))}
          </div>
        </section>
      ) : null}

      {articles.length ? (
        <section>
          <h2 className="mb-3 text-sm font-black uppercase text-emerald-700">{t("app.dashboard.relatedAdvice")}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {articles.slice(0, 2).map((article) => (
              <a className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-emerald-300" href={getArticlePath(article)} key={article.slug}>
                <p className="text-xs font-black uppercase text-emerald-700">{article.topic}</p>
                <h3 className="mt-1 font-black">{article.title}</h3>
              </a>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <article className="rounded-xl border border-emerald-900/10 bg-white p-4">
      <div className="text-emerald-700">{icon}</div>
      <p className="mt-2 text-xs font-black uppercase text-slate-500">{label}</p>
      <p className="text-2xl font-black">{value}</p>
    </article>
  );
}

export default function GardenDashboardPage() {
  return (
    <AppShell>
      <DashboardContent />
    </AppShell>
  );
}
