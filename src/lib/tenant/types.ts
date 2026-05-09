export interface TenantSpreeConfig {
  apiUrl: string;
  publishableKey: string;
}

export interface TenantConfig {
  tenantId: string;
  host: string;
  storeName: string;
  storeDescription: string;
  storeUrl?: string;
  defaultCountry: string;
  defaultLocale: string;
  spree: TenantSpreeConfig;
  paymentKeys: Record<string, string>;
  theme: Record<string, unknown>;
  seo: Record<string, unknown>;
  navigation: Record<string, unknown>;
  raw: Record<string, unknown>;
  source: "olitt";
  fetchedAt: string;
}
