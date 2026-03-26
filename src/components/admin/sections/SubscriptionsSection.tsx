import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, MoreVertical, RefreshCw, XCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { readApiResponse, useApiClient } from "@/lib/apiClient";

interface Subscription {
  id: string;
  email: string | null;
  full_name: string | null;
  plan: string;
  credits: number;
  created_at: string;
  updated_at: string;
}

export function SubscriptionsSection() {
  const { apiFetch } = useApiClient();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [filteredSubs, setFilteredSubs] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState("paid");

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  useEffect(() => {
    filterSubscriptions();
  }, [subscriptions, searchTerm, planFilter]);

  async function fetchSubscriptions() {
    setIsLoading(true);
    try {
      const response = await apiFetch("/api/admin/users");
      const parsed = await readApiResponse(response);
      if (!parsed.ok) throw new Error(parsed.error || "Falha ao carregar assinaturas");

      const mapped: Subscription[] = (parsed.data.users || []).map((u: any) => ({
        id: u.id,
        email: u.email,
        full_name: null,
        plan: u.planType,
        credits: u.credits,
        created_at: u.createdAt,
        updated_at: u.createdAt,
      }));

      setSubscriptions(mapped);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      toast.error("Erro ao carregar assinaturas");
    } finally {
      setIsLoading(false);
    }
  }

  function filterSubscriptions() {
    let filtered = [...subscriptions];

    if (searchTerm) {
      filtered = filtered.filter(
        (s) =>
          s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (planFilter === "paid") {
      filtered = filtered.filter((s) => s.plan !== "free");
    } else if (planFilter !== "all") {
      filtered = filtered.filter((s) => s.plan === planFilter);
    }

    setFilteredSubs(filtered);
  }

  async function cancelSubscription(userId: string) {
    try {
      const response = await apiFetch(`/api/admin/users/${userId}/plan`, {
        method: "POST",
        body: JSON.stringify({ planId: "free" }),
      });
      const parsed = await readApiResponse(response);
      if (!parsed.ok) throw new Error(parsed.error || "Falha ao cancelar assinatura");

      const updated = parsed.data.user;
      setSubscriptions((prev) =>
        prev.map((sub) =>
          sub.id === userId
            ? { ...sub, plan: updated.planType, credits: updated.credits, updated_at: new Date().toISOString() }
            : sub,
        ),
      );
      toast.success("Assinatura cancelada");
    } catch (error) {
      console.error("Error canceling subscription:", error);
      toast.error("Erro ao cancelar assinatura");
    }
  }

  async function reactivateSubscription(userId: string, plan: string) {
    try {
      const response = await apiFetch(`/api/admin/users/${userId}/plan`, {
        method: "POST",
        body: JSON.stringify({ planId: plan }),
      });
      const parsed = await readApiResponse(response);
      if (!parsed.ok) throw new Error(parsed.error || "Falha ao reativar assinatura");

      const updated = parsed.data.user;
      setSubscriptions((prev) =>
        prev.map((sub) =>
          sub.id === userId
            ? { ...sub, plan: updated.planType, credits: updated.credits, updated_at: new Date().toISOString() }
            : sub,
        ),
      );
      toast.success(`Assinatura reativada como ${plan.toUpperCase()}`);
    } catch (error) {
      console.error("Error reactivating subscription:", error);
      toast.error("Erro ao reativar assinatura");
    }
  }

  const getStatusBadge = (plan: string) => {
    if (plan === "free") {
      return <Badge variant="secondary">INATIVO</Badge>;
    }
    return <Badge className="bg-emerald-500 hover:bg-emerald-600">ATIVO</Badge>;
  };

  const getPlanBadge = (plan: string) => {
    const variants: Record<string, { className: string; label: string }> = {
      free: { className: "bg-muted text-muted-foreground hover:bg-muted/80", label: "FREE" },
      pro: { className: "bg-primary text-primary-foreground hover:bg-primary/90", label: "PRO" },
      anual: { className: "bg-amber-500 text-white hover:bg-amber-600", label: "ANUAL" },
      annual: { className: "bg-amber-500 text-white hover:bg-amber-600", label: "ANUAL" }, // Handle variations
      admin: { className: "bg-purple-600 text-white hover:bg-purple-700", label: "ADMIN" }
    };
    const config = variants[plan] || variants.free;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-muted/50" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold">Assinaturas & Cobrança</h2>
        <p className="text-muted-foreground">
          {filteredSubs.length} assinaturas encontradas (Simulação)
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col gap-4 sm:flex-row"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={planFilter} onValueChange={setPlanFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filtrar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="paid">Apenas Pagos</SelectItem>
            <SelectItem value="pro">Pro</SelectItem>
            <SelectItem value="annual">Anual</SelectItem>
            <SelectItem value="free">Free</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={fetchSubscriptions}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Atualizar
        </Button>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xl overflow-hidden"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Créditos</TableHead>
              <TableHead>Última Atualização</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubs.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{sub.email}</p>
                    <p className="text-xs text-muted-foreground">{sub.full_name || "—"}</p>
                  </div>
                </TableCell>
                <TableCell>{getPlanBadge(sub.plan)}</TableCell>
                <TableCell>{getStatusBadge(sub.plan)}</TableCell>
                <TableCell>{sub.credits}</TableCell>
                <TableCell>
                  {new Date(sub.updated_at).toLocaleDateString("pt-BR")}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {sub.plan !== "free" && sub.plan !== "admin" && (
                        <DropdownMenuItem onClick={() => cancelSubscription(sub.id)} className="text-red-500 focus:text-red-500 focus:bg-red-500/10">
                          <XCircle className="mr-2 h-4 w-4" />
                          Cancelar Assinatura
                        </DropdownMenuItem>
                      )}
                      {(sub.plan === "free" || sub.plan === "admin") && (
                        <>
                          <DropdownMenuItem onClick={() => reactivateSubscription(sub.id, "pro")}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Ativar Pro
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => reactivateSubscription(sub.id, "annual")}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Ativar Anual
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  );
}