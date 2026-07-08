import { Suspense } from "react";
import { t } from "@/i18n";
import { ShopSearchPage } from "@/components/shop/shop-search-page";

export const metadata = {
  title: t("pages.searchMetaTitle"),
  description: t("pages.searchMetaDescription"),
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ShopSearchPage />
    </Suspense>
  );
}
