import type { Address, Cart, Country } from "@spree/sdk";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { PageSectionsRenderer } from "@/components/page-builder/PageSectionsRenderer";
import { getAddresses } from "@/lib/data/addresses";
import { getCheckoutOrder } from "@/lib/data/checkout";
import { isAuthenticated as checkAuth } from "@/lib/data/cookies";
import { getCountry } from "@/lib/data/countries";
import {
  getMarketCountries,
  resolveCurrency,
  resolveMarket,
} from "@/lib/data/markets";
import { resolveTenantFixedPageSlots } from "@/lib/tenant";
import { getTenantConfigFromRequest } from "@/lib/tenant/request";

import { CheckoutPageContent } from "./CheckoutPageContent";

export interface CheckoutInitialData {
  cart: Cart;
  countries: Country[];
  savedAddresses: Address[];
  isAuthenticated: boolean;
}

interface CheckoutPageProps {
  params: Promise<{
    id: string;
    country: string;
    locale: string;
  }>;
}

async function CheckoutDataLoader({ params }: CheckoutPageProps) {
  await connection();

  const { id: cartId, country: urlCountry, locale } = await params;
  const basePath = `/${urlCountry}/${locale}`;
  const [tenantConfig, currency] = await Promise.all([
    getTenantConfigFromRequest(),
    resolveCurrency(urlCountry),
  ]);
  const pageSlots = resolveTenantFixedPageSlots(tenantConfig);

  // Check auth first so we can skip address fetch for guests
  const authStatus = await checkAuth();

  // Fetch initial data in parallel during SSR
  const [cartData, market, addressesData] = await Promise.all([
    getCheckoutOrder(cartId),
    resolveMarket(urlCountry).catch(() => null),
    authStatus ? getAddresses() : Promise.resolve({ data: [] as Address[] }),
  ]);

  // Redirect to order-placed if already complete
  if (cartData?.current_step === "complete") {
    redirect(`${basePath}/order-placed/${cartId}`);
  }

  const countriesData = market
    ? await getMarketCountries(market.id).catch(() => ({
        data: [] as Country[],
      }))
    : { data: [] as Country[] };

  // Prefetch states for the default country (warms the server cache)
  const defaultIso =
    cartData?.shipping_address?.country_iso ?? countriesData.data[0]?.iso;
  if (defaultIso) {
    getCountry(defaultIso).catch(() => {});
  }

  const initialData: CheckoutInitialData | null = cartData
    ? {
        cart: cartData,
        countries: countriesData.data,
        savedAddresses: addressesData.data,
        isAuthenticated: authStatus,
      }
    : null;

  return (
    <>
      {pageSlots.checkoutPage.beforeMain.length > 0 && (
        <PageSectionsRenderer
          sections={pageSlots.checkoutPage.beforeMain}
          basePath={basePath}
          locale={locale}
          country={urlCountry}
          currency={currency}
          keyPrefix="checkout-before"
        />
      )}
      <CheckoutPageContent
        cartId={cartId}
        urlCountry={urlCountry}
        initialData={initialData}
      />
      {pageSlots.checkoutPage.afterMain.length > 0 && (
        <PageSectionsRenderer
          sections={pageSlots.checkoutPage.afterMain}
          basePath={basePath}
          locale={locale}
          country={urlCountry}
          currency={currency}
          keyPrefix="checkout-after"
        />
      )}
    </>
  );
}

export default function CheckoutPage({ params }: CheckoutPageProps) {
  return (
    <Suspense>
      <CheckoutDataLoader params={params} />
    </Suspense>
  );
}
