const { createDesignBlueprint } = require("../siteGeneration/designEngine");
const { analyzePrompt } = require("../siteGeneration/promptAnalyzer");
const { analyzeIntent: legacyAnalyzeIntent } = require("../siteGeneration/intentAnalyzer");

/**
 * Design Engine (critical)
 * Generates a varied design system (non-generic) for the generated app.
 *
 * Output (required by spec):
 * {
 *   style: string,
 *   color_palette: {},
 *   typography: {},
 *   ui_patterns: [],
 *   layout_strategy: string
 * }
 */
function createDesignSystem({ user_prompt, intent }) {
  const prompt = String(user_prompt || "");

  // Reuse existing prompt analysis + blueprint generator, but map to the required format.
  const analysis = analyzePrompt({
    prompt,
    customizations: "",
    templateId: null,
    category: "system",
    style: "produto",
    mustHave: [],
  });

  const legacyIntent = legacyAnalyzeIntent({
    prompt,
    customizations: "",
    templateId: null,
    category: "system",
  });

  const blueprint = createDesignBlueprint({
    intent: { ...legacyIntent, generation_mode: "system" },
    analysis,
    profile: {
      id: "fullstack-app",
      voice: "produto",
      density: "high",
      visualVariant: "product",
      sectionOrder: ["navbar", "hero", "feature-grid", "cta-section"],
    },
    templateBlueprint: { colors: {} },
  });

  const [heading, body] = blueprint.font_pair || ["Inter", "Inter"];

  return {
    style: blueprint.style,
    color_palette: blueprint.color_palette,
    typography: {
      headingFont: heading,
      bodyFont: body,
      scale: "fluid-typography",
    },
    ui_patterns: [
      ...(blueprint.ui_style || []),
      `components:${blueprint.components_style}`,
      `motion:${blueprint.motion_level}`,
      `layout:${blueprint.layout_behavior}`,
      ...(blueprint.visual_rules || []),
    ],
    layout_strategy: blueprint.layout_behavior,
  };
}

module.exports = { createDesignSystem };

