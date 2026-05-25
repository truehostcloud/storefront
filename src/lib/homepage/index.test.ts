import { describe, expect, it } from "vitest";

import {
  getDefaultHomepageConfig,
  getHomepageConfig,
  getHomepageSections,
} from "./index";

describe("homepage config", () => {
  it("builds homepage sections from tenant layout pages", () => {
    const config = getHomepageConfig(
      { storeName: "Jishop" },
      {
        design: {
          layout: {
            pages: [
              {
                slug: "index",
                title: "Home",
                summary:
                  "Kenya's premier destination for curated formal and casual wear.",
                sections: ["hero", "highlights", "trust", "cta"],
                is_homepage: true,
              },
            ],
          },
        },
      },
    );

    expect(config.sections.map((section) => section.type)).toEqual([
      "hero",
      "features",
      "features",
      "featured-products",
    ]);
    expect(config.sections[0]).toMatchObject({
      title: "Jishop curated for modern living",
      description:
        "Kenya's premier destination for curated formal and casual wear.",
    });
  });

  it("prefers layout.homepage over non-home content pages", () => {
    const config = getHomepageConfig(
      { storeName: "Jishop" },
      {
        design: {
          layout: {
            homepage: {
              version: 1,
              sections: [
                {
                  type: "hero",
                  title: "Elevated Style for the Modern Kenyan",
                },
                {
                  type: "features",
                  title: "The Jishop Standard",
                  items: [
                    {
                      icon: "sparkles",
                      title: "Styled to stand out",
                      description: "Curated details for everyday wear.",
                    },
                  ],
                },
                {
                  type: "features",
                  title: "Why choose Jishop",
                  items: [
                    {
                      icon: "truck",
                      title: "Fast Nationwide Shipping",
                      description:
                        "Receive your order within 1 to 3 business days.",
                    },
                  ],
                },
                {
                  type: "featured-products",
                  title: "Trending Now",
                },
              ],
            },
            pages: [
              {
                slug: "shipping-exchange",
                title: "Shipping & Exchange Policy",
                summary: "Delivery times and exchange criteria.",
                sections: [
                  {
                    type: "hero",
                    title: "Our Commitment to You",
                  },
                  {
                    type: "rich-text",
                    body: ["Shipping details"],
                  },
                ],
                is_homepage: false,
              },
            ],
          },
        },
      },
    );

    expect(config.sections.map((section) => section.type)).toEqual([
      "hero",
      "features",
      "features",
      "featured-products",
    ]);
    expect(config.sections[0]).toMatchObject({
      title: "Elevated Style for the Modern Kenyan",
    });
    expect(config.sections[1]).toMatchObject({
      title: "The Jishop Standard",
    });
    expect(config.sections[2]).toMatchObject({
      title: "Why choose Jishop",
    });
    expect(config.sections[3]).toMatchObject({
      title: "Trending Now",
    });
  });

  it("reads a direct source.homepage override", () => {
    const config = getHomepageConfig(
      { storeName: "Jishop" },
      {
        homepage: {
          version: 1,
          sections: [
            {
              type: "hero",
              title: "Homepage from source.homepage",
            },
          ],
        },
      },
    );

    expect(config.sections).toHaveLength(1);
    expect(config.sections[0]).toMatchObject({
      type: "hero",
      title: "Homepage from source.homepage",
    });
  });

  it("falls back to the first layout page when no homepage is marked", () => {
    const config = getHomepageConfig(
      { storeName: "Jishop" },
      {
        design: {
          layout: {
            pages: [
              {
                slug: "shipping-exchange",
                title: "Shipping & Exchange Policy",
                summary: "Delivery times and exchange criteria.",
                sections: ["hero", "cta"],
              },
            ],
          },
        },
      },
    );

    expect(config.sections.map((section) => section.type)).toEqual([
      "hero",
      "featured-products",
    ]);
    expect(config.sections[0]).toMatchObject({
      title: "Shipping & Exchange Policy",
      description: "Delivery times and exchange criteria.",
    });
  });

  it("returns the default homepage config for unrelated payloads", () => {
    const config = getHomepageConfig({ storeName: "Jishop" }, { foo: "bar" });

    expect(config.sections.map((section) => section.type)).toEqual([
      "hero",
      "features",
      "featured-products",
    ]);
  });

  it("interpolates the default homepage config and exposes sections", () => {
    const config = getDefaultHomepageConfig({ storeName: "Jishop" });

    expect(config.sections[0]).toMatchObject({
      title: "Jishop curated for modern living",
    });
    expect(getHomepageSections(config)).toEqual(config.sections);
  });

  it("falls back to defaults for malformed homepage payloads", () => {
    const malformedLayoutConfig = getHomepageConfig(
      { storeName: "Jishop" },
      {
        design: {
          layout: {
            homepage: { theme: { accent: "#000000" } },
          },
        },
      },
    );
    const invalidSectionsConfig = getHomepageConfig(
      { storeName: "Jishop" },
      {
        version: 1,
        sections: [{}],
      },
    );

    expect(
      malformedLayoutConfig.sections.map((section) => section.type),
    ).toEqual(["hero", "features", "featured-products"]);
    expect(
      invalidSectionsConfig.sections.map((section) => section.type),
    ).toEqual(["hero", "features", "featured-products"]);
  });
});
