import { NextRequest, NextResponse } from "next/server";
import { t } from "@/i18n";
import { searchProductsServer } from "@/lib/products-search";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") || "";
  const category = request.nextUrl.searchParams.get("category") || "all";
  const slug = request.nextUrl.searchParams.get("slug") || "";
  const stock = request.nextUrl.searchParams.get("stock") || "";
  const sort = request.nextUrl.searchParams.get("sort") || "recommended";
  const maxPrice = request.nextUrl.searchParams.get("maxPrice") || "";
  const priceFrom = request.nextUrl.searchParams.get("priceFrom") || "";
  const priceTo = request.nextUrl.searchParams.get("priceTo") || "";
  const brand = request.nextUrl.searchParams.get("brand") || "";
  const promo = request.nextUrl.searchParams.get("promo") || "";

  try {
    let products = await searchProductsServer({
      q: query,
      category,
      slug,
      stock,
      sort,
      limit: 100,
    });

    if (maxPrice) {
      const max = Number(maxPrice) || 0;
      products = products.filter((p) => p.price <= max);
    }
    if (priceFrom) {
      const min = Number(priceFrom) || 0;
      products = products.filter((p) => p.price >= min);
    }
    if (priceTo) {
      const max = Number(priceTo) || 0;
      products = products.filter((p) => p.price <= max);
    }
    if (brand) {
      products = products.filter((p) => p.brand === brand);
    }
    if (promo === "true") {
      products = products.filter((p) => p.isPromotion);
    }

    return NextResponse.json({
      products,
      total: products.length,
      facets: {},
    });
  } catch {
    return NextResponse.json({ error: t("common.searchError") }, { status: 500 });
  }
}
