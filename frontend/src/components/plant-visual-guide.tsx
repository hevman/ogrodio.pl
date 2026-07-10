"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertTriangle, CalendarRange, Droplets, Gauge, Sprout, SunMedium } from "lucide-react";
import { monthOrder, type PlantCatalogItem, type PlantCalendarEntry } from "@/lib/plant-catalog";

type Props = {
  plant: PlantCatalogItem;
};

type MonthBar = {
  month: string;
  start: number;
  care: number;
  harvest: number;
  total: number;
  tasks: PlantCalendarEntry[];
};

const typeLabels = {
  start: "Start",
  care: "Pielęgnacja",
  harvest: "Zbiory",
};

const barColors = {
  start: "#059669",
  care: "#0284c7",
  harvest: "#d97706",
};

function scoreFromText(value: string, patterns: string[]) {
  const text = value.toLowerCase();
  return patterns.some((pattern) => text.includes(pattern)) ? 90 : 55;
}

function difficultyScore(difficulty: PlantCatalogItem["difficulty"]) {
  if (difficulty === "łatwa") return 35;
  if (difficulty === "średnia") return 62;
  return 86;
}

function monthDataFor(plant: PlantCatalogItem): MonthBar[] {
  return monthOrder.map((month) => {
    const tasks = plant.calendar.filter((entry) => entry.month === month);
    const start = tasks.filter((task) => task.type === "start").length;
    const care = tasks.filter((task) => task.type === "care").length;
    const harvest = tasks.filter((task) => task.type === "harvest").length;

    return {
      month,
      start,
      care,
      harvest,
      total: start + care + harvest,
      tasks,
    };
  });
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: MonthBar }> }) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;

  return (
    <div className="max-w-72 rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-lg">
      <p className="font-black text-slate-900">Miesiąc {data.month}</p>
      <div className="mt-2 space-y-1 text-slate-700">
        {data.tasks.map((task) => (
          <p key={`${task.month}-${task.task}`}>
            <span className="font-bold">{typeLabels[task.type]}:</span> {task.task}
          </p>
        ))}
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value, score }: { icon: typeof SunMedium; label: string; value: string; score: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-teal-700" />
        <p className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</p>
      </div>
      <p className="mt-2 min-h-10 text-sm font-semibold leading-5 text-slate-900">{value}</p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
        <div className="h-full rounded-full bg-teal-700" style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

export function PlantVisualGuide({ plant }: Props) {
  const data = monthDataFor(plant);
  const visibleRisks = [
    ...plant.risks.map((risk) => ({ title: risk.title, detail: risk.action, months: risk.months.join(", ") })),
    ...plant.signals.map((signal) => ({ title: signal.title, detail: signal.action, months: signal.months?.join(", ") || "cały sezon" })),
  ].slice(0, 4);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-teal-700">Schemat uprawy</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">Rok prac, wymagania i ryzyka</h2>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-teal-50 px-3 py-1.5 text-xs font-black uppercase tracking-wide text-teal-800">
          <CalendarRange className="h-4 w-4" />
          dane z katalogu Ogrodio
        </div>
      </div>

      <div className="mt-6 h-72 w-full">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart data={data} margin={{ bottom: 0, left: -24, right: 8, top: 8 }}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
            <XAxis axisLine={false} dataKey="month" tickLine={false} />
            <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f1f5f9" }} />
            <Bar dataKey="start" name="Start" stackId="tasks" radius={[0, 0, 0, 0]}>
              {data.map((entry) => <Cell fill={barColors.start} key={`start-${entry.month}`} />)}
            </Bar>
            <Bar dataKey="care" name="Pielęgnacja" stackId="tasks" radius={[0, 0, 0, 0]}>
              {data.map((entry) => <Cell fill={barColors.care} key={`care-${entry.month}`} />)}
            </Bar>
            <Bar dataKey="harvest" name="Zbiory" stackId="tasks" radius={[8, 8, 0, 0]}>
              {data.map((entry) => <Cell fill={barColors.harvest} key={`harvest-${entry.month}`} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-xs font-bold text-slate-600">
        <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-emerald-600" /> Sadzenie i siew</span>
        <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-sky-600" /> Pielęgnacja</span>
        <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-amber-600" /> Zbiory</span>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="grid gap-3 sm:grid-cols-2">
          <Metric icon={SunMedium} label="Światło" score={scoreFromText(plant.sun, ["pełne", "słońce"])} value={plant.sun} />
          <Metric icon={Droplets} label="Woda" score={scoreFromText(plant.water, ["często", "regularnie", "obficie"])} value={plant.water} />
          <Metric icon={Gauge} label="Trudność" score={difficultyScore(plant.difficulty)} value={plant.difficulty} />
          <Metric icon={Sprout} label="Donica" score={plant.careProfile.container ? 72 : 40} value={plant.careProfile.container || "sprawdź rozstaw i wymagania gatunku"} />
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <p className="text-xs font-black uppercase tracking-wide text-slate-500">Mapa ryzyk</p>
          </div>
          <div className="mt-3 space-y-3">
            {visibleRisks.map((risk) => (
              <div className="rounded-lg bg-white p-3" key={`${risk.title}-${risk.months}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-bold text-slate-900">{risk.title}</p>
                  <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-black text-amber-800">{risk.months}</span>
                </div>
                <p className="mt-1 text-xs leading-5 text-slate-600">{risk.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
