import { describe, expect, it } from "vitest";

import {
  getDynamicPagesConfig,
  listDynamicPageSlugs,
  resolveDynamicPage,
} from "./index";

describe("dynamic pages config", () => {
  it("reads nested layout pages from tenant config", () => {
    const config = getDynamicPagesConfig(
      { storeName: "Jishop" },
      {
        design: {
          layout: {
            pages: [
              {
                slug: "shipping-exchange",
                title: "Shipping & Exchange Policy",
                description:
                  "Everything you need to know about delivery and exchanges.",
                sections: [
                  {
                    type: "hero",
                    title: "Our Commitment to You",
                    description:
                      "Transparent shipping and a fair exchange policy.",
                  },
                  {
                    type: "rich-text",
                    title: "Shipping & Exchange Policy",
                    body: ["Shipping details", "Exchange details"],
                  },
                ],
                is_homepage: false,
              },
            ],
          },
        },
      },
    );

    const page = resolveDynamicPage(config, ["shipping-exchange"]);

    expect(page).toMatchObject({
      slug: "shipping-exchange",
      title: "Shipping & Exchange Policy",
    });
    expect(page?.sections.map((section) => section.type)).toEqual([
      "hero",
      "rich-text",
    ]);
  });

  it("supports direct and nested dynamic page payloads", () => {
    const directConfig = getDynamicPagesConfig(
      { storeName: "Jishop" },
      {
        version: 1,
        pages: [
          {
            slug: "faq",
            title: "FAQ",
            sections: [
              {
                type: "rich-text",
                body: ["Answers to common questions"],
              },
            ],
          },
        ],
      },
    );
    const nestedConfig = getDynamicPagesConfig(
      { storeName: "Jishop" },
      {
        dynamicPages: {
          version: 1,
          pages: [
            {
              slug: "contact",
              title: "Contact",
              sections: [
                {
                  type: "hero",
                  title: "Talk to us",
                  description: "We are ready to help.",
                },
              ],
            },
          ],
        },
      },
    );

    expect(resolveDynamicPage(directConfig, "faq")?.title).toBe("FAQ");
    expect(
      resolveDynamicPage(nestedConfig, ["contact"])?.sections,
    ).toHaveLength(1);
  });

  it("merges root pages, exposes slugs, and falls back to defaults for invalid input", () => {
    const config = getDynamicPagesConfig(
      { storeName: "Jishop" },
      {
        pages: [
          {
            slug: "about/brand-story",
            title: "About Jishop",
            seo: {
              title: "About Jishop Updated",
            },
            sections: [
              {
                type: "hero",
                title: "Updated story",
                description: "Our updated brand story.",
              },
            ],
          },
          {
            slug: "policies/shipping",
            title: "Shipping Policy",
            sections: [
              {
                type: "rich-text",
                body: ["Shipping policy details"],
              },
            ],
          },
        ],
      },
    );
    const defaultConfig = getDynamicPagesConfig(
      { storeName: "Jishop" },
      { foo: "bar" },
    );

    expect(resolveDynamicPage(config, "about/brand-story")).toMatchObject({
      title: "About Jishop",
      seo: {
        title: "About Jishop Updated",
      },
    });
    expect(resolveDynamicPage(config, "policies/shipping")).toMatchObject({
      title: "Shipping Policy",
    });
    expect(listDynamicPageSlugs(config)).toEqual(
      expect.arrayContaining(["about/brand-story", "policies/shipping"]),
    );
    expect(resolveDynamicPage(config, [])).toBeNull();
    expect(defaultConfig.pages[0]).toMatchObject({
      slug: "about/brand-story",
    });
  });

  it("falls back cleanly when pages are missing or layout payloads are malformed", () => {
    const nullSourceConfig = getDynamicPagesConfig(
      { storeName: "Jishop" },
      null,
    );
    const noPagesConfig = getDynamicPagesConfig(
      { storeName: "Jishop" },
      {
        version: 1,
      },
    );
    const malformedLayoutConfig = getDynamicPagesConfig(
      { storeName: "Jishop" },
      {
        design: {
          layout: [],
        },
      },
    );
    const layoutWithoutPagesConfig = getDynamicPagesConfig(
      { storeName: "Jishop" },
      {
        design: {
          layout: {
            navigation: [],
          },
        },
      },
    );

    expect(noPagesConfig.pages[0]).toMatchObject({
      slug: "about/brand-story",
    });
    expect(nullSourceConfig.pages[0]).toMatchObject({
      slug: "about/brand-story",
    });
    expect(malformedLayoutConfig.pages[0]).toMatchObject({
      slug: "about/brand-story",
    });
    expect(layoutWithoutPagesConfig.pages[0]).toMatchObject({
      slug: "about/brand-story",
    });
  });
});
