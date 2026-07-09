import { z } from "zod";
import agrest from "@/content/plants/agrest.json";
import borowkaAmerykanska from "@/content/plants/borowka-amerykanska.json";
import cukinia from "@/content/plants/cukinia.json";
import czarnaPorzeczka from "@/content/plants/czarna-porzeczka.json";
import hortensja from "@/content/plants/hortensja.json";
import jablon from "@/content/plants/jablon.json";
import jagodaKamczacka from "@/content/plants/jagoda-kamczacka.json";
import kaktusy from "@/content/plants/kaktusy.json";
import lawenda from "@/content/plants/lawenda.json";
import malina from "@/content/plants/malina.json";
import oliwka from "@/content/plants/oliwka.json";
import pietruszka from "@/content/plants/pietruszka.json";
import pomidorKoktajlowy from "@/content/plants/pomidor-koktajlowy.json";
import rozaPnaca from "@/content/plants/roza-pnaca.json";
import salataLisciowa from "@/content/plants/salata-lisciowa.json";
import sosnaGorskaMugo from "@/content/plants/sosna-gorska-mugo.json";
import truskawka from "@/content/plants/truskawka.json";
import tuja from "@/content/plants/tuja.json";
import tymianek from "@/content/plants/tymianek.json";
import winorosl from "@/content/plants/winorosl.json";

const plantCalendarSchema = z.object({
  month: z.string(),
  task: z.string(),
  type: z.enum(["start", "care", "harvest"]),
});

const plantRelatedArticleSchema = z.object({
  title: z.string(),
  href: z.string(),
});

const plantCatalogItemSchema = z.object({
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
  calendar: z.array(plantCalendarSchema),
  problems: z.array(z.string()),
  relatedArticles: z.array(plantRelatedArticleSchema),
});

export type PlantCatalogItem = z.infer<typeof plantCatalogItemSchema>;
export type PlantCalendarType = PlantCatalogItem["calendar"][number]["type"];

const rawPlantCatalog = [
  truskawka,
  borowkaAmerykanska,
  pomidorKoktajlowy,
  cukinia,
  lawenda,
  hortensja,
  rozaPnaca,
  tuja,
  jablon,
  malina,
  agrest,
  czarnaPorzeczka,
  jagodaKamczacka,
  winorosl,
  oliwka,
  tymianek,
  salataLisciowa,
  pietruszka,
  kaktusy,
  sosnaGorskaMugo,
] as unknown[];

export const plantCatalog = z.array(plantCatalogItemSchema).parse(rawPlantCatalog);

export const plantGroups = Array.from(new Set(plantCatalog.map((plant) => plant.group)));

export const monthOrder = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"] as const;

export function getPlantBySlug(slug: string) {
  return plantCatalog.find((plant) => plant.slug === slug);
}

export function getPlantsByGroup(group: string) {
  return plantCatalog.filter((plant) => plant.group === group);
}

export function currentRomanMonth(date = new Date()) {
  return monthOrder[date.getMonth()];
}

export function getPlantActionWindow(plant: PlantCatalogItem, date = new Date()) {
  const current = currentRomanMonth(date);
  const currentIndex = monthOrder.indexOf(current);
  const now = plant.calendar.filter((entry) => entry.month === current);
  if (now.length > 0) {
    return { label: `Teraz (${current})`, entries: now, mode: "current" as const };
  }

  const sorted = plant.calendar
    .map((entry) => ({ entry, index: monthOrder.indexOf(entry.month as (typeof monthOrder)[number]) }))
    .filter((item) => item.index >= 0)
    .sort((a, b) => a.index - b.index);
  const next = sorted.find((item) => item.index >= currentIndex) || sorted[0];

  return {
    label: next ? `Najbliżej (${next.entry.month})` : "Najbliższe zadania",
    entries: next ? plant.calendar.filter((entry) => entry.month === next.entry.month) : [],
    mode: "next" as const,
  };
}

export function getSeasonalRisks(plant: PlantCatalogItem, date = new Date()) {
  const month = date.getMonth() + 1;
  const text = `${plant.summary} ${plant.water} ${plant.problems.join(" ")}`.toLowerCase();
  const risks: { level: "wysokie" | "średnie"; title: string; detail: string }[] = [];

  if (month >= 6 && month <= 8 && /(upał|suszy|przesych|gorzkn|pęd kwiatowy|słoń)/.test(text)) {
    risks.push({
      level: "wysokie",
      title: "Ryzyko letniego stresu",
      detail: "W upały pilnuj porannego podlewania, ściółki i lekkiego cienia dla wrażliwych roślin.",
    });
  }

  if ((month <= 4 || month >= 10) && /(przymro|mroz|zimow|okry|chłod)/.test(text)) {
    risks.push({
      level: "średnie",
      title: "Ryzyko chłodu i przymrozków",
      detail: "Przy spadkach temperatury warto zabezpieczyć młode rośliny albo opóźnić sadzenie.",
    });
  }

  if (/mszyc|mączniak|pleśń|plam|szkodnik|chorob/.test(text)) {
    risks.push({
      level: "średnie",
      title: "Kontrola zdrowotna",
      detail: "Raz w tygodniu obejrzyj liście, pędy i nowe przyrosty. Wczesna reakcja zwykle wystarcza.",
    });
  }

  return risks.slice(0, 3);
}

export function getPlantIntelligence(plant: PlantCatalogItem, date = new Date()) {
  return {
    actionWindow: getPlantActionWindow(plant, date),
    appPlantType: plant.slug,
    appTaskCount: plant.calendar.length,
    seasonalRisks: getSeasonalRisks(plant, date),
    searchTopics: Array.from(new Set([
      `${plant.name} uprawa`,
      `${plant.name} wymagania`,
      `${plant.name} podlewanie`,
      ...plant.problems.map((problem) => `${plant.name} ${problem.toLowerCase()}`),
    ])).slice(0, 6),
  };
}
