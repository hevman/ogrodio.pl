"use client";

import { createContext, useContext } from "react";
import type { ShopUser } from "@/lib/auth-api";
import type { GardenOrganization } from "@/lib/garden-api";
import { isBusinessGarden } from "@/lib/garden-permissions";

type AppContextValue = {
  user: ShopUser;
  organization: GardenOrganization | null;
  businessGarden: boolean;
};

type AppProviderProps = {
  children: React.ReactNode;
  organization: GardenOrganization | null;
  user: ShopUser;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children, organization, user }: AppProviderProps) {
  const businessGarden = isBusinessGarden(organization);
  return (
    <AppContext.Provider value={{ user, organization, businessGarden }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const value = useContext(AppContext);
  if (!value) throw new Error("useAppContext must be used within AppShell");
  return value;
}
