const risePayService = require("../services/risePayService");
const userService = require("../services/userService");

function getAuthenticatedUserId(req) {
  return req?.auth?.userId || null;
}

const createCheckout = async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Nao autenticado." });
    }

    const { kind = "subscription", planId, quantity, userEmail } = req.body || {};
    const checkout = await risePayService.createCheckout({
      userId,
      email: userEmail,
      kind,
      planId,
      quantity,
    });

    return res.json({
      success: true,
      checkoutUrl: checkout.checkoutUrl,
      provider: "risepay",
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || "Falha ao criar checkout." });
  }
};

const webhook = async (req, res) => {
  try {
    const signature = req.headers["x-risepay-signature"];
    const raw = req.rawBody || JSON.stringify(req.body || {});
    const valid = risePayService.verifyWebhookSignature(raw, signature);
    if (!valid) {
      return res.status(401).json({ error: "Assinatura de webhook invalida." });
    }

    const eventType = req.body?.event || req.body?.type || "";
    const status = String(req.body?.status || req.body?.data?.status || "").toLowerCase();
    const metadata = req.body?.metadata || req.body?.data?.metadata || {};

    // TODO: Ajustar conforme payload real da Rise Pay
    // Aqui ja deixamos a estrutura pronta para creditar apos pagamento confirmado.
    if ((eventType.includes("payment") || eventType.includes("charge")) && (status === "paid" || status === "approved")) {
      const userId = metadata?.userId;
      const kind = metadata?.kind;
      if (userId && kind === "credits") {
        const credits = Number(metadata?.credits || 0);
        if (credits > 0) {
          await userService.creditarCreditos(userId, credits, "rise_pay_webhook");
        }
      }
    }

    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: "Erro no webhook de pagamento." });
  }
};

module.exports = {
  createCheckout,
  webhook,
};
