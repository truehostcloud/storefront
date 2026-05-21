import type { CSSProperties } from "react";
import type { HomepageFaqSectionConfig } from "@/lib/homepage";

interface FaqSectionProps {
  section: HomepageFaqSectionConfig;
}

export function FaqSection({ section }: FaqSectionProps) {
  const theme = section.theme ?? {};
  const sectionStyle: CSSProperties = {
    backgroundColor: theme.background,
    color: theme.foreground,
  };
  const mutedTextColor = theme.mutedForeground ?? "#64748b";
  const cardBackground = theme.cardBackground ?? "rgba(255, 255, 255, 0.72)";
  const borderColor = theme.borderColor ?? "#cbd5e1";

  return (
    <section className="py-20" style={sectionStyle}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-10">
          <div className="space-y-4 text-center">
            {section.eyebrow ? (
              <span className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
                {section.eyebrow}
              </span>
            ) : null}
            <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">
              {section.title}
            </h2>
            {section.description ? (
              <p
                className="mx-auto max-w-2xl text-lg leading-8"
                style={{ color: mutedTextColor }}
              >
                {section.description}
              </p>
            ) : null}
          </div>
          <div className="space-y-4">
            {section.items.map((item, index) => (
              <details
                key={`${item.question}-${index}`}
                className="rounded-[1.75rem] border px-6 py-5"
                style={{ backgroundColor: cardBackground, borderColor }}
                open={index === 0}
              >
                <summary className="cursor-pointer list-none text-left text-lg font-semibold">
                  <span className="inline-flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {index + 1}
                    </span>
                    {item.question}
                  </span>
                </summary>
                <p
                  className="mt-4 pl-11 text-base leading-7"
                  style={{ color: mutedTextColor }}
                >
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
