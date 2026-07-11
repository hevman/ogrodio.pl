import type { Product } from "@/lib/shop-api";
import { formatMoney, t } from "@/i18n";

export const categoryImages: Record<string, string> = {
  ebooki: "/products/ebook-borowki-cover.jpg",
  ziola: "/products/herbs-real.jpg",
  "balkon-i-taras": "/products/balcony-real.jpg",
  "rosliny-domowe": "/products/houseplants-real.jpg",
  "ziemie-i-nawozy": "/products/garden-products-real.jpg",
  "donice-i-oslonki": "/products/garden-products-real.jpg",
  nawadnianie: "/products/garden-products-real.jpg",
  produkty: "/products/garden-products-real.jpg",
};

export const departmentHighlights = [
  { label: "E-booki", query: "ebooki", image: categoryImages.ebooki },
  { label: t("shop.departments.herbs"), query: "ziola", image: categoryImages.ziola },
  { label: t("shop.departments.balcony"), query: "balkon-i-taras", image: categoryImages["balkon-i-taras"] },
  { label: t("shop.departments.houseplants"), query: "rosliny-domowe", image: categoryImages["rosliny-domowe"] },
  { label: t("shop.departments.soil"), query: "ziemie-i-nawozy", image: categoryImages["ziemie-i-nawozy"] },
  { label: t("shop.departments.pots"), query: "donice-i-oslonki", image: categoryImages["donice-i-oslonki"] },
  { label: t("shop.departments.irrigation"), query: "nawadnianie", image: categoryImages.nawadnianie },
] as const;

export { formatMoney as money };

export function stockLabel(stock: string) {
  if (stock === "IN_STOCK") return t("common.stockAvailable");
  if (stock === "OUT_OF_STOCK") return t("common.stockOut");
  return stock.toLowerCase().replaceAll("_", " ");
}

export function productImage(product: Product) {
  return product.image || categoryImages[product.category] || categoryImages.produkty;
}

export const shopDepartments = [
  { label: "E-booki", href: "/szukaj?category=ebooki" },
  { label: t("header.departments.herbs"), href: "/szukaj?category=ziola" },
  { label: t("header.departments.balcony"), href: "/szukaj?category=balkon-i-taras" },
  { label: t("header.departments.houseplants"), href: "/szukaj?category=rosliny-domowe" },
  { label: t("header.departments.soil"), href: "/szukaj?category=ziemie-i-nawozy" },
  { label: t("header.departments.pots"), href: "/szukaj?category=donice-i-oslonki" },
  { label: t("header.departments.irrigation"), href: "/szukaj?category=nawadnianie" },
] as const;
