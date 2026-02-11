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
      // SIMULATION: Network delay
      await new Promise(r => setTimeout(r, 800));

      // Mock Users Data
      const mockUsers: UserProfile[] = [
        {
          id: "1",
          email: "admin@boder.ia",
          full_name: "Admin Boder",
          credits: 9999,
          plan: "pro",
          created_at: "2023-01-01T10:00:00Z",
          isAdmin: true
        },
        {
          id: "2",
          email: "joao.silva@gmail.com",
          full_name: "João Silva",
          credits: 10,
          plan: "free",
          created_at: "2023-05-15T14:30:00Z",
          isAdmin: false
        },
        {
          id: "3",
          email: "maria.souza@empresa.com",
          full_name: "Maria Souza",
          credits: 85,
          plan: "pro",
          created_at: "2023-06-20T09:15:00Z",
          isAdmin: false
        },
        {
          id: "4",
          email: "pedro.tech@startup.io",
          full_name: "Pedro Tech",
          credits: 240,
          plan: "annual",
          created_at: "2023-02-10T16:45:00Z",
          isAdmin: false
        },
        {
          id: "5",
          email: "lucas.dev@code.com",
          full_name: "Lucas Dev",
          credits: 5,
          plan: "free",
          created_at: "2023-08-05T11:20:00Z",
          isAdmin: false
        }
      ];

      setUsers(mockUsers);
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
      // SIMULATION: Update Plan
      await new Promise(r => setTimeout(r, 500));

      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, plan: plan } : u
      ));

      toast.success(`Plano atualizado para ${plan.toUpperCase()}`);
    } catch (error) {
      console.error("Error updating plan:", error);
      toast.error("Erro ao atualizar plano");
    }
  }

  async function toggleAdminRole(userId: string, isCurrentlyAdmin: boolean) {
    try {
      // SIMULATION: Toggle Admin
      await new Promise(r => setTimeout(r, 500));

      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, isAdmin: !isCurrentlyAdmin } : u
      ));

      if (isCurrentlyAdmin) {
        toast.success("Role de admin removida");
      } else {
        toast.success("Role de admin adicionada");
      }
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
                  {user.email && ADMIN_EMAILS && ADMIN_EMAILS.includes(user.email) ? (
                    <span className="font-bold text-primary">∞</span>
                  ) : (
                    user.credits
                  )}
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