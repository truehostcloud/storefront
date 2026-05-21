import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

vi.mock("@/components/layout/AnnouncementBar", () => ({
  AnnouncementBar: ({
    announcementBar,
  }: {
    announcementBar: { message: string };
  }) => <div data-testid="announcement-bar">{announcementBar.message}</div>,
}));

vi.mock("@/components/layout/Header", () => ({
  Header: () => <div data-testid="header">header</div>,
}));

vi.mock("@/components/layout/Footer", () => ({
  Footer: () => <div data-testid="footer">footer</div>,
}));

vi.mock("@/lib/data/categories", () => ({
  getCategories: vi.fn().mockResolvedValue({ data: [] }),
}));

vi.mock("@/lib/tenant", () => ({
  getTenantConfigByHost: vi.fn().mockResolvedValue({ raw: {} }),
  resolveTenantAnnouncementBar: vi.fn().mockReturnValue({
    message: "Free delivery this week",
    linkLabel: "Shop now",
    href: "/products",
  }),
}));

vi.mock("@/lib/tenant/request", () => ({
  getRequestHost: vi.fn().mockReturnValue("aurora.example.com"),
}));

import { getCategories } from "@/lib/data/categories";
import {
  getTenantConfigByHost,
  resolveTenantAnnouncementBar,
} from "@/lib/tenant";
import StorefrontLayout from "../layout";

const mockGetCategories = vi.mocked(getCategories);
const mockGetTenantConfigByHost = vi.mocked(getTenantConfigByHost);
const mockResolveTenantAnnouncementBar = vi.mocked(
  resolveTenantAnnouncementBar,
);

describe("StorefrontLayout", () => {
  it("renders the global announcement bar before the storefront chrome", async () => {
    mockGetCategories.mockResolvedValueOnce({ data: [] } as never);
    mockGetTenantConfigByHost.mockResolvedValueOnce({ raw: {} } as never);
    mockResolveTenantAnnouncementBar.mockReturnValueOnce({
      message: "Free delivery this week",
      linkLabel: "Shop now",
      href: "/products",
    });

    const element = await StorefrontLayout({
      children: <div>Page body</div>,
      params: Promise.resolve({ country: "ke", locale: "en" }),
    });

    render(element);

    expect(screen.getByTestId("announcement-bar")).toHaveTextContent(
      "Free delivery this week",
    );
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByText("Page body")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });

  it("renders category navigation when categories exist and no announcement is configured", async () => {
    mockGetCategories.mockResolvedValueOnce({
      data: [
        {
          id: "root-1",
          name: "Living Room",
          permalink: "living-room",
          children: [
            {
              id: "child-1",
              name: "Lighting",
              permalink: "lighting",
              children: [],
            },
          ],
        },
      ],
    } as never);
    mockGetTenantConfigByHost.mockResolvedValueOnce({ raw: {} } as never);
    mockResolveTenantAnnouncementBar.mockReturnValueOnce(null);

    const element = await StorefrontLayout({
      children: <div>Category page</div>,
      params: Promise.resolve({ country: "ke", locale: "en" }),
    });

    render(element);

    expect(screen.queryByTestId("announcement-bar")).not.toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "Category navigation" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Living Room" })).toHaveAttribute(
      "href",
      "/ke/en/c/living-room",
    );
    expect(screen.getByRole("link", { name: "Lighting" })).toHaveAttribute(
      "href",
      "/ke/en/c/lighting",
    );
  });

  it("falls back to an empty category list when category loading fails", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    mockGetCategories.mockRejectedValueOnce(new Error("boom"));
    mockGetTenantConfigByHost.mockResolvedValueOnce({ raw: {} } as never);
    mockResolveTenantAnnouncementBar.mockReturnValueOnce(null);

    const element = await StorefrontLayout({
      children: <div>Fallback page</div>,
      params: Promise.resolve({ country: "ke", locale: "en" }),
    });

    render(element);

    expect(
      screen.queryByRole("navigation", { name: "Category navigation" }),
    ).not.toBeInTheDocument();
    expect(consoleError).toHaveBeenCalledWith(
      "StorefrontLayout: failed to load categories",
      expect.any(Error),
    );

    consoleError.mockRestore();
  });
});
