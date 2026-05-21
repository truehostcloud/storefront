import type { DynamicPageSectionConfig } from "@/lib/page-builder";
import {
  getTenantBrandName,
  getTenantDescription,
  getTenantLogoUrl,
  getTenantNavigationLinks,
  type TenantLink,
} from "./surface";
import type { TenantSurfaceConfig } from "./types";

function getRecord(value: unknown): Record<string, unknown> | undefined {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return undefined;
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function getBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function getArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function getLink(value: unknown): TenantLink | null {
  const record = getRecord(value);
  if (!record) return null;

  const label = getString(record.label);
  const href = getString(record.href);
  if (!label || !href) return null;

  return { label, href };
}

function getLinks(value: unknown): TenantLink[] {
  const entries = getRecord(value)?.links ?? value;

  return getArray(entries)
    .map((entry) => getLink(entry))
    .filter((entry): entry is TenantLink => Boolean(entry));
}

function getFirstNonEmptyLinks(...values: unknown[]): TenantLink[] {
  for (const value of values) {
    const links = getLinks(value);
    if (links.length > 0) {
      return links;
    }
  }

  return [];
}

function isDynamicPageSection(
  value: unknown,
): value is DynamicPageSectionConfig {
  const record = getRecord(value);
  return Boolean(record && typeof record.type === "string");
}

function getSections(value: unknown): DynamicPageSectionConfig[] {
  return getArray(value).filter(isDynamicPageSection);
}

function getRawConfig(
  config?: TenantSurfaceConfig | null,
): Record<string, unknown> | undefined {
  return getRecord(config?.raw);
}

function getDesignConfig(
  config?: TenantSurfaceConfig | null,
): Record<string, unknown> | undefined {
  return getRecord(getRawConfig(config)?.design);
}

function getLayoutConfig(
  config?: TenantSurfaceConfig | null,
): Record<string, unknown> | undefined {
  return getRecord(getDesignConfig(config)?.layout);
}

export interface TenantBrandingConfig {
  name?: string;
  description?: string;
  logoUrl?: string;
}

export interface TenantNavigationConfig {
  headerLinks: TenantLink[];
  footerLinks: TenantLink[];
  checkoutLinks: TenantLink[];
}

export interface TenantFooterConfig {
  description?: string;
  resourceLinks: TenantLink[];
  shopLinks: TenantLink[];
  accountLinks: TenantLink[];
  policyLinks: TenantLink[];
  showPolicies: boolean;
}

export interface FixedPageSlotGroup {
  beforeMain: DynamicPageSectionConfig[];
  afterMain: DynamicPageSectionConfig[];
}

export interface TenantFixedPageSlotsConfig {
  productPage: FixedPageSlotGroup;
  checkoutPage: FixedPageSlotGroup;
}

export function resolveTenantBranding(
  config?: TenantSurfaceConfig | null,
  defaults: TenantBrandingConfig = {},
): TenantBrandingConfig {
  const raw = getRawConfig(config);
  const layoutBranding = getRecord(getLayoutConfig(config)?.branding);
  const designBranding = getRecord(getDesignConfig(config)?.branding);
  const branding = getRecord(raw?.branding);

  return {
    name:
      getString(layoutBranding?.name) ||
      getString(designBranding?.name) ||
      getString(branding?.name) ||
      getTenantBrandName(config) ||
      defaults.name,
    description:
      getString(layoutBranding?.description) ||
      getString(designBranding?.description) ||
      getString(branding?.description) ||
      getTenantDescription(config) ||
      defaults.description,
    logoUrl:
      getString(layoutBranding?.logoUrl) ||
      getString(layoutBranding?.logo) ||
      getString(designBranding?.logoUrl) ||
      getString(designBranding?.logo) ||
      getString(branding?.logoUrl) ||
      getString(branding?.logo) ||
      getTenantLogoUrl(config) ||
      defaults.logoUrl,
  };
}

export function resolveTenantNavigation(
  config?: TenantSurfaceConfig | null,
  defaults: Partial<TenantNavigationConfig> = {},
): TenantNavigationConfig {
  const raw = getRawConfig(config);
  const layoutNavigation = getLayoutConfig(config)?.navigation;
  const navigation =
    getRecord(raw?.navigation) ?? getRecord(config?.navigation);

  const genericLinks = getFirstNonEmptyLinks(
    layoutNavigation,
    navigation?.links,
    getTenantNavigationLinks(config),
  );

  const headerLinks = getFirstNonEmptyLinks(
    layoutNavigation,
    navigation?.headerLinks,
    genericLinks,
    defaults.headerLinks,
  );

  const footerLinks = getFirstNonEmptyLinks(
    layoutNavigation,
    navigation?.footerLinks,
    genericLinks,
    defaults.footerLinks,
  );

  const checkoutLinks = getFirstNonEmptyLinks(
    layoutNavigation,
    navigation?.checkoutLinks,
    genericLinks,
    defaults.checkoutLinks,
  );

  return { headerLinks, footerLinks, checkoutLinks };
}

export function resolveTenantFooter(
  config?: TenantSurfaceConfig | null,
  defaults: Partial<TenantFooterConfig> = {},
): TenantFooterConfig {
  const raw = getRawConfig(config);
  const layoutFooter = getRecord(getLayoutConfig(config)?.footer);
  const footer = getRecord(raw?.footer);

  return {
    description:
      getString(layoutFooter?.description) ||
      getString(layoutFooter?.copy) ||
      getString(footer?.description) ||
      getTenantDescription(config) ||
      defaults.description,
    resourceLinks:
      getLinks(layoutFooter?.resourceLinks).length > 0
        ? getLinks(layoutFooter?.resourceLinks)
        : getLinks(layoutFooter?.externalLinks).length > 0
          ? getLinks(layoutFooter?.externalLinks)
          : getLinks(footer?.resourceLinks).length > 0
            ? getLinks(footer?.resourceLinks)
            : getLinks(footer?.externalLinks).length > 0
              ? getLinks(footer?.externalLinks)
              : (defaults.resourceLinks ?? []),
    shopLinks:
      getLinks(layoutFooter?.shopLinks).length > 0
        ? getLinks(layoutFooter?.shopLinks)
        : getLinks(footer?.shopLinks).length > 0
          ? getLinks(footer?.shopLinks)
          : (defaults.shopLinks ?? []),
    accountLinks:
      getLinks(layoutFooter?.accountLinks).length > 0
        ? getLinks(layoutFooter?.accountLinks)
        : getLinks(footer?.accountLinks).length > 0
          ? getLinks(footer?.accountLinks)
          : (defaults.accountLinks ?? []),
    policyLinks:
      getLinks(layoutFooter?.policyLinks).length > 0
        ? getLinks(layoutFooter?.policyLinks)
        : getLinks(footer?.policyLinks).length > 0
          ? getLinks(footer?.policyLinks)
          : (defaults.policyLinks ?? []),
    showPolicies:
      getBoolean(layoutFooter?.showPolicies) ??
      getBoolean(footer?.showPolicies) ??
      defaults.showPolicies ??
      true,
  };
}

export function resolveTenantFixedPageSlots(
  config?: TenantSurfaceConfig | null,
  defaults: Partial<TenantFixedPageSlotsConfig> = {},
): TenantFixedPageSlotsConfig {
  const raw = getRawConfig(config);
  const layout = getLayoutConfig(config);
  const pageSlots =
    getRecord(layout?.pageSlots) ||
    getRecord(layout?.fixedPageSlots) ||
    getRecord(raw?.pageSlots) ||
    getRecord(raw?.fixedPageSlots);

  const productPage =
    getRecord(pageSlots?.productPage) || getRecord(pageSlots?.product);
  const checkoutPage =
    getRecord(pageSlots?.checkoutPage) || getRecord(pageSlots?.checkout);

  return {
    productPage: {
      beforeMain:
        getSections(productPage?.beforeMain).length > 0
          ? getSections(productPage?.beforeMain)
          : (defaults.productPage?.beforeMain ?? []),
      afterMain:
        getSections(productPage?.afterMain).length > 0
          ? getSections(productPage?.afterMain)
          : (defaults.productPage?.afterMain ?? []),
    },
    checkoutPage: {
      beforeMain:
        getSections(checkoutPage?.beforeMain).length > 0
          ? getSections(checkoutPage?.beforeMain)
          : (defaults.checkoutPage?.beforeMain ?? []),
      afterMain:
        getSections(checkoutPage?.afterMain).length > 0
          ? getSections(checkoutPage?.afterMain)
          : (defaults.checkoutPage?.afterMain ?? []),
    },
  };
}
