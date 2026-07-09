import {
  monthOrder,
  type PlantCalendarEntry,
  type PlantCatalogItem,
  type PlantProblem,
  type PlantRisk,
  type RomanMonth,
} from "./schema";

export type ActionWindowMode = "current" | "next";

export type ActionWindow = {
  label: string;
  month: RomanMonth;
  entries: PlantCalendarEntry[];
  mode: ActionWindowMode;
};

export type SeasonalRiskView = {
  level: PlantRisk["urgency"];
  title: string;
  detail: string;
  symptom: string;
  action: string;
  articleHref: string | null;
};

export function currentRomanMonth(date = new Date()): RomanMonth {
  return monthOrder[date.getMonth()];
}

export function weekOfMonth(date = new Date()) {
  return Math.min(4, Math.ceil(date.getDate() / 7));
}

function weekMatches(entryWeek: PlantCalendarEntry["week"], date: Date) {
  if (!entryWeek || entryWeek === "cały") return true;
  const week = weekOfMonth(date);
  if (entryWeek === "1") return week === 1;
  if (entryWeek === "2") return week === 2;
  if (entryWeek === "3") return week === 3;
  if (entryWeek === "4") return week === 4;
  if (entryWeek === "1-2") return week <= 2;
  if (entryWeek === "3-4") return week >= 3;
  return true;
}

export function getTasksForMonth(plant: PlantCatalogItem, month: RomanMonth) {
  return plant.calendar.filter((entry) => entry.month === month);
}

export function getPlantActionWindow(plant: PlantCatalogItem, date = new Date()): ActionWindow {
  const current = currentRomanMonth(date);
  const currentIndex = monthOrder.indexOf(current);
  const now = getTasksForMonth(plant, current).filter((entry) => weekMatches(entry.week, date));

  if (now.length > 0) {
    return { label: `Teraz (${current})`, month: current, entries: now, mode: "current" };
  }

  const monthHasTasks = (month: RomanMonth) => getTasksForMonth(plant, month).length > 0;
  const nextMonth = monthOrder.slice(currentIndex + 1).find(monthHasTasks)
    || monthOrder.slice(0, currentIndex).find(monthHasTasks)
    || current;

  const entries = getTasksForMonth(plant, nextMonth);
  return {
    label: `Najbliżej (${nextMonth})`,
    month: nextMonth,
    entries,
    mode: "next",
  };
}

export function getActiveRisks(plant: PlantCatalogItem, date = new Date()): SeasonalRiskView[] {
  const current = currentRomanMonth(date);
  return (plant.risks || [])
    .filter((risk) => risk.months.includes(current))
    .map((risk) => ({
      level: risk.urgency,
      title: risk.title,
      detail: risk.action,
      symptom: risk.symptom,
      action: risk.action,
      articleHref: risk.articleHref ?? null,
    }))
    .slice(0, 4);
}

export function getActiveProblems(plant: PlantCatalogItem, date = new Date()): PlantProblem[] {
  const current = currentRomanMonth(date);
  return plant.problems.filter((problem) => !problem.months?.length || problem.months.includes(current));
}

export function getYearCalendarByMonth(plant: PlantCatalogItem) {
  return monthOrder.map((month) => ({
    month,
    tasks: getTasksForMonth(plant, month),
  }));
}

export function getPlantIntelligence(plant: PlantCatalogItem, date = new Date()) {
  const actionWindow = getPlantActionWindow(plant, date);
  return {
    actionWindow,
    appPlantType: plant.slug,
    appTaskCount: plant.calendar.length,
    seasonalRisks: getActiveRisks(plant, date),
    activeProblems: getActiveProblems(plant, date),
    varieties: plant.varieties,
    yearCalendar: getYearCalendarByMonth(plant),
    searchTopics: Array.from(new Set([
      `${plant.name} uprawa`,
      `${plant.name} wymagania`,
      `${plant.name} podlewanie`,
      ...plant.problems.map((problem) => `${plant.name} ${problem.symptom.toLowerCase()}`),
    ])).slice(0, 6),
  };
}

export function getCatalogPlantByAppType(type: string, catalog: PlantCatalogItem[]) {
  return catalog.find((plant) => plant.slug === type || plant.appAliases?.includes(type));
}
