import type { Metadata } from "next";
import { FeaturedProductsSection } from "@/components/home/FeaturedProductsSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { HeroSection } from "@/components/home/HeroSection";
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
export async function generateStaticParams() {
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

export default async function HomePage({ params }: HomePageProps) {
  const { country, locale } = await params;
  const basePath = `/${country}/${locale}`;
  const currency = await resolveCurrency(country);
  const tenantConfig = await getTenantConfigFromRequest();
  const storeName = getTenantBrandName(tenantConfig) ?? getStoreName();
  const homepageConfig = getHomepageConfig({ storeName }, tenantConfig?.raw);
  const sections = getHomepageSections(homepageConfig);

  return (
    <div className="flex flex-col gap-0">
      {sections.map((section) => {
        switch (section.type) {
          case "hero":
            return (
              <HeroSection
                key={section.type}
                basePath={basePath}
                section={section}
              />
            );
          case "features":
            return <FeaturesSection key={section.type} section={section} />;
          case "featured-products":
            return (
              <FeaturedProductsSection
                key={section.type}
                basePath={basePath}
                country={country}
                currency={currency}
                locale={locale}
                section={section}
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
