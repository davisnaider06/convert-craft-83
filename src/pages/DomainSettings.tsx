import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimatedBackground } from "@/components/boder/AnimatedBackground";
import { ThemeToggle } from "@/components/boder/ThemeToggle";
import { useUser } from "@clerk/clerk-react"; // FIX: Usando Clerk

import { premiumToast } from "@/components/ui/premium-toast";
import {
  ArrowLeft,
  Globe,
  Link2,
  Check,
  X,
  Loader2,
  Copy,
  ExternalLink,
  Crown,
  Shield,
  AlertCircle,
  RefreshCw,
  Trash2,
} from "lucide-react";
import boderLogo from "@/assets/boder-logo.png";


//const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';


interface SiteData {
  id: string;
  name: string;
  subdomain: string | null;
  custom_domain: string | null;
  is_published: boolean;
}

type DomainStatus = "pending" | "verifying" | "active" | "failed" | "none";

export default function DomainSettings() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // FIX: Substituído useAuth() antigo pelo useUser() do Clerk
  const { user, isLoaded } = useUser();

  const [site, setSite] = useState<SiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [customDomain, setCustomDomain] = useState("");
  const [domainStatus, setDomainStatus] = useState<DomainStatus>("none");
  const [showInstructions, setShowInstructions] = useState(false);

  // Lógica de Plano:
  // No Clerk, isso viria de user.publicMetadata.plan.
  // Deixei true fixo para você testar a UI, mas a lógica real está comentada ao lado.
  const isPaid = true; // isLoaded && user?.publicMetadata?.plan !== "free";

  useEffect(() => {
    if (id) loadSite();
  }, [id]);

  const loadSite = async () => {
    if (!id) return;

    // SIMULAÇÃO: Busca do LocalStorage em vez do Supabase
    try {
      // Pequeno delay para simular rede
      await new Promise(r => setTimeout(r, 600));

      const storedSites = JSON.parse(localStorage.getItem("mock_sites") || "[]");
      const foundSite = storedSites.find((s: any) => s.id === id);

      if (foundSite) {
        setSite(foundSite);
        if (foundSite.custom_domain) {
          setCustomDomain(foundSite.custom_domain);
          setDomainStatus("active"); // Assume que se já tem salvo, está ativo no mock
        }
      } else {
        // Fallback: Se não achar (acesso direto pela URL), cria um mock para não quebrar a tela
        console.warn("Site não encontrado no storage, gerando mock visual.");
        const mockSite: SiteData = {
          id: id,
          name: "Site Exemplo",
          subdomain: "meu-site-legal",
          custom_domain: null,
          is_published: true
        };
        setSite(mockSite);
      }
    } catch (error) {
      console.error("Erro ao carregar site", error);
      premiumToast.error("Erro ao carregar configurações");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    premiumToast.success("Copiado!");
  };

  const validateDomain = (domain: string): boolean => {
    const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    return domainRegex.test(domain);
  };

  // Atualiza o site no localStorage
  const updateLocalSite = (updatedFields: Partial<SiteData>) => {
    if (!site) return;
    
    const storedSites = JSON.parse(localStorage.getItem("mock_sites") || "[]");
    const updatedSites = storedSites.map((s: any) => 
      s.id === site.id ? { ...s, ...updatedFields } : s
    );
    
    // Se o site era apenas um mock visual e não estava no storage, adiciona ele
    if (!storedSites.find((s: any) => s.id === site.id)) {
        updatedSites.push({ ...site, ...updatedFields });
    }

    localStorage.setItem("mock_sites", JSON.stringify(updatedSites));
    setSite({ ...site, ...updatedFields });
  };

  const handleSaveDomain = async () => {
    if (!site || !isPaid) return;

    const cleanDomain = customDomain
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "")
      .trim();

    if (!cleanDomain) {
      // Remove custom domain
      setSaving(true);
      
      // Simula API call
      await new Promise(r => setTimeout(r, 800));
      updateLocalSite({ custom_domain: null });

      setSaving(false);
      setDomainStatus("none");
      premiumToast.success("Domínio removido");
      return;
    }

    if (!validateDomain(cleanDomain)) {
      premiumToast.error("Domínio inválido", "Use o formato: meusite.com.br");
      return;
    }

    setSaving(true);
    setDomainStatus("pending");

    // Simula API call
    await new Promise(r => setTimeout(r, 1000));
    updateLocalSite({ custom_domain: cleanDomain });

    setSaving(false);
    setShowInstructions(true);
    premiumToast.success("Domínio salvo!", "Configure o DNS para ativar.");
  };

  const handleVerifyDomain = async () => {
    if (!site?.custom_domain) return;

    setVerifying(true);
    setDomainStatus("verifying");

    // Simulate DNS verification
    await new Promise((r) => setTimeout(r, 2000));

    setDomainStatus("active");
    setVerifying(false);
    premiumToast.success("Domínio verificado e ativo!");
  };

  const handleRemoveDomain = async () => {
    if (!site) return;

    setSaving(true);
    
    // Simula API call
    await new Promise(r => setTimeout(r, 800));
    updateLocalSite({ custom_domain: null });

    setSaving(false);
    setCustomDomain("");
    setDomainStatus("none");
    setShowInstructions(false);
    premiumToast.success("Domínio removido");
  };

  // Loading do Auth ou do Site
  if (loading || !isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <AnimatedBackground />
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!site) return null;

  if (!isPaid) {
    return (
      <div className="min-h-screen bg-background">
        <AnimatedBackground />

        <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(`/preview/${id}`)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                {boderLogo && <img src={boderLogo} alt="Boder AI" className="h-6 w-auto" />}
                <span className="font-semibold">Domínio</span>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </header>

        <main className="pt-24 pb-12 px-4">
          <div className="max-w-lg mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-2xl p-8"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Crown className="h-8 w-8 text-primary" />
              </div>

              <h1 className="text-2xl font-bold mb-3">Recurso Premium</h1>
              <p className="text-muted-foreground mb-6">
                O domínio personalizado está disponível apenas para usuários Premium.
                Faça upgrade para conectar seu próprio domínio.
              </p>

              <div className="bg-secondary rounded-xl p-4 mb-6 text-left">
                <h3 className="font-semibold mb-3">Com o plano Premium você pode:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    Conectar seu domínio (ex: meusite.com.br)
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    Remover watermark do Boder AI
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    SSL gratuito incluso
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    Mais créditos de geração
                  </li>
                </ul>
              </div>

              <Button
                size="lg"
                className="w-full gap-2"
                onClick={() => premiumToast.info("Planos premium em breve!")}
              >
                <Crown className="h-5 w-5" />
                Fazer upgrade
              </Button>

              <Button
                variant="ghost"
                className="mt-4"
                onClick={() => navigate(`/preview/${id}`)}
              >
                Voltar ao preview
              </Button>
            </motion.div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AnimatedBackground />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/preview/${id}`)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              {boderLogo && <img src={boderLogo} alt="Boder AI" className="h-6 w-auto" />}
              <span className="font-semibold">Configurar Domínio</span>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Current Subdomain */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold">Subdomínio Boder</h2>
                <p className="text-sm text-muted-foreground">Gratuito e sempre disponível</p>
              </div>
            </div>

            {site.subdomain ? (
              <div className="flex items-center gap-2 bg-secondary rounded-xl p-4">
                <Globe className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="font-medium flex-1">{site.subdomain}.boder.app</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCopy(`https://${site.subdomain}.boder.app`)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    window.open(`http://${site.subdomain}.localhost:3000`, "_blank")
                  }
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="bg-secondary rounded-xl p-4 text-center text-muted-foreground">
                Publique seu site para gerar um subdomínio
              </div>
            )}
          </motion.div>

          {/* Custom Domain */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Link2 className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold">Domínio Personalizado</h2>
                <p className="text-sm text-muted-foreground">Conecte seu próprio domínio</p>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                <Crown className="h-3 w-3" />
                Premium
              </div>
            </div>

            {/* Domain Status Badge */}
            {domainStatus !== "none" && site.custom_domain && (
              <div className="mb-4">
                <div
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm ${
                    domainStatus === "active"
                      ? "bg-green-500/10 text-green-500"
                      : domainStatus === "verifying"
                      ? "bg-yellow-500/10 text-yellow-500"
                      : domainStatus === "failed"
                      ? "bg-red-500/10 text-red-500"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {domainStatus === "active" && <Check className="h-4 w-4" />}
                  {domainStatus === "verifying" && <Loader2 className="h-4 w-4 animate-spin" />}
                  {domainStatus === "failed" && <X className="h-4 w-4" />}
                  {domainStatus === "pending" && <AlertCircle className="h-4 w-4" />}
                  {domainStatus === "active" && "Domínio ativo"}
                  {domainStatus === "verifying" && "Verificando DNS..."}
                  {domainStatus === "failed" && "Falha na verificação"}
                  {domainStatus === "pending" && "Aguardando configuração DNS"}
                </div>
              </div>
            )}

            {/* Domain Input */}
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Digite seu domínio (sem https://)
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="meusite.com.br"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleSaveDomain} disabled={saving}>
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Salvar"
                    )}
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              {site.custom_domain && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={handleVerifyDomain}
                    disabled={verifying}
                  >
                    {verifying ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    Verificar DNS
                  </Button>
                  <Button
                    variant="ghost"
                    className="gap-2 text-destructive hover:text-destructive"
                    onClick={handleRemoveDomain}
                  >
                    <Trash2 className="h-4 w-4" />
                    Remover
                  </Button>
                </div>
              )}
            </div>
          </motion.div>

          {/* DNS Instructions */}
          <AnimatePresence>
            {(showInstructions || site.custom_domain) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-card border border-border rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                    <Shield className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h2 className="font-semibold">Configuração DNS</h2>
                    <p className="text-sm text-muted-foreground">
                      Adicione estes registros no seu provedor de domínio
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* A Record */}
                  <div className="bg-secondary rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Registro A (raiz)</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy("185.158.133.1")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Tipo</p>
                        <p className="font-mono">A</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Nome</p>
                        <p className="font-mono">@</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Valor</p>
                        <p className="font-mono">185.158.133.1</p>
                      </div>
                    </div>
                  </div>

                  {/* A Record for www */}
                  <div className="bg-secondary rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Registro A (www)</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy("185.158.133.1")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Tipo</p>
                        <p className="font-mono">A</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Nome</p>
                        <p className="font-mono">www</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Valor</p>
                        <p className="font-mono">185.158.133.1</p>
                      </div>
                    </div>
                  </div>

                  {/* TXT Record */}
                  <div className="bg-secondary rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Registro TXT (verificação)</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(`boder-verify=${site.id.slice(0, 8)}`)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Tipo</p>
                        <p className="font-mono">TXT</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Nome</p>
                        <p className="font-mono">_boder</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Valor</p>
                        <p className="font-mono text-xs break-all">
                          boder-verify={site.id.slice(0, 8)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-primary/5 rounded-xl border border-primary/10">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Importante:</strong> Alterações de DNS podem
                    levar até 48 horas para propagar. Após configurar, clique em "Verificar DNS"
                    para ativar seu domínio.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SSL Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-2xl p-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <h2 className="font-semibold">SSL/HTTPS Automático</h2>
                <p className="text-sm text-muted-foreground">
                  Certificado SSL gratuito incluso para todos os domínios
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}