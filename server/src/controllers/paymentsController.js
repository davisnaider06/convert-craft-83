const { CREDIT_PACK, DEFAULT_PAYMENT_METHOD, PLAN_DEFINITIONS } = require("../config/billing");
const risePayService = require("../services/risePayService");
const userService = require("../services/userService");

function getAuthenticatedUserId(req) {
  return req?.auth?.userId || null;
}

function getBackendBaseUrl() {
  return process.env.BACKEND_PUBLIC_URL || process.env.API_PUBLIC_URL || "";
}

function getDefaultPostbackUrl() {
  if (process.env.RISEPAY_POSTBACK_URL) return process.env.RISEPAY_POSTBACK_URL;
  const backendBaseUrl = getBackendBaseUrl();
  if (!backendBaseUrl) return null;
  return `${backendBaseUrl.replace(/\/$/, "")}/api/payments/webhook/risepay`;
}

function normalizeCustomer(input, fallbackEmail) {
  const name = String(input?.name || "").trim();
  const email = String(input?.email || fallbackEmail || "").trim();
  const cpf = String(input?.cpf || "").replace(/\D/g, "");
  const phone = String(input?.phone || "").replace(/\D/g, "");

  if (!name) {
    throw new Error("Informe o nome do comprador para gerar a cobranca.");
  }

  if (!email) {
    throw new Error("Informe o email do comprador para gerar a cobranca.");
  }

  if (cpf.length !== 11) {
    throw new Error("Informe um CPF valido para gerar a cobranca.");
  }

  if (phone.length < 10) {
    throw new Error("Informe um telefone valido para gerar a cobranca.");
  }

  return {
    name,
    email,
    cpf,
    phone,
  };
}

function buildPurchase(kind, payload) {
  if (kind === "plan" || kind === "subscription") {
    const plan = PLAN_DEFINITIONS[payload?.planId];
    if (!plan || plan.id === "free") {
      throw new Error("Plano invalido.");
    }

    return {
      kind: "plan",
      amount: plan.amount,
      description: `Assinatura ${plan.name} Boder AI`,
      planId: plan.id,
      quantity: 1,
      creditsAmount: plan.credits,
      items: [
        {
          id: `plan_${plan.id}`,
          description: `Plano ${plan.name}`,
          quantity: 1,
          price: plan.amount,
        },
      ],
    };
  }

  if (kind === "credits") {
    const quantity = Math.max(
      CREDIT_PACK.minQuantity,
      Math.min(CREDIT_PACK.maxQuantity, Number(payload?.quantity || 1)),
    );
    const totalCredits = quantity * CREDIT_PACK.creditsPerPack;
    const amount = quantity * CREDIT_PACK.pricePerPack;

    return {
      kind: "credits",
      amount,
      description: `${totalCredits} creditos Boder AI`,
      planId: null,
      quantity,
      creditsAmount: totalCredits,
      items: [
        {
          id: "credits_pack",
          description: `${quantity} pacote(s) de creditos`,
          quantity,
          price: CREDIT_PACK.pricePerPack,
        },
      ],
    };
  }

  throw new Error("Tipo de compra invalido.");
}

function buildExternalReference(kind, userId) {
  return `boder:${kind}:${userId}:${Date.now()}`;
}

function mapCheckoutResponse(payment) {
  return {
    id: payment.id,
    externalId: payment.externalId,
    amount: payment.amount,
    currency: payment.currency,
    status: payment.status,
    paymentMethod: payment.paymentMethod,
    pixQrCode: payment.pixQrCode,
    boletoUrl: payment.boletoUrl,
    boletoBarcode: payment.boletoBarcode,
    checkoutUrl: payment.checkoutUrl,
    kind: payment.kind,
    planId: payment.planId,
    creditsAmount: payment.creditsAmount,
    quantity: payment.quantity,
    credited: payment.credited,
  };
}

async function persistTransaction({ userId, purchase, externalReference, paymentMethod, riseResponse }) {
  const normalized = risePayService.normalizeTransactionResponse(riseResponse);

  return userService.prisma.paymentTransaction.upsert({
    where: { externalId: normalized.identifier },
    update: {
      status: normalized.status,
      paymentMethod,
      amount: purchase.amount,
      currency: normalized.currency || "BRL",
      creditsAmount: purchase.creditsAmount,
      quantity: purchase.quantity,
      boletoUrl: normalized.boletoUrl,
      boletoBarcode: normalized.boletoBarcode,
      pixQrCode: normalized.pixQrCode,
      rawResponse: riseResponse,
      rawLastStatus: riseResponse,
    },
    create: {
      userId,
      externalId: normalized.identifier,
      externalReference,
      kind: purchase.kind,
      planId: purchase.planId,
      creditsAmount: purchase.creditsAmount,
      quantity: purchase.quantity,
      amount: purchase.amount,
      currency: normalized.currency || "BRL",
      paymentMethod,
      status: normalized.status,
      boletoUrl: normalized.boletoUrl,
      boletoBarcode: normalized.boletoBarcode,
      pixQrCode: normalized.pixQrCode,
      rawResponse: riseResponse,
      rawLastStatus: riseResponse,
    },
  });
}

async function applyPaymentIfNeeded(payment, remoteData = null) {
  const remote = remoteData || (await risePayService.getTransaction(payment.externalId));
  const normalized = risePayService.normalizeTransactionResponse(remote);

  let updated = await userService.prisma.paymentTransaction.update({
    where: { id: payment.id },
    data: {
      status: normalized.status,
      paymentMethod: normalized.paymentMethod || payment.paymentMethod,
      boletoUrl: normalized.boletoUrl,
      boletoBarcode: normalized.boletoBarcode,
      pixQrCode: normalized.pixQrCode,
      rawLastStatus: remote,
    },
  });

  if (!updated.credited && risePayService.isPaidStatus(normalized.status)) {
    if (updated.kind === "plan" && updated.planId) {
      await userService.applyPlanPurchase(updated.userId, updated.planId);
    } else if (updated.kind === "credits") {
      const packs = Math.max(1, Number(updated.quantity || 1));
      await userService.applyCreditPackPurchase(updated.userId, packs);
    }

    updated = await userService.prisma.paymentTransaction.update({
      where: { id: payment.id },
      data: {
        credited: true,
        creditedAt: new Date(),
        status: normalized.status,
        rawLastStatus: remote,
      },
    });
  }

  return { payment: updated, remote: normalized };
}

async function createCheckout(req, res) {
  try {
    const userId = getAuthenticatedUserId(req);
    const { kind, customer, paymentMethod = DEFAULT_PAYMENT_METHOD } = req.body || {};
    const email = req.body?.customer?.email || req.body?.userEmail || req.body?.email || "";

    if (!userId) {
      return res.status(401).json({ error: "Usuario nao autenticado." });
    }

    await userService.ensureUser(userId, email);
    const purchase = buildPurchase(kind, req.body || {});
    const normalizedCustomer = normalizeCustomer(
      customer || {
        name: req.body?.customerName || "Cliente Boder",
        email,
      },
      email,
    );
    const externalReference = buildExternalReference(purchase.kind, userId);

    const risePayload = {
      amount: purchase.amount,
      payment: {
        method: paymentMethod,
        ...(paymentMethod === "pix" ? { expiresAt: 48 } : {}),
        ...(paymentMethod === "boleto" ? { expiresInDays: 3 } : {}),
      },
      customer: normalizedCustomer,
      ...(paymentMethod !== "boleto" ? { currency: "BRL" } : {}),
    };

    const riseResponse = await risePayService.createTransaction(risePayload);
    const payment = await persistTransaction({
      userId,
      purchase,
      externalReference,
      paymentMethod,
      riseResponse,
    });

    return res.status(201).json({
      success: true,
      checkout: mapCheckoutResponse(payment),
      gatewayMessage: riseResponse?.message || "Cobranca criada com sucesso.",
    });
  } catch (error) {
    return res.status(error.status || 400).json({
      error: error.message || "Falha ao criar cobranca na Rise Pay.",
      details: error.details || null,
    });
  }
}

async function getCheckoutStatus(req, res) {
  try {
    const userId = getAuthenticatedUserId(req);
    const { externalId } = req.params;
    const payment = await userService.prisma.paymentTransaction.findFirst({
      where: { externalId, userId },
    });

    if (!payment) {
      return res.status(404).json({ error: "Cobranca nao encontrada." });
    }

    const result = await applyPaymentIfNeeded(payment);
    const user = await userService.prisma.user.findUnique({ where: { id: userId } });

    return res.json({
      success: true,
      checkout: {
        ...mapCheckoutResponse(result.payment),
        status: result.remote.status,
        pixQrCode: result.remote.pixQrCode || result.payment.pixQrCode,
        boletoUrl: result.remote.boletoUrl || result.payment.boletoUrl,
        boletoBarcode: result.remote.boletoBarcode || result.payment.boletoBarcode,
      },
      user: user
        ? {
            plan: user.planType,
            credits: user.credits,
          }
        : null,
    });
  } catch (error) {
    return res.status(error.status || 400).json({
      error: error.message || "Falha ao consultar pagamento.",
      details: error.details || null,
    });
  }
}

async function getInstallments(req, res) {
  try {
    const value = Number(req.query.value || 0);
    if (!value || value <= 0) {
      return res.status(400).json({ error: "Informe um valor valido para consultar parcelamento." });
    }

    const data = await risePayService.getInstallments(value);
    return res.json({
      success: true,
      installments: data?.object || [],
    });
  } catch (error) {
    return res.status(error.status || 400).json({
      error: error.message || "Falha ao consultar parcelamentos.",
      details: error.details || null,
    });
  }
}

async function getBillingOverview(req, res) {
  try {
    const userId = getAuthenticatedUserId(req);
    const user = await userService.prisma.user.findUnique({ where: { id: userId } });
    const payments = await userService.prisma.paymentTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return res.json({
      success: true,
      user: user
        ? {
            credits: user.credits,
            plan: user.planType,
          }
        : null,
      payments: payments.map(mapCheckoutResponse),
      catalog: {
        plans: Object.values(PLAN_DEFINITIONS),
        creditPack: CREDIT_PACK,
      },
    });
  } catch {
    return res.status(500).json({ error: "Falha ao carregar dados de cobranca." });
  }
}

async function handleRisePayWebhook(req, res) {
  try {
    const signature = req.headers["x-risepay-signature"];
    const raw = req.rawBody || JSON.stringify(req.body || {});
    if (!risePayService.verifyWebhookSignature(raw, signature)) {
      return res.status(401).json({ error: "Assinatura de webhook invalida." });
    }

    const payload = req.body || {};
    const transactionIdentifier =
      payload?.object?.identifier ||
      payload?.transaction?.identifier ||
      payload?.data?.identifier ||
      payload?.identifier ||
      payload?.id;

    if (!transactionIdentifier) {
      return res.status(200).json({ success: true, message: "Webhook recebido sem identificador." });
    }

    const payment = await userService.prisma.paymentTransaction.findFirst({
      where: { externalId: String(transactionIdentifier) },
    });

    if (!payment) {
      return res.status(200).json({ success: true, message: "Webhook ignorado: transacao nao mapeada." });
    }

    await applyPaymentIfNeeded(payment);
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Falha ao processar webhook." });
  }
}

async function registerRisePayWebhook(req, res) {
  try {
    const url = getDefaultPostbackUrl();
    if (!url) {
      return res.status(400).json({
        error: "Defina BACKEND_PUBLIC_URL ou RISEPAY_POSTBACK_URL para registrar o webhook.",
      });
    }

    const response = await risePayService.createWebhook({
      url,
      events: ["transaction.created", "transaction.updated", "transaction.refunded"],
    });

    return res.json({
      success: true,
      webhook: response?.object || null,
      message: response?.message || "Webhook registrado com sucesso.",
    });
  } catch (error) {
    return res.status(error.status || 400).json({
      error: error.message || "Falha ao registrar webhook na Rise Pay.",
      details: error.details || null,
    });
  }
}

module.exports = {
  createCheckout,
  getBillingOverview,
  getCheckoutStatus,
  getInstallments,
  handleRisePayWebhook,
  registerRisePayWebhook,
  webhook: handleRisePayWebhook,
};
