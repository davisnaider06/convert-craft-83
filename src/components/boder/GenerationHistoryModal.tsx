import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, History } from "lucide-react";

type GenerationLog = {
  id: number;
  userId: string;
  prompt: string;
  cost: number;
  modelUsed: string;
  createdAt: string;
};

export function GenerationHistoryModal({
  isOpen,
  onOpenChange,
  logs,
  loading,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  logs: GenerationLog[];
  loading: boolean;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <History className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Histórico de Gerações</DialogTitle>
              <DialogDescription>
                Últimas ações da IA (prompt, custo e modelo).
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-auto pr-1">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : logs.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              Nenhuma geração registrada ainda.
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="rounded-xl border border-border/60 bg-card/50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString("pt-BR")}
                      </p>
                      <p className="text-xs mt-1">
                        Modelo:{" "}
                        <span className="font-medium text-foreground">{log.modelUsed}</span>
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs text-muted-foreground">Custo</p>
                      <p className="text-sm font-semibold text-primary">{log.cost}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground mb-1">Prompt</p>
                    <pre className="whitespace-pre-wrap break-words text-xs font-mono bg-background/70 border border-border/60 rounded-lg p-3 max-h-32 overflow-auto">
                      {log.prompt}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

