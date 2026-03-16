import React from 'react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { getIcon } from '../boder/SiteRenderer'; // Importe o helper de ícones

interface LinkItem {
  label: string;
  url: string;
  icon?: string;
}

interface LinkButtonsProps {
  content: {
    links: LinkItem[];
    visual_variant?: string;
  };
  primaryColor: string;
  isMobile: boolean;
}

export const LinkButtons: React.FC<LinkButtonsProps> = ({ content, primaryColor, isMobile }) => {
  const asText = (value: any, fallback: string) => {
    if (typeof value === "string") return value;
    if (value && typeof value === "object") return value.name || value.title || value.label || value.text || fallback;
    return fallback;
  };

  const links = (Array.isArray(content.links) ? content.links : []).map((link: any, i: number) => ({
    label: asText(link?.label, `Link ${i + 1}`),
    url: asText(link?.url, "#"),
    icon: asText(link?.icon, "link"),
  }));
  if (links.length === 0) return null;
  const variant = String(content.visual_variant || "").toLowerCase();
  const panelClass =
    variant === "biolink"
      ? "border-pink-100 hover:border-pink-300 bg-white shadow-[0_20px_50px_rgba(244,114,182,0.12)]"
      : "border-slate-100 hover:border-primary shadow-sm bg-white";
  const iconClass =
    variant === "biolink"
      ? "bg-pink-50 text-pink-500"
      : "bg-slate-50 text-slate-400";

  return (
    <section className={`px-4 pb-12 space-y-4 max-w-md mx-auto ${variant === "biolink" ? "bg-white" : ""}`}>
      {links.map((link: LinkItem, i: number) => (
        <motion.a
          key={i}
          href={link.url}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all group ${panelClass}`}
          style={{ "--hover-color": primaryColor } as any}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg group-hover:text-primary transition-colors ${iconClass}`}>
              {getIcon(link.icon || 'linkicon')}
            </div>
            <span className="font-bold">{link.label}</span>
          </div>
          <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all" />
        </motion.a>
      ))}
    </section>
  );
};
