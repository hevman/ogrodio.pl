"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CalendarPlus } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { t } from "@/i18n";
import {
  addGardenTask,
  fetchGardenLocations,
  fetchGardenMembers,
  fetchGardenOrganization,
  fetchGardenPlants,
  type GardenLocation,
  type GardenMember,
  type GardenOrganization,
  type GardenPlant,
} from "@/lib/garden-api";
import {
  canWriteGarden,
  repeatRuleLabel,
  roleLabel,
  taskPriorityLabel,
  taskTypeLabel,
} from "@/lib/garden-permissions";

function todayInputValue() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

const taskKinds = ["custom", "watering", "fertilizing", "cutting", "inspection", "protection"] as const;
const repeatRules = ["", "weekly", "monthly", "seasonal"] as const;

export default function NewTaskPage() {
  const router = useRouter();
  const [plants, setPlants] = useState<GardenPlant[]>([]);
  const [organization, setOrganization] = useState<GardenOrganization | null>(null);
  const [locations, setLocations] = useState<GardenLocation[]>([]);
  const [members, setMembers] = useState<GardenMember[]>([]);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState(todayInputValue());
  const [plantId, setPlantId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [assignedUserId, setAssignedUserId] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [kind, setKind] = useState("custom");
  const [repeatRule, setRepeatRule] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState(t("app.loading.form"));
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setDueDate(params.get("date") || todayInputValue());
    setPlantId(params.get("plantId") || "");
    Promise.all([fetchGardenOrganization(), fetchGardenPlants(), fetchGardenLocations(), fetchGardenMembers()])
      .then(([organizationData, plantData, locationData, memberData]) => {
        setOrganization(organizationData);
        setPlants(plantData.plants);
        setLocations(locationData.locations);
        setMembers(memberData.members);
        setStatus("");
      })
      .catch((error) => setStatus(error instanceof Error ? error.message : t("app.errors.fetchFailed")));
  }, []);

  async function createTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setStatus("");
    try {
      const created = await addGardenTask({
        title,
        description,
        dueDate,
        priority,
        kind,
        plantId: plantId ? Number(plantId) : null,
        locationId: locationId ? Number(locationId) : null,
        assignedUserId: assignedUserId ? Number(assignedUserId) : null,
        repeatRule,
      });
      router.push(`/tasks/${created.task.id}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : t("app.errors.addTaskFailed"));
      setIsSaving(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-[920px]">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Link className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-slate-800 hover:border-emerald-600 hover:text-emerald-800" href="/tasks">
            <ArrowLeft className="h-4 w-4" />
            {t("app.tasks.title")}
          </Link>
          <Link className="inline-flex h-10 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 hover:border-emerald-600 hover:text-emerald-800" href="/calendar">
            {t("app.nav.calendar")}
          </Link>
        </div>

        {!canWriteGarden(organization) ? (
          <section className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-950 shadow-sm">
            <p className="text-sm font-black uppercase">{t("app.common.noPermission")}</p>
            <h1 className="mt-2 text-2xl font-black">{t("app.tasks.noPermissionTitle")}</h1>
            <p className="mt-3 text-sm font-bold">{t("app.tasks.noPermissionText", { role: roleLabel(organization?.role) })}</p>
          </section>
        ) : (
        <form className="rounded-lg border border-emerald-900/10 bg-white p-5 shadow-sm sm:p-6" onSubmit={createTask}>
          <p className="flex items-center gap-2 text-sm font-black uppercase text-emerald-700">
            <CalendarPlus className="h-4 w-4" />
            {t("app.tasks.newTask")}
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">{t("app.tasks.newTaskTitle")}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            {t("app.tasks.newTaskHint")}
          </p>

          {status ? <p className="mt-5 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-950">{status}</p> : null}

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="md:col-span-2">
              <span className="text-xs font-black uppercase text-slate-500">{t("app.tasks.taskName")}</span>
              <input className="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-bold outline-none focus:border-emerald-600" onChange={(event) => setTitle(event.target.value)} placeholder={t("app.tasks.taskNamePlaceholder")} required value={title} />
            </label>

            <label>
              <span className="text-xs font-black uppercase text-slate-500">{t("app.common.dueDate")}</span>
              <input className="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-bold outline-none focus:border-emerald-600" onChange={(event) => setDueDate(event.target.value)} type="date" value={dueDate} />
            </label>

            <label>
              <span className="text-xs font-black uppercase text-slate-500">
                {t("app.plants.priorityMedium").replace(/^[^\s]+\s+/, "").replace(/^./, (char) => char.toUpperCase())}
              </span>
              <select className="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-bold outline-none focus:border-emerald-600" onChange={(event) => setPriority(event.target.value as "low" | "medium" | "high")} value={priority}>
                <option value="high">{taskPriorityLabel("high")}</option>
                <option value="medium">{taskPriorityLabel("medium")}</option>
                <option value="low">{taskPriorityLabel("low")}</option>
              </select>
            </label>

            <label>
              <span className="text-xs font-black uppercase text-slate-500">{t("app.tasks.workType")}</span>
              <select className="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-bold outline-none focus:border-emerald-600" onChange={(event) => setKind(event.target.value)} value={kind}>
                {taskKinds.map((value) => <option key={value} value={value}>{taskTypeLabel(value)}</option>)}
              </select>
            </label>

            <label>
              <span className="text-xs font-black uppercase text-slate-500">{t("app.common.repeat")}</span>
              <select className="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-bold outline-none focus:border-emerald-600" onChange={(event) => setRepeatRule(event.target.value)} value={repeatRule}>
                {repeatRules.map((value) => <option key={value || "none"} value={value}>{repeatRuleLabel(value)}</option>)}
              </select>
            </label>

            <label>
              <span className="text-xs font-black uppercase text-slate-500">{t("app.common.plant")}</span>
              <select className="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-bold outline-none focus:border-emerald-600" onChange={(event) => setPlantId(event.target.value)} value={plantId}>
                <option value="">{t("app.tasks.noPlant")}</option>
                {plants.map((plant) => <option key={plant.id} value={plant.id}>{plant.displayName}</option>)}
              </select>
            </label>

            <label>
              <span className="text-xs font-black uppercase text-slate-500">{t("app.common.location")}</span>
              <select className="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-bold outline-none focus:border-emerald-600" onChange={(event) => setLocationId(event.target.value)} value={locationId}>
                <option value="">{t("app.common.noLocation")}</option>
                {locations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}
              </select>
            </label>

            <label className="md:col-span-2">
              <span className="text-xs font-black uppercase text-slate-500">{t("app.common.assignedTo", { name: "" }).replace(/:\s*$/, "").trim()}</span>
              <select className="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-bold outline-none focus:border-emerald-600" onChange={(event) => setAssignedUserId(event.target.value)} value={assignedUserId}>
                <option value="">{t("app.common.unassigned")}</option>
                {members.map((member) => <option key={member.id} value={member.id}>{member.name} ({member.role})</option>)}
              </select>
            </label>

            <label className="md:col-span-2">
              <span className="text-xs font-black uppercase text-slate-500">{t("app.common.description")}</span>
              <textarea className="mt-1 min-h-32 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm font-bold outline-none focus:border-emerald-600" onChange={(event) => setDescription(event.target.value)} placeholder={t("app.tasks.descriptionPlaceholder")} value={description} />
            </label>
          </div>

          <button className="mt-6 h-11 rounded-lg bg-emerald-700 px-5 text-sm font-black text-white hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-60" disabled={isSaving} type="submit">
            {isSaving ? t("app.common.saving") : t("app.tasks.addTaskButton")}
          </button>
        </form>
        )}
      </div>
    </AppShell>
  );
}
