import type {
  HomepageButtonConfig,
  HomepageFaqSectionConfig,
  HomepageFeaturedCollectionsSectionConfig,
  HomepageFeaturedProductsSectionConfig,
  HomepageFeaturesSectionConfig,
  HomepageHeroSectionConfig,
  HomepageTestimonialsSectionConfig,
  HomepageThemeConfig,
} from "@/lib/homepage";

export interface DynamicPageSeoConfig {
  title?: string;
  description?: string;
}

export interface DynamicPageRichTextSectionConfig {
  type: "rich-text";
  eyebrow?: string;
  title?: string;
  body: string[];
  alignment?: "left" | "center";
  cta?: HomepageButtonConfig;
  theme?: HomepageThemeConfig;
}

export interface DynamicPageImageBannerSectionConfig {
  type: "image-banner";
  eyebrow?: string;
  title: string;
  description?: string;
  imageUrl: string;
  imageAlt?: string;
  height?: "sm" | "md" | "lg";
  overlay?: boolean;
  cta?: HomepageButtonConfig;
  theme?: HomepageThemeConfig;
}

export type DynamicPageSectionConfig =
  | HomepageHeroSectionConfig
  | HomepageFeaturesSectionConfig
  | HomepageFeaturedProductsSectionConfig
  | HomepageFeaturedCollectionsSectionConfig
  | HomepageFaqSectionConfig
  | HomepageTestimonialsSectionConfig
  | DynamicPageRichTextSectionConfig
  | DynamicPageImageBannerSectionConfig;

export interface DynamicPageConfig {
  slug: string;
  title: string;
  description?: string;
  seo?: DynamicPageSeoConfig;
  sections: DynamicPageSectionConfig[];
}

export interface DynamicPagesConfig {
  version: 1;
  pages: DynamicPageConfig[];
}
