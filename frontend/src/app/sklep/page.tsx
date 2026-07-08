import { t } from "@/i18n";
import { ShopPage } from "@/components/shop/shop-page";

export const metadata = {
  title: t("pages.shopMetaTitle"),
  description: t("pages.shopMetaDescription"),
  robots: { index: false, follow: false },
};

export default function Page() {
  return <ShopPage />;
}
