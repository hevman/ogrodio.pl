import type { AdviceArticle } from "@/lib/advice-types";
import { plantCatalog, type PlantCatalogItem } from "@/lib/plant-catalog";

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function hasWord(text: string, term: string) {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i").test(text);
}

function plantTerms(plant: PlantCatalogItem) {
  const terms = new Set<string>();
  const slugParts = plant.slug.split("-").filter((part) => part.length >= 4);

  terms.add(plant.slug);
  terms.add(normalizeText(plant.name));
  slugParts.forEach((part) => terms.add(part));

  if (plant.latinName) {
    normalizeText(plant.latinName)
      .split(/\s+/)
      .filter((part) => part.length >= 5)
      .forEach((part) => terms.add(part));
  }

  return Array.from(terms).filter((term) => term.length >= 4);
}

export function resolveRelatedPlantsForArticle(article: AdviceArticle, limit = 2) {
  const text = normalizeText([
    article.slug,
    article.title,
    article.summary,
    article.seo.title,
    article.seo.description,
    ...(article.seo.keywords || []),
  ].join(" "));

  return plantCatalog
    .map((plant) => {
      const score = plantTerms(plant).reduce((sum, term) => {
        if (!hasWord(text, normalizeText(term))) return sum;
        if (term === plant.slug || term === normalizeText(plant.name)) return sum + 4;
        return sum + 1;
      }, 0);

      return { plant, score };
    })
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score || a.plant.name.localeCompare(b.plant.name, "pl"))
    .slice(0, limit)
    .map((match) => match.plant);
}
