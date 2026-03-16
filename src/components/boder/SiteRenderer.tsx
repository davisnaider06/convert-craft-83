import {
  Check, Star, Zap, Shield,
  Globe, BarChart, Users, Layout, MessageCircle,
  ShoppingBag, Briefcase, Award,
  Instagram, Twitter, Github, Linkedin, Smartphone, Mail, Youtube
} from "lucide-react";

import { HeroSection } from "../SiteSections/HeroSection";
import { FeatureGrid } from "../SiteSections/FeatureGrid";
import { TestimonialSlider } from "../SiteSections/TestimonialSlider";
import { PricingTable } from "../SiteSections/PricingTable";
import { FAQSection } from "../SiteSections/FAQSection";
import { CallToActionSection } from "../SiteSections/CallToActionSection";
import { ProductCatalog } from "../SiteSections/ProductCatalog";
import { ProfileHeader } from "../SiteSections/ProfileHeader";
import { LinkButtons } from "../SiteSections/LinkButtons";
import { ProjectGallery } from "../SiteSections/ProjectGallery";
import { SocialProof } from "../SiteSections/SocialProof";
import { FooterSection } from "../SiteSections/FooterSections";
import { Navbar } from "../SiteSections/Navbar";

export const iconMap: Record<string, any> = {
  zap: Zap, shield: Shield, globe: Globe, chart: BarChart,
  users: Users, layout: Layout, check: Check, star: Star,
  message: MessageCircle, instagram: Instagram, twitter: Twitter,
  github: Github, linkedin: Linkedin, smartphone: Smartphone, mail: Mail,
  youtube: Youtube, briefcase: Briefcase, award: Award, shoppingbag: ShoppingBag
};

export const getIcon = (iconName: string, className: string = "h-6 w-6") => {
  const IconComponent = iconMap[String(iconName || "").toLowerCase()] || Star;
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
  feature_grid: "feature-grid",
  testimonial_slider: "testimonial-slider",
  pricing_table: "pricing-table",
  faq_section: "faq-section",
  cta_section: "cta-section",
  product_catalog: "product-catalog",
  project_gallery: "project-gallery",
  social_proof: "social-proof",
  footer_section: "footer-section",
  link_buttons: "link-buttons",
  profile_header: "profile-header",
};

function normalizeSiteData(input: any) {
  let raw = input;
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      raw = null;
    }
  }
  if (!raw || typeof raw !== "object") return { colors: {}, metadata: {}, sections: [] };

  if (Array.isArray(raw.sections)) return raw;
  if (raw.content && Array.isArray(raw.content.sections)) return raw.content;

  const sections: any[] = [];
  if (raw.navbar && typeof raw.navbar === "object") sections.push({ type: "navbar", ...raw.navbar });
  if (raw.hero && typeof raw.hero === "object") sections.push({ type: "hero", ...raw.hero });
  if (Array.isArray(raw.features)) sections.push({ type: "feature-grid", title: "Diferenciais", features: raw.features });
  if (raw.social_proof && typeof raw.social_proof === "object") sections.push({ type: "social-proof", ...raw.social_proof });
  if (Array.isArray(raw.testimonials)) sections.push({ type: "testimonial-slider", title: "Depoimentos", testimonials: raw.testimonials });
  if (Array.isArray(raw.pricing)) sections.push({ type: "pricing-table", title: "Planos", plans: raw.pricing });
  if (Array.isArray(raw.faq)) sections.push({ type: "faq-section", title: "Perguntas frequentes", items: raw.faq });
  if (raw.cta_section && typeof raw.cta_section === "object") sections.push({ type: "cta-section", ...raw.cta_section });
  if (Array.isArray(raw.products)) sections.push({ type: "product-catalog", title: "Produtos", products: raw.products });
  if (Array.isArray(raw.projects)) sections.push({ type: "project-gallery", title: "Projetos", projects: raw.projects });
  if (raw.profile && typeof raw.profile === "object") sections.push({ type: "profile-header", ...raw.profile });
  if (Array.isArray(raw.links)) sections.push({ type: "link-buttons", links: raw.links });
  if (raw.footer_section && typeof raw.footer_section === "object") sections.push({ type: "footer-section", ...raw.footer_section });

  return {
    colors: raw.colors || {},
    metadata: raw.metadata || {},
    sections,
  };
}

export function SiteRenderer({ data, viewMode = "desktop" }: { data: any; viewMode?: "desktop" | "mobile" }) {
  const normalized = normalizeSiteData(data);
  const sections = Array.isArray(normalized?.sections) ? normalized.sections : [];

  if (sections.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground p-10 text-center">
        <p>Aguardando a IA estruturar as secoes do seu site...</p>
      </div>
    );
  }

  const primaryColor = normalized.colors?.primary || "#3b82f6";
  const isMobile = viewMode === "mobile";
  const visualVariant = String(normalized?.metadata?.visual_variant || "conversion").toLowerCase();
  const typographyClass = "font-sans";
  const canvasToneClass =
    visualVariant === "portfolio"
      ? "bg-[#0b0b0f] text-zinc-100"
      : visualVariant === "lead"
        ? "bg-slate-50 text-slate-950"
        : visualVariant === "catalog"
          ? "bg-white text-slate-950"
          : visualVariant === "corporate"
            ? "bg-white text-slate-950"
            : "bg-[#040816] text-slate-100";
  const bg = normalized?.metadata?.background;
  const canvasStyle =
    bg?.type === "gradient" && bg?.from && bg?.to
      ? { backgroundImage: `linear-gradient(180deg, ${bg.from}22 0%, #040816 40%, #040816 100%)` }
      : undefined;

  return (
    <div
      className={`min-h-screen ${canvasToneClass} ${typographyClass} w-full overflow-x-hidden ${isMobile ? "max-w-[375px] mx-auto shadow-2xl" : ""}`}
      style={canvasStyle}
    >
      {sections.map((section: any, index: number) => {
        const baseType = String(section?.type || "").toLowerCase();
        const normalizedType = SECTION_TYPE_ALIASES[baseType] || baseType;
        const sectionKey = `${normalizedType || "unknown"}-${index}`;
        const props = {
          key: sectionKey,
          content: { ...section, visual_variant: section?.visual_variant || visualVariant },
          primaryColor,
          isMobile,
        };

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
            return null;
        }
      })}
    </div>
  );
}
