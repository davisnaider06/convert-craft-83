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
import { Search, MoreVertical, Shield, ShieldOff, Ban, CheckCircle } from "lucide-react";
import { toast } from "sonner";
// If ADMIN_EMAILS doesn't exist in your current setup, you can remove this import or create a dummy file
import { ADMIN_EMAILS } from "@/hooks/useAdminCheck";
import { readApiResponse, useApiClient } from "@/lib/apiClient";

interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  credits: number;
  plan: string;
  created_at: string;
  isAdmin?: boolean;
}

export function UsersSection() {
  const { apiFetch } = useApiClient();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState("all");

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, planFilter]);

  async function fetchUsers() {
    setIsLoading(true);
    try {
      const response = await apiFetch("/api/admin/users");
      const parsed = await readApiResponse(response);
      if (!parsed.ok) throw new Error(parsed.error || "Falha ao carregar usuários");

      const mapped: UserProfile[] = (parsed.data.users || []).map((u: any) => ({
        id: u.id,
        email: u.email,
        full_name: null,
        credits: u.credits,
        plan: u.planType,
        created_at: u.createdAt,
        isAdmin: u.email ? ADMIN_EMAILS.includes(u.email) : false,
      }));

      setUsers(mapped);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Erro ao carregar usuários");
    } finally {
      setIsLoading(false);
    }
  }

  function filterUsers() {
    let filtered = [...users];

    if (searchTerm) {
      filtered = filtered.filter(
        (u) =>
          u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (planFilter !== "all") {
      filtered = filtered.filter((u) => u.plan === planFilter);
    }

    setFilteredUsers(filtered);
  }

  async function updateUserPlan(userId: string, plan: string) {
    try {
      const response = await apiFetch(`/api/admin/users/${userId}/plan`, {
        method: "POST",
        body: JSON.stringify({ planId: plan }),
      });
      const parsed = await readApiResponse(response);
      if (!parsed.ok) throw new Error(parsed.error || "Falha ao atualizar plano");

      const updated = parsed.data.user;
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                plan: updated.planType,
                credits: updated.credits,
              }
            : u,
        ),
      );

      toast.success(`Plano atualizado para ${plan.toUpperCase()}`);
    } catch (error) {
      console.error("Error updating plan:", error);
      toast.error("Erro ao atualizar plano");
    }
  }

  async function toggleAdminRole(userId: string, isCurrentlyAdmin: boolean) {
    try {
      // A role admin é definida no backend via ADMIN_EMAILS (env).
      toast.info("Role admin é definida por configuração do backend (ADMIN_EMAILS).");
    } catch (error) {
      console.error("Error toggling admin:", error);
      toast.error("Erro ao modificar role");
    }
  }

  const getPlanBadge = (plan: string) => {
    const variants: Record<string, { className: string; label: string }> = {
      free: { className: "bg-muted text-muted-foreground hover:bg-muted/80", label: "FREE" },
      pro: { className: "bg-primary text-primary-foreground hover:bg-primary/90", label: "PRO" },
      anual: { className: "bg-amber-500 text-white hover:bg-amber-600", label: "ANUAL" },
      annual: { className: "bg-amber-500 text-white hover:bg-amber-600", label: "ANUAL" }, // Handle variations
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
        <h2 className="text-2xl font-bold">Gerenciamento de Usuários</h2>
        <p className="text-muted-foreground">
          {filteredUsers.length} usuários encontrados (Simulação)
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
            placeholder="Buscar por email ou nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={planFilter} onValueChange={setPlanFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filtrar por plano" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="pro">Pro</SelectItem>
            <SelectItem value="annual">Anual</SelectItem>
          </SelectContent>
        </Select>
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
              <TableHead>Usuário</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Créditos</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Cadastro</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{user.full_name || "Sem nome"}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </TableCell>
                <TableCell>{getPlanBadge(user.plan)}</TableCell>
                <TableCell>
                  {user.credits}
                </TableCell>
                <TableCell>
                  {user.isAdmin ? (
                    <Badge variant="outline" className="border-primary text-primary">
                      <Shield className="mr-1 h-3 w-3" />
                      ADMIN
                    </Badge>
                  ) : (
                    <Badge variant="secondary">USUÁRIO</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {new Date(user.created_at).toLocaleDateString("pt-BR")}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => updateUserPlan(user.id, "pro")}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Upgrade para Pro
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateUserPlan(user.id, "annual")}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Upgrade para Anual
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateUserPlan(user.id, "free")}>
                        <Ban className="mr-2 h-4 w-4" />
                        Rebaixar para Free
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => toggleAdminRole(user.id, user.isAdmin || false)}
                      >
                        {user.isAdmin ? (
                          <>
                            <ShieldOff className="mr-2 h-4 w-4" />
                            Remover Admin
                          </>
                        ) : (
                          <>
                            <Shield className="mr-2 h-4 w-4" />
                            Tornar Admin
                          </>
                        )}
                      </DropdownMenuItem>
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