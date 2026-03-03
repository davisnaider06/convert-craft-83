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
  };
  primaryColor: string;
  isMobile: boolean;
}

export const FeatureGrid: React.FC<FeatureGridProps> = ({ content, primaryColor, isMobile }) => {
  const features = Array.isArray(content?.features) ? content.features : [];
  if (features.length === 0) return null;

  const variant = String(content.visual_variant || "").toLowerCase();
  const dark = variant === "portfolio" || variant === "premium";
  const sectionBg = dark ? "bg-slate-950" : variant === "lead" ? "bg-indigo-50/50" : "bg-white";
  const titleColor = dark ? "text-white" : "text-slate-900";
  const textColor = dark ? "text-slate-300" : "text-slate-600";
  const cardClass = dark ? "bg-slate-900 border-slate-700" : "bg-white";

  return (
    <section className={`py-24 ${sectionBg}`}>
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className={`font-bold ${titleColor} ${isMobile ? "text-3xl" : "text-3xl md:text-4xl"}`}>
            {content.title || "Por que nos escolher?"}
          </h2>
        </div>
        <div className={`grid gap-6 ${isMobile ? "grid-cols-1" : "md:grid-cols-3"}`}>
          {features.map((feature, i) => (
            <Card key={i} className={`${cardClass} rounded-2xl transition-all duration-300 hover:shadow-lg`}>
              <CardHeader className="pb-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-2"
                  style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                >
                  {getIcon(feature.icon)}
                </div>
                <CardTitle className={`text-xl ${titleColor}`}>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className={`text-base leading-relaxed ${textColor}`}>
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
