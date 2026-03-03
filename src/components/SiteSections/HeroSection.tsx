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

  const wantsGradient = String(content.background_style || "").toLowerCase() === "gradient";
  const gradientFrom = content.gradient_from || primaryColor;
  const gradientTo = content.gradient_to || "#22d3ee";

  return (
    <section className="relative pt-20 pb-12 px-4 overflow-hidden bg-[#040816]">
      <div
        className="absolute inset-0"
        style={
          wantsGradient
            ? { backgroundImage: `radial-gradient(circle at 50% 0%, ${gradientFrom}66, transparent 50%), linear-gradient(120deg, ${gradientFrom}22, ${gradientTo}18)` }
            : { backgroundImage: "radial-gradient(circle at 50% 0%, rgba(37,99,235,0.25), transparent 45%)" }
        }
      />
      <div className="container mx-auto text-center relative z-10 max-w-5xl">
        <Badge className="mb-5 bg-white/5 text-slate-200 border border-white/10 hover:bg-white/10">
          New
        </Badge>
        <h1 className={`font-semibold tracking-tight text-white mb-6 leading-[1.05] ${isMobile ? "text-4xl" : "text-5xl md:text-7xl"}`}>
          {content.headline || "Transform Your Business With Our SaaS Solution"}
        </h1>
        <p className={`mb-10 max-w-3xl mx-auto leading-relaxed text-slate-300 ${isMobile ? "text-base" : "text-lg md:text-xl"}`}>
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
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-200 text-sm flex items-center gap-2">
            <Clock3 className="h-4 w-4" style={{ color: primaryColor }} />
            4-6 week delivery
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-200 text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4" style={{ color: primaryColor }} />
            Transparent pricing
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-200 text-sm flex items-center gap-2">
            <Shield className="h-4 w-4" style={{ color: primaryColor }} />
            Money back guarantee
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#0b1228] relative aspect-video shadow-[0_0_60px_rgba(37,99,235,0.3)]">
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
