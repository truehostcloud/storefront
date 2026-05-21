export type HomepageButtonVariant =
  | "default"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";
export type HomepageActionIcon = "arrow-right" | "play";

export interface HomepageButtonConfig {
  label: string;
  href: string;
  variant?: HomepageButtonVariant;
  icon?: HomepageActionIcon;
}

export interface HomepageThemeConfig {
  background?: string;
  foreground?: string;
  accent?: string;
  mutedForeground?: string;
  cardBackground?: string;
  borderColor?: string;
}

export interface HomepageHeroStat {
  value: string;
  label: string;
}

export interface HomepageHeroMediaConfig {
  imageUrl?: string;
  alt?: string;
  floatingBadgeTitle?: string;
  floatingBadgeLabel?: string;
  secondaryBadgeTitle?: string;
  secondaryBadgeLabel?: string;
}

export interface HomepageHeroSectionConfig {
  type: "hero";
  badge?: string;
  title: string;
  description: string;
  alignment?: "left" | "center";
  actionsLayout?: "row" | "stack";
  primaryAction?: HomepageButtonConfig;
  secondaryAction?: HomepageButtonConfig;
  stats?: HomepageHeroStat[];
  media?: HomepageHeroMediaConfig;
  theme?: HomepageThemeConfig;
}

export interface HomepageFeatureItemConfig {
  title: string;
  description: string;
  icon?: "sparkles" | "truck" | "shield" | "shopping-bag";
}

export interface HomepageFeaturesSectionConfig {
  type: "features";
  title?: string;
  description?: string;
  items: HomepageFeatureItemConfig[];
  theme?: HomepageThemeConfig;
}

export interface HomepageFeaturedProductsSectionConfig {
  type: "featured-products";
  title: string;
  description?: string;
  cta?: HomepageButtonConfig;
  theme?: HomepageThemeConfig;
}

export interface HomepageCollectionItemConfig {
  title?: string;
  description?: string;
  href?: string;
  categoryPermalink?: string;
}

export interface HomepageFeaturedCollectionsSectionConfig {
  type: "featured-collections";
  eyebrow?: string;
  title: string;
  description?: string;
  items?: HomepageCollectionItemConfig[];
  maxItems?: number;
  cta?: HomepageButtonConfig;
  theme?: HomepageThemeConfig;
}

export interface HomepageFaqItemConfig {
  question: string;
  answer: string;
}

export interface HomepageFaqSectionConfig {
  type: "faq";
  eyebrow?: string;
  title: string;
  description?: string;
  items: HomepageFaqItemConfig[];
  theme?: HomepageThemeConfig;
}

export interface HomepageTestimonialItemConfig {
  quote: string;
  author: string;
  role?: string;
  company?: string;
  rating?: 1 | 2 | 3 | 4 | 5;
}

export interface HomepageTestimonialsSectionConfig {
  type: "testimonials";
  eyebrow?: string;
  title: string;
  description?: string;
  items: HomepageTestimonialItemConfig[];
  theme?: HomepageThemeConfig;
}

export type HomepageSectionConfig =
  | HomepageHeroSectionConfig
  | HomepageFeaturesSectionConfig
  | HomepageFeaturedProductsSectionConfig
  | HomepageFeaturedCollectionsSectionConfig
  | HomepageFaqSectionConfig
  | HomepageTestimonialsSectionConfig;

export interface HomepageConfig {
  version: 1;
  sections: HomepageSectionConfig[];
}
