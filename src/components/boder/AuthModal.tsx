import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext"; // Importando o contexto

import { premiumToast } from "@/components/ui/premium-toast";
import {
  X,
  Mail,
  Lock,
  Sparkles,
  ArrowRight,
  Loader2,
  User,
  Eye,
  EyeOff,
} from "lucide-react";
import boderLogo from "@/assets/boder-logo.png";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type AuthMode = "login" | "signup";

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth(); // Usando as funções do contexto
  const [mode, setMode] = useState<AuthMode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      premiumToast.error("Preencha todos os campos");
      return;
    }

    if (password.length < 6) {
      premiumToast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    if (mode === "signup" && password !== confirmPassword) {
      premiumToast.error("As senhas não coincidem");
      return;
    }

    setLoading(true);

    try {
      if (mode === "signup") {
        // Usando a função mockada do contexto
        const { error } = await signUp(email, password, name);

        if (error) {
          if (error.message.includes("already registered")) {
            premiumToast.error("Este email já está cadastrado", "Faça login.");
            setMode("login");
          } else {
            premiumToast.error(error.message);
          }
          setLoading(false);
          return;
        }

        premiumToast.success("Conta criada com sucesso!");
        // Fechar modal após sucesso
        setLoading(false);
        setTimeout(() => {
          onClose();
          onSuccess();
          // Se estiver na página Create, o useEffect vai detectar o user
          // Senão, redireciona para o dashboard
          if (!window.location.pathname.includes('/create')) {
            navigate("/dashboard");
          }
        }, 800);
      } else {
        // Usando a função mockada do contexto
        const { error } = await signIn(email, password);

        if (error) {
          if (error.message.includes("Invalid login")) {
            premiumToast.error("Email ou senha incorretos");
          } else {
            premiumToast.error(error.message);
          }
          setLoading(false);
          return;
        }

        premiumToast.success("Login realizado!");
        // Fechar modal após sucesso
        setLoading(false);
        setTimeout(() => {
          onClose();
          onSuccess();
          // Se estiver na página Create, o useEffect vai detectar o user
          // Senão, redireciona para o dashboard
          if (!window.location.pathname.includes('/create')) {
            navigate("/dashboard");
          }
        }, 800);
      }
    } catch (err) {
      premiumToast.error("Erro inesperado", "Tente novamente.");
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === "login" ? "signup" : "login");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-2xl">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-lg p-2 text-muted-foreground hover:bg-secondary transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Header */}
              <div className="text-center mb-8">
                <motion.div
                  className="mb-4 inline-block"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                >
                  {boderLogo ? (
                     <img src={boderLogo} alt="Boder AI" className="h-16 w-auto mx-auto" />
                  ) : (
                     <span className="text-3xl font-bold">Boder AI</span>
                  )}
                </motion.div>

                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm text-primary mb-4">
                  <Sparkles className="h-4 w-4" />
                  {mode === "signup" ? "10 créditos grátis" : "Bem-vindo de volta"}
                </div>

                <h2 className="text-2xl font-bold mb-2">
                  {mode === "signup"
                    ? "Crie sua conta para gerar seu site"
                    : "Entre na sua conta"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {mode === "signup"
                    ? "Sua descrição será usada para criar um site incrível"
                    : "Continue de onde parou"}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "signup" && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Seu nome</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Como devemos te chamar?"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {mode === "signup" && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Digite a senha novamente"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {mode === "signup" ? "Criando conta..." : "Entrando..."}
                    </>
                  ) : (
                    <>
                      {mode === "signup" ? "Criar conta e gerar site" : "Entrar"}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              {/* Toggle mode */}
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  {mode === "signup" ? "Já tem uma conta?" : "Não tem conta?"}{" "}
                  <button
                    onClick={toggleMode}
                    className="text-primary font-medium hover:underline"
                  >
                    {mode === "signup" ? "Fazer login" : "Criar conta grátis"}
                  </button>
                </p>
              </div>

              {/* Benefits for signup */}
              {mode === "signup" && (
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-xs text-muted-foreground text-center mb-3">
                    Ao criar sua conta, você ganha:
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      10 créditos grátis
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      Subdomínio boder.app
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      Acesso ao editor
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      Histórico de projetos
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}