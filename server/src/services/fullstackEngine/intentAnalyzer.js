const { analyzeIntent: legacyAnalyzeIntent } = require("../siteGeneration/intentAnalyzer");

/**
 * Fullstack Intent Analyzer
 * Input: { user_prompt: string }
 * Output (required by spec):
 * - tipo_app
 * - complexidade
 * - precisa_auth
 * - precisa_banco
 * - precisa_dashboard
 */
function analyzeIntent({ user_prompt }) {
  const prompt = String(user_prompt || "").trim();
  if (!prompt) {
    throw new Error("user_prompt é obrigatório.");
  }

  // Reuse current heuristic analyzer as a baseline.
  const legacy = legacyAnalyzeIntent({
    prompt,
    customizations: "",
    templateId: null,
    category: "system",
  });

  return {
    tipo_app: legacy.tipo_app,
    complexidade: legacy.complexidade,
    precisa_auth: Boolean(legacy.tem_auth),
    precisa_banco: Boolean(legacy.tem_banco),
    precisa_dashboard: Boolean(legacy.tem_dashboard),
  };
}

module.exports = { analyzeIntent };

