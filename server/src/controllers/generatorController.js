const aiService = require('../services/aiService');
const userService = require('../services/userService');

exports.createSite = async (req, res) => {
    try {
        const { prompt, userId, userEmail } = req.body;

        if (!userId || !prompt) {
            return res.status(400).json({ error: "Dados incompletos (userId ou prompt)." });
        }

        console.log(`⚡ Iniciando geração HTML para ${userEmail || userId}...`);

        // 1. Verifica Saldo
        const { user, custo } = await userService.verificarSaldo(userId, userEmail, prompt);

        // 2. Gera o código HTML completo (O aiService já monta tudo)
        const codigoCompleto = await aiService.gerarSite(prompt);

        // 3. Desconta créditos
        await userService.descontarCreditos(userId, custo, prompt, "auto-fallback");

        console.log(`✅ Site HTML gerado! Créditos restantes: ${user.credits - custo}`);

        // AQUI ESTAVA O ERRO: Não adicionamos mais nada, mandamos o código puro.
        res.json({ 
            success: true, 
            creditsSpent: custo, 
            remainingCredits: user.credits - custo,
            code: codigoCompleto 
        });

    } catch (error) {
        console.error("❌ Erro no Controller:", error);
        if (error.message.includes("Saldo insuficiente")) {
             return res.status(403).json({ error: error.message });
        }
        res.status(500).json({ error: "Erro interno ao gerar site." });
    }
};

exports.getUserData = async (req, res) => {
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