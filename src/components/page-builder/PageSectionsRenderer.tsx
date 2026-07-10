import { FeaturedProductsSection } from "@/components/home/FeaturedProductsSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { HeroSection } from "@/components/home/HeroSection";
import { ImageBannerSection } from "@/components/page-builder/ImageBannerSection";
import { RichTextSection } from "@/components/page-builder/RichTextSection";
import type { DynamicPageSectionConfig } from "@/lib/page-builder";

interface PageSectionsRendererProps {
  sections: DynamicPageSectionConfig[];
  basePath: string;
  locale: string;
  country: string;
  currency?: string;
  keyPrefix?: string;
}

export function PageSectionsRenderer({
  sections,
  basePath,
  currency,
  keyPrefix = "section",
}: PageSectionsRendererProps) {
  return (
    <div className="flex flex-col gap-0">
      {sections.map((section, index) => {
        const key = `${keyPrefix}-${section.type}-${index}`;

        switch (section.type) {
          case "hero":
            return (
              <HeroSection key={key} basePath={basePath} section={section} />
            );
          case "features":
            return <FeaturesSection key={key} section={section} />;
          case "featured-products":
            return (
              <FeaturedProductsSection
                key={key}
                basePath={basePath}
                currency={currency}
                section={section}
              />
            );
          case "rich-text":
            return (
              <RichTextSection
                key={key}
                basePath={basePath}
                section={section}
              />
            );
          case "image-banner":
            return (
              <ImageBannerSection
                key={key}
                basePath={basePath}
                section={section}
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
