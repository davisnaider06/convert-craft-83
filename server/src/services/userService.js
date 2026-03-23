const { PrismaClient } = require("@prisma/client");
const { CREDIT_PACK, PLAN_DEFINITIONS } = require("../config/billing");

const prisma = new PrismaClient();

async function ensureUser(userId, email) {
  let user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        id: userId,
        email: email || `${userId}@no-email.local`,
        credits: PLAN_DEFINITIONS.free.credits,
      },
    });
    return user;
  }

  if (email && user.email !== email) {
    user = await prisma.user.update({
      where: { id: userId },
      data: { email },
    });
  }

  return user;
}

async function verificarSaldo(userId, email, prompt) {
  const user = await ensureUser(userId, email);

  let custo = 1;
  const palavrasCaras = ["dashboard", "sistema", "login", "loja", "saas"];
  const normalizedPrompt = String(prompt || "").toLowerCase();
  if (palavrasCaras.some((w) => normalizedPrompt.includes(w))) custo += 2;
  if (String(prompt || "").length > 200) custo += 1;

  if (user.credits < custo) {
    throw new Error(`Saldo insuficiente. Você tem ${user.credits}, mas precisa de ${custo}.`);
  }

  return { user, custo };
}

async function descontarCreditos(userId, custo, prompt, modelUsed) {
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { credits: { decrement: custo } },
    }),
    prisma.generationLog.create({
      data: { userId, cost: custo, prompt, modelUsed },
    }),
  ]);
}

async function applyPlanPurchase(userId, planId) {
  const plan = PLAN_DEFINITIONS[planId];
  if (!plan || plan.id === "free") {
    throw new Error("Plano inválido para ativação.");
  }

  return prisma.user.update({
    where: { id: userId },
    data: {
      planType: plan.id,
      credits: {
        set: Math.max(plan.credits, 0),
      },
    },
  });
}

async function applyCreditPackPurchase(userId, quantity) {
  const packs = Math.max(CREDIT_PACK.minQuantity, Math.min(CREDIT_PACK.maxQuantity, Number(quantity || 1)));
  const totalCredits = packs * CREDIT_PACK.creditsPerPack;

  return prisma.user.update({
    where: { id: userId },
    data: {
      credits: {
        increment: totalCredits,
      },
    },
  });
}

module.exports = {
  applyCreditPackPurchase,
  applyPlanPurchase,
  descontarCreditos,
  ensureUser,
  prisma,
  verificarSaldo,
};
