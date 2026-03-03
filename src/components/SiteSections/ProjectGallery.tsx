import React from 'react';
import { motion } from 'framer-motion';

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

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className={`font-bold text-center mb-16 text-slate-900 ${isMobile ? "text-3xl" : "text-4xl"}`}>
          {content.title || "Projetos em Destaque"}
        </h2>
        <div className={`grid gap-8 ${isMobile ? "grid-cols-1" : "md:grid-cols-2"}`}>
          {projects.map((proj, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -10 }}
              className="group relative rounded-3xl overflow-hidden aspect-video bg-slate-900 cursor-pointer shadow-lg"
            >
              <img 
                src={`https://source.unsplash.com/800x450/?${encodeURIComponent(proj.image_keyword || 'creative')}`} 
                className="w-full h-full object-cover opacity-70 group-hover:opacity-40 transition-all duration-500"
                alt={proj.title}
              />
              <div className="absolute inset-0 p-8 flex flex-col justify-end text-white translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                <h3 className="text-2xl font-bold mb-2">{proj.title}</h3>
                <p className="text-white/80 line-clamp-2 text-sm">{proj.description}</p>
                <div className="mt-4 flex items-center gap-2 text-sm font-bold" style={{ color: primaryColor }}>
                  Ver projeto <span>→</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
