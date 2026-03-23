export type BillingPaymentMethod = "pix" | "boleto";

export interface CheckoutSession {
  id: string;
  externalId: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  pixQrCode?: string | null;
  boletoUrl?: string | null;
  boletoBarcode?: string | null;
  checkoutUrl?: string | null;
  kind: "plan" | "credits";
  planId?: string | null;
  creditsAmount?: number | null;
  quantity?: number | null;
  credited: boolean;
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function isPaidStatus(status: string) {
  return ["Paid", "OverPaid"].includes(status);
}

export function isFinalStatus(status: string) {
  return [
    "Paid",
    "OverPaid",
    "Refunded",
    "Refused",
    "Chargeback",
    "PreChargeback",
    "ClonedCard",
  ].includes(status);
}

export function getStatusLabel(status: string) {
  const map: Record<string, string> = {
    Paid: "Pago",
    OverPaid: "Pago a maior",
    Refunded: "Reembolsado",
    Refused: "Recusado",
    Chargeback: "Chargeback",
    "Waiting Payment": "Aguardando pagamento",
    PreChargeback: "Pré-chargeback",
  };
  return map[status] || status || "Pendente";
}
