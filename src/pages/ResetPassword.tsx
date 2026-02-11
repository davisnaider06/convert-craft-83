import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AnimatedBackground } from "@/components/boder/AnimatedBackground";

import { Eye, EyeOff, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { premiumToast } from "@/components/ui/premium-toast";
import boderLogo from "@/assets/boder-logo.png";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  // Simulação: Verifica se o link é válido (no modo dev, sempre aceita)
  useEffect(() => {
    const checkSession = async () => {
      // Simula um delay de verificação do token
      await new Promise(r => setTimeout(r, 500)); 
      console.log("Token de recuperação verificado (Simulação)");
    };
    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      premiumToast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    
    if (password !== confirmPassword) {
      premiumToast.error("As senhas não coincidem");
      return;
    }

    setIsLoading(true);

    try {
      // SIMULAÇÃO: Atualização de senha
      await new Promise(r => setTimeout(r, 1500));
      
      setIsSuccess(true);
      premiumToast.success("Senha atualizada com sucesso!", "Você já pode fazer login.");
      
      // Redireciona após 2 segundos
      setTimeout(() => {
        navigate("/auth");
      }, 2000);

    } catch {
      premiumToast.error("Ocorreu um erro", "Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
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
                 <span className="text-3xl font-bold mb-4">Boder AI</span>
              )}
            </Link>
            <h1 className="text-2xl font-bold">Boder AI</h1>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-8">
            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Senha atualizada!</h2>
                <p className="text-muted-foreground">
                  Redirecionando para o login...
                </p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="mb-2 text-2xl font-bold text-center">
                  Nova senha
                </h2>
                <p className="mb-6 text-center text-muted-foreground text-sm">
                  Digite sua nova senha abaixo
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Nova senha
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-lg border border-border bg-background px-4 py-3 pr-12 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Confirmar senha
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-lg border border-border bg-background px-4 py-3 pr-12 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      "Atualizar senha"
                    )}
                  </Button>
                </form>
              </motion.div>
            )}
          </div>

          {/* Back to login */}
          {!isSuccess && (
            <div className="mt-6 text-center">
              <Link
                to="/auth"
                className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar ao login
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}