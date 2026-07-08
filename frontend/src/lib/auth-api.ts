import { t } from "@/i18n";

export type ShopUser = {
  id: number;
  email: string;
  name: string;
  phone?: string;
};

async function authRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/auth/${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    ...init,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || t("common.genericError"));
  }
  return data as T;
}

export function login(email: string, password: string) {
  return authRequest<{ user: ShopUser }>("login", {
    body: JSON.stringify({ email, password }),
    method: "POST",
  });
}

export function register(payload: { email: string; name: string; password: string; phone?: string }) {
  return authRequest<{ user: ShopUser }>("register", {
    body: JSON.stringify(payload),
    method: "POST",
  });
}

export function logout() {
  return authRequest<{ ok: true }>("logout", { method: "POST" });
}

/** Dla gościa backend zwraca 200 z user:null (bez błędu 401 w konsoli). */
export function me() {
  return authRequest<{ user: ShopUser | null }>("me");
}
