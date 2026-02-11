import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

import { premiumToast } from "@/components/ui/premium-toast";
import {
  History,
  RotateCcw,
  Loader2,
  X,
  Clock,
  Eye,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Version {
  id: string;
  version_number: number;
  description: string | null;
  created_at: string;
  html_content: string;
}

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteId: string;
  currentHtml: string;
  onRevert: (html: string) => void;
}

export function VersionHistoryModal({
  isOpen,
  onClose,
  siteId,
  currentHtml,
  onRevert,
}: VersionHistoryModalProps) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [reverting, setReverting] = useState<string | null>(null);
  const [previewVersion, setPreviewVersion] = useState<Version | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadVersions();
    }
  }, [isOpen, siteId]);

  const loadVersions = async () => {
    setLoading(true);
    try {
      // SIMULATION: Network delay
      await new Promise(r => setTimeout(r, 800));

      // Mock Versions Data
      // In a real app, you would fetch versions based on siteId
      const mockVersions: Version[] = [
        {
          id: "v3",
          version_number: 3,
          description: "Ajuste de cores e fontes",
          created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
          html_content: '<div class="p-10 bg-slate-900 text-white text-center"><h1>Versão 3</h1><p>Esta é a versão mais recente com ajustes finos.</p></div>'
        },
        {
          id: "v2",
          version_number: 2,
          description: "Adicionado seção de serviços",
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
          html_content: '<div class="p-10 bg-slate-800 text-gray-200 text-center"><h1>Versão 2</h1><p>Adicionamos novos serviços aqui.</p></div>'
        },
        {
          id: "v1",
          version_number: 1,
          description: "Versão inicial gerada por IA",
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
          html_content: '<div class="p-10 bg-white text-black text-center"><h1>Versão 1</h1><p>O começo de tudo.</p></div>'
        }
      ];

      setVersions(mockVersions);
    } catch (error) {
      console.error("Error loading versions:", error);
      premiumToast.error("Erro ao carregar histórico");
    } finally {
      setLoading(false);
    }
  };

  const handleRevert = async (version: Version) => {
    setReverting(version.id);

    try {
      // SIMULATION: Revert process
      await new Promise(r => setTimeout(r, 1000));

      // In a real app, you'd save the current state as a backup before reverting
      const newBackupVersion: Version = {
        id: `v-backup-${Date.now()}`,
        version_number: Math.max(...versions.map(v => v.version_number), 0) + 1,
        description: "Backup automático antes de reverter",
        created_at: new Date().toISOString(),
        html_content: currentHtml
      };

      setVersions([newBackupVersion, ...versions]);
      
      // Update parent component
      onRevert(version.html_content);
      premiumToast.success(`Revertido para versão ${version.version_number}`);
      onClose();

    } catch (err) {
      console.error("Error reverting:", err);
      premiumToast.error("Erro ao reverter versão");
    } finally {
      setReverting(null);
    }
  };

  const handleDelete = async (versionId: string) => {
    // SIMULATION: Delete version
    try {
        setVersions(versions.filter((v) => v.id !== versionId));
        if (previewVersion?.id === versionId) {
            setPreviewVersion(null);
        }
        premiumToast.success("Versão excluída");
    } catch (error) {
        premiumToast.error("Erro ao excluir versão");
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-card border border-border rounded-2xl max-w-4xl w-full max-h-[80vh] shadow-2xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <History className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Histórico de Versões</h3>
                <p className="text-sm text-muted-foreground">
                  {versions.length} versões salvas (Simulação)
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
            {/* Versions List */}
            <div className="w-full md:w-1/3 border-r border-border overflow-y-auto p-4 bg-secondary/10">
              {loading ? (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : versions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <History className="h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">
                    Nenhuma versão salva ainda
                  </p>
                  <p className="text-sm text-muted-foreground/70">
                    Versões serão salvas automaticamente ao fazer ajustes
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {versions.map((version) => (
                    <motion.div
                      key={version.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        previewVersion?.id === version.id
                          ? "border-primary bg-primary/10 shadow-sm"
                          : "border-border bg-card hover:border-primary/50 hover:bg-secondary/50"
                      }`}
                      onClick={() => setPreviewVersion(version)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm">
                              v{version.version_number}
                            </span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground truncate">
                                {format(new Date(version.created_at), "dd/MM/yy HH:mm")}
                            </span>
                          </div>
                          
                          {version.description ? (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {version.description}
                            </p>
                          ) : (
                            <p className="text-xs text-muted-foreground italic">
                                Sem descrição
                            </p>
                          )}
                        </div>
                        
                        <div className="flex flex-col gap-1 ml-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 hover:bg-primary/20"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewVersion(version);
                            }}
                            title="Visualizar"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(version.id);
                            }}
                            title="Excluir"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Preview Panel */}
            <div className="w-full md:w-2/3 flex flex-col bg-muted/5">
              {previewVersion ? (
                <>
                  <div className="p-4 border-b border-border bg-card flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-sm">
                        Visualizando: Versão {previewVersion.version_number}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {format(
                          new Date(previewVersion.created_at),
                          "dd 'de' MMMM 'de' yyyy 'às' HH:mm",
                          { locale: ptBR }
                        )}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleRevert(previewVersion)}
                      disabled={reverting === previewVersion.id}
                      className="gap-2"
                    >
                      {reverting === previewVersion.id ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Revertendo...
                        </>
                      ) : (
                        <>
                          <RotateCcw className="h-3 w-3" />
                          Restaurar Versão
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="flex-1 p-4 overflow-hidden relative">
                    <div className="bg-white rounded-lg shadow-inner overflow-hidden h-full w-full relative">
                      {/* Using iframe with srcDoc to render raw HTML safely */}
                      <iframe
                        srcDoc={previewVersion.html_content}
                        className="w-full h-full border-0 absolute inset-0"
                        title="Preview da versão"
                        sandbox="allow-scripts allow-same-origin"
                      />
                      {/* Overlay to prevent interaction with iframe content during preview */}
                      <div className="absolute inset-0 z-10 bg-transparent" />
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                    <Eye className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <p className="font-medium">Selecione uma versão</p>
                  <p className="text-sm">Clique na lista ao lado para visualizar os detalhes</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}