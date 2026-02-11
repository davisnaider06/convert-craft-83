import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
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
  LayoutTemplate
} from "lucide-react";
const isPaid = false;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "ai",
      content: "Olá! Sou o seu Web Designer e Copywriter de IA. Descreva o negócio ou a ideia da landing page que quer criar hoje."
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [siteData, setSiteData] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("desktop");
  const [credits, setCredits] = useState<number | string>("-");
  const [currentSiteId, setCurrentSiteId] = useState<string | null>(null);

  // Busca os créditos iniciais
  useEffect(() => {
    async function fetchCredits() {
      if (isSignedIn && user) {
        try {
          const res = await fetch(`${API_URL}/api/user/${user.id}?email=${user.primaryEmailAddress?.emailAddress}`);
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

  // Rola o chat para baixo sempre que houver nova mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    if (!isSignedIn) {
      openSignIn();
      return;
    }

    const userText = inputValue;
    setInputValue("");
    
    // Adiciona a mensagem do utilizador ao chat
    const newUserMsg: Message = { id: Date.now().toString(), role: "user", content: userText };
    setMessages(prev => [...prev, newUserMsg]);
    setIsGenerating(true);

    try {
      // Lógica Inteligente: Se já existe um site, pede para AJUSTAR. Se não, pede para CRIAR.
      let promptParaBackend = "";
    if (siteData) {
        // PROMPT DE EDIÇÃO (Mais agressivo e claro)
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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptParaBackend,
          userId: user?.id,
          userEmail: user?.primaryEmailAddress?.emailAddress,
        })
      });

      const resultBackend = await response.json();

      if (!response.ok) {
        throw new Error(resultBackend.error || "Erro ao conectar com o servidor.");
      }

      if (resultBackend.remainingCredits !== undefined) {
        setCredits(resultBackend.remainingCredits);
      }

      const jsonGerado = resultBackend.code;
      
      // Atualiza o Canvas na hora
      setSiteData(jsonGerado);

      // ==========================================
      // LÓGICA DE SALVAMENTO PARA O DASHBOARD
      // ==========================================
      const savedSites = JSON.parse(localStorage.getItem("mock_sites") || "[]");

      if (!currentSiteId) {
        // 1. É UM SITE NOVO: Cria e salva
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
          estilo: "moderno"
        };
        localStorage.setItem("mock_sites", JSON.stringify([novoSite, ...savedSites]));
        setCurrentSiteId(novoId); // Guarda o ID para as próximas edições
      } else {
        // 2. É UMA EDIÇÃO: Encontra o site atual e atualiza o conteúdo
        const updatedSites = savedSites.map((s: any) => 
          s.id === currentSiteId 
            ? { ...s, content: jsonGerado, name: jsonGerado.hero?.headline || s.name } 
            : s
        );
        localStorage.setItem("mock_sites", JSON.stringify(updatedSites));
      }
      // ==========================================

      // Adiciona a resposta da IA ao chat
      const aiResponseText = siteData 
        ? "Feito! Apliquei os ajustes que pediu. O que acha agora?" 
        : "Incrível! Criei a primeira versão do seu site com base na sua ideia. Pode pedir para eu alterar cores, textos ou seções!";
        
      setMessages(prev => [...prev, { id: Date.now().toString(), role: "ai", content: aiResponseText }]);

    } catch (err: any) {
      console.error(err);
      premiumToast.error("Erro na geração", err.message);
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: "ai", 
        content: "Desculpe, encontrei um erro ao processar o seu pedido. Pode tentar novamente?" 
      }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
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
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="text-slate-400 hover:text-white hover:bg-slate-800">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              {boderLogo ? (
                <img src={boderLogo} alt="Logo" className="h-5 w-auto brightness-0 invert" />
              ) : (
                <Sparkles className="h-4 w-4 text-primary" />
              )}
              <span className="font-semibold text-white text-sm tracking-wide">Boder Studio</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800">
            <Sparkles className="h-3 w-3 text-primary" />
            <span className="text-xs font-medium text-slate-300">{credits}</span>
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
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === "ai" ? "bg-primary/20 text-primary" : "bg-slate-800 text-slate-300"
                }`}>
                  {msg.role === "ai" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </div>
                <div className={`p-3 text-sm leading-relaxed rounded-2xl max-w-[85%] ${
                  msg.role === "user" 
                    ? "bg-slate-800 text-slate-200 rounded-tr-sm" 
                    : "bg-transparent text-slate-300 border border-slate-800/60 rounded-tl-sm"
                }`}>
                  {msg.content}
                </div>
              </motion.div>
            ))}
            
            {/* Indicador de "Gerando..." */}
            {isGenerating && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
                <div className="p-3 text-sm text-slate-400 bg-slate-900/50 border border-slate-800/60 rounded-2xl rounded-tl-sm max-w-[85%] flex flex-col gap-2">
                  <span className="flex items-center gap-2"><Code2 className="h-3 w-3" /> Estruturando código...</span>
                  <span className="flex items-center gap-2 text-primary/70 animate-pulse"><Wand2 className="h-3 w-3" /> Aplicando Copywriting...</span>
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
              placeholder={siteData ? "Ex: Pinta o botão de verde..." : "Descreva o seu negócio..."}
              className="w-full max-h-32 min-h-[52px] bg-transparent text-white p-3 pr-12 text-sm resize-none focus:outline-none scrollbar-none"
              disabled={isGenerating}
            />
            <Button 
              size="icon" 
              variant="ghost" 
              className="absolute right-1 bottom-1 h-9 w-9 text-slate-400 hover:text-primary hover:bg-primary/10 disabled:opacity-50"
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isGenerating}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-[10px] text-center text-slate-500 mt-2 font-medium">
            Prima <kbd className="bg-slate-800 px-1 py-0.5 rounded text-slate-400">Enter</kbd> para enviar
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
              className={`h-8 px-3 rounded-md gap-2 ${viewMode === "desktop" ? "bg-white shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
            >
              <Monitor className="h-4 w-4" />
              <span className="hidden lg:inline text-xs font-medium">Desktop</span>
            </Button>
            <Button
              variant={viewMode === "mobile" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("mobile")}
              className={`h-8 px-3 rounded-md gap-2 ${viewMode === "mobile" ? "bg-white shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
            >
              <Smartphone className="h-4 w-4" />
              <span className="hidden lg:inline text-xs font-medium">Mobile</span>
            </Button>
          </div>

          <div className="flex items-center gap-3">
            {siteData && (
              <Button size="sm" className="h-9 gap-2 shadow-md shadow-primary/20 hover:shadow-lg transition-all">
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
                  viewMode === "mobile" ? "w-[375px] min-h-[667px]" : "w-full max-w-[1200px]"
                }`}
                style={{ height: viewMode === "mobile" ? "800px" : "calc(100vh - 120px)" }}
              >
                <div className="w-full h-full overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-200">
                  <SiteRenderer data={siteData} viewMode={viewMode} />
                  {/* Marca d'água Sutil (Glass Badge) */}
                    {!isPaid && (
                        <motion.a
                        href="https://boder.app"
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: 0.5, type: "spring" }}
                        className="absolute bottom-4 right-4 z-50 flex items-center gap-1.5 rounded-full bg-white/70 pl-2 pr-3 py-1.5 text-[11px] font-medium text-slate-600 backdrop-blur-md border border-white/50 shadow-sm transition-all hover:bg-white hover:text-primary hover:shadow-md hover:scale-105 group"
                        style={{boxShadow: "0 2px 10px rgba(0,0,0,0.05)"}}
                        >
                        {boderLogo ? (
                            <img src={boderLogo} alt="Boder Logo" className="h-3.5 w-auto opacity-70 group-hover:opacity-100 transition-opacity" />
                        ) : (
                            <Sparkles className="h-3.5 w-3.5 text-primary/70 group-hover:text-primary transition-colors" />
                        )}
                        <span>Criado com <strong className="font-bold">Boder AI</strong></span>
                        </motion.a>
                    )}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="canvas-empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="w-full max-w-2xl h-full flex flex-col items-center justify-center text-center px-4"
              >
                <div className="w-20 h-20 bg-slate-200/50 rounded-3xl flex items-center justify-center mb-6 shadow-inner border border-white">
                  <LayoutTemplate className="h-10 w-10 text-slate-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-700 mb-3">O seu Canvas está vazio</h2>
                <p className="text-slate-500 max-w-md leading-relaxed">
                  Use o chat à esquerda para descrever o seu negócio. A IA vai pensar na estrutura, escrever o texto persuasivo e desenhar o site aqui mesmo.
                </p>
                <div className="mt-8 grid grid-cols-2 gap-3 w-full max-w-md">
                  <div className="p-3 rounded-xl bg-white border border-slate-200 text-left text-xs text-slate-500 shadow-sm cursor-pointer hover:border-primary/40 hover:text-slate-700 transition-colors" onClick={() => setInputValue("Cria uma landing page para a minha barbearia vintage. Quero foco em agendamentos online.")}>
                    "Cria uma landing page para a minha barbearia vintage..."
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-slate-200 text-left text-xs text-slate-500 shadow-sm cursor-pointer hover:border-primary/40 hover:text-slate-700 transition-colors" onClick={() => setInputValue("Site para a minha consultoria de marketing. Quero um tom corporativo e azul escuro.")}>
                    "Site para a minha consultoria de marketing corporativo..."
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}