import type { Category } from "@spree/sdk";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { PageSectionsRenderer } from "@/components/page-builder/PageSectionsRenderer";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCachedProduct, PRODUCT_PAGE_EXPAND } from "@/lib/data/cached";
import { resolveCurrency } from "@/lib/data/markets";
import { generateProductMetadata } from "@/lib/metadata/product";
import {
  buildBreadcrumbJsonLd,
  buildCanonicalUrl,
  buildProductJsonLd,
} from "@/lib/seo";
import { getStoreUrl } from "@/lib/store";
import { resolveTenantFixedPageSlots } from "@/lib/tenant";
import { getTenantConfigFromRequest } from "@/lib/tenant/request";
import { ProductDetails } from "./ProductDetails";

interface ProductPageProps {
  params: Promise<{
    country: string;
    locale: string;
    slug: string;
  }>;
  searchParams: Promise<{
    category_id?: string;
  }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { country, locale, slug } = await params;
  return generateProductMetadata({ country, locale, slug });
}

function findBreadcrumbCategory(
  categories: Category[],
  categoryId?: string,
): Category | undefined {
  if (categories.length === 0) return undefined;
  if (categoryId) {
    const match = categories.find((c) => c.id === categoryId);
    if (match) return match;
  }
  return categories[0];
}

export default async function ProductPage({
  params,
  searchParams,
}: ProductPageProps) {
  const { country, locale, slug } = await params;
  const { category_id } = await searchParams;
  const basePath = `/${country}/${locale}`;
  const [currency, tenantConfig] = await Promise.all([
    resolveCurrency(country),
    getTenantConfigFromRequest(),
  ]);
  const pageSlots = resolveTenantFixedPageSlots(tenantConfig);

  let product;
  try {
    product = await getCachedProduct(slug, PRODUCT_PAGE_EXPAND);
  } catch {
    notFound();
  }

  const storeUrl = getStoreUrl();
  const canonicalUrl = storeUrl
    ? buildCanonicalUrl(
        storeUrl,
        `/${country}/${locale}/products/${product.slug}`,
      )
    : undefined;

  const breadcrumbCategory = findBreadcrumbCategory(
    product.categories || [],
    category_id,
  );

  return (
    <>
      {canonicalUrl && (
        <JsonLd data={buildProductJsonLd(product, canonicalUrl)} />
      )}
      {breadcrumbCategory && storeUrl && (
        <JsonLd
          data={buildBreadcrumbJsonLd(breadcrumbCategory, basePath, storeUrl, {
            name: product.name,
            slug: product.slug,
          })}
        />
      )}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {breadcrumbCategory && (
          <Breadcrumbs
            category={breadcrumbCategory}
            basePath={basePath}
            productName={product.name}
            locale={locale}
          />
        )}
      </div>
      {pageSlots.productPage.beforeMain.length > 0 && (
        <PageSectionsRenderer
          sections={pageSlots.productPage.beforeMain}
          basePath={basePath}
          currency={currency}
          keyPrefix="product-before"
        />
      )}
      <ProductDetails product={product} basePath={basePath} />
      {pageSlots.productPage.afterMain.length > 0 && (
        <PageSectionsRenderer
          sections={pageSlots.productPage.afterMain}
          basePath={basePath}
          currency={currency}
          keyPrefix="product-after"
        />
      )}
    </>
  );
}
