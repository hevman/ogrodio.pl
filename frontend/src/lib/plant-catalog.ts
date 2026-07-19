import { z } from "zod";
import {
  currentRomanMonth,
  getCatalogPlantByAppType,
  getPlantActionWindow,
  getPlantIntelligence,
  getActiveRisks as getSeasonalRisks,
} from "@/lib/plant-intelligence/engine";
import { normalizePlantCatalogItem } from "@/lib/plant-intelligence/normalize";
import { plantCatalogRawSchema, monthOrder, type PlantCatalogItem } from "@/lib/plant-intelligence/schema";
import { site } from "@/lib/site-config";

export type { PlantCatalogItem, PlantCalendarEntry, PlantRisk, PlantProblem, PlantVariety, RomanMonth } from "@/lib/plant-intelligence/schema";
export type PlantCalendarType = PlantCatalogItem["calendar"][number]["type"];

function backendUrl(): string {
  if (typeof window === "undefined") {
    return process.env.BACKEND_URL || site.publicUrl;
  }
  return "";
}

export function normalizePlantCatalog(raw: unknown): PlantCatalogItem[] {
  return z.array(plantCatalogRawSchema)
    .parse(Array.isArray(raw) ? raw : [])
    .map(normalizePlantCatalogItem)
    .sort((a, b) => a.name.localeCompare(b.name, "pl"));
}

export async function getPlantCatalog(): Promise<PlantCatalogItem[]> {
  try {
    const res = await fetch(`${backendUrl()}/api/plants`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return normalizePlantCatalog(await res.json());
  } catch (err) {
    console.warn("Failed to load plant catalog:", err);
    return [];
  }
}

export function getPlantGroups(plants: PlantCatalogItem[]) {
  return Array.from(new Set(plants.map((plant) => plant.group)));
}

export async function getPlantBySlug(slug: string) {
  const plants = await getPlantCatalog();
  return plants.find((plant) => plant.slug === slug);
}

export async function getPlantsByGroup(group: string) {
  const plants = await getPlantCatalog();
  return plants.filter((plant) => plant.group === group);
}

export async function getPlantByAppType(type: string) {
  const plants = await getPlantCatalog();
  return getCatalogPlantByAppType(type, plants);
}

export {
  currentRomanMonth,
  getPlantActionWindow,
  getPlantIntelligence,
  getSeasonalRisks,
  monthOrder,
};
