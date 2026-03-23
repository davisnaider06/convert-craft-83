const { extractKeywords } = require("./promptAnalyzer");

const ICON_SETS = {
  conversion: ["zap", "chart", "shield", "users", "star", "message"],
  lead: ["message", "layout", "shield", "check", "mail", "chart"],
  portfolio: ["layout", "briefcase", "award", "star", "globe", "users"],
  biolink: ["instagram", "youtube", "twitter", "mail", "smartphone", "globe"],
  premium: ["award", "briefcase", "shield", "chart", "star", "users"],
  catalog: ["shoppingbag", "shield", "zap", "star", "check", "globe"],
  event: ["zap", "users", "star", "layout", "message", "chart"],
  corporate: ["briefcase", "users", "shield", "chart", "award", "globe"],
};

function uniq(arr) {
  return Array.from(new Set((arr || []).filter(Boolean)));
}

function limitText(value, max) {
  return String(value || "").trim().slice(0, max);
}

function formatPrice(value) {
  if (!value) return "";
  if (String(value).includes("R$")) return String(value);
  const raw = String(value).trim();
  if (/^\d+(?:[.,]\d+)?$/.test(raw)) {
    const numeric = Number(raw.replace(",", "."));
    if (Number.isFinite(numeric) && numeric > 0) return `R$ ${Math.round(numeric)}`;
  }
  return String(value);
}

function titleCase(value) {
  return String(value || "")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function makeAnchor(label) {
  const clean = String(label || "secao").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return `#${clean.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "inicio"}`;
}

function applyStyleDirectives(site, styleDirectives, designSystem) {
  const palette = styleDirectives?.requestedColors || [];
  const primary = palette[0] || designSystem?.color_palette?.primary || site.colors?.primary || "#2563eb";
  const secondary = palette[1] || designSystem?.color_palette?.secondary || site.colors?.secondary || "#0f172a";
  const accent = palette[2] || designSystem?.color_palette?.accent || site.colors?.accent || "#14b8a6";

  const updated = {
    ...site,
    colors: { primary, secondary, accent },
    metadata: {
      ...(site.metadata || {}),
      style_directives: styleDirectives || {},
      design_system: designSystem || site.metadata?.design_system || null,
    },
  };

  if (styleDirectives?.wantsGradient) {
    updated.metadata.background = { type: "gradient", from: primary, to: accent || secondary };
    updated.sections = (updated.sections || []).map((section) => {
      if (section.type === "hero" || section.type === "cta-section" || section.type === "profile-header") {
        return {
          ...section,
          background_style: "gradient",
          gradient_from: primary,
          gradient_to: accent || secondary,
        };
      }
      return section;
    });
  }

  return updated;
}

function createFallbackBrief({ analysis, profile, templateBlueprint, productPlan, designSystem }) {
  const keyword = analysis.primaryKeyword;
  const secondary = analysis.secondaryKeyword;
  const brandName = analysis.explicitBrand || titleCase(keyword) || "Sua Marca";
  const voice = profile.voice;
  const primaryPage = productPlan?.pages?.[0] || "Home";
  const isSystemLike = productPlan?.output_mode !== "site";
  const productAngle =
    productPlan?.output_mode === "site"
      ? "site completo"
      : productPlan?.output_mode === "hybrid"
        ? "site com blueprint de sistema"
        : "blueprint de produto digital";
  const plannerFeatures = (productPlan?.features || []).slice(0, 6);
  const plannerPages = (productPlan?.pages || []).slice(0, 6);
  const plannerEntities = (productPlan?.entities || []).slice(0, 6);
  const plannerSchema = (productPlan?.database_schema || []).slice(0, 4);

  return {
    brandName,
    brandTagline: `Especialistas em ${keyword} com foco em ${secondary} e em transformar a ideia em ${productAngle}`,
    hero: {
      headline: isSystemLike ? `Transforme ${keyword} em um sistema pronto para operar` : `Transforme ${keyword} em crescimento real`,
      subheadline: isSystemLike
        ? `Uma estrutura orientada a produto, com modulos, fluxos e paginas como ${primaryPage}, pensada para sair do prompt e virar operacao real.`
        : `Uma estrutura completa, alinhada ao seu briefing, para apresentar valor, gerar confianca e converter com mais consistencia a partir de ${primaryPage}.`,
      cta: templateBlueprint?.sections?.find((section) => section.type === "hero")?.cta || "Quero comecar",
      image_keyword: `${profile.imageMood} ${keyword}`,
    },
    socialProof: {
      title: isSystemLike ? "Modulos pensados para negocio real" : `Negocios que aceleraram ${keyword}`,
      logos: isSystemLike ? plannerEntities.map(titleCase) : ["Atlas", "Nova", "Pulse", "Orbit", "Frame", "Spark"],
    },
    features: isSystemLike
      ? plannerFeatures.map((feature, index) => ({
          title: titleCase(String(feature).replace(/_/g, " ")),
          description: `Modulo pensado para suportar ${String(feature).replace(/_/g, " ")} dentro de uma estrutura organizada e coerente com o briefing.`,
          icon: ["layout", "shield", "chart", "users", "zap", "briefcase"][index % 6],
        }))
      : [
          { title: `Estrategia para ${keyword}`, description: `Posicionamos a oferta com clareza e com foco no que realmente importa para ${secondary}.` },
          { title: "Copy orientada a conversao", description: "Cada secao destaca beneficios, contexto e proximos passos sem parecer generica." },
          { title: "Estrutura completa", description: "O site sai com secoes suficientes para apresentar valor, prova e chamada para acao." },
          { title: "Ajustes guiados pelo briefing", description: "Cores, tom e detalhes pedidos no prompt entram no resultado final." },
        ],
    testimonials: [
      { name: "Marina Costa", role: "CEO", content: `A nova estrutura deixou nossa oferta de ${keyword} muito mais facil de entender e vender.` },
      { name: "Felipe Ramos", role: "Head Comercial", content: `Conseguimos apresentar ${secondary} com muito mais clareza e credibilidade.` },
      { name: "Bruna Lima", role: "Fundadora", content: "O site ficou com cara de projeto pensado, nao apenas preenchido com blocos padrao." },
    ],
    faq: isSystemLike
      ? [
          { question: "Quais modulos esse sistema cobre?", answer: `A estrutura inicial cobre ${plannerFeatures.slice(0, 3).join(", ") || "os modulos principais"} com base no seu prompt.` },
          { question: "Ja nasce com paginas definidas?", answer: `Sim. O planner organiza paginas como ${plannerPages.slice(0, 4).join(", ")} para o fluxo fazer sentido.` },
          { question: "Tem logica de dados?", answer: "Sim. O blueprint inclui entidades, papeis, schema inicial e regras de backend para orientar a implementacao." },
          { question: "Posso evoluir depois?", answer: "Sim. A base ja nasce organizada para iterar auth, CRUD, dashboard e regras do negocio." },
        ]
      : [
          { question: `Como voces aplicam ${keyword} no site?`, answer: `Traduzimos o briefing em secoes estrategicas, copy clara e uma apresentacao visual coerente.` },
          { question: "Posso pedir ajustes depois?", answer: "Sim. A estrutura foi pensada para ser refinada com novas instrucoes sem quebrar o layout." },
          { question: "Serve para qualquer nicho?", answer: `Sim. O sistema adapta a comunicacao para destacar ${keyword} dentro do seu contexto.` },
          { question: "O site sai completo?", answer: "Sim. O objetivo e entregar uma pagina pronta, com narrativa, secoes e chamadas para acao." },
        ],
    plans: isSystemLike
      ? [
          { name: "MVP", price: "R$ 1.990", features: plannerPages.slice(0, 3), recommended: false, cta: "Planejar MVP" },
          { name: "Growth", price: "R$ 4.990", features: plannerFeatures.slice(0, 4), recommended: true, cta: "Quero estruturar" },
          { name: "Scale", price: "R$ 8.990", features: ["Arquitetura completa", "Painel admin", "Regras avancadas"], recommended: false, cta: "Falar com time" },
        ]
      : [
          { name: "Essencial", price: "R$ 97", features: ["Estrutura base", "Copy inicial", "CTA principal"], recommended: false, cta: "Comecar" },
          { name: "Profissional", price: "R$ 297", features: ["Tudo do Essencial", "Personalizacao visual", "Refinamento de oferta"], recommended: true, cta: "Quero esse" },
          { name: "Avancado", price: "R$ 597", features: ["Tudo do Profissional", "Maior profundidade", "Acompanhamento"], recommended: false, cta: "Falar com time" },
        ],
    products: [
      { name: `${titleCase(keyword)} Base`, price: "R$ 97", description: `Oferta inicial para quem quer comecar em ${keyword}.`, image_keyword: `${keyword} product` },
      { name: `${titleCase(keyword)} Pro`, price: "R$ 197", description: `Versao mais completa para acelerar ${secondary}.`, image_keyword: `${secondary} digital product` },
      { name: `${titleCase(keyword)} Plus`, price: "R$ 297", description: "Pacote completo com maior valor percebido.", image_keyword: `${profile.imageMood} package` },
      { name: "Mentoria", price: "R$ 397", description: `Acompanhamento premium voltado para ${keyword}.`, image_keyword: `${keyword} mentoring` },
    ],
    projects: [
      { title: "Projeto Atlas", description: `Reposicionamento visual e copy para vender ${keyword} com mais clareza.`, image_keyword: `${keyword} website project`, link: "#" },
      { title: "Projeto Pulse", description: `Pagina orientada a captacao e conversao para ${secondary}.`, image_keyword: `${secondary} landing page`, link: "#" },
      { title: "Projeto Orbit", description: "Nova narrativa para apresentar valor sem parecer genérico.", image_keyword: `${profile.imageMood} interface`, link: "#" },
      { title: "Projeto Flow", description: "Experiencia enxuta, premium e adaptada ao briefing.", image_keyword: `${keyword} premium website`, link: "#" },
    ],
    links: [
      { label: "Instagram", url: "#", icon: "instagram" },
      { label: "YouTube", url: "#", icon: "youtube" },
      { label: "WhatsApp", url: "#", icon: "message" },
      { label: "Portfolio", url: "#", icon: "briefcase" },
      { label: "Contato", url: "#", icon: "mail" },
    ],
    profile: {
      name: brandName,
      bio: `${voice}. Conteudo, links e identidade organizados em uma pagina simples de navegar.`,
      image_keyword: `${profile.imageMood} portrait`,
    },
    cta: {
      title: `Vamos construir sua presenca em ${keyword}?`,
      subtitle: `Aplicamos o briefing em uma estrutura clara, bonita e pensada para ${secondary}.`,
      button_text: "Comecar agora",
    },
    footer: {
      text: `${brandName}. Estrutura digital com foco em resultado.`,
      social_media: [{ platform: "instagram", url: "#" }, { platform: "linkedin", url: "#" }],
    },
    productNarrative: {
      output_mode: productPlan?.output_mode || "site",
      pages: productPlan?.pages || [],
      entities: productPlan?.entities || [],
      features: productPlan?.features || [],
      backend_logic: productPlan?.backend_logic || [],
      frontend_blueprint: productPlan?.frontend_blueprint || [],
      style: designSystem?.style || profile.visualVariant,
    },
  };
}

function normalizeList(list, fallback) {
  return Array.isArray(list) && list.length > 0 ? list : fallback;
}

function buildSectionOrder(profile, analysis) {
  return uniq([...profile.sectionOrder, ...analysis.requestedSections]);
}

function buildNavbar(profile, brief, analysis, productPlan, designSystem) {
  const labels = normalizeList(
    brief.navItems,
    profile.navLabels.map((label) => ({ label, url: makeAnchor(label) }))
  ).slice(0, 4);

  return {
    type: "navbar",
    logo_text: brief.brandName || "Sua Marca",
    links: labels.map((item, index) => ({
      label: limitText(item?.label || item?.title || `Link ${index + 1}`, 20),
      url: item?.url || makeAnchor(item?.label || item?.title || `secao-${index + 1}`),
    })),
    cta_text: brief.hero?.cta || brief.cta?.button_text || "Falar agora",
    visual_variant: profile.visualVariant,
    layout_variant: designSystem?.section_variants?.navbar || "brand-nav",
    product_mode: productPlan?.output_mode || "site",
  };
}

function buildHero(profile, brief, analysis, productPlan, designSystem) {
  return {
    type: "hero",
    headline: limitText(brief.hero?.headline || `Transforme ${analysis.primaryKeyword} com uma pagina mais forte`, 120),
    subheadline: limitText(brief.hero?.subheadline || `Estrutura completa para comunicar valor, gerar confianca e acelerar ${analysis.secondaryKeyword}.`, 220),
    cta: limitText(brief.hero?.cta || brief.cta?.button_text || "Quero comecar", 28),
    image_keyword: brief.hero?.image_keyword || `${profile.imageMood} ${analysis.primaryKeyword}`,
    visual_variant: profile.visualVariant,
    section_variant: designSystem?.section_variants?.hero || "split-showcase",
    eyebrow: productPlan?.output_mode === "system-blueprint" ? "Product blueprint" : productPlan?.output_mode === "hybrid" ? "Site + sistema" : "Nova estrutura",
    proof_items: (productPlan?.features || []).slice(0, 3),
  };
}

function buildFeatureGrid(profile, brief, analysis, productPlan, designSystem) {
  const icons = ICON_SETS[profile.visualVariant] || ICON_SETS.conversion;
  const fallback = [
    { title: "Clareza de proposta", description: "A oferta aparece de forma objetiva, organizada e facil de entender." },
    { title: "Design com intencao", description: "Cada bloco reforca hierarquia visual e leitura." },
    { title: "Mais confianca", description: "A pagina combina argumento, prova e proximo passo." },
    { title: "Base para evoluir", description: "A estrutura ja nasce pronta para futuras iteracoes." },
  ];
  const features = normalizeList(brief.features, fallback).slice(0, 6);

  return {
    type: "feature-grid",
    title: brief.featuresTitle || "Diferenciais da estrutura",
    features: features.map((item, index) => ({
      title: limitText(item?.title || `Diferencial ${index + 1}`, 60),
      description: limitText(item?.description || "Descricao do diferencial.", 180),
      icon: item?.icon || icons[index % icons.length],
    })),
    visual_variant: profile.visualVariant,
    card_variant: designSystem?.section_variants?.cards || "glass-border",
    planner_features: (productPlan?.features || []).slice(0, 6),
  };
}

function buildTestimonials(profile, brief) {
  const fallback = [
    { name: "Cliente 1", role: "Fundador(a)", content: "O resultado ficou mais profissional e bem estruturado.", rating: 5 },
    { name: "Cliente 2", role: "Diretor(a)", content: "A pagina comunica melhor nossa proposta e gera mais confianca.", rating: 5 },
    { name: "Cliente 3", role: "Especialista", content: "Ficou muito menos genérico e muito mais alinhado ao negocio.", rating: 5 },
  ];
  return {
    type: "testimonial-slider",
    title: brief.testimonialsTitle || "Resultados e percepcoes de clientes",
    testimonials: normalizeList(brief.testimonials, fallback).slice(0, 4).map((item) => ({
      name: limitText(item?.name || "Cliente", 32),
      role: limitText(item?.role || "Cliente", 36),
      content: limitText(item?.content || "Excelente experiencia.", 220),
      rating: Number(item?.rating) > 0 ? Number(item.rating) : 5,
    })),
    visual_variant: profile.visualVariant,
  };
}

function buildPricing(profile, brief, analysis, productPlan, designSystem) {
  const fallback = [
    { name: "Base", price: "R$ 97", features: ["Entrega inicial", "Estrutura principal", "Suporte base"], recommended: false, cta: "Comecar" },
    { name: "Pro", price: "R$ 297", features: ["Tudo do Base", "Refinamento", "Suporte prioritario"], recommended: true, cta: "Escolher Pro" },
    { name: "Scale", price: "R$ 597", features: ["Tudo do Pro", "Maior profundidade", "Acompanhamento"], recommended: false, cta: "Solicitar" },
  ];
  return {
    type: "pricing-table",
    title: brief.pricingTitle || "Planos e investimentos",
    plans: normalizeList(brief.plans, fallback).slice(0, 3).map((item, index) => ({
      name: limitText(item?.name || `Plano ${index + 1}`, 30),
      price: formatPrice(item?.price || item?.value || ""),
      features: normalizeList(item?.features, ["Implementacao", "Suporte", "Evolucao"]).slice(0, 4).map((feature) => limitText(feature, 50)),
      recommended: Boolean(item?.recommended) || index === 1,
      cta: limitText(item?.cta || "Escolher plano", 28),
    })),
    visual_variant: profile.visualVariant,
    card_variant: designSystem?.section_variants?.cards || "glass-border",
  };
}

function buildFaq(profile, brief) {
  const fallback = [
    { question: "Como funciona o processo?", answer: "Traduzimos o briefing em seções, copy e uma identidade visual coerente." },
    { question: "Posso ajustar depois?", answer: "Sim. O site foi pensado para refinamentos sem perder a estrutura." },
    { question: "Serve para meu nicho?", answer: "Sim. O sistema adapta a narrativa e a organização ao seu contexto." },
    { question: "O resultado sai completo?", answer: "Esse é o objetivo: entregar uma base forte, pronta para publicar e iterar." },
  ];
  return {
    type: "faq-section",
    title: brief.faqTitle || "Perguntas frequentes",
    items: normalizeList(brief.faq, fallback).slice(0, 6).map((item) => ({
      question: limitText(item?.question || "Pergunta", 90),
      answer: limitText(item?.answer || "Resposta", 220),
    })),
    visual_variant: profile.visualVariant,
  };
}

function buildCta(profile, brief, analysis, productPlan, designSystem) {
  return {
    type: "cta-section",
    title: limitText(brief.cta?.title || "Vamos tirar sua ideia do papel?", 100),
    subtitle: limitText(brief.cta?.subtitle || "Crie uma pagina completa e alinhada ao seu objetivo.", 180),
    button_text: limitText(brief.cta?.button_text || "Criar agora", 28),
    visual_variant: profile.visualVariant,
    button_variant: designSystem?.section_variants?.cta || "solid-primary",
    output_mode: productPlan?.output_mode || "site",
  };
}

function buildProductCatalog(profile, brief, analysis, productPlan) {
  const fallback =
    productPlan?.output_mode !== "site"
      ? (productPlan?.database_schema || []).slice(0, 6).map((table, index) => ({
          name: titleCase(table.table),
          price: `${(table.fields || []).length} campos`,
          description: `Entidade base para o sistema, com foco em ${(table.fields || []).map((field) => field.name).slice(0, 3).join(", ")}.`,
          image_keyword: `${table.table} dashboard ui ${index + 1}`,
        }))
      : createFallbackBrief({ analysis, profile, templateBlueprint: {}, productPlan, designSystem: {} }).products;
  return {
    type: "product-catalog",
    title: brief.productsTitle || (productPlan?.output_mode !== "site" ? "Estrutura de dados e modulos" : "Produtos e ofertas"),
    products: normalizeList(brief.products, fallback).slice(0, 6).map((item, index) => ({
      name: limitText(item?.name || `Produto ${index + 1}`, 40),
      price: formatPrice(item?.price || item?.value || ""),
      description: limitText(item?.description || "Descricao do produto.", 180),
      image_keyword: item?.image_keyword || `${analysis.primaryKeyword} product ${index + 1}`,
    })),
    visual_variant: profile.visualVariant,
  };
}

function buildProjectGallery(profile, brief, analysis, productPlan) {
  const fallback =
    productPlan?.output_mode !== "site"
      ? (productPlan?.pages || []).slice(0, 6).map((page, index) => ({
          title: page,
          description: `Pagina pensada para cobrir ${productPlan?.user_flows?.[index] || "uma etapa critica do fluxo"} com clareza e usabilidade.`,
          image_keyword: `${page} saas dashboard screen`,
          link: "#",
        }))
      : createFallbackBrief({ analysis, profile, templateBlueprint: {}, productPlan, designSystem: {} }).projects;
  return {
    type: "project-gallery",
    title: brief.projectsTitle || (productPlan?.output_mode !== "site" ? "Paginas e fluxos do produto" : "Projetos selecionados"),
    projects: normalizeList(brief.projects, fallback).slice(0, 6).map((item, index) => ({
      title: limitText(item?.title || `Projeto ${index + 1}`, 40),
      description: limitText(item?.description || "Descricao do projeto.", 170),
      image_keyword: item?.image_keyword || `${profile.imageMood} ${analysis.primaryKeyword} ${index + 1}`,
      link: item?.link || "#",
    })),
    visual_variant: profile.visualVariant,
  };
}

function buildSocialProof(profile, brief) {
  const fallback = ["Atlas", "Nova", "Pulse", "Orbit", "Frame", "Spark"];
  return {
    type: "social-proof",
    title: brief.socialProof?.title || "Marcas, clientes e parceiros",
    logos: normalizeList(brief.socialProof?.logos, fallback).slice(0, 6),
    visual_variant: profile.visualVariant,
  };
}

function buildFooter(profile, brief) {
  return {
    type: "footer-section",
    text: limitText(brief.footer?.text || `${brief.brandName || "Sua Marca"} - todos os direitos reservados.`, 120),
    social_media: normalizeList(brief.footer?.social_media, [{ platform: "instagram", url: "#" }]).slice(0, 4),
    visual_variant: profile.visualVariant,
  };
}

function buildProfileHeader(profile, brief) {
  return {
    type: "profile-header",
    name: limitText(brief.profile?.name || brief.brandName || "Seu Nome", 40),
    bio: limitText(brief.profile?.bio || brief.brandTagline || "Conteudo, links e contato em um unico lugar.", 180),
    image_keyword: brief.profile?.image_keyword || `${profile.imageMood} portrait`,
    visual_variant: profile.visualVariant,
  };
}

function buildLinkButtons(profile, brief) {
  const fallback = [
    { label: "Instagram", url: "#", icon: "instagram" },
    { label: "YouTube", url: "#", icon: "youtube" },
    { label: "TikTok", url: "#", icon: "smartphone" },
    { label: "Contato", url: "#", icon: "mail" },
    { label: "Portfolio", url: "#", icon: "briefcase" },
  ];
  return {
    type: "link-buttons",
    links: normalizeList(brief.links, fallback).slice(0, 8).map((item, index) => ({
      label: limitText(item?.label || `Link ${index + 1}`, 30),
      url: item?.url || "#",
      icon: item?.icon || fallback[index % fallback.length].icon,
    })),
    visual_variant: profile.visualVariant,
  };
}

const BUILDERS = {
  navbar: buildNavbar,
  hero: buildHero,
  "feature-grid": buildFeatureGrid,
  "testimonial-slider": buildTestimonials,
  "pricing-table": buildPricing,
  "faq-section": buildFaq,
  "cta-section": buildCta,
  "product-catalog": buildProductCatalog,
  "project-gallery": buildProjectGallery,
  "social-proof": buildSocialProof,
  "footer-section": buildFooter,
  "profile-header": buildProfileHeader,
  "link-buttons": buildLinkButtons,
};

function buildPalette(templateBlueprint, analysis, profile) {
  const base = templateBlueprint?.colors || {};
  if (analysis.styleDirectives?.requestedColors?.length > 0) {
    return {
      primary: analysis.styleDirectives.requestedColors[0] || base.primary || "#2563eb",
      secondary: analysis.styleDirectives.requestedColors[1] || base.secondary || (analysis.styleDirectives.wantsDark ? "#040816" : "#ffffff"),
      accent: analysis.styleDirectives.requestedColors[2] || base.accent || "#14b8a6",
    };
  }

  if (analysis.styleDirectives?.wantsLuxurious && !base.primary) {
    return { primary: "#c9a962", secondary: "#09111f", accent: "#f4efe3" };
  }
  if (analysis.styleDirectives?.wantsMinimal && !base.primary) {
    return { primary: "#111827", secondary: "#ffffff", accent: "#6b7280" };
  }
  if (analysis.styleDirectives?.wantsDark && !base.primary) {
    return { primary: "#60a5fa", secondary: "#040816", accent: "#22d3ee" };
  }

  return {
    primary: base.primary || "#2563eb",
    secondary: base.secondary || "#0f172a",
    accent: base.accent || "#14b8a6",
  };
}

function buildSiteFromBrief({ brief, analysis, profile, templateBlueprint, productPlan, designSystem, intent }) {
  const palette = designSystem?.color_palette || buildPalette(templateBlueprint, analysis, profile);
  const sectionOrder = uniq([...(productPlan?.sections || []), ...buildSectionOrder(profile, analysis)]);
  const sections = sectionOrder
    .map((type) => {
      const builder = BUILDERS[type];
      return builder ? builder(profile, brief, analysis, productPlan, designSystem) : null;
    })
    .filter(Boolean);

  const site = {
    colors: palette,
    metadata: {
      category: analysis.category,
      templateId: analysis.templateId,
      visual_variant: profile.visualVariant,
      keywords: extractKeywords(analysis.combinedPrompt).slice(0, 10),
      intent,
      product_plan: productPlan,
      design_system: designSystem,
    },
    sections,
  };

  return applyStyleDirectives(site, analysis.styleDirectives, designSystem);
}

module.exports = {
  createFallbackBrief,
  buildSiteFromBrief,
  applyStyleDirectives,
};
