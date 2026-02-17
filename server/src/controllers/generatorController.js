const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const aiService = require('../services/aiService');
const userService = require('../services/userService');

const createSite = async (req, res) => {
    try {
        const { prompt, userId, userEmail } = req.body;

        if (!userId || !prompt) {
            return res.status(400).json({ error: "Dados incompletos (userId ou prompt)." });
        }

        console.log(`⚡ Iniciando geração de site completo para ${userEmail || userId}...`);

        // Verifica Saldo
        const { user, custo } = await userService.verificarSaldo(userId, userEmail, prompt);

        // Gera o site completo (JSON + HTML)
        const siteCompleto = await aiService.gerarSite(prompt);

        // Desconta créditos
        await userService.descontarCreditos(userId, custo, prompt, "auto-fallback");

        console.log(`✅ Site completo gerado! Créditos restantes: ${user.credits - custo}`);

        res.json({ 
            success: true, 
            creditsSpent: custo, 
            remainingCredits: user.credits - custo,
            code: siteCompleto.jsonData,  // Metadados em JSON
            html: siteCompleto.html,      // HTML completo e funcional
            preview: siteCompleto.html    // Também deixa como preview
        });

    } catch (error) {
        console.error("❌ Erro no Controller:", error);
        if (error.message && error.message.includes("Saldo insuficiente")) {
             return res.status(403).json({ error: error.message });
        }
        res.status(500).json({ error: "Erro interno ao gerar site." });
    }
};

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
const publishSite = async (req, res) => {
  const { siteId, subdomain, userId, content, name, description } = req.body; 

  try {
    const existingSubdomain = await prisma.site.findUnique({
      where: { subdomain: subdomain.toLowerCase() }
    });

     if (existingSubdomain && existingSubdomain.id !== siteId && !siteId.startsWith('site-')) {
      return res.status(400).json({ error: "Este subdomínio já está em uso. Escolha outro." });
    }
    if (existingSubdomain && siteId.startsWith('site-')) {
        return res.status(400).json({ error: "Este subdomínio já está em uso. Escolha outro." });
    }

    let site;

    if (siteId.startsWith('site-')) {
        console.log("📝 Criando novo site no banco para publicar...");
        site = await prisma.site.create({
            data: {
                userId: userId,
                name: name || "Meu Site",
                description: description || "Landing Page",
                content: content,
                subdomain: subdomain.toLowerCase(),
                is_published: true,
                published_at: new Date()
            }
        });
    } else {
        const checkSite = await prisma.site.findUnique({ where: { id: siteId } });
        
        if (!checkSite) {
             site = await prisma.site.create({
                data: {
                    userId: userId,
                    name: name || "Meu Site",
                    description: description || "",
                    content: content,
                    subdomain: subdomain.toLowerCase(),
                    is_published: true,
                    published_at: new Date()
                }
            });
        } else {
            console.log("🔄 Atualizando site existente...");
            site = await prisma.site.update({
                where: { id: siteId },
                data: {
                    is_published: true,
                    subdomain: subdomain.toLowerCase(),
                    content: content,
                }
            });
        }
    }

    res.json({ success: true, site });

  } catch (error) {
    console.error("❌ Erro ao publicar:", error);
    res.status(500).json({ error: "Erro ao publicar site. Tente novamente." });
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