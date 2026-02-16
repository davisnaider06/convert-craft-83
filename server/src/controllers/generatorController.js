const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const aiService = require('../services/aiService');
const userService = require('../services/userService');

// 1. CRIA O SITE (Gera HTML)
const createSite = async (req, res) => {
    try {
        const { prompt, userId, userEmail } = req.body;

        if (!userId || !prompt) {
            return res.status(400).json({ error: "Dados incompletos (userId ou prompt)." });
        }

        console.log(`⚡ Iniciando geração HTML para ${userEmail || userId}...`);

        // Verifica Saldo
        const { user, custo } = await userService.verificarSaldo(userId, userEmail, prompt);

        // Gera o código HTML completo
        const codigoCompleto = await aiService.gerarSite(prompt);

        // Desconta créditos
        await userService.descontarCreditos(userId, custo, prompt, "auto-fallback");

        console.log(`✅ Site HTML gerado! Créditos restantes: ${user.credits - custo}`);

        res.json({ 
            success: true, 
            creditsSpent: custo, 
            remainingCredits: user.credits - custo,
            code: codigoCompleto 
        });

    } catch (error) {
        console.error("❌ Erro no Controller:", error);
        if (error.message && error.message.includes("Saldo insuficiente")) {
             return res.status(403).json({ error: error.message });
        }
        res.status(500).json({ error: "Erro interno ao gerar site." });
    }
};

// 2. BUSCA DADOS DO USUÁRIO
const getUserData = async (req, res) => {
    try {
        const { userId } = req.params;
        const { email } = req.query; 
        const { user } = await userService.verificarSaldo(userId, email, "");
        res.json({ credits: user.credits, plan: user.planType });
    } catch (error) {
        console.error("Erro ao buscar user:", error);
        res.status(500).json({ error: error.message });
    }
};

// 3. PUBLICA O SITE (Salva o subdomínio)
const publishSite = async (req, res) => {
  // ATENÇÃO: userId vem do body (conforme enviamos no frontend)
  const { siteId, subdomain, userId } = req.body; 

  try {
    // Verifica se o subdomínio já existe (para outro site)
    const existing = await prisma.site.findUnique({
      where: { subdomain }
    });

    if (existing && existing.id !== siteId) {
      return res.status(400).json({ error: "Este subdomínio já está em uso. Escolha outro." });
    }

    // Atualiza o site
    const site = await prisma.site.update({
      where: { id: siteId },
      data: {
        is_published: true,
        subdomain: subdomain.toLowerCase(), // Sempre minúsculo
        updated_at: new Date()
      }
    });

    res.json({ success: true, site });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao publicar site." });
  }
};

// 4. LÊ O SITE PELO SUBDOMÍNIO (Público - Sem Login)
const getPublicSite = async (req, res) => {
  const { subdomain } = req.params;

  try {
    // Precisamos buscar no banco. Se não tiver 'prisma' importado, isso quebrava.
    const site = await prisma.site.findUnique({
      where: { subdomain: subdomain.toLowerCase() }
    });

    if (!site || !site.is_published) {
      // Retorna 404 json para o frontend tratar
      return res.status(404).json({ error: "Site não encontrado." });
    }

    // Retorna o objeto site inteiro (incluindo .content)
    res.json(site);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar site." });
  }
};

// EXPORTA TUDO JUNTO (Isso resolve o erro de "undefined")
module.exports = {
    createSite,
    getUserData,
    publishSite,
    getPublicSite
};