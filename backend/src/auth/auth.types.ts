// Użytkownicy sklepu (klienci)
export type ShopUser = {
  id: number;
  email: string;
  name: string;
  phone?: string;
};

// Pracownicy panelu
export type StaffRole =
  | 'ADMIN'
  | 'MANAGER'
  | 'MAGAZYN'
  | 'OBSŁUGA_KLIENTA'
  | 'CONTENT_EDITOR';

export type StaffUser = {
  id: number;
  email: string;
  name: string;
  role: StaffRole;
};

// Uprawnienia per rola
export const ROLE_PERMISSIONS: Record<StaffRole, string[]> = {
  ADMIN: ['*'],
  MANAGER: ['orders', 'products', 'reports'],
  MAGAZYN: ['orders.list', 'orders.status', 'orders.pack', 'shipping'],
  OBSŁUGA_KLIENTA: ['customers', 'complaints'],
  CONTENT_EDITOR: ['articles', 'media', 'seo'],
};

export function hasPermission(role: StaffRole, permission: string): boolean {
  const perms = ROLE_PERMISSIONS[role] || [];
  if (perms.includes('*')) return true;
  return perms.some((p) => p === permission || permission.startsWith(p + '.'));
}
