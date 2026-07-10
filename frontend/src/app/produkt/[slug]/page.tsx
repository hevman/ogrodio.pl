import { ProductPage } from "@/components/shop/product-page";
import { shopIndexingEnabled } from "@/lib/seo/shop-indexing";

export const metadata = {
  title: "Produkt | Ogrodio Sklep",
  description: "Szczegoly produktu w sklepie Ogrodio.",
  robots: { index: shopIndexingEnabled, follow: shopIndexingEnabled },
};

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ProductPage slug={slug} />;
}
