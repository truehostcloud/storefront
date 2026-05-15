import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  getTenantConfigFromRequest: vi.fn(),
}));

vi.mock("@/lib/tenant/request", () => ({
  getTenantConfigFromRequest: mocks.getTenantConfigFromRequest,
}));

vi.mock("@spree/sdk", () => ({
  createClient: mocks.createClient,
}));

import {
  getClient,
  getSpreeCacheScope,
  resetClient,
  resolveSpreeConfig,
} from "./config";

describe("spree config", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    resetClient();

    mocks.createClient.mockImplementation(
      ({
        baseUrl,
        publishableKey,
      }: {
        baseUrl: string;
        publishableKey: string;
      }) => ({
        markets: {
          list: vi.fn().mockResolvedValue({ baseUrl, publishableKey }),
        },
      }),
    );
  });

  it("prefers tenant Spree credentials over env defaults", async () => {
    mocks.getTenantConfigFromRequest.mockResolvedValue({
      defaultCountry: "gb",
      defaultLocale: "en-GB",
      spree: {
        apiUrl: "https://tenant.example.com",
        publishableKey: "tenant-key",
      },
    });

    await expect(resolveSpreeConfig()).resolves.toMatchObject({
      baseUrl: "https://tenant.example.com",
      publishableKey: "tenant-key",
      defaultCountry: "gb",
      defaultLocale: "en-GB",
    });
  });

  it("routes client calls through the tenant-specific Spree client", async () => {
    mocks.getTenantConfigFromRequest.mockResolvedValue({
      spree: {
        apiUrl: "https://tenant.example.com",
        publishableKey: "tenant-key",
      },
    });

    await expect(getClient().markets.list({ locale: "en" })).resolves.toEqual({
      baseUrl: "https://tenant.example.com",
      publishableKey: "tenant-key",
    });
    expect(mocks.createClient).toHaveBeenCalledWith({
      baseUrl: "https://tenant.example.com",
      publishableKey: "tenant-key",
    });
  });

  it("builds cache scope from the active tenant credentials", async () => {
    const config = {
      baseUrl: "https://tenant.example.com",
      publishableKey: "tenant-key",
      defaultCountry: "us",
      defaultLocale: "en",
    };

    expect(getSpreeCacheScope(config)).toBe(
      "https://tenant.example.com::tenant-key",
    );
  });

  it("does not silently fall back when tenant resolution throws", async () => {
    mocks.getTenantConfigFromRequest.mockRejectedValue(
      new Error("olitt unavailable"),
    );

    await expect(resolveSpreeConfig()).rejects.toThrow("olitt unavailable");
  });
});
