import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TenantConfigProvider, useTenantConfig } from "../TenantContext";

const tenantConfig = {
  tenantId: "tenant-1",
  host: "shop.example.com",
  storeName: "Shop",
  storeDescription: "Shop description",
  defaultCountry: "us",
  defaultLocale: "en",
  spree: {
    apiUrl: "https://spree.example.com",
    publishableKey: "pub-key",
  },
  theme: {
    colors: {
      primary: "#111111",
    },
  },
  seo: {},
  navigation: {
    links: [{ label: "Products", href: "/products" }],
  },
  paymentKeys: {
    stripePublishableKey: "pk_test_123",
  },
} as never;

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <TenantConfigProvider config={tenantConfig}>
      {children}
    </TenantConfigProvider>
  );
}

describe("TenantConfigProvider", () => {
  it("returns tenant config inside the provider", () => {
    const { result } = renderHook(() => useTenantConfig(), { wrapper });

    expect(result.current).toMatchObject({
      tenantId: "tenant-1",
      host: "shop.example.com",
      spree: {
        apiUrl: "https://spree.example.com",
        publishableKey: "pub-key",
      },
      paymentKeys: {
        stripePublishableKey: "pk_test_123",
      },
    });
  });
});
