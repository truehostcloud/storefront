import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getTenantBrandName,
  getTenantDescription,
  getTenantLogoUrl,
  getTenantNavigationLinks,
  getTenantSiteUrl,
  getTenantSocialLinks,
  getTenantTwitterHandle,
} from "../surface";

describe("tenant surface helpers", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("reads surface values from tenant config", () => {
    const config = {
      tenantId: "tenant-1",
      host: "shop.example.com",
      storeName: "Brand Store",
      storeDescription: "Brand description",
      storeUrl: "https://shop.example.com",
      defaultCountry: "us",
      defaultLocale: "en",
      spree: {
        apiUrl: "https://spree.example.com",
        publishableKey: "pub-key",
      },
      paymentKeys: {},
      theme: {
        logoUrl: "https://cdn.example.com/logo.svg",
      },
      seo: {
        twitter: "brand",
        socials: ["https://instagram.com/brand"],
      },
      navigation: {
        links: [{ label: "Products", href: "/products" }],
      },
      raw: {},
      source: "olitt",
      fetchedAt: new Date().toISOString(),
    } as never;

    expect(getTenantBrandName(config)).toBe("Brand Store");
    expect(getTenantDescription(config)).toBe("Brand description");
    expect(getTenantSiteUrl(config)).toBe("https://shop.example.com");
    expect(getTenantLogoUrl(config)).toBe("https://cdn.example.com/logo.svg");
    expect(getTenantTwitterHandle(config)).toBe("brand");
    expect(getTenantSocialLinks(config)).toEqual([
      "https://instagram.com/brand",
    ]);
    expect(getTenantNavigationLinks(config)).toEqual([
      { label: "Products", href: "/products" },
    ]);
  });
});
