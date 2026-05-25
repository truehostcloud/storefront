import defaultPagesConfig from "./default-pages.json";
import type { DynamicPageConfig, DynamicPagesConfig } from "./types";

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isDynamicPage(value: unknown): value is DynamicPageConfig {
  if (!isRecord(value)) return false;
  return typeof value.slug === "string" && Array.isArray(value.sections);
}

function isDynamicPageLike(
  value: unknown,
): value is Partial<DynamicPageConfig> {
  if (!isRecord(value)) return false;
  return typeof value.slug === "string";
}

function isDynamicPagesConfig(value: unknown): value is DynamicPagesConfig {
  if (!isRecord(value)) return false;
  return (
    value.version === 1 &&
    Array.isArray(value.pages) &&
    value.pages.every(isDynamicPage)
  );
}

function isDynamicPagesConfigLike(
  value: unknown,
): value is Partial<DynamicPagesConfig> {
  if (!isRecord(value)) {
    return false;
  }

  const hasDynamicPageKeys = "version" in value || "pages" in value;
  if (!hasDynamicPageKeys) {
    return false;
  }

  return (
    (value.version === undefined || value.version === 1) &&
    (value.pages === undefined || Array.isArray(value.pages))
  );
}

function normalizeSlug(value: string | string[]): string {
  const joined = Array.isArray(value) ? value.join("/") : value;
  return joined
    .split("/")
    .map((segment) => segment.trim())
    .filter(Boolean)
    .join("/")
    .toLowerCase();
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

function extractDynamicPagesSource(source: unknown): unknown {
  if (!isRecord(source)) {
    return source;
  }

  if (isDynamicPagesConfigLike(source)) {
    return source;
  }

  if (isDynamicPagesConfigLike(source.dynamicPages)) {
    return source.dynamicPages;
  }

  const design = source.design;
  if (!isRecord(design)) {
    return source;
  }

  const layout = design.layout;
  if (!isRecord(layout)) {
    return source;
  }

  if (Array.isArray(layout.pages)) {
    return { version: 1, pages: layout.pages };
  }

  return source;
}

function mergeDynamicPages(
  basePages: DynamicPageConfig[],
  overridePages: unknown,
): DynamicPageConfig[] {
  if (!Array.isArray(overridePages)) {
    return basePages;
  }

  const mergedBySlug = new Map<string, DynamicPageConfig>();

  for (const page of basePages) {
    mergedBySlug.set(normalizeSlug(page.slug), page);
  }

  for (const candidate of overridePages) {
    if (!isDynamicPageLike(candidate)) continue;
    if (typeof candidate.slug !== "string") continue;

    const slug = normalizeSlug(candidate.slug);
    if (!slug) continue;

    const basePage = mergedBySlug.get(slug);
    const nextPage = basePage ? mergeObjects(basePage, candidate) : candidate;

    if (Array.isArray(candidate.sections)) {
      nextPage.sections = candidate.sections as DynamicPageConfig["sections"];
    }

    if (!Array.isArray(nextPage.sections)) continue;

    mergedBySlug.set(slug, {
      slug,
      title: nextPage.title ?? slug,
      description: nextPage.description,
      seo: nextPage.seo,
      sections: nextPage.sections,
    });
  }

  return Array.from(mergedBySlug.values());
}

export function getDefaultDynamicPagesConfig(
  variables: Record<string, string>,
): DynamicPagesConfig {
  return interpolateValue(defaultPagesConfig as DynamicPagesConfig, variables);
}

export function getDynamicPagesConfig(
  variables: Record<string, string>,
  source?: unknown,
): DynamicPagesConfig {
  const defaultConfig = getDefaultDynamicPagesConfig(variables);
  const extractedSource = extractDynamicPagesSource(source);

  if (isDynamicPagesConfig(extractedSource)) {
    return {
      ...mergeObjects(
        defaultConfig,
        interpolateValue(extractedSource, variables),
      ),
      pages: mergeDynamicPages(
        defaultConfig.pages,
        interpolateValue(extractedSource.pages, variables),
      ),
      version: 1,
    };
  }

  if (isDynamicPagesConfigLike(extractedSource)) {
    const interpolatedSource = interpolateValue(extractedSource, variables);

    return {
      ...mergeObjects(defaultConfig, interpolatedSource),
      pages: mergeDynamicPages(defaultConfig.pages, interpolatedSource.pages),
      version: 1,
    };
  }

  return defaultConfig;
}

export function resolveDynamicPage(
  config: DynamicPagesConfig,
  slug: string | string[],
): DynamicPageConfig | null {
  const normalizedSlug = normalizeSlug(slug);
  if (!normalizedSlug) return null;

  return (
    config.pages.find((page) => normalizeSlug(page.slug) === normalizedSlug) ??
    null
  );
}

export function listDynamicPageSlugs(config: DynamicPagesConfig): string[] {
  return config.pages.map((page) => normalizeSlug(page.slug));
}

export * from "./types";
