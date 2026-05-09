import type { Metadata } from "next";
import { buildCanonicalUrl, SOCIAL_IMAGE_PATH } from "@/lib/seo";
import {
  getStoreMetaDescription,
  getStoreSeoTitle,
  getStoreUrl,
} from "@/lib/store";
import type { TenantConfig } from "@/lib/tenant";
import { getTenantConfigFromRequest } from "@/lib/tenant/request";
import {
  getTenantBrandName,
  getTenantDescription,
  getTenantSiteUrl,
} from "@/lib/tenant/surface";

interface HomeMetadataParams {
  country: string;
  locale: string;
  tenantConfig?: TenantConfig | null;
}

export async function generateHomeMetadata({
  country,
  locale,
  tenantConfig,
}: HomeMetadataParams): Promise<Metadata> {
  const resolvedTenantConfig =
    tenantConfig ?? (await getTenantConfigFromRequest());
  const storeName =
    getTenantBrandName(resolvedTenantConfig) ?? getStoreSeoTitle();
  const description =
    getTenantDescription(resolvedTenantConfig) ?? getStoreMetaDescription();
  const storeUrl = getTenantSiteUrl(resolvedTenantConfig) ?? getStoreUrl();
  const canonicalUrl = storeUrl
    ? buildCanonicalUrl(storeUrl, `/${country}/${locale}`)
    : undefined;

  return {
    title: { absolute: storeName },
    description,
    ...(canonicalUrl ? { alternates: { canonical: canonicalUrl } } : {}),
    openGraph: {
      title: storeName,
      description,
      ...(canonicalUrl ? { url: canonicalUrl } : {}),
      type: "website",
      images: [SOCIAL_IMAGE_PATH],
    },
  };
}
