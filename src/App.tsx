import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from "@clerk/clerk-react";

// Páginas Públicas
import Landing from "./pages/Landing";
// Auth agora é gerenciado pelo Clerk, mas mantemos rotas públicas
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

// --- COMPONENTE DE PROTEÇÃO (CLERK) ---
// Substitui o antigo ProtectedRoute
const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut><RedirectToSignIn /></SignedOut>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {/* Removemos o AuthProvider antigo, o ClerkProvider já está no main.tsx */}
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* ==================== ROTAS PÚBLICAS ==================== */}
            <Route path="/" element={<Landing />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            
            {/* Redireciona logins antigos para o Clerk */}
            <Route path="/auth" element={<Navigate to="/create" replace />} /> 
            <Route path="/reset-password" element={<Navigate to="/create" replace />} />

            {/* ==================== ROTAS PRIVADAS ==================== */}
            <Route
              path="/dashboard"
              element={
                <RequireAuth>
                  <Dashboard />
                </RequireAuth>
              }
            />
            <Route
              path="/studio"
              element={
                <RequireAuth>
                  <Studio />
                </RequireAuth>
              }
            />

            <Route
              path="/create"
              element={
                <RequireAuth>
                  <Create />
                </RequireAuth>
              }
            />

            <Route
              path="/preview/:id"
              element={
                <RequireAuth>
                  <Preview />
                </RequireAuth>
              }
            />
            <Route
              path="/domain/:id"
              element={
                <RequireAuth>
                  <DomainSettings />
                </RequireAuth>
              }
            />
            <Route
              path="/pricing"
              element={
                <RequireAuth>
                  <Pricing />
                </RequireAuth>
              }
            />
            <Route
              path="/credits"
              element={
                <RequireAuth>
                  <Credits />
                </RequireAuth>
              }
            />
            <Route
              path="/profile"
              element={
                <RequireAuth>
                  <Profile />
                </RequireAuth>
              }
            />

            {/* ==================== ROTAS ADMIN ==================== */}
            <Route
              path="/admin"
              element={
                <RequireAuth>
                   {/* TODO: Adicionar verificação de Role do Clerk aqui depois */}
                  <Admin />
                </RequireAuth>
              }
            />

            {/* ==================== ROTAS DE ERRO ==================== */}
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
