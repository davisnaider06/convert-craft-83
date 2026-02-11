import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { OrbBackground } from "@/components/boder/OrbBackground";
import { ThemeToggle } from "@/components/boder/ThemeToggle";
import { SoundToggle } from "@/components/boder/SoundToggle";
import { useSounds } from "@/hooks/useSounds";
// --- MUDANÇA 1: Trocamos o contexto antigo pelo Clerk ---
import { useUser, useClerk } from "@clerk/clerk-react"; 

import { Sparkles, ArrowRight, Zap, Check, Star } from "lucide-react";
import ShinyText from "@/components/ui/ShinyText";
import BlurText from "@/components/ui/BlurText";
import { ShinyButton } from "@/components/ui/ShinyButton";
import boderLogo from "@/assets/boder-logo.png";

export default function Landing() {
  const {
    play,
    enabled: soundEnabled,
    toggle: toggleSound
  } = useSounds();
  
  // --- MUDANÇA 2: Hooks do Clerk ---
  const { isSignedIn } = useUser();
  const { openSignIn } = useClerk();
  
  const navigate = useNavigate();
  
  const handleStart = () => {
    play("confirm");
    // Se não estiver logado, abre o modal. Se estiver, vai pro create.
    if (!isSignedIn) {
        openSignIn();
    } else {
        navigate("/create");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <OrbBackground />

      {/* Header */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 bg-background/50 backdrop-blur-sm"
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="container flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4">
          <div className="flex items-center gap-2 sm:gap-3">
             {boderLogo ? (
                <img src={boderLogo} alt="Boder AI" className="h-6 sm:h-8 w-auto" />
             ) : (
                <span className="font-bold text-xl">Boder AI</span>
             )}
          </div>

          <div className="flex items-center gap-1 sm:gap-3">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigate("/pricing")}
              className="text-xs sm:text-sm px-2 sm:px-3"
            >
              Preços
            </Button>
            <SoundToggle enabled={soundEnabled} onToggle={toggleSound} />
            <ThemeToggle />
            
            {/* --- MUDANÇA 3: Lógica de Login --- */}
            {isSignedIn ? (
              <Button
                size="sm"
                onClick={() => navigate("/dashboard")}
                className="text-xs sm:text-sm px-2 sm:px-3"
              >
                Dashboard
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => openSignIn()} // Abre o Modal
                className="text-xs sm:text-sm px-2 sm:px-3"
              >
                Entrar
              </Button>
            )}
          </div>
        </div>
      </motion.header>

      {/* Hero */}
      <main className="relative flex min-h-screen items-center justify-center pt-20 sm:pt-16 pb-32 sm:pb-8 px-4">
        <div className="max-w-4xl text-center w-full">
          {/* Logo */}
          <motion.div
            className="mb-6 sm:mb-8 relative inline-block"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {boderLogo && (
                <img
                src={boderLogo}
                alt="Boder AI"
                className="h-20 sm:h-32 w-auto mx-auto hidden sm:block"
                />
            )}
            <motion.div
              className="absolute inset-0 bg-primary/30 blur-3xl -z-10"
              animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </motion.div>

          {/* Badge */}
          <motion.div
            className="mb-4 sm:mb-6 inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-primary/10 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            <ShinyText
              text="IA de nova geração para sites"
              speed={3}
              className="text-primary font-medium"
            />
          </motion.div>

          {/* Headline */}
          <div className="mb-4 sm:mb-6">
            <BlurText
              text="Crie sites que vendem."
              className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold leading-tight justify-center"
              animateBy="words"
              delay={100}
            />
            <BlurText
              text="Em minutos."
              className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold leading-tight gradient-text justify-center"
              animateBy="words"
              delay={150}
            />
          </div>

          {/* Subheadline */}
          <div className="mb-6 sm:mb-10 max-w-2xl mx-auto px-2">
            <BlurText
              text="Plataforma de IA futurista que cria landing pages de alta conversão, com domínio, hosting e automações integrados."
              className="text-base sm:text-lg md:text-xl text-muted-foreground justify-center"
              animateBy="words"
              delay={40}
            />
          </div>

          {/* CTA */}
          <motion.div
            className="flex flex-col items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <ShinyButton
                onClick={handleStart}
                size="lg"
                className="gap-2 text-sm sm:text-base px-6 sm:px-8"
              >
                Começar grátis
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </ShinyButton>
            </motion.div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              <Zap className="inline h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              15 gerações gratuitas
            </p>
          </motion.div>

          {/* Features */}
          <motion.div
            className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-muted-foreground px-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {["Landing pages otimizadas", "Hospedagem incluída", "Domínio customizado", "Sem código"].map(
              (feature) => (
                <div key={feature} className="flex items-center gap-1.5 sm:gap-2">
                  <Check className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                  <span className="text-left">{feature}</span>
                </div>
              )
            )}
          </motion.div>

          {/* Social Proof */}
          <motion.div
            className="mt-6 sm:mt-16 mb-20 sm:mb-0 flex flex-col items-center gap-2 sm:gap-4 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className="h-4 w-4 sm:h-5 sm:w-5 fill-primary text-primary"
                />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground text-center">
              Usado por mais de 1.000 empreendedores
            </p>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 border-t border-border/50 bg-background/80 backdrop-blur-sm py-3 sm:py-4">
        <div className="container flex flex-col items-center justify-center gap-2 text-xs sm:text-sm text-muted-foreground px-4">
          <p className="text-center">© 2025 Boder AI. Todos os direitos reservados.</p>
          <div className="flex gap-3 sm:gap-4">
            <Link to="/terms" className="hover:text-primary transition-colors">
              Termos de Uso
            </Link>
            <Link to="/privacy" className="hover:text-primary transition-colors">
              Política de Privacidade
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}