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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, Trash2, Eye, EyeOff, ExternalLink, FolderKanban } from "lucide-react";
import { toast } from "sonner";
import { AdminMetricCard } from "../AdminMetricCard";
import { readApiResponse, useApiClient } from "@/lib/apiClient";

interface Project {
  id: string;
  name: string;
  description: string | null;
  nicho: string | null;
  objetivo: string | null;
  estilo: string | null;
  subdomain: string | null;
  is_published: boolean;
  has_watermark: boolean;
  created_at: string;
  user_id: string;
  user_email?: string;
}

export function ProjectsSection() {
  const { apiFetch } = useApiClient();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchTerm]);

  async function fetchProjects() {
    setIsLoading(true);
    try {
      const response = await apiFetch("/api/admin/sites");
      const parsed = await readApiResponse(response);
      if (!parsed.ok) throw new Error(parsed.error || "Falha ao carregar projetos");

      const mapped: Project[] = (parsed.data.sites || []).map((s: any) => ({
        id: s.id,
        name: s.name || "Meu Site",
        description: s.description,
        nicho: s.content?.metadata?.nicho ?? null,
        objetivo: s.content?.metadata?.objetivo ?? null,
        estilo: s.content?.metadata?.estilo ?? null,
        subdomain: s.subdomain ?? null,
        is_published: s.is_published,
        has_watermark: false,
        created_at: s.created_at,
        user_id: s.userId,
        user_email: s.user?.email ?? null,
      }));

      setProjects(mapped);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Erro ao carregar projetos");
    } finally {
      setIsLoading(false);
    }
  }

  function filterProjects() {
    let filtered = [...projects];

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.nicho?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProjects(filtered);
  }

  async function deleteProject(id: string) {
    try {
      const response = await apiFetch(`/api/admin/sites/${id}`, { method: "DELETE" });
      const parsed = await readApiResponse(response);
      if (!parsed.ok) throw new Error(parsed.error || "Falha ao excluir projeto");

      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast.success("Projeto excluído");
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Erro ao excluir projeto");
    }
  }

  async function togglePublish(id: string, currentStatus: boolean) {
    try {
      const project = projects.find((p) => p.id === id);

      if (currentStatus) {
        const response = await apiFetch(`/api/admin/sites/${id}/unpublish`, { method: "POST" });
        const parsed = await readApiResponse(response);
        if (!parsed.ok) throw new Error(parsed.error || "Falha ao despublicar");
      } else {
        const subdomain =
          project?.subdomain ||
          project?.name?.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") ||
          "";

        const response = await apiFetch(`/api/admin/sites/${id}/publish`, {
          method: "POST",
          body: JSON.stringify({ subdomain }),
        });
        const parsed = await readApiResponse(response);
        if (!parsed.ok) throw new Error(parsed.error || "Falha ao publicar");
      }

      toast.success(currentStatus ? "Projeto despublicado" : "Projeto publicado");
      await fetchProjects();
    } catch (error) {
      console.error("Error toggling publish:", error);
      toast.error("Erro ao alterar publicação");
    }
  }

  const publishedCount = projects.filter((p) => p.is_published).length;
  const draftCount = projects.filter((p) => !p.is_published).length;

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
        <h2 className="text-2xl font-bold">Projetos & Uso</h2>
        <p className="text-muted-foreground">
          {projects.length} projetos criados (Simulação)
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <AdminMetricCard
          title="Total de Projetos"
          value={projects.length}
          icon={FolderKanban}
          delay={0}
        />
        <AdminMetricCard
          title="Publicados"
          value={publishedCount}
          icon={Eye}
          variant="success"
          delay={0.1}
        />
        <AdminMetricCard
          title="Rascunhos"
          value={draftCount}
          icon={EyeOff}
          delay={0.2}
        />
      </div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative"
      >
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, email ou nicho..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xl"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Projeto</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Nicho</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProjects.map((project) => (
              <TableRow key={project.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{project.name}</p>
                    {project.subdomain && (
                      <p className="text-xs text-muted-foreground">
                        {project.subdomain}.boder.app
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm">{project.user_email}</TableCell>
                <TableCell>
                  {project.nicho && (
                    <Badge variant="outline">{project.nicho}</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {project.is_published ? (
                    <Badge className="bg-emerald-500">Publicado</Badge>
                  ) : (
                    <Badge variant="secondary">Rascunho</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {new Date(project.created_at).toLocaleDateString("pt-BR")}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {project.subdomain && project.is_published && (
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                      >
                        <a
                          href={`https://${project.subdomain}.boder.app`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePublish(project.id, project.is_published)}
                    >
                      {project.is_published ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(project.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </motion.div>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir projeto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O projeto será permanentemente excluído (Simulação).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteProject(deleteId)}
              className="bg-red-500 hover:bg-red-600"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}