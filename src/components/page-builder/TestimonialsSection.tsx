import type { CSSProperties } from "react";
import type { HomepageTestimonialsSectionConfig } from "@/lib/homepage";

interface TestimonialsSectionProps {
  section: HomepageTestimonialsSectionConfig;
}

function getRating(rating?: number): number {
  if (!rating) {
    return 0;
  }

  return Math.max(1, Math.min(5, Math.round(rating)));
}

export function TestimonialsSection({ section }: TestimonialsSectionProps) {
  const theme = section.theme ?? {};
  const sectionStyle: CSSProperties = {
    backgroundColor: theme.background,
    color: theme.foreground,
  };
  const mutedTextColor = theme.mutedForeground ?? "#64748b";
  const cardBackground = theme.cardBackground ?? "rgba(255, 255, 255, 0.82)";
  const borderColor = theme.borderColor ?? "#cbd5e1";

  return (
    <section className="py-20" style={sectionStyle}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-10">
          <div className="mx-auto max-w-3xl space-y-4 text-center">
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
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {section.items.map((item, index) => {
              const rating = getRating(item.rating);

              return (
                <article
                  key={`${item.author}-${index}`}
                  className="flex h-full flex-col justify-between rounded-[2rem] border p-8"
                  style={{ backgroundColor: cardBackground, borderColor }}
                >
                  <div className="space-y-5">
                    {rating > 0 ? (
                      <div className="flex items-center gap-1 text-primary">
                        <span className="sr-only">{`${rating} out of 5 stars`}</span>
                        {Array.from({ length: rating }, (_, ratingIndex) => (
                          <span
                            key={`${item.author}-star-${ratingIndex}`}
                            aria-hidden="true"
                            className="text-lg"
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    ) : null}
                    <blockquote className="text-lg leading-8 md:text-xl">
                      “{item.quote}”
                    </blockquote>
                  </div>
                  <div className="mt-8 space-y-1">
                    <p className="text-base font-semibold">{item.author}</p>
                    {item.role || item.company ? (
                      <p className="text-sm" style={{ color: mutedTextColor }}>
                        {[item.role, item.company].filter(Boolean).join(", ")}
                      </p>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
