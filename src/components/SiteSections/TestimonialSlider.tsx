import React from 'react';
import { Star } from 'lucide-react';

interface Testimonial {
  name: string;
  role: string;
  content: string;
  rating?: number;
}

interface TestimonialSliderProps {
  content: {
    title?: string;
    testimonials: Testimonial[];
    visual_variant?: string;
  };
  primaryColor: string;
  isMobile: boolean;
}

export const TestimonialSlider: React.FC<TestimonialSliderProps> = ({ content, primaryColor, isMobile }) => {
  const testimonials = Array.isArray(content?.testimonials) ? content.testimonials : [];
  if (testimonials.length === 0) return null;
  const variant = String(content.visual_variant || "").toLowerCase();
  const sectionBg =
    variant === "event"
      ? "bg-gradient-to-r from-indigo-950 to-fuchsia-900"
      : variant === "portfolio"
        ? "bg-slate-950"
        : variant === "premium"
          ? "bg-slate-900"
          : "bg-slate-900";

  return (
    <section className={`py-24 ${sectionBg} text-white overflow-hidden`}>
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className={`font-bold text-center mb-16 ${isMobile ? "text-3xl" : "text-3xl md:text-4xl"}`}>
          {content.title || "O que dizem nossos clientes"}
        </h2>
        <div className={`grid gap-6 ${isMobile ? "grid-cols-1" : "md:grid-cols-2 lg:grid-cols-2"}`}>
          {testimonials.map((t, i) => (
            <div key={i} className="p-8 rounded-2xl bg-slate-800 border border-slate-700 h-full flex flex-col">
              <div className="flex gap-1 mb-6 text-yellow-400">
                {Array.from({ length: Number(t?.rating) > 0 ? Number(t.rating) : 5 }).map((_, star) => (
                  <Star key={star} size={18} fill="currentColor" />
                ))}
              </div>
              <p className="text-lg text-slate-300 mb-8 italic flex-1">"{String(t?.content || "Excelente resultado com o projeto.")}"</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg" style={{ backgroundColor: primaryColor }}>
                  {String(t?.name || "C").charAt(0)}
                </div>
                <div>
                  <p className="font-bold">{String(t?.name || "Cliente")}</p>
                  <p className="text-sm text-slate-400">{String(t?.role || "Cliente")}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
