import { z } from "zod";

export const monthOrder = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"] as const;

export type RomanMonth = (typeof monthOrder)[number];

export const romanMonthSchema = z.enum(monthOrder);

export const plantTaskTypeSchema = z.enum(["start", "care", "harvest"]);

export const plantWeekSchema = z.enum(["1", "2", "3", "4", "1-2", "3-4", "cały"]).nullable().optional();

export const plantCalendarTaskSchema = z.object({
  task: z.string().min(1),
  type: plantTaskTypeSchema,
  week: plantWeekSchema,
  articleHref: z.string().nullable().optional(),
  shopHints: z.array(z.string()).optional(),
});

export const plantCalendarMonthSchema = z.object({
  month: romanMonthSchema,
  tasks: z.array(plantCalendarTaskSchema).min(1),
});

export type PlantCalendarMonth = z.infer<typeof plantCalendarMonthSchema>;

export const plantRiskSchema = z.object({
  title: z.string(),
  months: z.array(romanMonthSchema).min(1),
  urgency: z.enum(["wysokie", "średnie", "niskie"]),
  symptom: z.string(),
  action: z.string(),
  articleHref: z.string().nullable().optional(),
});

export const plantProblemSchema = z.object({
  symptom: z.string(),
  months: z.array(romanMonthSchema).optional(),
  articleHref: z.string().nullable().optional(),
});

export const plantVarietySchema = z.object({
  name: z.string(),
  harvest: z.string(),
  notes: z.string().optional(),
});

export const plantRelatedArticleSchema = z.object({
  title: z.string(),
  href: z.string(),
});

export const plantCatalogRawSchema = z.object({
  slug: z.string(),
  appAliases: z.array(z.string()).optional(),
  name: z.string(),
  latinName: z.string(),
  group: z.string(),
  image: z.string(),
  imageAlt: z.string(),
  summary: z.string(),
  difficulty: z.enum(["łatwa", "średnia", "wymagająca"]),
  sun: z.string(),
  soil: z.string(),
  water: z.string(),
  spacing: z.string(),
  harvest: z.string(),
  tags: z.array(z.string()),
  calendar: z.array(plantCalendarMonthSchema).length(12),
  problems: z.array(plantProblemSchema),
  risks: z.array(plantRiskSchema).optional().default([]),
  varieties: z.array(plantVarietySchema).optional().default([]),
  relatedArticles: z.array(plantRelatedArticleSchema),
});

export type PlantCalendarTask = z.infer<typeof plantCalendarTaskSchema>;
export type PlantCalendarEntry = PlantCalendarTask & { month: RomanMonth };
export type PlantRisk = z.infer<typeof plantRiskSchema>;
export type PlantProblem = z.infer<typeof plantProblemSchema>;
export type PlantVariety = z.infer<typeof plantVarietySchema>;
export type PlantCatalogRaw = z.infer<typeof plantCatalogRawSchema>;

export type PlantCatalogItem = Omit<PlantCatalogRaw, "calendar" | "problems"> & {
  calendar: PlantCalendarEntry[];
  problems: PlantProblem[];
};
