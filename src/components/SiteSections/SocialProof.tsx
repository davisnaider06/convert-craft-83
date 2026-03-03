import React from 'react';
import { getIcon } from '../boder/SiteRenderer';

interface SocialProofProps {
  content: {
    title?: string;
    logos: string[]; // Pode ser array de strings ou de objetos com { name, image_url }
  };
  primaryColor: string;
  isMobile: boolean;
}

export const SocialProof: React.FC<SocialProofProps> = ({ content, primaryColor, isMobile }) => {
  const normalizeLogo = (item: any) => {
    if (typeof item === "string") return item;
    if (item && typeof item === "object") {
      return item.name || item.title || item.label || item.text || item.link || "Parceiro";
    }
    return "Parceiro";
  };

  const logos = (Array.isArray(content.logos) ? content.logos : []).map(normalizeLogo);
  if (logos.length === 0) return null;

  return (
    <section className="py-10 border-y border-slate-100 bg-slate-50">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm font-semibold text-slate-400 mb-6 uppercase tracking-wider">
          {content.title || "Empresas que confiam"}
        </p>
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 items-center">
          {logos.map((logo: string, i: number) => (
            <span key={i} className="text-xl font-bold text-slate-300 flex items-center gap-2 grayscale opacity-70">
              {getIcon('globe', 'h-6 w-6')} {logo}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};
