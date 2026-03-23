const BASE_URL = process.env.RISEPAY_BASE_URL || "https://api.risepay.com.br";
const PRIVATE_TOKEN = process.env.RISEPAY_PRIVATE_TOKEN || process.env.RISEPAY_TOKEN_PRIVATE || "";
const PUBLIC_TOKEN = process.env.RISEPAY_PUBLIC_TOKEN || process.env.RISEPAY_TOKEN_PUBLIC || "";
const DEFAULT_TIMEOUT_MS = Number(process.env.RISEPAY_TIMEOUT_MS || 20000);

function ensureConfigured() {
  if (!PRIVATE_TOKEN) {
    throw new Error("Rise Pay nao configurado. Defina RISEPAY_PRIVATE_TOKEN no backend.");
  }
}

async function risePayRequest(path, init = {}) {
  ensureConfigured();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const headers = new Headers(init.headers || {});
    headers.set("Authorization", PRIVATE_TOKEN);
    if (init.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers,
      signal: controller.signal,
    });

    const raw = await response.text();
    let data = {};
    if (raw) {
      try {
        data = JSON.parse(raw);
      } catch {
        data = { raw };
      }
    }

    if (!response.ok) {
      const message =
        data?.message ||
        data?.error ||
        `Rise Pay respondeu HTTP ${response.status}`;
      const error = new Error(message);
      error.status = response.status;
      error.details = data;
      throw error;
    }

    return data;
  } finally {
    clearTimeout(timeout);
  }
}

async function createTransaction(payload) {
  return risePayRequest("/api/External/Transactions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

async function getTransaction(identifier) {
  return risePayRequest(`/api/External/Transactions/${encodeURIComponent(identifier)}`);
}

async function getInstallments(value) {
  return risePayRequest(`/api/External/getInstallments?value=${encodeURIComponent(String(value))}`);
}

async function createWebhook(payload) {
  return risePayRequest("/api/External/Webhooks", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

async function listWebhooks() {
  return risePayRequest("/api/External/Webhooks");
}

async function getCompanyDetails() {
  return risePayRequest("/api/External/CompanyDetails");
}

function normalizeTransactionResponse(data) {
  const object = data?.object || {};
  return {
    identifier: String(object.identifier || ""),
    status: String(object.status || ""),
    amount: Number(object.amount || 0),
    currency: object.currency || "BRL",
    paymentMethod: object.paymentMethod || object.method || "",
    pixQrCode: object?.pix?.qrCode || null,
    boletoUrl: object?.boleto?.url || null,
    boletoBarcode: object?.boleto?.barcode || null,
    createdAt: object?.createdAt || null,
    customer: object?.customer || null,
    fee: object?.fee || null,
    raw: data,
  };
}

function isPaidStatus(status) {
  return ["Paid", "OverPaid"].includes(String(status || ""));
}

function isFinalStatus(status) {
  return [
    "Paid",
    "OverPaid",
    "Refunded",
    "Refused",
    "Chargeback",
    "PreChargeback",
    "ClonedCard",
  ].includes(String(status || ""));
}

module.exports = {
  createTransaction,
  createWebhook,
  getCompanyDetails,
  getInstallments,
  getTransaction,
  isFinalStatus,
  isPaidStatus,
  listWebhooks,
  normalizeTransactionResponse,
  PRIVATE_TOKEN,
  PUBLIC_TOKEN,
};
