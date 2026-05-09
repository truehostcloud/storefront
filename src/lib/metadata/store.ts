import type { Metadata } from "next";
import { SOCIAL_IMAGE_PATH } from "@/lib/seo";
import {
  getStoreMetaDescription,
  getStoreName,
  getStoreSeoTitle,
  getStoreUrl,
} from "@/lib/store";
import type { TenantConfig } from "@/lib/tenant";
import {
  getTenantBrandName,
  getTenantDescription,
  getTenantSiteUrl,
  getTenantTwitterHandle,
} from "@/lib/tenant/surface";

function normalizeOpenGraphLocale(locale: string): string {
  const parts = locale.split(/[-_]/);
  if (parts.length < 2) return locale;
  return `${parts[0].toLowerCase()}_${parts[1].toUpperCase()}`;
}

interface StoreMetadataParams {
  locale: string;
  tenantConfig?: TenantConfig | null;
}

export async function generateStoreMetadata({
  locale,
  tenantConfig,
}: StoreMetadataParams): Promise<Metadata> {
  const storeName =
    getTenantBrandName(tenantConfig) ?? getStoreSeoTitle() ?? getStoreName();
  const storeUrl = getTenantSiteUrl(tenantConfig) ?? getStoreUrl();
  const metaDescription =
    getTenantDescription(tenantConfig) ?? getStoreMetaDescription();
  const metaKeywords = process.env.STORE_META_KEYWORDS;
  const twitter =
    getTenantTwitterHandle(tenantConfig) ?? process.env.STORE_TWITTER;

  let metadataBaseSpread: Partial<{ metadataBase: URL }> = {};
  if (storeUrl) {
    try {
      metadataBaseSpread = { metadataBase: new URL(storeUrl) };
    } catch {
      metadataBaseSpread = {};
    }
  }

  return {
    ...metadataBaseSpread,
    title: {
      template: `%s | ${storeName}`,
      default: storeName,
    },
    description: metaDescription,
    ...(metaKeywords ? { keywords: metaKeywords } : {}),
    openGraph: {
      siteName: storeName,
      locale: normalizeOpenGraphLocale(locale),
      type: "website",
      images: [SOCIAL_IMAGE_PATH],
    },
    twitter: {
      card: "summary_large_image",
      ...(twitter
        ? {
            site: twitter.startsWith("@") ? twitter : `@${twitter}`,
          }
        : {}),
    },
  };
}
