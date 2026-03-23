function clampPalette(palette = [], fallback = []) {
  const result = [...palette.filter(Boolean), ...fallback.filter(Boolean)];
  return Array.from(new Set(result)).slice(0, 3);
}

function chooseStyleFamily(analysis, profile, intent) {
  if (analysis?.styleDirectives?.wantsLuxurious) return "premium_dark";
  if (analysis?.styleDirectives?.wantsMinimal) return "minimal_editorial";
  if (intent?.generation_mode !== "site") return "product_ui";
  if (profile?.visualVariant === "portfolio") return "editorial_showcase";
  if (profile?.visualVariant === "event") return "launch_energy";
  if (profile?.visualVariant === "biolink") return "creator_social";
  if (profile?.visualVariant === "catalog") return "commerce_clean";
  return "conversion_modern";
}

function chooseFonts(styleFamily) {
  const byFamily = {
    premium_dark: ["Manrope", "DM Sans"],
    minimal_editorial: ["Instrument Serif", "Manrope"],
    editorial_showcase: ["Sora", "Space Grotesk"],
    launch_energy: ["Clash Display", "Inter"],
    creator_social: ["Poppins", "DM Sans"],
    commerce_clean: ["General Sans", "Inter"],
    product_ui: ["Geist", "Inter"],
    conversion_modern: ["Plus Jakarta Sans", "Inter"],
  };

  return byFamily[styleFamily] || byFamily.conversion_modern;
}

function chooseLayoutBehavior(styleFamily, profile, intent) {
  if (intent?.generation_mode !== "site") return "structured-app-shell";
  if (styleFamily === "premium_dark") return "layered-cinematic";
  if (styleFamily === "editorial_showcase") return "asymmetric";
  if (styleFamily === "launch_energy") return "diagonal";
  if (styleFamily === "creator_social") return "stacked-mobile";
  if (profile?.density === "high") return "modular-grid";
  return "balanced-split";
}

function choosePalette(analysis, templateBlueprint, styleFamily) {
  const fallbackByFamily = {
    premium_dark: ["#c9a962", "#09111f", "#f4efe3"],
    minimal_editorial: ["#111827", "#ffffff", "#6b7280"],
    editorial_showcase: ["#2EF0C2", "#0b0b0f", "#ffffff"],
    launch_energy: ["#8b5cf6", "#020617", "#06b6d4"],
    creator_social: ["#ec4899", "#ffffff", "#fb923c"],
    commerce_clean: ["#11998e", "#ffffff", "#38ef7d"],
    product_ui: ["#2563eb", "#0f172a", "#22c55e"],
    conversion_modern: ["#2563eb", "#0f172a", "#14b8a6"],
  };

  const requested = analysis?.styleDirectives?.requestedColors || [];
  const blueprint = [
    templateBlueprint?.colors?.primary,
    templateBlueprint?.colors?.secondary,
    templateBlueprint?.colors?.accent,
  ];

  const [primary, secondary, accent] = clampPalette(requested, [...blueprint, ...(fallbackByFamily[styleFamily] || [])]);
  return { primary, secondary, accent };
}

function buildSectionVariants(layoutBehavior, profile) {
  return {
    hero: layoutBehavior === "layered-cinematic" ? "cinematic-panel" : layoutBehavior === "diagonal" ? "diagonal-split" : layoutBehavior === "stacked-mobile" ? "compact-centered" : "split-showcase",
    cta: profile?.visualVariant === "premium" ? "glow-outline" : profile?.visualVariant === "event" ? "gradient-solid" : "solid-primary",
    cards: profile?.visualVariant === "portfolio" ? "editorial-cards" : profile?.visualVariant === "corporate" ? "soft-border" : "glass-border",
    navbar: layoutBehavior === "structured-app-shell" ? "product-nav" : "brand-nav",
  };
}

function buildUiStyle(styleFamily, analysis) {
  const base = ["rounded-xl", "strong hierarchy"];
  if (analysis?.styleDirectives?.wantsGradient) base.push("gradient surfaces");
  if (styleFamily === "premium_dark") base.push("glassmorphism", "glow accents");
  if (styleFamily === "minimal_editorial") base.push("editorial whitespace", "soft borders");
  if (styleFamily === "product_ui") base.push("dashboard cards", "clear states");
  if (styleFamily === "launch_energy") base.push("kinetic highlights", "high contrast");
  return base;
}

function createDesignBlueprint({ intent, analysis, profile, templateBlueprint }) {
  const styleFamily = chooseStyleFamily(analysis, profile, intent);
  const palette = choosePalette(analysis, templateBlueprint, styleFamily);
  const layoutBehavior = chooseLayoutBehavior(styleFamily, profile, intent);

  return {
    style: styleFamily,
    color_palette: palette,
    ui_style: buildUiStyle(styleFamily, analysis),
    layout_behavior: layoutBehavior,
    font_pair: chooseFonts(styleFamily),
    components_style: profile?.visualVariant === "portfolio" ? "showcase-custom" : "systematic-custom",
    motion_level: intent?.generation_mode === "site" ? "medium" : "low",
    section_density: profile?.density || "medium",
    section_variants: buildSectionVariants(layoutBehavior, profile),
    visual_rules: [
      "Nao repetir layout base em todos os templates",
      "Priorizar cara de marca real em vez de template genérico",
      "Usar hierarquia visual forte e secoes com ritmo",
    ],
  };
}

module.exports = {
  createDesignBlueprint,
};
