const crypto = require("crypto");

const RISEPAY_API_BASE = process.env.RISEPAY_API_BASE || "https://api.risepay.com";
const RISEPAY_CHECKOUT_PATH = process.env.RISEPAY_CHECKOUT_PATH || "/v1/checkouts";
const RISEPAY_API_TOKEN = process.env.RISEPAY_API_TOKEN || "";
const RISEPAY_WEBHOOK_SECRET = process.env.RISEPAY_WEBHOOK_SECRET || "";
const RISEPAY_SUCCESS_URL = process.env.RISEPAY_SUCCESS_URL || "";
const RISEPAY_CANCEL_URL = process.env.RISEPAY_CANCEL_URL || "";

const PLAN_CATALOG = {
  pro: { amount: 6700, currency: "BRL", description: "Plano Pro (mensal)" },
  annual: { amount: 24700, currency: "BRL", description: "Plano Anual" },
};

const CREDIT_PACK = {
  amount: 2700,
  creditsPerPack: 50,
  currency: "BRL",
};

function isConfigured() {
  return Boolean(RISEPAY_API_TOKEN);
}

function getCheckoutConfig({ kind, planId, quantity }) {
  if (kind === "credits") {
    const packs = Math.max(1, Number(quantity || 1));
    return {
      amount: CREDIT_PACK.amount * packs,
      currency: CREDIT_PACK.currency,
      description: `Compra de ${packs * CREDIT_PACK.creditsPerPack} creditos`,
      metadata: { kind: "credits", quantity: packs, credits: packs * CREDIT_PACK.creditsPerPack },
    };
  }

  const plan = PLAN_CATALOG[planId];
  if (!plan) {
    throw new Error("Plano invalido para checkout.");
  }
  return {
    amount: plan.amount,
    currency: plan.currency,
    description: plan.description,
    metadata: { kind: "subscription", planId },
  };
}

async function createCheckout({ userId, email, kind, planId, quantity }) {
  if (!isConfigured()) {
    throw new Error("Rise Pay nao configurado. Defina RISEPAY_API_TOKEN.");
  }

  const checkout = getCheckoutConfig({ kind, planId, quantity });
  const externalId = `${userId}-${Date.now()}`;

  const payload = {
    external_id: externalId,
    amount: checkout.amount,
    currency: checkout.currency,
    description: checkout.description,
    customer: {
      id: userId,
      email: email || undefined,
    },
    success_url: RISEPAY_SUCCESS_URL || undefined,
    cancel_url: RISEPAY_CANCEL_URL || undefined,
    metadata: {
      userId,
      ...checkout.metadata,
    },
  };

  const response = await fetch(`${RISEPAY_API_BASE}${RISEPAY_CHECKOUT_PATH}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RISEPAY_API_TOKEN}`,
    },
    body: JSON.stringify(payload),
  });

  const raw = await response.text();
  let data = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    data = { raw };
  }

  if (!response.ok) {
    throw new Error(data?.error || data?.message || `Erro Rise Pay (${response.status})`);
  }

  const checkoutUrl =
    data?.checkout_url ||
    data?.payment_url ||
    data?.url ||
    data?.data?.checkout_url ||
    data?.data?.url;

  if (!checkoutUrl) {
    throw new Error("Rise Pay nao retornou URL de checkout.");
  }

  return { checkoutUrl, providerPayload: data };
}

function verifyWebhookSignature(rawBody, signature) {
  if (!RISEPAY_WEBHOOK_SECRET) return true;
  if (!signature) return false;

  const expected = crypto
    .createHmac("sha256", RISEPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

module.exports = {
  isConfigured,
  createCheckout,
  verifyWebhookSignature,
};

