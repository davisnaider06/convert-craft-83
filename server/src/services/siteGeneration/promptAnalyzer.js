const STOPWORDS = new Set([
  "para", "com", "sem", "uma", "uns", "umas", "que", "por", "dos", "das", "de", "do", "da",
  "the", "and", "you", "seu", "sua", "seus", "suas", "mais", "muito", "sobre", "como", "site", "pagina",
  "landing", "page", "home", "quero", "preciso", "crie", "criar", "gere", "gerar",
]);

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

const SECTION_HINTS = [
  ["faq-section", ["faq", "perguntas frequentes", "duvidas", "dúvidas"]],
  ["pricing-table", ["preco", "preço", "plano", "planos", "investimento", "pacotes"]],
  ["testimonial-slider", ["depoimento", "depoimentos", "prova social", "reviews"]],
  ["project-gallery", ["projeto", "projetos", "portfolio", "portfólio", "cases"]],
  ["product-catalog", ["produto", "produtos", "catalogo", "catálogo", "curso", "ebook"]],
  ["social-proof", ["clientes", "marcas", "logos", "empresas"]],
];

function uniq(arr) {
  return Array.from(new Set((arr || []).filter(Boolean)));
}

function limitText(value, max) {
  return String(value || "").trim().slice(0, max);
}

function extractKeywords(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 4 && !STOPWORDS.has(token));
}

function extractStyleDirectives(prompt, customizations) {
  const fullText = `${String(prompt || "")}\n${String(customizations || "")}`;
  const lower = fullText.toLowerCase();
  const hexMatches = fullText.match(/#[0-9a-fA-F]{6}\b/g) || [];
  const keywordColors = Object.entries(COLOR_KEYWORDS)
    .filter(([keyword]) => lower.includes(keyword))
    .map(([, color]) => color);

  return {
    requestedColors: uniq([...hexMatches, ...keywordColors]).slice(0, 3),
    wantsGradient: /\b(gradiente|gradient)\b/i.test(fullText),
    wantsDark: /\b(dark|escuro|dark mode)\b/i.test(fullText),
    wantsMinimal: /\b(minimal|minimalista|clean|limpo)\b/i.test(fullText),
    wantsLuxurious: /\b(luxo|luxuoso|premium|sofisticado)\b/i.test(fullText),
  };
}

function extractRequestedSections(text) {
  const lower = String(text || "").toLowerCase();
  return uniq(
    SECTION_HINTS.filter(([, hints]) => hints.some((hint) => lower.includes(hint))).map(([type]) => type)
  );
}

function extractBrandName(text) {
  const quoted = String(text || "").match(/["“](.+?)["”]/);
  if (quoted?.[1]) return limitText(quoted[1], 40);

  const match = String(text || "").match(/\b(?:marca|empresa|negocio|negócio|projeto|site)\s+(?:chama|chamado|chamada|é|e)\s+([A-ZÁÉÍÓÚÂÊÔÃÕÇ][\wÁÉÍÓÚÂÊÔÃÕÇ-]{1,30})/i);
  if (match?.[1]) return limitText(match[1], 40);

  return "";
}

function normalizeMustHave(prompt, customizations, mustHave) {
  const seed = Array.isArray(mustHave) ? mustHave : [];
  const promptLines = String(prompt || "").split(/[.;\n]/).map((item) => item.trim()).filter((item) => item.length > 12);
  const customLines = String(customizations || "").split(/[.;\n]/).map((item) => item.trim()).filter((item) => item.length > 12);
  return uniq([...seed, ...promptLines.slice(0, 10), ...customLines.slice(0, 10)]).slice(0, 16);
}

function analyzePrompt({ prompt, customizations, templateId, category, style, mustHave }) {
  const combined = `${String(prompt || "")}\n${String(customizations || "")}`.trim();
  const keywords = extractKeywords(combined);
  const styleDirectives = extractStyleDirectives(prompt, customizations);
  const requestedSections = extractRequestedSections(combined);
  const requiredCopy = normalizeMustHave(prompt, customizations, mustHave);
  const explicitBrand = extractBrandName(combined);

  return {
    templateId,
    category,
    style,
    combinedPrompt: combined,
    keywords,
    primaryKeyword: keywords[0] || "negocio",
    secondaryKeyword: keywords[1] || keywords[0] || "resultado",
    requestedSections,
    styleDirectives,
    mustHave: requiredCopy,
    explicitBrand,
  };
}

module.exports = {
  analyzePrompt,
  extractKeywords,
  extractStyleDirectives,
};
