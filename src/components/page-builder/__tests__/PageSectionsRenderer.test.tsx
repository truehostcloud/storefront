import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PageSectionsRenderer } from "../PageSectionsRenderer";

vi.mock("@/components/home/FeaturedProductsSection", () => ({
  FeaturedProductsSection: ({ section }: { section: { title: string } }) => (
    <div data-testid="featured-products">{section.title}</div>
  ),
}));

vi.mock("@/components/home/FeaturesSection", () => ({
  FeaturesSection: ({ section }: { section: { title?: string } }) => (
    <div data-testid="features">{section.title ?? "features"}</div>
  ),
}));

vi.mock("@/components/home/HeroSection", () => ({
  HeroSection: ({ section }: { section: { title: string } }) => (
    <div data-testid="hero">{section.title}</div>
  ),
}));

vi.mock("@/components/page-builder/FeaturedCollectionsSection", () => ({
  FeaturedCollectionsSection: ({ section }: { section: { title: string } }) => (
    <div data-testid="featured-collections">{section.title}</div>
  ),
}));

vi.mock("@/components/page-builder/FaqSection", () => ({
  FaqSection: ({ section }: { section: { title: string } }) => (
    <div data-testid="faq">{section.title}</div>
  ),
}));

vi.mock("@/components/page-builder/TestimonialsSection", () => ({
  TestimonialsSection: ({ section }: { section: { title: string } }) => (
    <div data-testid="testimonials">{section.title}</div>
  ),
}));

vi.mock("@/components/page-builder/RichTextSection", () => ({
  RichTextSection: ({ section }: { section: { title?: string } }) => (
    <div data-testid="rich-text">{section.title ?? "rich-text"}</div>
  ),
}));

vi.mock("@/components/page-builder/ImageBannerSection", () => ({
  ImageBannerSection: ({ section }: { section: { title: string } }) => (
    <div data-testid="image-banner">{section.title}</div>
  ),
}));

describe("PageSectionsRenderer", () => {
  it("renders every supported storefront section type", () => {
    render(
      <PageSectionsRenderer
        basePath="/ke/en"
        country="ke"
        currency="KES"
        locale="en"
        sections={
          [
            { type: "hero", title: "Hero", description: "Desc" },
            { type: "features", title: "Highlights", items: [] },
            { type: "featured-products", title: "Featured" },
            { type: "featured-collections", title: "Collections" },
            { type: "faq", title: "FAQ", items: [] },
            { type: "testimonials", title: "Loved by shoppers", items: [] },
            { type: "rich-text", body: ["Paragraph"], title: "Story" },
            {
              type: "image-banner",
              title: "Banner",
              imageUrl: "https://example.com/image.jpg",
            },
          ] as never
        }
      />,
    );

    expect(screen.getByTestId("hero")).toHaveTextContent("Hero");
    expect(screen.getByTestId("features")).toHaveTextContent("Highlights");
    expect(screen.getByTestId("featured-products")).toHaveTextContent(
      "Featured",
    );
    expect(screen.getByTestId("featured-collections")).toHaveTextContent(
      "Collections",
    );
    expect(screen.getByTestId("faq")).toHaveTextContent("FAQ");
    expect(screen.getByTestId("testimonials")).toHaveTextContent(
      "Loved by shoppers",
    );
    expect(screen.getByTestId("rich-text")).toHaveTextContent("Story");
    expect(screen.getByTestId("image-banner")).toHaveTextContent("Banner");
  });

  it("ignores unsupported section types safely", () => {
    render(
      <PageSectionsRenderer
        basePath="/ke/en"
        country="ke"
        locale="en"
        sections={[{ type: "unsupported" }] as never}
      />,
    );

    expect(screen.queryByTestId("hero")).not.toBeInTheDocument();
  });
});
