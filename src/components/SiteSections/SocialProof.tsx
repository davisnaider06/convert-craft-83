import React from "react";

interface SocialProofProps {
  content: {
    title?: string;
    logos: string[];
  };
  primaryColor: string;
  isMobile: boolean;
}

export const SocialProof: React.FC<SocialProofProps> = ({ content }) => {
  const normalizeLogo = (item: any) => {
    if (typeof item === "string") return item;
    if (item && typeof item === "object") return item.name || item.title || item.label || "Parceiro";
    return "Parceiro";
  };

  const logos = (Array.isArray(content?.logos) ? content.logos : []).map(normalizeLogo);
  if (logos.length === 0) return null;

  return (
    <section className="py-8 border-y border-white/10 bg-[#040816]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
          <p className="text-xs text-slate-400 uppercase tracking-widest">
            {content.title || "Trusted by companies around the world"}
          </p>
          <div className="flex flex-wrap gap-8 items-center">
            {logos.slice(0, 6).map((logo: string, i: number) => (
              <span key={i} className="text-slate-300/90 text-sm font-semibold">
                {logo}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
