"use server";

import { cacheLife, cacheTag } from "next/cache";
import {
  buildTenantConfigFromRecord,
  findOlittStoreRecord,
  normalizeHost,
} from "./normalize";
import type { TenantConfig } from "./types";

const DEFAULT_CACHE_TTL = "tenMinutes";
const useTenantCache = process.env.NODE_ENV === "production";

type OlittMockEntry =
  | {
      host?: string;
      requestHost?: string;
      aliases?: string[];
      response?: unknown;
      payload?: unknown;
      body?: unknown;
      data?: unknown;
    }
  | unknown;

function unwrapMockPayload(entry: unknown): unknown {
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
    return entry;
  }

  const record = entry as Record<string, unknown>;
  for (const key of ["response", "payload", "body", "data"]) {
    if (key in record) {
      return record[key];
    }
  }

  return entry;
}

function parseMockHosts(entry: OlittMockEntry): string[] {
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
    return [];
  }

  const record = entry as Record<string, unknown>;
  const hosts: string[] = [];

  for (const key of ["host", "requestHost"]) {
    const value = record[key];
    if (typeof value === "string") hosts.push(value);
  }

  const aliases = record.aliases;
  if (Array.isArray(aliases)) {
    for (const alias of aliases) {
      if (typeof alias === "string") hosts.push(alias);
    }
  }

  return hosts
    .map(
      (value) =>
        normalizeHost(value, { preservePort: true }) ?? normalizeHost(value),
    )
    .filter((value): value is string => Boolean(value));
}

function getMockedOlittPayload(host: string): unknown | null {
  const rawValue = process.env.OLITT_MOCK_RESPONSES?.trim();
  if (!rawValue) return null;

  const normalizedHost =
    normalizeHost(host, { preservePort: true }) ?? normalizeHost(host);
  if (!normalizedHost) return null;

  try {
    const parsed: unknown = JSON.parse(rawValue);

    if (Array.isArray(parsed)) {
      for (const entry of parsed) {
        const hosts = parseMockHosts(entry as OlittMockEntry);
        if (hosts.includes(normalizedHost)) {
          return unwrapMockPayload(entry);
        }
      }
      return null;
    }

    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    const record = parsed as Record<string, unknown>;
    for (const [key, value] of Object.entries(record)) {
      const normalizedKey =
        normalizeHost(key, { preservePort: true }) ?? normalizeHost(key);
      if (normalizedKey === normalizedHost) {
        return unwrapMockPayload(value);
      }
    }

    return null;
  } catch {
    return null;
  }
}

function getCanonicalRecordHost(
  record: Record<string, unknown>,
  fallbackHost: string,
): string {
  for (const key of ["customDomain", "olittDomain"]) {
    const value = record[key];
    if (typeof value !== "string") continue;

    const normalizedValue =
      normalizeHost(value, { preservePort: true }) ?? normalizeHost(value);
    if (normalizedValue) {
      return normalizedValue;
    }
  }

  return fallbackHost;
}

function getOlittApiUrl(): string | undefined {
  return process.env.OLITT_API_URL?.trim() || undefined;
}

function getOlittLookupPath(): string {
  return process.env.OLITT_LOOKUP_PATH?.trim() || "/api/stores/resolve";
}

function getOlittApiToken(): string | undefined {
  return process.env.OLITT_API_TOKEN?.trim() || undefined;
}

function buildOlittLookupUrl(host: string): string | null {
  const olittApiUrl = getOlittApiUrl();
  if (!olittApiUrl) return null;

  try {
    const url = new URL(getOlittLookupPath(), olittApiUrl);
    url.searchParams.set("domain", host);
    return url.toString();
  } catch {
    return null;
  }
}

export async function fetchTenantConfigFromOlitt(
  host: string,
): Promise<TenantConfig | null> {
  const normalizedHost =
    normalizeHost(host, { preservePort: true }) ?? normalizeHost(host);
  if (!normalizedHost) return null;

  const mockedPayload = getMockedOlittPayload(normalizedHost);
  if (mockedPayload !== null) {
    const mockedStoreRecord = findOlittStoreRecord(
      mockedPayload,
      normalizedHost,
    );

    if (!mockedStoreRecord) {
      return null;
    }

    return buildTenantConfigFromRecord(
      mockedStoreRecord,
      getCanonicalRecordHost(mockedStoreRecord, normalizedHost),
    );
  }

  const lookupUrl = buildOlittLookupUrl(normalizedHost);
  if (!lookupUrl) {
    throw new Error("Olitt API URL is not configured.");
  }

  const response = await fetch(lookupUrl, {
    method: "GET",
    headers: {
      accept: "application/json",
      ...(getOlittApiToken()
        ? {
            authorization: `Bearer ${getOlittApiToken()}`,
          }
        : {}),
      "x-request-host": normalizedHost,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }

    throw new Error(
      `Failed to load tenant config from Olitt for ${normalizedHost}: ${response.status}`,
    );
  }

  const payload: unknown = await response.json().catch(() => null);
  const storeRecord = findOlittStoreRecord(payload, normalizedHost);

  if (!storeRecord) {
    return null;
  }

  return buildTenantConfigFromRecord(
    storeRecord,
    getCanonicalRecordHost(storeRecord, normalizedHost),
  );
}

async function cachedResolveTenantConfigByHost(
  host: string,
): Promise<TenantConfig | null> {
  "use cache: remote";
  cacheLife(DEFAULT_CACHE_TTL);
  cacheTag("tenant-config", `tenant-config:${host}`);
  return fetchTenantConfigFromOlitt(host);
}

export async function resolveTenantConfigByHost(
  host: string,
): Promise<TenantConfig | null> {
  const normalizedHost =
    normalizeHost(host, { preservePort: true }) ?? normalizeHost(host);
  if (!normalizedHost) return null;

  if (!useTenantCache) {
    return fetchTenantConfigFromOlitt(normalizedHost);
  }

  return cachedResolveTenantConfigByHost(normalizedHost);
}

export async function getTenantConfigByHost(
  host: string,
): Promise<TenantConfig | null> {
  return resolveTenantConfigByHost(host);
}
