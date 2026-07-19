import type { AdviceArticle } from "@/lib/advice-types";
import type { Product } from "@/lib/shop-api";
import { searchProductsServer } from "@/lib/products-search";

const PRODUCT_TOPIC_TERMS: Record<string, string[]> = {
  "borowki-bez-bledow-ebook": [
    "borowka",
    "borowki",
    "borowek",
    "blueberry",
    "kwasna gleba",
    "ph gleby",
    "chloroza borowki",
  ],
  "pomidory-bez-bledow-ebook": [
    "pomidor",
    "pomidory",
    "pomidorow",
    "rozsada pomidora",
    "zaraza ziemniaczana",
    "tunel foliowy",
    "wilki pomidora",
  ],
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function articleHaystack(article: AdviceArticle) {
  return normalize(
    [
      article.title,
      article.topic,
      article.summary,
      article.seo?.title,
      article.seo?.description,
      ...(article.seo?.keywords ?? []),
      ...article.sections.flatMap((section) => [section.heading, ...section.paragraphs]),
      ...(article.faq ?? []).flatMap((item) => [item.question, item.answer]),
    ]
      .filter(Boolean)
      .join(" "),
  );
}

function dedupeProducts(products: Product[]) {
  const seen = new Set<string>();
  return products.filter((product) => {
    if (seen.has(product.variantId)) return false;
    seen.add(product.variantId);
    return true;
  });
}

function isExplicitProduct(product: Product, explicitIds: Set<string>) {
  return [product.slug, product.variantId, product.id, product.sku]
    .filter(Boolean)
    .some((value) => explicitIds.has(String(value)));
}

function isRelevantProduct(product: Product, haystack: string) {
  const terms = PRODUCT_TOPIC_TERMS[product.slug];
  if (!terms?.length) return false;

  return terms.some((term) => haystack.includes(normalize(term)));
}

export async function getAdviceRelatedProducts(article: AdviceArticle, limit = 3): Promise<Product[]> {
  const products = await searchProductsServer({
    stock: "in-stock",
    limit: 100,
  });

  if (!products.length) return [];

  const explicitIds = new Set((article.relatedProductIds ?? []).map((id) => String(id)));
  const haystack = articleHaystack(article);

  const explicitProducts = products.filter((product) => isExplicitProduct(product, explicitIds));
  const automaticProducts = products.filter((product) => {
    if (isExplicitProduct(product, explicitIds)) return false;
    return isRelevantProduct(product, haystack);
  });

  return dedupeProducts([...explicitProducts, ...automaticProducts]).slice(0, limit);
}
