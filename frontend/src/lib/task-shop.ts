import type { Product } from "@/lib/shop-api";
import { searchProductsServer } from "@/lib/products-search";

type TaskShopHint = { query: string; category?: string };

const KIND_HINTS: Record<string, TaskShopHint> = {
  watering: { query: "nawadnianie", category: "nawadnianie" },
  fertilizing: { query: "nawóz", category: "ziemie-i-nawozy" },
  cutting: { query: "sekator", category: "narzedzia-ogrodnicze" },
  inspection: { query: "nawóz", category: "ziemie-i-nawozy" },
  protection: { query: "agrowłóknina", category: "narzedzia-ogrodnicze" },
  custom: { query: "ogród", category: "all" },
};

const PLANT_HINTS: Record<string, TaskShopHint> = {
  borowka: { query: "borówka", category: "ziola" },
  agrest: { query: "agrest", category: "ziola" },
  porzeczka: { query: "porzeczka", category: "ziola" },
  "jagoda-kamczacka": { query: "jagoda", category: "ziola" },
  trawnik: { query: "nawóz trawnik", category: "ziemie-i-nawozy" },
  "czeresnia-wisnia": { query: "nawóz drzew", category: "ziemie-i-nawozy" },
};

export type TaskProductRequest = {
  id: string;
  kind?: string;
  plantType?: string;
};

function hintForTask(kind?: string, plantType?: string): TaskShopHint {
  if (plantType && PLANT_HINTS[plantType]) return PLANT_HINTS[plantType];
  if (kind && KIND_HINTS[kind]) return KIND_HINTS[kind];
  return { query: "ogród", category: "all" };
}

function cacheKey(kind?: string, plantType?: string) {
  return `${kind || "custom"}:${plantType || "general"}`;
}

export async function getTaskRelatedProducts(kind?: string, plantType?: string, limit = 2): Promise<Product[]> {
  const hint = hintForTask(kind, plantType);
  const products = await searchProductsServer({
    q: hint.query,
    category: hint.category || "all",
    stock: "in-stock",
    limit: 6,
  });
  return products.slice(0, limit);
}

export async function getTaskProductsMap(tasks: TaskProductRequest[], limit = 2) {
  const uniqueKeys = new Map<string, TaskShopHint>();
  for (const task of tasks) {
    uniqueKeys.set(cacheKey(task.kind, task.plantType), hintForTask(task.kind, task.plantType));
  }

  const resolved = new Map<string, Product[]>();
  await Promise.all(
    [...uniqueKeys.entries()].map(async ([key, hint]) => {
      const products = await searchProductsServer({
        q: hint.query,
        category: hint.category || "all",
        stock: "in-stock",
        limit: 6,
      });
      resolved.set(key, products.slice(0, limit));
    }),
  );

  const result: Record<string, Product[]> = {};
  for (const task of tasks) {
    result[task.id] = resolved.get(cacheKey(task.kind, task.plantType)) || [];
  }
  return result;
}
