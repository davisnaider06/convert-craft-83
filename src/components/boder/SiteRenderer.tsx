import { 
  Check, Star, ArrowRight, Zap, Shield, 
  Globe, BarChart, Users, Layout, MessageCircle,
  ShoppingBag, Link as LinkIcon, Briefcase, Award,
  Instagram, Twitter, Github, Linkedin, Smartphone, Mail, Youtube
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

// Importação dos seus 10 componentes
import { HeroSection } from '../SiteSections/HeroSection';
import { FeatureGrid } from '../SiteSections/FeatureGrid';
import { TestimonialSlider } from '../SiteSections/TestimonialSlider';
import { PricingTable } from '../SiteSections/PricingTable';
import { FAQSection } from '../SiteSections/FAQSection';
import { CallToActionSection } from '../SiteSections/CallToActionSection';
import { ProductCatalog } from '../SiteSections/ProductCatalog';
import { ProfileHeader } from '../SiteSections/ProfileHeader';
import { LinkButtons } from '../SiteSections/LinkButtons';
import { ProjectGallery } from '../SiteSections/ProjectGallery';
import { SocialProof } from '../SiteSections/SocialProof';
import { FooterSection } from '../SiteSections/FooterSections';
import { Navbar } from '../SiteSections/Navbar';

export const iconMap: Record<string, any> = {
  zap: Zap, shield: Shield, globe: Globe, chart: BarChart,
  users: Users, layout: Layout, check: Check, star: Star,
  message: MessageCircle, instagram: Instagram, twitter: Twitter,
  github: Github, linkedin: Linkedin, smartphone: Smartphone, mail: Mail,
  youtube: Youtube, briefcase: Briefcase, award: Award, shoppingbag: ShoppingBag
};

// Helper global para ícones que os subcomponentes podem usar
export const getIcon = (iconName: string, className: string = "h-6 w-6") => {
  const IconComponent = iconMap[iconName?.toLowerCase()] || Star;
  return <IconComponent className={className} />;
};

const SECTION_TYPE_ALIASES: Record<string, string> = {
  cta: "cta-section",
  features: "feature-grid",
  testimonials: "testimonial-slider",
  pricing: "pricing-table",
  faq: "faq-section",
  products: "product-catalog",
  projects: "project-gallery",
  footer: "footer-section",
  links: "link-buttons",
  social: "social-proof",
  profile: "profile-header",
};

export function SiteRenderer({ data, viewMode = "desktop" }: { data: any, viewMode?: "desktop" | "mobile" }) {
  // Se não houver seções, exibe estado vazio
  if (!data || !data.sections || data.sections.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground p-10 text-center">
        <p>Aguardando a IA estruturar as seções do seu site...</p>
      </div>
    );
  }

  const primaryColor = data.colors?.primary || "#3b82f6";
  const isMobile = viewMode === "mobile";

  return (
    <div className={`min-h-screen bg-white text-slate-900 font-sans w-full overflow-x-hidden ${isMobile ? 'max-w-[375px] mx-auto shadow-2xl' : ''}`}>
      
      {/* O SiteRenderer agora é apenas um distribuidor (Dispatcher) */}
     {data.sections.map((section: any, index: number) => {
  const normalizedType = SECTION_TYPE_ALIASES[String(section?.type || "").toLowerCase()] || String(section?.type || "").toLowerCase();
  const sectionKey = `${normalizedType || "unknown"}-${index}`;
  const props = { key: sectionKey, content: section, primaryColor, isMobile };

        switch (normalizedType) {
          case "hero":
            return <HeroSection {...props} />;
          case "feature-grid":
            return <FeatureGrid {...props} />;
          case "testimonial-slider":
            return <TestimonialSlider {...props} />;
          case "pricing-table":
            return <PricingTable {...props} />;
          case "faq-section":
            return <FAQSection {...props} />;
          case "cta-section":
            return <CallToActionSection {...props} />;
          case "product-catalog":
            return <ProductCatalog {...props} />;
          case "profile-header":
            return <ProfileHeader {...props} />;
          case "link-buttons":
            return <LinkButtons {...props} />;
          case "project-gallery":
            return <ProjectGallery {...props} />;
          case "social-proof":
            return <SocialProof {...props} />;
          case "footer-section":
            return <FooterSection {...props} />;
          case "navbar":
            return <Navbar key={sectionKey} content={section} primaryColor={primaryColor} />;
          default:
            // Caso a IA invente um tipo novo, não quebramos o site
            console.warn("Seção desconhecida:", section.type, "normalizado:", normalizedType, "seção:", section);
            return null;
        }
      })}
    </div>
  );
}
