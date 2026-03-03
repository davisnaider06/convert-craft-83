import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Menu, X } from 'lucide-react';

interface NavbarProps {
  content: {
    logo_text?: string;
    links: { label: string; url: string }[];
    cta_text?: string;
    visual_variant?: string;
  };
  primaryColor: string;
}

export const Navbar: React.FC<NavbarProps> = ({ content, primaryColor }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const asText = (value: any, fallback: string) => {
    if (typeof value === "string") return value;
    if (value && typeof value === "object") return value.name || value.title || value.label || value.text || fallback;
    return fallback;
  };

  const navLinks = (Array.isArray(content?.links) ? content.links : []).map((link: any, i: number) => ({
    label: asText(link?.label, `Link ${i + 1}`),
    url: asText(link?.url, "#"),
  }));
  const variant = String(content?.visual_variant || "").toLowerCase();
  const navTone =
    variant === "portfolio"
      ? "bg-slate-950/80 text-white border-slate-800"
      : variant === "premium"
        ? "bg-slate-900/80 text-amber-50 border-amber-200/20"
        : variant === "event"
          ? "bg-indigo-950/80 text-indigo-50 border-indigo-200/20"
          : "bg-white/80 text-slate-900 border-slate-200";

  useEffect(() => {
    const scrollRoot = document.querySelector('[data-site-scroll-root="true"]');
    if (!scrollRoot) return;

    const handleScroll = () => {
      setIsScrolled((scrollRoot as HTMLElement).scrollTop > 20);
    };

    handleScroll();
    scrollRoot.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollRoot.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`sticky top-0 z-40 transition-all duration-300 ${
      isScrolled ? `${navTone} backdrop-blur-md shadow-sm py-3 border-b` : 'bg-transparent py-5'
    }`}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xl" style={{ color: isScrolled ? '#0f172a' : primaryColor }}>
          <Zap className="h-6 w-6" fill={primaryColor} />
          <span>{asText(content.logo_text, "Boder site")}</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link, i) => (
            <a key={i} href={link.url} className={`text-sm font-medium hover:opacity-70 transition-opacity ${variant === "portfolio" || variant === "premium" || variant === "event" ? "text-slate-100" : "text-slate-600"}`}>
              {link.label}
            </a>
          ))}
          <button
            className="px-6 py-2 rounded-full text-white text-sm font-bold transition-transform hover:scale-105"
            style={{ backgroundColor: primaryColor }}
          >
            {asText(content.cta_text, "Comecar")}
          </button>
        </div>

        <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {mobileMenuOpen && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="absolute top-full left-0 right-0 bg-white border-b p-6 flex flex-col gap-4 md:hidden shadow-xl">
          {navLinks.map((link, i) => (
            <a key={i} href={link.url} className="text-lg font-medium border-b border-slate-50 pb-2">{link.label}</a>
          ))}
        </motion.div>
      )}
    </nav>
  );
};
