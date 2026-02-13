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
  Eye,
  Smartphone,
  Monitor,
  Loader2,
  Check,
  X,
  ExternalLink,
  Globe,
  Rocket,
  Copy,
  Link2,
  Wand2,
  RefreshCw,
  Send,
  History,
  Sparkles, // <-- IMPORT ADICIONADO AQUI
} from "lucide-react";
import boderLogo from "@/assets/boder-logo.png";

// URL Dinâmica da API
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
  const [publishing, setPublishing] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("desktop");
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [adjustments, setAdjustments] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [publishResult, setPublishResult] = useState<{
    subdomain: string;
    previewUrl: string;
    publicUrl: string;
    simulation?: boolean;
    message?: string;
  } | null>(null);

  const isPaid = false; 

  useEffect(() => {
    if (id) loadSite();
  }, [id]);

  const loadSite = async () => {
    if (!id) return;
    try {
      await new Promise(r => setTimeout(r, 500)); 
      const storedSites = JSON.parse(localStorage.getItem("mock_sites") || "[]");
      const foundSite = storedSites.find((s: any) => s.id === id);

      if (foundSite) {
        setSite(foundSite);
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

  const updateLocalSite = (updatedFields: Partial<SiteData>) => {
    if (!site) return;
    const storedSites = JSON.parse(localStorage.getItem("mock_sites") || "[]");
    const updatedSites = storedSites.map((s: any) => 
      s.id === site.id ? { ...s, ...updatedFields } : s
    );
    localStorage.setItem("mock_sites", JSON.stringify(updatedSites));
    setSite({ ...site, ...updatedFields });
  };

  const handleRegenerate = async () => {
    if (!site || !site.content || !adjustments.trim()) {
      premiumToast.error("Descreva os ajustes que deseja fazer");
      return;
    }

    if (!user) {
        premiumToast.error("Você precisa estar logado.");
        return;
    }

    setRegenerating(true);

    try {
      const promptAjuste = `
        Aja como Copywriter. O usuário solicitou as seguintes alterações no site dele: 
        "${adjustments}"
        
        Mantenha a base destes dados e modifique SOMENTE o que o usuário pediu:
        ${JSON.stringify(site.content)}
      `;

      const response = await fetch(`${API_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptAjuste,
          userId: user.id,
          userEmail: user.primaryEmailAddress?.emailAddress,
        })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Erro na regeneração");

      updateLocalSite({ content: data.code });
      setAdjustments("");
      setShowRegenerateModal(false);
      premiumToast.success("Site ajustado com sucesso!");

    } catch (err) {
      console.error("Regeneration error:", err);
      premiumToast.error("Erro ao regenerar site", "Tente novamente ou verifique seus créditos.");
    } finally {
      setRegenerating(false);
    }
  };

  const handlePublish = async () => {
    if (!site) return;
    setPublishing(true);
    try {
      await new Promise(r => setTimeout(r, 2000));
      const mockSubdomain = site.subdomain || `site-${site.id.substring(0,6)}`;
      updateLocalSite({
        is_published: true,
        subdomain: mockSubdomain,
        published_at: new Date().toISOString()
      });
      setPublishResult({
        subdomain: mockSubdomain,
        previewUrl: "#",
        publicUrl: `${mockSubdomain}.boder.app`,
        simulation: false,
        message: "Deploy simulated successfully"
      });
      setShowConfetti(true);
      premiumToast.success("Site publicado com sucesso!");
    } catch (err) {
      console.error("Publish error:", err);
      premiumToast.error("Erro ao publicar site");
    } finally {
      setPublishing(false);
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    premiumToast.success("URL copiada!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <AnimatedBackground />
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando preview...</p>
        </motion.div>
      </div>
    );
  }

  if (!site) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AnimatedBackground />
      <ConfettiCelebration isActive={showConfetti} onComplete={() => setShowConfetti(false)} />

      <motion.header
        className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/90 backdrop-blur-md"
        initial={{ y: -60 }}
        animate={{ y: 0 }}
      >
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              {boderLogo && <img src={boderLogo} alt="Boder AI" className="h-6 w-auto" />}
              <span className="font-semibold hidden sm:block">{site.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
            <Button
              variant={viewMode === "desktop" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("desktop")}
              className="gap-2"
            >
              <Monitor className="h-4 w-4" />
              <span className="hidden sm:inline">Desktop</span>
            </Button>
            <Button
              variant={viewMode === "mobile" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("mobile")}
              className="gap-2"
            >
              <Smartphone className="h-4 w-4" />
              <span className="hidden sm:inline">Mobile</span>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => premiumToast.info("Histórico em breve!")}
              className="gap-2"
            >
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Histórico</span>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </motion.header>

      <main className="pt-20 pb-4 px-4 flex-1 flex flex-col items-center">
        {site.is_published && site.subdomain && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 w-full max-w-6xl">
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Seu site está no ar!</p>
                  <p className="font-medium text-primary">{site.custom_domain || `${site.subdomain}.boder.app`}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={() => navigate(`/domain/${site.id}`)} className="gap-2">
                  <Link2 className="h-4 w-4" /> Domínio
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleCopyUrl(`https://${site.custom_domain || site.subdomain + ".boder.app"}`)} className="gap-2">
                  <Copy className="h-4 w-4" /> Copiar
                </Button>
                <Button size="sm" onClick={() => window.open(`http://${site.subdomain}.localhost:3000`, "_blank")} className="gap-2">
                  <ExternalLink className="h-4 w-4" /> Visitar
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div className="flex-1 w-full flex items-start justify-center" layout>
          <motion.div
            className={`bg-white rounded-xl overflow-hidden shadow-2xl transition-all duration-300 relative ${
              viewMode === "mobile" ? "w-[375px] max-w-full" : "w-full max-w-6xl"
            }`}
            style={{ height: viewMode === "mobile" ? "calc(100vh - 120px)" : "calc(100vh - 100px)" }}
            layout
          >
            {site.content ? (
              <div className="w-full h-full overflow-y-auto">
                <SiteRenderer data={site.content} viewMode={viewMode} />
                {/* Nova Watermark Sutil (Glass Badge) com a DIV FECHADA corretamente */}
                {!isPaid && site.has_watermark && (
                  <motion.a
                    href="https://boder.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="absolute bottom-4 left-4 z-50 flex items-center gap-1.5 rounded-full bg-white/70 pl-2 pr-3 py-1.5 text-[11px] font-medium text-slate-600 backdrop-blur-md border border-white/50 shadow-sm transition-all hover:bg-white hover:text-primary hover:shadow-md hover:scale-105 group"
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
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-secondary">
                <div className="text-center">
                  <Eye className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum conteúdo gerado ainda</p>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      </main>

      {site.content && (
        <motion.div
          className="fixed bottom-6 right-6 flex gap-3 z-40"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Button size="lg" variant="outline" onClick={() => setShowRegenerateModal(true)} className="gap-2 bg-card/80 backdrop-blur shadow-lg">
            <Wand2 className="h-5 w-5 text-primary" /> Ajustar com IA
          </Button>

          {!site.is_published && (
            <Button size="lg" onClick={() => setShowPublishModal(true)} className="gap-2 shadow-lg shadow-primary/25">
              <Rocket className="h-5 w-5" /> Publicar site
            </Button>
          )}
        </motion.div>
      )}

      <AnimatePresence>
        {showRegenerateModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
            onClick={() => !regenerating && setShowRegenerateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-2xl p-6 max-w-lg w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Wand2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Ajustar com IA</h3>
                  <p className="text-sm text-muted-foreground">1 crédito será usado</p>
                </div>
              </div>

              <textarea
                value={adjustments}
                onChange={(e) => setAdjustments(e.target.value)}
                placeholder="Ex: Mude a headline para algo mais focado em emagrecimento rápido. Altere o plano Básico para 47 reais..."
                className="w-full min-h-[120px] rounded-xl border border-border bg-secondary/50 p-4 text-sm resize-none focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                autoFocus
                disabled={regenerating}
              />

              <div className="flex gap-3 mt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowRegenerateModal(false)} disabled={regenerating}>
                  Cancelar
                </Button>
                <Button className="flex-1 gap-2" onClick={handleRegenerate} disabled={regenerating || !adjustments.trim()}>
                  {regenerating ? <><RefreshCw className="h-4 w-4 animate-spin" /> Ajustando...</> : <><Send className="h-4 w-4" /> Aplicar ajustes</>}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPublishModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
            onClick={() => !publishing && !publishResult && setShowPublishModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {publishResult ? (
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Check className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Site publicado!</h3>
                  <p className="text-muted-foreground mb-6">Seu site está disponível no endereço abaixo</p>
                  <div className="bg-secondary rounded-xl p-4 mb-6 text-left">
                    <p className="text-sm text-muted-foreground mb-1">Endereço do site</p>
                    <div className="flex items-center gap-2">
                      <Globe className="h-5 w-5 flex-shrink-0 text-primary" />
                      <span className="font-medium truncate text-primary">{publishResult.publicUrl}</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 gap-2" onClick={() => handleCopyUrl(`https://${publishResult.publicUrl}`)}>
                      <Copy className="h-4 w-4" /> Copiar URL
                    </Button>
                  </div>
                  <Button variant="ghost" className="mt-4 w-full" onClick={() => { setShowPublishModal(false); setPublishResult(null); }}>
                    Fechar
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Rocket className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Publicar site</h3>
                  <p className="text-muted-foreground mb-6">Seu site será publicado em um subdomínio exclusivo</p>
                  <div className="flex gap-3 mt-6">
                    <Button variant="outline" className="flex-1" onClick={() => setShowPublishModal(false)} disabled={publishing}>
                      Cancelar
                    </Button>
                    <Button className="flex-1 gap-2" onClick={handlePublish} disabled={publishing}>
                      {publishing ? <><Loader2 className="h-4 w-4 animate-spin" /> Publicando...</> : <><Rocket className="h-4 w-4" /> Publicar</>}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}