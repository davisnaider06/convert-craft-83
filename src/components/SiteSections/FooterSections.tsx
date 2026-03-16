import React from 'react';
import { getIcon } from '../boder/SiteRenderer';

interface FooterContent {
  text?: string;
  social_media?: Array<{ platform: string; url: string }>;
}

interface FooterSectionProps {
  content: FooterContent;
  primaryColor: string;
  isMobile: boolean;
}

export const FooterSection: React.FC<FooterSectionProps> = ({ content, primaryColor, isMobile }) => {
  const socialMedia = Array.isArray(content?.social_media) ? content.social_media : [];
  const variant = String((content as any)?.visual_variant || "").toLowerCase();
  const isLight = variant === "lead" || variant === "catalog" || variant === "corporate" || variant === "biolink";
  return (
    <footer className={`py-12 text-center px-4 ${isLight ? "bg-white text-slate-500 border-t border-slate-200" : "bg-slate-950 text-slate-500"}`}>
      {socialMedia.length > 0 && (
        <div className="flex justify-center gap-6 mb-8">
          {socialMedia.map((sm: any, i: number) => (
            <a
              key={i}
              href={sm.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`transition-colors ${isLight ? "hover:text-slate-900" : "hover:text-white"}`}
            >
              {getIcon(sm.platform, 'h-6 w-6')}
            </a>
          ))}
        </div>
      )}
      <p className="text-sm">{content.text || `© ${new Date().getFullYear()} Boder AI. Todos os direitos reservados.`}</p>
    </footer>
  );
};
