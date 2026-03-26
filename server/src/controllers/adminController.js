const { PrismaClient } = require("@prisma/client");
const { CREDIT_PACK, PLAN_DEFINITIONS } = require("../config/billing");

const prisma = new PrismaClient();

function normalizeSubdomain(value) {
  return String(value || "").toLowerCase().trim();
}

function isValidSubdomain(value) {
  return /^[a-z0-9](?:[a-z0-9-]{1,61}[a-z0-9])?$/.test(value);
}

async function listUsers(_req, res) {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      credits: true,
      planType: true,
      createdAt: true,
    },
  });

  return res.json({ success: true, users });
}

async function updateUserPlan(req, res) {
  const { userId } = req.params;
  const { planId } = req.body || {};

  const plan = PLAN_DEFINITIONS[String(planId || "").toLowerCase()];
  if (!plan) return res.status(400).json({ error: "Plano inválido." });

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      planType: plan.id,
      credits: plan.credits,
    },
  });

  return res.json({ success: true, user: updated });
}

async function addUserCredits(req, res) {
  const { userId } = req.params;
  const { amount } = req.body || {};

  const delta = Number(amount);
  if (!Number.isFinite(delta) || delta <= 0) {
    return res.status(400).json({ error: "Quantidade inválida." });
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { credits: { increment: delta } },
  });

  return res.json({ success: true, user: updated });
}

async function resetUserCredits(req, res) {
  const { userId } = req.params;
  const { planId } = req.body || {};
  const plan = PLAN_DEFINITIONS[String(planId || "").toLowerCase()];
  if (!plan) return res.status(400).json({ error: "Plano inválido." });

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      planType: plan.id,
      credits: plan.credits,
    },
  });

  return res.json({ success: true, user: updated });
}

async function listSites(_req, res) {
  const sites = await prisma.site.findMany({
    orderBy: { updated_at: "desc" },
    include: {
      user: {
        select: { email: true },
      },
    },
  });

  return res.json({ success: true, sites });
}

async function publishAdminSite(req, res) {
  const { siteId } = req.params;
  const { subdomain } = req.body || {};

  const site = await prisma.site.findFirst({ where: { id: siteId } });
  if (!site) return res.status(404).json({ error: "Site não encontrado." });

  const nextSubdomain = typeof subdomain !== "undefined" ? subdomain : site.subdomain;
  const normalizedSubdomain = normalizeSubdomain(nextSubdomain);

  if (!normalizedSubdomain || !isValidSubdomain(normalizedSubdomain)) {
    return res.status(400).json({ error: "Subdomínio inválido." });
  }

  const existingSubdomain = await prisma.site.findUnique({
    where: { subdomain: normalizedSubdomain },
  });

  if (existingSubdomain && existingSubdomain.id !== site.id) {
    return res.status(400).json({ error: "Este subdomínio já está em uso." });
  }

  const updated = await prisma.site.update({
    where: { id: site.id },
    data: {
      subdomain: normalizedSubdomain,
      is_published: true,
      published_at: new Date(),
    },
  });

  return res.json({ success: true, site: updated });
}

async function unpublishAdminSite(req, res) {
  const { siteId } = req.params;

  const updated = await prisma.site.update({
    where: { id: siteId },
    data: { is_published: false, published_at: null },
  });

  return res.json({ success: true, site: updated });
}

async function deleteAdminSite(req, res) {
  const { siteId } = req.params;

  await prisma.site.delete({ where: { id: siteId } });
  return res.json({ success: true });
}

async function listTransactions(_req, res) {
  const transactions = await prisma.paymentTransaction.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: {
        select: { email: true },
      },
    },
  });

  return res.json({ success: true, transactions });
}

function toMonthKey(date) {
  const d = new Date(date);
  return d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
}

function groupSumByKey(items, keyFn, valueFn) {
  const map = new Map();
  for (const item of items) {
    const key = keyFn(item);
    const value = valueFn(item);
    map.set(key, (map.get(key) || 0) + value);
  }
  return Array.from(map.entries()).map(([key, sum]) => ({ key, sum }));
}

async function getOverview(_req, res) {
  const totalUsers = await prisma.user.count();
  const freeUsers = await prisma.user.count({ where: { planType: "free" } });
  const proSubscribers = await prisma.user.count({ where: { planType: "pro" } });
  const annualSubscribers = await prisma.user.count({ where: { planType: "annual" } });

  const activeSubscribers = proSubscribers + annualSubscribers;
  const mrr = proSubscribers * PLAN_DEFINITIONS.pro.amount + annualSubscribers * (PLAN_DEFINITIONS.annual.amount / 12);
  const arr = mrr * 12;
  const conversionRate = totalUsers > 0 ? (activeSubscribers / totalUsers) * 100 : 0;

  return res.json({
    success: true,
    overview: {
      totalUsers,
      activeSubscribers,
      freeUsers,
      proSubscribers,
      annualSubscribers,
      mrr,
      arr,
      totalRevenue: arr,
      churnRate: 0,
      conversionRate,
    },
    catalog: {
      plans: Object.values(PLAN_DEFINITIONS),
      creditPack: CREDIT_PACK,
    },
  });
}

async function getAnalytics(_req, res) {
  const now = new Date();
  const daysBack = 30;
  const start = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

  const transactions = await prisma.paymentTransaction.findMany({
    where: { createdAt: { gte: start } },
    orderBy: { createdAt: "asc" },
    include: { user: { select: { email: true } } },
  });

  // dailyRevenue
  const dailyMap = new Map(); // yyyy-mm-dd => sum
  for (const t of transactions) {
    const d = new Date(t.createdAt);
    const key = d.toISOString().slice(0, 10);
    dailyMap.set(key, (dailyMap.get(key) || 0) + Number(t.amount || 0));
  }

  const dailyRevenue = Array.from(dailyMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, revenue]) => ({
      date: new Date(key).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      revenue,
    }));

  // Plan distribution
  const planDistribution = [
    { name: "Free", value: await prisma.user.count({ where: { planType: "free" } }), color: "#6b7280" },
    { name: "Pro", value: await prisma.user.count({ where: { planType: "pro" } }), color: "#3ECFB2" },
    { name: "Anual", value: await prisma.user.count({ where: { planType: "annual" } }), color: "#f59e0b" },
  ];

  // userGrowth (last ~6 months)
  const users = await prisma.user.findMany({
    where: { createdAt: { gte: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000) } },
    select: { createdAt: true },
  });

  const userGrowthMap = new Map();
  for (const u of users) {
    const mk = toMonthKey(u.createdAt);
    userGrowthMap.set(mk, (userGrowthMap.get(mk) || 0) + 1);
  }

  const userGrowth = Array.from(userGrowthMap.entries())
    .map(([month, users]) => ({ month, users }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // revenueByType
  const revenueByType = [
    {
      type: "Assinaturas",
      color: "#3ECFB2",
      revenue: transactions.filter((t) => t.kind === "plan").reduce((acc, t) => acc + Number(t.amount || 0), 0),
    },
    {
      type: "Créditos",
      color: "#3b82f6",
      revenue: transactions.filter((t) => t.kind === "credits").reduce((acc, t) => acc + Number(t.amount || 0), 0),
    },
  ];

  // revenueByPeriod (last 6 buckets by month)
  const byPeriod = new Map(); // monthKey => { revenue, count }
  for (const t of transactions) {
    const mk = new Date(t.createdAt).toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
    const item = byPeriod.get(mk) || { period: mk, revenue: 0, count: 0 };
    item.revenue += Number(t.amount || 0);
    item.count += 1;
    byPeriod.set(mk, item);
  }

  const revenueByPeriod = Array.from(byPeriod.values()).slice(0, 6);

  return res.json({
    success: true,
    analytics: {
      planDistribution,
      userGrowth,
      revenueByPeriod,
      revenueByType,
      dailyRevenue,
    },
  });
}

async function listWebhookLogs(_req, res) {
  try {
    const transactions = await prisma.paymentTransaction.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    const normalizeStatus = (t) => {
      const raw = String(t.status || "").toLowerCase();
      const credited = Boolean(t.credited);

      if (raw.includes("paid") || raw.includes("overpaid") || credited) return "success";
      if (raw.includes("refund")) return "resolved";
      if (raw.includes("refused") || raw.includes("chargeback") || raw.includes("prechargeback") || raw.includes("fail") || raw.includes("error"))
        return "error";
      return "pending";
    };

    const logs = transactions.map((t) => {
      const status = normalizeStatus(t);
      const kind = t.kind;

      let event_type = "payment.updated";
      if (kind === "plan") {
        if (status === "success") event_type = "subscription.created";
        if (status === "pending") event_type = "subscription.pending";
        if (status === "resolved") event_type = "subscription.refunded";
        if (status === "error") event_type = "subscription.failed";
      } else if (kind === "credits") {
        if (status === "success") event_type = "credits.added";
        if (status === "pending") event_type = "credits.pending";
        if (status === "resolved") event_type = "credits.refunded";
        if (status === "error") event_type = "credits.failed";
      }

      const payload = {
        id: t.id,
        externalId: t.externalId,
        kind: t.kind,
        planId: t.planId,
        creditsAmount: t.creditsAmount,
        quantity: t.quantity,
        amount: t.amount,
        currency: t.currency,
        paymentMethod: t.paymentMethod,
        status: t.status,
        credited: t.credited,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        raw: t.rawLastStatus || t.rawResponse || null,
      };

      const error_message =
        status === "error"
          ? String(t.rawLastStatus?.message || t.rawLastStatus?.error || t.rawLastStatus?.errors || t.status || "Erro")
          : null;

      const resolved_at = status === "resolved" ? String(t.creditedAt || t.updatedAt || t.createdAt) : null;

      return {
        id: String(t.externalId || t.id),
        event_type,
        payload,
        status,
        error_message,
        created_at: String(t.createdAt),
        resolved_at,
      };
    });

    return res.json({ success: true, logs });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao carregar logs de webhook." });
  }
}

module.exports = {
  listUsers,
  updateUserPlan,
  addUserCredits,
  resetUserCredits,
  listSites,
  publishAdminSite,
  unpublishAdminSite,
  deleteAdminSite,
  listTransactions,
  getOverview,
  getAnalytics,
  listWebhookLogs,
};

