import { t } from "@/i18n";

export type Product = {
  id: string;
  variantId: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  categoryLabel: string;
  price: number;
  stock: string;
  sku?: string;
  image?: string;
  brand?: string;
  badge?: string;
  oldPrice?: number | null;
  rating?: number;
  reviewsCount?: number;
  isPromotion?: boolean;
  isNew?: boolean;
  isBestseller?: boolean;
  deliveryTag?: string;
};

export type CartItem = {
  productVariantId: string;
  quantity: number;
};

export type ShippingMethod = {
  id: string;
  code: string;
  name: string;
  description: string;
  price: number;
};

export type PaymentMethod = {
  code: string;
  name: string;
  description: string;
};

export type CheckoutAddress = {
  fullName: string;
  emailAddress: string;
  phoneNumber: string;
  streetLine1: string;
  city: string;
  postalCode: string;
};

export type CheckoutSummary = {
  id: string;
  code: string;
  state: string;
  totalWithTax: number;
  subTotalWithTax: number;
  shippingWithTax: number;
};

export type FavoriteProduct = {
  productVariantId: string;
  slug: string;
  name: string;
  image?: string;
  createdAt?: string;
};

type VendureProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  featuredAsset?: { preview: string } | null;
  facetValues?: Array<{ id: string; name: string; code: string; facet: { code: string; name: string } }>;
  variants: Array<{
    id: string;
    name: string;
    priceWithTax: number;
    stockLevel: string;
  }>;
};

type VendureResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

function resolveShopApiUrl() {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_VENDURE_SHOP_API_URL || "/shop-api";
  }
  return (
    process.env.VENDURE_SHOP_API_URL ||
    process.env.NEXT_PUBLIC_VENDURE_SHOP_API_URL ||
    "http://commerce-server:3000/shop-api"
  );
}

function shopApiHeaders(): HeadersInit {
  const host = process.env.VENDURE_SHOP_HOST;
  return host ? { Host: host } : {};
}

export async function vendureShop<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const response = await fetch(resolveShopApiUrl(), {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...shopApiHeaders(),
    },
    body: JSON.stringify({ query, variables }),
    ...(typeof window === "undefined" ? { next: { revalidate: 300 } } : {}),
  });
  const payload = (await response.json().catch(() => ({}))) as VendureResponse<T>;
  if (!response.ok || payload.errors?.length) {
    throw new Error(payload.errors?.[0]?.message || t("common.vendureQueryError"));
  }
  return payload.data as T;
}

export async function fetchShopHomeProducts(): Promise<Product[]> {
  const { searchProductsServer } = await import("@/lib/products-search");
  return searchProductsServer({ limit: 24, stock: "in-stock" });
}

export async function fetchProducts(): Promise<Product[]> {
  const data = await vendureShop<{
    products: { items: VendureProduct[] };
  }>(`
    query Products {
      products(options: { take: 100 }) {
        items {
          id
          slug
          name
          description
          featuredAsset {
            preview
          }
          facetValues {
            id
            name
            code
            facet {
              code
              name
            }
          }
          variants {
            id
            name
            priceWithTax
            stockLevel
          }
        }
      }
    }
  `);

  return data.products.items.flatMap((product) => {
    const category = product.facetValues?.find((value) => value.facet.code === "garden-category");
    return product.variants.map((variant) => ({
      id: product.id,
      variantId: variant.id,
      slug: product.slug,
      name: product.variants.length > 1 ? `${product.name} - ${variant.name}` : product.name,
      description: product.description || t("shop.product.defaultDescription"),
      category: category?.code || "produkty",
      categoryLabel: category?.name || t("shop.product.defaultCategory"),
      price: variant.priceWithTax / 100,
      stock: variant.stockLevel,
      image: product.featuredAsset?.preview,
    }));
  });
}

export async function searchProducts(query = "", category = "all", options: { sort?: string; stock?: string; maxPrice?: string; priceFrom?: string; priceTo?: string; brand?: string; promo?: string; rating?: string } = {}): Promise<Product[]> {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (category !== "all") params.set("category", category);
  if (options.sort) params.set("sort", options.sort);
  if (options.stock) params.set("stock", options.stock);
  if (options.maxPrice) params.set("maxPrice", options.maxPrice);
  if (options.priceFrom) params.set("priceFrom", options.priceFrom);
  if (options.priceTo) params.set("priceTo", options.priceTo);
  if (options.brand) params.set("brand", options.brand);
  if (options.promo) params.set("promo", options.promo);
  if (options.rating) params.set("rating", options.rating);

  const response = await fetch(`/api/search?${params.toString()}`, {
    cache: "no-store",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || t("common.searchError"));
  }
  return data.products as Product[];
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const params = new URLSearchParams({ slug });
  const response = await fetch(`/api/search?${params.toString()}`, {
    cache: "no-store",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || t("common.fetchProductFailed"));
  }
  return (data.products?.[0] as Product | undefined) || null;
}

async function backendJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    ...init,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || data.error || t("common.backendApiError"));
  }
  return data as T;
}

export async function fetchFavorites(): Promise<FavoriteProduct[]> {
  const data = await backendJson<{ favorites: FavoriteProduct[] }>("/api/shop/favorites");
  return data.favorites;
}

export async function addFavorite(product: Product): Promise<FavoriteProduct> {
  const data = await backendJson<{ favorite: FavoriteProduct }>("/api/shop/favorites", {
    method: "POST",
    body: JSON.stringify({
      productVariantId: product.variantId,
      slug: product.slug,
      name: product.name,
      image: product.image || "",
    }),
  });
  return data.favorite;
}

export async function removeFavorite(productVariantId: string) {
  return backendJson<{ ok: boolean }>(`/api/shop/favorites/${encodeURIComponent(productVariantId)}`, {
    method: "DELETE",
  });
}

export async function addItemToVendureOrder(productVariantId: string, quantity: number) {
  return vendureShop<{
    addItemToOrder:
      | { __typename: "Order"; id: string; code: string; totalWithTax: number }
      | { __typename: string; message: string };
  }>(
    `
      mutation AddItemToOrder($productVariantId: ID!, $quantity: Int!) {
        addItemToOrder(productVariantId: $productVariantId, quantity: $quantity) {
          __typename
          ... on Order {
            id
            code
            totalWithTax
          }
          ... on ErrorResult {
            message
          }
        }
      }
    `,
    { productVariantId, quantity },
  );
}

const orderFragment = `
  id
  code
  state
  totalWithTax
  subTotalWithTax
  shippingWithTax
`;

function normalizeOrder(order: CheckoutSummary): CheckoutSummary {
  return {
    ...order,
    totalWithTax: order.totalWithTax / 100,
    subTotalWithTax: order.subTotalWithTax / 100,
    shippingWithTax: order.shippingWithTax / 100,
  };
}

export async function syncVendureCart(items: CartItem[]) {
  await vendureShop<{ removeAllOrderLines: { __typename: string } }>(`
    mutation RemoveAllOrderLines {
      removeAllOrderLines {
        __typename
      }
    }
  `).catch(() => null);

  for (const item of items) {
    await addItemToVendureOrder(item.productVariantId, item.quantity);
  }
}

export async function activeOrder(): Promise<CheckoutSummary | null> {
  const data = await vendureShop<{ activeOrder: CheckoutSummary | null }>(`
    query ActiveOrder {
      activeOrder {
        ${orderFragment}
      }
    }
  `);
  return data.activeOrder ? normalizeOrder(data.activeOrder) : null;
}

export async function eligibleShippingMethods(): Promise<ShippingMethod[]> {
  const data = await vendureShop<{
    eligibleShippingMethods: Array<{ id: string; code: string; name: string; description: string; priceWithTax: number }>;
  }>(`
    query EligibleShippingMethods {
      eligibleShippingMethods {
        id
        code
        name
        description
        priceWithTax
      }
    }
  `);
  return data.eligibleShippingMethods.map((method) => ({
    id: method.id,
    code: method.code,
    name: method.name,
    description: method.description,
    price: method.priceWithTax / 100,
  }));
}

export async function eligiblePaymentMethods(): Promise<PaymentMethod[]> {
  const data = await vendureShop<{ eligiblePaymentMethods: PaymentMethod[] }>(`
    query EligiblePaymentMethods {
      eligiblePaymentMethods {
        code
        name
        description
      }
    }
  `);
  return data.eligiblePaymentMethods;
}

export async function completeVendureCheckout(input: {
  address: CheckoutAddress;
  shippingMethodId: string;
  paymentMethodCode: string;
}) {
  const customer = await vendureShop<{
    setCustomerForOrder: { __typename: string; message?: string };
  }>(
    `
      mutation SetCustomerForOrder($input: CreateCustomerInput!) {
        setCustomerForOrder(input: $input) {
          __typename
          ... on Order {
            id
          }
          ... on ErrorResult {
            message
          }
        }
      }
    `,
    {
      input: {
        firstName: input.address.fullName.split(" ")[0] || input.address.fullName,
        lastName: input.address.fullName.split(" ").slice(1).join(" ") || "-",
        emailAddress: input.address.emailAddress,
        phoneNumber: input.address.phoneNumber,
      },
    },
  );
  if (customer.setCustomerForOrder.__typename !== "Order") {
    throw new Error(customer.setCustomerForOrder.message || t("common.setCustomerFailed"));
  }

  const addressInput = {
    fullName: input.address.fullName,
    streetLine1: input.address.streetLine1,
    city: input.address.city,
    postalCode: input.address.postalCode,
    countryCode: "PL",
    phoneNumber: input.address.phoneNumber,
  };

  await vendureShop(`
    mutation SetOrderShippingAddress($input: CreateAddressInput!) {
      setOrderShippingAddress(input: $input) {
        __typename
        ... on Order {
          id
        }
        ... on ErrorResult {
          message
        }
      }
    }
  `, { input: addressInput });

  await vendureShop(`
    mutation SetOrderBillingAddress($input: CreateAddressInput!) {
      setOrderBillingAddress(input: $input) {
        __typename
        ... on Order {
          id
        }
        ... on ErrorResult {
          message
        }
      }
    }
  `, { input: addressInput });

  await vendureShop(
    `
      mutation SetOrderShippingMethod($id: [ID!]!) {
        setOrderShippingMethod(shippingMethodId: $id) {
          __typename
          ... on Order {
            id
          }
          ... on ErrorResult {
            message
          }
        }
      }
    `,
    { id: [input.shippingMethodId] },
  );

  await vendureShop(`
    mutation TransitionOrderToArrangingPayment {
      transitionOrderToState(state: "ArrangingPayment") {
        __typename
        ... on Order {
          id
        }
        ... on OrderStateTransitionError {
          message
        }
      }
    }
  `);

  const payment = await vendureShop<{
    addPaymentToOrder: CheckoutSummary & { __typename: string; message?: string };
  }>(
    `
      mutation AddPaymentToOrder($input: PaymentInput!) {
        addPaymentToOrder(input: $input) {
          __typename
          ... on Order {
            ${orderFragment}
          }
          ... on ErrorResult {
            message
          }
        }
      }
    `,
    {
      input: {
        method: input.paymentMethodCode,
        metadata: {},
      },
    },
  );
  if (payment.addPaymentToOrder.__typename !== "Order") {
    throw new Error(payment.addPaymentToOrder.message || t("common.addPaymentFailed"));
  }
  return normalizeOrder(payment.addPaymentToOrder);
}
