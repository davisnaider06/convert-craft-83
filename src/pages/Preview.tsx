import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AnimatedBackground } from "@/components/boder/AnimatedBackground";
import { ThemeToggle } from "@/components/boder/ThemeToggle";
import { ConfettiCelebration } from "@/components/boder/ConfettiCelebration";
import { useUser } from "@clerk/clerk-react"; 

import { premiumToast } from "@/components/ui/premium-toast";
import { SiteRenderer } from "@/components/boder/SiteRenderer"; 
import {
  ArrowLeft,
  Smartphone,
  Monitor,
  Loader2,
  Check,
  ExternalLink,
  Globe,
  Rocket,
  Wand2,
  History,
} from "lucide-react";
import boderLogo from "@/assets/boder-logo.png";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface SiteData {
  id: string;
  name: string;
  description: string | null;
  content: any | null; 
  has_watermark: boolean;
  is_published: boolean;
  subdomain: string | null;
  custom_domain: string | null;
  published_at: string | null;
  estilo: string | null;
  nicho: string | null;
}

type ViewMode = "desktop" | "mobile";

export default function Preview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUser(); 

  const [site, setSite] = useState<SiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("desktop");
  
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishing, setPublishing] = useState(false);
  
  const [subdomainInput, setSubdomainInput] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [publishResult, setPublishResult] = useState<{ publicUrl: string } | null>(null);

  const isPaid = false; 

  useEffect(() => {
    if (id) loadSite();
  }, [id]);

  const loadSite = async () => {
    if (!id) return;
    try {
      const storedSites = JSON.parse(localStorage.getItem("mock_sites") || "[]");
      const foundSite = storedSites.find((s: any) => s.id === id);

      if (foundSite) {
        setSite(foundSite);
        if (!foundSite.is_published) {
           const slug = (foundSite.name || "meu-site").toLowerCase().replace(/[^a-z0-9]/g, "-");
           setSubdomainInput(foundSite.subdomain || slug);
        } else {
           setSubdomainInput(foundSite.subdomain || "");
        }
      } else {
        premiumToast.error("Site não encontrado");
        navigate("/dashboard");
      }
    } catch (error) {
      premiumToast.error("Erro ao carregar site");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  // --- FUNÇÃO PARA REDIRECIONAR AO STUDIO PARA AJUSTES ---
  const handleGoToStudio = (initialMsg?: string) => {
    if (!site) return;
    // Redireciona para o Studio passando o ID do site para carregamento e a mensagem inicial do chat
    navigate("/studio", { 
      state: { 
        loadSiteId: site.id,
        initialMessage: initialMsg || "Gostaria de fazer alguns ajustes neste site."
      } 
    });
  };

  const handlePublish = async () => {
    if (!site || !subdomainInput) return;
    setPublishing(true);
    
    try {
      const response = await fetch(`${API_URL}/api/sites/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteId: site.id,
          subdomain: subdomainInput,
          userId: user?.id,
          content: site.content,
          name: site.name,
          description: site.description
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erro ao publicar");

      const storedSites = JSON.parse(localStorage.getItem("mock_sites") || "[]");
      const updatedSites = storedSites.map((s: any) => 
        s.id === site.id ? { ...s, is_published: true, subdomain: subdomainInput, published_at: new Date().toISOString() } : s
      );
      localStorage.setItem("mock_sites", JSON.stringify(updatedSites));
      setSite({ ...site, is_published: true, subdomain: subdomainInput });

      setPublishResult({ publicUrl: `${subdomainInput}.boder.app` });
      setShowConfetti(true);
      premiumToast.success("Site publicado com sucesso!");
      
    } catch (err: any) {
      console.error("Publish error:", err);
      premiumToast.error("Erro ao publicar", err.message);
    } finally {
      setPublishing(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!site) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AnimatedBackground />
      <ConfettiCelebration isActive={showConfetti} onComplete={() => setShowConfetti(false)} />

      {/* Header */}
      <motion.header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/90 backdrop-blur-md" initial={{ y: -60 }} animate={{ y: 0 }}>
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <span className="font-semibold hidden sm:block">{site.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
             <Button variant={viewMode === "desktop" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("desktop")}><Monitor className="h-4 w-4 mr-2" /> Desktop</Button>
             <Button variant={viewMode === "mobile" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("mobile")}><Smartphone className="h-4 w-4 mr-2" /> Mobile</Button>
          </div>
          <div className="flex items-center gap-2">
            {/* BOTÃO DE HISTÓRICO */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleGoToStudio("Quero ver o histórico de alterações deste site.")}
              className="gap-2"
            >
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Histórico</span>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="pt-20 pb-4 px-4 flex-1 flex flex-col items-center">
        {site.is_published && site.subdomain && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 w-full max-w-6xl">
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Site Online</p>
                  <p className="font-medium text-primary">{site.subdomain}.boder.app</p>
                </div>
              </div>
              <div className="flex gap-2">
                 <Button size="sm" onClick={() => window.open(`https://${site.subdomain}.boder.app`, "_blank")} className="gap-2"><ExternalLink className="h-4 w-4" /> Visitar</Button>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div className={`bg-white rounded-xl overflow-hidden shadow-2xl relative ${viewMode === "mobile" ? "w-[375px]" : "w-full max-w-6xl"}`} style={{ height: "calc(100vh - 120px)" }}>
           <div className="w-full h-full overflow-y-auto">
              <SiteRenderer data={site.content} viewMode={viewMode} html={site.html} />
              {!isPaid && site.has_watermark && (
                 <div className="absolute bottom-4 right-4 bg-white/80 px-3 py-1 rounded-full text-xs font-bold backdrop-blur">Criado com Boder AI</div>
              )}
           </div>
        </motion.div>
      </main>

      {/* Floating Actions */}
      <motion.div className="fixed bottom-6 right-6 flex gap-3 z-40">
         {/* BOTÃO AJUSTAR: AGORA REDIRECIONA PARA O STUDIO */}
         <Button 
           size="lg" 
           variant="outline" 
           onClick={() => handleGoToStudio()} 
           className="gap-2 bg-card/80 backdrop-blur shadow-lg border-primary/20 hover:bg-secondary"
         >
           <Wand2 className="h-5 w-5 text-primary" /> Ajustar com IA
         </Button>

         {!site.is_published && (
           <Button size="lg" onClick={() => setShowPublishModal(true)} className="gap-2 shadow-lg shadow-primary/25">
             <Rocket className="h-5 w-5" /> Publicar site
           </Button>
         )}
      </motion.div>

      {/* MODAL PUBLICAR */}
      <AnimatePresence>
        {showPublishModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{scale:0.9}} animate={{scale:1}} className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl text-slate-900">
               {publishResult ? (
                 <div className="text-center">
                    <Check className="h-12 w-12 text-green-500 mx-auto mb-2" />
                    <h3 className="text-xl font-bold mb-4">Site Publicado!</h3>
                    <p className="text-primary font-mono bg-slate-50 p-2 rounded mb-4 border border-slate-200">{publishResult.publicUrl}</p>
                    <Button onClick={() => { setShowPublishModal(false); setPublishResult(null); }} className="w-full">Fechar</Button>
                 </div>
               ) : (
                 <>
                    <div className="flex items-center gap-2 mb-4">
                       <Globe className="h-5 w-5 text-primary" />
                       <h3 className="font-bold text-lg">Publicar Site</h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">Escolha o endereço do seu site.</p>
                    
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg overflow-hidden mb-6 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                      <input 
                        type="text" 
                        value={subdomainInput}
                        onChange={(e) => setSubdomainInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} 
                        placeholder="meu-site"
                        className="flex-1 bg-transparent p-3 outline-none text-right font-mono text-slate-900"
                        autoFocus
                      />
                      <span className="bg-slate-100 p-3 text-slate-500 font-medium border-l border-slate-200">.boder.app</span>
                    </div>

                    <div className="flex gap-2">
                       <Button variant="outline" className="flex-1" onClick={() => setShowPublishModal(false)}>Cancelar</Button>
                       <Button className="flex-1" onClick={handlePublish} disabled={publishing || !subdomainInput}>
                          {publishing ? <Loader2 className="animate-spin" /> : "Confirmar Publicação"}
                       </Button>
                    </div>
                 </>
               )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}