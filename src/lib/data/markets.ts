"use server";

import type { Market } from "@spree/sdk";
import { cacheLife, cacheTag } from "next/cache";
import {
  getClientForConfig,
  getLocaleOptions,
  getSpreeCacheScope,
  resolveSpreeConfig,
} from "@/lib/spree";

async function cachedListMarkets(
  options: {
    locale?: string;
    country?: string;
  },
  baseUrl: string,
  publishableKey: string,
  _spreeScope: string,
) {
  "use cache: remote";
  cacheLife("hours");
  cacheTag("markets");
  return getClientForConfig({ baseUrl, publishableKey }).markets.list(options);
}

async function cachedResolveMarket(
  country: string,
  options: { locale?: string; country?: string },
  baseUrl: string,
  publishableKey: string,
  _spreeScope: string,
) {
  "use cache: remote";
  cacheLife("hours");
  cacheTag("resolved-market");
  return getClientForConfig({ baseUrl, publishableKey }).markets.resolve(
    country,
    options,
  );
}

async function cachedListMarketCountries(
  marketId: string,
  options: { locale?: string; country?: string },
  baseUrl: string,
  publishableKey: string,
  _spreeScope: string,
) {
  "use cache: remote";
  cacheLife("hours");
  cacheTag("market-countries");
  return getClientForConfig({ baseUrl, publishableKey }).markets.countries.list(
    marketId,
    options,
  );
}

export async function getMarkets(options?: {
  locale?: string;
  country?: string;
}): Promise<{ data: Market[] }> {
  const resolvedOptions = options ?? (await getLocaleOptions());
  const spreeConfig = await resolveSpreeConfig();
  const spreeScope = getSpreeCacheScope(spreeConfig);
  return cachedListMarkets(
    resolvedOptions,
    spreeConfig.baseUrl,
    spreeConfig.publishableKey,
    spreeScope,
  );
}

export async function resolveMarket(country: string) {
  const options = await getLocaleOptions();
  const spreeConfig = await resolveSpreeConfig();
  return cachedResolveMarket(
    country,
    options,
    spreeConfig.baseUrl,
    spreeConfig.publishableKey,
    getSpreeCacheScope(spreeConfig),
  );
}

export async function getMarketCountries(marketId: string) {
  const options = await getLocaleOptions();
  const spreeConfig = await resolveSpreeConfig();
  return cachedListMarketCountries(
    marketId,
    options,
    spreeConfig.baseUrl,
    spreeConfig.publishableKey,
    getSpreeCacheScope(spreeConfig),
  );
}

/**
 * Resolve the currency for a given country on the server side, using the
 * cached markets list. Returns undefined if the country is not served by
 * any market.
 */
export async function resolveCurrency(
  country: string,
): Promise<string | undefined> {
  const { data: markets } = await getMarkets();
  const iso = country.toLowerCase();
  for (const market of markets) {
    const match = market.countries?.some((c) => c.iso.toLowerCase() === iso);
    if (match) return market.currency;
  }
  return undefined;
}
