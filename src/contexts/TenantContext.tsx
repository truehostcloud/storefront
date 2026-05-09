"use client";

import { createContext, type ReactNode, useContext, useMemo } from "react";
import type { TenantConfig } from "@/lib/tenant";

const TenantContext = createContext<TenantConfig | null>(null);

export function TenantConfigProvider({
  children,
  config,
}: {
  children: ReactNode;
  config: TenantConfig;
}) {
  const value = useMemo(() => config, [config]);

  return (
    <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
  );
}

export function useTenantConfig(): TenantConfig {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error(
      "useTenantConfig must be used within a TenantConfigProvider",
    );
  }
  return context;
}

export function useTenantTheme() {
  return useTenantConfig().theme;
}

export function useTenantNavigation() {
  return useTenantConfig().navigation;
}

export function useTenantPayments() {
  return useTenantConfig().paymentKeys;
}

export function useTenantSpree() {
  return useTenantConfig().spree;
}
