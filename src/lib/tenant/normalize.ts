import type {
  PublicTenantConfig,
  PublicTenantPaymentKeys,
  TenantConfig,
} from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toStringValue(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export interface NormalizeHostOptions {
  preservePort?: boolean;
}

export function normalizeHost(
  hostname: string | null | undefined,
  options: NormalizeHostOptions = {},
): string | null {
  if (!hostname) return null;

  const trimmed = hostname.trim();
  if (!trimmed) return null;

  const preservePort = options.preservePort ?? false;

  try {
    const url = trimmed.includes("://")
      ? new URL(trimmed)
      : new URL(`https://${trimmed}`);
    const host = url.hostname.toLowerCase();
    const port = preservePort && url.port ? `:${url.port}` : "";
    return host ? `${host}${port}` : null;
  } catch {
    const withoutProtocol = trimmed.replace(/^https?:\/\//i, "");
    const withoutPath = withoutProtocol.split("/")[0] ?? "";
    const colonIndex = withoutPath.lastIndexOf(":");

    if (colonIndex > -1) {
      const hostnamePart = withoutPath.slice(0, colonIndex).toLowerCase();
      const portPart = withoutPath.slice(colonIndex + 1).trim();
      if (!hostnamePart) return null;
      return preservePort && portPart
        ? `${hostnamePart}:${portPart}`
        : hostnamePart;
    }

    const normalized = withoutPath.toLowerCase();
    return normalized || null;
  }
}

function normalizeHostVariants(hostname: string | null | undefined): string[] {
  const variants = [
    normalizeHost(hostname, { preservePort: true }),
    normalizeHost(hostname),
  ].filter((value): value is string => Boolean(value));

  return Array.from(new Set(variants));
}

function recordHostCandidates(record: Record<string, unknown>): string[] {
  return [record.olittDomain, record.customDomain]
    .flatMap((value) => normalizeHostVariants(toStringValue(value)))
    .filter((value): value is string => Boolean(value));
}

function recordMatchesHost(
  record: Record<string, unknown>,
  host: string,
): boolean {
  const requestVariants = normalizeHostVariants(host);
  const recordVariants = new Set(recordHostCandidates(record));

  return requestVariants.some((variant) => recordVariants.has(variant));
}

export function findOlittStoreRecord(
  payload: unknown,
  host: string,
): Record<string, unknown> | null {
  const normalizedHost =
    normalizeHost(host, { preservePort: true }) ?? normalizeHost(host);
  if (!normalizedHost) return null;

  if (isRecord(payload)) {
    const store = payload.store;
    if (isRecord(store) && recordMatchesHost(store, normalizedHost)) {
      return store;
    }

    if (recordMatchesHost(payload, normalizedHost)) {
      return payload;
    }
  }

  return null;
}

function pickString(
  record: Record<string, unknown>,
  keys: string[],
): string | undefined {
  for (const key of keys) {
    const value = toStringValue(record[key]);
    if (value) return value;
  }
  return undefined;
}

function pickRecord(
  record: Record<string, unknown>,
  keys: string[],
): Record<string, unknown> {
  for (const key of keys) {
    const value = record[key];
    if (isRecord(value)) return value;
  }
  return {};
}

function collectStringMap(value: unknown): Record<string, string> {
  if (!isRecord(value)) return {};

  const result: Record<string, string> = {};
  for (const [key, entry] of Object.entries(value)) {
    const stringValue = toStringValue(entry);
    if (stringValue) {
      result[key] = stringValue;
    }
  }

  return result;
}

function collectPaymentKeys(
  record: Record<string, unknown>,
): Record<string, string> {
  const result: Record<string, string> = {};

  Object.assign(result, collectStringMap(record.paymentKeys));

  for (const [key, value] of Object.entries(record.paymentKeys ?? {})) {
    if (typeof value === "string" && value.trim()) {
      result[key] = value.trim();
    }
  }

  return result;
}

function normalizeLocalDevSpreeApiUrl(apiUrl: string): string {
  if (process.env.NODE_ENV !== "development") {
    return apiUrl;
  }

  const overrideUrl = process.env.SPREE_API_DEV_URL?.trim();
  if (overrideUrl) {
    try {
      return new URL(overrideUrl).origin;
    } catch {
      return overrideUrl;
    }
  }

  try {
    const url = new URL(apiUrl);
    url.protocol = "http:";
    url.port = "5000";
    return url.origin;
  } catch {
    return apiUrl;
  }
}

function collectPublicPaymentKeys(
  config: TenantConfig,
): PublicTenantPaymentKeys {
  const stripePublishableKey =
    config.paymentKeys.stripePublishableKey?.trim() || undefined;

  return {
    ...(stripePublishableKey ? { stripePublishableKey } : {}),
  };
}

function getSpreeConfig(record: Record<string, unknown>): {
  apiUrl: string;
  publishableKey: string;
} {
  const apiUrl = normalizeLocalDevSpreeApiUrl(
    pickString(record, ["spreeApiUrl"]) ?? "",
  );
  const publishableKey = pickString(record, ["spreePublishableKey"]) ?? "";

  return { apiUrl, publishableKey };
}

export function buildTenantConfigFromRecord(
  record: Record<string, unknown>,
  host: string,
): TenantConfig {
  const normalizedHost =
    normalizeHost(host, { preservePort: true }) ??
    normalizeHost(host) ??
    host.toLowerCase();
  const tenantId = pickString(record, ["tenantId", "id"]) ?? normalizedHost;
  const storeName = pickString(record, ["name"]) ?? "";
  const storeDescription = pickString(record, ["description"]) ?? "";
  const defaultCountry = (
    pickString(record, ["defaultCountry"]) ?? ""
  ).toLowerCase();
  const defaultLocale = pickString(record, ["defaultLocale"]) ?? "";
  const seo = pickRecord(record, ["seo"]);
  const storeUrl =
    pickString(record, ["storeUrl"]) ?? pickString(seo, ["siteUrl"]);
  const theme = pickRecord(record, ["theme"]);
  const navigation = pickRecord(record, ["navigation"]);

  return {
    tenantId,
    host: normalizedHost,
    storeName,
    storeDescription,
    ...(storeUrl ? { storeUrl } : {}),
    defaultCountry,
    defaultLocale,
    spree: getSpreeConfig(record),
    paymentKeys: collectPaymentKeys(record),
    theme,
    seo,
    navigation,
    raw: record,
    source: "olitt",
    fetchedAt: new Date().toISOString(),
  };
}

export function toPublicTenantConfig(config: TenantConfig): PublicTenantConfig {
  return {
    storeName: config.storeName,
    spree: config.spree,
    paymentKeys: collectPublicPaymentKeys(config),
    theme: config.theme,
    navigation: config.navigation,
  };
}
