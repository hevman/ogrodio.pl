import { ProductPage } from "@/components/shop/product-page";

export const metadata = {
  title: "Produkt | Ogrodio Sklep",
  description: "Szczegoly produktu w sklepie Ogrodio.",
  robots: { index: false, follow: false },
};

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ProductPage slug={slug} />;
}
