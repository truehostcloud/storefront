import { PageSectionsRenderer } from "@/components/page-builder/PageSectionsRenderer";
import type { DynamicPageConfig } from "@/lib/page-builder";

interface DynamicPageRendererProps {
  page: DynamicPageConfig;
  basePath: string;
  locale: string;
  country: string;
  currency?: string;
}

export function DynamicPageRenderer({
  page,
  basePath,
  locale,
  country,
  currency,
}: DynamicPageRendererProps) {
  return (
    <PageSectionsRenderer
      sections={page.sections}
      basePath={basePath}
      locale={locale}
      country={country}
      currency={currency}
      keyPrefix={page.slug}
    />
  );
}
