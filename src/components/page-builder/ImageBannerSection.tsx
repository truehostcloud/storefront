import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { CSSProperties, ReactElement } from "react";
import { Button } from "@/components/ui/button";
import type { DynamicPageImageBannerSectionConfig } from "@/lib/page-builder";

interface ImageBannerSectionProps {
  basePath: string;
  section: DynamicPageImageBannerSectionConfig;
}

function resolveHref(basePath: string, href: string): string {
  if (/^https?:\/\//.test(href)) return href;
  if (href.startsWith(basePath)) return href;
  if (href === "/") return basePath;
  return href.startsWith("/") ? `${basePath}${href}` : `${basePath}/${href}`;
}

function getHeightClass(
  height: DynamicPageImageBannerSectionConfig["height"],
): string {
  switch (height) {
    case "sm":
      return "min-h-[320px]";
    case "lg":
      return "min-h-[560px]";
    default:
      return "min-h-[440px]";
  }
}

export function ImageBannerSection({
  basePath,
  section,
}: ImageBannerSectionProps): ReactElement {
  const theme = section.theme ?? {};
  const foreground = theme.foreground ?? "#ffffff";
  const mutedTextColor = theme.mutedForeground ?? "#e5e7eb";
  const overlayStyle: CSSProperties = section.overlay
    ? {
        background:
          "linear-gradient(180deg, rgba(15, 23, 42, 0.25), rgba(15, 23, 42, 0.7))",
      }
    : {};

  return (
    <section className="py-8 md:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`relative overflow-hidden rounded-[2rem] ${getHeightClass(section.height)}`}
        >
          <div
            aria-label={section.imageAlt ?? section.title}
            role="img"
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${section.imageUrl})` }}
          />
          <div className="absolute inset-0" style={overlayStyle} />
          <div className="relative z-10 flex h-full items-end p-8 md:p-14">
            <div className="max-w-2xl space-y-4">
              {section.eyebrow ? (
                <span
                  className="text-sm font-semibold uppercase tracking-[0.3em]"
                  style={{ color: mutedTextColor }}
                >
                  {section.eyebrow}
                </span>
              ) : null}
              <h2
                className="text-3xl md:text-5xl font-extrabold tracking-tight"
                style={{ color: foreground }}
              >
                {section.title}
              </h2>
              {section.description ? (
                <p
                  className="text-lg leading-8"
                  style={{ color: mutedTextColor }}
                >
                  {section.description}
                </p>
              ) : null}
              {section.cta ? (
                <Button variant={section.cta.variant ?? "secondary"} asChild>
                  <Link href={resolveHref(basePath, section.cta.href)}>
                    {section.cta.label}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
