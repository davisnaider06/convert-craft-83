import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser, useClerk } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { premiumToast } from "@/components/ui/premium-toast";
import { SiteRenderer } from "@/components/boder/SiteRenderer";
import boderLogo from "@/assets/boder-logo.png";
import {
  Send,
  Loader2,
  Monitor,
  Smartphone,
  Globe,
  Rocket,
  ArrowLeft,
  Sparkles,
  Bot,
  User,
  Wand2,
  Code2,
  LayoutTemplate,
} from "lucide-react";
import { readApiResponse, useApiClient } from "@/lib/apiClient";

const isPaid = false;

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
}

type ViewMode = "desktop" | "mobile";

interface GenerationContext {
  templateName?: string;
  templateCategory?: string;
  templateStyle?: string;
  templatePrompt?: string;
  userPrompt?: string;
  customizations?: string;
  mustHave?: string[];
}

const KNOWN_SECTION_KEYS: Record<string, string> = {
  navbar: "navbar",
  hero: "hero",
  featureGrid: "feature-grid",
  feature_grid: "feature-grid",
  testimonialSlider: "testimonial-slider",
  testimonial_slider: "testimonial-slider",
  pricingTable: "pricing-table",
  pricing_table: "pricing-table",
  faqSection: "faq-section",
  faq_section: "faq-section",
  ctaSection: "cta-section",
  cta_section: "cta-section",
  productCatalog: "product-catalog",
  product_catalog: "product-catalog",
  profileHeader: "profile-header",
  profile_header: "profile-header",
  linkButtons: "link-buttons",
  link_buttons: "link-buttons",
  projectGallery: "project-gallery",
  project_gallery: "project-gallery",
  socialProof: "social-proof",
  social_proof: "social-proof",
  footerSection: "footer-section",
  footer_section: "footer-section",
};

function normalizeGeneratedSite(raw: any) {
  if (!raw || typeof raw !== "object") return null;

  if (Array.isArray(raw.sections)) return raw;
  if (raw.content && Array.isArray(raw.content.sections)) return raw.content;

  const sections = Object.entries(KNOWN_SECTION_KEYS)
    .filter(([key]) => raw[key] && typeof raw[key] === "object")
    .map(([key, type]) => ({ type, ...(raw[key] as Record<string, unknown>) }));

  if (sections.length > 0) {
    return {
      colors: raw.colors || { primary: "#3b82f6", secondary: "#0f172a", accent: "#14b8a6" },
      sections,
    };
  }

  return null;
}

export default function Studio() {
  const { user, isSignedIn } = useUser();
  const { openSignIn } = useClerk();
  const { apiFetch } = useApiClient();
  const navigate = useNavigate();
  const location = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const generationContextRef = useRef<GenerationContext | null>(null);
  
  // Controle para evitar chamadas duplas e loops
  const hasFetchedInitial = useRef(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "ai",
      content:
        "Olá! Sou o seu Web Designer e Copywriter de IA. Descreva o negócio ou a ideia da landing page que quer criar hoje.",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [siteData, setSiteData] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("desktop");
  const [credits, setCredits] = useState<number | string>("-");
  
  // --- ESTADOS PARA PUBLICAÇÃO ---
  const [currentSiteId, setCurrentSiteId] = useState<string | null>(null);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [subdomainInput, setSubdomainInput] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);

  const extractMustHave = (userPrompt: string, customizations?: string) => {
    const raw = `${userPrompt}\n${customizations || ""}`
      .split(/\n|;|,|\. /)
      .map((s) => s.trim())
      .filter((s) => s.length > 8);
    return Array.from(new Set(raw)).slice(0, 12);
  };

  // 1. Busca os créditos iniciais
  useEffect(() => {
    async function fetchCredits() {
      if (isSignedIn && user) {
        try {
          const res = await apiFetch(
            `/api/user/${user.id}?email=${user.primaryEmailAddress?.emailAddress}`,
          );
          if (res.ok) {
            const data = await res.json();
            setCredits(data.credits);
          }
        } catch (error) {
          console.warn("Erro ao buscar créditos:", error);
        }
      }
    }
    fetchCredits();
  }, [isSignedIn, user]);

  // 2. Rola o chat para baixo
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating]);

 

useEffect(() => {
  if (!isSignedIn) return;

  const navState = location.state as { 
    loadSiteId?: string; 
    initialPrompt?: string; 
    templateId?: string;
    templateName?: string;
    templateCategory?: string;
    templateStyle?: string;
    templateBasePrompt?: string;
    customizations?: string;
  } | null;

  // 1. Carregar site existente do Dashboard
  if (navState?.loadSiteId && !hasFetchedInitial.current) {
      hasFetchedInitial.current = true;
      void (async () => {
        try {
          const response = await apiFetch(`/api/sites/${navState.loadSiteId}`);
          const parsed = await readApiResponse(response);
          if (!parsed.ok) throw new Error(parsed.error || "Falha ao carregar site");

          const foundSite = parsed.data.site;
          setSiteData(foundSite.content);
          setCurrentSiteId(foundSite.id);
          setMessages([{ id: "loaded", role: "ai", content: `Site "${foundSite.name}" carregado. O que vamos ajustar?` }]);
        } catch (error) {
          premiumToast.error("Erro", "Não foi possível carregar o site selecionado.");
          navigate("/dashboard");
        }
      })();
      return;
  }

  // 2. Recuperar de F5
  const savedDraft = sessionStorage.getItem("current_draft_site");
  if (savedDraft && !siteData) {
      setSiteData(JSON.parse(savedDraft));
      const savedId = sessionStorage.getItem("current_draft_id");
      if (savedId) setCurrentSiteId(savedId);
      return;
  }

  // 3. NOVO FLUXO: Criar com Template
  if (navState?.initialPrompt && !hasFetchedInitial.current) {
      hasFetchedInitial.current = true;
      
      const generationContext: GenerationContext = {
        templateName: navState.templateName,
        templateCategory: navState.templateCategory,
        templateStyle: navState.templateStyle,
        templatePrompt: navState.templateBasePrompt,
        userPrompt: navState.initialPrompt,
        customizations: navState.customizations || "",
        mustHave: extractMustHave(navState.initialPrompt, navState.customizations),
      };
      generationContextRef.current = generationContext;

      setInputValue(""); // Limpa o input visual
      void handleSendMessage(navState.initialPrompt, {
        templateId: navState.templateId,
        generationContext,
      });
  }
}, [isSignedIn, location.state]);
 const handleSendMessage = async (
  forcedText?: string,
  options?: { templateId?: string; generationContext?: GenerationContext }
 ) => {
  const textToSend = (forcedText ?? inputValue).trim();
  if (!textToSend || isGenerating) return;

  if (!isSignedIn) { openSignIn(); return; }

  // Adiciona ao chat (limpando o prompt técnico para o usuário não ver a tripa de texto)
  const newUserMsg: Message = {
    id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    role: "user",
    content: forcedText ? "Gerando site com base nas minhas preferências..." : textToSend,
  };
  
  setMessages((prev) => [...prev, newUserMsg]);
  setIsGenerating(true);
  setInputValue("");

  try {
    const response = await apiFetch(`/api/generate`, {
      method: "POST",
      body: JSON.stringify({
        prompt: textToSend,
        userId: user?.id,
        userEmail: user?.primaryEmailAddress?.emailAddress,
        templateId: options?.templateId || null,
        generationContext: options?.generationContext || {
          ...(generationContextRef.current || {}),
          userPrompt: textToSend,
          mustHave: extractMustHave(
            textToSend,
            generationContextRef.current?.customizations || "",
          ),
        },
      }),
    });

    const parsedGenerate = await readApiResponse(response);
    if (!parsedGenerate.ok) throw new Error(parsedGenerate.error || "Falha ao gerar site");
    const resultBackend = parsedGenerate.data;

    if (resultBackend.remainingCredits !== undefined) setCredits(resultBackend.remainingCredits);

    const normalizedSite = normalizeGeneratedSite(resultBackend.code);
    if (!normalizedSite) {
      throw new Error("A IA retornou um formato invÃ¡lido. Tente gerar novamente.");
    }
    setSiteData(normalizedSite);

    // Salva caches
    sessionStorage.setItem("current_draft_site", JSON.stringify(normalizedSite));
    const heroHeadline = normalizedSite.sections.find((s: any) => s.type === "hero")?.headline || "Novo Site";
    const heroSubheadline = normalizedSite.sections.find((s: any) => s.type === "hero")?.subheadline || textToSend;
    const draftResponse = await apiFetch("/api/sites/draft", {
      method: "POST",
      body: JSON.stringify({
        siteId: currentSiteId || null,
        content: normalizedSite,
        name: heroHeadline,
        description: heroSubheadline,
      }),
    });
    const parsedDraft = await readApiResponse(draftResponse);
    if (!parsedDraft.ok) throw new Error(parsedDraft.error || "Falha ao salvar rascunho");
    const draftPayload = parsedDraft.data;
    setCurrentSiteId(draftPayload.site.id);
    sessionStorage.setItem("current_draft_id", draftPayload.site.id);
    setMessages((prev) => [...prev, { id: `ai-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`, role: "ai", content: "Site gerado com sucesso! Como posso refinar?" }]);

  } catch (err: any) {
    premiumToast.error("Erro", err?.message || "Falha ao gerar site");
    setMessages((prev) => [
      ...prev,
      { id: `err-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`, role: "ai", content: "Houve um erro tÃ©cnico ao montar o site. Tente novamente." }
    ]);
  } finally {
    setIsGenerating(false);
  }
};

  const handlePublishConfirm = async () => {
    if (!subdomainInput || !siteData) {
      premiumToast.error("Erro", "Gere um site antes de publicar.");
      return;
    }
    
    setIsPublishing(true);

    try {
      const response = await apiFetch(`/api/sites/publish`, {
        method: "POST",
      body: JSON.stringify({
          siteId: currentSiteId, 
          subdomain: subdomainInput,
          userId: user?.id,
          content: siteData, 
          name: siteData.sections?.find((s: any) => s.type === "hero")?.headline || "Novo Site",
          description: siteData.sections?.find((s: any) => s.type === "hero")?.subheadline || ""
        })
      });

      const parsedPublish = await readApiResponse(response);
      if (!parsedPublish.ok) throw new Error(parsedPublish.error || "Erro desconhecido");
      const data = parsedPublish.data;

      if (data.site && data.site.id) {
          setCurrentSiteId(data.site.id);
      }

      premiumToast.success("Site Publicado!", "Seu site já está no ar.");
      setIsPublishModalOpen(false);
      
      // Limpa o rascunho pois já foi publicado (opcional, mas bom pra fluxo limpo)
      // sessionStorage.removeItem("current_draft_site");
      
      window.open(`https://${subdomainInput}.boder.app`, '_blank');

    } catch (error: any) {
      premiumToast.error("Erro ao publicar", error.message);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans">
      {/* ================= BARRA LATERAL (WORKSPACE / CHAT) ================= */}
      <aside className="w-[380px] h-full bg-slate-950 text-slate-300 flex flex-col flex-shrink-0 border-r border-slate-800 relative z-20 shadow-2xl">
        {/* Topo da Sidebar */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/60 bg-slate-950/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
              className="text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              {boderLogo ? (
                <img
                  src={boderLogo}
                  alt="Logo"
                  className="h-5 w-auto brightness-0 invert"
                />
              ) : (
                <Sparkles className="h-4 w-4 text-primary" />
              )}
              <span className="font-semibold text-white text-sm tracking-wide">
                Boder Studio
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800">
            <Sparkles className="h-3 w-3 text-primary" />
            <span className="text-xs font-medium text-slate-300">
              {credits}
            </span>
          </div>
        </div>

        {/* Área de Mensagens (Chat) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === "ai"
                      ? "bg-primary/20 text-primary"
                      : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {msg.role === "ai" ? (
                    <Bot className="h-4 w-4" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </div>
                <div
                  className={`p-3 text-sm leading-relaxed rounded-2xl max-w-[85%] ${
                    msg.role === "user"
                      ? "bg-slate-800 text-slate-200 rounded-tr-sm"
                      : "bg-transparent text-slate-300 border border-slate-800/60 rounded-tl-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </motion.div>
            ))}

            {/* Indicador de "Gerando..." */}
            {isGenerating && (
              <motion.div
                key="chat-generating"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
                <div className="p-3 text-sm text-slate-400 bg-slate-900/50 border border-slate-800/60 rounded-2xl rounded-tl-sm max-w-[85%] flex flex-col gap-2">
                  <span className="flex items-center gap-2">
                    <Code2 className="h-3 w-3" /> Estruturando código...
                  </span>
                  <span className="flex items-center gap-2 text-primary/70 animate-pulse">
                    <Wand2 className="h-3 w-3" /> Aplicando Copywriting...
                  </span>
                </div>
              </motion.div>
            )}
            <div key="chat-end-anchor" ref={messagesEndRef} />
          </AnimatePresence>
        </div>

        {/* Área de Input */}
        <div className="p-4 bg-slate-950 border-t border-slate-800/60">
          <div className="relative flex items-end bg-slate-900 border border-slate-700 focus-within:border-primary/50 rounded-xl overflow-hidden transition-colors">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                siteData
                  ? "Ex: Pinta o botão de verde..."
                  : "Descreva o seu negócio..."
              }
              className="w-full max-h-32 min-h-[52px] bg-transparent text-white p-3 pr-12 text-sm resize-none focus:outline-none scrollbar-none"
              disabled={isGenerating}
            />
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-1 bottom-1 h-9 w-9 text-slate-400 hover:text-primary hover:bg-primary/10 disabled:opacity-50"
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isGenerating}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-[10px] text-center text-slate-500 mt-2 font-medium">
            Prima{" "}
            <kbd className="bg-slate-800 px-1 py-0.5 rounded text-slate-400">
              Enter
            </kbd>{" "}
            para enviar
          </p>
        </div>
      </aside>

      {/* ================= ÁREA DO CANVAS (PREVIEW DO SITE) ================= */}
      <main className="flex-1 flex flex-col h-full bg-slate-100/50 relative">
        {/* Topbar do Canvas */}
        <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-slate-200 z-10 shadow-sm">
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200/60">
            <Button
              variant={viewMode === "desktop" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("desktop")}
              className={`h-8 px-3 rounded-md gap-2 transition-all duration-200 ${
                viewMode === "desktop"
                  ? "bg-white shadow-sm text-slate-900"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              <Monitor className="h-4 w-4" />
              <span className="hidden lg:inline text-xs font-medium">
                Desktop
              </span>
            </Button>

            <Button
              variant={viewMode === "mobile" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("mobile")}
              className={`h-8 px-3 rounded-md gap-2 transition-all duration-200 ${
                viewMode === "mobile"
                  ? "bg-white shadow-sm text-slate-900"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              <Smartphone className="h-4 w-4" />
              <span className="hidden lg:inline text-xs font-medium">
                Mobile
              </span>
            </Button>
          </div>

          <div className="flex items-center gap-3">
            {/* BOTÃO DE PUBLICAR (ACIONA O MODAL) */}
            {siteData && (
              <Button 
                size="sm" 
                onClick={() => setIsPublishModalOpen(true)}
                className="h-9 gap-2 shadow-md shadow-primary/20 hover:shadow-lg transition-all"
              >
                <Rocket className="h-4 w-4" />
                <span className="text-sm">Publicar</span>
              </Button>
            )}
          </div>
        </header>

        {/* Container do Site Renderizado */}
        <div className="flex-1 overflow-auto p-4 md:p-8 flex justify-center items-start pattern-grid-slate-200/50">
          <AnimatePresence mode="wait">
            {siteData ? (
              <motion.div
                key="canvas-active"
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
                className={`bg-white rounded-xl shadow-2xl shadow-slate-200/50 border border-slate-200/60 overflow-hidden relative transition-all duration-300 ${
                  viewMode === "mobile"
                    ? "w-[375px] min-h-[667px]"
                    : "w-full max-w-[1200px]"
                }`}
                style={{
                  height:
                    viewMode === "mobile" ? "800px" : "calc(100vh - 120px)",
                }}
              >
                <div className="w-full h-full overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-200 relative">
                  <SiteRenderer data={siteData} viewMode={viewMode} />
                  
                  {/* Marca d'água Sutil */}
                  {!isPaid && (
                    <motion.a
                      href="https://boder.app"
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: 0.5, type: "spring" }}
                      className="absolute bottom-4 right-4 z-50 flex items-center gap-1.5 rounded-full bg-white/70 pl-2 pr-3 py-1.5 text-[11px] font-medium text-slate-600 backdrop-blur-md border border-white/50 shadow-sm transition-all hover:bg-white hover:text-primary hover:shadow-md hover:scale-105 group"
                      style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}
                    >
                      {boderLogo ? (
                        <img
                          src={boderLogo}
                          alt="Boder Logo"
                          className="h-3.5 w-auto opacity-70 group-hover:opacity-100 transition-opacity"
                        />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5 text-primary/70 group-hover:text-primary transition-colors" />
                      )}
                      <span>
                        Criado com{" "}
                        <strong className="font-bold">Boder AI</strong>
                      </span>
                    </motion.a>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="canvas-empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full max-w-2xl h-full flex flex-col items-center justify-center text-center px-4"
              >
                <div className="w-20 h-20 bg-slate-200/50 rounded-3xl flex items-center justify-center mb-6 shadow-inner border border-white">
                  <LayoutTemplate className="h-10 w-10 text-slate-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-700 mb-3">
                  O seu Canvas está vazio
                </h2>
                <p className="text-slate-500 max-w-md leading-relaxed">
                  Use o chat à esquerda para descrever o seu negócio. A IA vai
                  pensar na estrutura, escrever o texto persuasivo e desenhar o
                  site aqui mesmo.
                </p>
                <div className="mt-8 grid grid-cols-2 gap-3 w-full max-w-md">
                  <div
                    className="p-3 rounded-xl bg-white border border-slate-200 text-left text-xs text-slate-500 shadow-sm cursor-pointer hover:border-primary/40 hover:text-slate-700 transition-colors"
                    onClick={() =>
                      setInputValue(
                        "Cria uma landing page para a minha barbearia vintage. Quero foco em agendamentos online.",
                      )
                    }
                  >
                    "Cria uma landing page para a minha barbearia vintage..."
                  </div>
                  <div
                    className="p-3 rounded-xl bg-white border border-slate-200 text-left text-xs text-slate-500 shadow-sm cursor-pointer hover:border-primary/40 hover:text-slate-700 transition-colors"
                    onClick={() =>
                      setInputValue(
                        "Site para a minha consultoria de marketing. Quero um tom corporativo e azul escuro.",
                      )
                    }
                  >
                    "Site para a minha consultoria de marketing corporativo..."
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* ================= MODAL DE PUBLICAÇÃO ================= */}
      <AnimatePresence>
        {isPublishModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" style={{zIndex: 9999}}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl border border-slate-200"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Publicar seu Site</h2>
                  <p className="text-xs text-slate-500">Escolha um endereço único para o seu projeto.</p>
                </div>
              </div>
              
              <div className="flex items-center bg-slate-50 border border-slate-300 rounded-lg overflow-hidden mb-6 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                <input 
                  type="text" 
                  value={subdomainInput}
                  onChange={(e) => setSubdomainInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} 
                  placeholder="ex-minha-loja"
                  className="flex-1 bg-transparent p-3 outline-none text-slate-900 font-medium text-right"
                  autoFocus
                />
                <span className="bg-slate-100 p-3 text-slate-500 font-medium border-l border-slate-300 select-none">.boder.app</span>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setIsPublishModalOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  className="flex-1 gap-2" 
                  onClick={handlePublishConfirm} 
                  disabled={isPublishing || !subdomainInput.trim()}
                >
                  {isPublishing ? <Loader2 className="animate-spin h-4 w-4" /> : <><Rocket className="h-4 w-4" /> Publicar Agora</>}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

