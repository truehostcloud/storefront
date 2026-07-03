import { describe, expect, it } from "vitest";
import { getHomepageConfig } from "./index";

const variables = { storeName: "Nairobi Sourdough" };

function tenantSource() {
  return {
    name: "Nairobi Sourdough",
    design: {
      layout: {
        homepage: {
          version: 1,
          sections: [
            {
              type: "hero",
              title: "Fresh Sourdough",
              description: "Baked daily in Nairobi",
              badge: "",
              stats: [],
              media: {
                imageUrl: "https://s3.test/product.jpg",
                alt: "Fresh Sourdough",
                floatingBadgeTitle: "",
                floatingBadgeLabel: "",
                secondaryBadgeTitle: "",
                secondaryBadgeLabel: "",
              },
            },
            { type: "features" },
            { type: "featured-products" },
          ],
        },
      },
    },
  };
}

describe("getHomepageConfig", () => {
  it("reads the tenant homepage nested at design.layout.homepage", () => {
    const config = getHomepageConfig(variables, tenantSource());
    const hero = config.sections.find((section) => section.type === "hero");

    expect(hero?.title).toBe("Fresh Sourdough");
    expect(hero?.stats).toEqual([]);
    expect(hero?.media?.imageUrl).toBe("https://s3.test/product.jpg");
  });

  it("does not leak default social proof when the tenant clears it", () => {
    const config = getHomepageConfig(variables, tenantSource());
    const hero = config.sections.find((section) => section.type === "hero");
    const statValues = (hero?.stats ?? []).map((stat) => stat.value);

    expect(statValues).not.toContain("50k+");
    expect(hero?.media?.floatingBadgeLabel).not.toBe("To Los Angeles, CA");
  });

  it("keeps every tenant section type in order", () => {
    const config = getHomepageConfig(variables, tenantSource());

    expect(config.sections.map((section) => section.type)).toEqual([
      "hero",
      "features",
      "featured-products",
    ]);
  });

  it("falls back to the interpolated default when no homepage is present", () => {
    const config = getHomepageConfig(variables, { name: "Nairobi Sourdough" });
    const hero = config.sections.find((section) => section.type === "hero");

    expect(hero?.title).toBe("Nairobi Sourdough curated for modern living");
  });
});
