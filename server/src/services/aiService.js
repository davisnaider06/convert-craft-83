const { GoogleGenerativeAI } = require("@google/generative-ai");
const Groq = require("groq-sdk");
const { getTemplateBlueprint } = require("../utils/templates");
const { getTemplateProfile } = require("./siteGeneration/templateProfiles");
const { analyzeIntent } = require("./siteGeneration/intentAnalyzer");
const { analyzePrompt } = require("./siteGeneration/promptAnalyzer");
const { planProduct } = require("./siteGeneration/productPlanner");
const { createDesignBlueprint } = require("./siteGeneration/designEngine");
const { createFallbackBrief, buildSiteFromBrief } = require("./siteGeneration/sectionFactory");

require("dotenv").config();

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

let geminiDisabled = false;
let groqDisabled = false;

async function generateJsonWithGemini({ systemPrompt, userPrompt, temperature = 0.7 }) {
  if (!genAI || geminiDisabled) return null;

  const models = ["gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash"];
  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: "application/json",
          temperature,
        },
      });

      const result = await Promise.race([
        model.generateContent(`${systemPrompt}\n\n${userPrompt}`),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 30000)),
      ]);

      return JSON.parse(result.response.text());
    } catch (error) {
      const message = String(error?.message || error || "");
      console.warn(`[IA][Gemini ${modelName}] ${message.split("\n")[0]}`);
      if (message.includes("API_KEY_INVALID") || message.includes("API key not valid")) {
        geminiDisabled = true;
        break;
      }
    }
  }

  return null;
}

async function generateJsonWithGroq({ systemPrompt, userPrompt, temperature = 0.7 }) {
  if (!groq || groqDisabled) return null;

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
    const message = String(error?.message || error || "");
    console.warn(`[IA][Groq] ${message.split("\n")[0]}`);
    if (message.includes("Invalid API Key") || message.includes("authentication")) {
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

function buildBriefPrompt({ analysis, intent, productPlan, designSystem, profile, templateBlueprint }) {
  return `
Voce recebe um briefing de website e deve responder somente JSON valido.
Nao invente codigo HTML, CSS ou React.
Gere apenas conteudo estruturado para uma pagina de alta qualidade.

Retorne no formato:
{
  "brandName": "string",
  "brandTagline": "string",
  "navItems": [{ "label": "string", "url": "#secao" }],
  "hero": {
    "headline": "string",
    "subheadline": "string",
    "cta": "string",
    "image_keyword": "string"
  },
  "socialProof": {
    "title": "string",
    "logos": ["string"]
  },
  "featuresTitle": "string",
  "features": [{ "title": "string", "description": "string", "icon": "string" }],
  "testimonialsTitle": "string",
  "testimonials": [{ "name": "string", "role": "string", "content": "string", "rating": 5 }],
  "pricingTitle": "string",
  "plans": [{ "name": "string", "price": "R$ 000", "features": ["string"], "recommended": true, "cta": "string" }],
  "faqTitle": "string",
  "faq": [{ "question": "string", "answer": "string" }],
  "productsTitle": "string",
  "products": [{ "name": "string", "price": "R$ 000", "description": "string", "image_keyword": "string" }],
  "projectsTitle": "string",
  "projects": [{ "title": "string", "description": "string", "image_keyword": "string", "link": "#" }],
  "links": [{ "label": "string", "url": "string", "icon": "string" }],
  "profile": { "name": "string", "bio": "string", "image_keyword": "string" },
  "cta": { "title": "string", "subtitle": "string", "button_text": "string" },
  "footer": {
    "text": "string",
    "social_media": [{ "platform": "instagram", "url": "#" }]
  }
}

Regras:
- Escreva em portugues do Brasil.
- O site deve refletir fielmente o briefing.
- Se o pedido tiver cara de sistema, trate como uma apresentacao de produto real, com modulos e valor percebido claros.
- Se o prompt pedir cor, gradiente, tom ou detalhe visual, isso deve aparecer no conteudo sugerido.
- Evite textos genericos e placeholders.
- Secoes mais importantes para este template: ${profile.sectionOrder.join(", ")}.
- Linguagem esperada: ${profile.voice}.
- Varia o resultado conforme o tipo do template, nao replique a mesma estrutura textual em todos.
- Use estes itens obrigatorios do briefing sempre que fizer sentido: ${analysis.mustHave.join(" | ") || "nenhum"}.
- Keywords centrais: ${analysis.keywords.slice(0, 8).join(", ") || "nenhuma"}.
- Diretrizes visuais obrigatorias: ${JSON.stringify(analysis.styleDirectives)}.
- Classificacao de intencao: ${JSON.stringify(intent)}.
- Product planner: ${JSON.stringify(productPlan)}.
- Design system obrigatorio: ${JSON.stringify(designSystem)}.
- Blueprint do template: ${JSON.stringify(templateBlueprint)}.

Briefing do usuario:
${analysis.combinedPrompt}
`.trim();
}

function mergeBrief(baseBrief, aiBrief) {
  if (!aiBrief || typeof aiBrief !== "object") return baseBrief;

  return {
    ...baseBrief,
    ...aiBrief,
    hero: { ...(baseBrief.hero || {}), ...(aiBrief.hero || {}) },
    socialProof: { ...(baseBrief.socialProof || {}), ...(aiBrief.socialProof || {}) },
    profile: { ...(baseBrief.profile || {}), ...(aiBrief.profile || {}) },
    cta: { ...(baseBrief.cta || {}), ...(aiBrief.cta || {}) },
    footer: { ...(baseBrief.footer || {}), ...(aiBrief.footer || {}) },
  };
}

function validateGeneratedSite(site, analysis, profile) {
  if (!site || !Array.isArray(site.sections) || site.sections.length === 0) {
    return { valid: false, issues: ["Nenhuma secao gerada."] };
  }

  const issues = [];
  const serialized = JSON.stringify(site).toLowerCase();

  if (serialized.includes("__")) issues.push("Placeholders nao resolvidos.");
  if (serialized.includes("lorem ipsum")) issues.push("Placeholder lorem ipsum detectado.");

  for (const type of profile.sectionOrder.slice(0, 4)) {
    const present = site.sections.some((section) => String(section?.type || "").toLowerCase() === type);
    if (!present) issues.push(`Secao ausente: ${type}.`);
  }

  for (const type of (site.metadata?.product_plan?.sections || []).slice(0, 5)) {
    const present = site.sections.some(
      (section) => String(section?.type || "").toLowerCase() === String(type || "").toLowerCase(),
    );
    if (!present) issues.push(`Secao planejada ausente: ${type}.`);
  }

  if (analysis.styleDirectives.requestedColors.length > 0) {
    const palette = [site.colors?.primary, site.colors?.secondary, site.colors?.accent].map((item) => String(item || "").toLowerCase());
    const missingColor = analysis.styleDirectives.requestedColors.some((color) => !palette.includes(String(color).toLowerCase()));
    if (missingColor) issues.push("Cores pedidas no prompt nao foram aplicadas.");
  }

  if (analysis.styleDirectives.wantsGradient) {
    const hasGradient = String(site.metadata?.background?.type || "").toLowerCase() === "gradient";
    if (!hasGradient) issues.push("Prompt pediu gradiente e o resultado nao aplicou gradiente.");
  }

  if (analysis.mustHave.length > 0) {
    const hits = analysis.mustHave.filter((item) => serialized.includes(String(item).toLowerCase()));
    if (hits.length < Math.min(3, analysis.mustHave.length)) {
      issues.push("Baixa aderencia aos detalhes do briefing.");
    }
  }

  return { valid: issues.length === 0, issues };
}

async function gerarSite(prompt, templateId, generationContext = null) {
  const userPrompt = generationContext?.userPrompt || prompt || "";
  const customizations = generationContext?.customizations || "";
  const category = generationContext?.templateCategory || "landing";
  const style = generationContext?.templateStyle || "profissional";

  const templateBlueprint = getTemplateBlueprint(templateId, category);
  const profile = getTemplateProfile(templateId, category);
  const intent = analyzeIntent({
    prompt: userPrompt,
    customizations,
    templateId,
    category,
  });
  const analysis = analyzePrompt({
    prompt: userPrompt,
    customizations,
    templateId,
    category,
    style,
    mustHave: generationContext?.mustHave || [],
  });
  const productPlan = planProduct({
    intent,
    analysis,
    profile,
    templateBlueprint,
  });
  const designSystem = createDesignBlueprint({
    intent,
    analysis,
    profile,
    templateBlueprint,
  });

  const fallbackBrief = createFallbackBrief({
    analysis,
    profile,
    templateBlueprint,
    productPlan,
    designSystem,
  });
  const systemPrompt = "Voce e um diretor de criacao e copywriter de websites premium. Responda somente JSON valido.";
  const userBriefPrompt = buildBriefPrompt({
    analysis,
    intent,
    productPlan,
    designSystem,
    profile,
    templateBlueprint,
  });
  const aiBrief = await generateJsonWithFallback({
    systemPrompt,
    userPrompt: userBriefPrompt,
    temperature: 0.78,
  });

  const mergedBrief = mergeBrief(fallbackBrief, aiBrief);
  let site = buildSiteFromBrief({
    brief: mergedBrief,
    analysis,
    profile,
    templateBlueprint,
    productPlan,
    designSystem,
    intent,
  });

  let validation = validateGeneratedSite(site, analysis, profile);

  if (!validation.valid && aiBrief) {
    const repairPrompt = `
Corrija o briefing JSON para ficar mais aderente ao pedido do usuario.
Problemas detectados: ${validation.issues.join(" | ")}
Briefing atual: ${JSON.stringify(mergedBrief)}
Prompt original: ${analysis.combinedPrompt}
Retorne somente JSON valido com a mesma estrutura do briefing.
`.trim();

    const repairedBrief = await generateJsonWithFallback({
      systemPrompt,
      userPrompt: repairPrompt,
      temperature: 0.45,
    });

    if (repairedBrief && typeof repairedBrief === "object") {
      site = buildSiteFromBrief({
        brief: mergeBrief(fallbackBrief, repairedBrief),
        analysis,
        profile,
        templateBlueprint,
        productPlan,
        designSystem,
        intent,
      });
      validation = validateGeneratedSite(site, analysis, profile);
    }
  }

  return site;
}

module.exports = {
  gerarSite,
  // Internal helper reused by the fullstack engine (JSON-only).
  __generateJsonWithFallback: generateJsonWithFallback,
};
