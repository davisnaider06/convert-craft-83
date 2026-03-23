function uniq(values) {
  return Array.from(new Set((values || []).filter(Boolean)));
}

function inferEntities(intent, analysis) {
  const text = String(analysis?.combinedPrompt || "").toLowerCase();

  if (intent.tipo_app === "agendamento") {
    return ["usuarios", "servicos", "agendamentos", "profissionais"];
  }

  if (intent.tipo_app === "crm") {
    return ["usuarios", "leads", "clientes", "pipeline", "tarefas"];
  }

  if (intent.tipo_app === "catalogo") {
    return ["usuarios", "produtos", "pedidos", "pagamentos"];
  }

  if (intent.generation_mode === "system") {
    return uniq(["usuarios", "registros", "configuracoes", text.includes("relatorio") ? "relatorios" : "dashboards"]);
  }

  return ["conteudo", "provas", "cta"];
}

function inferRoles(intent) {
  if (intent.generation_mode === "site") return ["visitante"];
  if (intent.tem_auth) return ["admin", "cliente"];
  return ["admin"];
}

function inferPages(intent, profile) {
  if (intent.generation_mode === "site") {
    return uniq(["Home", ...(profile?.navLabels || []).slice(0, 3).map((label) => String(label || "").trim())]);
  }

  const base = ["Home", "Login", "Cadastro", "Dashboard"];
  if (intent.tipo_app === "agendamento") {
    return uniq([...base, "Agendamentos", "Servicos", "Admin"]);
  }
  if (intent.tipo_app === "crm") {
    return uniq([...base, "Leads", "Clientes", "Pipeline", "Admin"]);
  }
  if (intent.tipo_app === "catalogo") {
    return uniq([...base, "Produtos", "Pedidos", "Checkout", "Admin"]);
  }
  return uniq([...base, "Registros", "Configuracoes", "Admin"]);
}

function inferFeatures(intent, analysis) {
  const requested = analysis?.requestedSections || [];
  const features = [];

  if (intent.tem_auth) features.push("autenticacao");
  if (intent.tem_crud) features.push("crud_principal");
  if (intent.tem_dashboard) features.push("painel_resumo");
  if (intent.tem_pagamento) features.push("pagamentos");
  if (intent.tipo_app === "agendamento") features.push("agendamento_horario", "cancelamento");
  if (intent.tipo_app === "crm") features.push("gestao_leads", "pipeline_comercial");
  if (intent.tipo_app === "catalogo") features.push("catalogo_produtos", "checkout_oferta");
  if (requested.includes("pricing-table")) features.push("bloco_de_planos");
  if (requested.includes("testimonial-slider")) features.push("prova_social");

  return uniq(features);
}

function inferSections(intent, profile, analysis) {
  if (intent.generation_mode === "site") {
    return uniq([...(profile?.sectionOrder || []), ...(analysis?.requestedSections || [])]);
  }

  return uniq([
    "navbar",
    "hero",
    "feature-grid",
    "social-proof",
    "cta-section",
    ...(analysis?.requestedSections || []),
  ]);
}

function inferFlows(intent) {
  if (intent.generation_mode === "site") {
    return ["descoberta", "prova", "conversao"];
  }

  if (intent.tipo_app === "agendamento") {
    return ["cadastro", "login", "agendar_horario", "acompanhar_agendamento", "gestao_admin"];
  }

  if (intent.tipo_app === "crm") {
    return ["captura_lead", "qualificacao", "movimentacao_pipeline", "gestao_admin"];
  }

  if (intent.tipo_app === "catalogo") {
    return ["explorar_produtos", "checkout", "acompanhar_pedido", "gestao_admin"];
  }

  return ["cadastro", "login", "dashboard", "operacao_principal"];
}

function inferDatabaseSchema(intent, entities, roles) {
  if (intent.generation_mode === "site") return [];

  return entities.map((entity) => {
    if (entity === "usuarios") {
      return {
        table: "usuarios",
        fields: [
          { name: "id", type: "uuid", primary: true },
          { name: "email", type: "text", unique: true },
          { name: "nome", type: "text" },
          { name: "role", type: "enum", values: roles },
          { name: "created_at", type: "timestamp", default: "now()" },
        ],
      };
    }

    if (entity === "agendamentos") {
      return {
        table: "agendamentos",
        fields: [
          { name: "id", type: "uuid", primary: true },
          { name: "usuario_id", type: "uuid", references: "usuarios.id" },
          { name: "profissional_id", type: "uuid", references: "profissionais.id" },
          { name: "servico_id", type: "uuid", references: "servicos.id" },
          { name: "data_hora", type: "timestamp" },
          { name: "status", type: "text" },
        ],
      };
    }

    if (entity === "leads") {
      return {
        table: "leads",
        fields: [
          { name: "id", type: "uuid", primary: true },
          { name: "nome", type: "text" },
          { name: "email", type: "text" },
          { name: "etapa", type: "text" },
          { name: "responsavel_id", type: "uuid", references: "usuarios.id" },
        ],
      };
    }

    if (entity === "produtos") {
      return {
        table: "produtos",
        fields: [
          { name: "id", type: "uuid", primary: true },
          { name: "nome", type: "text" },
          { name: "preco", type: "numeric" },
          { name: "descricao", type: "text" },
          { name: "ativo", type: "boolean", default: true },
        ],
      };
    }

    return {
      table: entity,
      fields: [
        { name: "id", type: "uuid", primary: true },
        { name: "nome", type: "text" },
        { name: "created_at", type: "timestamp", default: "now()" },
      ],
    };
  });
}

function inferBackendLogic(intent) {
  if (intent.generation_mode === "site") return [];

  const logic = ["protecao_de_rota", "validacao_de_payload", "controle_de_permissao_por_role"];
  if (intent.tem_auth) logic.push("login", "registro", "logout");
  if (intent.tem_crud) logic.push("criar", "listar", "editar", "deletar");
  if (intent.tem_dashboard) logic.push("metricas_resumo");
  if (intent.tem_pagamento) logic.push("checkout", "confirmacao_pagamento");
  if (intent.tipo_app === "agendamento") logic.push("reserva_de_horario", "cancelamento", "bloqueio_de_conflito");
  if (intent.tipo_app === "crm") logic.push("movimentacao_de_pipeline", "atribuicao_de_lead");
  return uniq(logic);
}

function inferFrontendBlueprint(intent, pages, features) {
  if (intent.generation_mode === "site") return [];

  return pages.map((page) => ({
    page,
    purpose:
      page === "Dashboard"
        ? "visao geral do negocio"
        : page === "Admin"
          ? "gestao administrativa"
          : page === "Login"
            ? "autenticacao"
            : page === "Cadastro"
              ? "criacao de conta"
              : "fluxo operacional",
    blocks: uniq([
      page === "Dashboard" ? "cards-resumo" : null,
      page === "Dashboard" ? "tabela-recente" : null,
      features.includes("crud_principal") ? "listagem" : null,
      features.includes("crud_principal") ? "formulario" : null,
    ]),
  }));
}

function planProduct({ intent, analysis, profile, templateBlueprint }) {
  const entities = inferEntities(intent, analysis);
  const roles = inferRoles(intent);
  const pages = inferPages(intent, profile);
  const features = inferFeatures(intent, analysis);
  const sections = inferSections(intent, profile, analysis);
  const flows = inferFlows(intent);
  const database_schema = inferDatabaseSchema(intent, entities, roles);
  const backend_logic = inferBackendLogic(intent);
  const frontend_blueprint = inferFrontendBlueprint(intent, pages, features);

  return {
    output_mode: intent.generation_mode === "site" ? "site" : intent.generation_mode === "hybrid" ? "hybrid" : "system-blueprint",
    entities,
    roles,
    pages,
    features,
    sections,
    user_flows: flows,
    database_schema,
    backend_logic,
    frontend_blueprint,
    data_model_complexity: intent.complexidade,
    backend_required: intent.needs_backend,
    template_constraints: {
      template_id: profile?.id || null,
      section_order: profile?.sectionOrder || templateBlueprint?.sections?.map((section) => section.type) || [],
    },
  };
}

module.exports = {
  planProduct,
};
