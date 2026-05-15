import type { TenantConfig } from "./types";

const SPACING_MAP = {
  compact: { section: "3rem", component: "1rem" },
  comfortable: { section: "5rem", component: "1.5rem" },
  spacious: { section: "8rem", component: "2rem" },
} as const;

const RADIUS_MAP = {
  none: "0px",
  sm: "4px",
  md: "8px",
  lg: "16px",
  full: "9999px",
} as const;

function getString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function getThemeRecord(config: TenantConfig): Record<string, unknown> {
  return config.theme && typeof config.theme === "object"
    ? (config.theme as Record<string, unknown>)
    : {};
}

function getNestedRecord(value: unknown): Record<string, unknown> | undefined {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return undefined;
}

function mergeRecords(
  base: Record<string, unknown>,
  override?: Record<string, unknown>,
): Record<string, unknown> {
  if (!override) return base;

  const result: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(override)) {
    const baseValue = result[key];
    if (getNestedRecord(baseValue) && getNestedRecord(value)) {
      result[key] = mergeRecords(
        getNestedRecord(baseValue) ?? {},
        getNestedRecord(value),
      );
      continue;
    }

    result[key] = value;
  }

  return result;
}

export function resolveTenantThemeConfig(
  config: TenantConfig,
): Record<string, unknown> {
  const theme = getThemeRecord(config);
  const raw = getNestedRecord(config.raw);
  const design = getNestedRecord(raw?.design);
  const designStyle = getNestedRecord(design?.style) ?? {};

  return mergeRecords(designStyle, theme);
}

export function buildCssVars(config: TenantConfig): Record<string, string> {
  const theme = resolveTenantThemeConfig(config);
  const branding = getNestedRecord(theme.branding);
  const colors =
    getNestedRecord(theme.colors) ?? getNestedRecord(branding?.colors) ?? {};
  const fonts = getNestedRecord(theme.fonts) ?? {};

  const spacing = getString(theme.spacing);
  const radius = getString(theme.borderRadius);
  const spacingPreset =
    SPACING_MAP[(spacing as keyof typeof SPACING_MAP) ?? "comfortable"] ??
    SPACING_MAP.comfortable;
  const radiusPreset =
    RADIUS_MAP[(radius as keyof typeof RADIUS_MAP) ?? "md"] ?? RADIUS_MAP.md;

  return {
    "--color-primary": getString(colors.primary) ?? "#16a34a",
    "--color-secondary": getString(colors.secondary) ?? "#0ea5e9",
    "--color-accent": getString(colors.accent) ?? "#f59e0b",
    "--color-background": getString(colors.background) ?? "#ffffff",
    "--color-surface": getString(colors.surface) ?? "#f9fafb",
    "--color-text": getString(colors.text) ?? "#111827",
    "--color-text-muted": getString(colors.textMuted) ?? "#6b7280",
    "--color-border": getString(colors.border) ?? "#e5e7eb",
    "--font-heading": `'${getString(fonts.heading) ?? "Inter"}', sans-serif`,
    "--font-body": `'${getString(fonts.body) ?? getString(fonts.heading) ?? "Inter"}', sans-serif`,
    "--font-heading-weight": String(getString(fonts.headingWeight) ?? 600),
    "--radius": radiusPreset,
    "--spacing-section": spacingPreset.section,
    "--spacing-component": spacingPreset.component,
  };
}

export function cssVarsToString(vars: Record<string, string>): string {
  return Object.entries(vars)
    .map(([key, value]) => `${key}:${value}`)
    .join(";");
}
