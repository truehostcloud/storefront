import Link from "next/link";
import { Suspense } from "react";
import { FeaturedProducts } from "@/components/products/FeaturedProducts";
import { ProductCardSkeleton } from "@/components/products/ProductCardSkeleton";
import { Button } from "@/components/ui/button";
import type { HomepageFeaturedProductsSectionConfig } from "@/lib/homepage";
import { buildSectionThemeVars } from "@/lib/homepage/section-theme";

function CarouselSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

interface FeaturedProductsSectionProps {
  basePath: string;
  currency?: string;
  section: HomepageFeaturedProductsSectionConfig;
}

export async function FeaturedProductsSection({
  basePath,
  currency,
  section,
}: FeaturedProductsSectionProps) {
  const theme = section.theme ?? {};
  const sectionStyle = buildSectionThemeVars(theme);
  const mutedTextColor = theme.mutedForeground ?? "#64748b";
  const borderColor = theme.borderColor ?? "#cbd5e1";

  const resolveHref = (href: string) => {
    if (/^https?:\/\//.test(href)) return href;
    if (href.startsWith(basePath)) return href;
    if (href === "/") return basePath;
    return href.startsWith("/") ? `${basePath}${href}` : `${basePath}/${href}`;
  };

  return (
    <section className="featured-products py-24" style={sectionStyle}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
              {section.title}
            </h2>
            {section.description ? (
              <p className="text-lg max-w-xl" style={{ color: mutedTextColor }}>
                {section.description}
              </p>
            ) : null}
          </div>
          {section.cta ? (
            <Button
              variant={section.cta.variant ?? "outline"}
              className="h-14 px-8 rounded-2xl group border-2 transition-all"
              style={{ borderColor }}
              asChild
            >
              <Link
                href={resolveHref(section.cta.href)}
                className="flex items-center font-bold gap-2"
              >
                {section.cta.label}
                <span className="text-xl">→</span>
              </Link>
            </Button>
          ) : null}
        </div>
        <div className="relative group/carousel">
          <Suspense fallback={<CarouselSkeleton />}>
            <FeaturedProducts basePath={basePath} currency={currency} />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
