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

function getMinSectionsByCategory(category) {
  const key = String(category || "").toLowerCase();
  if (key === "ecommerce") return 8;
  if (key === "service") return 7;
  if (key === "portfolio") return 6;
  if (key === "biolink") return 4;
  return 6;
}

function categoryRequiredSections(category) {
  const key = String(category || "").toLowerCase();
  if (key === "ecommerce") return ["hero", "product-catalog", "pricing-table", "faq-section", "cta-section", "footer-section"];
  if (key === "portfolio") return ["hero", "project-gallery", "cta-section", "footer-section"];
  if (key === "biolink") return ["profile-header", "link-buttons", "footer-section"];
  if (key === "service") return ["hero", "feature-grid", "testimonial-slider", "cta-section", "footer-section"];
  return ["hero", "feature-grid", "cta-section", "footer-section"];
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
  return Array.from(new Set([...base, ...fromPrompt.slice(0, 6), ...fromCustom.slice(0, 6)])).slice(0, 12);
}

function applySectionDefaults(section) {
  const type = normalizeSectionType(section?.type);
  const base = { ...(section || {}), type };

  if (type === "hero") return { ...base, headline: base.headline || "Tecnologia ao seu alcance", subheadline: base.subheadline || "Solucoes personalizadas para acelerar seus resultados.", cta: base.cta || "Quero comecar", image_keyword: base.image_keyword || "business technology" };
  if (type === "navbar") return { ...base, logo_text: base.logo_text || "Logo", links: Array.isArray(base.links) && base.links.length > 0 ? base.links : [{ label: "Inicio", url: "#inicio" }, { label: "Contato", url: "#contato" }], cta_text: base.cta_text || base.cta || "Comecar" };
  if (type === "feature-grid") return { ...base, title: base.title || "Diferenciais", features: Array.isArray(base.features) && base.features.length > 0 ? base.features : [{ title: "Performance", description: "Entrega rapida com foco em conversao.", icon: "zap" }, { title: "Confianca", description: "Processos claros e previsiveis.", icon: "shield" }, { title: "Escala", description: "Estrutura pronta para crescimento.", icon: "chart" }] };
  if (type === "testimonial-slider") return { ...base, title: base.title || "Resultados de clientes", testimonials: Array.isArray(base.testimonials) && base.testimonials.length > 0 ? base.testimonials : [{ name: "Cliente", role: "Empreendedor", content: "Excelente experiencia e resultado.", rating: 5 }] };
  if (type === "pricing-table") return { ...base, title: base.title || "Planos", plans: Array.isArray(base.plans) && base.plans.length > 0 ? base.plans : [{ name: "Plano principal", price: "R$ 197", features: ["Implementacao", "Suporte"], recommended: true, cta: "Quero este plano" }] };
  if (type === "faq-section") return { ...base, title: base.title || "Perguntas frequentes", items: Array.isArray(base.items) && base.items.length > 0 ? base.items : [{ question: "Como funciona?", answer: "Nossa equipe cuida da implementacao de ponta a ponta." }] };
  if (type === "cta-section") return { ...base, title: base.title || "Pronto para avancar?", subtitle: base.subtitle || "Fale com a equipe e receba uma proposta personalizada.", button_text: base.button_text || "Falar agora" };
  if (type === "product-catalog") return { ...base, title: base.title || "Produtos", products: Array.isArray(base.products) && base.products.length > 0 ? base.products : [{ name: "Produto principal", price: "R$ 99", description: "Descricao do produto.", image_keyword: "product" }] };
  if (type === "profile-header") return { ...base, name: base.name || "Seu Nome", bio: base.bio || "Criador de conteudo digital.", image_keyword: base.image_keyword || "portrait" };
  if (type === "link-buttons") return { ...base, links: Array.isArray(base.links) && base.links.length > 0 ? base.links : [{ label: "Meu principal link", url: "#", icon: "link" }] };
  if (type === "project-gallery") return { ...base, title: base.title || "Projetos", projects: Array.isArray(base.projects) && base.projects.length > 0 ? base.projects : [{ title: "Projeto destaque", description: "Descricao do projeto.", image_keyword: "design project", link: "#" }] };
  if (type === "social-proof") return { ...base, title: base.title || "Quem confia", logos: Array.isArray(base.logos) && base.logos.length > 0 ? base.logos : ["Cliente A", "Cliente B", "Cliente C"] };
  if (type === "footer-section") return { ...base, text: base.text || `© ${new Date().getFullYear()} Todos os direitos reservados.`, social_media: Array.isArray(base.social_media) ? base.social_media : [] };
  return base;
}

function sanitizeCandidate(raw) {
  const rawSections = Array.isArray(raw?.sections) ? raw.sections : [];
  const normalizedRaw = rawSections.map((section) => ({ ...section, type: normalizeSectionType(section?.type) })).filter((section) => isAllowedSection(section.type));
  return {
    colors: raw?.colors && typeof raw.colors === "object" ? raw.colors : { primary: "#2563eb", secondary: "#0f172a", accent: "#14b8a6" },
    sections: normalizedRaw.map((section) => applySectionDefaults(section)),
  };
}

function mergeWithBlueprint(rawSite, blueprint, category) {
  const sanitized = sanitizeCandidate(rawSite);
  const merged = [...sanitized.sections];
  const minSections = getMinSectionsByCategory(category);
  const blueprintSections = Array.isArray(blueprint?.sections) ? blueprint.sections : [];
  for (const section of blueprintSections) {
    const type = normalizeSectionType(section?.type);
    if (!isAllowedSection(type)) continue;
    if (merged.some((s) => normalizeSectionType(s.type) === type)) continue;
    merged.push(applySectionDefaults({ ...section, type }));
    if (merged.length >= minSections) break;
  }
  return {
    colors: sanitized.colors || blueprint?.colors || { primary: "#2563eb", secondary: "#0f172a", accent: "#14b8a6" },
    sections: merged,
  };
}

function validateSiteQuality(site, { category, mustHave, userPrompt }) {
  const issues = [];
  if (!site || !Array.isArray(site.sections) || site.sections.length === 0) issues.push("Sem secoes.");
  const sectionTypes = Array.isArray(site?.sections) ? site.sections.map((s) => normalizeSectionType(s?.type)).filter(Boolean) : [];
  if (sectionTypes.length < getMinSectionsByCategory(category)) issues.push("Quantidade de secoes insuficiente.");
  for (const t of categoryRequiredSections(category)) if (!sectionTypes.includes(t)) issues.push(`Secao obrigatoria ausente: ${t}.`);
  const serial = JSON.stringify(site).toLowerCase();
  if (serial.includes("__")) issues.push("Placeholders nao resolvidos.");
  const tokens = extractKeywords(`${mustHave.join(" ")} ${userPrompt || ""}`);
  const missing = tokens.slice(0, 20).filter((t) => !serial.includes(t));
  if (missing.length > 10) issues.push("Cobertura baixa do briefing.");
  return { valid: issues.length === 0, issues };
}

async function generateJsonWithGemini({ systemPrompt, userPrompt, temperature = 0.9 }) {
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

async function generateJsonWithGroq({ systemPrompt, userPrompt, temperature = 0.9 }) {
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

function buildPlannerFallback({ category, mustHave }) {
  const required = categoryRequiredSections(category);
  return {
    objective: "converter visitantes em leads/clientes",
    required_sections: required,
    must_cover_items: mustHave,
  };
}

function buildHeuristicSite({ userPrompt, category, templateBlueprint, mustHave }) {
  const keyword = extractKeywords(userPrompt)[0] || "seu negocio";
  const required = categoryRequiredSections(category);
  const sections = required.map((type) => {
    if (type === "hero") return { type, headline: `Solucao completa para ${keyword}`, subheadline: String(userPrompt || "").slice(0, 160), cta: "Quero comecar agora", image_keyword: `${keyword} professional` };
    if (type === "feature-grid") return { type, title: "Diferenciais", features: (mustHave.slice(0, 4).length ? mustHave.slice(0, 4) : ["Atendimento especializado", "Processo claro", "Resultado mensuravel", "Suporte rapido"]).map((m, idx) => ({ title: String(m).slice(0, 48), description: `Aplicacao pratica para ${keyword}.`, icon: idx % 2 === 0 ? "zap" : "shield" })) };
    if (type === "testimonial-slider") return { type, title: "Resultados reais", testimonials: [{ name: "Cliente 1", role: "Empreendedor", content: "Experiencia excelente e resultado rapido.", rating: 5 }] };
    if (type === "pricing-table") return { type, title: "Planos", plans: [{ name: "Essencial", price: "R$ 97", features: ["Setup inicial", "Suporte"], recommended: false, cta: "Comecar" }, { name: "Pro", price: "R$ 297", features: ["Tudo do Essencial", "Otimizacao"], recommended: true, cta: "Escolher Pro" }] };
    if (type === "faq-section") return { type, title: "Perguntas frequentes", items: [{ question: "Como funciona?", answer: "Voce preenche o briefing e recebe uma estrutura completa em minutos." }, { question: "Posso editar?", answer: "Sim, voce pode refinar texto, visual e secoes quando quiser." }] };
    if (type === "cta-section") return { type, title: "Pronto para avancar?", subtitle: "Comece agora e publique seu site.", button_text: "Criar meu site" };
    if (type === "product-catalog") return { type, title: "Produtos", products: [{ name: "Produto principal", price: "R$ 99", description: "Descricao orientada a conversao.", image_keyword: "product premium" }, { name: "Kit completo", price: "R$ 199", description: "Pacote com melhor custo-beneficio.", image_keyword: "product kit" }] };
    if (type === "project-gallery") return { type, title: "Projetos", projects: [{ title: "Projeto destaque", description: "Caso com foco em impacto e conversao.", image_keyword: "design project", link: "#" }] };
    if (type === "profile-header") return { type, name: "Criador(a)", bio: String(userPrompt || "").slice(0, 120), image_keyword: "portrait creator" };
    if (type === "link-buttons") return { type, links: [{ label: "Link principal", url: "#", icon: "link" }, { label: "Instagram", url: "#", icon: "instagram" }] };
    if (type === "social-proof") return { type, title: "Quem confia", logos: ["Cliente A", "Cliente B", "Cliente C"] };
    if (type === "footer-section") return { type, text: `© ${new Date().getFullYear()} Todos os direitos reservados.`, social_media: [] };
    if (type === "navbar") return { type, logo_text: "Logo", links: [{ label: "Inicio", url: "#inicio" }, { label: "Contato", url: "#contato" }], cta_text: "Falar agora" };
    return { type };
  });
  return mergeWithBlueprint({ colors: templateBlueprint?.colors, sections }, templateBlueprint, category);
}

async function gerarSite(prompt, templateId, generationContext = null) {
  const userPrompt = generationContext?.userPrompt || prompt || "";
  const customizations = generationContext?.customizations || "";
  const category = generationContext?.templateCategory || "landing";
  const style = generationContext?.templateStyle || "profissional";
  const mustHave = normalizeMustHave(userPrompt, customizations, generationContext?.mustHave || []);
  const templateBlueprint = getTemplateBlueprint(templateId, category);

  const plannerSystem = "Voce e um planner de landing pages. Responda somente JSON valido.";
  const plannerUser = `
Retorne JSON: { "required_sections": ["..."], "must_cover_items": ["..."] }.
Use somente sections permitidas: [${AVAILABLE_SECTIONS.join(", ")}].
Categoria: ${category}
Estilo: ${style}
Prompt: ${userPrompt}
Customizacoes: ${customizations || "nenhuma"}
Requisitos: ${mustHave.join(" | ") || "nenhum"}
`.trim();

  const plannerResult = await generateJsonWithFallback({ systemPrompt: plannerSystem, userPrompt: plannerUser, temperature: 0.7 });
  const planner = plannerResult && typeof plannerResult === "object" ? plannerResult : buildPlannerFallback({ category, mustHave });

  const composerSystem = "Voce gera JSON de site. Responda somente JSON valido.";
  const composerUser = `
Saida obrigatoria: { "colors": {...}, "sections": [...] }.
Use somente sections permitidas: [${AVAILABLE_SECTIONS.join(", ")}].
Cubra 100% do briefing.
Sem placeholders (__...__) e sem markdown.
Categoria: ${category}
Prompt usuario: ${userPrompt}
Customizacoes: ${customizations || "nenhuma"}
Plano: ${JSON.stringify(planner)}
Blueprint: ${JSON.stringify(templateBlueprint)}
`.trim();

  const composed = await generateJsonWithFallback({ systemPrompt: composerSystem, userPrompt: composerUser, temperature: 0.95 });
  if (!composed) {
    return buildHeuristicSite({ userPrompt, category, templateBlueprint, mustHave });
  }

  let candidate = mergeWithBlueprint(composed, templateBlueprint, category);
  let validation = validateSiteQuality(candidate, { category, mustHave, userPrompt });

  if (!validation.valid) {
    const repairUser = `
Corrija o JSON abaixo para ficar completo e valido.
Problemas: ${validation.issues.join(" | ")}
Categoria: ${category}
JSON atual: ${JSON.stringify(candidate)}
Retorne somente JSON { "colors": {...}, "sections": [...] }.
`.trim();
    const repaired = await generateJsonWithFallback({ systemPrompt: composerSystem, userPrompt: repairUser, temperature: 0.55 });
    if (repaired) {
      candidate = mergeWithBlueprint(repaired, templateBlueprint, category);
      validation = validateSiteQuality(candidate, { category, mustHave, userPrompt });
    }
  }

  if (!validation.valid) {
    return buildHeuristicSite({ userPrompt, category, templateBlueprint, mustHave });
  }

  return candidate;
}

module.exports = { gerarSite };
