import { t } from "@/i18n";
import { ShopPage } from "@/components/shop/shop-page";
import { shopIndexingEnabled } from "@/lib/seo/shop-indexing";
import { fetchShopHomeProducts } from "@/lib/shop-api";

export const metadata = {
  title: t("pages.shopMetaTitle"),
  description: t("pages.shopMetaDescription"),
  robots: { index: shopIndexingEnabled, follow: shopIndexingEnabled },
};

export const revalidate = 300;

export default async function Page() {
  const products = await fetchShopHomeProducts();
  const status = products.length ? "" : t("shop.noProducts");

  return <ShopPage products={products} status={status} />;
}
