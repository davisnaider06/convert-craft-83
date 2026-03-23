import React from "react";
import { Button } from "@/components/ui/button";

interface CallToActionProps {
  content: {
    title: string;
    subtitle?: string;
    button_text: string;
    visual_variant?: string;
    button_variant?: string;
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
  const variant = String(content.visual_variant || "").toLowerCase();
  const buttonVariant = String(content.button_variant || "").toLowerCase();
  const isLight = variant === "lead" || variant === "catalog" || variant === "corporate";
  const sectionTone = isLight ? "bg-slate-50" : "bg-[#040816]";
  const panelTone = isLight
    ? "border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)]"
    : "border-white/10 bg-white/[0.03]";
  const titleTone = isLight ? "text-slate-950" : "text-white";
  const copyTone = isLight ? "text-slate-600" : "text-slate-300";
  const secondaryButtonClass = isLight ? "text-slate-700 hover:bg-slate-100" : "text-slate-200 hover:bg-white/10";
  const secondaryLabel =
    variant === "portfolio" ? "Ver projetos" :
    variant === "catalog" ? "Explorar oferta" :
    variant === "corporate" ? "Conhecer empresa" :
    "Learn more";
  const primaryButtonStyle =
    buttonVariant === "gradient-solid"
      ? { backgroundImage: `linear-gradient(90deg, ${gradientFrom}, ${gradientTo})`, color: "#ffffff" }
      : buttonVariant === "glow-outline"
        ? { backgroundColor: "transparent", color: primaryColor, border: `1px solid ${primaryColor}` }
        : undefined;

  return (
    <section
      className={`py-20 text-center px-4 ${sectionTone}`}
      style={wantsGradient ? { backgroundImage: `linear-gradient(120deg, ${gradientFrom}22, ${gradientTo}18)` } : undefined}
    >
      <div className={`container mx-auto max-w-4xl border rounded-2xl p-8 md:p-12 ${panelTone}`}>
        <h2 className={`font-semibold mb-5 ${titleTone} ${isMobile ? "text-3xl" : "text-4xl md:text-5xl"}`}>
          {content.title}
        </h2>
        {content.subtitle && <p className={`text-lg mb-8 ${copyTone}`}>{content.subtitle}</p>}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Button
            className={`h-11 rounded-xl px-8 ${buttonVariant === "glow-outline" ? "hover:opacity-90" : "bg-white text-slate-900 hover:bg-slate-100"}`}
            style={primaryButtonStyle}
          >
            {content.button_text}
          </Button>
          <Button variant="ghost" className={`h-11 rounded-xl px-8 ${secondaryButtonClass}`}>
            {secondaryLabel}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CallToActionSection;
