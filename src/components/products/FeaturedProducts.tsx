import dynamic from "next/dynamic";
import { ProductCardSkeleton } from "@/components/products/ProductCardSkeleton";
import { PRODUCT_CARD_FIELDS } from "@/lib/data/cached";
import { getProducts } from "@/lib/data/products";

const LazyProductCarousel = dynamic(
  () =>
    import("@/components/products/ProductCarousel").then((mod) => ({
      default: mod.ProductCarousel,
    })),
  {
    loading: () => (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    ),
  },
);

interface FeaturedProductsProps {
  basePath: string;
  currency?: string;
}

export async function FeaturedProducts({
  basePath,
  currency,
}: FeaturedProductsProps) {
  const productsResponse = await getProducts({
    limit: 10,
    fields: PRODUCT_CARD_FIELDS,
  });

  return (
    <LazyProductCarousel
      products={productsResponse.data ?? []}
      basePath={basePath}
      currency={currency}
    />
  );
}
