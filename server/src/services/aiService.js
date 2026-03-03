const { GoogleGenerativeAI } = require("@google/generative-ai");
const Groq = require("groq-sdk");
const { getTemplateBlueprint } = require("../utils/templates");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;
let geminiDisabled = false;
let groqDisabled = false;

const AVAILABLE_SECTIONS = [
  "navbar",
  "hero",
  "feature-grid",
  "testimonial-slider",
  "pricing-table",
  "faq-section",
  "cta-section",
  "product-catalog",
  "profile-header",
  "link-buttons",
  "project-gallery",
  "social-proof",
  "footer-section",
];

const SECTION_ALIASES = {
  cta: "cta-section",
  features: "feature-grid",
  feature_grid: "feature-grid",
  testimonials: "testimonial-slider",
  testimonial_slider: "testimonial-slider",
  pricing: "pricing-table",
  pricing_table: "pricing-table",
  faq: "faq-section",
  faq_section: "faq-section",
  products: "product-catalog",
  product_catalog: "product-catalog",
  projects: "project-gallery",
  project_gallery: "project-gallery",
  social: "social-proof",
  social_proof: "social-proof",
  footer: "footer-section",
  footer_section: "footer-section",
  links: "link-buttons",
  link_buttons: "link-buttons",
  profile: "profile-header",
  profile_header: "profile-header",
};

const STYLE_TONE = {
  moderno: "moderno e direto",
  minimalista: "minimalista e sofisticado",
  corporativo: "institucional e confiavel",
  criativo: "criativo e ousado",
  profissional: "profissional e persuasivo",
};

const CATEGORY_PRESETS = {
  landing: {
    minSections: 8,
    maxSections: 10,
    preferred: ["navbar", "hero", "social-proof", "feature-grid", "testimonial-slider", "pricing-table", "faq-section", "cta-section", "footer-section"],
  },
  service: {
    minSections: 8,
    maxSections: 10,
    preferred: ["navbar", "hero", "feature-grid", "social-proof", "testimonial-slider", "pricing-table", "faq-section", "cta-section", "footer-section"],
  },
  ecommerce: {
    minSections: 9,
    maxSections: 11,
    preferred: ["navbar", "hero", "social-proof", "product-catalog", "feature-grid", "pricing-table", "testimonial-slider", "faq-section", "cta-section", "footer-section"],
  },
  portfolio: {
    minSections: 7,
    maxSections: 9,
    preferred: ["navbar", "hero", "project-gallery", "social-proof", "testimonial-slider", "feature-grid", "cta-section", "footer-section"],
  },
  biolink: {
    minSections: 4,
    maxSections: 6,
    preferred: ["profile-header", "social-proof", "link-buttons", "cta-section", "footer-section"],
  },
};

const TEMPLATE_PLAN_BY_ID = {
  "vendas-agressivo": ["navbar", "hero", "social-proof", "feature-grid", "testimonial-slider", "pricing-table", "faq-section", "cta-section", "footer-section"],
  "lead-capture": ["navbar", "hero", "feature-grid", "testimonial-slider", "faq-section", "cta-section", "footer-section"],
  "portfolio-criativo": ["navbar", "hero", "project-gallery", "feature-grid", "testimonial-slider", "cta-section", "footer-section"],
  "biolink-influencer": ["profile-header", "social-proof", "link-buttons", "cta-section", "footer-section"],
  "servico-premium": ["navbar", "hero", "feature-grid", "social-proof", "testimonial-slider", "pricing-table", "faq-section", "cta-section", "footer-section"],
  "produto-digital": ["navbar", "hero", "social-proof", "product-catalog", "feature-grid", "pricing-table", "testimonial-slider", "faq-section", "cta-section", "footer-section"],
  "evento-lancamento": ["navbar", "hero", "feature-grid", "social-proof", "testimonial-slider", "faq-section", "cta-section", "footer-section"],
  "empresa-institucional": ["navbar", "hero", "feature-grid", "social-proof", "testimonial-slider", "faq-section", "cta-section", "footer-section"],
};

const TEMPLATE_VISUAL_PROFILE = {
  "vendas-agressivo": "conversion",
  "lead-capture": "lead",
  "portfolio-criativo": "portfolio",
  "biolink-influencer": "biolink",
  "servico-premium": "premium",
  "produto-digital": "catalog",
  "evento-lancamento": "event",
  "empresa-institucional": "corporate",
};

const CONTENT_RULES = {
  navbar: { linksMin: 3 },
  "feature-grid": { listKey: "features", min: 4, max: 6 },
  "testimonial-slider": { listKey: "testimonials", min: 3, max: 5 },
  "pricing-table": { listKey: "plans", min: 3, max: 4 },
  "faq-section": { listKey: "items", min: 4, max: 6 },
  "product-catalog": { listKey: "products", min: 4, max: 8 },
  "project-gallery": { listKey: "projects", min: 4, max: 6 },
  "link-buttons": { listKey: "links", min: 5, max: 8 },
  "social-proof": { listKey: "logos", min: 5, max: 10 },
};

const FEATURE_ICONS_BY_CATEGORY = {
  landing: ["zap", "shield", "chart", "users", "star", "layout"],
  service: ["briefcase", "award", "users", "shield", "chart", "message"],
  ecommerce: ["shoppingbag", "shield", "zap", "chart", "star", "globe"],
  portfolio: ["layout", "briefcase", "award", "star", "users", "globe"],
  biolink: ["instagram", "youtube", "twitter", "link", "mail", "smartphone"],
};

const STOPWORDS = new Set([
  "para", "com", "sem", "uma", "uns", "umas", "que", "por", "dos", "das", "de", "do", "da",
  "the", "and", "you", "seu", "sua", "seus", "suas", "mais", "muito", "sobre", "como", "site", "pagina",
]);

function normalizeSectionType(type) {
  const base = String(type || "").toLowerCase().trim();
  return SECTION_ALIASES[base] || base;
}

function isAllowedSection(type) {
  return AVAILABLE_SECTIONS.includes(type);
}

function categoryRequiredSections(category) {
  const key = String(category || "").toLowerCase();
  if (key === "ecommerce") return ["navbar", "hero", "product-catalog", "pricing-table", "faq-section", "cta-section", "footer-section"];
  if (key === "portfolio") return ["navbar", "hero", "project-gallery", "cta-section", "footer-section"];
  if (key === "biolink") return ["profile-header", "link-buttons", "footer-section"];
  if (key === "service") return ["navbar", "hero", "feature-grid", "testimonial-slider", "cta-section", "footer-section"];
  return ["navbar", "hero", "feature-grid", "cta-section", "footer-section"];
}

function getPreset(category) {
  const key = String(category || "").toLowerCase();
  return CATEGORY_PRESETS[key] || CATEGORY_PRESETS.landing;
}

function uniqOrdered(arr) {
  return Array.from(new Set((arr || []).filter(Boolean)));
}

function limitText(text, max) {
  return String(text || "").trim().slice(0, max);
}

function extractKeywords(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 4 && !STOPWORDS.has(t));
}

function normalizeMustHave(prompt, customizations, mustHave) {
  const base = Array.isArray(mustHave) ? mustHave : [];
  const fromPrompt = String(prompt || "").split(/[.;\n]/).map((x) => x.trim()).filter((x) => x.length > 10);
  const fromCustom = String(customizations || "").split(/[.;\n]/).map((x) => x.trim()).filter((x) => x.length > 10);
  return Array.from(new Set([...base, ...fromPrompt.slice(0, 8), ...fromCustom.slice(0, 8)])).slice(0, 14);
}

const COLOR_KEYWORDS = {
  vermelho: "#ef4444",
  red: "#ef4444",
  azul: "#2563eb",
  blue: "#2563eb",
  verde: "#22c55e",
  green: "#22c55e",
  amarelo: "#eab308",
  yellow: "#eab308",
  roxo: "#8b5cf6",
  purple: "#8b5cf6",
  laranja: "#f97316",
  orange: "#f97316",
  rosa: "#ec4899",
  pink: "#ec4899",
  preto: "#0f172a",
  black: "#0f172a",
  branco: "#ffffff",
  white: "#ffffff",
  dourado: "#c9a962",
  gold: "#c9a962",
  ciano: "#06b6d4",
  cyan: "#06b6d4",
};

function extractStyleDirectives(prompt, customizations) {
  const text = `${String(prompt || "")}\n${String(customizations || "")}`;
  const lower = text.toLowerCase();
  const hexMatches = text.match(/#[0-9a-fA-F]{6}\b/g) || [];
  const keywordColors = Object.entries(COLOR_KEYWORDS)
    .filter(([k]) => lower.includes(k))
    .map(([, v]) => v);

  const uniqueColors = Array.from(new Set([...hexMatches, ...keywordColors]));
  const wantsGradient = /\b(gradiente|gradient)\b/i.test(text);

  return {
    requestedColors: uniqueColors.slice(0, 3),
    wantsGradient,
    raw: text,
  };
}

function applyStyleDirectives(site, directives) {
  const currentColors = site?.colors || {};
  const palette = directives?.requestedColors || [];
  const primary = palette[0] || currentColors.primary || "#2563eb";
  const secondary = palette[1] || currentColors.secondary || "#0f172a";
  const accent = palette[2] || currentColors.accent || "#14b8a6";

  const output = {
    ...(site || {}),
    colors: { primary, secondary, accent },
    metadata: {
      ...(site?.metadata || {}),
      style_directives: directives || {},
    },
  };

  if (directives?.wantsGradient) {
    output.metadata.background = {
      type: "gradient",
      from: primary,
      to: accent || secondary,
    };
    output.sections = ensureArray(output.sections).map((s) => {
      const t = normalizeSectionType(s?.type);
      if (t === "hero" || t === "cta-section") {
        return {
          ...s,
          background_style: "gradient",
          gradient_from: primary,
          gradient_to: accent || secondary,
        };
      }
      return s;
    });
  }

  return output;
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function pickPlan({ category, templateId, templateBlueprint, plannerRequired }) {
  const preset = getPreset(category);
  const byTemplate = TEMPLATE_PLAN_BY_ID[templateId] || [];
  const byBlueprint = ensureArray(templateBlueprint?.sections).map((s) => normalizeSectionType(s?.type)).filter(isAllowedSection);
  const byPlanner = ensureArray(plannerRequired).map((s) => normalizeSectionType(s)).filter(isAllowedSection);
  const required = categoryRequiredSections(category);
  let merged = uniqOrdered([...byTemplate, ...preset.preferred, ...byBlueprint, ...byPlanner, ...required]);
  merged = merged.filter((type) => isAllowedSection(type));
  if (merged.length < preset.minSections) {
    for (const fallbackType of preset.preferred) {
      if (!merged.includes(fallbackType)) merged.push(fallbackType);
      if (merged.length >= preset.minSections) break;
    }
  }
  return merged.slice(0, preset.maxSections);
}

function applySectionDefaults(section) {
  const type = normalizeSectionType(section?.type);
  const base = { ...(section || {}), type };

  if (type === "hero") return { ...base, headline: base.headline || "Cresca com uma estrutura que converte", subheadline: base.subheadline || "Site completo, claro e focado em gerar clientes.", cta: base.cta || "Quero comecar", image_keyword: base.image_keyword || "business growth" };
  if (type === "navbar") return { ...base, logo_text: base.logo_text || "Sua Marca", links: ensureArray(base.links).length > 0 ? base.links : [{ label: "Inicio", url: "#inicio" }, { label: "Beneficios", url: "#beneficios" }, { label: "Contato", url: "#contato" }], cta_text: base.cta_text || base.cta || "Falar agora" };
  if (type === "feature-grid") return { ...base, title: base.title || "Por que escolher esta solucao", features: ensureArray(base.features).length > 0 ? base.features : [{ title: "Execucao rapida", description: "Implementacao com foco em resultado real.", icon: "zap" }, { title: "Estrategia clara", description: "Cada etapa orientada a conversao.", icon: "shield" }, { title: "Crescimento continuo", description: "Melhorias baseadas em dados.", icon: "chart" }, { title: "Suporte consultivo", description: "Acompanhamento proximo do time.", icon: "users" }] };
  if (type === "testimonial-slider") return { ...base, title: base.title || "Quem aplica, recomenda", testimonials: ensureArray(base.testimonials).length > 0 ? base.testimonials : [{ name: "Cliente A", role: "Empreendedora", content: "A estrutura deixou nossa comunicacao muito mais forte e objetiva.", rating: 5 }, { name: "Cliente B", role: "Diretor Comercial", content: "Melhoramos a taxa de conversao e o tempo de fechamento.", rating: 5 }, { name: "Cliente C", role: "Consultora", content: "Fluxo simples e resultado acima do esperado.", rating: 5 }] };
  if (type === "pricing-table") return { ...base, title: base.title || "Escolha o melhor plano", plans: ensureArray(base.plans).length > 0 ? base.plans : [{ name: "Essencial", price: "R$ 97", features: ["Setup inicial", "Estrutura base", "Suporte por email"], recommended: false, cta: "Comecar" }, { name: "Profissional", price: "R$ 297", features: ["Tudo do Essencial", "Personalizacao completa", "Suporte prioritario"], recommended: true, cta: "Quero o Profissional" }, { name: "Escala", price: "R$ 597", features: ["Tudo do Profissional", "Consultoria dedicada", "Otimizacao mensal"], recommended: false, cta: "Falar com especialista" }] };
  if (type === "faq-section") return { ...base, title: base.title || "Perguntas frequentes", items: ensureArray(base.items).length > 0 ? base.items : [{ question: "Como funciona o processo?", answer: "Voce envia o briefing, validamos a estrutura e entregamos o site completo." }, { question: "Posso editar depois?", answer: "Sim. Voce pode ajustar secoes, textos e layout quando quiser." }, { question: "Quanto tempo leva?", answer: "A primeira versao sai em minutos e pode ser refinada em ciclos curtos." }, { question: "Serve para qualquer nicho?", answer: "Sim. O fluxo adapta copy e estrutura ao seu objetivo de negocio." }] };
  if (type === "cta-section") return { ...base, title: base.title || "Pronto para acelerar seus resultados?", subtitle: base.subtitle || "Comece agora com uma pagina estruturada para conversao.", button_text: base.button_text || "Criar meu site" };
  if (type === "product-catalog") return { ...base, title: base.title || "Produtos em destaque", products: ensureArray(base.products).length > 0 ? base.products : [{ name: "Produto principal", price: "R$ 99", description: "Solução de entrada com alto valor percebido.", image_keyword: "premium product" }, { name: "Produto pro", price: "R$ 199", description: "Mais recursos para quem quer evoluir rapido.", image_keyword: "product package" }, { name: "Combo completo", price: "R$ 299", description: "Oferta com melhor custo-beneficio.", image_keyword: "bundle product" }, { name: "Assinatura", price: "R$ 79", description: "Acesso recorrente com atualizacoes.", image_keyword: "subscription product" }] };
  if (type === "profile-header") return { ...base, name: base.name || "Seu Nome", bio: base.bio || "Profissional focado em crescimento e resultados.", image_keyword: base.image_keyword || "professional portrait" };
  if (type === "link-buttons") return { ...base, links: ensureArray(base.links).length > 0 ? base.links : [{ label: "Instagram", url: "#", icon: "instagram" }, { label: "YouTube", url: "#", icon: "youtube" }, { label: "WhatsApp", url: "#", icon: "message" }, { label: "Portifolio", url: "#", icon: "briefcase" }, { label: "Contato", url: "#", icon: "mail" }] };
  if (type === "project-gallery") return { ...base, title: base.title || "Projetos em destaque", projects: ensureArray(base.projects).length > 0 ? base.projects : [{ title: "Projeto 1", description: "Entrega orientada a conversao e clareza de proposta.", image_keyword: "landing page design", link: "#" }, { title: "Projeto 2", description: "Reposicionamento visual e copy focada em valor.", image_keyword: "web redesign", link: "#" }, { title: "Projeto 3", description: "Fluxo comercial simplificado para gerar mais leads.", image_keyword: "website project", link: "#" }, { title: "Projeto 4", description: "PAgina de servico com oferta objetiva.", image_keyword: "service website", link: "#" }] };
  if (type === "social-proof") return { ...base, title: base.title || "Marcas e clientes que confiam", logos: ensureArray(base.logos).length > 0 ? base.logos : ["Marca A", "Marca B", "Marca C", "Marca D", "Marca E"] };
  if (type === "footer-section") return { ...base, text: base.text || `© ${new Date().getFullYear()} Todos os direitos reservados.`, social_media: ensureArray(base.social_media) };
  return base;
}

function sanitizeCandidate(raw) {
  const rawSections = ensureArray(raw?.sections);
  const normalizedRaw = rawSections
    .map((section) => ({ ...section, type: normalizeSectionType(section?.type) }))
    .filter((section) => isAllowedSection(section.type));

  return {
    colors: raw?.colors && typeof raw.colors === "object" ? raw.colors : { primary: "#2563eb", secondary: "#0f172a", accent: "#14b8a6" },
    sections: normalizedRaw.map((section) => applySectionDefaults(section)),
  };
}

function makeListItem(type, index, ctx) {
  const seed = ctx.mustHave[index] || ctx.keyword;
  if (type === "feature-grid") {
    const pool = FEATURE_ICONS_BY_CATEGORY[ctx.category] || FEATURE_ICONS_BY_CATEGORY.landing;
    return {
      title: limitText(`${seed} aplicado`, 46),
      description: `Estrutura pratica para ${ctx.keyword} com foco em conversao.`,
      icon: pool[index % pool.length],
    };
  }
  if (type === "testimonial-slider") return { name: `Cliente ${index + 1}`, role: "Empreendedor(a)", content: `Conseguimos evoluir ${ctx.keyword} com uma comunicacao muito mais clara e convincente.`, rating: 5 };
  if (type === "pricing-table") return { name: `Plano ${index + 1}`, price: index === 1 ? "R$ 297" : index === 2 ? "R$ 597" : "R$ 97", features: [`Entrega focada em ${ctx.keyword}`, "Acompanhamento estrategico", "Implementacao pratica"], recommended: index === 1, cta: index === 1 ? "Quero o melhor plano" : "Escolher plano" };
  if (type === "faq-section") return { question: `Como ${ctx.keyword} funciona na pratica?`, answer: `Organizamos etapas objetivas para implementar ${ctx.keyword} e acompanhar resultado real.` };
  if (type === "product-catalog") return { name: `Oferta ${index + 1}`, price: index === 0 ? "R$ 99" : "R$ 199", description: `Solução orientada a ${ctx.keyword}.`, image_keyword: `${ctx.keyword} product` };
  if (type === "project-gallery") return { title: `Case ${index + 1}`, description: `Projeto com foco em ${ctx.keyword} e crescimento comercial.`, image_keyword: `${ctx.keyword} website`, link: "#" };
  if (type === "link-buttons") return { label: `Link ${index + 1}`, url: "#", icon: index % 2 === 0 ? "link" : "instagram" };
  if (type === "social-proof") return `Cliente ${index + 1}`;
  return {};
}

function enforceDensity(section, ctx) {
  const rule = CONTENT_RULES[section.type];
  if (!rule) return section;

  if (section.type === "navbar") {
    const links = ensureArray(section.links);
    while (links.length < rule.linksMin) {
      links.push({ label: `Link ${links.length + 1}`, url: "#" });
    }
    return { ...section, links: links.slice(0, 6) };
  }

  const listKey = rule.listKey;
  const current = ensureArray(section[listKey]);
  const max = rule.max || rule.min;
  while (current.length < rule.min) {
    current.push(makeListItem(section.type, current.length, ctx));
  }
  return { ...section, [listKey]: current.slice(0, max) };
}

function sectionFromTemplate(type, templateBlueprint) {
  const matched = ensureArray(templateBlueprint?.sections).find((s) => normalizeSectionType(s?.type) === type);
  return matched ? { ...matched, type } : null;
}

function sectionScaffold(type, ctx) {
  if (type === "navbar") return { type, logo_text: "Logo", links: [{ label: "Inicio", url: "#inicio" }, { label: "Servicos", url: "#servicos" }, { label: "Contato", url: "#contato" }], cta_text: "Falar com especialista" };
  if (type === "hero") return { type, headline: `Transforme ${ctx.keyword} com uma estrutura de alta conversao`, subheadline: `Criamos uma pagina completa para apresentar valor, gerar confianca e aumentar vendas em ${ctx.keyword}.`, cta: "Quero comecar hoje", image_keyword: `${ctx.keyword} business` };
  if (type === "feature-grid") return { type, title: "Diferenciais principais", features: [] };
  if (type === "testimonial-slider") return { type, title: "Resultados e experiencias", testimonials: [] };
  if (type === "pricing-table") return { type, title: "Planos para cada fase", plans: [] };
  if (type === "faq-section") return { type, title: "Duvidas comuns", items: [] };
  if (type === "cta-section") return { type, title: "Vamos construir sua proxima pagina?", subtitle: `Comece agora e acelere ${ctx.keyword}.`, button_text: "Iniciar projeto" };
  if (type === "product-catalog") return { type, title: "Catalogo principal", products: [] };
  if (type === "profile-header") return { type, name: "Seu Nome", bio: `Especialista em ${ctx.keyword}.`, image_keyword: `${ctx.keyword} portrait` };
  if (type === "link-buttons") return { type, links: [] };
  if (type === "project-gallery") return { type, title: "Projetos", projects: [] };
  if (type === "social-proof") return { type, title: "Empresas atendidas", logos: [] };
  if (type === "footer-section") return { type, text: `© ${new Date().getFullYear()} Todos os direitos reservados.`, social_media: [] };
  return { type };
}

function composeFinalSite(rawSite, { category, style, templateId, mustHave, userPrompt, templateBlueprint, sectionPlan }) {
  const sanitized = sanitizeCandidate(rawSite);
  const tone = STYLE_TONE[String(style || "").toLowerCase()] || STYLE_TONE.profissional;
  const keyword = extractKeywords(userPrompt)[0] || "seu negocio";
  const ctx = { keyword, mustHave, tone, category };

  const existingByType = {};
  for (const section of sanitized.sections) {
    const type = normalizeSectionType(section?.type);
    if (!existingByType[type]) existingByType[type] = section;
  }

  const plannedSections = [];
  const visualVariant = TEMPLATE_VISUAL_PROFILE[templateId] || String(category || "landing");
  for (const type of sectionPlan) {
    const current = existingByType[type] || sectionFromTemplate(type, templateBlueprint) || sectionScaffold(type, ctx);
    const merged = applySectionDefaults({ ...current, type });
    const dense = enforceDensity(merged, ctx);
    plannedSections.push({ ...dense, visual_variant: dense.visual_variant || visualVariant });
  }

  const extras = sanitized.sections
    .filter((s) => !sectionPlan.includes(normalizeSectionType(s?.type)))
    .slice(0, 2)
    .map((s) => ({ ...s, visual_variant: s.visual_variant || visualVariant }));

  return {
    colors: sanitized.colors || templateBlueprint?.colors || { primary: "#2563eb", secondary: "#0f172a", accent: "#14b8a6" },
    metadata: { tone, category, templateId, visual_variant: visualVariant },
    sections: [...plannedSections, ...extras],
  };
}

function validateSiteQuality(site, { category, mustHave, userPrompt, sectionPlan, styleDirectives }) {
  const issues = [];
  if (!site || !Array.isArray(site.sections) || site.sections.length === 0) issues.push("Sem secoes.");

  const sectionTypes = ensureArray(site?.sections).map((s) => normalizeSectionType(s?.type)).filter(Boolean);
  const required = categoryRequiredSections(category);
  for (const t of required) if (!sectionTypes.includes(t)) issues.push(`Secao obrigatoria ausente: ${t}.`);
  for (const t of sectionPlan) if (!sectionTypes.includes(t)) issues.push(`Secao planejada ausente: ${t}.`);

  const serial = JSON.stringify(site).toLowerCase();
  if (serial.includes("__")) issues.push("Placeholders nao resolvidos.");
  if (serial.includes("lorem ipsum")) issues.push("Texto placeholder detectado.");

  for (const [type, rule] of Object.entries(CONTENT_RULES)) {
    const section = ensureArray(site.sections).find((s) => normalizeSectionType(s?.type) === type);
    if (!section) continue;
    if (rule.linksMin) {
      if (ensureArray(section.links).length < rule.linksMin) issues.push(`Conteudo fraco em ${type}.`);
      continue;
    }
    const size = ensureArray(section[rule.listKey]).length;
    if (size < rule.min) issues.push(`Conteudo insuficiente em ${type}.`);
  }

  const tokens = extractKeywords(`${mustHave.join(" ")} ${userPrompt || ""}`);
  const missing = tokens.slice(0, 20).filter((t) => !serial.includes(t));
  if (missing.length > 11) issues.push("Cobertura baixa do briefing.");

  const requested = ensureArray(styleDirectives?.requestedColors).map((c) => String(c || "").toLowerCase());
  if (requested.length > 0) {
    const palette = [
      String(site?.colors?.primary || "").toLowerCase(),
      String(site?.colors?.secondary || "").toLowerCase(),
      String(site?.colors?.accent || "").toLowerCase(),
    ];
    const hasRequestedPalette = requested.every((c) => palette.includes(c));
    if (!hasRequestedPalette) issues.push("Cores pedidas no prompt nao foram aplicadas corretamente.");
  }
  if (styleDirectives?.wantsGradient) {
    const hasGradient = String(site?.metadata?.background?.type || "").toLowerCase() === "gradient";
    if (!hasGradient) issues.push("Prompt pediu gradiente, mas gradiente nao foi aplicado.");
  }

  return { valid: issues.length === 0, issues };
}

async function generateJsonWithGemini({ systemPrompt, userPrompt, temperature = 0.8 }) {
  if (geminiDisabled) return null;
  const geminiModels = ["gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash"];
  for (const modelName of geminiModels) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { responseMimeType: "application/json", temperature },
      });
      const result = await Promise.race([
        model.generateContent(`${systemPrompt}\n\n${userPrompt}`),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 30000)),
      ]);
      return JSON.parse(result.response.text());
    } catch (error) {
      const full = String(error?.message || error || "");
      console.warn(`[IA][Gemini ${modelName}] falha: ${full.split("\n")[0]}`);
      if (full.includes("API_KEY_INVALID") || full.includes("API key not valid")) {
        geminiDisabled = true;
        break;
      }
    }
  }
  return null;
}

async function generateJsonWithGroq({ systemPrompt, userPrompt, temperature = 0.8 }) {
  if (groqDisabled || !groq) return null;
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature,
      response_format: { type: "json_object" },
      messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
    });
    return JSON.parse(completion.choices[0]?.message?.content || "{}");
  } catch (error) {
    const full = String(error?.message || error || "");
    console.warn("[IA][Groq] falha:", full.split("\n")[0]);
    if (full.includes("Invalid API Key") || full.includes("authentication")) groqDisabled = true;
    return null;
  }
}

async function generateJsonWithFallback(params) {
  const fromGemini = await generateJsonWithGemini(params);
  if (fromGemini) return fromGemini;
  return generateJsonWithGroq(params);
}

function buildPlannerFallback({ category, mustHave, sectionPlan }) {
  return {
    objective: "converter visitantes em leads ou vendas",
    required_sections: sectionPlan || categoryRequiredSections(category),
    must_cover_items: mustHave,
  };
}

function buildHeuristicSite({ userPrompt, category, style, templateId, templateBlueprint, mustHave, sectionPlan }) {
  const raw = {
    colors: templateBlueprint?.colors || { primary: "#2563eb", secondary: "#0f172a", accent: "#14b8a6" },
    sections: sectionPlan.map((type) => sectionScaffold(type, { keyword: extractKeywords(userPrompt)[0] || "seu negocio", mustHave, tone: STYLE_TONE[String(style || "").toLowerCase()] || STYLE_TONE.profissional })),
  };
  return composeFinalSite(raw, { category, style, templateId, mustHave, userPrompt, templateBlueprint, sectionPlan });
}

function plannerPromptContext(sectionPlan, mustHave) {
  return `
Plan de secoes ideal (ordem sugerida): ${sectionPlan.join(" -> ")}
Requisitos de densidade:
- navbar.links >= 3
- feature-grid.features >= 4
- testimonial-slider.testimonials >= 3
- pricing-table.plans >= 3
- faq-section.items >= 4
- product-catalog.products >= 4
- project-gallery.projects >= 4
- link-buttons.links >= 5
- social-proof.logos >= 5
Itens obrigatorios de briefing: ${mustHave.join(" | ") || "nenhum"}
`.trim();
}

async function gerarSite(prompt, templateId, generationContext = null) {
  const userPrompt = generationContext?.userPrompt || prompt || "";
  const customizations = generationContext?.customizations || "";
  const category = generationContext?.templateCategory || "landing";
  const style = generationContext?.templateStyle || "profissional";
  const mustHave = normalizeMustHave(userPrompt, customizations, generationContext?.mustHave || []);
  const styleDirectives = extractStyleDirectives(userPrompt, customizations);
  const templateBlueprint = getTemplateBlueprint(templateId, category);

  const provisionalPlan = pickPlan({
    category,
    templateId,
    templateBlueprint,
    plannerRequired: ensureArray(generationContext?.required_sections),
  });

  const plannerSystem = "Voce e um estrategista de paginas de alta conversao. Responda apenas JSON valido.";
  const plannerUser = `
Retorne JSON:
{
  "required_sections": ["..."],
  "must_cover_items": ["..."],
  "page_goal": "..."
}
Use somente sections permitidas: [${AVAILABLE_SECTIONS.join(", ")}].
${plannerPromptContext(provisionalPlan, mustHave)}
Diretrizes visuais obrigatorias: ${JSON.stringify(styleDirectives)}
Categoria: ${category}
Estilo visual: ${style}
Prompt do usuario: ${userPrompt}
Customizacoes: ${customizations || "nenhuma"}
`.trim();

  const plannerResult = await generateJsonWithFallback({ systemPrompt: plannerSystem, userPrompt: plannerUser, temperature: 0.55 });
  const planner = plannerResult && typeof plannerResult === "object"
    ? plannerResult
    : buildPlannerFallback({ category, mustHave, sectionPlan: provisionalPlan });

  const sectionPlan = pickPlan({
    category,
    templateId,
    templateBlueprint,
    plannerRequired: ensureArray(planner.required_sections),
  });

  const composerSystem = "Voce gera JSON de website usando biblioteca de componentes. Responda somente JSON valido.";
  const composerUser = `
Saida obrigatoria:
{
  "colors": { "primary": "#hex", "secondary": "#hex", "accent": "#hex" },
  "sections": [ ... ]
}
Regras:
- Use somente sections permitidas: [${AVAILABLE_SECTIONS.join(", ")}]
- Nao use markdown, comentarios ou placeholders com "__"
- Preencha copy real de negocio em tom ${STYLE_TONE[String(style || "").toLowerCase()] || STYLE_TONE.profissional}
- Siga esta ordem de secoes preferencialmente: ${sectionPlan.join(" -> ")}
${plannerPromptContext(sectionPlan, mustHave)}
Diretrizes visuais obrigatorias: ${JSON.stringify(styleDirectives)}
Briefing do usuario: ${userPrompt}
Customizacoes: ${customizations || "nenhuma"}
Plano do estrategista: ${JSON.stringify(planner)}
Blueprint base: ${JSON.stringify(templateBlueprint)}
`.trim();

  const composed = await generateJsonWithFallback({ systemPrompt: composerSystem, userPrompt: composerUser, temperature: 0.82 });
  if (!composed) {
    const fallback = buildHeuristicSite({ userPrompt, category, style, templateId, templateBlueprint, mustHave, sectionPlan });
    return applyStyleDirectives(fallback, styleDirectives);
  }

  let candidate = composeFinalSite(composed, { category, style, templateId, mustHave, userPrompt, templateBlueprint, sectionPlan });
  candidate = applyStyleDirectives(candidate, styleDirectives);
  let validation = validateSiteQuality(candidate, { category, mustHave, userPrompt, sectionPlan, styleDirectives });

  if (!validation.valid) {
    const repairUser = `
Corrija o JSON abaixo mantendo o briefing e as regras.
Problemas: ${validation.issues.join(" | ")}
Ordem de secoes alvo: ${sectionPlan.join(" -> ")}
Retorne somente JSON no formato: { "colors": {...}, "sections": [...] }.
JSON atual: ${JSON.stringify(candidate)}
`.trim();

    const repaired = await generateJsonWithFallback({ systemPrompt: composerSystem, userPrompt: repairUser, temperature: 0.45 });
    if (repaired) {
      candidate = composeFinalSite(repaired, { category, style, templateId, mustHave, userPrompt, templateBlueprint, sectionPlan });
      candidate = applyStyleDirectives(candidate, styleDirectives);
      validation = validateSiteQuality(candidate, { category, mustHave, userPrompt, sectionPlan, styleDirectives });
    }
  }

  if (!validation.valid) {
    const fallback = buildHeuristicSite({ userPrompt, category, style, templateId, templateBlueprint, mustHave, sectionPlan });
    return applyStyleDirectives(fallback, styleDirectives);
  }

  return candidate;
}

module.exports = { gerarSite };
