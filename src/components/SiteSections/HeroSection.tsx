import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface HeroSectionProps {
  content: {
    headline: string;
    subheadline: string;
    cta: string;
    image_keyword?: string;
    visual_variant?: string;
  };
  primaryColor: string;
  isMobile: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ content, primaryColor, isMobile }) => {
  const seed = encodeURIComponent(content.image_keyword || content.headline || "hero business");
  const heroImageUrl = `https://picsum.photos/seed/${seed}/1600/900`;
  const variant = String(content.visual_variant || "").toLowerCase();
  const darkHero = variant === "portfolio" || variant === "premium" || variant === "event";
  const sectionBg =
    variant === "event"
      ? "bg-gradient-to-br from-indigo-950 via-violet-900 to-fuchsia-900"
      : darkHero
        ? "bg-slate-950"
        : variant === "lead"
          ? "bg-gradient-to-b from-indigo-50 to-white"
          : "bg-white";

  return (
    <section className={`relative pt-24 pb-20 px-4 overflow-hidden ${sectionBg}`}>
      <div className="container mx-auto text-center relative z-10 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Badge variant={darkHero ? "secondary" : "outline"} className="mb-5">
            Site pronto para conversao
          </Badge>
          <h1 className={`font-extrabold tracking-tight mb-8 leading-[1.1] ${darkHero ? "text-white" : "text-slate-900"} ${isMobile ? "text-4xl" : "text-5xl md:text-7xl"}`}>
            {content.headline || "Titulo principal"}
          </h1>
          <p className={`mb-10 max-w-2xl mx-auto leading-relaxed ${darkHero ? "text-slate-200" : "text-slate-600"} ${isMobile ? "text-lg" : "text-xl md:text-2xl"}`}>
            {content.subheadline || "Subtitulo focado no beneficio principal do cliente."}
          </p>
          <Button
            size={isMobile ? "default" : "lg"}
            className="rounded-full px-8 h-12 gap-2 text-white w-full sm:w-auto"
            style={{ backgroundColor: primaryColor }}
          >
            {content.cta || "Quero comecar agora"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="container mx-auto mt-14 px-4 max-w-5xl"
      >
        <Card className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 relative aspect-video md:aspect-[21/9]">
          <img
            src={heroImageUrl}
            alt="Demonstracao"
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = "https://picsum.photos/1600/900";
            }}
          />
        </Card>
      </motion.div>
    </section>
  );
};
