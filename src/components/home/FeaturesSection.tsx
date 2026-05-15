import { ShieldCheck, ShoppingBag, Sparkles, Truck } from "lucide-react";
import type { CSSProperties } from "react";
import type { HomepageFeaturesSectionConfig } from "@/lib/homepage";

interface FeaturesSectionProps {
  section: HomepageFeaturesSectionConfig;
}

function getFeatureIcon(iconName?: string) {
  switch (iconName) {
    case "truck":
      return <Truck className="w-6 h-6" />;
    case "shield":
      return <ShieldCheck className="w-6 h-6" />;
    case "shopping-bag":
      return <ShoppingBag className="w-6 h-6" />;
    default:
      return <Sparkles className="w-6 h-6" />;
  }
}

export async function FeaturesSection({ section }: FeaturesSectionProps) {
  const theme = section.theme ?? {};
  const sectionStyle: CSSProperties = {
    backgroundColor: theme.background,
    color: theme.foreground,
  };
  const mutedTextColor = theme.mutedForeground ?? "#6b7280";
  const cardBackground = theme.cardBackground ?? "#ffffff";
  const borderColor = theme.borderColor ?? "#e5e7eb";
  const accentColor = theme.accent ?? "#2563eb";

  return (
    <section className="py-24" style={sectionStyle}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {section.title ? (
          <div className="max-w-2xl mb-12">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              {section.title}
            </h2>
            {section.description ? (
              <p
                className="mt-4 text-lg leading-relaxed"
                style={{ color: mutedTextColor }}
              >
                {section.description}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {section.items.map((feature, id) => (
            <div
              key={`${feature.title}-${id}`}
              className="flex flex-col items-center text-center group rounded-3xl p-8 border shadow-sm transition-transform duration-300 hover:-translate-y-1"
              style={{ backgroundColor: cardBackground, borderColor }}
            >
              <div
                className="mb-6 p-4 rounded-2xl shadow-sm group-hover:scale-110 transition-transform duration-300"
                style={{
                  backgroundColor: `${accentColor}12`,
                  color: accentColor,
                }}
              >
                {getFeatureIcon(feature.icon)}
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p
                className="leading-relaxed max-w-xs"
                style={{ color: mutedTextColor }}
              >
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
