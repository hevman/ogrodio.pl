import type { Metadata } from "next";
import { ProductPage } from "@/components/shop/product-page";
import { productImage } from "@/components/shop/shop-shared";
import { shopIndexingEnabled } from "@/lib/seo/shop-indexing";
import { searchProductsServer } from "@/lib/products-search";
import { site } from "@/lib/site-config";

type Props = { params: Promise<{ slug: string }> };

async function getProduct(slug: string) {
  const products = await searchProductsServer({ slug, limit: 1 });
  return products[0] || null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  const title = product ? `${product.name} | Ogrodio Sklep` : "Produkt | Ogrodio Sklep";
  const description = product?.description || "Szczegóły produktu w sklepie Ogrodio.";
  const url = `${site.shopUrl.replace(/\/$/, "")}/produkt/${slug}`;
  const imagePath = product ? productImage(product) : "/icon-512.png";
  const image = imagePath.startsWith("http") ? imagePath : `${site.shopUrl.replace(/\/$/, "")}${imagePath}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: { index: shopIndexingEnabled, follow: shopIndexingEnabled },
    openGraph: {
      title,
      description,
      type: "website",
      url,
      siteName: "Ogrodio Sklep",
      images: [{ url: image, alt: product?.name || "Ogrodio Sklep" }],
    },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);
  const productJsonLd = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.description,
        image: `${site.shopUrl.replace(/\/$/, "")}${productImage(product)}`,
        sku: product.sku,
        brand: { "@type": "Brand", name: product.brand || "Ogrodio" },
        offers: {
          "@type": "Offer",
          availability: product.stock === "IN_STOCK" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          price: product.price.toFixed(2),
          priceCurrency: "PLN",
          url: `${site.shopUrl.replace(/\/$/, "")}/produkt/${slug}`,
        },
      }
    : null;

  return (
    <>
      {productJsonLd ? (
        <script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
          type="application/ld+json"
        />
      ) : null}
      <ProductPage slug={slug} />
    </>
  );
}
