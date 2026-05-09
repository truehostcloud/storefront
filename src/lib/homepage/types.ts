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

export type HomepageSectionConfig =
  | HomepageHeroSectionConfig
  | HomepageFeaturesSectionConfig
  | HomepageFeaturedProductsSectionConfig;

export interface HomepageConfig {
  version: 1;
  sections: HomepageSectionConfig[];
}
