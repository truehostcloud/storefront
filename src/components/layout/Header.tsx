import type { Category } from "@spree/sdk";
import { User } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { CartButton } from "@/components/layout/CartButton";
import { SearchToggle } from "@/components/layout/SearchToggle";
import { Button } from "@/components/ui/button";
import { getStoreName } from "@/lib/store";
import type { TenantConfig } from "@/lib/tenant";
import { resolveTenantBranding, resolveTenantNavigation } from "@/lib/tenant";

const LazyMobileMenu = dynamic(
  () =>
    import("@/components/layout/MobileMenu").then((mod) => ({
      default: mod.MobileMenu,
    })),
  {
    loading: () => (
      <div className="inline-flex items-center justify-center h-10 w-10" />
    ),
  },
);

const LazyCountrySwitcher = dynamic(
  () =>
    import("@/components/layout/CountrySwitcher").then((mod) => ({
      default: mod.CountrySwitcher,
    })),
  {
    loading: () => (
      <div className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-400">
        <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
      </div>
    ),
  },
);

interface HeaderProps {
  rootCategories: Category[];
  basePath: string;
  locale: Locale;
  tenantConfig?: TenantConfig | null;
}

export async function Header({
  rootCategories,
  basePath,
  locale,
  tenantConfig,
}: HeaderProps) {
  const t = await getTranslations({ locale, namespace: "header" });
  const branding = resolveTenantBranding(tenantConfig, {
    name: getStoreName(),
    logoUrl: "/olitt-logo.svg",
  });
  const navigation = resolveTenantNavigation(tenantConfig);

  return (
    <SearchToggle
      basePath={basePath}
      left={
        <LazyMobileMenu rootCategories={rootCategories} basePath={basePath} />
      }
      center={
        <Link href={basePath || "/"} className="flex items-center min-w-0">
          <Image
            src={branding.logoUrl ?? "/olitt-logo.svg"}
            alt={branding.name ?? getStoreName()}
            width={90}
            height={32}
            className="max-w-full object-contain"
            style={{ width: "auto", height: "32px" }}
            fetchPriority="high"
            loading="eager"
          />
        </Link>
      }
      rightStart={
        <div className="hidden lg:flex items-center gap-4">
          {navigation.headerLinks.length > 0 && (
            <nav
              aria-label="Tenant navigation"
              className="hidden xl:flex gap-4 text-sm"
            >
              {navigation.headerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="hover:underline"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}
          <div className="hidden lg:block">
            <LazyCountrySwitcher />
          </div>
        </div>
      }
      rightEnd={
        <>
          {/* Account - desktop only */}
          <div className="hidden md:block">
            <Button variant="ghost" size="icon-lg" asChild>
              <Link href={`${basePath}/account`} aria-label={t("account")}>
                <User className="size-5" />
              </Link>
            </Button>
          </div>

          {/* Cart */}
          <CartButton />
        </>
      }
    />
  );
}
