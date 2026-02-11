import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Loader2 } from "lucide-react";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { OverviewSection } from "@/components/admin/sections/OverviewSection";
import { UsersSection } from "@/components/admin/sections/UsersSection";
import { RolesSection } from "@/components/admin/sections/RolesSection";
import { SubscriptionsSection } from "@/components/admin/sections/SubscriptionsSection";
import { CreditsSection } from "@/components/admin/sections/CreditsSection";
import { TransactionsSection } from "@/components/admin/sections/TransactionsSection";
import { ProjectsSection } from "@/components/admin/sections/ProjectsSection";
import { AnalyticsSection } from "@/components/admin/sections/AnalyticsSection";
import { WebhooksSection } from "@/components/admin/sections/WebhooksSection";

export default function Admin() {
  const navigate = useNavigate();
  const { isAdmin, isLoading, user } = useAdminCheck();
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    } else if (!isLoading && !isAdmin) {
      navigate("/dashboard");
    }
  }, [isLoading, isAdmin, user, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
            <div className="relative rounded-full bg-primary/20 p-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">
              Verificando permissões...
            </span>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="rounded-full bg-red-500/20 p-4 mx-auto w-fit mb-4">
            <Shield className="h-8 w-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold">Acesso Negado</h1>
          <p className="mt-2 text-muted-foreground">
            Você não tem permissão para acessar esta página.
          </p>
        </motion.div>
      </div>
    );
  }

  const renderSection = () => {
    switch (activeSection) {
      case "overview":
        return <OverviewSection />;
      case "users":
        return <UsersSection />;
      case "roles":
        return <RolesSection />;
      case "subscriptions":
        return <SubscriptionsSection />;
      case "credits":
        return <CreditsSection />;
      case "transactions":
        return <TransactionsSection />;
      case "projects":
        return <ProjectsSection />;
      case "analytics":
        return <AnalyticsSection />;
      case "webhooks":
        return <WebhooksSection />;
      default:
        return <OverviewSection />;
    }
  };

  return (
    <div className="min-h-screen bg-background dark">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />
        <div className="absolute left-1/4 top-1/4 h-96 w-96 animate-pulse rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 h-96 w-96 animate-pulse rounded-full bg-primary/5 blur-3xl" style={{ animationDelay: "1s" }} />
      </div>

      <AdminSidebar activeSection={activeSection} onSectionChange={setActiveSection} />

      {/* Main Content */}
      <main className="ml-64 min-h-screen p-8 transition-all duration-300">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderSection()}
        </motion.div>
      </main>
    </div>
  );
}
