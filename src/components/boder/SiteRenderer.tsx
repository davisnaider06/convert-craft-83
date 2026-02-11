import { 
  Check, Star, ArrowRight, Zap, Shield, 
  Globe, BarChart, Users, Layout, MessageCircle
} from "lucide-react";
import { motion } from "framer-motion";

const iconMap: Record<string, any> = {
  zap: Zap,
  shield: Shield,
  globe: Globe,
  chart: BarChart,
  users: Users,
  layout: Layout,
  check: Check,
  star: Star,
  message: MessageCircle
};

// Adicionamos a prop viewMode aqui
export function SiteRenderer({ data, viewMode = "desktop" }: { data: any, viewMode?: "desktop" | "mobile" }) {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>Conteúdo do site não encontrado ou em formato inválido.</p>
      </div>
    );
  }

  const primaryColor = data.colors?.primary || '#3b82f6';

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName?.toLowerCase()] || Star;
    return <IconComponent className="h-6 w-6" />;
  };

  // Váriavel mágica que desliga o Desktop se o botão Mobile for clicado
  const isMobile = viewMode === "mobile";

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans w-full overflow-x-hidden">
      
      {/* 1. HEADER */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-100">
        <div className="font-bold text-xl flex items-center gap-2" style={{ color: primaryColor }}>
          <Zap className="h-6 w-6" />
          <span>{data.hero?.headline?.split(" ")[0] || "Logo"}</span>
        </div>
        <button 
          className="px-6 py-2 rounded-full text-white font-medium transition-transform hover:scale-105"
          style={{ backgroundColor: primaryColor }}
        >
          Começar
        </button>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-24 pb-32 px-4 overflow-hidden">
        <div className="container mx-auto text-center relative z-10 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className={`font-extrabold tracking-tight text-slate-900 mb-8 leading-[1.1] ${isMobile ? "text-5xl" : "text-5xl md:text-7xl"}`}>
              {data.hero?.headline || "Título Principal"}
            </h1>
            <p className={`text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed ${isMobile ? "text-lg" : "text-xl md:text-2xl"}`}>
              {data.hero?.subheadline || "Subtítulo explicativo focando na dor do cliente."}
            </p>
            <div className={`flex justify-center items-center gap-4 ${isMobile ? "flex-col" : "flex-col sm:flex-row"}`}>
              <button 
                className="h-14 px-8 text-lg rounded-full text-white font-bold flex items-center justify-center gap-2 transition-all hover:shadow-xl hover:-translate-y-1 w-full sm:w-auto"
                style={{ backgroundColor: primaryColor, boxShadow: `0 10px 25px -5px ${primaryColor}40` }}
              >
                {data.hero?.cta || "Quero Começar Agora"} <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        </div>

        {data.hero?.image_keyword && (
          <motion.div 
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="container mx-auto mt-16 px-4 max-w-5xl"
          >
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-slate-50 relative aspect-video md:aspect-[21/9]">
              <img 
                src={`https://source.unsplash.com/1600x900/?${encodeURIComponent(data.hero.image_keyword)}`} 
                alt="Demonstração" className="w-full h-full object-cover" loading="lazy"
              />
            </div>
          </motion.div>
        )}
      </section>

      {/* 3. SOCIAL PROOF */}
      {data.social_proof?.logos && data.social_proof.logos.length > 0 && (
        <section className="py-10 border-y border-slate-100 bg-slate-50">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm font-semibold text-slate-400 mb-6 uppercase tracking-wider">
              {data.social_proof.title || "Empresas que confiam"}
            </p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 items-center">
              {data.social_proof.logos.map((logo: string, i: number) => (
                <span key={i} className="text-xl font-bold text-slate-300 flex items-center gap-2 grayscale opacity-70">
                  <Globe className="h-6 w-6" /> {logo}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. FEATURES */}
      {data.features && data.features.length > 0 && (
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className={`font-bold text-slate-900 ${isMobile ? "text-3xl" : "text-3xl md:text-4xl"}`}>
                Por que escolher nossa solução?
              </h2>
            </div>
            {/* Controle da grade responsiva forçado */}
            <div className={`grid gap-8 ${isMobile ? "grid-cols-1" : "md:grid-cols-3"}`}>
              {data.features.map((feature: any, i: number) => (
                <div key={i} className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-shadow">
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                    style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                  >
                    {getIcon(feature.icon)}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. TESTIMONIALS */}
      {data.testimonials && data.testimonials.length > 0 && (
        <section className="py-24 bg-slate-900 text-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className={`font-bold text-center mb-16 ${isMobile ? "text-3xl" : "text-3xl md:text-4xl"}`}>
              O que nossos clientes dizem
            </h2>
            <div className={`grid gap-6 justify-center ${isMobile ? "grid-cols-1" : "md:grid-cols-2"}`}>
              {data.testimonials.map((t: any, i: number) => (
                <div key={i} className="p-8 rounded-2xl bg-slate-800 border border-slate-700 w-full mx-auto">
                  <div className="flex gap-1 mb-6 text-yellow-400">
                    {[1,2,3,4,5].map(star => <Star key={star} size={18} fill="currentColor" />)}
                  </div>
                  <p className="text-lg text-slate-300 mb-8 italic">"{t.content}"</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg" style={{ backgroundColor: primaryColor, color: '#fff' }}>
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-white">{t.name}</p>
                      <p className="text-sm text-slate-400">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. PRICING */}
      {data.pricing && data.pricing.length > 0 && (
        <section className="py-24 bg-slate-50">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-16">
              <h2 className={`font-bold text-slate-900 ${isMobile ? "text-3xl" : "text-3xl md:text-4xl"}`}>
                Planos Transparentes
              </h2>
            </div>
            <div className={`grid gap-8 max-w-4xl mx-auto items-center ${isMobile ? "grid-cols-1" : "md:grid-cols-2"}`}>
              {data.pricing.map((plan: any, i: number) => (
                <div 
                  key={i} 
                  className={`relative p-8 md:p-10 rounded-3xl bg-white flex flex-col h-full ${
                    plan.recommended && !isMobile
                      ? 'border-2 shadow-2xl scale-105 z-10' 
                      : plan.recommended && isMobile
                      ? 'border-2 shadow-xl'
                      : 'border border-slate-200 shadow-md'
                  }`}
                  style={{ borderColor: plan.recommended ? primaryColor : undefined }}
                >
                  {plan.recommended && (
                    <span 
                      className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-sm font-bold text-white uppercase tracking-wider"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Mais Escolhido
                    </span>
                  )}
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                  <div className="text-5xl font-extrabold text-slate-900 mb-8">
                    {plan.price}<span className="text-lg text-slate-500 font-medium">/mês</span>
                  </div>
                  <ul className="space-y-4 mb-8 flex-1">
                    {plan.features.map((feat: string, j: number) => (
                      <li key={j} className="flex items-start gap-3">
                        <div className="mt-1 rounded-full p-0.5" style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}>
                          <Check className="h-4 w-4" />
                        </div>
                        <span className="text-slate-600">{feat}</span>
                      </li>
                    ))}
                  </ul>
                  <button 
                    className={`w-full py-4 rounded-xl font-bold transition-all ${
                      plan.recommended 
                        ? 'text-white hover:opacity-90' 
                        : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                    }`}
                    style={{ backgroundColor: plan.recommended ? primaryColor : undefined }}
                  >
                    Escolher {plan.name}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. FAQ */}
      {data.faq && data.faq.length > 0 && (
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Perguntas Frequentes</h2>
            <div className="space-y-6">
              {data.faq.map((item: any, i: number) => (
                <div key={i} className="p-6 rounded-2xl border border-slate-100 bg-slate-50">
                  <h4 className="text-lg font-bold text-slate-900 mb-2">{item.question}</h4>
                  <p className="text-slate-600">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 8. CTA FINAL */}
      {data.cta_section && (
        <section className="py-24 text-center px-4" style={{ backgroundColor: primaryColor }}>
          <div className="container mx-auto max-w-3xl">
            <h2 className={`font-bold text-white mb-6 ${isMobile ? "text-3xl" : "text-4xl md:text-5xl"}`}>
              {data.cta_section.title}
            </h2>
            <p className="text-xl text-white/90 mb-10">{data.cta_section.subtitle}</p>
            <button className="bg-white text-slate-900 h-16 px-10 text-xl rounded-full font-bold shadow-2xl hover:scale-105 transition-transform w-full sm:w-auto">
              {data.cta_section.button_text || "Começar Agora"}
            </button>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="py-8 bg-slate-950 text-slate-500 text-center">
        <p>© {new Date().getFullYear()} {data.hero?.headline?.split(" ")[0] || "Empresa"}. Todos os direitos reservados.</p>
      </footer>
      
    </div>
  );
}