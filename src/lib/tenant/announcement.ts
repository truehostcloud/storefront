import type { TenantSurfaceConfig } from "./types";

export interface TenantAnnouncementBarConfig {
  message: string;
  href?: string;
  linkLabel: string;
  backgroundColor?: string;
  foregroundColor?: string;
}

function getRecord(value: unknown): Record<string, unknown> | undefined {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return undefined;
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function getBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function getRawConfig(
  config?: TenantSurfaceConfig | null,
): Record<string, unknown> | undefined {
  return getRecord(config?.raw);
}

function getLayoutConfig(
  config?: TenantSurfaceConfig | null,
): Record<string, unknown> | undefined {
  return getRecord(getRecord(getRawConfig(config)?.design)?.layout);
}

export function resolveTenantAnnouncementBar(
  config?: TenantSurfaceConfig | null,
  defaults: Partial<TenantAnnouncementBarConfig> = {},
): TenantAnnouncementBarConfig | null {
  const raw = getRawConfig(config);
  const layout = getLayoutConfig(config);
  const announcementBar =
    getRecord(layout?.announcementBar) ||
    getRecord(layout?.announcement) ||
    getRecord(raw?.announcementBar) ||
    getRecord(raw?.announcement);

  const message =
    getString(announcementBar?.message) || defaults.message || undefined;
  const isVisible =
    getBoolean(announcementBar?.isVisible) ??
    getBoolean(announcementBar?.enabled) ??
    true;

  if (!message || !isVisible) {
    return null;
  }

  const link = getRecord(announcementBar?.link);
  const href =
    getString(announcementBar?.href) ||
    getString(announcementBar?.url) ||
    getString(link?.href) ||
    defaults.href;
  const linkLabel =
    getString(announcementBar?.label) ||
    getString(link?.label) ||
    defaults.linkLabel ||
    "Learn more";
  const theme = getRecord(announcementBar?.theme);

  return {
    message,
    ...(href ? { href } : {}),
    linkLabel,
    backgroundColor:
      getString(theme?.background) ||
      getString(theme?.backgroundColor) ||
      defaults.backgroundColor,
    foregroundColor:
      getString(theme?.foreground) ||
      getString(theme?.foregroundColor) ||
      defaults.foregroundColor,
  };
}
