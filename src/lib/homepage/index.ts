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
  return (
    isRecord(value) &&
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

  return layout.homepage;
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
  const extractedSource = extractHomepageSource(source);

  if (!isHomepageConfigLike(extractedSource)) {
    return defaultConfig;
  }

  const overrideConfig = interpolateValue(extractedSource, variables);

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
