import Link from "next/link";
import type { CSSProperties } from "react";
import { Button } from "@/components/ui/button";
import { getCategories } from "@/lib/data/categories";
import type {
  HomepageCollectionItemConfig,
  HomepageFeaturedCollectionsSectionConfig,
} from "@/lib/homepage";

interface FeaturedCollectionsSectionProps {
  basePath: string;
  section: HomepageFeaturedCollectionsSectionConfig;
}

interface CollectionCard {
  title: string;
  description: string;
  href: string;
}

function resolveHref(basePath: string, href: string): string {
  if (/^https?:\/\//.test(href)) return href;
  if (href.startsWith(basePath)) return href;
  if (href === "/") return basePath;
  return href.startsWith("/") ? `${basePath}${href}` : `${basePath}/${href}`;
}

function buildCollectionDescription(
  title: string,
  childCount: number,
  override?: string,
): string {
  if (override) {
    return override;
  }

  if (childCount > 0) {
    return `${childCount} curated categories ready to explore.`;
  }

  return `Browse the latest picks in ${title}.`;
}

function buildCategoryHref(
  basePath: string,
  permalink?: string,
  href?: string,
) {
  if (href) {
    return resolveHref(basePath, href);
  }

  if (permalink) {
    return `${basePath}/c/${permalink}`;
  }

  return `${basePath}/products`;
}

function buildRequestedCards(
  basePath: string,
  items: HomepageCollectionItemConfig[],
  categories: Array<{
    permalink?: string | null;
    name?: string | null;
    children?: unknown[] | null;
  }>,
): CollectionCard[] {
  const categoriesByPermalink = new Map(
    categories
      .filter((category) => Boolean(category.permalink))
      .map((category) => [category.permalink ?? "", category]),
  );

  return items
    .map((item) => {
      const category = item.categoryPermalink
        ? categoriesByPermalink.get(item.categoryPermalink)
        : undefined;
      const title = item.title ?? category?.name ?? null;

      if (!title) {
        return null;
      }

      const childCount = Array.isArray(category?.children)
        ? category.children.length
        : 0;

      return {
        title,
        description: buildCollectionDescription(
          title,
          childCount,
          item.description,
        ),
        href: buildCategoryHref(
          basePath,
          item.categoryPermalink ?? category?.permalink ?? undefined,
          item.href,
        ),
      } satisfies CollectionCard;
    })
    .filter((card): card is CollectionCard => card !== null);
}

export async function FeaturedCollectionsSection({
  basePath,
  section,
}: FeaturedCollectionsSectionProps) {
  const theme = section.theme ?? {};
  const sectionStyle: CSSProperties = {
    backgroundColor: theme.background,
    color: theme.foreground,
  };
  const mutedTextColor = theme.mutedForeground ?? "#64748b";
  const cardBackground = theme.cardBackground ?? "rgba(255, 255, 255, 0.78)";
  const borderColor = theme.borderColor ?? "#cbd5e1";
  const categories = await getCategories({ depth_eq: 0, expand: ["children"] })
    .then((response) => response.data ?? [])
    .catch(() => []);

  const fallbackCards = categories.map((category) => {
    const title = category.name;
    const childCount = Array.isArray(category.children)
      ? category.children.length
      : 0;

    return {
      title,
      description: buildCollectionDescription(title, childCount),
      href: `${basePath}/c/${category.permalink}`,
    } satisfies CollectionCard;
  });

  const cards = (
    section.items?.length
      ? buildRequestedCards(basePath, section.items, categories)
      : fallbackCards
  ).slice(0, section.maxItems ?? 6);

  return (
    <section className="py-20" style={sectionStyle}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl space-y-4">
            {section.eyebrow ? (
              <span className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
                {section.eyebrow}
              </span>
            ) : null}
            <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">
              {section.title}
            </h2>
            {section.description ? (
              <p
                className="text-lg leading-8"
                style={{ color: mutedTextColor }}
              >
                {section.description}
              </p>
            ) : null}
          </div>
          {section.cta ? (
            <Button variant={section.cta.variant ?? "outline"} asChild>
              <Link href={resolveHref(basePath, section.cta.href)}>
                {section.cta.label}
              </Link>
            </Button>
          ) : null}
        </div>
        {cards.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {cards.map((card) => (
              <Link
                key={`${card.href}-${card.title}`}
                href={card.href}
                className="group flex min-h-52 flex-col justify-between rounded-[2rem] border p-8 transition-transform duration-200 hover:-translate-y-1"
                style={{
                  backgroundColor: cardBackground,
                  borderColor,
                }}
              >
                <div className="space-y-4">
                  <span className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
                    Collection
                  </span>
                  <h3 className="text-2xl font-bold tracking-tight">
                    {card.title}
                  </h3>
                  <p
                    className="text-base leading-7"
                    style={{ color: mutedTextColor }}
                  >
                    {card.description}
                  </p>
                </div>
                <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                  Explore collection
                  <span aria-hidden="true">→</span>
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div
            className="rounded-[2rem] border px-6 py-10 text-center"
            style={{ backgroundColor: cardBackground, borderColor }}
          >
            <p className="text-lg font-semibold">
              Collections will appear here soon.
            </p>
            <p className="mt-3 text-sm" style={{ color: mutedTextColor }}>
              Add root categories in Spree or provide curated collection items
              in the section config.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
