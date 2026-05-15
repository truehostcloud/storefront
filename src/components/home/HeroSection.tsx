import { ArrowRight, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { Button } from "@/components/ui/button";
import type {
  HomepageActionIcon,
  HomepageHeroSectionConfig,
} from "@/lib/homepage";

interface HeroSectionProps {
  basePath: string;
  section: HomepageHeroSectionConfig;
}

function resolveHref(basePath: string, href: string): string {
  if (/^https?:\/\//.test(href)) return href;
  if (href.startsWith(basePath)) return href;
  if (href === "/") return basePath;
  return href.startsWith("/") ? `${basePath}${href}` : `${basePath}/${href}`;
}

function getActionIcon(icon?: HomepageActionIcon) {
  if (icon === "play") {
    return <Play className="ml-2 w-5 h-5" />;
  }

  if (icon === "arrow-right") {
    return (
      <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
    );
  }

  return null;
}

export async function HeroSection({ basePath, section }: HeroSectionProps) {
  const theme = section.theme ?? {};
  const sectionStyle: CSSProperties = {
    backgroundColor: theme.background,
    color: theme.foreground,
  };
  const mutedTextColor = theme.mutedForeground ?? "#6b7280";
  const cardBackground = theme.cardBackground ?? "#ffffff";
  const borderColor = theme.borderColor ?? "#e5e7eb";
  const accentColor = theme.accent ?? "#2563eb";
  const alignmentClass =
    section.alignment === "center"
      ? "items-center text-center mx-auto"
      : "items-start text-left";
  const actionsLayoutClass =
    section.actionsLayout === "stack"
      ? "flex-col items-stretch sm:items-start"
      : "flex-row flex-wrap items-center";
  const stats = section.stats ?? [];

  return (
    <section
      className="relative overflow-hidden min-h-[85vh] flex items-center"
      style={sectionStyle}
    >
      <div
        className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 h-[600px] w-[600px] rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: `${accentColor}12` }}
      />
      <div
        className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 h-[400px] w-[400px] rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: `${accentColor}1f` }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className={`max-w-2xl flex flex-col ${alignmentClass}`}>
            {section.badge ? (
              <div
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{
                  backgroundColor: `${accentColor}12`,
                  color: accentColor,
                }}
              >
                <span className="relative flex h-2 w-2">
                  <span
                    className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                    style={{ backgroundColor: accentColor }}
                  />
                  <span
                    className="relative inline-flex rounded-full h-2 w-2"
                    style={{ backgroundColor: accentColor }}
                  />
                </span>
                {section.badge}
              </div>
            ) : null}

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
              {section.title}
            </h1>

            <p
              className="text-xl leading-relaxed mb-10 max-w-xl animate-in fade-in slide-in-from-bottom-8 duration-900"
              style={{ color: mutedTextColor }}
            >
              {section.description}
            </p>

            {section.primaryAction || section.secondaryAction ? (
              <div
                className={`flex gap-5 animate-in fade-in slide-in-from-bottom-10 duration-1000 ${actionsLayoutClass}`}
              >
                {section.primaryAction ? (
                  <Button
                    size="lg"
                    variant={section.primaryAction.variant ?? "default"}
                    className="h-14 px-8 text-lg rounded-2xl group"
                    asChild
                  >
                    <Link
                      href={resolveHref(basePath, section.primaryAction.href)}
                    >
                      {section.primaryAction.label}
                      {getActionIcon(section.primaryAction.icon)}
                    </Link>
                  </Button>
                ) : null}

                {section.secondaryAction ? (
                  <Button
                    size="lg"
                    variant={section.secondaryAction.variant ?? "outline"}
                    className="h-14 px-8 text-lg rounded-2xl group"
                    asChild
                  >
                    <Link
                      href={resolveHref(basePath, section.secondaryAction.href)}
                    >
                      {section.secondaryAction.label}
                      {getActionIcon(section.secondaryAction.icon)}
                    </Link>
                  </Button>
                ) : null}
              </div>
            ) : null}

            {stats.length > 0 ? (
              <div
                className="mt-16 flex flex-wrap items-center gap-8 pt-8 border-t animate-in fade-in slide-in-from-bottom-12 duration-1000"
                style={{ borderColor }}
              >
                {stats.map((stat, index) => (
                  <div
                    key={`${stat.label}-${index}`}
                    className="flex items-center gap-8"
                  >
                    <div>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div
                        className="text-sm"
                        style={{ color: mutedTextColor }}
                      >
                        {stat.label}
                      </div>
                    </div>
                    {index < stats.length - 1 ? (
                      <div
                        className="hidden sm:block w-px h-10"
                        style={{ backgroundColor: borderColor }}
                      />
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="relative hidden lg:block animate-in fade-in zoom-in duration-1000">
            <div
              className="aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl relative"
              style={{ backgroundColor: cardBackground }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              <Image
                src={
                  section.media?.imageUrl ??
                  "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=1200"
                }
                alt={section.media?.alt ?? section.title}
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700 scale-105 hover:scale-100"
              />
            </div>

            {section.media?.floatingBadgeTitle ? (
              <div
                className="absolute -left-12 top-1/4 p-6 rounded-3xl shadow-xl"
                style={{ backgroundColor: cardBackground }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center font-bold"
                    style={{
                      backgroundColor: `${accentColor}12`,
                      color: accentColor,
                    }}
                  >
                    {section.media.floatingBadgeTitle.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-bold">
                      {section.media.floatingBadgeTitle}
                    </div>
                    {section.media.floatingBadgeLabel ? (
                      <div
                        className="text-xs"
                        style={{ color: mutedTextColor }}
                      >
                        {section.media.floatingBadgeLabel}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}

            {section.media?.secondaryBadgeTitle ? (
              <div
                className="absolute -right-8 bottom-1/4 p-6 rounded-3xl shadow-xl"
                style={{ backgroundColor: cardBackground }}
              >
                <div
                  className="font-bold text-xl mb-1"
                  style={{ color: accentColor }}
                >
                  {section.media.secondaryBadgeTitle}
                </div>
                {section.media.secondaryBadgeLabel ? (
                  <div
                    className="text-sm uppercase tracking-widest font-semibold"
                    style={{ color: mutedTextColor }}
                  >
                    {section.media.secondaryBadgeLabel}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
