import type { TenantConfig } from "./types";
export interface TenantLink {
  label: string;
  href: string;
}

function getRecord(value: unknown): Record<string, unknown> | undefined {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return undefined;
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function getArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function getTenantBrandName(
  config?: TenantConfig | null,
): string | undefined {
  const branding = getRecord(config?.raw?.branding);

  return (
    config?.storeName ||
    getString(branding?.name) ||
    getString(branding?.tagline) ||
    undefined
  );
}

export function getTenantDescription(
  config?: TenantConfig | null,
): string | undefined {
  const branding = getRecord(config?.raw?.branding);

  return (
    config?.storeDescription ||
    getString(getRecord(config?.seo)?.description) ||
    getString(branding?.tagline) ||
    undefined
  );
}

export function getTenantSiteUrl(
  config?: TenantConfig | null,
): string | undefined {
  return (
    config?.storeUrl ||
    getString(getRecord(config?.seo)?.siteUrl) ||
    getString(getRecord(config?.raw)?.storeUrl) ||
    undefined
  );
}

export function getTenantLogoUrl(
  config?: TenantConfig | null,
): string | undefined {
  const branding = getRecord(config?.raw?.branding);
  const theme = getRecord(config?.theme);
  const seo = getRecord(config?.seo);
  const raw = getRecord(config?.raw);

  return (
    getString(branding?.logo) ||
    getString(theme?.logoUrl) ||
    getString(theme?.logo) ||
    getString(seo?.logoUrl) ||
    getString(seo?.logo) ||
    getString(raw?.logoUrl) ||
    getString(raw?.logo) ||
    undefined
  );
}

export function getTenantTwitterHandle(
  config?: TenantConfig | null,
): string | undefined {
  const seo = getRecord(config?.seo);
  const raw = getRecord(config?.raw);

  return (
    getString(seo?.twitter) ||
    getString(raw?.twitter) ||
    getString(raw?.storeTwitter) ||
    undefined
  );
}

export function getTenantSocialLinks(config?: TenantConfig | null): string[] {
  const branding = getRecord(config?.raw?.branding);
  const seo = getRecord(config?.seo);
  const raw = getRecord(config?.raw);

  const socials = [
    ...getArray(branding?.social_links),
    ...getArray(seo?.socials),
    ...getArray(raw?.socials),
  ]
    .map((value) => getString(value))
    .filter((value): value is string => Boolean(value));

  return socials;
}

export function getTenantNavigationLinks(
  config?: TenantConfig | null,
): TenantLink[] {
  const navigation = getRecord(config?.navigation);
  const links = getArray(navigation?.links);

  return links
    .map((entry) => {
      const record = getRecord(entry);
      if (!record) return null;
      const label = getString(record.label);
      const href = getString(record.href);
      if (!label || !href) return null;
      return { label, href };
    })
    .filter((value): value is TenantLink => Boolean(value));
}
