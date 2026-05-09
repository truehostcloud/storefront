import type { Metadata } from "next";
import { buildCanonicalUrl } from "@/lib/seo";
import { getStoreUrl } from "@/lib/store";
import type { TenantConfig } from "@/lib/tenant";
import { getTenantConfigFromRequest } from "@/lib/tenant/request";
import { getTenantSiteUrl } from "@/lib/tenant/surface";

interface ProductsMetadataParams {
  country: string;
  locale: string;
  tenantConfig?: TenantConfig | null;
}

export async function generateProductsMetadata({
  country,
  locale,
  tenantConfig,
}: ProductsMetadataParams): Promise<Metadata> {
  const resolvedTenantConfig =
    tenantConfig ?? (await getTenantConfigFromRequest());
  const storeUrl = getTenantSiteUrl(resolvedTenantConfig) ?? getStoreUrl();
  const canonicalUrl = storeUrl
    ? buildCanonicalUrl(storeUrl, `/${country}/${locale}/products`)
    : undefined;

  return {
    title: "Products",
    description: "Browse our full collection of products.",
    ...(canonicalUrl ? { alternates: { canonical: canonicalUrl } } : {}),
    openGraph: {
      title: "Products",
      description: "Browse our full collection of products.",
      ...(canonicalUrl ? { url: canonicalUrl } : {}),
      type: "website",
    },
  };
}
