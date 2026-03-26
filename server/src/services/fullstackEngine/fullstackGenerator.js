const crypto = require("crypto");
const path = require("path");
const fs = require("fs/promises");

const { generateJson } = require("./llmJson");

function stableId() {
  return crypto.randomBytes(12).toString("hex");
}

function ensurePosix(p) {
  return String(p || "").replace(/\\/g, "/").replace(/^\/+/, "");
}

function validateFileManifest(files) {
  if (!Array.isArray(files) || files.length === 0) {
    throw new Error("File manifest vazio.");
  }
  for (const f of files) {
    if (!f || typeof f !== "object") throw new Error("Item de arquivo inválido.");
    if (!f.path || typeof f.path !== "string") throw new Error("Arquivo sem path.");
    if (typeof f.content !== "string") throw new Error(`Arquivo ${f.path} sem content string.`);
  }
}

function buildGeneratorPrompt({ user_prompt, intent, product_plan, design_system }) {
  return `
Você é uma engine de geração de aplicações full-stack.
Gere UM PROJETO COMPLETO usando: Next.js (App Router) + TypeScript + Tailwind + Supabase + PostgreSQL.

Regras críticas:
- Não gere layout genérico. Use identidade visual forte baseada no design_system.
- Sempre incluir autenticação (Supabase Auth) quando precisa_auth=true.
- Sempre incluir banco e CRUD quando precisa_banco=true.
- Implementar permissões: user vê só seus dados; admin vê tudo (RLS + roles).
- Código modular em /app /components /lib /hooks /services /types.
- Sempre incluir loading/error states, forms conectados e dashboard funcional.
- Incluir animações/microinterações (Framer Motion) em pontos-chave do UI.

Saída obrigatória: JSON válido no formato:
{
  "project_structure": ["string paths..."],
  "design_system": <echo do design_system>,
  "database_schema_sql": "string SQL completo",
  "backend_logic": {
    "supabase": {
      "rls_policies": ["..."],
      "queries_examples": ["..."]
    },
    "api_routes": ["..."]
  },
  "frontend_code": {
    "key_pages": ["..."],
    "components": ["..."]
  },
  "files": [
    { "path": "app/layout.tsx", "content": "..." }
  ]
}

Contexto:
user_prompt: ${JSON.stringify(user_prompt)}
intent: ${JSON.stringify(intent)}
product_plan: ${JSON.stringify(product_plan)}
design_system: ${JSON.stringify(design_system)}

Detalhes obrigatórios do Supabase:
- Incluir "lib/supabase/server.ts" e "lib/supabase/client.ts"
- Incluir exemplo de "middleware.ts" para proteger rotas
- Incluir serviços em "services/*" para cada entidade (CRUD)
- Incluir tipos em "types/*"

SQL:
- Usar "uuid" com default "gen_random_uuid()"
- Tabelas com "created_at", "updated_at"
- Incluir tabela "profiles" ligada ao auth.users
- Incluir enums quando necessário
- Incluir RLS habilitado e policies completas
`.trim();
}

async function generateFullstackApp({ user_prompt, intent, product_plan, design_system, persistToDisk = false }) {
  const systemPrompt =
    "Você responde somente JSON válido. Não inclua markdown. Não inclua texto fora do JSON.";
  const userPrompt = buildGeneratorPrompt({ user_prompt, intent, product_plan, design_system });

  const result = await generateJson({
    systemPrompt,
    userPrompt,
    temperature: 0.35,
  });

  validateFileManifest(result.files);

  const appId = stableId();
  let savedTo = null;

  if (persistToDisk) {
    const baseDir =
      process.env.GENERATED_APPS_DIR ||
      path.resolve(__dirname, "..", "..", "..", "generated-apps");
    const dir = path.resolve(baseDir, appId);
    await fs.mkdir(dir, { recursive: true });

    for (const f of result.files) {
      const rel = ensurePosix(f.path);
      const abs = path.resolve(dir, rel);
      await fs.mkdir(path.dirname(abs), { recursive: true });
      await fs.writeFile(abs, f.content, "utf8");
    }

    savedTo = dir;
  }

  return {
    id: appId,
    savedTo,
    ...result,
  };
}

module.exports = { generateFullstackApp };

