const crypto = require("crypto");

const RISEPAY_API_BASE = process.env.RISEPAY_API_BASE || "https://api.risepay.com.br";
const RISEPAY_CHECKOUT_PATH = process.env.RISEPAY_CHECKOUT_PATH || "/api/External/Transactions";
const RISEPAY_API_TOKEN = process.env.RISEPAY_API_TOKEN || "";
const RISEPAY_WEBHOOK_SECRET = process.env.RISEPAY_WEBHOOK_SECRET || "";
const RISEPAY_SUCCESS_URL = process.env.RISEPAY_SUCCESS_URL || "";
const RISEPAY_CANCEL_URL = process.env.RISEPAY_CANCEL_URL || "";
const RISEPAY_PAYMENT_METHOD = String(process.env.RISEPAY_PAYMENT_METHOD || "pix").toLowerCase();
const RISEPAY_PIX_EXPIRES_HOURS = Number(process.env.RISEPAY_PIX_EXPIRES_HOURS || 48);
const RISEPAY_CUSTOMER_CPF = process.env.RISEPAY_CUSTOMER_CPF || "";
const RISEPAY_CUSTOMER_PHONE = process.env.RISEPAY_CUSTOMER_PHONE || "";

function createRisePayError(message, extra = {}) {
  const error = new Error(message);
  Object.assign(error, extra);
  return error;
}

const PLAN_CATALOG = {
  pro: { amount: 67, currency: "BRL", description: "Plano Pro (mensal)" },
  annual: { amount: 247, currency: "BRL", description: "Plano Anual" },
};

const CREDIT_PACK = {
  amount: 27,
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

function sanitizeCpf(value) {
  return String(value || "").replace(/\D/g, "");
}

function sanitizePhone(value) {
  return String(value || "").replace(/[^\d+]/g, "");
}

function buildCustomer({ userId, email, name, cpf, phone }) {
  const normalizedName = String(name || "").trim() || (email ? String(email).split("@")[0] : `Cliente ${userId}`);
  const normalizedEmail = String(email || "").trim();
  const normalizedCpf = sanitizeCpf(cpf || RISEPAY_CUSTOMER_CPF);
  const normalizedPhone = sanitizePhone(phone || RISEPAY_CUSTOMER_PHONE);

  if (!normalizedEmail) {
    throw createRisePayError("Rise Pay exige email do cliente para criar a transacao.", {
      code: "RISEPAY_MISSING_CUSTOMER_EMAIL",
    });
  }

  if (!normalizedCpf) {
    throw createRisePayError("Rise Pay exige CPF do cliente para criar a transacao.", {
      code: "RISEPAY_MISSING_CUSTOMER_CPF",
    });
  }

  if (!normalizedPhone) {
    throw createRisePayError("Rise Pay exige telefone do cliente para criar a transacao.", {
      code: "RISEPAY_MISSING_CUSTOMER_PHONE",
    });
  }

  return {
    name: normalizedName,
    email: normalizedEmail,
    cpf: normalizedCpf,
    phone: normalizedPhone,
  };
}

async function performRisePayRequest(payload) {
  const response = await fetch(`${RISEPAY_API_BASE}${RISEPAY_CHECKOUT_PATH}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: RISEPAY_API_TOKEN,
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

  return { response, data };
}

function buildPayloadVariants({ checkout, externalId, customer, userId }) {
  const paymentBase = { method: RISEPAY_PAYMENT_METHOD };
  if (RISEPAY_PAYMENT_METHOD === "pix") {
    paymentBase.expiresAt = RISEPAY_PIX_EXPIRES_HOURS;
  }

  return [
    {
      label: "full",
      payload: {
        amount: checkout.amount,
        currency: checkout.currency,
        externalReference: externalId,
        postBackUrl: RISEPAY_SUCCESS_URL || undefined,
        payment: paymentBase,
        customer,
        metadata: {
          userId,
          ...checkout.metadata,
          cancelUrl: RISEPAY_CANCEL_URL || undefined,
        },
      },
    },
    {
      label: "minimal-with-currency",
      payload: {
        amount: checkout.amount,
        currency: checkout.currency,
        payment: paymentBase,
        customer,
      },
    },
    {
      label: "minimal-no-currency",
      payload: {
        amount: checkout.amount,
        payment: paymentBase,
        customer,
      },
    },
    {
      label: "formatted-customer",
      payload: {
        amount: checkout.amount,
        payment: paymentBase,
        customer: {
          name: customer.name,
          email: customer.email,
          cpf: String(customer.cpf || ""),
          phone: String(customer.phone || ""),
        },
      },
    },
  ];
}

async function createCheckout({ userId, email, name, cpf, phone, kind, planId, quantity }) {
  if (!isConfigured()) {
    throw createRisePayError("Rise Pay nao configurado. Defina RISEPAY_API_TOKEN.", {
      code: "RISEPAY_MISSING_CONFIG",
    });
  }

  const checkout = getCheckoutConfig({ kind, planId, quantity });
  const externalId = `${userId}-${Date.now()}`;
  const customer = buildCustomer({ userId, email, name, cpf, phone });
  const payloadVariants = buildPayloadVariants({ checkout, externalId, customer, userId });

  let data = null;
  let successfulPayload = null;
  let lastError = null;

  for (const attempt of payloadVariants) {
    const { response, data: responseData } = await performRisePayRequest(attempt.payload);
    if (response.ok) {
      data = responseData;
      successfulPayload = attempt.payload;
      break;
    }

    lastError = {
      label: attempt.label,
      status: response.status,
      providerPayload: responseData,
      requestPayload: attempt.payload,
    };
  }

  if (!data) {
    throw createRisePayError(
      lastError?.providerPayload?.error ||
        lastError?.providerPayload?.message ||
        lastError?.providerPayload?.details ||
        lastError?.providerPayload?.raw ||
        `Erro Rise Pay (${lastError?.status || 400})`,
      {
        code: "RISEPAY_CHECKOUT_FAILED",
        status: lastError?.status || 400,
        providerPayload: lastError?.providerPayload,
        requestPayload: lastError?.requestPayload,
        attemptLabel: lastError?.label,
      }
    );
  }

  const checkoutUrl =
    data?.checkout_url ||
    data?.payment_url ||
    data?.url ||
    data?.data?.checkout_url ||
    data?.data?.url ||
    data?.object?.checkoutUrl ||
    data?.object?.url;

  const pixQrCode =
    data?.object?.pix?.qrCode ||
    data?.pix?.qrCode ||
    data?.data?.pix?.qrCode ||
    null;

  const transactionId =
    data?.object?.identifier ||
    data?.object?.id ||
    data?.identifier ||
    data?.id ||
    null;

  const transactionStatus =
    data?.object?.status ||
    data?.status ||
    null;

  if (!checkoutUrl && !pixQrCode) {
    throw createRisePayError("Rise Pay nao retornou URL de checkout nem QR Code PIX.", {
      code: "RISEPAY_MISSING_URL",
      providerPayload: data,
      requestPayload: successfulPayload,
    });
  }

  return {
    checkoutUrl,
    pixQrCode,
    transactionId,
    transactionStatus,
    providerPayload: data,
  };
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
