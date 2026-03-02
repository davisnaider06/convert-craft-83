const { GoogleGenerativeAI } = require("@google/generative-ai");
const Groq = require("groq-sdk");
const { getTemplateBlueprint } = require("../utils/templates");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;
let geminiDisabled = false;
let groqDisabled = false;

<<<<<<< HEAD
const SYSTEM_PROMPT = `
Você é um Copywriter Sênior, Web Designer e Especialista em Landing Pages de Alta Conversão (como Lovable e v0).
O usuário vai te passar o Nicho e as Customizações. Você DEVE gerar um site COMPLETO e PROFISSIONAL.

Você DEVE retornar EXATAMENTE um JSON válido com a seguinte estrutura. NÃO adicione texto extra, nem markdown.
Cada seção deve ser completa, com múltiplos componentes realistas e de alto impacto visual.
=======
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
>>>>>>> a27c719 (ajuste na criação dos sites)

const STOPWORDS = new Set([
  "para", "com", "sem", "uma", "uns", "umas", "que", "por", "dos", "das", "de", "do", "da", "the", "and", "you", "seu", "sua", "seus", "suas", "mais", "muito", "sobre", "como", "site", "pagina",
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

function hashSeed(input) {
  let h = 2166136261;
  const str = String(input || "");
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return Math.abs(h >>> 0);
}

function getVariationTokens({ templateId, userPrompt, category, style }) {
  const seed = hashSeed(`${templateId || "custom"}|${category || "landing"}|${style || "profissional"}|${userPrompt || ""}|${Date.now()}`);
  const paletteShift = seed % 9;
  const narrative = seed % 3 === 0 ? "direto e comercial" : seed % 3 === 1 ? "consultivo e confiavel" : "inspiracional e aspiracional";
  const ctaStyle = seed % 2 === 0 ? "acao imediata" : "convite progressivo";
  return { seed, paletteShift, narrative, ctaStyle };
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

function buildPlannerPrompt({ userPrompt, customizations, mustHave, category, templateName, style, templatePrompt, variation }) {
  return `
Voce e um estrategista de landing pages.
Gere um plano de estrutura e copy com base no briefing abaixo.

Retorne SOMENTE JSON valido com esta raiz:
{
<<<<<<< HEAD
  "colors": {
    "primary": "Código HEX principal (ex: #3B82F6)",
    "secondary": "Código HEX secundário (ex: #1F2937)",
    "accent": "Código HEX de destaque (ex: #10B981)",
    "background": "Código HEX de fundo (ex: #FFFFFF)",
    "text": "Código HEX do texto principal (ex: #1F2937)"
  },
  "company": {
    "name": "Nome da empresa/marca muito atrativo",
    "tagline": "Tagline impactante em 1 linha"
  },
  "navigation": {
    "menu_items": [
      { "label": "Home", "href": "#home" },
      { "label": "Soluções", "href": "#features" },
      { "label": "Como Funciona", "href": "#how" },
      { "label": "Preços", "href": "#pricing" },
      { "label": "Depoimentos", "href": "#testimonials" },
      { "label": "Contato", "href": "#contact" }
    ]
  },
  "hero": {
    "headline": "Headline SUPER persuasivo (máx 10 palavras, foco em resultado)",
    "subheadline": "Subheadline explicativo focando na dor e solução (2-3 linhas)",
    "cta_button": "Texto de ação forte (ex: Comece Grátis Agora)",
    "cta_secondary": "Texto do botão secundário (ex: Ver Demo)",
    "background_image": "Descrição para imagem de fundo (ex: modern office productivity workspace)",
    "badge": "Badge/label pequeno acima do headline (ex: Trusted by 10k+ users)"
  },
  "features": {
    "section_title": "Por que escolher nossa solução?",
    "section_subtitle": "Vantagens competitivas que diferenciam nosso produto",
    "items": [
      {
        "title": "Benefício 1",
        "description": "Explicação clara e persuasiva do valor (2-3 frases)",
        "icon": "lightning-bolt",
        "highlight": true
      },
      {
        "title": "Benefício 2",
        "description": "Explicação clara e persuasiva do valor (2-3 frases)",
        "icon": "shield",
        "highlight": false
      },
      {
        "title": "Benefício 3",
        "description": "Explicação clara e persuasiva do valor (2-3 frases)",
        "icon": "target",
        "highlight": false
      },
      {
        "title": "Benefício 4",
        "description": "Explicação clara e persuasiva do valor (2-3 frases)",
        "icon": "trending-up",
        "highlight": false
      },
      {
        "title": "Benefício 5",
        "description": "Explicação clara e persuasiva do valor (2-3 frases)",
        "icon": "check-circle",
        "highlight": false
      },
      {
        "title": "Benefício 6",
        "description": "Explicação clara e persuasiva do valor (2-3 frases)",
        "icon": "zap",
        "highlight": false
      }
    ]
  },
  "how_it_works": {
    "section_title": "Como funciona",
    "section_subtitle": "Processo simples em 3 passos",
    "steps": [
      {
        "number": 1,
        "title": "Passo 1",
        "description": "Descrição clara do primeiro passo",
        "icon": "file-text"
      },
      {
        "number": 2,
        "title": "Passo 2",
        "description": "Descrição clara do segundo passo",
        "icon": "settings"
      },
      {
        "number": 3,
        "title": "Passo 3",
        "description": "Descrição clara do terceiro passo",
        "icon": "check"
      }
    ]
  },
  "stats": {
    "items": [
      { "number": "10k+", "label": "Clientes Satisfeitos" },
      { "number": "95%", "label": "Taxa de Satisfação" },
      { "number": "24/7", "label": "Suporte Disponível" },
      { "number": "99.9%", "label": "Uptime Garantido" }
    ]
  },
  "social_proof": {
    "title": "Confiado por empresas líderes",
    "subtitle": "Empresas que utilizam nossa solução",
    "logos": [
      "TechCorp Inc",
      "FinanceHub Ltd",
      "StartupAI Co",
      "CloudSystems",
      "DataDriven Inc",
      "InnovateLabs"
    ]
  },
  "testimonials": {
    "section_title": "O que nossos clientes dizem",
    "items": [
      {
        "name": "Nome Cliente 1",
        "role": "Cargo/Título",
        "company": "Nome Empresa",
        "content": "Depoimento autêntico e focado em resultados concretos (3-4 frases)",
        "rating": 5,
        "image": "avatar 1"
      },
      {
        "name": "Nome Cliente 2",
        "role": "Cargo/Título",
        "company": "Nome Empresa",
        "content": "Depoimento autêntico e focado em resultados concretos (3-4 frases)",
        "rating": 5,
        "image": "avatar 2"
      },
      {
        "name": "Nome Cliente 3",
        "role": "Cargo/Título",
        "company": "Nome Empresa",
        "content": "Depoimento autêntico e focado em resultados concretos (3-4 frases)",
        "rating": 5,
        "image": "avatar 3"
      }
    ]
  },
  "pricing": {
    "section_title": "Escolha seu plano",
    "section_subtitle": "Flexibilidade para empresas de qualquer tamanho",
    "plans": [
      {
        "name": "Startup",
        "price": "R$ 97",
        "period": "/mês",
        "description": "Perfeito para começar",
        "features": [
          "Feature principal 1",
          "Feature 2",
          "Feature 3",
          "Suporte por email"
        ],
        "recommended": false,
        "cta": "Começar"
      },
      {
        "name": "Profissional",
        "price": "R$ 297",
        "period": "/mês",
        "description": "Para empresas em crescimento",
        "features": [
          "Tudo do Startup",
          "Feature avançada 1",
          "Feature avançada 2",
          "Suporte VIP 24/7",
          "Analytics avançado"
        ],
        "recommended": true,
        "cta": "Começar Agora",
        "badge": "Mais Popular"
      },
      {
        "name": "Enterprise",
        "price": "Customizado",
        "period": "",
        "description": "Para grandes empresas",
        "features": [
          "Tudo do Profissional",
          "Integração customizada",
          "API ilimitada",
          "Account manager dedicado",
          "SLA garantido"
        ],
        "recommended": false,
        "cta": "Falar com vendas"
      }
    ]
  },
  "faq": {
    "section_title": "Perguntas Frequentes",
    "items": [
      {
        "question": "Dúvida comum 1?",
        "answer": "Resposta clara, direta e que quebra objeção (2-3 frases)"
      },
      {
        "question": "Dúvida comum 2?",
        "answer": "Resposta clara, direta e que quebra objeção (2-3 frases)"
      },
      {
        "question": "Dúvida comum 3?",
        "answer": "Resposta clara, direta e que quebra objeção (2-3 frases)"
      },
      {
        "question": "Dúvida comum 4?",
        "answer": "Resposta clara, direta e que quebra objeção (2-3 frases)"
      }
    ]
  },
  "cta_section": {
    "title": "Pronto para transformar seus resultados?",
    "subtitle": "Não perca tempo. Comece sua jornada hoje mesmo com uma garantia de satisfação de 30 dias.",
    "cta_button": "Começar Agora",
    "cta_secondary": "Ver Demonstração",
    "background_gradient": "Degradado visual atrativo"
  },
  "footer": {
    "company_name": "Nome Empresa",
    "description": "Descrição breve da empresa (30 palavras max)",
    "links": [
      {
        "title": "Produto",
        "items": ["Features", "Preços", "Segurança"]
      },
      {
        "title": "Empresa",
        "items": ["Sobre", "Blog", "Carreiras"]
      },
      {
        "title": "Legal",
        "items": ["Privacidade", "Termos", "Cookies"]
      }
    ],
    "social_links": [
      { "platform": "twitter", "handle": "@empresa" },
      { "platform": "linkedin", "handle": "empresa" },
      { "platform": "instagram", "handle": "@empresa" }
    ],
    "copyright": "© 2024 Empresa. Todos os direitos reservados."
=======
  "objective": "string",
  "target_audience": "string",
  "tone": "string",
  "required_sections": ["section-type"],
  "section_briefs": [{"type":"hero","goal":"...","must_include":["..."]}],
  "must_cover_items": ["..."],
  "conversion_flow": "string",
  "style_guardrails": {
    "palette_notes": "string",
    "layout_notes": "string",
    "copy_notes": "string"
>>>>>>> a27c719 (ajuste na criação dos sites)
  }
}

Regras:
- required_sections deve usar APENAS: [${AVAILABLE_SECTIONS.join(", ")}]
- incluir secoes suficientes para pagina completa
- nao use placeholders tipo "__headline__"
- incluir TODOS os requisitos obrigatorios no must_cover_items

Contexto:
- template: ${templateName || "custom"}
- categoria: ${category || "landing"}
- estilo desejado: ${style || "profissional"}
- prompt base template: ${templatePrompt || "nao informado"}
- narrativa variavel: ${variation.narrative}
- cta style: ${variation.ctaStyle}
- palette shift: ${variation.paletteShift}

Briefing usuario:
${userPrompt || ""}

Customizacoes:
${customizations || "nenhuma"}

Requisitos obrigatorios:
${mustHave.length ? mustHave.map((x) => `- ${x}`).join("\n") : "- nenhum"}
`.trim();
}

<<<<<<< HEAD
function gerarIconeSVG(iconName) {
    const icos = {
        "lightning-bolt": '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
        "shield": '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>',
        "target": '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
        "trending-up": '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><polyline points="17 6 23 6 23 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
        "check-circle": '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>',
        "zap": '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
        "file-text": '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-8-6z"/><line x1="16" y1="13" x2="8" y2="13" stroke="white" stroke-width="2"/><line x1="16" y1="17" x2="8" y2="17" stroke="white" stroke-width="2"/><polyline points="8 9 8 7 16 7" fill="none" stroke="white" stroke-width="2"/></svg>',
        "settings": '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6M4.22 4.22l-4.24 4.24m8.5 8.5l4.24 4.24m-16.96 0l4.24-4.24m8.5-8.5l4.24-4.24" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
        "check": '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    };
    return icos[iconName] || icos["check-circle"];
}

function converterJsonParaHtml(dadosJson) {
    const cores = dadosJson.colors || {};
    const primary = cores.primary || "#3B82F6";
    const secondary = cores.secondary || "#1F2937";
    const accent = cores.accent || "#10B981";
    const background = cores.background || "#FFFFFF";
    const text = cores.text || "#1F2937";

    const company = dadosJson.company || { name: "Minha Empresa", tagline: "Solução inovadora" };
    const hero = dadosJson.hero || {};
    const features = dadosJson.features || {};
    const howItWorks = dadosJson.how_it_works || {};
    const stats = dadosJson.stats || {};
    const socialProof = dadosJson.social_proof || {};
    const testimonials = dadosJson.testimonials || {};
    const pricing = dadosJson.pricing || {};
    const faq = dadosJson.faq || {};
    const ctaSection = dadosJson.cta_section || {};
    const footer = dadosJson.footer || {};
    const navigation = dadosJson.navigation || {};

    const menuItems = navigation.menu_items || [];

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${company.name} - ${company.tagline}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            color: ${text};
            background-color: ${background};
            line-height: 1.6;
        }
        
        /* NAVBAR */
        nav {
            background: ${background};
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            position: sticky;
            top: 0;
            z-index: 1000;
        }
        
        .navbar {
            max-width: 1400px;
            margin: 0 auto;
            padding: 1rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .navbar-logo {
            font-size: 1.5rem;
            font-weight: 700;
            color: ${primary};
        }
        
        .navbar-menu {
            display: flex;
            gap: 2rem;
            list-style: none;
        }
        
        .navbar-menu a {
            text-decoration: none;
            color: ${text};
            font-weight: 500;
            transition: color 0.3s;
        }
        
        .navbar-menu a:hover {
            color: ${primary};
        }
        
        /* CONTAINERS */
        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 0 2rem;
        }
        
        .section {
            padding: 5rem 0;
        }
        
        .section-title {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            text-align: center;
            color: ${secondary};
        }
        
        .section-subtitle {
            font-size: 1.125rem;
            color: #6B7280;
            text-align: center;
            max-width: 600px;
            margin: 0 auto 3rem;
        }
        
        /* HERO SECTION */
        .hero {
            background: linear-gradient(135deg, ${primary}15 0%, ${accent}15 100%);
            min-height: 600px;
            display: flex;
            align-items: center;
            padding: 4rem 0;
        }
        
        .hero-content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 4rem;
            align-items: center;
        }
        
        .hero-text h1 {
            font-size: 3.5rem;
            font-weight: 800;
            line-height: 1.2;
            margin-bottom: 1rem;
            color: ${secondary};
        }
        
        .hero-text p {
            font-size: 1.25rem;
            color: #6B7280;
            margin-bottom: 2rem;
            line-height: 1.8;
        }
        
        .hero-buttons {
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
        }
        
        .btn {
            padding: 0.75rem 2rem;
            border: none;
            border-radius: 0.5rem;
            font-weight: 600;
            cursor: pointer;
            font-size: 1rem;
            transition: all 0.3s;
            text-decoration: none;
            display: inline-block;
        }
        
        .btn-primary {
            background-color: ${primary};
            color: white;
        }
        
        .btn-primary:hover {
            opacity: 0.9;
            transform: translateY(-2px);
            box-shadow: 0 10px 25px ${primary}40;
        }
        
        .btn-secondary {
            background-color: white;
            color: ${primary};
            border: 2px solid ${primary};
        }
        
        .btn-secondary:hover {
            background-color: ${primary}10;
        }
        
        .hero-badge {
            display: inline-block;
            background: ${primary}20;
            color: ${primary};
            padding: 0.5rem 1rem;
            border-radius: 9999px;
            font-size: 0.875rem;
            font-weight: 600;
            margin-bottom: 1rem;
        }
        
        /* FEATURES */
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 2rem;
            margin-top: 3rem;
        }
        
        .feature-card {
            padding: 2rem;
            background: ${background};
            border: 1px solid #E5E7EB;
            border-radius: 0.75rem;
            transition: all 0.3s;
        }
        
        .feature-card:hover {
            border-color: ${primary};
            box-shadow: 0 10px 30px ${primary}15;
            transform: translateY(-5px);
        }
        
        .feature-card.highlight {
            border: 2px solid ${accent};
            background: ${accent}05;
        }
        
        .feature-icon {
            width: 50px;
            height: 50px;
            background: ${primary}15;
            color: ${primary};
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 0.5rem;
            margin-bottom: 1rem;
        }
        
        .feature-card h3 {
            font-size: 1.25rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            color: ${secondary};
        }
        
        .feature-card p {
            color: #6B7280;
        }
        
        /* STATS */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 2rem;
            margin-top: 3rem;
            text-align: center;
        }
        
        .stat-item h3 {
            font-size: 2rem;
            font-weight: 700;
            color: ${primary};
        }
        
        .stat-item p {
            color: #6B7280;
            margin-top: 0.5rem;
        }
        
        /* HOW IT WORKS */
        .steps-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
            margin-top: 3rem;
        }
        
        .step-card {
            text-align: center;
            padding: 2rem;
        }
        
        .step-number {
            width: 60px;
            height: 60px;
            background: ${primary};
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            font-weight: 700;
            margin: 0 auto 1rem;
        }
        
        .step-card h3 {
            font-size: 1.25rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            color: ${secondary};
        }
        
        .step-card p {
            color: #6B7280;
        }
        
        /* SOCIAL PROOF */
        .logos-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 2rem;
            margin-top: 3rem;
            text-align: center;
            align-items: center;
        }
        
        .logo-item {
            padding: 2rem;
            background: #F9FAFB;
            border-radius: 0.5rem;
            color: #9CA3AF;
            font-weight: 600;
            border: 1px solid #E5E7EB;
        }
        
        /* TESTIMONIALS */
        .testimonials-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 2rem;
            margin-top: 3rem;
        }
        
        .testimonial-card {
            background: #F9FAFB;
            padding: 2rem;
            border-radius: 0.75rem;
            border: 1px solid #E5E7EB;
        }
        
        .testimonial-stars {
            color: #FCD34D;
            margin-bottom: 1rem;
        }
        
        .testimonial-text {
            color: #4B5563;
            margin-bottom: 1.5rem;
            font-style: italic;
        }
        
        .testimonial-author {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .testimonial-avatar {
            width: 40px;
            height: 40px;
            background: ${primary};
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
        }
        
        .testimonial-info h4 {
            font-weight: 700;
            color: ${secondary};
            margin-bottom: 0.25rem;
        }
        
        .testimonial-info p {
            font-size: 0.875rem;
            color: #6B7280;
        }
        
        /* PRICING */
        .pricing-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-top: 3rem;
        }
        
        .pricing-card {
            border: 2px solid #E5E7EB;
            border-radius: 0.75rem;
            padding: 2.5rem;
            text-align: center;
            position: relative;
            transition: all 0.3s;
        }
        
        .pricing-card:hover {
            border-color: ${primary};
            box-shadow: 0 20px 40px ${primary}20;
            transform: translateY(-10px);
        }
        
        .pricing-card.recommended {
            border-color: ${primary};
            background: ${primary}05;
            transform: scale(1.05);
        }
        
        .pricing-badge {
            position: absolute;
            top: -12px;
            left: 50%;
            transform: translateX(-50%);
            background: ${accent};
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 700;
        }
        
        .pricing-name {
            font-size: 1.5rem;
            font-weight: 700;
            color: ${secondary};
            margin-top: 1rem;
        }
        
        .pricing-price {
            font-size: 2.5rem;
            font-weight: 700;
            color: ${primary};
            margin: 1rem 0;
        }
        
        .pricing-period {
            color: #6B7280;
            font-size: 0.875rem;
        }
        
        .pricing-description {
            color: #6B7280;
            margin: 1rem 0 2rem;
        }
        
        .pricing-features {
            text-align: left;
            margin: 2rem 0;
            border-top: 1px solid #E5E7EB;
            border-bottom: 1px solid #E5E7EB;
            padding: 2rem 0;
        }
        
        .pricing-features li {
            list-style: none;
            padding: 0.5rem 0;
            color: #4B5563;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .pricing-features li:before {
            content: "✓";
            color: ${accent};
            font-weight: 700;
        }
        
        /* FAQ */
        .faq-container {
            max-width: 800px;
            margin: 3rem auto;
        }
        
        .faq-item {
            border-bottom: 1px solid #E5E7EB;
            padding: 1.5rem 0;
        }
        
        .faq-question {
            font-weight: 700;
            color: ${secondary};
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .faq-question:hover {
            color: ${primary};
        }
        
        .faq-answer {
            color: #6B7280;
            margin-top: 1rem;
            line-height: 1.8;
        }
        
        /* CTA SECTION */
        .cta-section {
            background: linear-gradient(135deg, ${primary} 0%, ${accent} 100%);
            color: white;
            text-align: center;
            padding: 5rem 2rem;
            border-radius: 1rem;
            margin: 3rem 0;
        }
        
        .cta-section h2 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 1rem;
        }
        
        .cta-section p {
            font-size: 1.125rem;
            margin-bottom: 2rem;
            opacity: 0.95;
        }
        
        .cta-section .btn {
            margin: 0 0.5rem;
        }
        
        .btn-cta {
            background-color: white;
            color: ${primary};
        }
        
        .btn-cta:hover {
            background-color: ${primary}10;
        }
        
        /* FOOTER */
        footer {
            background: ${secondary};
            color: #D1D5DB;
            padding: 4rem 0 2rem;
        }
        
        .footer-content {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 2rem;
            margin-bottom: 2rem;
        }
        
        .footer-section h3 {
            color: white;
            margin-bottom: 1rem;
            font-weight: 700;
        }
        
        .footer-section ul {
            list-style: none;
        }
        
        .footer-section a {
            color: #D1D5DB;
            text-decoration: none;
            transition: color 0.3s;
            display: block;
            margin-bottom: 0.5rem;
        }
        
        .footer-section a:hover {
            color: white;
        }
        
        .footer-bottom {
            border-top: 1px solid ${primary}30;
            padding-top: 2rem;
            text-align: center;
        }
        
        .footer-copyright {
            color: #9CA3AF;
            font-size: 0.875rem;
        }
        
        /* RESPONSIVE */
        @media (max-width: 768px) {
            .hero-content {
                grid-template-columns: 1fr;
            }
            
            .hero-text h1 {
                font-size: 2rem;
            }
            
            .navbar-menu {
                gap: 1rem;
                font-size: 0.875rem;
            }
            
            .section {
                padding: 3rem 0;
            }
            
            .section-title {
                font-size: 2rem;
            }
            
            .pricing-card.recommended {
                transform: scale(1);
            }
        }
    </style>
</head>
<body>
    <!-- NAVBAR -->
    <nav>
        <div class="container">
            <div class="navbar">
                <div class="navbar-logo">${company.name}</div>
                <ul class="navbar-menu">
                    ${menuItems.map(item => `<li><a href="${item.href}">${item.label}</a></li>`).join('')}
                </ul>
            </div>
        </div>
    </nav>

    <!-- HERO SECTION -->
    <section class="hero" id="home">
        <div class="container">
            <div class="hero-content">
                <div class="hero-text">
                    ${hero.badge ? `<div class="hero-badge">✨ ${hero.badge}</div>` : ''}
                    <h1>${hero.headline || 'Título Principal'}</h1>
                    <p>${hero.subheadline || 'Subtítulo explicativo'}</p>
                    <div class="hero-buttons">
                        <button class="btn btn-primary">${hero.cta_button || 'Começar Agora'}</button>
                        ${hero.cta_secondary ? `<button class="btn btn-secondary">${hero.cta_secondary}</button>` : ''}
                    </div>
                </div>
                <div style="background: ${primary}20; height: 400px; border-radius: 1rem;"></div>
            </div>
        </div>
    </section>

    <!-- FEATURES SECTION -->
    ${features.items ? `
    <section class="section" id="features">
        <div class="container">
            <h2 class="section-title">${features.section_title || 'Funcionalidades'}</h2>
            <p class="section-subtitle">${features.section_subtitle || ''}</p>
            <div class="features-grid">
                ${features.items.map(feature => `
                    <div class="feature-card ${feature.highlight ? 'highlight' : ''}">
                        <div class="feature-icon">${gerarIconeSVG(feature.icon)}</div>
                        <h3>${feature.title}</h3>
                        <p>${feature.description}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    </section>
    ` : ''}

    <!-- STATS SECTION -->
    ${stats.items ? `
    <section class="section" style="background: ${primary}05;">
        <div class="container">
            <div class="stats-grid">
                ${stats.items.map(stat => `
                    <div class="stat-item">
                        <h3>${stat.number}</h3>
                        <p>${stat.label}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    </section>
    ` : ''}

    <!-- HOW IT WORKS SECTION -->
    ${howItWorks.steps ? `
    <section class="section" id="how">
        <div class="container">
            <h2 class="section-title">${howItWorks.section_title || 'Como Funciona'}</h2>
            <p class="section-subtitle">${howItWorks.section_subtitle || ''}</p>
            <div class="steps-grid">
                ${howItWorks.steps.map(step => `
                    <div class="step-card">
                        <div class="step-number">${step.number}</div>
                        <h3>${step.title}</h3>
                        <p>${step.description}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    </section>
    ` : ''}

    <!-- SOCIAL PROOF SECTION -->
    ${socialProof.logos ? `
    <section class="section" style="background: #F9FAFB;">
        <div class="container">
            <h2 class="section-title">${socialProof.title || 'Confiado por'}</h2>
            <p class="section-subtitle">${socialProof.subtitle || ''}</p>
            <div class="logos-grid">
                ${socialProof.logos.map(logo => `
                    <div class="logo-item">${logo}</div>
                `).join('')}
            </div>
        </div>
    </section>
    ` : ''}

    <!-- TESTIMONIALS SECTION -->
    ${testimonials.items ? `
    <section class="section" id="testimonials">
        <div class="container">
            <h2 class="section-title">${testimonials.section_title || 'Depoimentos'}</h2>
            <div class="testimonials-grid">
                ${testimonials.items.map(testimonial => `
                    <div class="testimonial-card">
                        <div class="testimonial-stars">${'★'.repeat(testimonial.rating || 5)}${testimonial.rating ? '' : ''}</div>
                        <p class="testimonial-text">"${testimonial.content}"</p>
                        <div class="testimonial-author">
                            <div class="testimonial-avatar">${testimonial.name.charAt(0)}</div>
                            <div class="testimonial-info">
                                <h4>${testimonial.name}</h4>
                                <p>${testimonial.role} @ ${testimonial.company}</p>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    </section>
    ` : ''}

    <!-- PRICING SECTION -->
    ${pricing.plans ? `
    <section class="section" id="pricing" style="background: #F9FAFB;">
        <div class="container">
            <h2 class="section-title">${pricing.section_title || 'Preços'}</h2>
            <p class="section-subtitle">${pricing.section_subtitle || ''}</p>
            <div class="pricing-grid">
                ${pricing.plans.map(plan => `
                    <div class="pricing-card ${plan.recommended ? 'recommended' : ''}">
                        ${plan.badge ? `<div class="pricing-badge">${plan.badge}</div>` : ''}
                        <h3 class="pricing-name">${plan.name}</h3>
                        <div class="pricing-price">${plan.price}</div>
                        ${plan.period ? `<div class="pricing-period">${plan.period}</div>` : ''}
                        <p class="pricing-description">${plan.description}</p>
                        <button class="btn btn-primary" style="width: 100%;">${plan.cta}</button>
                        <ul class="pricing-features">
                            ${plan.features.map(feature => `<li>${feature}</li>`).join('')}
                        </ul>
                    </div>
                `).join('')}
            </div>
        </div>
    </section>
    ` : ''}

    <!-- FAQ SECTION -->
    ${faq.items ? `
    <section class="section" id="faq">
        <div class="container">
            <h2 class="section-title">${faq.section_title || 'Perguntas Frequentes'}</h2>
            <div class="faq-container">
                ${faq.items.map((item, index) => `
                    <div class="faq-item">
                        <div class="faq-question" onclick="document.getElementById('answer-${index}').style.display = document.getElementById('answer-${index}').style.display === 'none' ? 'block' : 'none'">
                            <span>${item.question}</span>
                            <span style="font-size: 1.5rem;">+</span>
                        </div>
                        <div class="faq-answer" id="answer-${index}" style="display: none;">
                            ${item.answer}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    </section>
    ` : ''}

    <!-- CTA SECTION -->
    <section class="cta-section" id="contact">
        <div class="container">
            <h2>${ctaSection.title || 'Pronto para começar?'}</h2>
            <p>${ctaSection.subtitle || 'Transforme seus negócios hoje mesmo.'}</p>
            <div>
                <button class="btn btn-cta">${ctaSection.cta_button || 'Começar Agora'}</button>
                ${ctaSection.cta_secondary ? `<button class="btn btn-secondary">${ctaSection.cta_secondary}</button>` : ''}
            </div>
        </div>
    </section>

    <!-- FOOTER -->
    <footer>
        <div class="container">
            <div class="footer-content">
                <div>
                    <h3>${footer.company_name || company.name}</h3>
                    <p>${footer.description || 'Solução inovadora para seu negócio'}</p>
                </div>
                ${footer.links ? footer.links.map(section => `
                    <div class="footer-section">
                        <h3>${section.title}</h3>
                        <ul>
                            ${section.items.map(item => `<li><a href="#">${item}</a></li>`).join('')}
                        </ul>
                    </div>
                `).join('') : ''}
            </div>
            <div class="footer-bottom">
                <p class="footer-copyright">${footer.copyright || '© 2024. Todos os direitos reservados.'}</p>
            </div>
        </div>
    </footer>

    <script>
        document.querySelectorAll('[href^="#"]').forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href !== '#') {
                    e.preventDefault();
                    const element = document.querySelector(href);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            });
        });
    </script>
</body>
</html>`;
}

async function gerarSite(prompt) {
    const dadosJson = await gerarDados(prompt);
    const htmlCompleto = converterJsonParaHtml(dadosJson);
    return {
        jsonData: dadosJson,
        html: htmlCompleto
    };
=======
function buildComposerPrompt({ planner, templateBlueprint, userPrompt, customizations, category, variation }) {
  return `
Voce e um web designer/copywriter senior.
Sua tarefa: transformar o plano e blueprint em JSON final de site com alta qualidade e variedade.

Saida obrigatoria: SOMENTE JSON valido com raiz:
{
  "colors": {"primary":"#hex","secondary":"#hex","accent":"#hex"},
  "sections": [ ... ]
>>>>>>> a27c719 (ajuste na criação dos sites)
}

Regras de qualidade:
1) Cobrir 100% dos must_cover_items do plano.
2) Nunca retornar placeholders "__...__" ou texto generico vazio.
3) Garantir narrativa coerente entre secoes.
4) Variar estrutura e copy conforme briefing (nao repetir formula fixa).
5) Respeitar categoria e objetivo de conversao.
6) Cada section precisa ter campos uteis preenchidos.
7) Usar somente types permitidos: [${AVAILABLE_SECTIONS.join(", ")}]

Contexto de variedade:
- narrative: ${variation.narrative}
- cta_style: ${variation.ctaStyle}
- palette_shift_hint: ${variation.paletteShift}

Plano (fonte da verdade):
${JSON.stringify(planner, null, 2)}

Blueprint base (guia, nao engessa):
${JSON.stringify(templateBlueprint, null, 2)}

Briefing usuario:
${userPrompt || ""}

Customizacoes:
${customizations || "nenhuma"}

Categoria:
${category || "landing"}
`.trim();
}

function buildRepairPrompt({ issues, candidate, planner, category }) {
  return `
Corrija o JSON de site abaixo.

Retorne SOMENTE JSON valido no formato:
{ "colors": {...}, "sections": [...] }

Problemas que precisam ser corrigidos:
${issues.map((x) => `- ${x}`).join("\n")}

Plano esperado:
${JSON.stringify(planner, null, 2)}

Categoria:
${category || "landing"}

JSON atual:
${JSON.stringify(candidate, null, 2)}
`.trim();
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

      const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
      const resultPromise = model.generateContent(fullPrompt);
      const result = await Promise.race([
        resultPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 30000)),
      ]);

      return JSON.parse(result.response.text());
    } catch (error) {
      const reason = error?.message ? String(error.message).split("\n")[0] : "erro desconhecido";
      console.warn(`[IA][Gemini ${modelName}] falha: ${reason}`);
      const full = String(error?.message || error || "");
      if (full.includes("API_KEY_INVALID") || full.includes("API key not valid")) {
        geminiDisabled = true;
        break;
      }
    }
  }
  return null;
}

async function generateJsonWithGroq({ systemPrompt, userPrompt, temperature = 0.9 }) {
  if (groqDisabled) return null;
  if (!groq) return null;
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });
    return JSON.parse(completion.choices[0]?.message?.content || "{}");
  } catch (error) {
    console.warn("[IA][Groq] falha:", error?.message || error);
    const full = String(error?.message || error || "");
    if (full.includes("Invalid API Key") || full.includes("authentication")) {
      groqDisabled = true;
    }
    return null;
  }
}

async function generateJsonWithFallback(params) {
  const geminiResult = await generateJsonWithGemini(params);
  if (geminiResult) return geminiResult;
  return generateJsonWithGroq(params);
}

function applySectionDefaults(section) {
  const type = normalizeSectionType(section?.type);
  const base = { ...(section || {}), type };

  if (type === "navbar") {
    return {
      ...base,
      logo_text: base.logo_text || "Logo",
      links: Array.isArray(base.links) && base.links.length > 0 ? base.links : [{ label: "Inicio", url: "#inicio" }, { label: "Contato", url: "#contato" }],
      cta_text: base.cta_text || base.cta || "Comecar",
    };
  }

  if (type === "hero") {
    return {
      ...base,
      headline: base.headline || "Tecnologia ao seu alcance",
      subheadline: base.subheadline || "Solucoes personalizadas para acelerar seus resultados.",
      cta: base.cta || "Quero comecar",
      image_keyword: base.image_keyword || "business technology",
    };
  }

  if (type === "feature-grid") {
    return {
      ...base,
      title: base.title || "Diferenciais",
      features: Array.isArray(base.features) && base.features.length > 0
        ? base.features
        : [
            { title: "Performance", description: "Entrega rapida com foco em conversao.", icon: "zap" },
            { title: "Confianca", description: "Processos claros e previsiveis.", icon: "shield" },
            { title: "Escala", description: "Estrutura pronta para crescimento.", icon: "chart" },
          ],
    };
  }

  if (type === "testimonial-slider") {
    return {
      ...base,
      title: base.title || "Resultados de clientes",
      testimonials: Array.isArray(base.testimonials) && base.testimonials.length > 0
        ? base.testimonials
        : [{ name: "Cliente", role: "Empreendedor", content: "Excelente experiencia e resultado.", rating: 5 }],
    };
  }

  if (type === "pricing-table") {
    return {
      ...base,
      title: base.title || "Planos",
      plans: Array.isArray(base.plans) && base.plans.length > 0
        ? base.plans
        : [{ name: "Plano principal", price: "R$ 197", features: ["Implementacao", "Suporte"], recommended: true, cta: "Quero este plano" }],
    };
  }

  if (type === "faq-section") {
    return {
      ...base,
      title: base.title || "Perguntas frequentes",
      items: Array.isArray(base.items) && base.items.length > 0
        ? base.items
        : [{ question: "Como funciona?", answer: "Nossa equipe cuida da implementacao de ponta a ponta." }],
    };
  }

  if (type === "cta-section") {
    return {
      ...base,
      title: base.title || "Pronto para avancar?",
      subtitle: base.subtitle || "Fale com a equipe e receba uma proposta personalizada.",
      button_text: base.button_text || "Falar agora",
    };
  }

  if (type === "product-catalog") {
    return {
      ...base,
      title: base.title || "Produtos",
      products: Array.isArray(base.products) && base.products.length > 0
        ? base.products
        : [{ name: "Produto principal", price: "R$ 99", description: "Descricao do produto.", image_keyword: "product" }],
    };
  }

  if (type === "profile-header") {
    return {
      ...base,
      name: base.name || "Seu Nome",
      bio: base.bio || "Criador de conteudo digital.",
      image_keyword: base.image_keyword || "portrait",
    };
  }

  if (type === "link-buttons") {
    return {
      ...base,
      links: Array.isArray(base.links) && base.links.length > 0
        ? base.links
        : [{ label: "Meu principal link", url: "#", icon: "link" }],
    };
  }

  if (type === "project-gallery") {
    return {
      ...base,
      title: base.title || "Projetos",
      projects: Array.isArray(base.projects) && base.projects.length > 0
        ? base.projects
        : [{ title: "Projeto destaque", description: "Descricao do projeto.", image_keyword: "design project", link: "#" }],
    };
  }

  if (type === "social-proof") {
    return {
      ...base,
      title: base.title || "Quem confia",
      logos: Array.isArray(base.logos) && base.logos.length > 0 ? base.logos : ["Cliente A", "Cliente B", "Cliente C"],
    };
  }

  if (type === "footer-section") {
    return {
      ...base,
      text: base.text || `© ${new Date().getFullYear()} Todos os direitos reservados.`,
      social_media: Array.isArray(base.social_media) ? base.social_media : [],
    };
  }

  return base;
}

function sanitizeCandidate(raw) {
  const rawSections = Array.isArray(raw?.sections) ? raw.sections : [];
  const normalizedRaw = rawSections
    .map((section) => ({ ...section, type: normalizeSectionType(section?.type) }))
    .filter((section) => isAllowedSection(section.type));

  const deduped = [];
  const seen = new Set();
  for (const section of normalizedRaw) {
    const allowMultiple = section.type === "testimonial-slider" || section.type === "feature-grid";
    if (!allowMultiple && seen.has(section.type)) continue;
    seen.add(section.type);
    deduped.push(section);
  }

  const safeColors = raw?.colors && typeof raw.colors === "object"
    ? raw.colors
    : { primary: "#2563eb", secondary: "#0f172a", accent: "#14b8a6" };

  return {
    colors: safeColors,
    sections: deduped.map((section) => applySectionDefaults(section)),
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

function validateSiteQuality(site, { category, mustHave, userPrompt, planner }) {
  const issues = [];
  if (!site || typeof site !== "object") issues.push("JSON final ausente.");
  if (!Array.isArray(site?.sections) || site.sections.length === 0) issues.push("Sem secoes no site.");

  const sectionTypes = Array.isArray(site?.sections)
    ? site.sections.map((s) => normalizeSectionType(s?.type)).filter(Boolean)
    : [];

  if (sectionTypes.some((t) => !isAllowedSection(t))) {
    issues.push("Existem section types nao permitidos.");
  }

  const minSections = getMinSectionsByCategory(category);
  if (sectionTypes.length < minSections) {
    issues.push(`Quantidade de secoes insuficiente. Minimo esperado: ${minSections}.`);
  }

  const requiredTypes = categoryRequiredSections(category);
  for (const t of requiredTypes) {
    if (!sectionTypes.includes(t)) issues.push(`Secao obrigatoria ausente: ${t}.`);
  }

  const serial = JSON.stringify(site).toLowerCase();
  if (serial.includes("__")) issues.push("Ha placeholders nao resolvidos (__...).");
  if (serial.includes("lorem ipsum")) issues.push("Texto generico detectado (lorem ipsum).");

  const mustCover = Array.isArray(planner?.must_cover_items) && planner.must_cover_items.length > 0
    ? planner.must_cover_items
    : mustHave;
  const tokens = extractKeywords(`${mustCover.join(" ")} ${userPrompt || ""}`);
  const missingTokenHits = [];
  for (const token of tokens.slice(0, 30)) {
    if (!serial.includes(token)) missingTokenHits.push(token);
  }
  if (missingTokenHits.length > 10) {
    issues.push(`Cobertura do briefing insuficiente. Tokens ausentes: ${missingTokenHits.slice(0, 12).join(", ")}.`);
  }

  const uniqueTypes = new Set(sectionTypes);
  if (uniqueTypes.size < Math.min(4, minSections - 1)) {
    issues.push("Pouca variacao de secoes (estrutura muito repetitiva).");
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

function buildPlannerFallback({ category, mustHave }) {
  const required = categoryRequiredSections(category);
  return {
    objective: "converter visitantes em leads/clientes",
    target_audience: "publico-alvo do briefing",
    tone: "profissional",
    required_sections: required,
    section_briefs: required.map((t) => ({ type: t, goal: `cumprir papel da secao ${t}`, must_include: [] })),
    must_cover_items: mustHave,
    conversion_flow: "descoberta -> prova -> oferta -> acao",
    style_guardrails: {
      palette_notes: "paleta coerente com nicho",
      layout_notes: "hierarquia clara e escaneavel",
      copy_notes: "texto especifico para o negocio",
    },
  };
}

function sentenceCase(text) {
  const s = String(text || "").trim();
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function truncate(text, max = 70) {
  const s = String(text || "").trim();
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1)}…`;
}

function deriveBrand(userPrompt) {
  const words = extractKeywords(userPrompt).slice(0, 2);
  if (!words.length) return "Sua Marca";
  return words.map((w) => sentenceCase(w)).join(" ");
}

function buildHeuristicSite({ userPrompt, category, templateBlueprint, planner, mustHave }) {
  const brand = deriveBrand(userPrompt);
  const intent = truncate(userPrompt, 120);
  const required = Array.isArray(planner?.required_sections) && planner.required_sections.length
    ? planner.required_sections.map((s) => normalizeSectionType(s)).filter(isAllowedSection)
    : categoryRequiredSections(category);

  const sections = required.map((type) => {
    if (type === "hero") {
      return {
        type,
        headline: `${brand}: solução feita para ${extractKeywords(userPrompt)[0] || "seu negócio"}`,
        subheadline: truncate(intent, 150),
        cta: "Quero começar agora",
        image_keyword: `${extractKeywords(userPrompt).slice(0, 2).join(" ") || "business"} professional`,
      };
    }
    if (type === "feature-grid") {
      return {
        type,
        title: "Diferenciais principais",
        features: (mustHave.slice(0, 4).length ? mustHave.slice(0, 4) : ["Atendimento especializado", "Processo claro", "Resultados mensuráveis", "Suporte rápido"])
          .map((item, idx) => ({
            title: truncate(sentenceCase(item), 48),
            description: `Aplicação prática para ${extractKeywords(userPrompt)[0] || "seu público"}.`,
            icon: idx % 2 === 0 ? "zap" : "shield",
          })),
      };
    }
    if (type === "testimonial-slider") {
      return {
        type,
        title: "Quem já escolheu recomenda",
        testimonials: [
          { name: "Cliente 1", role: "Empreendedora", content: "Resultado rápido e comunicação excelente.", rating: 5 },
          { name: "Cliente 2", role: "Gestor", content: "Estrutura profissional e foco real em conversão.", rating: 5 },
        ],
      };
    }
    if (type === "pricing-table") {
      return {
        type,
        title: "Planos e investimento",
        plans: [
          { name: "Essencial", price: "R$ 97", features: ["Implementação inicial", "Suporte padrão"], recommended: false, cta: "Começar" },
          { name: "Profissional", price: "R$ 297", features: ["Estratégia completa", "Suporte prioritário", "Otimização contínua"], recommended: true, cta: "Escolher plano" },
        ],
      };
    }
    if (type === "faq-section") {
      return {
        type,
        title: "Perguntas frequentes",
        items: [
          { question: "Como funciona na prática?", answer: "Você define o objetivo e nós entregamos a estrutura completa orientada a conversão." },
          { question: "Em quanto tempo fica pronto?", answer: "A versão inicial sai em minutos e pode ser refinada com ajustes iterativos." },
          { question: "Consigo personalizar depois?", answer: "Sim. Você pode editar conteúdo, estilo e domínio quando quiser." },
        ],
      };
    }
    if (type === "cta-section") {
      return {
        type,
        title: "Pronto para tirar o projeto do papel?",
        subtitle: "Clique no botão e comece sua próxima página de alta performance.",
        button_text: "Quero publicar meu site",
      };
    }
    if (type === "product-catalog") {
      return {
        type,
        title: "Produtos em destaque",
        products: [
          { name: "Produto Principal", price: "R$ 129", description: "Solução pensada para gerar resultado rápido.", image_keyword: "product premium" },
          { name: "Kit Avançado", price: "R$ 249", description: "Pacote completo para escalar seus resultados.", image_keyword: "product kit" },
          { name: "Assinatura", price: "R$ 59/mês", description: "Acesso contínuo com suporte e novidades.", image_keyword: "subscription product" },
        ],
      };
    }
    if (type === "project-gallery") {
      return {
        type,
        title: "Projetos e resultados",
        projects: [
          { title: "Projeto Destaque 1", description: "Reestruturação completa da página com foco em conversão.", image_keyword: "web project", link: "#" },
          { title: "Projeto Destaque 2", description: "Posicionamento visual e copy orientada a leads.", image_keyword: "landing page", link: "#" },
        ],
      };
    }
    if (type === "profile-header") {
      return {
        type,
        name: brand,
        bio: truncate(intent, 140),
        image_keyword: "creator portrait professional",
      };
    }
    if (type === "link-buttons") {
      return {
        type,
        links: [
          { label: "Meu principal conteúdo", url: "#", icon: "link" },
          { label: "Instagram", url: "#", icon: "instagram" },
          { label: "Contato direto", url: "#", icon: "mail" },
        ],
      };
    }
    if (type === "social-proof") {
      return {
        type,
        title: "Confiado por clientes e parceiros",
        logos: ["Cliente A", "Cliente B", "Cliente C", "Cliente D"],
      };
    }
    if (type === "navbar") {
      return {
        type,
        logo_text: brand,
        links: [{ label: "Início", url: "#inicio" }, { label: "Soluções", url: "#solucoes" }, { label: "Contato", url: "#contato" }],
        cta_text: "Falar com especialista",
      };
    }
    if (type === "footer-section") {
      return {
        type,
        text: `© ${new Date().getFullYear()} ${brand}. Todos os direitos reservados.`,
        social_media: [{ platform: "instagram", url: "#" }, { platform: "linkedin", url: "#" }],
      };
    }
    return { type };
  });

  const heuristic = {
    colors: templateBlueprint?.colors || { primary: "#2563eb", secondary: "#0f172a", accent: "#14b8a6" },
    sections,
  };

  return mergeWithBlueprint(heuristic, templateBlueprint, category);
}

async function gerarSite(prompt, templateId, generationContext = null) {
  const userPrompt = generationContext?.userPrompt || prompt || "";
  const customizations = generationContext?.customizations || "";
  const templateName = generationContext?.templateName || templateId || "template-custom";
  const category = generationContext?.templateCategory || "landing";
  const style = generationContext?.templateStyle || "profissional";
  const templatePrompt = generationContext?.templatePrompt || "";
  const mustHave = normalizeMustHave(userPrompt, customizations, generationContext?.mustHave || []);
  const templateBlueprint = getTemplateBlueprint(templateId, category);
  const variation = getVariationTokens({ templateId, userPrompt, category, style });

  const plannerSystemPrompt = `
Voce e um planner de paginas de alta conversao.
Retorne somente JSON valido, sem markdown.
`.trim();

  const plannerUserPrompt = buildPlannerPrompt({
    userPrompt,
    customizations,
    mustHave,
    category,
    templateName,
    style,
    templatePrompt,
    variation,
  });

  const plannerResult = await generateJsonWithFallback({
    systemPrompt: plannerSystemPrompt,
    userPrompt: plannerUserPrompt,
    temperature: 0.7,
  });
  const planner = plannerResult && typeof plannerResult === "object"
    ? plannerResult
    : buildPlannerFallback({ category, mustHave });

  const composerSystemPrompt = `
Voce e um gerador de JSON de sites.
Saida deve ser apenas JSON valido.
`.trim();
  const composerUserPrompt = buildComposerPrompt({
    planner,
    templateBlueprint,
    userPrompt,
    customizations,
    category,
    variation,
  });

  const composed = await generateJsonWithFallback({
    systemPrompt: composerSystemPrompt,
    userPrompt: composerUserPrompt,
    temperature: 0.95,
  });
  if (!composed) {
    return buildHeuristicSite({
      userPrompt,
      category,
      templateBlueprint,
      planner,
      mustHave,
    });
  }

  let candidate = mergeWithBlueprint(composed, templateBlueprint, category);
  let validation = validateSiteQuality(candidate, { category, mustHave, userPrompt, planner });

  if (!validation.valid) {
    const repairPrompt = buildRepairPrompt({
      issues: validation.issues,
      candidate,
      planner,
      category,
    });

    const repaired = await generateJsonWithFallback({
      systemPrompt: composerSystemPrompt,
      userPrompt: repairPrompt,
      temperature: 0.55,
    });

    if (repaired) {
      candidate = mergeWithBlueprint(repaired, templateBlueprint, category);
      validation = validateSiteQuality(candidate, { category, mustHave, userPrompt, planner });
    }
  }

  // Fallback final deterministico para nunca devolver payload incompleto.
  if (!validation.valid) {
    candidate = mergeWithBlueprint({ sections: planner.required_sections?.map((type) => ({ type })) || [], colors: templateBlueprint.colors }, templateBlueprint, category);
  }

  return candidate;
}

module.exports = { gerarSite };
