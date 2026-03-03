import React, { useState } from "react";
import { Zap, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const asText = (value: any, fallback: string) =>
    typeof value === "string" ? value : value?.name || value?.title || value?.label || fallback;

  const navLinks = (Array.isArray(content?.links) ? content.links : []).slice(0, 4).map((link: any, i: number) => ({
    label: asText(link?.label, `Link ${i + 1}`),
    url: asText(link?.url, "#"),
  }));

  return (
    <nav className="sticky top-0 z-40 border-b border-white/10 bg-[#040816]/80 backdrop-blur-xl">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white font-semibold">
          <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${primaryColor}25` }}>
            <Zap className="h-4 w-4" style={{ color: primaryColor }} />
          </div>
          <span>{asText(content.logo_text, "Equinox")}</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link, i) => (
            <a key={i} href={link.url} className="text-sm text-slate-300 hover:text-white transition-colors">
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <span className="text-xs text-emerald-300 bg-emerald-300/10 px-3 py-1 rounded-full border border-emerald-300/30">
            Online now
          </span>
          <Button className="rounded-full h-9 px-5 text-white" style={{ backgroundColor: primaryColor }}>
            {asText(content.cta_text, "Contact us")}
          </Button>
        </div>

        <button className="md:hidden text-white" onClick={() => setMobileMenuOpen((v) => !v)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden px-6 pb-4 flex flex-col gap-3 border-t border-white/10 bg-[#060d22]">
          {navLinks.map((link, i) => (
            <a key={i} href={link.url} className="text-slate-200 py-2">
              {link.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
};
