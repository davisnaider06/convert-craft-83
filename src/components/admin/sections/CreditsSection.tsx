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
import { Label } from "@/components/ui/label";
import { Search, Plus, RotateCcw, Coins } from "lucide-react";
import { toast } from "sonner";
// Se o arquivo ADMIN_EMAILS não existir, pode remover o import e usar a lista fixa abaixo
import { ADMIN_EMAILS } from "@/hooks/useAdminCheck"; 

interface UserCredits {
  id: string;
  email: string | null;
  full_name: string | null;
  credits: number;
  plan: string;
}

export function CreditsSection() {
  const [users, setUsers] = useState<UserCredits[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserCredits[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserCredits | null>(null);
  const [creditsToAdd, setCreditsToAdd] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm]);

  async function fetchUsers() {
    setIsLoading(true);
    try {
      // SIMULAÇÃO: Delay de rede
      await new Promise(r => setTimeout(r, 800));

      // Dados Mockados para o Painel Admin
      const mockUsers: UserCredits[] = [
        { id: "1", email: "admin@boder.ia", full_name: "Admin Boder", credits: 99999, plan: "admin" },
        { id: "2", email: "joao.silva@email.com", full_name: "João Silva", credits: 12, plan: "free" },
        { id: "3", email: "maria.dev@agencia.com", full_name: "Maria Souza", credits: 85, plan: "pro" },
        { id: "4", email: "contato@lojalegal.com.br", full_name: "Loja Legal", credits: 0, plan: "free" },
        { id: "5", email: "pedro.startup@tech.io", full_name: "Pedro Tech", credits: 240, plan: "annual" },
        { id: "6", email: "ana.marketing@social.com", full_name: "Ana Marketing", credits: 45, plan: "pro" },
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

    setFilteredUsers(filtered);
  }

  async function addCredits() {
    if (!selectedUser || !creditsToAdd) return;

    const amount = parseInt(creditsToAdd);
    if (isNaN(amount) || amount <= 0) {
        toast.error("Quantidade inválida");
        return;
    }

    try {
      // SIMULAÇÃO: Atualização no banco
      await new Promise(r => setTimeout(r, 600));

      const updatedUsers = users.map(user => 
        user.id === selectedUser.id 
          ? { ...user, credits: user.credits + amount } 
          : user
      );

      setUsers(updatedUsers);
      toast.success(`${amount} créditos adicionados para ${selectedUser.email}`);
      setIsDialogOpen(false);
      setCreditsToAdd("");
      
    } catch (error) {
      console.error("Error adding credits:", error);
      toast.error("Erro ao adicionar créditos");
    }
  }

  async function resetCredits(userId: string, plan: string) {
    const defaultCredits = plan === "free" ? 10 : 100;

    try {
      // SIMULAÇÃO: Reset no banco
      await new Promise(r => setTimeout(r, 600));

      const updatedUsers = users.map(user => 
        user.id === userId
          ? { ...user, credits: defaultCredits } 
          : user
      );

      setUsers(updatedUsers);
      toast.success("Créditos resetados para o padrão do plano");
    } catch (error) {
      console.error("Error resetting credits:", error);
      toast.error("Erro ao resetar créditos");
    }
  }

  const getCreditBadge = (credits: number, email: string | null) => {
    // Verifica se é admin (usando lista importada ou verificação simples)
    const isAdmin = email && (ADMIN_EMAILS.includes(email) || email.includes("admin"));

    if (isAdmin) {
      return (
        <Badge className="bg-gradient-to-r from-primary to-emerald-400 text-white hover:opacity-90">
          ∞ ILIMITADO
        </Badge>
      );
    }

    if (credits === 0) {
      return <Badge variant="destructive">0 CRÉDITOS</Badge>;
    }

    if (credits <= 5) {
      return <Badge className="bg-amber-500 hover:bg-amber-600">⚠️ {credits}</Badge>;
    }

    return <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">{credits}</Badge>;
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
        <h2 className="text-2xl font-bold">Controle de Créditos</h2>
        <p className="text-muted-foreground">
          Gerenciar créditos dos usuários (Simulação)
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 gap-4 md:grid-cols-3"
      >
        <div className="rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/20 p-3">
              <Coins className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Créditos</p>
              <p className="text-2xl font-bold">
                {users.reduce((acc, u) => acc + (u.credits < 90000 ? u.credits : 0), 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-500/20 p-3">
              <Coins className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Usuários sem Créditos</p>
              <p className="text-2xl font-bold">
                {users.filter((u) => u.credits === 0).length}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-500/20 p-3">
              <Coins className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Média por Usuário</p>
              <p className="text-2xl font-bold">
                {/* Exclui admins da média para não distorcer */}
                {(users.filter(u => u.credits < 90000).reduce((acc, u) => acc + u.credits, 0) / users.filter(u => u.credits < 90000).length || 0).toFixed(0)}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative"
      >
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xl overflow-hidden"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Créditos</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{user.email}</p>
                    <p className="text-xs text-muted-foreground">{user.full_name || "—"}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">{user.plan}</Badge>
                </TableCell>
                <TableCell>{getCreditBadge(user.credits, user.email)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user);
                        setIsDialogOpen(true);
                      }}
                      disabled={user.credits > 90000}
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      Adicionar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => resetCredits(user.id, user.plan)}
                      disabled={user.credits > 90000}
                    >
                      <RotateCcw className="mr-1 h-3 w-3" />
                      Resetar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </motion.div>

      {/* Add Credits Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Créditos</DialogTitle>
            <DialogDescription>
              Adicionar créditos para <span className="font-medium text-foreground">{selectedUser?.email}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Créditos atuais</Label>
              <p className="text-2xl font-bold">{selectedUser?.credits}</p>
            </div>
            <div className="space-y-2">
              <Label>Quantidade a adicionar</Label>
              <Input
                type="number"
                value={creditsToAdd}
                onChange={(e) => setCreditsToAdd(e.target.value)}
                placeholder="Ex: 50"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={addCredits}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}