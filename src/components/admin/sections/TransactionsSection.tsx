import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Receipt,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  CreditCard,
  QrCode,
  FileText,
  ArrowUpDown,
  Eye,
  RotateCcw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AdminMetricCard } from "../AdminMetricCard";
import { toast } from "sonner";

interface Transaction {
  id: string;
  user_id: string;
  user_email: string | null;
  type: string;
  status: string;
  amount: number;
  currency: string;
  payment_method: string | null;
  asaas_payment_id: string | null;
  asaas_customer_id: string | null;
  description: string | null;
  metadata: unknown;
  created_at: string;
  confirmed_at: string | null;
  refunded_at: string | null;
}

export function TransactionsSection() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      // SIMULATION: Network delay
      await new Promise(r => setTimeout(r, 800));

      // Mock Transactions Data
      let mockData: Transaction[] = [
        {
          id: "txn_123456789",
          user_id: "user-1",
          user_email: "ana.silva@empresa.com",
          type: "subscription",
          status: "confirmed",
          amount: 67.00,
          currency: "BRL",
          payment_method: "credit_card",
          asaas_payment_id: "pay_123456",
          asaas_customer_id: "cus_123456",
          description: "Assinatura Pro Mensal",
          metadata: { plan: "pro" },
          created_at: "2023-10-25T10:00:00Z",
          confirmed_at: "2023-10-25T10:00:05Z",
          refunded_at: null
        },
        {
          id: "txn_987654321",
          user_id: "user-2",
          user_email: "carlos.dev@tech.io",
          type: "subscription",
          status: "confirmed",
          amount: 247.00,
          currency: "BRL",
          payment_method: "pix",
          asaas_payment_id: "pay_987654",
          asaas_customer_id: "cus_987654",
          description: "Assinatura Anual",
          metadata: { plan: "annual" },
          created_at: "2023-10-24T15:30:00Z",
          confirmed_at: "2023-10-24T15:35:00Z",
          refunded_at: null
        },
        {
          id: "txn_456789123",
          user_id: "user-3",
          user_email: "maria.loja@shop.com",
          type: "credits",
          status: "pending",
          amount: 27.00,
          currency: "BRL",
          payment_method: "boleto",
          asaas_payment_id: "pay_456789",
          asaas_customer_id: "cus_456789",
          description: "Pacote de 50 Créditos",
          metadata: { credits: 50 },
          created_at: "2023-10-26T09:00:00Z",
          confirmed_at: null,
          refunded_at: null
        },
        {
          id: "txn_789123456",
          user_id: "user-4",
          user_email: "joao.marketing@agency.com",
          type: "credits",
          status: "failed",
          amount: 54.00,
          currency: "BRL",
          payment_method: "credit_card",
          asaas_payment_id: "pay_789123",
          asaas_customer_id: "cus_789123",
          description: "Pacote de 100 Créditos",
          metadata: { credits: 100 },
          created_at: "2023-10-23T14:20:00Z",
          confirmed_at: null,
          refunded_at: null
        },
        {
          id: "txn_321654987",
          user_id: "user-5",
          user_email: "pedro.souza@email.com",
          type: "subscription",
          status: "refunded",
          amount: 67.00,
          currency: "BRL",
          payment_method: "credit_card",
          asaas_payment_id: "pay_321654",
          asaas_customer_id: "cus_321654",
          description: "Assinatura Pro Mensal",
          metadata: { plan: "pro" },
          created_at: "2023-10-20T11:00:00Z",
          confirmed_at: "2023-10-20T11:05:00Z",
          refunded_at: "2023-10-22T10:00:00Z"
        }
      ];

      // Client-side filtering and sorting simulation
      if (statusFilter !== "all") {
        mockData = mockData.filter(t => t.status === statusFilter);
      }

      if (typeFilter !== "all") {
        mockData = mockData.filter(t => t.type === typeFilter);
      }

      mockData.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      });

      setTransactions(mockData);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Erro ao carregar transações");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [statusFilter, typeFilter, sortOrder]);

  const filteredTransactions = transactions.filter((t) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      t.user_email?.toLowerCase().includes(search) ||
      t.asaas_payment_id?.toLowerCase().includes(search) ||
      t.description?.toLowerCase().includes(search)
    );
  });

  const totalRevenue = transactions
    .filter((t) => t.status === "confirmed")
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const pendingAmount = transactions
    .filter((t) => t.status === "pending")
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const refundedAmount = transactions
    .filter((t) => t.status === "refunded")
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Confirmado
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            <Clock className="mr-1 h-3 w-3" />
            Pendente
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
            <XCircle className="mr-1 h-3 w-3" />
            Falhou
          </Badge>
        );
      case "refunded":
        return (
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
            <RotateCcw className="mr-1 h-3 w-3" />
            Reembolsado
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "subscription":
        return (
          <Badge variant="outline" className="border-primary/50 text-primary">
            Assinatura
          </Badge>
        );
      case "credits":
        return (
          <Badge variant="outline" className="border-blue-500/50 text-blue-400">
            Créditos
          </Badge>
        );
      case "refund":
        return (
          <Badge variant="outline" className="border-purple-500/50 text-purple-400">
            Reembolso
          </Badge>
        );
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getPaymentMethodIcon = (method: string | null) => {
    switch (method) {
      case "credit_card":
        return <CreditCard className="h-4 w-4 text-muted-foreground" />;
      case "pix":
        return <QrCode className="h-4 w-4 text-muted-foreground" />;
      case "boleto":
        return <FileText className="h-4 w-4 text-muted-foreground" />;
      default:
        return null;
    }
  };

  const formatCurrency = (amount: number, currency: string = "BRL") => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transações</h1>
          <p className="text-muted-foreground">
            Histórico completo de pagamentos e transações (Simulação)
          </p>
        </div>
        <Button
          variant="outline"
          onClick={fetchTransactions}
          className="gap-2"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <AdminMetricCard
          title="Total Confirmado"
          value={formatCurrency(totalRevenue)}
          icon={CheckCircle2}
          subtitle={`${transactions.filter((t) => t.status === "confirmed").length} transações`}
          variant="success"
        />
        <AdminMetricCard
          title="Pendente"
          value={formatCurrency(pendingAmount)}
          icon={Clock}
          subtitle={`${transactions.filter((t) => t.status === "pending").length} aguardando`}
          variant="warning"
        />
        <AdminMetricCard
          title="Reembolsado"
          value={formatCurrency(refundedAmount)}
          icon={RotateCcw}
          subtitle={`${transactions.filter((t) => t.status === "refunded").length} reembolsos`}
          variant="default"
        />
        <AdminMetricCard
          title="Total Transações"
          value={transactions.length.toString()}
          icon={Receipt}
          subtitle={`${filteredTransactions.length} exibidas`}
          variant="default"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por email, ID ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Status</SelectItem>
            <SelectItem value="confirmed">Confirmado</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="failed">Falhou</SelectItem>
            <SelectItem value="refunded">Reembolsado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Tipos</SelectItem>
            <SelectItem value="subscription">Assinatura</SelectItem>
            <SelectItem value="credits">Créditos</SelectItem>
            <SelectItem value="refund">Reembolso</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
          className="gap-2"
        >
          <ArrowUpDown className="h-4 w-4" />
          {sortOrder === "desc" ? "Mais recentes" : "Mais antigas"}
        </Button>
      </div>

      {/* Transactions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden"
      >
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead>Data</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Método</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Carregando transações...
                  </p>
                </TableCell>
              </TableRow>
            ) : filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <Receipt className="h-12 w-12 mx-auto text-muted-foreground/50" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Nenhuma transação encontrada
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((transaction) => (
                <TableRow
                  key={transaction.id}
                  className="hover:bg-muted/50 border-border/50"
                >
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {formatDate(transaction.created_at)}
                  </TableCell>
                  <TableCell>
                    <span className="truncate max-w-[200px] block">
                      {transaction.user_email || "—"}
                    </span>
                  </TableCell>
                  <TableCell>{getTypeBadge(transaction.type)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getPaymentMethodIcon(transaction.payment_method)}
                      <span className="text-sm capitalize">
                        {transaction.payment_method?.replace("_", " ") || "—"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(Number(transaction.amount), transaction.currency)}
                  </TableCell>
                  <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedTransaction(transaction);
                        setShowDetails(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </motion.div>

      {/* Transaction Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              Detalhes da Transação
            </DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">ID da Transação</p>
                  <p className="font-mono text-sm">{selectedTransaction.id}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Data</p>
                  <p>{formatDate(selectedTransaction.created_at)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Usuário</p>
                  <p>{selectedTransaction.user_email || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">User ID</p>
                  <p className="font-mono text-xs">{selectedTransaction.user_id}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Tipo</p>
                  {getTypeBadge(selectedTransaction.type)}
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Status</p>
                  {getStatusBadge(selectedTransaction.status)}
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Valor</p>
                  <p className="text-xl font-bold text-primary">
                    {formatCurrency(Number(selectedTransaction.amount), selectedTransaction.currency)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Método de Pagamento</p>
                  <div className="flex items-center gap-2">
                    {getPaymentMethodIcon(selectedTransaction.payment_method)}
                    <span className="capitalize">
                      {selectedTransaction.payment_method?.replace("_", " ") || "—"}
                    </span>
                  </div>
                </div>
              </div>

              {selectedTransaction.description && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Descrição</p>
                  <p>{selectedTransaction.description}</p>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                {selectedTransaction.asaas_payment_id && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Asaas Payment ID</p>
                    <p className="font-mono text-xs">{selectedTransaction.asaas_payment_id}</p>
                  </div>
                )}
                {selectedTransaction.asaas_customer_id && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Asaas Customer ID</p>
                    <p className="font-mono text-xs">{selectedTransaction.asaas_customer_id}</p>
                  </div>
                )}
              </div>

              {selectedTransaction.confirmed_at && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Confirmado em</p>
                  <p>{formatDate(selectedTransaction.confirmed_at)}</p>
                </div>
              )}

              {selectedTransaction.refunded_at && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Reembolsado em</p>
                  <p>{formatDate(selectedTransaction.refunded_at)}</p>
                </div>
              )}

              {selectedTransaction.metadata && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Metadata</p>
                  <pre className="rounded-lg bg-muted p-3 text-xs overflow-auto max-h-40">
                    {JSON.stringify(selectedTransaction.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}