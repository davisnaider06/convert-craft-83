import React from "react";
import { motion } from "framer-motion";

interface Project {
  title: string;
  description: string;
  image_keyword?: string;
  link?: string;
}

interface ProjectGalleryProps {
  content: {
    title?: string;
    projects: Project[];
    visual_variant?: string;
  };
  primaryColor: string;
  isMobile: boolean;
}

export const ProjectGallery: React.FC<ProjectGalleryProps> = ({ content, primaryColor, isMobile }) => {
  const asText = (value: any, fallback: string) => {
    if (typeof value === "string") return value;
    if (value && typeof value === "object") return value.name || value.title || value.label || value.text || fallback;
    return fallback;
  };

  const projects = (Array.isArray(content.projects) ? content.projects : []).map((proj: any, i: number) => ({
    title: asText(proj?.title, `Projeto ${i + 1}`),
    description: asText(proj?.description, "Projeto com foco em resultado."),
    image_keyword: asText(proj?.image_keyword, "creative"),
    link: asText(proj?.link, "#"),
  }));
  if (projects.length === 0) return null;

  const systemLike =
    String(content.title || "").toLowerCase().includes("paginas") ||
    String(content.title || "").toLowerCase().includes("fluxos");

  return (
    <section className={`py-24 ${systemLike ? "bg-slate-50" : "bg-white"}`}>
      <div className="container mx-auto max-w-6xl px-4">
        <h2 className={`mb-16 text-center font-bold text-slate-900 ${isMobile ? "text-3xl" : "text-4xl"}`}>
          {content.title || "Projetos em Destaque"}
        </h2>
        <div className={`grid gap-8 ${isMobile ? "grid-cols-1" : "md:grid-cols-2"}`}>
          {projects.map((proj, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -10 }}
              className="group relative aspect-video cursor-pointer overflow-hidden rounded-3xl bg-slate-900 shadow-lg"
            >
              {(() => {
                const seed = encodeURIComponent(proj.image_keyword || proj.title || `project-${i + 1}`);
                const url = `https://picsum.photos/seed/${seed}/800/450`;
                return (
                  <img
                    src={url}
                    className="h-full w-full object-cover opacity-70 transition-all duration-500 group-hover:opacity-40"
                    alt={proj.title}
                    onError={(e) => {
                      e.currentTarget.src = "https://picsum.photos/800/450";
                    }}
                  />
                );
              })()}
              <div className="absolute inset-0 flex translate-y-4 flex-col justify-end p-8 text-white transition-all duration-300 group-hover:translate-y-0">
                <h3 className="mb-2 text-2xl font-bold">{proj.title}</h3>
                <p className="line-clamp-2 text-sm text-white/80">{proj.description}</p>
                <div className="mt-4 flex items-center gap-2 text-sm font-bold" style={{ color: primaryColor }}>
                  {systemLike ? "Ver modulo" : "Ver projeto"} <span>→</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
