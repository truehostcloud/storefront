import { PageSectionsRenderer } from "@/components/page-builder/PageSectionsRenderer";
import type { DynamicPageConfig } from "@/lib/page-builder";

interface DynamicPageRendererProps {
  page: DynamicPageConfig;
  basePath: string;
  currency?: string;
}

export function DynamicPageRenderer({
  page,
  basePath,
  currency,
}: DynamicPageRendererProps) {
  return (
    <PageSectionsRenderer
      sections={page.sections}
      basePath={basePath}
      currency={currency}
      keyPrefix={page.slug}
    />
  );
}
