import { describe, expect, it } from "vitest";

import { resolveTenantFooter, resolveTenantNavigation } from "../resolvers";

describe("tenant resolvers", () => {
  it("prefers layout navigation arrays over the root navigation links", () => {
    const config = {
      storeName: "Jishop",
      storeDescription: "Shop the latest trends",
      theme: {},
      seo: {},
      navigation: {
        links: [{ label: "Root Home", href: "/root" }],
      },
      raw: {
        design: {
          layout: {
            navigation: [
              { label: "Home", href: "/" },
              { label: "Shop All", href: "/shop" },
            ],
            footer: {
              copy: "© 2026 Jishop Kenya. All rights reserved.",
            },
          },
        },
      },
    } as never;

    const navigation = resolveTenantNavigation(config);
    const footer = resolveTenantFooter(config);

    expect(navigation.headerLinks).toEqual([
      { label: "Home", href: "/" },
      { label: "Shop All", href: "/shop" },
    ]);
    expect(footer.description).toBe(
      "© 2026 Jishop Kenya. All rights reserved.",
    );
  });
});
