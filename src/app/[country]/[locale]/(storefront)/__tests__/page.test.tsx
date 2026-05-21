import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/page-builder/PageSectionsRenderer", () => ({
  PageSectionsRenderer: ({
    sections,
  }: {
    sections: Array<{ type: string; title?: string }>;
  }) => (
    <div data-testid="page-sections-renderer">
      {sections.map((section, index) => (
        <span key={`${section.type}-${index}`}>
          {section.title ?? section.type}
        </span>
      ))}
    </div>
  ),
}));

vi.mock("@/lib/data/markets", () => ({
  getMarkets: vi.fn(),
  resolveCurrency: vi.fn().mockResolvedValue("USD"),
}));

vi.mock("@/lib/homepage", () => ({
  getHomepageConfig: vi.fn(),
  getHomepageSections: vi.fn(),
}));

vi.mock("@/lib/metadata/home", () => ({
  generateHomeMetadata: vi.fn(),
}));

vi.mock("@/lib/store", () => ({
  getDefaultCountry: vi.fn().mockReturnValue("us"),
  getDefaultLocale: vi.fn().mockReturnValue("en"),
  getStoreName: vi.fn().mockReturnValue("Default Store"),
}));

vi.mock("@/lib/tenant/request", () => ({
  getTenantConfigFromRequest: vi.fn(),
}));

vi.mock("@/lib/tenant/surface", () => ({
  getTenantBrandName: vi.fn().mockReturnValue("Jishop"),
}));

import { getMarkets } from "@/lib/data/markets";
import { getHomepageConfig, getHomepageSections } from "@/lib/homepage";
import { generateHomeMetadata } from "@/lib/metadata/home";
import { getTenantConfigFromRequest } from "@/lib/tenant/request";
import HomePage, { generateMetadata, generateStaticParams } from "../page";

const mockGetMarkets = vi.mocked(getMarkets);
const mockGetHomepageConfig = vi.mocked(getHomepageConfig);
const mockGetHomepageSections = vi.mocked(getHomepageSections);
const mockGenerateHomeMetadata = vi.mocked(generateHomeMetadata);
const mockGetTenantConfigFromRequest = vi.mocked(getTenantConfigFromRequest);

describe("HomePage", () => {
  it("delegates homepage sections to the shared renderer in order", async () => {
    mockGetTenantConfigFromRequest.mockResolvedValue({
      raw: {},
    } as never);
    mockGetHomepageConfig.mockReturnValue({
      version: 1,
      sections: [
        { type: "hero", title: "Hero" },
        { type: "features", title: "Features A", items: [] },
        { type: "featured-collections", title: "Collections" },
        {
          type: "faq",
          title: "Questions",
          items: [],
        },
      ],
    } as never);
    mockGetHomepageSections.mockReturnValue([
      { type: "hero", title: "Hero" },
      { type: "features", title: "Features A", items: [] },
      { type: "featured-collections", title: "Collections" },
      { type: "faq", title: "Questions", items: [] },
    ] as never);

    const element = await HomePage({
      params: Promise.resolve({ country: "ke", locale: "en" }),
    });

    render(element);

    expect(screen.getByText("Hero")).toBeInTheDocument();
    expect(screen.getByText("Features A")).toBeInTheDocument();
    expect(screen.getByText("Collections")).toBeInTheDocument();
    expect(screen.getByText("Questions")).toBeInTheDocument();
    expect(screen.getByTestId("page-sections-renderer")).toBeInTheDocument();
  });

  it("returns fallback static params when markets fail", async () => {
    mockGetMarkets.mockRejectedValue(new Error("boom"));

    await expect(generateStaticParams()).resolves.toEqual([
      { country: "us", locale: "en" },
    ]);
  });

  it("deduplicates market country and locale pairs", async () => {
    mockGetMarkets.mockResolvedValue({
      data: [
        {
          default_locale: "en",
          countries: [{ iso: "US" }, { iso: "KE" }, { iso: "US" }],
        },
        {
          default_locale: "fr",
          countries: [{ iso: "FR" }],
        },
      ],
    } as never);

    await expect(generateStaticParams()).resolves.toEqual([
      { country: "us", locale: "en" },
      { country: "ke", locale: "en" },
      { country: "fr", locale: "fr" },
    ]);
  });

  it("proxies homepage metadata generation", async () => {
    mockGenerateHomeMetadata.mockResolvedValue({ title: "Home" } as never);

    await expect(
      generateMetadata({
        params: Promise.resolve({ country: "ke", locale: "en" }),
      }),
    ).resolves.toEqual({ title: "Home" });

    expect(mockGenerateHomeMetadata).toHaveBeenCalledWith({
      country: "ke",
      locale: "en",
    });
  });
});
