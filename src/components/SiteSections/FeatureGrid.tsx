import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getIcon } from "../boder/SiteRenderer";

interface Feature {
  title: string;
  description: string;
  icon: string;
}

interface FeatureGridProps {
  content: {
    title?: string;
    features: Feature[];
    visual_variant?: string;
    card_variant?: string;
  };
  primaryColor: string;
  isMobile: boolean;
}

export const FeatureGrid: React.FC<FeatureGridProps> = ({ content, primaryColor, isMobile }) => {
  const features = Array.isArray(content?.features) ? content.features : [];
  if (features.length === 0) return null;
  const variant = String(content.visual_variant || "").toLowerCase();
  const cardVariant = String(content.card_variant || "").toLowerCase();
  const isLight = variant === "lead" || variant === "catalog" || variant === "corporate";
  const sectionBg = isLight ? "bg-white" : "bg-[#040816]";
  const eyebrowTone = isLight ? "text-slate-500 bg-slate-100 border-slate-200" : "text-slate-400 bg-white/5 border-white/10";
  const titleTone = isLight ? "text-slate-950" : "text-white";
  const cardTone = isLight
    ? "border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
    : "border-white/10 bg-gradient-to-b from-[#0f1f4a] to-[#0a1433] shadow-[0_0_20px_rgba(37,99,235,0.18)]";
  const copyTone = isLight ? "text-slate-600" : "text-slate-300";
  const cardClass =
    cardVariant === "editorial-cards"
      ? `${cardTone} rounded-[28px]`
      : cardVariant === "soft-border"
        ? `${isLight ? "border-slate-200 bg-slate-50 shadow-none" : cardTone} rounded-2xl`
        : `${cardTone} rounded-2xl`;

  return (
    <section className={`py-24 ${sectionBg}`}>
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <p className={`inline-block text-xs uppercase tracking-widest border rounded-full px-3 py-1 mb-4 ${eyebrowTone}`}>
            Why choose us
          </p>
          <h2 className={`font-semibold ${titleTone} ${isMobile ? "text-3xl" : "text-3xl md:text-5xl"}`}>
            {content.title || "Unlock the full potential of your business"}
          </h2>
        </div>
        <div className={`grid gap-6 ${isMobile ? "grid-cols-1" : "md:grid-cols-3"}`}>
          {features.map((feature, i) => (
            <Card key={i} className={cardClass}>
              <CardHeader className="pb-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 ${isLight ? "bg-slate-100" : "bg-white/10"}`}
                  style={{ color: primaryColor }}
                >
                  {getIcon(feature.icon)}
                </div>
                <CardTitle className={`text-xl ${titleTone}`}>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className={`text-base leading-relaxed ${copyTone}`}>
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
