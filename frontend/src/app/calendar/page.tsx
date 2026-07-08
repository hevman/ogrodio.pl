"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import type { DateClickArg } from "@fullcalendar/interaction";
import type { EventClickArg } from "@fullcalendar/core";
import { Check, Plus } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { useAppContext } from "@/components/app/app-context";
import { AppPageHeader } from "@/components/app/app-page-header";
import { TaskCard } from "@/components/app/task-card";
import { t } from "@/i18n";
import { acceptSeasonalGardenTask, fetchGardenTasks, updateGardenTask, type GardenTask } from "@/lib/garden-api";
import { canWriteGarden } from "@/lib/garden-permissions";

const eventColor = { high: "#b91c1c", medium: "#047857", low: "#64748b" } as const;

function todayInputValue() {
  return dateInputValue(new Date());
}

function dateInputValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function taskDate(task: GardenTask) {
  return task.dueDate?.slice(0, 10) || dateInputValue(new Date(new Date().getFullYear(), (task.month || new Date().getMonth() + 1) - 1, 1));
}

function CalendarContent() {
  const { businessGarden, organization } = useAppContext();
  const currentMonth = new Date().getMonth() + 1;
  const [month, setMonth] = useState(currentMonth);
  const [selectedDate, setSelectedDate] = useState(todayInputValue());
  const [tasks, setTasks] = useState<GardenTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<GardenTask | null>(null);
  const [status, setStatus] = useState(t("app.loading.calendar"));
  const [busySeasonal, setBusySeasonal] = useState(false);
  const canWrite = canWriteGarden(organization);

  const events = useMemo(() => tasks.map((task) => ({
    id: String(task.id),
    title: task.status === "done" ? `✓ ${task.title}` : task.title,
    start: taskDate(task),
    allDay: true,
    backgroundColor: task.status === "done" ? "#94a3b8" : eventColor[task.priority],
    borderColor: task.status === "done" ? "#94a3b8" : eventColor[task.priority],
    extendedProps: { task },
  })), [tasks]);

  const monthTasks = useMemo(() => tasks.filter((t) => t.status !== "done" && t.status !== "skipped").slice(0, 6), [tasks]);

  async function refresh(selectedMonth = month) {
    const taskData = await fetchGardenTasks(selectedMonth);
    setTasks(taskData.tasks);
  }

  useEffect(() => {
    refresh().then(() => setStatus("")).catch((e) => setStatus(e instanceof Error ? e.message : t("app.errors.fetchCalendarFailed")));
  }, []);

  async function loadVisibleMonth(date: Date) {
    const nextMonth = date.getMonth() + 1;
    setMonth(nextMonth);
    await refresh(nextMonth);
  }

  async function completeTask(task: GardenTask) {
    if (task.source !== "manual") return;
    await updateGardenTask(task.id, { status: "done" });
    await refresh(month);
    setSelectedTask(null);
  }

  async function acceptSeasonalTask(task: GardenTask) {
    if (!task.plantId || !task.templateId) return;
    setBusySeasonal(true);
    try {
      const saved = await acceptSeasonalGardenTask({ plantId: task.plantId, templateId: task.templateId, month: task.month || month, dueDate: selectedDate });
      await refresh(month);
      setSelectedTask(saved.task);
      setStatus(t("app.status.recommendationAdded"));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : t("app.errors.addRecommendationFailed"));
    } finally {
      setBusySeasonal(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1100px]">
      <AppPageHeader
        actions={businessGarden && canWrite ? (
          <Link className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-black text-white" href={`/tasks/new?date=${selectedDate}`}>
            <Plus className="h-4 w-4" />
            {t("app.tasks.newTask")}
          </Link>
        ) : undefined}
        badge={t("app.nav.plan")}
        subtitle={businessGarden ? t("app.calendar.subtitleBusiness") : t("app.calendar.subtitlePrivate")}
        title={t("app.calendar.pageTitlePrivate")}
      />

      {status ? <p className="mb-4 rounded-xl bg-white px-4 py-3 text-sm font-bold">{status}</p> : null}

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <section className="rounded-2xl border border-emerald-900/10 bg-white p-3 shadow-sm sm:p-4">
          <div className="garden-calendar">
            <FullCalendar
              buttonText={{ today: t("app.calendar.today"), month: t("app.calendar.month"), list: t("app.calendar.list") }}
              dateClick={(e: DateClickArg) => { setSelectedDate(e.dateStr); setSelectedTask(null); }}
              datesSet={(arg) => loadVisibleMonth(arg.view.currentStart)}
              eventClick={(e: EventClickArg) => setSelectedTask(e.event.extendedProps.task as GardenTask)}
              events={events}
              firstDay={1}
              headerToolbar={{ left: "prev,next today", center: "title", right: businessGarden ? "dayGridMonth,listMonth" : "dayGridMonth,listMonth" }}
              height="auto"
              initialView="dayGridMonth"
              locale="pl"
              plugins={[dayGridPlugin, interactionPlugin, listPlugin]}
            />
          </div>
        </section>

        <aside className="grid gap-4 content-start">
          {selectedTask ? (
            <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm">
              <TaskCard
                busySeasonalTaskId={busySeasonal ? String(selectedTask.id) : null}
                canWrite={canWrite}
                onAcceptSeasonal={acceptSeasonalTask}
                onComplete={completeTask}
                task={selectedTask}
              />
              {selectedTask.plantId ? (
                <Link className="mt-3 inline-flex text-sm font-black text-emerald-700" href={`/plants/${selectedTask.plantId}`}>{t("app.common.plantCard")}</Link>
              ) : null}
            </div>
          ) : (
            <section className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-black text-slate-950">{t("app.calendar.selectedDate", { date: selectedDate })}</p>
              <p className="mt-2 text-sm text-slate-600">{t("app.calendar.tapDayHint")}</p>
            </section>
          )}

          <section className="rounded-2xl border border-emerald-900/10 bg-white p-4 shadow-sm">
            <p className="text-sm font-black uppercase text-emerald-700">{t("app.calendar.upcoming")}</p>
            <div className="mt-3 grid gap-2">
              {monthTasks.length ? monthTasks.map((task) => (
                <button className="rounded-xl border border-slate-200 p-3 text-left hover:bg-emerald-50" key={task.id} onClick={() => setSelectedTask(task)} type="button">
                  <span className="text-xs font-bold text-slate-500">{taskDate(task)}</span>
                  <span className="mt-1 block text-sm font-black">{task.title}</span>
                </button>
              )) : (
                <p className="text-sm font-bold text-slate-500">{t("app.calendar.noTasks")}</p>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

export default function CalendarPage() {
  return (
    <AppShell>
      <CalendarContent />
    </AppShell>
  );
}
