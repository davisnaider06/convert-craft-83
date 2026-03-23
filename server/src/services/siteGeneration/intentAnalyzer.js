const SITE_KEYWORDS = [
  "site",
  "landing page",
  "landing",
  "pagina",
  "página",
  "portfolio",
  "portfólio",
  "bio link",
  "biolink",
];

const SYSTEM_KEYWORDS = [
  "sistema",
  "dashboard",
  "painel",
  "crm",
  "saas",
  "plataforma",
  "app",
  "aplicacao",
  "aplicação",
  "gestao",
  "gestão",
  "agendamento",
  "controle",
  "admin",
];

const AUTH_KEYWORDS = ["login", "cadastro", "autenticacao", "autenticação", "usuario", "usuário", "acesso"];
const DATA_KEYWORDS = ["banco", "dados", "registro", "crud", "listar", "editar", "deletar", "salvar", "tabela"];
const DASHBOARD_KEYWORDS = ["dashboard", "painel", "admin", "relatorio", "relatório", "metricas", "métricas"];
const PAYMENT_KEYWORDS = ["pagamento", "checkout", "pix", "boleto", "assinatura", "plano"];
const BOOKING_KEYWORDS = ["agendamento", "agenda", "horario", "horário", "reserva", "barbearia", "clinica", "clínica"];
const CRM_KEYWORDS = ["crm", "lead", "leads", "pipeline", "funil", "cliente", "clientes"];
const ECOMMERCE_KEYWORDS = ["loja", "ecommerce", "e-commerce", "produto", "produtos", "carrinho", "catalogo", "catálogo"];

function containsAny(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword));
}

function scoreComplexity(text) {
  let score = 0;
  if (containsAny(text, SYSTEM_KEYWORDS)) score += 2;
  if (containsAny(text, AUTH_KEYWORDS)) score += 2;
  if (containsAny(text, DATA_KEYWORDS)) score += 2;
  if (containsAny(text, DASHBOARD_KEYWORDS)) score += 1;
  if (containsAny(text, PAYMENT_KEYWORDS)) score += 1;

  if (score >= 5) return "alta";
  if (score >= 2) return "media";
  return "baixa";
}

function inferAppType(text, templateId, category) {
  if (containsAny(text, BOOKING_KEYWORDS)) return "agendamento";
  if (containsAny(text, CRM_KEYWORDS)) return "crm";
  if (containsAny(text, ECOMMERCE_KEYWORDS)) return "catalogo";
  if (containsAny(text, ["portfolio", "portfólio"])) return "portfolio";
  if (category === "biolink" || templateId === "biolink-influencer") return "biolink";
  if (category === "portfolio" || templateId === "portfolio-criativo") return "portfolio";
  if (category === "ecommerce" || templateId === "produto-digital") return "catalogo";
  if (containsAny(text, SYSTEM_KEYWORDS)) return "sistema-operacional";
  return "landing-page";
}

function inferGenerationMode(text, templateId, category) {
  if (containsAny(text, SYSTEM_KEYWORDS) && !containsAny(text, SITE_KEYWORDS)) {
    return "system";
  }

  if (containsAny(text, SYSTEM_KEYWORDS) && containsAny(text, SITE_KEYWORDS)) {
    return "hybrid";
  }

  if (["portfolio", "biolink", "landing", "service", "ecommerce"].includes(String(category || "").toLowerCase())) {
    return "site";
  }

  if (templateId) return "site";
  return "site";
}

function analyzeIntent({ prompt, customizations, templateId, category }) {
  const text = `${String(prompt || "")}\n${String(customizations || "")}`.toLowerCase();
  const generationMode = inferGenerationMode(text, templateId, category);
  const tipoApp = inferAppType(text, templateId, category);
  const hasAuth = generationMode !== "site" || containsAny(text, AUTH_KEYWORDS);
  const hasDatabase = generationMode !== "site" || containsAny(text, DATA_KEYWORDS) || containsAny(text, PAYMENT_KEYWORDS);
  const hasDashboard = generationMode !== "site" || containsAny(text, DASHBOARD_KEYWORDS);
  const hasCrud = generationMode !== "site" || containsAny(text, ["crud", "listar", "editar", "deletar", "cadastrar", "gerenciar"]);
  const hasPayments = containsAny(text, PAYMENT_KEYWORDS);

  return {
    tipo_app: tipoApp,
    generation_mode: generationMode,
    complexidade: scoreComplexity(text),
    tem_auth: hasAuth,
    tem_banco: hasDatabase,
    tem_dashboard: hasDashboard,
    tem_crud: hasCrud,
    tem_pagamento: hasPayments,
    needs_backend: hasAuth || hasDatabase || hasCrud || hasPayments,
    delivery_target: generationMode === "site" ? "site-estruturado" : generationMode === "hybrid" ? "site-com-app-blueprint" : "app-blueprint",
  };
}

module.exports = {
  analyzeIntent,
};
