const { analyzeIntent } = require("../services/fullstackEngine/intentAnalyzer");
const { planProduct } = require("../services/fullstackEngine/productPlanner");
const { createDesignSystem } = require("../services/fullstackEngine/designEngine");
const { generateFullstackApp } = require("../services/fullstackEngine/fullstackGenerator");

function getAuthenticatedUserId(req) {
  return req?.auth?.userId || null;
}

async function generate(req, res) {
  try {
    const userId = getAuthenticatedUserId(req);
    if (!userId) return res.status(401).json({ error: "Nao autenticado." });

    const { user_prompt, persist } = req.body || {};
    if (!user_prompt || typeof user_prompt !== "string") {
      return res.status(400).json({ error: "Campo obrigatório: user_prompt (string)." });
    }

    const intent = analyzeIntent({ user_prompt });
    const product_plan = planProduct({ intent, user_prompt });
    const design_system = createDesignSystem({ user_prompt, intent });

    const generated = await generateFullstackApp({
      user_prompt,
      intent,
      product_plan,
      design_system,
      persistToDisk: Boolean(persist),
    });

    return res.json({
      success: true,
      id: generated.id,
      savedTo: generated.savedTo,
      design_system: generated.design_system || design_system,
      database_schema_sql: generated.database_schema_sql,
      backend_logic: generated.backend_logic,
      frontend_code: generated.frontend_code,
      project_structure: generated.project_structure,
      files: generated.files,
      intent,
      product_plan,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Falha ao gerar aplicação fullstack." });
  }
}

module.exports = { generate };

