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
  return (
    <footer className="py-12 bg-slate-950 text-slate-500 text-center px-4">
      {content.social_media && content.social_media.length > 0 && (
        <div className="flex justify-center gap-6 mb-8">
          {content.social_media.map((sm: any, i: number) => (
            <a key={i} href={sm.url} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              {getIcon(sm.platform, 'h-6 w-6')}
            </a>
          ))}
        </div>
      )}
      <p className="text-sm">{content.text || `© ${new Date().getFullYear()} Boder AI. Todos os direitos reservados.`}</p>
    </footer>
  );
};