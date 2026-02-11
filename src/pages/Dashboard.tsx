import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useUser, useClerk } from "@clerk/clerk-react";

import { OrbBackground } from "@/components/boder/OrbBackground";
import { ThemeToggle } from "@/components/boder/ThemeToggle";
import { SoundToggle } from "@/components/boder/SoundToggle";
import { useSounds } from "@/hooks/useSounds";
import { premiumToast } from "@/components/ui/premium-toast";
import {
  Sparkles,
  Plus,
  Settings,
  LogOut,
  ExternalLink,
  Trash2,
  Globe,
  Eye,
  Loader2,
  Crown,
  Zap,
  Coins,
  ArrowRight,
} from "lucide-react";
import boderLogo from "@/assets/boder-logo.png";
import TypingText from "@/components/ui/TypingText";
import { DeleteConfirmModal } from "@/components/boder/DeleteConfirmModal";
import { ShinyButton } from "@/components/ui/ShinyButton";
import { SiteCardSkeletonGrid } from "@/components/boder/SiteCardSkeleton";


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';


// Interface mantida para compatibilidade
interface GeneratedSite {
  id: string;
  name: string;
  description: string | null;
  nicho: string | null;
  objetivo: string | null;
  estilo: string | null;
  custom_domain: string | null;
  subdomain: string | null;
  has_watermark: boolean;
  is_published: boolean;
  created_at: string;
  published_at: string | null;
}

export default function Dashboard() {
  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk();
  
  const { play, enabled: soundEnabled, toggle: toggleSound } = useSounds();
  const navigate = useNavigate();
  const [sites, setSites] = useState<GeneratedSite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isManagingSubscription, setIsManagingSubscription] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; site: GeneratedSite | null; isDeleting: boolean }>({
    isOpen: false,
    site: null,
    isDeleting: false,
  });

  const [credits, setCredits] = useState<number | string>("-");

  // Pega o plano do metadata. Se não existir, assume "free".
  const plan = (user?.publicMetadata?.plan as string) ?? "free";

  // Busca o saldo inicial
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

  useEffect(() => {
    // Redireciona se não tiver usuário
    if (!isSignedIn) {
      navigate("/");
      return;
    }

    fetchSites();
  }, [isSignedIn, navigate]);

  const fetchSites = async () => {
    // Carrega os sites do localStorage
    try {
      await new Promise(r => setTimeout(r, 800)); // Delay para animação de loading
      const storedSites = JSON.parse(localStorage.getItem("mock_sites") || "[]");
      // Filtra apenas sites deste usuário (opcional, se quiser separar por conta)
      const userSites = storedSites.filter((s: any) => s.user_id === user?.id);
      
      // Fallback pra mostrar tudo se não tiver ID salvo antes ou se a lista filtrada estiver vazia (opcional)
      // Se quiser ser estrito, use setSites(userSites);
      setSites(userSites.length > 0 ? userSites : storedSites); 
    } catch (error) {
      console.error("Erro ao carregar sites:", error);
      setSites([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleNewSite = () => {
    play("confirm");
    navigate("/studio");
  };

  const openDeleteModal = (site: GeneratedSite) => {
    setDeleteModal({ isOpen: true, site, isDeleting: false });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, site: null, isDeleting: false });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.site) return;
    
    setDeleteModal(prev => ({ ...prev, isDeleting: true }));
    
    // Remove do localStorage
    try {
      const storedSites = JSON.parse(localStorage.getItem("mock_sites") || "[]");
      const updatedSites = storedSites.filter((s: any) => s.id !== deleteModal.site!.id);
      localStorage.setItem("mock_sites", JSON.stringify(updatedSites));
      
      // Atualiza a lista local
      setTimeout(() => {
        setSites(updatedSites); // Se usar filtro por usuário, filtrar aqui também
        premiumToast.success("Site excluído", "O site foi removido com sucesso.");
        closeDeleteModal();
      }, 800);
    } catch (error) {
      console.error("Erro ao excluir site:", error);
      premiumToast.error("Erro ao excluir site", "Tente novamente.");
      setDeleteModal(prev => ({ ...prev, isDeleting: false }));
    }
  };

  const handleManageSubscription = async () => {
    setIsManagingSubscription(true);
    // Simula abertura do portal
    setTimeout(() => {
      alert("Portal de Assinatura (Simulado)");
      setIsManagingSubscription(false);
    }, 1000);
  };

  const isPremium = plan !== "free";

  // Variantes de animação
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  } as const;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <OrbBackground />

      {/* Header */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm"
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Se a imagem quebrar, mostra texto */}
            {boderLogo ? (
               <img src={boderLogo} alt="Boder AI" className="h-8 w-auto" />
            ) : (
               <span className="text-xl font-bold">Boder AI</span>
            )}
            <span className="text-xl font-semibold hidden md:block">Boder AI</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Credits Badge */}
            <motion.div
              className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm cursor-pointer"
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate("/pricing")}
            >
              <Zap className="h-4 w-4 text-primary" />
              <span className="font-semibold">{credits}</span>
              <span className="text-muted-foreground hidden sm:inline">créditos</span>
              {isPremium && <Coins className="h-3 w-3 text-primary/60" />}
            </motion.div>

            {/* Plan Badge */}
            {isPremium ? (
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 bg-primary/10 hover:bg-primary/20 hidden sm:flex"
                onClick={handleManageSubscription}
                disabled={isManagingSubscription}
              >
                {isManagingSubscription ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Crown className="h-4 w-4 text-primary" />
                )}
                <span className="font-medium text-primary">
                  {plan === "annual" ? "Anual" : "Pro"}
                </span>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 hidden sm:flex"
                onClick={() => navigate("/pricing")}
              >
                <Crown className="h-4 w-4" />
                Upgrade
              </Button>
            )}

            <SoundToggle enabled={soundEnabled} onToggle={toggleSound} />
            <ThemeToggle />

            <Button variant="ghost" size="icon" onClick={() => navigate("/profile")} title="Meu Perfil">
              <Settings className="h-5 w-5" />
            </Button>

            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative min-h-screen pt-24 pb-12 px-4">
        <div className="container max-w-6xl">
          {/* Welcome */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              <TypingText
                text={`Olá, ${user?.firstName || "Criador"}!`} 
                speed={60}
                delay={200}
              />
            </h1>
            <p className="text-muted-foreground">
              Gerencie seus sites e crie novas landing pages com IA.
            </p>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            className="grid gap-4 md:grid-cols-3 mb-12"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* New Site Card */}
            <motion.div
              variants={itemVariants}
              className="group relative rounded-3xl p-[1px] bg-gradient-to-b from-primary via-primary/50 to-primary/20 cursor-pointer"
              onClick={handleNewSite}
              whileHover={{ scale: 1.02, y: -3 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative h-full rounded-3xl bg-card p-6 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 transition-transform group-hover:scale-110">
                    <Plus className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold group-hover:text-primary transition-colors">Novo site</p>
                    <p className="text-sm text-muted-foreground">
                      Crie uma landing page com IA
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </motion.div>

            {/* Sites Count Card */}
            <motion.div
              variants={itemVariants}
              className="group relative rounded-3xl p-[1px] bg-gradient-to-b from-border/80 via-border/40 to-transparent"
            >
              <div className="relative h-full rounded-3xl bg-card p-6 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                  <motion.div 
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary group-hover:bg-primary/20 transition-colors"
                    whileHover={{ rotate: 10 }}
                  >
                    <Globe className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  </motion.div>
                  <div>
                    <p className="text-3xl font-bold">{sites.length}</p>
                    <p className="text-sm text-muted-foreground">Sites criados</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Credits Card */}
            <motion.div
              variants={itemVariants}
              className="group relative rounded-3xl p-[1px] bg-gradient-to-b from-border/80 via-border/40 to-transparent"
            >
              <div className="relative h-full rounded-3xl bg-card p-6 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                  <motion.div 
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary group-hover:bg-primary/20 transition-colors"
                    whileHover={{ rotate: -10 }}
                  >
                    <Sparkles className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  </motion.div>
                  <div>
                    <p className="text-3xl font-bold">{credits}</p>
                    <p className="text-sm text-muted-foreground">
                      Créditos restantes
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Sites List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-xl font-semibold mb-6">Seus sites</h2>

            {isLoading ? (
              <SiteCardSkeletonGrid />
            ) : sites.length === 0 ? (
              <motion.div 
                className="relative rounded-3xl p-[1px] bg-gradient-to-b from-border/50 via-border/20 to-transparent"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="rounded-3xl bg-card/50 backdrop-blur-sm p-12 text-center">
                  <Sparkles className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-semibold">
                    Nenhum site ainda
                  </h3>
                  <p className="mb-6 text-muted-foreground">
                    Crie seu primeiro site com IA e comece a vender
                  </p>
                  <ShinyButton onClick={handleNewSite} className="gap-2">
                    <Plus className="h-5 w-5" />
                    Criar primeiro site
                  </ShinyButton>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <AnimatePresence>
                  {sites.map((site) => (
                    <motion.div
                      key={site.id}
                      variants={itemVariants}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="group relative rounded-3xl p-[1px] bg-gradient-to-b from-border/80 via-border/40 to-transparent hover:from-primary/60 hover:via-primary/30 hover:to-transparent transition-all duration-500"
                    >
                      <div className="relative h-full rounded-3xl bg-card p-5 backdrop-blur-xl">
                        <div className="mb-4 flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                              {site.name}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {site.description || "Sem descrição"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {site.is_published ? (
                              <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary flex items-center gap-1">
                                <Globe className="h-3 w-3" />
                                Online
                              </span>
                            ) : (
                              <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                                Rascunho
                              </span>
                            )}
                          </div>
                        </div>

                        {site.subdomain && (
                          <div className="mb-4 flex items-center gap-2 text-sm">
                            <Globe className="h-4 w-4 text-primary" />
                            <span className="text-muted-foreground truncate">
                              {site.subdomain}.boder.app
                            </span>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2 mb-4">
                          {site.nicho && (
                            <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                              {site.nicho}
                            </span>
                          )}
                          {site.estilo && (
                            <span className="rounded-full bg-secondary px-2 py-1 text-xs">
                              {site.estilo}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 gap-2 rounded-full"
                            onClick={() => navigate(`/preview/${site.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                            {site.is_published ? "Gerenciar" : "Ver"}
                          </Button>
                          
                          {site.is_published && site.subdomain && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-full"
                              onClick={() => window.open(`http://${site.subdomain}.localhost:3000`, "_blank")}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full text-muted-foreground hover:text-destructive"
                            onClick={() => openDeleteModal(site)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        siteName={deleteModal.site?.name || ""}
        isDeleting={deleteModal.isDeleting}
      />
    </div>
  );
}
