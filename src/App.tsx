import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";

// --- NOVOS IMPORTS PARA O SITE PÚBLICO ---
import { SiteRenderer } from "@/components/boder/SiteRenderer"; // Certifique-se que o caminho está certo

// Páginas Públicas
import Landing from "./pages/Landing";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";

// Páginas Privadas
import Dashboard from "./pages/Dashboard";
import Create from "./pages/Create";
import Preview from "./pages/Preview";
import DomainSettings from "./pages/DomainSettings";
import Pricing from "./pages/Pricing";
import Credits from "./pages/Credits";
import Profile from "./pages/Profile";
import Studio from "./pages/Studio";

// Admin
import Admin from "./pages/Admin";

// Erro
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// --- COMPONENTE DE PROTEÇÃO (CLERK) ---
const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut><RedirectToSignIn /></SignedOut>
    </>
  );
};

// --- COMPONENTE MÁGICO: VISUALIZADOR DE SITE PÚBLICO ---
// Este componente é renderizado quando acessam cliente.boder.app
function PublicSiteViewer({ subdomain }: { subdomain: string }) {
  const [siteData, setSiteData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/public/site/${subdomain}`)
      .then(res => {
        if (!res.ok) throw new Error("Site não encontrado");
        return res.json();
      })
      .then(data => {
        // O backend retorna o objeto Site inteiro. O JSON do site geralmente está em .content
        setSiteData(data.content || data); 
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(true);
        setLoading(false);
      });
  }, [subdomain]);

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-white">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  if (error || !siteData) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 text-slate-800 font-sans">
      <h1 className="text-6xl font-bold mb-4 text-slate-300">404</h1>
      <p className="text-xl text-slate-600 font-medium">Este site não está disponível.</p>
      <a href="https://boder.app" className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">
        Criar meu site com Boder AI
      </a>
    </div>
  );

  // Renderiza o site ocupando 100% da tela (sem barras do editor)
  return <SiteRenderer data={siteData} viewMode="desktop" />;
}

// --- APP PRINCIPAL ---
const App = () => {
  const [subdomain, setSubdomain] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // LÓGICA DE DETECÇÃO DE SUBDOMÍNIO
    const host = window.location.hostname; // ex: barbearia.boder.app
    const parts = host.split(".");
    
    let isSubdomain = false;
    let sub = "";

    // Lógica para Produção (Vercel/Dominio Real)
    // Se tiver mais de 2 partes (ex: cliente.boder.app = 3 partes)
    if (parts.length > 2) {
       const possibleSub = parts[0];
       // Ignora subdomínios que são rotas do sistema
       if (possibleSub !== "www" && possibleSub !== "app" && possibleSub !== "dashboard" && possibleSub !== "api") {
         isSubdomain = true;
         sub = possibleSub;
       }
    }

    if (isSubdomain) {
      setSubdomain(sub);
    }
    setChecking(false);
  }, []);

  // Enquanto verifica a URL, não renderiza nada para não piscar
  if (checking) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        
        {/* === AQUI É A BIFURCAÇÃO MÁGICA === */}
        {subdomain ? (
          // ROTA 1: É UM SUBDOMÍNIO (SITE DE CLIENTE)
          <PublicSiteViewer subdomain={subdomain} />
        ) : (
          // ROTA 2: É O SEU SAAS (DASHBOARD, STUDIO, ETC)
          <BrowserRouter>
            <Routes>
              {/* ==================== ROTAS PÚBLICAS ==================== */}
              <Route path="/" element={<Landing />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              
              <Route path="/auth" element={<Navigate to="/create" replace />} /> 
              <Route path="/reset-password" element={<Navigate to="/create" replace />} />

              {/* ==================== ROTAS PRIVADAS ==================== */}
              <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
              <Route path="/studio" element={<RequireAuth><Studio /></RequireAuth>} />
              <Route path="/create" element={<RequireAuth><Create /></RequireAuth>} />
              <Route path="/preview/:id" element={<RequireAuth><Preview /></RequireAuth>} />
              <Route path="/domain/:id" element={<RequireAuth><DomainSettings /></RequireAuth>} />
              <Route path="/pricing" element={<RequireAuth><Pricing /></RequireAuth>} />
              <Route path="/credits" element={<RequireAuth><Credits /></RequireAuth>} />
              <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />

              {/* ==================== ROTAS ADMIN ==================== */}
              <Route path="/admin" element={<RequireAuth><Admin /></RequireAuth>} />

              {/* ==================== ROTAS DE ERRO ==================== */}
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;