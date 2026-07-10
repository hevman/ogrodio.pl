import {
  monthOrder,
  type PlantCalendarEntry,
  type PlantCatalogItem,
  type PlantCatalogRaw,
} from "./schema";

export function readCalendarFromJson(calendar: PlantCatalogRaw["calendar"]): PlantCalendarEntry[] {
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

export function assertFullYearCalendar(slug: string, calendar: PlantCalendarEntry[]) {
  const months = new Set(calendar.map((entry) => entry.month));
  const missing = monthOrder.filter((month) => !months.has(month));
  if (missing.length > 0) {
    throw new Error(`Plant "${slug}" is missing calendar months: ${missing.join(", ")}`);
  }
}

export function normalizePlantCatalogItem(raw: PlantCatalogRaw): PlantCatalogItem {
  const calendar = readCalendarFromJson(raw.calendar);
  assertFullYearCalendar(raw.slug, calendar);

  return {
    ...raw,
    calendar,
    problems: raw.problems,
    risks: raw.risks ?? [],
    varieties: raw.varieties ?? [],
    careProfile: raw.careProfile ?? {},
    careGuide: raw.careGuide ?? {},
    signals: raw.signals ?? [],
    faqs: raw.faqs ?? [],
    appHints: raw.appHints ?? {},
    searchIntents: raw.searchIntents ?? [],
  };
}
