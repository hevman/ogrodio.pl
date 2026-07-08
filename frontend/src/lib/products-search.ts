import type { Product } from "@/lib/shop-api";

const meiliHost = process.env.MEILISEARCH_HOST || "http://127.0.0.1:7700";
const meiliKey = process.env.MEILISEARCH_MASTER_KEY || "garden-meili-local-key";
const indexName = "garden_products";

export type ProductSearchParams = {
  q?: string;
  category?: string;
  slug?: string;
  stock?: string;
  sort?: string;
  limit?: number;
};

export async function searchProductsServer(params: ProductSearchParams = {}): Promise<Product[]> {
  const {
    q = "",
    category = "all",
    slug = "",
    stock = "",
    sort = "recommended",
    limit = 100,
  } = params;

  const filters = [
    ...(category !== "all" ? [`category = "${category}"`] : []),
    ...(slug ? [`slug = "${slug}"`] : []),
    ...(stock === "in-stock" ? [`stock = "IN_STOCK"`] : []),
  ];

  const sortMap: Record<string, string[]> = {
    recommended: ["categorySort:asc", "name:asc"],
    "price-asc": ["price:asc"],
    "price-desc": ["price:desc"],
    name: ["name:asc"],
  };

  try {
    const response = await fetch(`${meiliHost}/indexes/${indexName}/search`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${meiliKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: slug ? "" : q,
        limit,
        filter: filters.length ? filters : undefined,
        sort: sortMap[sort] || sortMap.recommended,
      }),
      next: { revalidate: 300 },
    });

    if (!response.ok) return [];
    const data = await response.json();
    return (data.hits || []) as Product[];
  } catch {
    return [];
  }
}
