/**
 * Product Planner
 * Input: { intent, user_prompt }
 * Output:
 * { entities: [], roles: [], pages: [], features: [], actions: [] }
 */
function planProduct({ intent, user_prompt }) {
  const prompt = String(user_prompt || "").toLowerCase();

  const baseRoles = intent.precisa_auth ? ["admin", "user"] : ["admin"];
  const basePages = intent.precisa_auth
    ? ["login", "cadastro", "dashboard"]
    : ["dashboard"];

  if (intent.tipo_app === "agendamento") {
    return {
      entities: ["profiles", "services", "staff", "appointments"],
      roles: baseRoles,
      pages: [...basePages, "agendamentos", "servicos", "equipe", "configuracoes"],
      features: [
        "auth",
        "rbac",
        "crud",
        "dashboard",
        "availability",
        "conflict-prevention",
      ],
      actions: [
        "appointments.create",
        "appointments.list",
        "appointments.update_status",
        "appointments.cancel",
        "services.crud",
        "staff.crud",
        "dashboard.metrics",
      ],
    };
  }

  if (intent.tipo_app === "crm") {
    return {
      entities: ["profiles", "leads", "customers", "pipeline_stages", "tasks"],
      roles: baseRoles,
      pages: [...basePages, "leads", "clientes", "pipeline", "tarefas", "configuracoes"],
      features: ["auth", "rbac", "crud", "dashboard", "pipeline"],
      actions: [
        "leads.crud",
        "pipeline.move_lead",
        "tasks.crud",
        "dashboard.metrics",
      ],
    };
  }

  // generic "system"
  const wantsPayments = prompt.includes("pagamento") || prompt.includes("checkout") || prompt.includes("assinatura");
  return {
    entities: ["profiles", "items"],
    roles: baseRoles,
    pages: [...basePages, "itens", "configuracoes"],
    features: ["auth", "rbac", "crud", ...(wantsPayments ? ["payments"] : [])],
    actions: ["items.crud", "dashboard.metrics"],
  };
}

module.exports = { planProduct };

