import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { OrbBackground } from "@/components/boder/OrbBackground";
import { ThemeToggle } from "@/components/boder/ThemeToggle";
// import { useAuth } from "@/contexts/AuthContext"; // REMOVIDO
import { useUser, useClerk } from "@clerk/clerk-react"; // ADICIONADO CLERK

import { premiumToast } from "@/components/ui/premium-toast";
import {
  Check,
  X,
  Zap,
  Crown,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Star,
  Shield,
  Layers,
} from "lucide-react";
import boderLogo from "@/assets/boder-logo.png";
import BlurText from "@/components/ui/BlurText";
import { ShinyButton } from "@/components/ui/ShinyButton";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "R$0",
    period: "grátis",
    description: "Perfeito para testar a plataforma",
    credits: "15 créditos", // Ajustado para refletir a regra do backend (15)
    creditsNote: "inicialmente",
    features: [
      { text: "15 créditos iniciais", included: true },
      { text: "1 crédito = 1 site gerado", included: true },
      { text: "Acesso ao Gemini Flash", included: true },
      { text: "Subdomínio *.boder.app", included: true },
      { text: "Acesso ao editor", included: true },
      { text: "Domínio próprio", included: false },
      { text: "Remover marca d'água", included: false },
      { text: "Compra de créditos extras", included: false },
    ],
    cta: "Começar grátis",
    popular: false,
    badge: null,
  },
  {
    id: "pro",
    name: "Pro",
    price: "R$67",
    period: "/mês",
    description: "Para criadores e empreendedores",
    credits: "500 créditos",
    creditsNote: "por mês",
    features: [
      { text: "500 créditos por mês", included: true },
      { text: "Acesso ao Groq (Super Rápido)", included: true },
      { text: "Créditos não acumulam", included: true },
      { text: "Subdomínio *.boder.app", included: true },
      { text: "Conectar domínio próprio", included: true },
      { text: "Remover marca d'água", included: true },
      { text: "Compra de créditos extras", included: true },
      { text: "Suporte prioritário", included: true },
    ],
    cta: "Assinar plano Pro",
    popular: false,
    badge: null,
  },
  {
    id: "annual",
    name: "Anual",
    price: "R$247",
    period: "/ano",
    description: "Economia máxima para profissionais",
    credits: "500 créditos",
    creditsNote: "por mês",
    monthlyEquivalent: "≈ R$20,58/mês",
    features: [
      { text: "500 créditos por mês", included: true },
      { text: "Acesso ao Groq (Super Rápido)", included: true },
      { text: "Créditos não acumulam", included: true },
      { text: "Subdomínio *.boder.app", included: true },
      { text: "Conectar domínio próprio", included: true },
      { text: "Remover marca d'água", included: true },
      { text: "Prioridade na geração", included: true },
      { text: "Compra de créditos extras", included: true },
    ],
    cta: "Assinar plano Anual",
    popular: true,
    badge: "Melhor custo-benefício",
  },
];

const comparisonFeatures = [
  { name: "Créditos mensais", free: "15 un.", pro: "500/mês", annual: "500/mês" },
  { name: "Modelo de IA", free: "Gemini", pro: "Groq + Gemini", annual: "Groq + Gemini" },
  { name: "Créditos acumulam", free: false, pro: false, annual: false },
  { name: "Subdomínio boder.app", free: true, pro: true, annual: true },
  { name: "Domínio próprio", free: false, pro: true, annual: true },
  { name: "Remove marca d'água", free: false, pro: true, annual: true },
  { name: "Compra de créditos extras", free: false, pro: true, annual: true },
  { name: "Prioridade na geração", free: false, pro: false, annual: true },
];

export default function Pricing() {
  const navigate = useNavigate();
  // --- MUDANÇA: Usando Hooks do Clerk ---
  const { user, isSignedIn } = useUser();
  const { openSignIn } = useClerk();
  
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSelectPlan = async (planId: string) => {
    // 1. Lógica para plano Grátis
    if (planId === "free") {
      if (isSignedIn) {
        navigate("/dashboard");
      } else {
        openSignIn(); // Abre modal do Clerk
      }
      return;
    }

    // 2. Verifica login para planos pagos
    if (!isSignedIn) {
      // Salva a intenção de compra
      sessionStorage.setItem("pendingPlan", planId);
      premiumToast.info("Faça login para continuar", "Você poderá finalizar a assinatura em seguida.");
      openSignIn(); // Abre modal do Clerk
      return;
    }

    // 3. Simulação de Checkout (Integração futura com Stripe)
    setLoadingPlan(planId);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      premiumToast.success("Redirecionando...", "Abrindo gateway de pagamento seguro.");
      
      setTimeout(() => {
        // Link fake para simular checkout
        window.open("https://google.com", "_blank"); 
        setLoadingPlan(null);
      }, 1000);

    } catch (err) {
      console.error("Checkout error:", err);
      premiumToast.error("Erro ao iniciar pagamento", "Tente novamente.");
      setLoadingPlan(null);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <OrbBackground />

      {/* Header */}
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
            {boderLogo ? (
               <img src={boderLogo} alt="Boder AI" className="h-8 w-auto" />
            ) : (
               <span className="text-xl font-bold">Boder AI</span>
            )}
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

      {/* Main Content */}
      <main className="relative pt-24 pb-20 px-4">
        <div className="container max-w-6xl mx-auto">
          {/* Hero Section */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm text-primary mb-6"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              <Sparkles className="h-4 w-4" />
              Preços transparentes, sem surpresas
            </motion.div>

            <BlurText
              text="Escolha seu plano"
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 justify-center"
              animateBy="words"
              delay={100}
            />
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comece grátis e evolua conforme sua necessidade.
              Todos os planos incluem acesso completo ao editor de IA.
            </p>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid gap-8 md:grid-cols-3 mb-20">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15 }}
                className={`group relative rounded-3xl p-[1px] transition-all duration-500 ${
                  plan.popular
                    ? "bg-gradient-to-b from-primary via-primary/50 to-primary/20"
                    : "bg-gradient-to-b from-border/80 via-border/40 to-transparent hover:from-primary/60 hover:via-primary/30 hover:to-transparent"
                }`}
              >
                {/* Card Inner */}
                <div className="relative h-full rounded-3xl bg-card p-8 backdrop-blur-xl">
                  {/* Popular Badge */}
                  {plan.badge && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-primary/80 px-4 py-1.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/30">
                        <Star className="h-4 w-4" />
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  {/* Plan Name & Description */}
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                      {plan.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-bold tracking-tight">{plan.price}</span>
                      <span className="text-lg text-muted-foreground">{plan.period}</span>
                    </div>
                    {plan.monthlyEquivalent && (
                      <p className="text-sm text-primary mt-2 font-medium">{plan.monthlyEquivalent}</p>
                    )}
                  </div>

                  {/* Credits Badge */}
                  <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
                        <Zap className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <span className="font-bold text-lg">{plan.credits}</span>
                        <span className="text-muted-foreground text-sm ml-1">{plan.creditsNote}</span>
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <ShinyButton
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={loadingPlan !== null}
                    isLoading={loadingPlan === plan.id}
                    className="w-full mb-6"
                  >
                    {loadingPlan === plan.id ? "Processando..." : plan.cta}
                    {loadingPlan !== plan.id && <ArrowRight className="h-4 w-4 ml-2" />}
                  </ShinyButton>

                  {/* Features Section */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                      Recursos
                    </p>
                    <ul className="space-y-3">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm">
                          {feature.included ? (
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 shrink-0">
                              <Check className="h-3 w-3 text-primary" />
                            </div>
                          ) : (
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted shrink-0">
                              <X className="h-3 w-3 text-muted-foreground/50" />
                            </div>
                          )}
                          <span className={feature.included ? "text-foreground" : "text-muted-foreground/50"}>
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {plan.id !== "free" && (
                    <p className="text-xs text-center text-muted-foreground mt-6 pt-4 border-t border-border/50">
                      *Dentro do limite de créditos mensais
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Credit System Explanation */}
          <motion.section
            className="mb-20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="rounded-3xl border border-border bg-card/50 backdrop-blur-sm p-8 md:p-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                  <HelpCircle className="h-6 w-6 text-primary" />
                </div>
                <BlurText
                  text="Como funcionam os créditos?"
                  className="text-2xl md:text-3xl font-bold"
                  animateBy="words"
                  delay={60}
                />
              </div>

              {/* Important clarification box */}
              <div className="mb-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <p className="text-sm text-center">
                  ⚠️ <strong className="text-foreground">Importante:</strong> Créditos são unidades de uso da plataforma. 
                  Eles não representam dinheiro e servem apenas para gerar sites com IA.
                </p>
              </div>

              <motion.div 
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.15,
                      delayChildren: 0.2
                    }
                  }
                }}
              >
                {[
                  { icon: Zap, title: "Unidade de uso", description: "Créditos são usados para gerar sites. Cada geração consome créditos variáveis (1 a 5).", rotate: 10 },
                  { icon: Layers, title: "Limite mensal", description: "Cada plano tem um limite de créditos por mês. Use conforme sua necessidade.", rotate: -10 },
                  { icon: Crown, title: "Renovação mensal", description: "Seus créditos renovam todo mês automaticamente de acordo com o plano.", rotate: 10 },
                  { icon: Shield, title: "Sem acúmulo", description: "Créditos não acumulam de um mês para outro. Use antes de renovar!", rotate: -10 }
                ].map((benefit, index) => (
                  <motion.div 
                    key={index}
                    className="group p-6 rounded-2xl bg-gradient-to-br from-secondary/50 to-secondary/30 border border-border/50 cursor-default"
                    variants={{
                      hidden: { opacity: 0, y: 30, scale: 0.9 },
                      visible: { 
                        opacity: 1, 
                        y: 0, 
                        scale: 1,
                        transition: {
                          type: "spring",
                          stiffness: 100,
                          damping: 15
                        }
                      }
                    }}
                    whileHover={{ 
                      scale: 1.02, 
                      y: -5,
                      borderColor: "hsl(var(--primary) / 0.5)"
                    }}
                  >
                    <motion.div
                      className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-4"
                      whileHover={{ rotate: benefit.rotate, scale: 1.1 }}
                    >
                      <benefit.icon className="h-6 w-6 text-primary" />
                    </motion.div>
                    <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {benefit.description}
                    </p>
                  </motion.div>
                ))}
              </motion.div>

              <div className="mt-8 p-4 rounded-xl bg-primary/5 border border-primary/20">
                <p className="text-sm text-center text-muted-foreground">
                  💡 <strong className="text-foreground">Dica:</strong> Precisa gerar mais sites?
                  Usuários de planos pagos podem comprar créditos adicionais.
                </p>
              </div>
            </div>
          </motion.section>

          {/* Comparison Table */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <BlurText
              text="Compare os planos"
              className="text-2xl md:text-3xl font-bold text-center mb-8 justify-center"
              animateBy="words"
              delay={80}
            />

            <div className="rounded-3xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left p-6 font-semibold">Recurso</th>
                      <th className="text-center p-6 font-semibold">Free</th>
                      <th className="text-center p-6 font-semibold">Pro</th>
                      <th className="text-center p-6 font-semibold relative bg-primary/5">
                        <span className="inline-flex items-center gap-1">
                          Anual
                          <Star className="h-4 w-4 text-primary" />
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonFeatures.map((feature, index) => (
                      <tr
                        key={index}
                        className={`${index % 2 === 0 ? "bg-secondary/10" : ""} hover:bg-secondary/20 transition-colors`}
                      >
                        <td className="p-6 font-medium">{feature.name}</td>
                        <td className="p-6 text-center">
                          {typeof feature.free === "boolean" ? (
                            feature.free ? (
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 mx-auto">
                                <Check className="h-4 w-4 text-primary" />
                              </div>
                            ) : (
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted mx-auto">
                                <X className="h-4 w-4 text-muted-foreground/50" />
                              </div>
                            )
                          ) : (
                            <span className="text-sm font-medium">{feature.free}</span>
                          )}
                        </td>
                        <td className="p-6 text-center">
                          {typeof feature.pro === "boolean" ? (
                            feature.pro ? (
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 mx-auto">
                                <Check className="h-4 w-4 text-primary" />
                              </div>
                            ) : (
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted mx-auto">
                                <X className="h-4 w-4 text-muted-foreground/50" />
                              </div>
                            )
                          ) : (
                            <span className="text-sm font-medium">{feature.pro}</span>
                          )}
                        </td>
                        <td className="p-6 text-center bg-primary/5">
                          {typeof feature.annual === "boolean" ? (
                            feature.annual ? (
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 mx-auto">
                                <Check className="h-4 w-4 text-primary" />
                              </div>
                            ) : (
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted mx-auto">
                                <X className="h-4 w-4 text-muted-foreground/50" />
                              </div>
                            )
                          ) : (
                            <span className="text-sm font-medium text-primary">{feature.annual}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.section>

          {/* FAQ & CTA Sections (Mantidos iguais) */}
          <motion.section
            className="mt-20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
             {/* ... (Mantive o resto do FAQ e CTA igual ao seu código original) ... */}
             {/* (Por brevidade, assume-se que o restante do código é idêntico ao que você enviou) */}
             <BlurText
              text="Perguntas frequentes"
              className="text-2xl md:text-3xl font-bold text-center mb-8 justify-center"
              animateBy="words"
              delay={80}
            />

            <div className="max-w-3xl mx-auto space-y-4">
              {[
                {
                  q: "O que acontece se eu usar todos os créditos?",
                  a: "Você pode esperar a renovação mensal ou, se tiver um plano pago, comprar créditos extras.",
                },
                {
                  q: "Posso mudar de plano a qualquer momento?",
                  a: "Sim! Você pode fazer upgrade ou downgrade do seu plano quando quiser.",
                },
                {
                  q: "Os créditos acumulam de um mês para outro?",
                  a: "Não. Os créditos não utilizados expiram e são renovados no início de cada mês.",
                },
                {
                  q: "Como funciona a garantia de reembolso?",
                  a: "Oferecemos garantia de 7 dias. Se não ficar satisfeito, devolvemos seu dinheiro.",
                },
              ].map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-6 hover:border-primary/30 transition-colors"
                >
                  <h3 className="font-semibold mb-2">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          <motion.section
            className="mt-20 text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-primary/5 p-12">
              <BlurText
                text="Pronto para começar?"
                className="text-3xl md:text-4xl font-bold mb-4 justify-center"
                animateBy="words"
                delay={80}
              />
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Crie seu primeiro site em minutos. Sem cartão de crédito, sem compromisso.
              </p>
              <Button
                size="lg"
                onClick={() => navigate("/create")}
                className="gap-2 shadow-lg shadow-primary/25"
              >
                Começar grátis
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </motion.section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background/50 backdrop-blur-sm py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2025 Boder AI. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}