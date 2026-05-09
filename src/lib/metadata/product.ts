import type { Metadata } from "next";
import { getCachedProduct, PRODUCT_METADATA_EXPAND } from "@/lib/data/cached";
import { buildCanonicalUrl, stripHtml } from "@/lib/seo";
import { getStoreUrl } from "@/lib/store";
import type { TenantConfig } from "@/lib/tenant";
import { getTenantConfigFromRequest } from "@/lib/tenant/request";
import { getTenantSiteUrl } from "@/lib/tenant/surface";

interface ProductMetadataParams {
  country: string;
  locale: string;
  slug: string;
  tenantConfig?: TenantConfig | null;
}

export async function generateProductMetadata({
  country,
  locale,
  slug,
  tenantConfig,
}: ProductMetadataParams): Promise<Metadata> {
  const resolvedTenantConfig =
    tenantConfig ?? (await getTenantConfigFromRequest());
  let product;
  try {
    product = await getCachedProduct(slug, PRODUCT_METADATA_EXPAND);
  } catch {
    return { title: "Product Not Found" };
  }

  const title = product.name;
  const description = product.meta_description
    ? product.meta_description
    : product.description
      ? stripHtml(product.description).slice(0, 160)
      : `Shop ${product.name}`;

  const storeUrl = getTenantSiteUrl(resolvedTenantConfig) ?? getStoreUrl();
  const canonicalUrl = storeUrl
    ? buildCanonicalUrl(
        storeUrl,
        `/${country}/${locale}/products/${product.slug}`,
      )
    : undefined;

  const primaryMedia = product.primary_media;
  const ogSrc =
    primaryMedia?.og_image_url ||
    primaryMedia?.original_url ||
    product.thumbnail_url ||
    null;
  const ogImage =
    ogSrc && storeUrl
      ? {
          url: `${storeUrl}/_next/image?url=${encodeURIComponent(ogSrc)}&w=1200&q=75`,
          ...(primaryMedia?.og_image_url ? { width: 1200, height: 630 } : {}),
          alt: primaryMedia?.alt || product.name,
        }
      : ogSrc
        ? { url: ogSrc, alt: primaryMedia?.alt || product.name }
        : null;

  return {
    title,
    description,
    ...(product.meta_keywords ? { keywords: product.meta_keywords } : {}),
    ...(canonicalUrl ? { alternates: { canonical: canonicalUrl } } : {}),
    openGraph: {
      title,
      description,
      ...(canonicalUrl ? { url: canonicalUrl } : {}),
      type: "website",
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    other: {
      ...(product.price?.amount
        ? { "product:price:amount": product.price.amount }
        : {}),
      ...(product.price?.currency
        ? { "product:price:currency": product.price.currency }
        : {}),
    },
  };
}
