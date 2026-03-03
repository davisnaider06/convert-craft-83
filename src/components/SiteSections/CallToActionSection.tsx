import React from "react";
import { Button } from "@/components/ui/button";

interface CallToActionProps {
  content: {
    title: string;
    subtitle?: string;
    button_text: string;
    background_style?: string;
    gradient_from?: string;
    gradient_to?: string;
  };
  primaryColor: string;
  isMobile: boolean;
}

export const CallToActionSection: React.FC<CallToActionProps> = ({ content, primaryColor, isMobile }) => {
  const wantsGradient = String(content.background_style || "").toLowerCase() === "gradient";
  const gradientFrom = content.gradient_from || primaryColor;
  const gradientTo = content.gradient_to || "#22d3ee";

  return (
    <section
      className="py-20 text-center px-4 bg-[#040816]"
      style={wantsGradient ? { backgroundImage: `linear-gradient(120deg, ${gradientFrom}22, ${gradientTo}18)` } : undefined}
    >
      <div className="container mx-auto max-w-4xl border border-white/10 bg-white/[0.03] rounded-2xl p-8 md:p-12">
        <h2 className={`font-semibold mb-5 text-white ${isMobile ? "text-3xl" : "text-4xl md:text-5xl"}`}>
          {content.title}
        </h2>
        {content.subtitle && <p className="text-lg text-slate-300 mb-8">{content.subtitle}</p>}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Button className="h-11 rounded-xl px-8 bg-white text-slate-900 hover:bg-slate-100">
            {content.button_text}
          </Button>
          <Button variant="ghost" className="h-11 rounded-xl px-8 text-slate-200 hover:bg-white/10">
            Learn more
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CallToActionSection;
