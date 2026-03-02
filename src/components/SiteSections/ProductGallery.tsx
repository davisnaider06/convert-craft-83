import React from 'react';

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
  if (!content.projects || content.projects.length === 0) return null;

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className="text-3xl font-bold mb-12 text-center">{content.title || "Meus Projetos"}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {content.projects.map((proj: Project, i: number) => (
            <div key={i} className="group relative rounded-3xl overflow-hidden aspect-video bg-slate-900">
              <img 
                src={`https://source.unsplash.com/800x450/?${encodeURIComponent(proj.image_keyword || 'design')}`} 
                className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
              />
              <div className="absolute inset-0 p-8 flex flex-col justify-end text-white translate-y-4 group-hover:translate-y-0 transition-transform">
                <h3 className="text-2xl font-bold mb-2">{proj.title}</h3>
                <p className="text-white/80 line-clamp-2">{proj.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};