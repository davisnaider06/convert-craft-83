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

const isPaid = false;
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
}

type ViewMode = "desktop" | "mobile";

export default function Studio() {
  const { user, isSignedIn } = useUser();
  const { openSignIn } = useClerk();
  const navigate = useNavigate();
  const location = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
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

  // 1. Busca os créditos iniciais
  useEffect(() => {
    async function fetchCredits() {
      if (isSignedIn && user) {
        try {
          const res = await fetch(
            `${API_URL}/api/user/${user.id}?email=${user.primaryEmailAddress?.emailAddress}`,
          );
          if (res.ok) {
            const data = await res.json();
            setCredits(data.credits);
          }
        } catch (error) {
          console.error("Erro ao buscar créditos:", error);
        }
      }
    }
    fetchCredits();
  }, [isSignedIn, user]);

  // 2. Rola o chat para baixo
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating]);

  // 3. LÓGICA INTELIGENTE DE INICIALIZAÇÃO (Rascunho vs Novo)
  useEffect(() => {
    if (!isSignedIn) return;

    // A. Verifica se tem um rascunho salvo no navegador (Recuperação de F5)
    // Mas SÓ recupera se não tivermos passado um ID específico para carregar (modo edição do dashboard)
    const loadSiteId = location.state?.loadSiteId;
    
    if (loadSiteId) {
        // Modo Edição: Carregar do LocalStorage "banco de dados fake"
        const storedSites = JSON.parse(localStorage.getItem("mock_sites") || "[]");
        const foundSite = storedSites.find((s: any) => s.id === loadSiteId);
        if (foundSite) {
            setSiteData(foundSite.content);
            setCurrentSiteId(foundSite.id);
            if (foundSite.subdomain) setSubdomainInput(foundSite.subdomain);
            setMessages(prev => [...prev, { id: "loaded", role: "ai", content: `Carreguei o site "${foundSite.name}". O que deseja ajustar?` }]);
        }
        return;
    }

    const savedDraft = sessionStorage.getItem("current_draft_site");
    if (savedDraft) {
        console.log("📂 Recuperando rascunho do cache (sem gastar créditos)...");
        const parsedDraft = JSON.parse(savedDraft);
        setSiteData(parsedDraft);
        // Recupera também o ID se tiver
        const savedId = sessionStorage.getItem("current_draft_id");
        if (savedId) setCurrentSiteId(savedId);
        return; // PARA AQUI! Não chama a IA.
    }

    // B. Se não tem rascunho, verifica se tem prompt vindo do /create
    const navState = location.state as { initialPrompt?: string } | null;
    const promptFromCreate = navState?.initialPrompt?.trim();

    if (promptFromCreate && !hasFetchedInitial.current) {
        hasFetchedInitial.current = true;
        setInputValue(promptFromCreate);
        // Chama a função de gerar (dispara o chat)
        void handleSendMessage(promptFromCreate);
    }
  }, [isSignedIn, location.state]);

  // --- FUNÇÃO DE ENVIO DE MENSAGEM (CHAT) ---
  const handleSendMessage = async (forcedText?: string) => {
    const textToSend = (forcedText ?? inputValue).trim();
    if (!textToSend) return;

    if (!isSignedIn) {
      openSignIn();
      return;
    }

    const userText = textToSend;
    setInputValue("");

    // Adiciona a mensagem do utilizador ao chat
    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userText,
    };
    setMessages((prev) => [...prev, newUserMsg]);
    setIsGenerating(true);

    try {
      // Lógica Inteligente: Se já existe um site, pede para AJUSTAR. Se não, pede para CRIAR.
      let promptParaBackend = "";
      if (siteData) {
        // PROMPT DE EDIÇÃO
        promptParaBackend = `
          O usuário quer fazer uma ALTERAÇÃO no site atual.
          PEDIDO DO USUÁRIO: "${userText}"
          
          AQUI ESTÁ O JSON ATUAL DO SITE:
          ${JSON.stringify(siteData)}
          
          TAREFA: Retorne o JSON completo atualizado. Mantenha TODA a estrutura e textos exatamente iguais, alterando APENAS os campos necessários para atender ao pedido do usuário. 
          IMPORTANTE: Se ele pedir para mudar a cor, altere os códigos HEX dentro do objeto 'colors'.
        `;
      } else {
        // PROMPT DE CRIAÇÃO
        promptParaBackend = `
          Aja como Copywriter e Web Designer. Crie a estrutura e o texto (JSON) para um site do zero com esta descrição:
          "${userText}"
        `;
      }

      const response = await fetch(`${API_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptParaBackend,
          userId: user?.id,
          userEmail: user?.primaryEmailAddress?.emailAddress,
        }),
      });

      const resultBackend = await response.json();

      if (!response.ok) {
        throw new Error(
          resultBackend.error || "Erro ao conectar com o servidor.",
        );
      }

      if (resultBackend.remainingCredits !== undefined) {
        setCredits(resultBackend.remainingCredits);
      }

      const jsonGerado = resultBackend.code;

      // 1. Atualiza o Canvas na hora
      setSiteData(jsonGerado);

      // 2. SALVA NO CACHE DO NAVEGADOR (RASCUNHO)
      sessionStorage.setItem("current_draft_site", JSON.stringify(jsonGerado));

      // 3. SALVA NO LOCALSTORAGE (HISTÓRICO PERMANENTE)
      const savedSites = JSON.parse(localStorage.getItem("mock_sites") || "[]");

      if (!currentSiteId) {
        // É UM SITE NOVO
        const novoId = `site-${Date.now()}`;
        const novoSite = {
          id: novoId,
          user_id: user?.id,
          name: jsonGerado.hero?.headline || "Novo Site Gerado",
          description: jsonGerado.hero?.subheadline || userText,
          content: jsonGerado,
          has_watermark: true,
          created_at: new Date().toISOString(),
          is_published: false,
          nicho: "landing",
          estilo: "moderno",
        };
        localStorage.setItem(
          "mock_sites",
          JSON.stringify([novoSite, ...savedSites]),
        );
        setCurrentSiteId(novoId); 
        sessionStorage.setItem("current_draft_id", novoId); // Salva ID no cache também
      } else {
        // É UMA EDIÇÃO
        const updatedSites = savedSites.map((s: any) =>
          s.id === currentSiteId
            ? {
                ...s,
                content: jsonGerado,
                name: jsonGerado.hero?.headline || s.name,
              }
            : s,
        );
        localStorage.setItem("mock_sites", JSON.stringify(updatedSites));
      }

      // Adiciona a resposta da IA ao chat
      const aiResponseText = siteData
        ? "Feito! Apliquei os ajustes que pediu. O que acha agora?"
        : "Incrível! Criei a primeira versão do seu site. Pode pedir para eu alterar cores, textos ou seções!";

      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: "ai", content: aiResponseText },
      ]);
    } catch (err: any) {
      console.error(err);
      premiumToast.error("Erro na geração", err.message);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "ai",
          content:
            "Desculpe, encontrei um erro ao processar o seu pedido. Pode tentar novamente?",
        },
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
      const response = await fetch(`${API_URL}/api/sites/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteId: currentSiteId, 
          subdomain: subdomainInput,
          userId: user?.id,
          content: siteData, 
          name: siteData.hero?.headline || "Novo Site",
          description: siteData.hero?.subheadline || ""
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erro desconhecido");

      if (data.site && data.site.id) {
          setCurrentSiteId(data.site.id);
          const savedSites = JSON.parse(localStorage.getItem("mock_sites") || "[]");
          const updatedSites = savedSites.map((s: any) => 
            s.id === currentSiteId ? { ...s, id: data.site.id, subdomain: subdomainInput, is_published: true } : s
          );
          localStorage.setItem("mock_sites", JSON.stringify(updatedSites));
      }

      premiumToast.success("Site Publicado!", "Seu site já está no ar.");
      setIsPublishModalOpen(false);
      
      // Limpa o rascunho pois já foi publicado (opcional, mas bom pra fluxo limpo)
      // sessionStorage.removeItem("current_draft_site");
      
      window.open(`https://${subdomainInput}.boder.app`, '_blank');

    } catch (error: any) {
      console.error(error);
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
            <div ref={messagesEndRef} />
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