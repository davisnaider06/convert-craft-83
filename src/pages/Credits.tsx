import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useClerk, useUser } from "@clerk/clerk-react";
import {
  ArrowLeft,
  Coins,
  Minus,
  Plus,
  ShoppingCart,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShinyButton } from "@/components/ui/ShinyButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OrbBackground } from "@/components/boder/OrbBackground";
import { SimpleHeader } from "@/components/boder/SimpleHeader";
import { premiumToast } from "@/components/ui/premium-toast";
import { readApiResponse, useApiClient } from "@/lib/apiClient";
import { BillingPaymentMethod, CheckoutSession } from "@/lib/billing";
import { RisePayCheckoutDialog } from "@/components/boder/RisePayCheckoutDialog";

const CREDITS_PER_PACK = 50;
const PRICE_PER_PACK = 27;

export default function Credits() {
  const navigate = useNavigate();
  const { user, isLoaded, isSignedIn } = useUser();
  const { openSignIn } = useClerk();
  const { apiFetch } = useApiClient();

  const [quantity, setQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<BillingPaymentMethod>("pix");
  const [checkout, setCheckout] = useState<CheckoutSession | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [currentCredits, setCurrentCredits] = useState(0);
  const [userPlan, setUserPlan] = useState("free");
  const [isLoadingData, setIsLoadingData] = useState(true);

  const totalCredits = quantity * CREDITS_PER_PACK;
  const totalPrice = quantity * PRICE_PER_PACK;
  const isPaidUser = userPlan !== "free";

  async function loadBillingOverview() {
    if (!isSignedIn || !user) return;
    try {
      const res = await apiFetch("/api/billing/overview");
      const parsed = await readApiResponse(res);
      if (!parsed.ok) throw new Error(parsed.error || "Falha ao carregar cobrança");
      setCurrentCredits(parsed.data?.user?.credits || 0);
      setUserPlan(parsed.data?.user?.plan || "free");
    } catch (error) {
      console.warn("Erro ao carregar billing overview:", error);
    } finally {
      setIsLoadingData(false);
    }
  }

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      setIsLoadingData(false);
      openSignIn();
      return;
    }

    loadBillingOverview();
  }, [isLoaded, isSignedIn, user]);

  async function handlePurchase() {
    if (!user) {
      premiumToast.error("Você precisa estar logado");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await apiFetch("/api/payments/checkout", {
        method: "POST",
        body: JSON.stringify({
          kind: "credits",
          quantity,
          paymentMethod,
          customer: {
            name: user.fullName || user.firstName || "Cliente Boder",
            email: user.primaryEmailAddress?.emailAddress || "",
          },
        }),
      });
      const parsed = await readApiResponse(response);
      if (!parsed.ok) throw new Error(parsed.error || "Falha ao criar cobrança");

      setCheckout(parsed.data?.checkout || null);
      setIsCheckoutOpen(true);
      premiumToast.success("Cobrança criada", "Conclua o pagamento para liberar os créditos.");
    } catch (err: any) {
      premiumToast.error("Erro ao iniciar compra", err?.message || "Tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  }

  if (!isLoaded || isLoadingData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <OrbBackground />
      <SimpleHeader />

      <div className="container mx-auto px-4 py-12">
        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar ao Dashboard
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-2xl"
        >
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Coins className="h-8 w-8 text-primary" />
            </div>
            <h1 className="mb-2 text-3xl font-bold">Comprar créditos extras</h1>
            <p className="text-muted-foreground">
              Gere a cobrança na Rise Pay e receba os créditos automaticamente após a confirmação.
            </p>
          </div>

          {!isPaidUser ? (
            <Card className="border-yellow-500/50 bg-yellow-500/5">
              <CardContent className="pt-6 text-center">
                <Sparkles className="mx-auto mb-4 h-12 w-12 text-yellow-500" />
                <h3 className="mb-2 text-xl font-semibold">Disponível para assinantes</h3>
                <p className="mb-4 text-muted-foreground">
                  A compra de créditos extras é liberada para quem está no plano Pro ou Anual.
                </p>
                <ShinyButton onClick={() => navigate("/pricing")}>Ver planos</ShinyButton>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-primary/20">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Pacote de créditos
                </CardTitle>
                <CardDescription>Cada pacote adiciona {CREDITS_PER_PACK} créditos à sua conta.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
                  <span className="text-sm text-muted-foreground">Seus créditos atuais</span>
                  <span className="text-2xl font-bold text-primary">{currentCredits}</span>
                </div>

                <div className="flex items-center justify-center gap-4">
                  <Button variant="outline" size="icon" onClick={() => setQuantity((q) => Math.max(q - 1, 1))}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="min-w-[120px] text-center">
                    <div className="text-4xl font-bold">{quantity}</div>
                    <div className="text-sm text-muted-foreground">
                      {quantity === 1 ? "pacote" : "pacotes"}
                    </div>
                  </div>
                  <Button variant="outline" size="icon" onClick={() => setQuantity((q) => Math.min(q + 1, 10))}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex justify-center gap-3">
                  <Button
                    variant={paymentMethod === "pix" ? "default" : "outline"}
                    onClick={() => setPaymentMethod("pix")}
                  >
                    PIX
                  </Button>
                  <Button
                    variant={paymentMethod === "boleto" ? "default" : "outline"}
                    onClick={() => setPaymentMethod("boleto")}
                  >
                    Boleto
                  </Button>
                </div>

                <div className="space-y-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Créditos</span>
                    <span className="font-semibold text-primary">{totalCredits} créditos</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Preço por pacote</span>
                    <span>R$ {PRICE_PER_PACK},00</span>
                  </div>
                  <div className="flex justify-between border-t border-primary/20 pt-3">
                    <span className="font-semibold">Total</span>
                    <span className="text-2xl font-bold text-primary">R$ {totalPrice},00</span>
                  </div>
                </div>

                <ShinyButton className="w-full" onClick={handlePurchase} disabled={isProcessing} isLoading={isProcessing}>
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Comprar {totalCredits} créditos
                </ShinyButton>

                <p className="text-center text-xs text-muted-foreground">
                  Após a confirmação na Rise Pay, os créditos entram automaticamente na sua conta.
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>

      <RisePayCheckoutDialog
        checkout={checkout}
        open={isCheckoutOpen}
        onOpenChange={setIsCheckoutOpen}
        onPaid={() => {
          setIsCheckoutOpen(false);
          loadBillingOverview();
        }}
      />
    </div>
  );
}
