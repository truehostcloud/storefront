import Link from "next/link";
import type { CSSProperties } from "react";
import { Button } from "@/components/ui/button";
import type { DynamicPageRichTextSectionConfig } from "@/lib/page-builder";

interface RichTextSectionProps {
  basePath: string;
  section: DynamicPageRichTextSectionConfig;
}

function resolveHref(basePath: string, href: string): string {
  if (/^https?:\/\//.test(href)) return href;
  if (href.startsWith(basePath)) return href;
  if (href === "/") return basePath;
  return href.startsWith("/") ? `${basePath}${href}` : `${basePath}/${href}`;
}

export function RichTextSection({ basePath, section }: RichTextSectionProps) {
  const theme = section.theme ?? {};
  const sectionStyle: CSSProperties = {
    backgroundColor: theme.background,
    color: theme.foreground,
  };
  const mutedTextColor = theme.mutedForeground ?? "#6b7280";
  const alignmentClass =
    section.alignment === "center"
      ? "items-center text-center mx-auto"
      : "items-start text-left";

  return (
    <section className="py-20" style={sectionStyle}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`max-w-3xl flex flex-col gap-6 ${alignmentClass}`}>
          {section.eyebrow ? (
            <span className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
              {section.eyebrow}
            </span>
          ) : null}
          {section.title ? (
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              {section.title}
            </h2>
          ) : null}
          <div className="space-y-4">
            {section.body.map((paragraph, index) => (
              <p
                key={`${paragraph.slice(0, 20)}-${index}`}
                className="text-lg leading-8"
                style={{ color: mutedTextColor }}
              >
                {paragraph}
              </p>
            ))}
          </div>
          {section.cta ? (
            <div>
              <Button variant={section.cta.variant ?? "link"} asChild>
                <Link href={resolveHref(basePath, section.cta.href)}>
                  {section.cta.label}
                </Link>
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
