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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { RefreshCw, ChevronDown, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";

// Simplified type for Mock
interface WebhookLog {
  id: string;
  event_type: string;
  payload: any;
  status: string;
  error_message: string | null;
  created_at: string;
  resolved_at: string | null;
}

export function WebhooksSection() {
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    setIsLoading(true);
    try {
      // SIMULATION: Network delay
      await new Promise(r => setTimeout(r, 800));

      // Mock Webhook Logs
      const mockLogs: WebhookLog[] = [
        {
          id: "log_1",
          event_type: "payment.confirmed",
          payload: { transaction_id: "txn_123", amount: 67.00, user: "ana@email.com" },
          status: "success",
          error_message: null,
          created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 min ago
          resolved_at: null
        },
        {
          id: "log_2",
          event_type: "subscription.created",
          payload: { plan: "pro", cycle: "monthly" },
          status: "success",
          error_message: null,
          created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
          resolved_at: null
        },
        {
          id: "log_3",
          event_type: "credits.added",
          payload: { credits: 100, user_id: "user_456" },
          status: "error",
          error_message: "Database timeout",
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          resolved_at: null
        },
        {
          id: "log_4",
          event_type: "site.published",
          payload: { site_id: "site_789", subdomain: "barbearia-top" },
          status: "pending",
          error_message: null,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
          resolved_at: null
        },
        {
          id: "log_5",
          event_type: "invoice.failed",
          payload: { reason: "insufficient_funds", attempt: 3 },
          status: "resolved",
          error_message: "Payment declined by bank",
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
          resolved_at: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString()
        }
      ];

      setLogs(mockLogs);
    } catch (error) {
      console.error("Error fetching webhook logs:", error);
      toast.error("Erro ao carregar logs");
    } finally {
      setIsLoading(false);
    }
  }

  async function markAsResolved(id: string) {
    try {
      // SIMULATION: Update local state
      await new Promise(r => setTimeout(r, 500));

      setLogs(prevLogs => prevLogs.map(log => 
        log.id === id 
          ? { ...log, status: "resolved", resolved_at: new Date().toISOString() } 
          : log
      ));

      toast.success("Marcado como resolvido");
    } catch (error) {
      console.error("Error marking as resolved:", error);
      toast.error("Erro ao atualizar status");
    }
  }

  function toggleRow(id: string) {
    const newSet = new Set(expandedRows);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedRows(newSet);
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { className: string; icon: React.ReactNode }> = {
      success: {
        className: "bg-emerald-500",
        icon: <CheckCircle className="mr-1 h-3 w-3" />,
      },
      error: {
        className: "bg-red-500",
        icon: <XCircle className="mr-1 h-3 w-3" />,
      },
      pending: {
        className: "bg-amber-500",
        icon: <Clock className="mr-1 h-3 w-3" />,
      },
      resolved: {
        className: "bg-blue-500",
        icon: <CheckCircle className="mr-1 h-3 w-3" />,
      },
    };
    const config = variants[status] || variants.pending;
    return (
      <Badge className={config.className}>
        {config.icon}
        {status.toUpperCase()}
      </Badge>
    );
  };

  const successCount = logs.filter((l) => l.status === "success").length;
  const errorCount = logs.filter((l) => l.status === "error").length;
  const pendingCount = logs.filter((l) => l.status === "pending").length;

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
        <h2 className="text-2xl font-bold">Webhook & Logs do Sistema</h2>
        <p className="text-muted-foreground">
          {logs.length} eventos registrados (Simulação)
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 gap-4 md:grid-cols-4"
      >
        <div className="rounded-2xl border border-border/50 bg-card/50 p-4 backdrop-blur-xl">
          <p className="text-sm text-muted-foreground">Total de Eventos</p>
          <p className="text-2xl font-bold">{logs.length}</p>
        </div>
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
          <p className="text-sm text-emerald-400">Sucesso</p>
          <p className="text-2xl font-bold text-emerald-400">{successCount}</p>
        </div>
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-sm text-red-400">Erros</p>
          <p className="text-2xl font-bold text-red-400">{errorCount}</p>
        </div>
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
          <p className="text-sm text-amber-400">Pendentes</p>
          <p className="text-2xl font-bold text-amber-400">{pendingCount}</p>
        </div>
      </motion.div>

      {/* Refresh Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Button variant="outline" onClick={fetchLogs}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Atualizar Logs
        </Button>
      </motion.div>

      {/* Logs Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xl"
      >
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <p className="text-lg font-medium">Nenhum log encontrado</p>
            <p className="text-sm text-muted-foreground">
              Os logs de webhook aparecerão aqui quando houver eventos
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>Evento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data/Hora</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <Collapsible key={log.id} asChild>
                  <>
                    <TableRow>
                      <TableCell>
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => toggleRow(log.id)}
                          >
                            <ChevronDown
                              className={`h-4 w-4 transition-transform ${
                                expandedRows.has(log.id) ? "rotate-180" : ""
                              }`}
                            />
                          </Button>
                        </CollapsibleTrigger>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.event_type}</Badge>
                        {log.error_message && (
                          <p className="mt-1 text-xs text-red-400">
                            {log.error_message}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                      <TableCell>
                        {new Date(log.created_at).toLocaleString("pt-BR")}
                      </TableCell>
                      <TableCell className="text-right">
                        {log.status === "error" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markAsResolved(log.id)}
                          >
                            Marcar Resolvido
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                    <CollapsibleContent asChild>
                      <tr>
                        <td colSpan={5} className="bg-muted/20 p-4">
                          <pre className="max-h-60 overflow-auto rounded-lg bg-background p-4 text-xs">
                            {JSON.stringify(log.payload, null, 2)}
                          </pre>
                        </td>
                      </tr>
                    </CollapsibleContent>
                  </>
                </Collapsible>
              ))}
            </TableBody>
          </Table>
        )}
      </motion.div>
    </div>
  );
}