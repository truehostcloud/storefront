import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DynamicPageRenderer } from "@/components/page-builder/DynamicPageRenderer";
import { resolveCurrency } from "@/lib/data/markets";
import { getDynamicPagesConfig, resolveDynamicPage } from "@/lib/page-builder";
import { getStoreName } from "@/lib/store";
import { getTenantConfigFromRequest } from "@/lib/tenant/request";
import { getTenantBrandName } from "@/lib/tenant/surface";

interface DynamicStorePageProps {
  params: Promise<{
    country: string;
    locale: string;
    slug: string[];
  }>;
}

export async function generateMetadata({
  params,
}: DynamicStorePageProps): Promise<Metadata> {
  const { slug } = await params;
  const tenantConfig = await getTenantConfigFromRequest();
  const storeName = getTenantBrandName(tenantConfig) ?? getStoreName();
  const dynamicPagesConfig = getDynamicPagesConfig(
    { storeName },
    tenantConfig?.raw,
  );
  const page = resolveDynamicPage(dynamicPagesConfig, slug);

  if (!page) {
    return {
      title: storeName,
    };
  }

  return {
    title: page.seo?.title ?? page.title,
    description: page.seo?.description ?? page.description,
  };
}

export default async function DynamicStorePage({
  params,
}: DynamicStorePageProps) {
  const { country, locale, slug } = await params;
  const basePath = `/${country}/${locale}`;
  const currency = await resolveCurrency(country);
  const tenantConfig = await getTenantConfigFromRequest();
  const storeName = getTenantBrandName(tenantConfig) ?? getStoreName();
  const dynamicPagesConfig = getDynamicPagesConfig(
    { storeName },
    tenantConfig?.raw,
  );
  const page = resolveDynamicPage(dynamicPagesConfig, slug);

  if (!page) {
    notFound();
  }

  return (
    <DynamicPageRenderer
      page={page}
      basePath={basePath}
      locale={locale}
      country={country}
      currency={currency}
    />
  );
}
