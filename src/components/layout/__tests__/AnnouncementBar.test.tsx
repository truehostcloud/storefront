import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AnnouncementBar } from "../AnnouncementBar";

describe("AnnouncementBar", () => {
  it("renders the announcement message and resolves internal links", () => {
    render(
      <AnnouncementBar
        basePath="/ke/en"
        announcementBar={{
          message: "Free delivery on Nairobi orders over KES 5,000",
          href: "/products",
          linkLabel: "Shop now",
        }}
      />,
    );

    expect(
      screen.getByText("Free delivery on Nairobi orders over KES 5,000"),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Shop now" })).toHaveAttribute(
      "href",
      "/ke/en/products",
    );
  });

  it("preserves absolute links and supports announcement bars without CTAs", () => {
    const { rerender } = render(
      <AnnouncementBar
        basePath="/ke/en"
        announcementBar={{
          message: "Same-day support available",
          href: "https://example.com/support",
          linkLabel: "Get help",
        }}
      />,
    );

    expect(screen.getByRole("link", { name: "Get help" })).toHaveAttribute(
      "href",
      "https://example.com/support",
    );

    rerender(
      <AnnouncementBar
        basePath="/ke/en"
        announcementBar={{
          message: "Pickup is now available downtown",
          linkLabel: "Learn more",
        }}
      />,
    );

    expect(
      screen.queryByRole("link", { name: "Learn more" }),
    ).not.toBeInTheDocument();
  });

  it("handles root and already-prefixed internal paths", () => {
    const { rerender } = render(
      <AnnouncementBar
        basePath="/ke/en"
        announcementBar={{
          message: "Open the full storefront",
          href: "/",
          linkLabel: "Home",
        }}
      />,
    );

    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute(
      "href",
      "/ke/en",
    );

    rerender(
      <AnnouncementBar
        basePath="/ke/en"
        announcementBar={{
          message: "Browse the sale",
          href: "/ke/en/products",
          linkLabel: "Sale",
        }}
      />,
    );

    expect(screen.getByRole("link", { name: "Sale" })).toHaveAttribute(
      "href",
      "/ke/en/products",
    );
  });
});
