import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useClerk, useUser } from "@clerk/clerk-react";
import {
  ArrowRight,
  Check,
  Crown,
  HelpCircle,
  Shield,
  Sparkles,
  Star,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShinyButton } from "@/components/ui/ShinyButton";
import { OrbBackground } from "@/components/boder/OrbBackground";
import { ThemeToggle } from "@/components/boder/ThemeToggle";
import BlurText from "@/components/ui/BlurText";
import boderLogo from "@/assets/boder-logo.png";
import { premiumToast } from "@/components/ui/premium-toast";
import { readApiResponse, useApiClient } from "@/lib/apiClient";
import { BillingPaymentMethod, CheckoutSession } from "@/lib/billing";
import { RisePayCheckoutDialog } from "@/components/boder/RisePayCheckoutDialog";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "R$0",
    period: "grátis",
    description: "Perfeito para validar a plataforma antes de escalar.",
    credits: "15 créditos",
    creditsNote: "iniciais",
    cta: "Começar grátis",
    popular: false,
    badge: null,
    features: [
      { text: "15 créditos iniciais", included: true },
      { text: "Editor com IA", included: true },
      { text: "Subdomínio boder.app", included: true },
      { text: "Domínio próprio", included: false },
      { text: "Compra de créditos extras", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "R$67",
    period: "/mês",
    description: "Para quem já está vendendo e precisa de volume.",
    credits: "500 créditos",
    creditsNote: "por mês",
    cta: "Assinar plano Pro",
    popular: false,
    badge: null,
    features: [
      { text: "500 créditos por mês", included: true },
      { text: "Domínio próprio", included: true },
      { text: "Sem marca d'água", included: true },
      { text: "Compra de créditos extras", included: true },
      { text: "Suporte prioritário", included: true },
    ],
  },
  {
    id: "annual",
    name: "Anual",
    price: "R$247",
    period: "/ano",
    description: "Melhor custo para quem quer operar o ano inteiro.",
    credits: "500 créditos",
    creditsNote: "por mês",
    cta: "Assinar plano Anual",
    popular: true,
    badge: "Melhor custo-benefício",
    features: [
      { text: "500 créditos por mês", included: true },
      { text: "Domínio próprio", included: true },
      { text: "Sem marca d'água", included: true },
      { text: "Compra de créditos extras", included: true },
      { text: "Prioridade de geração", included: true },
    ],
  },
];

export default function Pricing() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isSignedIn } = useUser();
  const { openSignIn } = useClerk();
  const { apiFetch } = useApiClient();

  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<BillingPaymentMethod>("pix");
  const [checkout, setCheckout] = useState<CheckoutSession | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  async function startCheckout(planId: string) {
    if (planId === "free") {
      navigate(isSignedIn ? "/dashboard" : "/auth");
      return;
    }

    if (!isSignedIn) {
      sessionStorage.setItem("pendingPlan", planId);
      premiumToast.info("Faça login para continuar", "Vamos retomar o checkout logo após a autenticação.");
      openSignIn();
      return;
    }

    setLoadingPlan(planId);
    try {
      const response = await apiFetch("/api/payments/checkout", {
        method: "POST",
        body: JSON.stringify({
          kind: "plan",
          planId,
          paymentMethod,
          customer: {
            name: user?.fullName || user?.firstName || "Cliente Boder",
            email: user?.primaryEmailAddress?.emailAddress || "",
          },
        }),
      });
      const parsed = await readApiResponse(response);
      if (!parsed.ok) throw new Error(parsed.error || "Falha ao criar cobrança");

      setCheckout(parsed.data?.checkout || null);
      setIsCheckoutOpen(true);
      premiumToast.success(
        "Cobrança criada",
        paymentMethod === "pix" ? "Use o PIX para concluir a assinatura." : "Seu boleto foi gerado.",
      );
    } catch (error: any) {
      premiumToast.error("Erro ao iniciar pagamento", error?.message || "Tente novamente.");
    } finally {
      setLoadingPlan(null);
    }
  }

  useEffect(() => {
    const pendingPlan = searchParams.get("plan");
    const autoStart = searchParams.get("autostart");
    if (!isSignedIn || !pendingPlan || autoStart !== "1" || loadingPlan) return;
    if (!["pro", "annual"].includes(pendingPlan)) return;

    startCheckout(pendingPlan);
    setSearchParams({}, { replace: true });
  }, [isSignedIn, loadingPlan, searchParams, setSearchParams]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <OrbBackground />

      <motion.header
        className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm"
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="container flex h-16 items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img src={boderLogo} alt="Boder AI" className="h-8 w-auto" />
            <span className="text-xl font-semibold hidden sm:inline">Boder AI</span>
          </button>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {isSignedIn ? (
              <Button onClick={() => navigate("/dashboard")} variant="outline">
                Dashboard
              </Button>
            ) : (
              <Button onClick={() => openSignIn()}>Entrar</Button>
            )}
          </div>
        </div>
      </motion.header>

      <main className="relative pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            className="mb-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm text-primary">
              <Sparkles className="h-4 w-4" />
              Gateway Rise Pay integrado
            </div>
            <BlurText
              text="Escolha o plano certo para escalar"
              className="justify-center text-4xl font-bold md:text-5xl"
              animateBy="words"
              delay={80}
            />
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Agora o checkout roda com a Rise Pay e o pagamento é acompanhado dentro da própria plataforma.
            </p>
          </motion.div>

          <motion.div
            className="mb-10 flex flex-wrap items-center justify-center gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-sm text-muted-foreground">Método de pagamento:</span>
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
          </motion.div>

          <div className="mb-20 grid gap-8 md:grid-cols-3">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.12 }}
                className={`rounded-3xl p-[1px] ${
                  plan.popular
                    ? "bg-gradient-to-b from-primary via-primary/50 to-primary/10"
                    : "bg-gradient-to-b from-border via-border/40 to-transparent"
                }`}
              >
                <div className="relative h-full rounded-3xl bg-card p-8">
                  {plan.badge ? (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <div className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground">
                        <Star className="h-4 w-4" />
                        {plan.badge}
                      </div>
                    </div>
                  ) : null}

                  <div className="mb-6">
                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-end gap-1">
                      <span className="text-5xl font-bold">{plan.price}</span>
                      <span className="pb-1 text-muted-foreground">{plan.period}</span>
                    </div>
                  </div>

                  <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
                        <Zap className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{plan.credits}</p>
                        <p className="text-sm text-muted-foreground">{plan.creditsNote}</p>
                      </div>
                    </div>
                  </div>

                  <ShinyButton
                    className="mb-6 w-full"
                    onClick={() => startCheckout(plan.id)}
                    disabled={loadingPlan !== null}
                    isLoading={loadingPlan === plan.id}
                  >
                    {loadingPlan === plan.id ? "Gerando cobrança..." : plan.cta}
                    {loadingPlan !== plan.id ? <ArrowRight className="ml-2 h-4 w-4" /> : null}
                  </ShinyButton>

                  <div className="space-y-3">
                    {plan.features.map((feature) => (
                      <div key={feature.text} className="flex items-start gap-3 text-sm">
                        <div className="mt-0.5">
                          {feature.included ? (
                            <Check className="h-4 w-4 text-primary" />
                          ) : (
                            <X className="h-4 w-4 text-muted-foreground/50" />
                          )}
                        </div>
                        <span className={feature.included ? "text-foreground" : "text-muted-foreground/60"}>
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid gap-6 rounded-3xl border border-border bg-card/50 p-8 md:grid-cols-3">
            {[
              {
                icon: HelpCircle,
                title: "Como funciona o pagamento",
                text: "A cobrança é criada na Rise Pay e o status fica sincronizado no app.",
              },
              {
                icon: Shield,
                title: "Confirmação segura",
                text: "Quando a Rise Pay confirmar o pagamento, o plano é liberado automaticamente.",
              },
              {
                icon: Crown,
                title: "Créditos extras",
                text: "Planos pagos também podem comprar pacotes extras pela mesma integração.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-border/60 bg-background/60 p-5">
                <item.icon className="mb-3 h-5 w-5 text-primary" />
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <RisePayCheckoutDialog
        checkout={checkout}
        open={isCheckoutOpen}
        onOpenChange={setIsCheckoutOpen}
        onPaid={() => {
          setIsCheckoutOpen(false);
          navigate("/dashboard");
        }}
      />
    </div>
  );
}
