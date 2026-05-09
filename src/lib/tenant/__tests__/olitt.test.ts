import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  buildTenantConfigFromRecord,
  findOlittStoreRecord,
  normalizeHost,
} from "../normalize";
import { fetchTenantConfigFromOlitt } from "../olitt";

describe("tenant Olitt config helpers", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("normalizes hosts by removing protocol, port, and path", () => {
    expect(normalizeHost("HTTPS://Shop.Example.com:3000/products")).toBe(
      "shop.example.com",
    );
    expect(normalizeHost("demo.localhost:3001")).toBe("demo.localhost");
    expect(normalizeHost("demo.localhost:3001", { preservePort: true })).toBe(
      "demo.localhost:3001",
    );
    expect(normalizeHost("   ")).toBeNull();
  });

  it("finds a store record in an Olitt payload", () => {
    const payload = {
      store: {
        olittDomain: "beta.example.com",
        customDomain: "www.beta.example.com",
        name: "Beta Store",
      },
    };

    expect(findOlittStoreRecord(payload, "beta.example.com")).toEqual({
      olittDomain: "beta.example.com",
      customDomain: "www.beta.example.com",
      name: "Beta Store",
    });
  });

  it("builds a normalized tenant config from an Olitt record", () => {
    const config = buildTenantConfigFromRecord(
      {
        id: "tenant-123",
        olittDomain: "brand.example.com",
        name: "Brand Store",
        description: "Great products",
        defaultCountry: "us",
        defaultLocale: "en",
        spreeApiUrl: "https://spree.example.com",
        spreePublishableKey: "spree-pk",
        paymentKeys: {
          stripePublishableKey: "pk_test_123",
        },
        theme: { colors: { primary: "#000000" } },
      },
      "brand.example.com:3000",
    );

    expect(config).toMatchObject({
      tenantId: "tenant-123",
      host: "brand.example.com:3000",
      storeName: "Brand Store",
      storeDescription: "Great products",
      defaultCountry: "us",
      defaultLocale: "en",
      spree: {
        apiUrl: "https://spree.example.com",
        publishableKey: "spree-pk",
      },
      paymentKeys: {
        stripePublishableKey: "pk_test_123",
      },
      source: "olitt",
    });
  });

  it("reads Spree config from the documented Olitt root fields", () => {
    const config = buildTenantConfigFromRecord(
      {
        olittDomain: "brand.example.com",
        spreeApiUrl: "https://tenant-spree.example.com",
        spreePublishableKey: "tenant-key",
      },
      "brand.example.com",
    );

    expect(config.spree).toEqual({
      apiUrl: "https://tenant-spree.example.com",
      publishableKey: "tenant-key",
    });
  });

  it("uses a mocked Olitt response for a local host", async () => {
    vi.stubEnv("OLITT_API_URL", "https://olitt.example.com");
    vi.stubEnv(
      "OLITT_MOCK_RESPONSES",
      JSON.stringify([
        {
          host: "testshop.localhost:3001",
          response: {
            store: {
              olittDomain: "testshop.localhost:5000",
              name: "Mock Store",
              description: "Mock store description",
              defaultCountry: "us",
              defaultLocale: "en-us",
              spreeApiUrl: "https://spree.example.com",
              spreePublishableKey: "spree-public-key",
              paymentKeys: {
                stripePublishableKey: "pk_test_mock",
              },
              branding: {
                logo: null,
                name: "Mock Store",
                tagline: "Mock tagline",
                social_links: [],
              },
              theme: {
                colors: {},
                spacing: {},
                custom_css: "",
                typography: {},
              },
              design: {
                layout: { pages: [], footer: {}, sections: [], navigation: [] },
                style: {
                  colors: {},
                  spacing: {},
                  custom_css: "",
                  typography: {},
                },
              },
              seo: {
                socials: [],
                description: "",
                siteUrl: "https://testshop.localhost:5000",
              },
              navigation: { links: [] },
            },
          },
        },
      ]),
    );

    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => null,
    } as Response);

    const config = await fetchTenantConfigFromOlitt("testshop.localhost:3001");

    expect(fetchMock).not.toHaveBeenCalled();
    expect(config).toEqual(
      expect.objectContaining({
        host: "testshop.localhost:5000",
        storeName: "Mock Store",
        storeDescription: "Mock store description",
        defaultCountry: "us",
        defaultLocale: "en-us",
        spree: {
          apiUrl: "https://spree.example.com",
          publishableKey: "spree-public-key",
        },
        paymentKeys: {
          stripePublishableKey: "pk_test_mock",
        },
        source: "olitt",
      }),
    );
  });
  it("returns null when Olitt returns 404", async () => {
    vi.stubEnv("OLITT_API_URL", "https://olitt.example.com");
    vi.stubEnv("OLITT_API_TOKEN", "secret-token");

    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => null,
    } as Response);

    const config = await fetchTenantConfigFromOlitt("localhost:3000");

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(config).toBeNull();
  });

  it("returns null when a mocked payload does not match the host", async () => {
    vi.stubEnv("OLITT_API_URL", "https://olitt.example.com");
    vi.stubEnv(
      "OLITT_MOCK_RESPONSES",
      JSON.stringify([
        {
          host: "other.localhost",
          response: { store: { olittDomain: "other.localhost" } },
        },
      ]),
    );

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => null,
    } as Response);

    await expect(
      fetchTenantConfigFromOlitt("shop.localhost:3001"),
    ).resolves.toBeNull();
  });
});
