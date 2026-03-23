import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Save,
  Shield,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/boder/ThemeToggle";
import { OrbBackground } from "@/components/boder/OrbBackground";
import { premiumToast } from "@/components/ui/premium-toast";
import { readApiResponse, useApiClient } from "@/lib/apiClient";
import boderLogo from "@/assets/boder-logo.png";

export default function Profile() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { apiFetch } = useApiClient();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [accountPlan, setAccountPlan] = useState("free");
  const [accountCredits, setAccountCredits] = useState(0);

  useEffect(() => {
    if (user) setFullName(user.fullName || "");
  }, [user]);

  useEffect(() => {
    if (isLoaded && !isSignedIn) navigate("/auth");
  }, [isLoaded, isSignedIn, navigate]);

  useEffect(() => {
    async function loadAccount() {
      if (!user || !isSignedIn) return;
      try {
        const response = await apiFetch(`/api/user/${user.id}?email=${user.primaryEmailAddress?.emailAddress || ""}`);
        const parsed = await readApiResponse(response);
        if (!parsed.ok) return;
        setAccountPlan(parsed.data?.plan || "free");
        setAccountCredits(parsed.data?.credits || 0);
      } catch {
        // noop
      }
    }

    loadAccount();
  }, [apiFetch, isSignedIn, user]);

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setIsUpdatingProfile(true);
    try {
      const parts = fullName.trim().split(" ");
      const firstName = parts[0] || "";
      const lastName = parts.slice(1).join(" ");
      await user.update({ firstName, lastName });
      premiumToast.success("Perfil atualizado", "Suas informações foram salvas.");
    } catch (error: any) {
      premiumToast.error("Erro ao atualizar", error?.errors?.[0]?.message || "Tente novamente.");
    } finally {
      setIsUpdatingProfile(false);
    }
  }

  async function handleUpdatePassword(e: React.FormEvent) {
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
      await user.updatePassword({ newPassword });
      setNewPassword("");
      setConfirmPassword("");
      premiumToast.success("Senha alterada", "Sua nova senha já está ativa.");
    } catch (error: any) {
      premiumToast.error("Erro na senha", error?.errors?.[0]?.message || "Tente uma senha mais forte.");
    } finally {
      setIsUpdatingPassword(false);
    }
  }

  if (!isLoaded || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <OrbBackground />

      <motion.header
        className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm"
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <img src={boderLogo} alt="Boder AI" className="h-8 w-auto" />
            <span className="hidden text-xl font-semibold sm:inline">Meu perfil</span>
          </div>
          <ThemeToggle />
        </div>
      </motion.header>

      <main className="relative min-h-screen px-4 pb-12 pt-24">
        <div className="container mx-auto max-w-2xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Informações do perfil
              </CardTitle>
              <CardDescription>Atualize seus dados pessoais.</CardDescription>
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
                    value={user.primaryEmailAddress?.emailAddress || ""}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome completo</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Seu nome completo"
                  />
                </div>

                <Button type="submit" disabled={isUpdatingProfile} className="w-full gap-2">
                  {isUpdatingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Salvar alterações
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Segurança
              </CardTitle>
              <CardDescription>Altere sua senha quando quiser.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Nova senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowNewPassword((v) => !v)}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar senha</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                  {isUpdatingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                  Alterar senha
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Informações da conta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Plano atual</span>
                <span className="font-medium capitalize text-foreground">{accountPlan}</span>
              </div>
              <div className="flex justify-between">
                <span>Créditos disponíveis</span>
                <span className="font-medium text-foreground">{accountCredits}</span>
              </div>
              <div className="flex justify-between">
                <span>Membro desde</span>
                <span className="font-medium text-foreground">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString("pt-BR") : "-"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
