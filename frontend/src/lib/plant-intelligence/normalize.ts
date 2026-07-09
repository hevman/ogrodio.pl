import {
  monthOrder,
  type PlantCalendarEntry,
  type PlantCalendarMonth,
  type PlantCatalogItem,
  type PlantCatalogRaw,
  type PlantProblem,
  type RomanMonth,
} from "./schema";

function isMonthGroupedCalendar(calendar: PlantCatalogRaw["calendar"]): calendar is PlantCalendarMonth[] {
  return calendar.length > 0 && "tasks" in calendar[0];
}

export function flattenCalendar(calendar: PlantCatalogRaw["calendar"]): PlantCalendarEntry[] {
  if (isMonthGroupedCalendar(calendar)) {
    return calendar.flatMap((block) =>
      block.tasks.map((task) => ({
        month: block.month,
        task: task.task,
        type: task.type,
        week: task.week ?? null,
        articleHref: task.articleHref ?? null,
        shopHints: task.shopHints ?? [],
      })),
    );
  }

  return calendar.map((entry) => ({
    month: entry.month as RomanMonth,
    task: entry.task,
    type: entry.type,
    week: null,
    articleHref: null,
    shopHints: [],
  }));
}

export function normalizeProblems(problems: PlantCatalogRaw["problems"]): PlantProblem[] {
  if (problems.length === 0) return [];
  if (typeof problems[0] === "string") {
    return (problems as string[]).map((symptom) => ({ symptom }));
  }
  return problems as PlantProblem[];
}

export function assertFullYearCalendar(slug: string, calendar: PlantCalendarEntry[]) {
  const months = new Set(calendar.map((entry) => entry.month));
  const missing = monthOrder.filter((month) => !months.has(month));
  if (missing.length > 0) {
    throw new Error(`Plant "${slug}" is missing calendar months: ${missing.join(", ")}`);
  }
}

export function normalizePlantCatalogItem(raw: PlantCatalogRaw): PlantCatalogItem {
  const calendar = flattenCalendar(raw.calendar);
  assertFullYearCalendar(raw.slug, calendar);

  return {
    ...raw,
    calendar,
    problems: normalizeProblems(raw.problems),
    risks: raw.risks ?? [],
    varieties: raw.varieties ?? [],
  };
}
