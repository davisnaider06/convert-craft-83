const TEMPLATE_PROFILES = {
  "vendas-agressivo": {
    id: "vendas-agressivo",
    visualVariant: "conversion",
    sectionOrder: ["navbar", "hero", "social-proof", "feature-grid", "testimonial-slider", "pricing-table", "faq-section", "cta-section", "footer-section"],
    voice: "direto, urgente e orientado a conversao",
    density: "high",
    navLabels: ["Oferta", "Beneficios", "Resultados", "FAQ"],
    imageMood: "performance marketing",
  },
  "lead-capture": {
    id: "lead-capture",
    visualVariant: "lead",
    sectionOrder: ["navbar", "hero", "feature-grid", "social-proof", "testimonial-slider", "faq-section", "cta-section", "footer-section"],
    voice: "claro, objetivo e confiavel",
    density: "medium",
    navLabels: ["Beneficios", "Conteudo", "Depoimentos", "FAQ"],
    imageMood: "ebook mockup",
  },
  "portfolio-criativo": {
    id: "portfolio-criativo",
    visualVariant: "portfolio",
    sectionOrder: ["navbar", "hero", "project-gallery", "feature-grid", "testimonial-slider", "cta-section", "footer-section"],
    voice: "autoral, elegante e criativo",
    density: "medium",
    navLabels: ["Projetos", "Servicos", "Sobre", "Contato"],
    imageMood: "creative studio",
  },
  "biolink-influencer": {
    id: "biolink-influencer",
    visualVariant: "biolink",
    sectionOrder: ["profile-header", "social-proof", "link-buttons", "cta-section", "footer-section"],
    voice: "leve, social e pessoal",
    density: "compact",
    navLabels: [],
    imageMood: "creator portrait",
  },
  "servico-premium": {
    id: "servico-premium",
    visualVariant: "premium",
    sectionOrder: ["navbar", "hero", "feature-grid", "social-proof", "testimonial-slider", "pricing-table", "faq-section", "cta-section", "footer-section"],
    voice: "sofisticado, consultivo e seguro",
    density: "medium",
    navLabels: ["Metodo", "Resultados", "Planos", "Contato"],
    imageMood: "executive service",
  },
  "produto-digital": {
    id: "produto-digital",
    visualVariant: "catalog",
    sectionOrder: ["navbar", "hero", "social-proof", "product-catalog", "feature-grid", "pricing-table", "testimonial-slider", "faq-section", "cta-section", "footer-section"],
    voice: "didatico, aspiracional e orientado a compra",
    density: "high",
    navLabels: ["Produto", "Conteudo", "Oferta", "FAQ"],
    imageMood: "digital product",
  },
  "evento-lancamento": {
    id: "evento-lancamento",
    visualVariant: "event",
    sectionOrder: ["navbar", "hero", "feature-grid", "social-proof", "testimonial-slider", "faq-section", "cta-section", "footer-section"],
    voice: "energetico, dinamico e convocativo",
    density: "medium",
    navLabels: ["Evento", "Agenda", "Bonus", "Inscricao"],
    imageMood: "live event",
  },
  "empresa-institucional": {
    id: "empresa-institucional",
    visualVariant: "corporate",
    sectionOrder: ["navbar", "hero", "feature-grid", "social-proof", "testimonial-slider", "faq-section", "cta-section", "footer-section"],
    voice: "institucional, confiavel e claro",
    density: "medium",
    navLabels: ["Empresa", "Servicos", "Clientes", "Contato"],
    imageMood: "corporate office",
  },
};

const CATEGORY_FALLBACKS = {
  landing: TEMPLATE_PROFILES["vendas-agressivo"],
  portfolio: TEMPLATE_PROFILES["portfolio-criativo"],
  biolink: TEMPLATE_PROFILES["biolink-influencer"],
  service: TEMPLATE_PROFILES["servico-premium"],
  ecommerce: TEMPLATE_PROFILES["produto-digital"],
};

function getTemplateProfile(templateId, category) {
  return TEMPLATE_PROFILES[templateId] || CATEGORY_FALLBACKS[String(category || "").toLowerCase()] || TEMPLATE_PROFILES["vendas-agressivo"];
}

module.exports = {
  TEMPLATE_PROFILES,
  getTemplateProfile,
};
