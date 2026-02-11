import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { SignIn, SignUp, useUser } from "@clerk/clerk-react"; // USAR ISSO
import { dark } from "@clerk/themes"; // Opcional: para ficar dark mode se tiver instalado
import { AnimatedBackground } from "@/components/boder/AnimatedBackground";
import { ArrowLeft } from "lucide-react";
import { premiumToast } from "@/components/ui/premium-toast";
import boderLogo from "@/assets/boder-logo.png";

export default function Auth() {
  // Simplifiquei o mode. O Clerk cuida do "Forgot Password" sozinho.
  const [mode, setMode] = useState<"login" | "register">("login");
  
  // useUser substitui o seu antigo useAuth para pegar dados
  const { user, isLoaded, isSignedIn } = useUser();
  const navigate = useNavigate();

  // Lógica do Plano Pendente (Mantida e adaptada)
  useEffect(() => {
    const processPendingPlan = async () => {
      if (!isLoaded || !isSignedIn || !user) return;

      const pendingPlan = sessionStorage.getItem("pendingPlan");
      
      // Se já estiver logado e não tiver plano pendente, vai pro dashboard
      if (!pendingPlan) {
        navigate("/dashboard");
        return;
      }

      sessionStorage.removeItem("pendingPlan");
      
      // SIMULAÇÃO DE CHECKOUT
      console.log("Processando plano pendente:", pendingPlan);
      premiumToast.success("Login efetuado!", "Redirecionando para pagamento...");
      
      setTimeout(() => {
         // Aqui entra seu link real de pagamento futuramente
         window.open("https://google.com", "_blank"); 
         navigate("/dashboard");
      }, 1500);
    };

    processPendingPlan();
  }, [isLoaded, isSignedIn, user, navigate]);

  return (
    <div className="relative min-h-screen bg-background overflow-hidden text-foreground">
      <AnimatedBackground />

      <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center">
            <Link to="/">
              {boderLogo ? (
                <motion.img
                    src={boderLogo}
                    alt="Boder AI"
                    className="h-16 w-auto mb-4"
                    whileHover={{ scale: 1.05 }}
                />
              ) : (
                <h1 className="text-4xl font-bold mb-4">Boder AI</h1>
              )}
            </Link>
          </div>

          {/* Card Clerk */}
          {/* Removemos a borda manual e deixamos o Clerk cuidar do card, ou envolvemos ele */}
          <div className="flex justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                {mode === "login" ? (
                  <SignIn 
                    appearance={{
                        baseTheme: dark, // Remova essa linha se não tiver @clerk/themes
                        elements: {
                            card: "bg-card/80 backdrop-blur-sm border border-border shadow-xl",
                            headerTitle: "text-foreground",
                            headerSubtitle: "text-muted-foreground",
                            socialButtonsBlockButton: "text-foreground border-border hover:bg-muted",
                            formFieldLabel: "text-foreground",
                            formFieldInput: "bg-background text-foreground border-border",
                            footerActionText: "text-muted-foreground",
                            footerActionLink: "text-primary hover:text-primary/90"
                        }
                    }}
                    routing="path" 
                    path="/auth" 
                    signUpUrl="#"
                    // Truque para mudar o estado local ao clicar em "Sign Up" no footer do Clerk
                    // Se preferir o roteamento nativo do Clerk, configure as rotas no App.tsx
                  />
                ) : (
                  <SignUp 
                    appearance={{
                        baseTheme: dark, // Remova essa linha se não tiver @clerk/themes
                        elements: {
                            card: "bg-card/80 backdrop-blur-sm border border-border shadow-xl",
                            headerTitle: "text-foreground",
                            headerSubtitle: "text-muted-foreground",
                            socialButtonsBlockButton: "text-foreground border-border hover:bg-muted",
                            formFieldLabel: "text-foreground",
                            formFieldInput: "bg-background text-foreground border-border",
                            footerActionText: "text-muted-foreground",
                            footerActionLink: "text-primary hover:text-primary/90"
                        }
                    }}
                    routing="path" 
                    path="/auth" 
                    signInUrl="#"
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Botão de Alternar Manual (Caso queira forçar a troca visualmente fora do componente) */}
          <div className="mt-6 text-center text-sm bg-card/50 p-4 rounded-lg border border-border/50 backdrop-blur-sm">
             <p className="text-muted-foreground mb-2">
                {mode === "login" ? "Ainda não tem conta?" : "Já tem uma conta?"}
             </p>
             <button 
                onClick={() => setMode(mode === "login" ? "register" : "login")}
                className="text-primary font-bold hover:underline"
             >
                {mode === "login" ? "Criar conta agora" : "Fazer Login"}
             </button>
          </div>

          {/* Back to home */}
          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para o início
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}