"use server";

import { cacheLife, cacheTag } from "next/cache";
import {
  getClient,
  getClientForConfig,
  getLocaleOptions,
  getSpreeCacheScope,
  resolveSpreeConfig,
} from "@/lib/spree";

export async function getCountries() {
  const options = await getLocaleOptions();
  return getClient().countries.list(options);
}

async function cachedGetCountry(
  iso: string,
  options: { locale?: string; country?: string },
  baseUrl: string,
  publishableKey: string,
  _spreeScope: string,
) {
  "use cache: remote";
  cacheLife("hours");
  cacheTag("country", `country-${iso}`);
  return getClientForConfig({ baseUrl, publishableKey }).countries.get(
    iso,
    { expand: ["states"] },
    options,
  );
}

export async function getCountry(iso: string) {
  const options = await getLocaleOptions();
  const spreeConfig = await resolveSpreeConfig();
  return cachedGetCountry(
    iso,
    options,
    spreeConfig.baseUrl,
    spreeConfig.publishableKey,
    getSpreeCacheScope(spreeConfig),
  );
}
