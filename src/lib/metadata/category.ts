import type { Metadata } from "next";
import { getCachedCategory } from "@/lib/data/cached";
import { buildCanonicalUrl } from "@/lib/seo";
import { getStoreUrl } from "@/lib/store";
import type { TenantConfig } from "@/lib/tenant";
import { getTenantConfigFromRequest } from "@/lib/tenant/request";
import {
  getTenantBrandName,
  getTenantDescription,
  getTenantSiteUrl,
} from "@/lib/tenant/surface";

export interface CategoryMetadataParams {
  country: string;
  locale: string;
  permalink: string[];
  tenantConfig?: TenantConfig | null;
}

export async function generateCategoryMetadata({
  country,
  locale,
  permalink,
  tenantConfig,
}: CategoryMetadataParams): Promise<Metadata> {
  const resolvedTenantConfig =
    tenantConfig ?? (await getTenantConfigFromRequest());
  const fullPermalink = permalink.join("/");

  let category;
  try {
    category = await getCachedCategory(fullPermalink, [
      "ancestors",
      "children",
    ]);
  } catch {
    return { title: "Category Not Found" };
  }

  const title = category.meta_title || category.name;
  const description =
    category.meta_description ||
    category.description ||
    `Browse ${category.name} products.`;

  const storeUrl = getTenantSiteUrl(resolvedTenantConfig) ?? getStoreUrl();
  const canonicalUrl = storeUrl
    ? buildCanonicalUrl(
        storeUrl,
        `/${country}/${locale}/c/${category.permalink}`,
      )
    : undefined;

  return {
    title,
    description: getTenantDescription(resolvedTenantConfig) ?? description,
    ...(category.meta_keywords ? { keywords: category.meta_keywords } : {}),
    ...(canonicalUrl ? { alternates: { canonical: canonicalUrl } } : {}),
    openGraph: {
      title: getTenantBrandName(resolvedTenantConfig) ?? title,
      description: getTenantDescription(resolvedTenantConfig) ?? description,
      ...(canonicalUrl ? { url: canonicalUrl } : {}),
      type: "website",
      ...(category.image_url
        ? { images: [{ url: category.image_url, alt: category.name }] }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(category.image_url ? { images: [category.image_url] } : {}),
    },
  };
}
