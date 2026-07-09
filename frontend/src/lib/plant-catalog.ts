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

export type PlantDifficulty = "łatwa" | "średnia" | "wymagająca";
export type PlantCalendarType = "start" | "care" | "harvest";

export type PlantCatalogItem = {
  slug: string;
  appAliases?: string[];
  name: string;
  latinName: string;
  group: string;
  image: string;
  imageAlt: string;
  summary: string;
  difficulty: PlantDifficulty;
  sun: string;
  soil: string;
  water: string;
  spacing: string;
  harvest: string;
  tags: string[];
  calendar: {
    month: string;
    task: string;
    type: PlantCalendarType;
  }[];
  problems: string[];
  relatedArticles: {
    title: string;
    href: string;
  }[];
};

export const plantCatalog = [
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
] as PlantCatalogItem[];

export const plantGroups = Array.from(new Set(plantCatalog.map((plant) => plant.group)));

export function getPlantBySlug(slug: string) {
  return plantCatalog.find((plant) => plant.slug === slug);
}

export function getPlantsByGroup(group: string) {
  return plantCatalog.filter((plant) => plant.group === group);
}
