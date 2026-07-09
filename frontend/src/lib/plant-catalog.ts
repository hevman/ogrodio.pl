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
import {
  currentRomanMonth,
  getCatalogPlantByAppType,
  getPlantActionWindow,
  getPlantIntelligence,
  getActiveRisks as getSeasonalRisks,
} from "@/lib/plant-intelligence/engine";
import { normalizePlantCatalogItem } from "@/lib/plant-intelligence/normalize";
import { plantCatalogRawSchema, monthOrder, type PlantCatalogItem } from "@/lib/plant-intelligence/schema";

export type { PlantCatalogItem, PlantCalendarEntry, PlantRisk, PlantProblem, PlantVariety, RomanMonth } from "@/lib/plant-intelligence/schema";
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

export const plantCatalog: PlantCatalogItem[] = z.array(plantCatalogRawSchema)
  .parse(rawPlantCatalog)
  .map(normalizePlantCatalogItem);

export const plantGroups = Array.from(new Set(plantCatalog.map((plant) => plant.group)));

export function getPlantBySlug(slug: string) {
  return plantCatalog.find((plant) => plant.slug === slug);
}

export function getPlantsByGroup(group: string) {
  return plantCatalog.filter((plant) => plant.group === group);
}

export function getPlantByAppType(type: string) {
  return getCatalogPlantByAppType(type, plantCatalog);
}

export {
  currentRomanMonth,
  getPlantActionWindow,
  getPlantIntelligence,
  getSeasonalRisks,
  monthOrder,
};
