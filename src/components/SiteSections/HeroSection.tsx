import React from "react";
import { ArrowRight, Shield, Sparkles, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HeroSectionProps {
  content: {
    headline: string;
    subheadline: string;
    cta: string;
    image_keyword?: string;
    visual_variant?: string;
    background_style?: string;
    gradient_from?: string;
    gradient_to?: string;
  };
  primaryColor: string;
  isMobile: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ content, primaryColor, isMobile }) => {
  const seed = encodeURIComponent(content.image_keyword || content.headline || "saas abstract");
  const heroImageUrl = `https://picsum.photos/seed/${seed}/1800/900`;
  const variant = String(content.visual_variant || "").toLowerCase();

  const wantsGradient = String(content.background_style || "").toLowerCase() === "gradient";
  const gradientFrom = content.gradient_from || primaryColor;
  const gradientTo = content.gradient_to || "#22d3ee";
  const badgeLabel =
    variant === "premium" ? "Premium" :
    variant === "portfolio" ? "Selected work" :
    variant === "lead" ? "Material gratuito" :
    variant === "event" ? "Ao vivo" :
    "New";
  const sectionTone =
    variant === "lead"
      ? "bg-slate-50"
      : variant === "catalog" || variant === "corporate"
        ? "bg-white"
        : "bg-[#040816]";
  const titleTone =
    variant === "lead" || variant === "catalog" || variant === "corporate"
      ? "text-slate-950"
      : "text-white";
  const copyTone =
    variant === "lead" || variant === "catalog" || variant === "corporate"
      ? "text-slate-600"
      : "text-slate-300";
  const panelTone =
    variant === "lead" || variant === "catalog" || variant === "corporate"
      ? "border-slate-200 bg-white text-slate-700"
      : "border-white/10 bg-white/5 text-slate-200";
  const mediaTone =
    variant === "lead" || variant === "catalog" || variant === "corporate"
      ? "border-slate-200 bg-white shadow-[0_25px_80px_rgba(15,23,42,0.12)]"
      : "border-white/10 bg-[#0b1228] shadow-[0_0_60px_rgba(37,99,235,0.3)]";

  return (
    <section className={`relative pt-20 pb-12 px-4 overflow-hidden ${sectionTone}`}>
      <div
        className="absolute inset-0"
        style={
          wantsGradient
            ? { backgroundImage: `radial-gradient(circle at 50% 0%, ${gradientFrom}66, transparent 50%), linear-gradient(120deg, ${gradientFrom}22, ${gradientTo}18)` }
            : variant === "lead" || variant === "catalog" || variant === "corporate"
              ? { backgroundImage: `radial-gradient(circle at 50% 0%, ${primaryColor}12, transparent 42%)` }
              : { backgroundImage: "radial-gradient(circle at 50% 0%, rgba(37,99,235,0.25), transparent 45%)" }
        }
      />
      <div className="container mx-auto text-center relative z-10 max-w-5xl">
        <Badge className={`mb-5 ${variant === "lead" || variant === "catalog" || variant === "corporate" ? "bg-white text-slate-700 border-slate-200" : "bg-white/5 text-slate-200 border-white/10 hover:bg-white/10"}`}>
          {badgeLabel}
        </Badge>
        <h1 className={`font-semibold tracking-tight mb-6 leading-[1.05] ${titleTone} ${isMobile ? "text-4xl" : "text-5xl md:text-7xl"}`}>
          {content.headline || "Transform Your Business With Our SaaS Solution"}
        </h1>
        <p className={`mb-10 max-w-3xl mx-auto leading-relaxed ${copyTone} ${isMobile ? "text-base" : "text-lg md:text-xl"}`}>
          {content.subheadline || "Automatize operacoes, aumente produtividade e eleve a experiencia do cliente com uma plataforma moderna."}
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Button size={isMobile ? "default" : "lg"} className="rounded-xl px-8 h-11" style={{ backgroundColor: "#fff", color: "#0f172a" }}>
            {content.cta || "Get started"}
          </Button>
          <Button size={isMobile ? "default" : "lg"} variant="ghost" className="rounded-xl px-8 h-11 text-slate-100 hover:bg-white/10">
            Request a Demo <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="container mx-auto mt-8 px-4 max-w-5xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-6">
          <div className={`rounded-xl px-4 py-3 text-sm flex items-center gap-2 ${panelTone}`}>
            <Clock3 className="h-4 w-4" style={{ color: primaryColor }} />
            4-6 week delivery
          </div>
          <div className={`rounded-xl px-4 py-3 text-sm flex items-center gap-2 ${panelTone}`}>
            <Sparkles className="h-4 w-4" style={{ color: primaryColor }} />
            Transparent pricing
          </div>
          <div className={`rounded-xl px-4 py-3 text-sm flex items-center gap-2 ${panelTone}`}>
            <Shield className="h-4 w-4" style={{ color: primaryColor }} />
            Money back guarantee
          </div>
        </div>

        <div className={`rounded-2xl overflow-hidden border relative aspect-video ${mediaTone}`}>
          <img
            src={heroImageUrl}
            alt="Demonstracao"
            className="w-full h-full object-cover opacity-85"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = "https://picsum.photos/1800/900";
            }}
          />
        </div>
      </div>
    </section>
  );
};
