import type { AdviceArticle } from "@/lib/advice-types";
import type { Product } from "@/lib/shop-api";
import { searchProductsServer } from "@/lib/products-search";

/** Mapowanie tematu poradnika → zapytanie i kategoria sklepu */
const TOPIC_SHOP_HINTS: Record<string, { query: string; category?: string }> = {
  Trawnik: { query: "nawóz trawnik", category: "ziemie-i-nawozy" },
  Pielęgnacja: { query: "nawóz", category: "ziemie-i-nawozy" },
  "Choroby i szkodniki": { query: "nawóz", category: "ziemie-i-nawozy" },
  "Owoce w ogrodzie": { query: "borówka", category: "ziola" },
  "Rośliny ozdobne": { query: "lawenda", category: "balkon-i-taras" },
  "Rośliny domowe i balkonowe": { query: "pelargonia", category: "rosliny-domowe" },
  Warzywnik: { query: "bazylia", category: "ziola" },
  "Wysiew nasion i sadzenie": { query: "ziemia", category: "ziemie-i-nawozy" },
  "Przyroda w ogrodzie": { query: "donica", category: "donice-i-oslonki" },
  "Oczko wodne": { query: "nawadnianie", category: "nawadnianie" },
};

function dedupeProducts(products: Product[]) {
  const seen = new Set<string>();
  return products.filter((product) => {
    if (seen.has(product.variantId)) return false;
    seen.add(product.variantId);
    return true;
  });
}

export async function getAdviceRelatedProducts(article: AdviceArticle, limit = 3): Promise<Product[]> {
  const hint = TOPIC_SHOP_HINTS[article.topic];
  const keyword = article.seo.keywords?.[0] || "";
  const query = hint?.query || keyword || article.topic.split(" ")[0] || "ogród";

  const byTopic = await searchProductsServer({
    q: query,
    category: hint?.category || "all",
    stock: "in-stock",
    limit: 8,
  });

  if (byTopic.length >= limit) {
    return dedupeProducts(byTopic).slice(0, limit);
  }

  const fallback = await searchProductsServer({
    q: query,
    stock: "in-stock",
    limit: 8,
  });

  return dedupeProducts([...byTopic, ...fallback]).slice(0, limit);
}
