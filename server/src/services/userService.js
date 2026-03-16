// src/services/userService.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verificarSaldo(userId, email, prompt) {
    // 1. Lazy Registration (Cria se não existe)
    let user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user) {
        user = await prisma.user.create({
            data: { id: userId, email: email, credits: 15 } // 15 grátis
        });
    }

    // 2. Calcular Custo Dinâmico
    let custo = 1;
    const palavrasCaras = ['dashboard', 'sistema', 'login', 'loja', 'saas'];
    if (palavrasCaras.some(w => prompt.toLowerCase().includes(w))) custo += 2;
    if (prompt.length > 200) custo += 1;

    // 3. Verificar se pode pagar
    if (user.credits < custo) {
        throw new Error(`Saldo insuficiente. Você tem ${user.credits}, mas precisa de ${custo}.`);
    }

    return { user, custo };
}

async function descontarCreditos(userId, custo, prompt, modelUsed) {
    // Desconta e cria Log de transação
    await prisma.$transaction([
        prisma.user.update({
            where: { id: userId },
            data: { credits: { decrement: custo } }
        }),
        prisma.generationLog.create({
            data: { userId, cost: custo, prompt, modelUsed }
        })
    ]);
}

async function creditarCreditos(userId, quantidade, reason = "manual") {
    if (!quantidade || Number(quantidade) <= 0) return;
    await prisma.user.upsert({
        where: { id: userId },
        update: { credits: { increment: Number(quantidade) } },
        create: { id: userId, email: `${userId}@placeholder.local`, credits: Number(quantidade) },
    });

    // Opcional: guardar log simples como generationLog sem prompt real
    await prisma.generationLog.create({
        data: { userId, cost: 0, prompt: `CREDITO +${quantidade} (${reason})`, modelUsed: "payment-webhook" }
    });
}

module.exports = { verificarSaldo, descontarCreditos, creditarCreditos };
