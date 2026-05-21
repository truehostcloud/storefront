import type { Metadata } from "next";
import type { ReactElement } from "react";
import { PageSectionsRenderer } from "@/components/page-builder/PageSectionsRenderer";
import { getMarkets, resolveCurrency } from "@/lib/data/markets";
import { getHomepageConfig, getHomepageSections } from "@/lib/homepage";
import { generateHomeMetadata } from "@/lib/metadata/home";
import { getDefaultCountry, getDefaultLocale, getStoreName } from "@/lib/store";
import { getTenantConfigFromRequest } from "@/lib/tenant/request";
import { getTenantBrandName } from "@/lib/tenant/surface";

interface HomePageProps {
  params: Promise<{
    country: string;
    locale: string;
  }>;
}

/**
 * Prebuild the homepage shell for every (country, locale) combination the
 * store serves. Next.js reuses the static shell (hero + featured section
 * chrome) while featured products stream in under Suspense.
 *
 * Cache Components requires this to return at least one entry, so we
 * always include the store's configured default country/locale as a
 * fallback even if the markets fetch fails.
 */
export async function generateStaticParams(): Promise<
  Array<{ country: string; locale: string }>
> {
  const fallback = {
    country: getDefaultCountry(),
    locale: getDefaultLocale(),
  };

  let markets;
  try {
    ({ data: markets } = await getMarkets());
  } catch {
    return [fallback];
  }

  const params: Array<{ country: string; locale: string }> = [];
  const seen = new Set<string>();

  const addParam = (country: string, locale: string) => {
    const key = `${country}/${locale}`;
    if (seen.has(key)) return;
    seen.add(key);
    params.push({ country, locale });
  };

  for (const market of markets) {
    const locale = market.default_locale;
    if (!locale) continue;
    for (const country of market.countries ?? []) {
      const iso = country.iso?.toLowerCase();
      if (!iso) continue;
      addParam(iso, locale);
    }
  }

  if (params.length === 0) {
    addParam(fallback.country, fallback.locale);
  }

  return params;
}

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { country, locale } = await params;
  return generateHomeMetadata({ country, locale });
}

export default async function HomePage({
  params,
}: HomePageProps): Promise<ReactElement> {
  const { country, locale } = await params;
  const basePath = `/${country}/${locale}`;
  const currency = await resolveCurrency(country);
  const tenantConfig = await getTenantConfigFromRequest();
  const storeName = getTenantBrandName(tenantConfig) ?? getStoreName();
  const homepageConfig = getHomepageConfig({ storeName }, tenantConfig?.raw);
  const sections = getHomepageSections(homepageConfig);

  return (
    <PageSectionsRenderer
      sections={sections}
      basePath={basePath}
      country={country}
      currency={currency}
      locale={locale}
      keyPrefix="home"
    />
  );
}
