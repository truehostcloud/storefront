import type { Category } from "@spree/sdk";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { POLICY_LINKS } from "@/lib/constants/policies";
import { getStoreDescription, getStoreName } from "@/lib/store";
import type { TenantConfig } from "@/lib/tenant";
import {
  resolveTenantBranding,
  resolveTenantFooter,
  resolveTenantNavigation,
} from "@/lib/tenant";

// Demo-only: Remove for production.
const githubUrl = "https://github.com/spree/storefront";
const quickstartUrl =
  "https://spreecommerce.org/docs/developer/getting-started/quickstart";
const learnMoreUrl = "https://spreecommerce.org";

interface FooterProps {
  rootCategories: Category[];
  basePath: string;
  locale: Locale;
  tenantConfig?: TenantConfig | null;
}

export async function Footer({
  rootCategories,
  basePath,
  locale,
  tenantConfig,
}: FooterProps) {
  const t = await getTranslations({ locale, namespace: "footer" });
  const tp = await getTranslations({ locale, namespace: "policies" });
  const branding = resolveTenantBranding(tenantConfig, {
    name: getStoreName(),
    description: getStoreDescription(),
  });
  const navigation = resolveTenantNavigation(tenantConfig);
  const footerConfig = resolveTenantFooter(tenantConfig, {
    description:
      t("description") || branding.description || getStoreDescription(),
    resourceLinks: [],
    shopLinks: [
      ...navigation.footerLinks,
      { label: t("allProducts"), href: `${basePath}/products` },
      ...rootCategories.map((category) => ({
        label: category.name,
        href: `${basePath}/c/${category.permalink}`,
      })),
    ],
    accountLinks: [
      { label: t("myAccount"), href: `${basePath}/account` },
      { label: t("orderHistory"), href: `${basePath}/account/orders` },
      { label: t("cart"), href: `${basePath}/cart` },
    ],
    policyLinks: POLICY_LINKS.map((policy) => ({
      label: tp(policy.nameKey),
      href: `${basePath}/policies/${policy.slug}`,
    })),
    showPolicies: true,
  });

  return (
    <footer className="bg-primary text-gray-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-5">
          {/* Demo-only: Remove for production. */}
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <span className="text-xl font-bold text-white">
              {branding.name}
            </span>
            <p className="mt-4 text-sm text-neutral-400">
              {footerConfig.description}
            </p>
            {footerConfig.resourceLinks.length > 0 && (
              <div className="mt-4 flex flex-col gap-2">
                {footerConfig.resourceLinks.map((link, index) => (
                  <Link
                    key={`${link.href}-${index}`}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={
                      index === 0
                        ? "text-sm text-white hover:text-neutral-200 transition-colors font-medium"
                        : "text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
                    }
                  >
                    {link.label}
                    {index === 0 ? " →" : ""}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-medium text-neutral-300">
              {t("shop")}
            </h3>
            <ul className="mt-4 space-y-3">
              {footerConfig.shopLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-sm font-medium text-neutral-300">
              {t("account")}
            </h3>
            <ul className="mt-4 space-y-3">
              {footerConfig.accountLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="text-sm font-medium text-neutral-300">
              {t("policies")}
            </h3>
            {footerConfig.showPolicies && (
              <ul className="mt-4 space-y-3">
                {footerConfig.policyLinks.map((policy) => (
                  <li key={policy.href}>
                    <Link
                      href={policy.href}
                      className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
                    >
                      {policy.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-neutral-800 text-xs text-neutral-400 text-center">
          <p>
            &copy; {new Date().getFullYear()} {branding.name}. {t("poweredBy")}
            <Link
              href="https://olitt.com"
              target="_blank"
              className="text-neutral-400 hover:text-neutral-200 underline transition-colors"
            >
              OLITT
            </Link>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
