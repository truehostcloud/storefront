import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { getCategories } from "@/lib/data/categories";
import { FeaturedCollectionsSection } from "../FeaturedCollectionsSection";

vi.mock("@/lib/data/categories", () => ({
  getCategories: vi.fn(),
}));

const mockGetCategories = vi.mocked(getCategories);

describe("FeaturedCollectionsSection", () => {
  it("renders root categories when no curated items are provided", async () => {
    mockGetCategories.mockResolvedValue({
      data: [
        {
          name: "Living Room",
          permalink: "living-room",
          children: [{ id: "1" }],
        },
        { name: "Bedroom", permalink: "bedroom", children: [] },
      ],
    } as never);

    const element = await FeaturedCollectionsSection({
      basePath: "/ke/en",
      section: {
        type: "featured-collections",
        title: "Shop by room",
      },
    });

    render(element);

    expect(screen.getByText("Living Room")).toBeInTheDocument();
    expect(screen.getByText("Bedroom")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /living room/i })).toHaveAttribute(
      "href",
      "/ke/en/c/living-room",
    );
  });

  it("prefers curated items and preserves CTA links", async () => {
    mockGetCategories.mockResolvedValue({
      data: [{ name: "Outdoor", permalink: "outdoor", children: [] }],
    } as never);

    const element = await FeaturedCollectionsSection({
      basePath: "/ke/en",
      section: {
        type: "featured-collections",
        title: "Explore collections",
        cta: {
          label: "See everything",
          href: "/products",
        },
        items: [
          {
            title: "Outdoor living",
            description: "Spaces designed for open-air comfort.",
            href: "/collections/outdoor-living",
          },
        ],
      },
    });

    render(element);

    expect(screen.getByText("Outdoor living")).toBeInTheDocument();
    expect(
      screen.getByText("Spaces designed for open-air comfort."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /see everything/i }),
    ).toHaveAttribute("href", "/ke/en/products");
    expect(
      screen.getByRole("link", { name: /outdoor living/i }),
    ).toHaveAttribute("href", "/ke/en/collections/outdoor-living");
  });

  it("builds curated cards from matched categories when only permalinks are provided", async () => {
    mockGetCategories.mockResolvedValue({
      data: [
        {
          name: "Outdoor",
          permalink: "outdoor",
          children: [{ id: "chairs" }, { id: "tables" }],
        },
      ],
    } as never);

    const element = await FeaturedCollectionsSection({
      basePath: "/ke/en",
      section: {
        type: "featured-collections",
        title: "Browse categories",
        items: [{ categoryPermalink: "outdoor" }],
      },
    });

    render(element);

    expect(screen.getByText("Outdoor")).toBeInTheDocument();
    expect(
      screen.getByText("2 curated categories ready to explore."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /outdoor/i })).toHaveAttribute(
      "href",
      "/ke/en/c/outdoor",
    );
  });

  it("shows an empty state when no valid collection cards can be resolved", async () => {
    mockGetCategories.mockRejectedValue(new Error("categories unavailable"));

    const element = await FeaturedCollectionsSection({
      basePath: "/ke/en",
      section: {
        type: "featured-collections",
        title: "Browse categories",
        items: [{}],
      },
    });

    render(element);

    expect(
      screen.getByText("Collections will appear here soon."),
    ).toBeInTheDocument();
  });
});
