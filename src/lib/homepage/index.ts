import defaultHomepageConfig from "./default-homepage.json";
import type { HomepageConfig, HomepageSectionConfig } from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isHomepageSection(value: unknown): value is HomepageSectionConfig {
  return isRecord(value) && typeof value.type === "string";
}

function isHomepageConfigLike(
  value: unknown,
): value is Partial<HomepageConfig> {
  if (!isRecord(value)) {
    return false;
  }

  const hasHomepageKeys = "version" in value || "sections" in value;
  if (!hasHomepageKeys) {
    return false;
  }

  return (
    (value.version === undefined || value.version === 1) &&
    (value.sections === undefined || Array.isArray(value.sections))
  );
}

function interpolateString(
  template: string,
  variables: Record<string, string>,
): string {
  return template.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (_match, key: string) => {
    return variables[key] ?? "";
  });
}

function interpolateValue<T>(value: T, variables: Record<string, string>): T {
  if (typeof value === "string") {
    return interpolateString(value, variables) as T;
  }

  if (Array.isArray(value)) {
    return value.map((entry) => interpolateValue(entry, variables)) as T;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        interpolateValue(entry, variables),
      ]),
    ) as T;
  }

  return value;
}

function mergeObjects<T>(base: T, override: unknown): T {
  if (!isRecord(base) || !isRecord(override)) {
    return (override ?? base) as T;
  }

  const result: Record<string, unknown> = { ...base };

  for (const [key, overrideValue] of Object.entries(override)) {
    const baseValue = result[key];

    if (Array.isArray(overrideValue)) {
      result[key] = overrideValue;
      continue;
    }

    if (isRecord(baseValue) && isRecord(overrideValue)) {
      result[key] = mergeObjects(baseValue, overrideValue);
      continue;
    }

    result[key] = overrideValue;
  }

  return result as T;
}

function getRecord(value: unknown): Record<string, unknown> | undefined {
  return isRecord(value) ? value : undefined;
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function getArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function findHomepagePage(source: Record<string, unknown>): unknown {
  const design = getRecord(source.design);
  const layout = getRecord(design?.layout);
  const pages = getArray(layout?.pages);

  if (pages.length === 0) {
    return undefined;
  }

  const homepage = pages.find((page) => {
    if (!isRecord(page)) return false;

    const slug = getString(page.slug)?.toLowerCase();
    return (
      page.is_homepage === true ||
      slug === "index" ||
      slug === "home" ||
      slug === "homepage"
    );
  });

  return homepage;
}

function cloneSection<T>(section: T): T {
  return mergeObjects(section, {});
}

function buildHomepageSectionsFromSlugs(
  slugs: unknown[],
  defaultConfig: HomepageConfig,
  source: Record<string, unknown>,
): HomepageSectionConfig[] {
  const heroSection = defaultConfig.sections.find(
    (section) => section.type === "hero",
  );
  const featuresSection = defaultConfig.sections.find(
    (section) => section.type === "features",
  );
  const featuredProductsSection = defaultConfig.sections.find(
    (section) => section.type === "featured-products",
  );

  const pageTitle = getString(source.title);
  const pageSummary = getString(source.summary);
  const heroTitle =
    pageTitle &&
    !["home", "homepage", "index"].includes(pageTitle.toLowerCase())
      ? pageTitle
      : heroSection?.title;

  return slugs
    .map((slug) => getString(slug)?.toLowerCase())
    .filter((slug): slug is string => Boolean(slug))
    .map((slug) => {
      switch (slug) {
        case "hero":
          return heroSection
            ? {
                ...cloneSection(heroSection),
                title: heroTitle ?? heroSection.title,
                description: pageSummary || heroSection.description,
              }
            : null;
        case "highlights":
        case "features":
          return featuresSection ? cloneSection(featuresSection) : null;
        case "trust":
          return featuresSection
            ? {
                ...cloneSection(featuresSection),
                title: "Trust at every step",
              }
            : null;
        case "cta":
        case "featured-products":
          return featuredProductsSection
            ? cloneSection(featuredProductsSection)
            : null;
        default:
          return null;
      }
    })
    .filter((section): section is HomepageSectionConfig => Boolean(section));
}

function mergeHomepageSections(
  baseSections: HomepageSectionConfig[],
  overrideSections: unknown,
): HomepageSectionConfig[] {
  if (!Array.isArray(overrideSections)) {
    return baseSections;
  }

  const validOverrideSections = overrideSections.filter(isHomepageSection);
  if (validOverrideSections.length === 0) {
    return baseSections;
  }

  const baseSectionsByType = new Map(
    baseSections.map((section) => [section.type, section]),
  );
  const mergedSections = validOverrideSections.map((section) => {
    const baseSection = baseSectionsByType.get(section.type);
    return baseSection ? mergeObjects(baseSection, section) : section;
  });

  return mergedSections;
}

function extractHomepageSource(source: unknown): unknown {
  if (!isRecord(source)) {
    return source;
  }

  if (isHomepageConfigLike(source)) {
    return source;
  }

  const homepage = source.homepage;
  if (isHomepageConfigLike(homepage)) {
    return homepage;
  }

  const design = source.design;
  if (!isRecord(design)) {
    return source;
  }

  const layout = design.layout;
  if (!isRecord(layout)) {
    return source;
  }

  const layoutHomepage = layout.homepage;
  if (isHomepageConfigLike(layoutHomepage)) {
    return layoutHomepage;
  }

  const pages = layout.pages;
  if (Array.isArray(pages)) {
    const homepagePage = findHomepagePage(source as Record<string, unknown>);
    if (isRecord(homepagePage)) {
      return homepagePage;
    }

    return pages[0];
  }

  return layoutHomepage;
}

export function getDefaultHomepageConfig(
  variables: Record<string, string>,
): HomepageConfig {
  return interpolateValue(defaultHomepageConfig as HomepageConfig, variables);
}

export function getHomepageConfig(
  variables: Record<string, string>,
  source?: unknown,
): HomepageConfig {
  const defaultConfig = getDefaultHomepageConfig(variables);

  if (isRecord(source)) {
    const homepagePage = findHomepagePage(source);
    if (isRecord(homepagePage) && Array.isArray(homepagePage.sections)) {
      const interpolatedPage = interpolateValue(homepagePage, variables);
      const pageSource = isRecord(interpolatedPage)
        ? interpolatedPage
        : undefined;

      if (pageSource) {
        const pageSections = getArray(pageSource.sections);
        const structuredSections = pageSections.filter(isHomepageSection);
        const homepageSections =
          structuredSections.length > 0
            ? mergeHomepageSections(defaultConfig.sections, structuredSections)
            : buildHomepageSectionsFromSlugs(
                pageSections,
                defaultConfig,
                pageSource,
              );

        if (homepageSections.length > 0) {
          return {
            ...mergeObjects(defaultConfig, pageSource),
            sections: homepageSections,
            version: 1,
          };
        }
      }
    }
  }

  const extractedSource = extractHomepageSource(source);

  if (!isHomepageConfigLike(extractedSource)) {
    return defaultConfig;
  }

  const overrideConfig = interpolateValue(extractedSource, variables);
  const pageSource = isRecord(overrideConfig) ? overrideConfig : undefined;

  if (pageSource && Array.isArray(pageSource.sections)) {
    const sections = pageSource.sections.filter(isHomepageSection);
    if (sections.length > 0) {
      return {
        ...mergeObjects(defaultConfig, overrideConfig),
        sections: mergeHomepageSections(defaultConfig.sections, sections),
        version: 1,
      };
    }

    const homepageSections = buildHomepageSectionsFromSlugs(
      pageSource.sections,
      defaultConfig,
      pageSource,
    );

    if (homepageSections.length > 0) {
      return {
        ...mergeObjects(defaultConfig, overrideConfig),
        sections: homepageSections,
        version: 1,
      };
    }
  }

  return {
    ...mergeObjects(defaultConfig, overrideConfig),
    sections: mergeHomepageSections(
      defaultConfig.sections,
      overrideConfig.sections,
    ),
    version: 1,
  };
}

export function getHomepageSections(
  config: HomepageConfig,
): HomepageSectionConfig[] {
  return config.sections;
}

export * from "./types";
