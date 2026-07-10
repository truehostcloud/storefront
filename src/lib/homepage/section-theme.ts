import type { CSSProperties } from "react";
import type { HomepageThemeConfig } from "./types";

type ThemeVars = CSSProperties & Record<`--${string}`, string | undefined>;

/**
 * Build the inline style for a themed homepage section.
 *
 * Paints the section and scopes the design-system color variables to it, so
 * descendants styled with utility classes such as `bg-background` or
 * `text-foreground` resolve against the section's theme instead of the page
 * defaults. The variables are set on the section element, so pages and
 * components outside the section are unaffected.
 *
 * The accent pair is applied only when the theme carries both `accent` and
 * `accentForeground`: an accent without its generator-validated label color
 * would leave button labels on the default ink, which can fail contrast.
 */
export function buildSectionThemeVars(theme: HomepageThemeConfig): ThemeVars {
  const hasReadableAccent = Boolean(theme.accent && theme.accentForeground);
  const vars: ThemeVars = {
    backgroundColor: theme.background,
    color: theme.foreground,
    "--background": theme.background,
    "--foreground": theme.foreground,
    "--card": theme.cardBackground,
    "--card-foreground": theme.foreground,
    "--muted": theme.cardBackground,
    "--muted-foreground": theme.mutedForeground,
    "--border": theme.borderColor,
    "--input": theme.borderColor,
    "--primary": hasReadableAccent ? theme.accent : undefined,
    "--primary-foreground": hasReadableAccent
      ? theme.accentForeground
      : undefined,
    "--ring": theme.accent,
  };

  for (const key of Object.keys(vars) as (keyof ThemeVars)[]) {
    if (vars[key] === undefined) delete vars[key];
  }

  return vars;
}
