import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { getIcon } from '../boder/SiteRenderer'; // Importe o helper de ícones

interface HeroSectionProps {
  content: {
    headline: string;
    subheadline: string;
    cta: string;
    image_keyword?: string;
  };
  primaryColor: string;
  isMobile: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ content, primaryColor, isMobile }) => {
  return (
    <section className="relative pt-24 pb-32 px-4 overflow-hidden">
      <div className="container mx-auto text-center relative z-10 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className={`font-extrabold tracking-tight text-slate-900 mb-8 leading-[1.1] ${isMobile ? "text-5xl" : "text-5xl md:text-7xl"}`}>
            {content.headline || "Título Principal"}
          </h1>
          <p className={`text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed ${isMobile ? "text-lg" : "text-xl md:text-2xl"}`}>
            {content.subheadline || "Subtítulo explicativo focando na dor do cliente."}
          </p>
          <button 
            className="h-14 px-8 text-lg rounded-full text-white font-bold flex items-center justify-center gap-2 transition-all hover:shadow-xl hover:-translate-y-1 w-full sm:w-auto"
            style={{ backgroundColor: primaryColor, boxShadow: `0 10px 25px -5px ${primaryColor}40` }}
          >
            {content.cta || "Quero Começar Agora"} {getIcon('arrowright', 'h-5 w-5')}
          </button>
        </motion.div>
      </div>

      {content.image_keyword && (
        <motion.div 
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
          className="container mx-auto mt-16 px-4 max-w-5xl"
        >
          <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-slate-50 relative aspect-video md:aspect-[21/9]">
            <img 
              src={`https://source.unsplash.com/1600x900/?${encodeURIComponent(content.image_keyword)}`} 
              alt="Demonstração" className="w-full h-full object-cover" loading="lazy"
            />
          </div>
        </motion.div>
      )}
    </section>
  );
};