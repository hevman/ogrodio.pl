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

export const plantCareProfileSchema = z.object({
  soilPh: z.string().optional(),
  height: z.string().optional(),
  lifeCycle: z.string().optional(),
  hardiness: z.string().optional(),
  container: z.string().optional(),
  goodFor: z.array(z.string()).optional().default([]),
  avoid: z.array(z.string()).optional().default([]),
}).optional().default({ goodFor: [], avoid: [] });

export const plantCareGuideSchema = z.object({
  sowingOrPlanting: z.string().optional(),
  watering: z.string().optional(),
  feeding: z.string().optional(),
  pruning: z.string().optional(),
  wintering: z.string().optional(),
  harvest: z.string().optional(),
}).optional().default({});

export const plantSignalSchema = z.object({
  title: z.string(),
  means: z.string(),
  action: z.string(),
  months: z.array(romanMonthSchema).optional(),
  articleHref: z.string().nullable().optional(),
});

export const plantFaqSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

export const plantAppHintSchema = z.object({
  reminderLeadDays: z.number().int().min(0).max(21).optional(),
  defaultPriority: z.enum(["low", "medium", "high"]).optional(),
  journalPrompts: z.array(z.string()).optional().default([]),
}).optional().default({ journalPrompts: [] });

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
  careProfile: plantCareProfileSchema,
  careGuide: plantCareGuideSchema,
  signals: z.array(plantSignalSchema).optional().default([]),
  faqs: z.array(plantFaqSchema).optional().default([]),
  appHints: plantAppHintSchema,
  searchIntents: z.array(z.string()).optional().default([]),
  relatedArticles: z.array(plantRelatedArticleSchema),
});

export type PlantCalendarTask = z.infer<typeof plantCalendarTaskSchema>;
export type PlantCalendarEntry = PlantCalendarTask & { month: RomanMonth };
export type PlantRisk = z.infer<typeof plantRiskSchema>;
export type PlantProblem = z.infer<typeof plantProblemSchema>;
export type PlantVariety = z.infer<typeof plantVarietySchema>;
export type PlantCareProfile = z.infer<typeof plantCareProfileSchema>;
export type PlantCareGuide = z.infer<typeof plantCareGuideSchema>;
export type PlantSignal = z.infer<typeof plantSignalSchema>;
export type PlantFaq = z.infer<typeof plantFaqSchema>;
export type PlantAppHint = z.infer<typeof plantAppHintSchema>;
export type PlantCatalogRaw = z.infer<typeof plantCatalogRawSchema>;

export type PlantCatalogItem = Omit<PlantCatalogRaw, "calendar" | "problems"> & {
  calendar: PlantCalendarEntry[];
  problems: PlantProblem[];
};
