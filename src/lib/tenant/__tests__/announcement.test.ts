import { describe, expect, it } from "vitest";
import { resolveTenantAnnouncementBar } from "../announcement";

describe("tenant announcement bar", () => {
  it("prefers layout-level announcement bar config", () => {
    const config = {
      raw: {
        design: {
          layout: {
            announcementBar: {
              message: "Free shipping on launch week orders",
              href: "/shop",
              label: "Browse now",
              theme: {
                background: "#111827",
                foreground: "#f8fafc",
              },
            },
          },
        },
      },
    } as never;

    expect(resolveTenantAnnouncementBar(config)).toEqual({
      message: "Free shipping on launch week orders",
      href: "/shop",
      linkLabel: "Browse now",
      backgroundColor: "#111827",
      foregroundColor: "#f8fafc",
    });
  });

  it("supports nested links, defaults, and disabled bars", () => {
    expect(
      resolveTenantAnnouncementBar({
        raw: {
          announcementBar: {
            message: "Weekend sale",
            link: { href: "/products", label: "See all" },
          },
        },
      } as never),
    ).toEqual({
      message: "Weekend sale",
      href: "/products",
      linkLabel: "See all",
      backgroundColor: undefined,
      foregroundColor: undefined,
    });

    expect(
      resolveTenantAnnouncementBar(undefined, {
        message: "Launch offer",
        href: "/products",
        linkLabel: "Shop now",
      }),
    ).toEqual({
      message: "Launch offer",
      href: "/products",
      linkLabel: "Shop now",
      backgroundColor: undefined,
      foregroundColor: undefined,
    });

    expect(
      resolveTenantAnnouncementBar({
        raw: {
          announcementBar: {
            message: "Hidden promo",
            enabled: false,
          },
        },
      } as never),
    ).toBeNull();
  });
});
