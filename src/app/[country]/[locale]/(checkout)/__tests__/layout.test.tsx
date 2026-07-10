import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/contexts/CheckoutContext", () => ({
  CheckoutProvider: ({ children }: { children: ReactNode }) => children,
  CheckoutSummary: () => null,
}));

vi.mock("@/contexts/TenantContext", () => ({
  useTenantConfig: () => ({ storeName: "Test Store" }),
}));

import CheckoutLayout from "../layout";

describe("CheckoutLayout branding", () => {
  it("renders the OLITT logo and never the Spree logo", () => {
    render(
      <CheckoutLayout>
        <div>checkout body</div>
      </CheckoutLayout>,
    );

    const logos = screen.getAllByRole("img");
    expect(logos.length).toBeGreaterThan(0);
    for (const logo of logos) {
      expect(logo).toHaveAttribute("src", "/olitt-logo.svg");
    }
    expect(
      logos.some((logo) => logo.getAttribute("src")?.includes("spree")),
    ).toBe(false);
  });
});
