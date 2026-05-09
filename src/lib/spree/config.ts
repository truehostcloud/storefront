import { type Client, createClient } from "@spree/sdk";
import { getTenantConfigFromRequest } from "@/lib/tenant/request";
import type { SpreeNextConfig } from "./types";

let _config: SpreeNextConfig | null = null;
let _clientProxy: Client | null = null;

const resolvedClients = new Map<string, Client>();

function buildEnvConfig(): SpreeNextConfig {
  const baseUrl = process.env.SPREE_API_URL;
  const publishableKey = process.env.SPREE_PUBLISHABLE_KEY;

  if (!baseUrl || !publishableKey) {
    throw new Error(
      "Spree client is not configured. Either call initSpreeNext() or set SPREE_API_URL and SPREE_PUBLISHABLE_KEY environment variables.",
    );
  }

  return {
    baseUrl,
    publishableKey,
    defaultCountry: (
      process.env.NEXT_PUBLIC_DEFAULT_COUNTRY || "us"
    ).toLowerCase(),
    defaultLocale: process.env.NEXT_PUBLIC_DEFAULT_LOCALE || "en",
  };
}

function getBaseConfig(): SpreeNextConfig {
  return _config ?? buildEnvConfig();
}

function getClientCacheKey(config: SpreeNextConfig): string {
  return `${config.baseUrl}::${config.publishableKey}`;
}

export function getClientForConfig(config: SpreeNextConfig): Client {
  const cacheKey = getClientCacheKey(config);
  const existingClient = resolvedClients.get(cacheKey);

  if (existingClient) {
    return existingClient;
  }

  const client = createClient({
    baseUrl: config.baseUrl,
    publishableKey: config.publishableKey,
  });

  resolvedClients.set(cacheKey, client);

  return client;
}

export async function resolveSpreeConfig(): Promise<SpreeNextConfig> {
  const tenantConfig = await getTenantConfigFromRequest();

  if (tenantConfig?.spree.apiUrl && tenantConfig.spree.publishableKey) {
    return {
      baseUrl: tenantConfig.spree.apiUrl,
      publishableKey: tenantConfig.spree.publishableKey,
      defaultCountry: tenantConfig.defaultCountry,
      defaultLocale: tenantConfig.defaultLocale,
    };
  }

  throw new Error(
    "Tenant Spree config could not be resolved for this request.",
  );
}

export function getSpreeCacheScope(config: SpreeNextConfig): string {
  return getClientCacheKey(config);
}

async function resolveClient(): Promise<Client> {
  return getClientForConfig(await resolveSpreeConfig());
}

function resolvePropertyPath(target: unknown, path: PropertyKey[]) {
  let parent: unknown;
  let current = target;

  for (const key of path) {
    parent = current;
    current = (current as Record<PropertyKey, unknown>)[key];
  }

  return { parent, current };
}

function createClientProxy(path: PropertyKey[] = []): Client {
  const proxyTarget = (() => undefined) as unknown as Client;

  return new Proxy(proxyTarget, {
    get(_target, property) {
      if (path.length === 0 && property === "then") {
        return undefined;
      }

      return createClientProxy([...path, property]);
    },
    apply(_target, _thisArg, args) {
      return (async () => {
        const client = await resolveClient();
        const { parent, current } = resolvePropertyPath(client, path);

        if (typeof current !== "function") {
          return current;
        }

        return current.apply(parent, args);
      })();
    },
  }) as Client;
}

/**
 * Initialize the Spree Next.js integration.
 * Call this once in your app (e.g., in `lib/storefront.ts`).
 * If not called, the client will auto-initialize from SPREE_API_URL and SPREE_PUBLISHABLE_KEY env vars.
 */
export function initSpreeNext(config: SpreeNextConfig): void {
  _config = config;
  getClientForConfig(config);
}

/**
 * Get the Client instance. Auto-initializes from env vars if needed.
 */
export function getClient(): Client {
  if (!_clientProxy) {
    _clientProxy = createClientProxy();
  }

  return _clientProxy;
}

/**
 * Get the current config. Auto-initializes from env vars if needed.
 */
export function getConfig(): SpreeNextConfig {
  return getBaseConfig();
}

/**
 * Reset the client (useful for testing).
 */
export function resetClient(): void {
  _config = null;
  _clientProxy = null;
  resolvedClients.clear();
}
