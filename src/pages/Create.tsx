import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShinyButton } from "@/components/ui/ShinyButton";
import { useUser, useClerk } from "@clerk/clerk-react";
import { OrbBackground } from "@/components/boder/OrbBackground";
import { ThemeToggle } from "@/components/boder/ThemeToggle";
import { SoundToggle } from "@/components/boder/SoundToggle";
import { PremiumGeneratingLoader } from "@/components/boder/PremiumGeneratingLoader";
import { useSounds } from "@/hooks/useSounds";

import { premiumToast } from "@/components/ui/premium-toast";
import { TEMPLATE_CATEGORIES, getTemplatesByCategory, Template } from "@/lib/templates";
import BlurText from "@/components/ui/BlurText";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  MessageSquare,
  Rocket,
  Zap,
  Check,
  Grid,
  Link as LinkIcon,
  Briefcase,
  Award,
  ShoppingBag,
  Eye,
  Wand2,
} from "lucide-react";
import boderLogo from "@/assets/boder-logo.png";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface OnboardingData {
  template: Template | null;
  descricao: string;
  customizations: string;
}

const STEPS = [
  { id: "entry", title: "Boder AI" },
  { id: "template", title: "Template" },
  { id: "descricao", title: "Descrição" },
  { id: "customizacao", title: "Personalização" },
  { id: "confirmacao", title: "Confirmação" },
  { id: "gerando", title: "Gerando" },
  { id: "resultado", title: "Pronto" },
];

const CATEGORY_ICONS: Record<string, any> = {
  all: Grid,
  landing: Rocket,
  portfolio: Briefcase,
  biolink: LinkIcon,
  service: Award,
  ecommerce: ShoppingBag,
};

export default function Create() {
  const { user, isSignedIn } = useUser();
  const { openSignIn } = useClerk();
  const { play, enabled: soundEnabled, toggle: toggleSound } = useSounds();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [data, setData] = useState<OnboardingData>({
    template: null,
    descricao: "",
    customizations: "",
  });
  const [generatedSiteId, setGeneratedSiteId] = useState<string | null>(null);
  const [pendingGeneration, setPendingGeneration] = useState(false);

  const [credits, setCredits] = useState<number | string>("-");

  useEffect(() => {
    async function fetchCredits() {
      if (isSignedIn && user) {
        try {
          const res = await fetch(`${API_URL}/api/user/${user.id}?email=${user.primaryEmailAddress?.emailAddress}`);
          if (!res.ok) throw new Error("Falha ao conectar no servidor");
          const data = await res.json();
          setCredits(data.credits);
        } catch (error) {
          console.error("Erro ao buscar créditos:", error);
          setCredits("?"); 
        }
      }
    }
    fetchCredits();
  }, [isSignedIn, user]);

  const filteredTemplates = getTemplatesByCategory(selectedCategory);

  useEffect(() => {
    if (pendingGeneration && isSignedIn && user) {
      setPendingGeneration(false);
      setTimeout(() => {
        executeGeneration();
      }, 500);
    }
  }, [isSignedIn, pendingGeneration, user]);

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      play("transition");
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleSelectTemplate = (template: Template) => {
    play("confirm");
    setData({ ...data, template });
  };

  const handleContinueFromCustomizations = () => {
    play("transition");
    navigate("/studio", {
      state: {
        initialPrompt: data.descricao,
      },
    });
  };

  const handleGenerate = async () => {
    if (!data.template) {
      premiumToast.error("Selecione um template");
      return;
    }

    if (!isSignedIn) {
      setPendingGeneration(true);
      openSignIn();
      return;
    }

    await executeGeneration();
  };

  const executeGeneration = async () => {
    if (!data.template || !user) return;

    play("confirm");
    setStep(5);

    try {
      const promptLimpo = `
        Categoria do Negócio: ${data.template.category}
        Descrição detalhada: ${data.descricao}
        Customizações do usuário: ${data.customizations || "Foco em alta conversão e profissionalismo."}
      `.trim();

      const response = await fetch(`${API_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptLimpo,
          userId: user.id,
          userEmail: user.primaryEmailAddress?.emailAddress,
        })
      });

      const resultBackend = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
            throw new Error(resultBackend.error || "Saldo insuficiente.");
        }
        throw new Error(resultBackend.error || "Erro desconhecido no servidor");
      }

      if (resultBackend.remainingCredits !== undefined) {
        setCredits(resultBackend.remainingCredits);
      }

      // IMPORTANTE: Agora codigoGerado é um objeto JSON, não HTML!
      const conteudoJson = resultBackend.code;
      const codigoHtml = resultBackend.html; // Novo: pega o HTML completo

      const fakeId = `site-${Date.now()}`;
      
      const newSiteData = {
        id: fakeId,
        user_id: user.id,
        name: conteudoJson.hero?.headline || `${data.template.name} - Site`,
        description: conteudoJson.hero?.subheadline || data.descricao,
        nicho: data.template.category,
        objetivo: data.template.category,
        estilo: data.template.style,
        content: conteudoJson, // <- SALVA O JSON AQUI EM 'content' em vez de 'html_content'
        html: codigoHtml,      // <- NOVO: Salva o HTML completo também
        has_watermark: true,
        created_at: new Date().toISOString(),
        is_published: false
      };

      const savedSites = JSON.parse(localStorage.getItem("mock_sites") || "[]");
      localStorage.setItem("mock_sites", JSON.stringify([newSiteData, ...savedSites]));

      play("success");
      setGeneratedSiteId(fakeId);
      
      setTimeout(() => {
        setStep(6);
      }, 500);

    } catch (err: any) {
      console.error("Erro na geração:", err);
      const mensagemErro = err.message.includes("Saldo") 
        ? err.message 
        : "A IA sofreu uma sobrecarga. Tente gerar novamente.";
        
      premiumToast.error("Erro na criação", mensagemErro);
      
      if (err.message.includes("Saldo")) {
        setTimeout(() => navigate("/pricing"), 2000);
      } else {
        setStep(4);
      }
    }
  };

  const canProceed = () => {
    switch (step) {
      case 0: return true;
      case 1: return data.template !== null;
      case 2: return data.descricao.length >= 20;
      case 3: return true;
      case 4: return true;
      default: return false;
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
          <div className="flex items-center gap-3">
             {boderLogo ? (
                <img src={boderLogo} alt="Boder AI" className="h-8 w-auto" />
             ) : (
                <span className="font-bold text-xl">Boder AI</span>
             )}
            <span className="text-xl font-semibold hidden sm:inline">Boder AI</span>
          </div>

          <div className="flex items-center gap-3">
            {isSignedIn ? (
              <div className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm">
                <Zap className="h-4 w-4 text-primary" />
                <span className="font-semibold">{credits}</span>
              </div>
            ) : (
              <Button size="sm" variant="ghost" onClick={() => navigate("/pricing")}>
                Preços
              </Button>
            )}
            <SoundToggle enabled={soundEnabled} onToggle={toggleSound} />
            <ThemeToggle />
          </div>
        </div>
      </motion.header>

      {/* Progress */}
      {step > 0 && step < 5 && (
        <motion.div
          className="fixed top-20 left-1/2 -translate-x-1/2 z-40"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm rounded-full px-4 py-2 border border-border">
            <span className="text-xs text-muted-foreground">
              Passo {step} de 4
            </span>
            <div className="h-1 w-24 rounded-full bg-border overflow-hidden">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${(step / 4) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <main className="relative flex min-h-screen items-center justify-center pt-16 pb-8 px-4">
        <AnimatePresence mode="wait">
          {/* Step 0: Entry */}
          {step === 0 && (
            <motion.div
              key="entry"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              className="max-w-2xl text-center"
            >
              <motion.div
                className="mb-8 relative"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
              >
                {boderLogo && (
                  <img
                    src={boderLogo}
                    alt="Boder AI"
                    className="h-28 w-auto mx-auto"
                  />
                )}
                <motion.div
                  className="absolute inset-0 bg-primary/30 blur-3xl -z-10"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </motion.div>

              <BlurText
                text="Crie sites que vendem. Em minutos."
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 justify-center"
                animateBy="words"
                delay={100}
              />

              <p className="text-lg text-muted-foreground mb-8">
                Escolha um template profissional e personalize com IA.
              </p>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size="xl"
                  onClick={handleNext}
                  className="gap-2 shadow-lg shadow-primary/25"
                >
                  Escolher Template
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* Step 1: Template Selection */}
          {step === 1 && (
            <motion.div
              key="template"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              className="w-full max-w-5xl"
            >
              <div className="text-center mb-8">
                <BlurText
                  text="Escolha seu template"
                  className="text-3xl md:text-4xl font-bold mb-3 justify-center"
                  animateBy="words"
                  delay={80}
                />
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                {TEMPLATE_CATEGORIES.map((cat) => {
                  const Icon = CATEGORY_ICONS[cat.id] || Grid;
                  return (
                    <Button
                      key={cat.id}
                      variant={selectedCategory === cat.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(cat.id)}
                      className="gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      {cat.label}
                    </Button>
                  );
                })}
              </div>

              {/* Template Grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredTemplates.map((template, i) => (
                  <motion.button
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => handleSelectTemplate(template)}
                    className={`group relative rounded-2xl border-2 overflow-hidden text-left transition-all ${
                      data.template?.id === template.id
                        ? "border-primary shadow-lg shadow-primary/20"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="h-36 w-full overflow-hidden bg-muted">
                      {template.previewImage ? (
                          <img 
                            src={template.previewImage} 
                            alt={template.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                      ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                             <Grid className="h-10 w-10 opacity-20"/>
                          </div>
                      )}
                    </div>

                    <div className="p-4 bg-card">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold">{template.name}</h3>
                        {data.template?.id === template.id && (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                            <Check className="h-3 w-3 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {template.description}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Description */}
          {step === 2 && (
            <motion.div
              key="descricao"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              className="w-full max-w-2xl text-center"
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mx-auto">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <BlurText
                text="Descreva seu negócio"
                className="text-3xl md:text-4xl font-bold mb-3 justify-center"
                animateBy="words"
                delay={80}
              />
              <p className="text-muted-foreground mb-8">
                A IA vai criar o Copywriting perfeito para você
              </p>

              <div className="relative">
                <textarea
                  value={data.descricao}
                  onChange={(e) => setData({ ...data, descricao: e.target.value })}
                  placeholder="Ex: Sou personal trainer especializado em emagrecimento feminino. Quero vender minha consultoria online focada em mulheres de 30 a 45 anos."
                  className="min-h-[200px] w-full resize-none rounded-2xl border-2 border-border bg-card/50 p-6 text-lg focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all backdrop-blur-sm"
                  autoFocus
                />
                <div className="absolute bottom-4 right-4 text-xs text-muted-foreground">
                  {data.descricao.length} / mínimo 20 caracteres
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Customization */}
          {step === 3 && (
            <motion.div
              key="customizacao"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              className="w-full max-w-2xl text-center"
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mx-auto">
                <Wand2 className="h-8 w-8 text-primary" />
              </div>
              <BlurText
                text="Personalizações extras"
                className="text-3xl md:text-4xl font-bold mb-3 justify-center"
                animateBy="words"
                delay={80}
              />
              
              <div className="relative">
                <textarea
                  value={data.customizations}
                  onChange={(e) => setData({ ...data, customizations: e.target.value })}
                  placeholder="Ex: Quero um tom mais agressivo focando na falta de tempo, use a cor vermelho escuro como destaque..."
                  className="min-h-[160px] w-full resize-none rounded-2xl border-2 border-border bg-card/50 p-6 text-lg focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all backdrop-blur-sm"
                />
              </div>
            </motion.div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && (
            <motion.div
              key="confirmacao"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              className="w-full max-w-md text-center"
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mx-auto">
                <Rocket className="h-8 w-8 text-primary" />
              </div>

              <BlurText
                text="Tudo pronto!"
                className="text-3xl font-bold mb-3 justify-center"
                animateBy="words"
                delay={80}
              />

              <div className="rounded-2xl border border-border bg-card/50 p-6 mb-8 text-left space-y-4">
                <div className="flex justify-between items-start">
                  <span className="text-muted-foreground">Template</span>
                  <span className="font-medium text-right">{data.template?.name}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-muted-foreground">Estilo</span>
                  <span className="font-medium capitalize">{data.template?.style}</span>
                </div>
                <div className="border-t border-border pt-4">
                  <span className="text-muted-foreground text-sm">Descrição</span>
                  <p className="text-sm mt-1 line-clamp-3">{data.descricao}</p>
                </div>
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size="xl"
                  onClick={handleGenerate}
                  className="w-full gap-2 shadow-lg shadow-primary/25"
                >
                  <Sparkles className="h-5 w-5" />
                  Gerar site com IA
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* Step 5: Generating */}
          {step === 5 && (
            <motion.div
              key="gerando"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex items-center justify-center py-8"
            >
              <PremiumGeneratingLoader templateName={data.template?.name} />
            </motion.div>
          )}

          {/* Step 6: Result */}
          {step === 6 && (
            <motion.div
              key="resultado"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mx-auto">
                <Check className="h-10 w-10 text-primary" />
              </div>

              <BlurText
                text="Seu site está pronto!"
                className="text-3xl font-bold mb-3 justify-center"
                animateBy="words"
                delay={80}
              />
              <p className="text-muted-foreground mb-8">
                Landing page criada com sucesso!
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <ShinyButton
                  className="gap-2"
                  onClick={() => generatedSiteId && navigate(`/preview/${generatedSiteId}`)}
                >
                  <Eye className="h-5 w-5" />
                  Visualizar
                </ShinyButton>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate("/dashboard")}
                >
                  Ir para o dashboard
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Navigation */}
      {step > 0 && step < 5 && (
        <motion.div
          className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button variant="ghost" size="lg" onClick={handleBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <ShinyButton
            onClick={step === 4 ? handleGenerate : step === 3 ? handleContinueFromCustomizations : handleNext}
            disabled={!canProceed()}
            size="default"
            className="min-w-[140px] gap-2"
          >
            {step === 4 ? (
              <>
                <Sparkles className="h-4 w-4" />
                Gerar
              </>
            ) : (
              <>
                Continuar
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </ShinyButton>
        </motion.div>
      )}
    </div>
  );
}
