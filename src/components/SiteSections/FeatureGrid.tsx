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

  return (
    <section className="py-24 bg-[#040816]">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <p className="inline-block text-xs uppercase tracking-widest text-slate-400 bg-white/5 border border-white/10 rounded-full px-3 py-1 mb-4">
            Why choose us
          </p>
          <h2 className={`font-semibold text-white ${isMobile ? "text-3xl" : "text-3xl md:text-5xl"}`}>
            {content.title || "Unlock the full potential of your business"}
          </h2>
        </div>
        <div className={`grid gap-6 ${isMobile ? "grid-cols-1" : "md:grid-cols-3"}`}>
          {features.map((feature, i) => (
            <Card key={i} className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#0f1f4a] to-[#0a1433] shadow-[0_0_20px_rgba(37,99,235,0.18)]">
              <CardHeader className="pb-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-2 bg-white/10"
                  style={{ color: primaryColor }}
                >
                  {getIcon(feature.icon)}
                </div>
                <CardTitle className="text-xl text-white">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed text-slate-300">
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
