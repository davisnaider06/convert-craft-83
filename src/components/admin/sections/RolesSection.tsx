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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Search,
  Shield,
  ShieldOff,
  UserPlus,
  Trash2,
  Loader2,
  Users,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
// If this hook doesn't exist in your mock setup, you can remove it or mock the list
import { ADMIN_EMAILS } from "@/hooks/useAdminCheck"; 

interface UserRole {
  id: string;
  user_id: string;
  role: "admin" | "user";
  created_at: string;
  user_email?: string;
  user_name?: string;
}

interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
}

export function RolesSection() {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchRoles();
    fetchAllUsers();
  }, []);

  async function fetchRoles() {
    setIsLoading(true);
    try {
      // SIMULATION: Network delay
      await new Promise(r => setTimeout(r, 800));

      // Mock Roles Data
      const mockRoles: UserRole[] = [
        {
          id: "role-1",
          user_id: "user-1",
          role: "admin",
          created_at: "2023-01-15T10:00:00Z",
          user_email: "admin@boder.ia",
          user_name: "Super Admin"
        },
        {
          id: "role-2",
          user_id: "user-5",
          role: "admin",
          created_at: "2023-06-20T14:30:00Z",
          user_email: "suporte@boder.ia",
          user_name: "Suporte Técnico"
        }
      ];

      setRoles(mockRoles);
    } catch (error) {
      console.error("Error fetching roles:", error);
      toast.error("Erro ao carregar roles");
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchAllUsers() {
    try {
      // Mock Users Data for selection
      const mockUsers: UserProfile[] = [
        { id: "user-1", email: "admin@boder.ia", full_name: "Super Admin" },
        { id: "user-2", email: "joao@cliente.com", full_name: "João Cliente" },
        { id: "user-3", email: "maria@loja.com", full_name: "Maria Loja" },
        { id: "user-4", email: "pedro@startup.io", full_name: "Pedro CEO" },
        { id: "user-5", email: "suporte@boder.ia", full_name: "Suporte Técnico" },
      ];
      setAllUsers(mockUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }

  async function addAdminRole() {
    if (!newAdminEmail.trim()) {
      toast.error("Digite um email válido");
      return;
    }

    setIsSubmitting(true);
    try {
      // SIMULATION: Search user locally
      const user = allUsers.find(
        (u) => u.email?.toLowerCase() === newAdminEmail.toLowerCase().trim()
      );

      if (!user) {
        toast.error("Usuário não encontrado com esse email (Mock)");
        setIsSubmitting(false);
        return;
      }

      // Check existing role locally
      const existingRole = roles.find(
        (r) => r.user_id === user.id && r.role === "admin"
      );
      if (existingRole) {
        toast.error("Este usuário já é admin");
        setIsSubmitting(false);
        return;
      }

      // SIMULATION: Add role
      await new Promise(r => setTimeout(r, 600));

      const newRole: UserRole = {
        id: `role-${Date.now()}`,
        user_id: user.id,
        role: "admin",
        created_at: new Date().toISOString(),
        user_email: user.email || "",
        user_name: user.full_name || ""
      };

      setRoles(prev => [newRole, ...prev]);
      toast.success("Admin adicionado com sucesso!");
      setNewAdminEmail("");
      setIsAddDialogOpen(false);

    } catch (error) {
      console.error("Error adding admin:", error);
      toast.error("Erro ao adicionar admin");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function removeRole() {
    if (!selectedRole) return;

    setIsSubmitting(true);
    try {
      // SIMULATION: Remove role
      await new Promise(r => setTimeout(r, 600));

      setRoles(prev => prev.filter(r => r.id !== selectedRole.id));
      toast.success("Role removida com sucesso!");
      setIsDeleteDialogOpen(false);
      setSelectedRole(null);

    } catch (error) {
      console.error("Error removing role:", error);
      toast.error("Erro ao remover role");
    } finally {
      setIsSubmitting(false);
    }
  }

  const filteredRoles = roles.filter(
    (role) =>
      role.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const adminCount = roles.filter((r) => r.role === "admin").length;
  // If ADMIN_EMAILS is not defined in mock, fallback to 0 or hardcoded list
  const hardcodedAdminCount = ADMIN_EMAILS ? ADMIN_EMAILS.length : 0; 

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
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
        <h2 className="text-2xl font-bold">Gerenciamento de Roles</h2>
        <p className="text-muted-foreground">
          Gerencie permissões e roles dos usuários (Simulação)
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-4 sm:grid-cols-3"
      >
        <div className="rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-primary/20 p-3">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Admins (DB)</p>
              <p className="text-2xl font-bold">{adminCount}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-amber-500/20 p-3">
              <Shield className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Admins (Código)</p>
              <p className="text-2xl font-bold">{hardcodedAdminCount}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-blue-500/20 p-3">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Usuários</p>
              <p className="text-2xl font-bold">{allUsers.length}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Hardcoded Admins Info  */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4"
      >
        <div className="flex items-start gap-3">
          <Shield className="mt-0.5 h-5 w-5 text-amber-500" />
          <div>
            <p className="font-medium text-amber-200">Admins Fixos (no código)</p>
            <p className="mt-1 text-sm text-amber-200/70">
              Estes emails são admins fixos definidos no código e não podem ser removidos por aqui:
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {ADMIN_EMAILS && ADMIN_EMAILS.map((email) => (
                <Badge key={email} variant="outline" className="border-amber-500/50 text-amber-200">
                  {email}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search and Add */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
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
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Adicionar Admin
        </Button>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xl"
      >
        {filteredRoles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ShieldOff className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-lg font-medium">Nenhuma role encontrada</p>
            <p className="text-sm text-muted-foreground">
              Adicione admins usando o botão acima
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Adicionado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{role.user_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {role.user_email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        role.role === "admin"
                          ? "border-primary text-primary"
                          : "border-muted-foreground"
                      }
                    >
                      <Shield className="mr-1 h-3 w-3" />
                      {role.role.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(role.created_at).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-400 hover:bg-red-500/10 hover:text-red-400"
                      onClick={() => {
                        setSelectedRole(role);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </motion.div>

      {/* Add Admin Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Novo Admin</DialogTitle>
            <DialogDescription>
              Digite o email do usuário que deseja tornar admin. O usuário já
              deve ter uma conta no sistema.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="email@exemplo.com"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addAdminRole()}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button onClick={addAdminRole} disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Shield className="mr-2 h-4 w-4" />
              )}
              Adicionar Admin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Role de Admin</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover a role de admin de{" "}
              <strong>{selectedRole?.user_email}</strong>? Esta ação pode ser
              desfeita adicionando o usuário novamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={removeRole}
              disabled={isSubmitting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}