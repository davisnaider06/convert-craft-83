import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Coins, Plus, Minus, ShoppingCart, ArrowLeft, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShinyButton } from "@/components/ui/ShinyButton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useUser, useClerk } from "@clerk/clerk-react"; // ADICIONADO: Clerk

import { premiumToast } from "@/components/ui/premium-toast";
import { SimpleHeader } from "@/components/boder/SimpleHeader";
import { OrbBackground } from "@/components/boder/OrbBackground";


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';


const Credits = () => {
  const navigate = useNavigate();
  const { user, isLoaded, isSignedIn } = useUser(); // Hooks do Clerk
  const { openSignIn } = useClerk();
  
  const [quantity, setQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Estados para dados do Backend
  const [currentCredits, setCurrentCredits] = useState(0);
  const [userPlan, setUserPlan] = useState("free");
  const [isLoadingData, setIsLoadingData] = useState(true);

  const CREDITS_PER_PACK = 50;
  const PRICE_PER_PACK = 27;
  const totalCredits = quantity * CREDITS_PER_PACK;
  const totalPrice = quantity * PRICE_PER_PACK;

  // Busca dados reais do backend
  useEffect(() => {
    async function fetchData() {
        if (isSignedIn && user) {
            try {
                const res = await fetch(`${API_URL}/api/user/${user.id}?email=${user.primaryEmailAddress?.emailAddress}`);
                if (res.ok) {
                    const data = await res.json();
                    setCurrentCredits(data.credits);
                    setUserPlan(data.plan);
                }
            } catch (error) {
                console.error("Erro ao buscar dados:", error);
            } finally {
                setIsLoadingData(false);
            }
        } else if (isLoaded && !isSignedIn) {
            setIsLoadingData(false);
        }
    }
    fetchData();
  }, [isSignedIn, user, isLoaded]);

  // Redirect to auth if not logged in
  useEffect(() => {
      if (isLoaded && !isSignedIn) {
          openSignIn();
      }
  }, [isLoaded, isSignedIn]);

  // Check if user has a paid plan (Se quiser liberar pra todos testarem, mude para: "free")
  // Por enquanto, vou deixar que 'free' também pode ver, para você testar a tela.
  // Se quiser bloquear, mude para: userPlan !== "free"
  const isPaidUser = true; // userPlan !== "free"; 

  const handlePurchase = async () => {
    if (!user) {
      premiumToast.error("Você precisa estar logado");
      return;
    }

    setIsProcessing(true);
    
    // SIMULAÇÃO DE CHECKOUT
    try {
      // Simula delay de rede
      await new Promise(resolve => setTimeout(resolve, 1500));

      premiumToast.success("Checkout iniciado", "Redirecionando para o pagamento (Simulado)...");
      
      // Aqui futuramente você chamaria o endpoint do Stripe/MercadoPago no backend
      
      setTimeout(() => {
        window.open("https://google.com", "_blank"); 
        setIsProcessing(false);
      }, 1000);

    } catch (err) {
      console.error("Error creating checkout:", err);
      premiumToast.error("Erro ao iniciar compra", "Tente novamente.");
      setIsProcessing(false);
    }
  };

  const incrementQuantity = () => setQuantity((q) => Math.min(q + 1, 10));
  const decrementQuantity = () => setQuantity((q) => Math.max(q - 1, 1));

  if (!isLoaded || isLoadingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <OrbBackground />
      {/* Se o SimpleHeader não existir, pode remover essa linha ou comentar */}
      <SimpleHeader />
      
      <div className="container mx-auto px-4 py-12">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao Dashboard
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Coins className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Comprar Créditos Extras</h1>
            <p className="text-muted-foreground">
              Precisa de mais créditos para gerar sites? Compre pacotes extras!
            </p>
          </div>

          {!isPaidUser ? (
            <Card className="border-yellow-500/50 bg-yellow-500/5">
              <CardContent className="pt-6 text-center">
                <Sparkles className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  Disponível apenas para assinantes
                </h3>
                <p className="text-muted-foreground mb-4">
                  A compra de créditos extras está disponível apenas para usuários 
                  com planos Pro ou Anual ativos.
                </p>
                <ShinyButton onClick={() => navigate("/pricing")}>
                  Ver Planos
                </ShinyButton>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-primary/20">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Pacote de Créditos
                </CardTitle>
                <CardDescription>
                  Cada pacote contém {CREDITS_PER_PACK} créditos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Credits */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <span className="text-sm text-muted-foreground">Seus créditos atuais:</span>
                  <span className="text-2xl font-bold text-primary">{currentCredits}</span>
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  
                  <div className="text-center min-w-[120px]">
                    <div className="text-4xl font-bold">{quantity}</div>
                    <div className="text-sm text-muted-foreground">
                      {quantity === 1 ? "pacote" : "pacotes"}
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={incrementQuantity}
                    disabled={quantity >= 10}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Summary */}
                <div className="space-y-3 p-4 rounded-lg border border-primary/20 bg-primary/5">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Créditos:</span>
                    <span className="font-semibold text-primary">{totalCredits} créditos</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Preço por pacote:</span>
                    <span>R$ {PRICE_PER_PACK},00</span>
                  </div>
                  <div className="border-t border-primary/20 pt-3 flex justify-between">
                    <span className="font-semibold">Total:</span>
                    <span className="text-2xl font-bold text-primary">
                      R$ {totalPrice},00
                    </span>
                  </div>
                </div>

                {/* Purchase Button */}
                <ShinyButton
                  className="w-full"
                  onClick={handlePurchase}
                  disabled={isProcessing}
                  isLoading={isProcessing}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Comprar {totalCredits} Créditos
                </ShinyButton>

                <p className="text-xs text-center text-muted-foreground">
                  Pagamento seguro via Gateway (Simulado). Os créditos serão adicionados 
                  automaticamente à sua conta após a confirmação.
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Credits;