import type { Market } from "@spree/sdk";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { Suspense } from "react";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { OlittFallbackPage } from "@/components/marketing/OlittFallbackPage";
import { JsonLd } from "@/components/seo/JsonLd";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { StoreProvider } from "@/contexts/StoreContext";
import { TenantConfigProvider } from "@/contexts/TenantContext";
import { getMarkets } from "@/lib/data/markets";
import { generateStoreMetadata } from "@/lib/metadata/store";
import { buildOrganizationJsonLd } from "@/lib/seo";
import { getDefaultCountry, getDefaultLocale } from "@/lib/store";
import { getTenantConfigByHost } from "@/lib/tenant";
import { buildCssVars } from "@/lib/tenant/css-vars";
import { toPublicTenantConfig } from "@/lib/tenant/normalize";
import {
  getRequestHost,
  getTenantConfigFromRequest,
} from "@/lib/tenant/request";
import deMessages from "../../../../messages/de.json";
import enMessages from "../../../../messages/en.json";
import esMessages from "../../../../messages/es.json";
import frMessages from "../../../../messages/fr.json";
import plMessages from "../../../../messages/pl.json";
import LocaleLayoutLoading from "./loading";

const messagesMap: Record<string, IntlMessages> = {
  en: enMessages,
  de: deMessages,
  es: esMessages,
  fr: frMessages,
  pl: plMessages,
};

interface CountryLocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    country: string;
    locale: string;
  }>;
}

export async function generateMetadata({
  params,
}: CountryLocaleLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  const tenantConfig = await getTenantConfigFromRequest();

  if (!tenantConfig) {
    return {
      title: {
        absolute: "Olitt — AI Websites, E-commerce, WordPress & Domains",
      },
      description:
        "Build websites, e-commerce stores, WordPress sites, and buy domains with Olitt. Launch faster with AI-powered tools and conversion-focused design.",
      openGraph: {
        title: "Olitt — AI Websites, E-commerce, WordPress & Domains",
        description:
          "Turn your domain into a real online business with Olitt's AI-powered website, e-commerce, WordPress, and domain services.",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
      },
    };
  }

  return generateStoreMetadata({ locale, tenantConfig });
}

export default async function CountryLocaleLayout({
  children,
  params,
}: CountryLocaleLayoutProps) {
  return (
    <Suspense fallback={<LocaleLayoutLoading />}>
      <CountryLocaleLayoutInner params={params}>
        {children}
      </CountryLocaleLayoutInner>
    </Suspense>
  );
}

async function CountryLocaleLayoutInner({
  children,
  params,
}: CountryLocaleLayoutProps) {
  const { country, locale } = await params;
  const requestHeaders = await headers();
  const host = getRequestHost(requestHeaders) ?? "localhost";
  const tenantConfig = await getTenantConfigByHost(host);
  if (!tenantConfig) {
    return <OlittFallbackPage host={host} />;
  }
  const cssVars = buildCssVars(tenantConfig);

  let markets: Market[] = [];
  let failedToLoadMarkets = false;
  try {
    const response = await getMarkets({ country, locale });
    markets = response.data;
  } catch {
    markets = [];
    failedToLoadMarkets = true;
  }

  const isValidCountry = markets.some((market) =>
    market.countries?.some(
      (c) => c.iso.toLowerCase() === country.toLowerCase(),
    ),
  );

  if (!failedToLoadMarkets && !isValidCountry) {
    const defaultMarket = markets.find((m) => m.default) ?? markets[0];
    const fallbackCountry =
      defaultMarket?.countries?.[0]?.iso.toLowerCase() ?? getDefaultCountry();
    const fallbackLocale = defaultMarket?.default_locale ?? getDefaultLocale();

    const fallbackPath = `/${fallbackCountry}/${fallbackLocale}`;
    const currentPath = `/${country.toLowerCase()}/${locale}`;

    if (fallbackPath !== currentPath) {
      redirect(fallbackPath);
    }
  }

  const messages = messagesMap[locale] || messagesMap.en;

  return (
    <div
      style={cssVars}
      data-tenant-host={tenantConfig.host}
      data-tenant-id={tenantConfig.tenantId}
    >
      <TenantConfigProvider config={toPublicTenantConfig(tenantConfig)}>
        <NextIntlClientProvider
          messages={messages}
          locale={locale as "en" | "de" | "pl"}
        >
          <StoreProvider
            initialCountry={country}
            initialLocale={locale}
            initialMarkets={markets}
          >
            <AuthProvider>
              <JsonLd data={buildOrganizationJsonLd(tenantConfig)} />
              {children}
              <CartDrawer />
              <Toaster />
            </AuthProvider>
          </StoreProvider>
        </NextIntlClientProvider>
      </TenantConfigProvider>
    </div>
  );
}
