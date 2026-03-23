import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { SignIn, SignUp, useUser } from "@clerk/clerk-react";
import { ArrowLeft } from "lucide-react";
import { AnimatedBackground } from "@/components/boder/AnimatedBackground";
import { premiumToast } from "@/components/ui/premium-toast";
import boderLogo from "@/assets/boder-logo.png";

export default function Auth() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const { user, isLoaded, isSignedIn } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;

    const pendingPlan = sessionStorage.getItem("pendingPlan");
    if (!pendingPlan) {
      navigate("/create", { replace: true });
      return;
    }

    sessionStorage.removeItem("pendingPlan");
    premiumToast.success("Login efetuado!", "Retomando sua assinatura.");
    navigate(`/pricing?plan=${pendingPlan}&autostart=1`, { replace: true });
  }, [isLoaded, isSignedIn, navigate, user]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <AnimatedBackground />

      <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 flex flex-col items-center">
            <Link to="/">
              <motion.img
                src={boderLogo}
                alt="Boder AI"
                className="mb-4 h-16 w-auto"
                whileHover={{ scale: 1.05 }}
              />
            </Link>
          </div>

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
                      elements: {
                        card: "bg-card/80 backdrop-blur-sm border border-border shadow-xl",
                        headerTitle: "text-foreground",
                        headerSubtitle: "text-muted-foreground",
                        socialButtonsBlockButton: "text-foreground border-border hover:bg-muted",
                        formFieldLabel: "text-foreground",
                        formFieldInput: "bg-background text-foreground border-border",
                        footerActionText: "text-muted-foreground",
                        footerActionLink: "text-primary hover:text-primary/90",
                      },
                    }}
                    routing="path"
                    path="/auth"
                    signUpUrl="#"
                  />
                ) : (
                  <SignUp
                    appearance={{
                      elements: {
                        card: "bg-card/80 backdrop-blur-sm border border-border shadow-xl",
                        headerTitle: "text-foreground",
                        headerSubtitle: "text-muted-foreground",
                        socialButtonsBlockButton: "text-foreground border-border hover:bg-muted",
                        formFieldLabel: "text-foreground",
                        formFieldInput: "bg-background text-foreground border-border",
                        footerActionText: "text-muted-foreground",
                        footerActionLink: "text-primary hover:text-primary/90",
                      },
                    }}
                    routing="path"
                    path="/auth"
                    signInUrl="#"
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-6 rounded-lg border border-border/50 bg-card/50 p-4 text-center text-sm">
            <p className="mb-2 text-muted-foreground">
              {mode === "login" ? "Ainda não tem conta?" : "Já tem uma conta?"}
            </p>
            <button
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="font-bold text-primary hover:underline"
            >
              {mode === "login" ? "Criar conta agora" : "Fazer login"}
            </button>
          </div>

          <div className="mt-6 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
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
