import { t } from "@/i18n";

export type StaffUser = {
  id: number;
  email: string;
  name: string;
  role: string;
};

export type PanelArticleListItem = {
  id: number;
  slug: string;
  title: string;
  topic: string;
  summary: string;
  status: string;
  updated_at: string;
};

export type PanelArticle = {
  id: number;
  slug: string;
  title: string;
  topic: string;
  summary: string;
  readingMinutes: number;
  coverImage: string;
  coverAlt: string;
  status: string;
  relatedArticles: string[];
  tips: string[];
  seo: { title: string; description: string; keywords: string[] };
};

export type PanelProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  enabled: boolean;
  variants: Array<{
    id: string;
    name: string;
    sku: string;
    priceWithTax: number;
    stockLevel: string;
    enabled: boolean;
  }>;
};

async function panelFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    ...init,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || t("panel.operationFailed"));
  }
  return data as T;
}

export function staffLogin(email: string, password: string) {
  return panelFetch<{ user: StaffUser }>("/panel-api/staff/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function staffLogout() {
  return panelFetch<{ ok: true }>("/panel-api/staff/auth/logout", { method: "POST" });
}

export function staffMe() {
  return panelFetch<{ user: StaffUser }>("/panel-api/staff/auth/me");
}

export function fetchPanelArticles(params: { page?: number; status?: string; q?: string } = {}) {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.status) search.set("status", params.status);
  if (params.q) search.set("q", params.q);
  const suffix = search.toString();
  return panelFetch<{ total: number; page: number; items: PanelArticleListItem[] }>(
    `/panel-api/staff/articles${suffix ? `?${suffix}` : ""}`,
  );
}

export function fetchPanelArticle(id: number) {
  return panelFetch<PanelArticle>(`/panel-api/staff/articles/${id}`);
}

export function updatePanelArticle(id: number, body: Record<string, unknown>) {
  return panelFetch<PanelArticle>(`/panel-api/staff/articles/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function indexAllArticles() {
  return panelFetch<{ success: boolean; indexed: number }>("/panel-api/staff/articles/index-all", {
    method: "POST",
  });
}

export function fetchPanelProducts(params: { page?: number; q?: string } = {}) {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.q) search.set("q", params.q);
  const suffix = search.toString();
  return panelFetch<{ products: { totalItems: number; items: PanelProduct[] } }>(
    `/panel-api/staff/products${suffix ? `?${suffix}` : ""}`,
  );
}

export function fetchPanelProduct(id: string) {
  return panelFetch<PanelProduct>(`/panel-api/staff/products/${id}`);
}

export function updatePanelProduct(id: string, body: { name?: string; description?: string; enabled?: boolean }) {
  return panelFetch<PanelProduct>(`/panel-api/staff/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function updatePanelProductVariant(
  productId: string,
  variantId: string,
  body: { sku?: string; price?: number; stockLevel?: string; enabled?: boolean },
) {
  return panelFetch(`/panel-api/staff/products/${productId}/variants/${variantId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}
