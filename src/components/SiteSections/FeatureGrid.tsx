import React from 'react';
import { getIcon } from '../boder/SiteRenderer';

interface Feature {
  title: string;
  description: string;
  icon: string;
}

interface FeatureGridProps {
  content: {
    title?: string;
    features: Feature[];
  };
  primaryColor: string;
  isMobile: boolean;
}

export const FeatureGrid: React.FC<FeatureGridProps> = ({ content, primaryColor, isMobile }) => {
  if (!content.features || content.features.length === 0) return null;

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className={`font-bold text-slate-900 ${isMobile ? "text-3xl" : "text-3xl md:text-4xl"}`}>
            {content.title || "Por que nos escolher?"}
          </h2>
        </div>
        <div className={`grid gap-8 ${isMobile ? "grid-cols-1" : "md:grid-cols-3"}`}>
          {content.features.map((feature, i) => (
            <div key={i} className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-all duration-300">
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
              >
                {getIcon(feature.icon)}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};