import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Copy, ExternalLink, Loader2, QrCode, ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { premiumToast } from "@/components/ui/premium-toast";
import { CheckoutSession, formatMoney, getStatusLabel, isFinalStatus, isPaidStatus } from "@/lib/billing";
import { readApiResponse, useApiClient } from "@/lib/apiClient";

interface RisePayCheckoutDialogProps {
  checkout: CheckoutSession | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaid?: (checkout: CheckoutSession) => void;
}

export function RisePayCheckoutDialog({
  checkout,
  open,
  onOpenChange,
  onPaid,
}: RisePayCheckoutDialogProps) {
  const { apiFetch } = useApiClient();
  const [currentCheckout, setCurrentCheckout] = useState<CheckoutSession | null>(checkout);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pixQrImage, setPixQrImage] = useState<string | null>(null);

  useEffect(() => {
    setCurrentCheckout(checkout);
  }, [checkout]);

  useEffect(() => {
    let active = true;

    async function generateQrImage() {
      if (!currentCheckout?.pixQrCode) {
        setPixQrImage(null);
        return;
      }

      try {
        const dataUrl = await QRCode.toDataURL(currentCheckout.pixQrCode, {
          width: 256,
          margin: 1,
          errorCorrectionLevel: "M",
        });
        if (active) {
          setPixQrImage(dataUrl);
        }
      } catch {
        if (active) {
          setPixQrImage(null);
        }
      }
    }

    generateQrImage();

    return () => {
      active = false;
    };
  }, [currentCheckout?.pixQrCode]);

  useEffect(() => {
    if (!open || !currentCheckout?.externalId) return;
    if (isFinalStatus(currentCheckout.status)) return;

    let active = true;
    const interval = setInterval(async () => {
      try {
        const response = await apiFetch(`/api/payments/transactions/${currentCheckout.externalId}`);
        const parsed = await readApiResponse(response);
        if (!parsed.ok || !active) return;
        const nextCheckout = parsed.data?.checkout as CheckoutSession;
        if (!nextCheckout) return;

        setCurrentCheckout(nextCheckout);
        if (isPaidStatus(nextCheckout.status)) {
          premiumToast.success("Pagamento confirmado", "Seu acesso foi liberado.");
          onPaid?.(nextCheckout);
        }
      } catch {
        // polling silencioso
      }
    }, 5000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [apiFetch, currentCheckout, onPaid, open]);

  async function handleRefresh() {
    if (!currentCheckout?.externalId) return;
    setIsRefreshing(true);
    try {
      const response = await apiFetch(`/api/payments/transactions/${currentCheckout.externalId}`);
      const parsed = await readApiResponse(response);
      if (!parsed.ok) throw new Error(parsed.error || "Falha ao consultar pagamento");
      const nextCheckout = parsed.data?.checkout as CheckoutSession;
      setCurrentCheckout(nextCheckout);

      if (isPaidStatus(nextCheckout.status)) {
        premiumToast.success("Pagamento confirmado", "Seu acesso foi liberado.");
        onPaid?.(nextCheckout);
      }
    } catch (error: any) {
      premiumToast.error("Não foi possível atualizar", error?.message || "Tente novamente.");
    } finally {
      setIsRefreshing(false);
    }
  }

  async function handleCopy(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      premiumToast.success(`${label} copiado`, "Agora é só colar no app do banco.");
    } catch {
      premiumToast.error("Não foi possível copiar", "Tente selecionar manualmente.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Finalizar pagamento</DialogTitle>
          <DialogDescription>
            {currentCheckout
              ? `Status atual: ${getStatusLabel(currentCheckout.status)}`
              : "Gerando cobrança..."}
          </DialogDescription>
        </DialogHeader>

        {!currentCheckout ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-5">
            <div className="rounded-2xl border border-border bg-muted/30 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Valor</p>
                  <p className="text-2xl font-semibold">{formatMoney(currentCheckout.amount)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Transação</p>
                  <p className="font-mono text-xs">{currentCheckout.externalId}</p>
                </div>
              </div>
            </div>

            {currentCheckout.paymentMethod === "pix" && currentCheckout.pixQrCode ? (
              <div className="space-y-4 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <QrCode className="h-4 w-4 text-primary" />
                  PIX com QR Code
                </div>
                {pixQrImage ? (
                  <div className="flex justify-center rounded-2xl border border-border bg-background p-4">
                    <img
                      src={pixQrImage}
                      alt="QR Code PIX"
                      className="h-56 w-56 rounded-xl"
                    />
                  </div>
                ) : null}
                <textarea
                  readOnly
                  value={currentCheckout.pixQrCode}
                  className="min-h-36 w-full rounded-xl border bg-background p-3 text-xs"
                />
                <Button
                  className="w-full"
                  onClick={() => handleCopy(currentCheckout.pixQrCode || "", "Código PIX")}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copiar código PIX
                </Button>
              </div>
            ) : null}

            {currentCheckout.paymentMethod === "boleto" ? (
              <div className="space-y-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <ReceiptText className="h-4 w-4 text-amber-600" />
                  Boleto gerado
                </div>
                {currentCheckout.boletoBarcode ? (
                  <textarea
                    readOnly
                    value={currentCheckout.boletoBarcode}
                    className="min-h-24 w-full rounded-xl border bg-background p-3 text-xs"
                  />
                ) : null}
                <div className="flex gap-3">
                  {currentCheckout.boletoBarcode ? (
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleCopy(currentCheckout.boletoBarcode || "", "Código de barras")}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copiar linha digitável
                    </Button>
                  ) : null}
                  {currentCheckout.boletoUrl ? (
                    <Button
                      className="flex-1"
                      onClick={() => window.open(currentCheckout.boletoUrl || "", "_blank", "noopener,noreferrer")}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Abrir boleto
                    </Button>
                  ) : null}
                </div>
              </div>
            ) : null}

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={handleRefresh} disabled={isRefreshing}>
                {isRefreshing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Atualizar status
              </Button>
              <Button variant="ghost" className="flex-1" onClick={() => onOpenChange(false)}>
                Fechar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
