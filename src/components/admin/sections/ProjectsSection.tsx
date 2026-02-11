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
      // SIMULAÇÃO: Delay de rede
      await new Promise(r => setTimeout(r, 800));

      // Dados Mockados de Projetos
      const mockProjects: Project[] = [
        {
          id: "1",
          name: "Barbearia do Zé",
          description: "Landing page para barbearia moderna",
          nicho: "Beleza",
          objetivo: "Agendamento",
          estilo: "Vintage",
          subdomain: "barbearia-ze",
          is_published: true,
          has_watermark: false,
          created_at: new Date().toISOString(),
          user_id: "user-1",
          user_email: "ze@barbearia.com"
        },
        {
          id: "2",
          name: "Advocacia Silva",
          description: "Site institucional para escritório",
          nicho: "Jurídico",
          objetivo: "Institucional",
          estilo: "Sóbrio",
          subdomain: "silva-adv",
          is_published: true,
          has_watermark: true,
          created_at: new Date(Date.now() - 86400000).toISOString(), // 1 dia atrás
          user_id: "user-2",
          user_email: "contato@silvaadv.com.br"
        },
        {
          id: "3",
          name: "Curso de Inglês Rápido",
          description: "Página de vendas de curso online",
          nicho: "Educação",
          objetivo: "Vendas",
          estilo: "Moderno",
          subdomain: null,
          is_published: false,
          has_watermark: true,
          created_at: new Date(Date.now() - 172800000).toISOString(), // 2 dias atrás
          user_id: "user-3",
          user_email: "teacher@english.com"
        },
        {
          id: "4",
          name: "Tech Startup Landing",
          description: "SaaS produto inovador",
          nicho: "Tecnologia",
          objetivo: "Leads",
          estilo: "Futurista",
          subdomain: "tech-start",
          is_published: true,
          has_watermark: false,
          created_at: new Date(Date.now() - 259200000).toISOString(), // 3 dias atrás
          user_id: "user-4",
          user_email: "founder@startup.io"
        },
        {
          id: "5",
          name: "Portfólio Fotografia",
          description: "Galeria de fotos",
          nicho: "Fotografia",
          objetivo: "Portfólio",
          estilo: "Minimalista",
          subdomain: null,
          is_published: false,
          has_watermark: true,
          created_at: new Date(Date.now() - 604800000).toISOString(), // 7 dias atrás
          user_id: "user-5",
          user_email: "foto@studio.com"
        }
      ];

      setProjects(mockProjects);
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
      // SIMULAÇÃO: Deleção
      await new Promise(r => setTimeout(r, 500));
      
      setProjects(prev => prev.filter(p => p.id !== id));
      toast.success("Projeto excluído");
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Erro ao excluir projeto");
    }
  }

  async function togglePublish(id: string, currentStatus: boolean) {
    try {
      // SIMULAÇÃO: Update
      await new Promise(r => setTimeout(r, 500));

      setProjects(prev => prev.map(p => {
        if (p.id === id) {
            return {
                ...p,
                is_published: !currentStatus,
                // Se publicou, gera um subdomínio mock se não tiver
                subdomain: !currentStatus && !p.subdomain 
                    ? p.name.toLowerCase().replace(/\s+/g, '-') 
                    : p.subdomain
            };
        }
        return p;
      }));

      toast.success(currentStatus ? "Projeto despublicado" : "Projeto publicado");
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