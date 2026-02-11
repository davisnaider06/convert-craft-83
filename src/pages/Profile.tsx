import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@clerk/clerk-react"; // FIX: Usando Clerk
import { OrbBackground } from "@/components/boder/OrbBackground";
import { ThemeToggle } from "@/components/boder/ThemeToggle";

import { premiumToast } from "@/components/ui/premium-toast";
import {
  ArrowLeft,
  User,
  Mail,
  Lock,
  Save,
  Loader2,
  Eye,
  EyeOff,
  Shield,
} from "lucide-react";
import boderLogo from "@/assets/boder-logo.png";

export default function Profile() {
  const { user, isLoaded, isSignedIn } = useUser();
  const navigate = useNavigate();
  
  const [fullName, setFullName] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  
  // States de Senha
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Carrega o nome atual quando o usuário é carregado
  useEffect(() => {
    if (user) {
        setFullName(user.fullName || "");
    }
  }, [user]);

  // Redireciona se não estiver logado
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
        navigate("/auth");
    }
  }, [isLoaded, isSignedIn, navigate]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsUpdatingProfile(true);
    try {
      // O Clerk separa First e Last name. Vamos tentar separar pelo primeiro espaço.
      const nameParts = fullName.trim().split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ");

      await user.update({
        firstName: firstName,
        lastName: lastName,
      });

      premiumToast.success("Perfil atualizado!", "Suas informações foram salvas.");
    } catch (error: any) {
      console.error(error);
      premiumToast.error("Erro ao atualizar", error.errors?.[0]?.message || "Tente novamente.");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (newPassword !== confirmPassword) {
      premiumToast.error("As senhas não coincidem");
      return;
    }

    if (newPassword.length < 8) {
      premiumToast.error("Senha muito curta", "Mínimo de 8 caracteres.");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await user.updatePassword({
        newPassword: newPassword,
      });

      setNewPassword("");
      setConfirmPassword("");
      premiumToast.success("Senha alterada!", "Use a nova senha no próximo login.");
    } catch (error: any) {
      console.error(error);
      // O Clerk retorna erros detalhados (ex: senha muito fraca, reutilizada)
      premiumToast.error("Erro na senha", error.errors?.[0]?.message || "Tente uma senha mais forte.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (!isLoaded || !user) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  // Acessando metadados de forma segura
  const userPlan = (user.publicMetadata?.plan as string) || "Free";
  const userCredits = (user.publicMetadata?.credits as number) || 0;

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
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            {boderLogo ? (
               <img src={boderLogo} alt="Boder AI" className="h-8 w-auto" />
            ) : (
               <span className="font-bold text-xl">Boder AI</span>
            )}
            <span className="text-xl font-semibold hidden sm:inline">Meu Perfil</span>
          </div>

          <ThemeToggle />
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative min-h-screen pt-24 pb-12 px-4">
        <div className="container max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {/* Profile Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Informações do Perfil
                </CardTitle>
                <CardDescription>
                  Atualize suas informações pessoais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      // O email principal vem do array de emails do Clerk
                      value={user.primaryEmailAddress?.emailAddress || ""}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      O email é gerenciado pela sua conta Clerk
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Nome Completo
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Seu nome completo"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="w-full gap-2"
                  >
                    {isUpdatingProfile ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Salvar Alterações
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Password Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Segurança
                </CardTitle>
                <CardDescription>
                  Altere sua senha de acesso
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Nova Senha
                    </Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Digite a nova senha"
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Confirmar Nova Senha
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirme a nova senha"
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <Button
                    type="submit"
                    variant="outline"
                    disabled={isUpdatingPassword || !newPassword || !confirmPassword}
                    className="w-full gap-2"
                  >
                    {isUpdatingPassword ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Lock className="h-4 w-4" />
                    )}
                    Alterar Senha
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Informações da Conta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Plano atual:</span>
                  <span className="font-medium text-foreground capitalize">
                    {userPlan}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Créditos disponíveis:</span>
                  <span className="font-medium text-foreground">
                    {userCredits}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Membro desde:</span>
                  <span className="font-medium text-foreground">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("pt-BR")
                      : "-"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}