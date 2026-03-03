const DEFAULT_COLORS = {
  primary: "#2563eb",
  secondary: "#0f172a",
  accent: "#14b8a6",
};

const byTemplateId = {
  "vendas-agressivo": {
    colors: { primary: "#2EF0C2", secondary: "#1a1a2e", accent: "#ff6b6b" },
    sections: [
      { type: "navbar", links: [{ label: "Inicio", url: "#inicio" }, { label: "Oferta", url: "#oferta" }, { label: "FAQ", url: "#faq" }], cta_text: "Quero Agora" },
      { type: "hero", headline: "__headline__", subheadline: "__subheadline__", cta: "Quero transformar meu negocio", image_keyword: "__hero_image_keyword__" },
      { type: "social-proof", title: "Empresas que confiam", logos: ["Empresa 1", "Empresa 2", "Empresa 3", "Empresa 4", "Empresa 5"] },
      { type: "feature-grid", title: "Por que escolher esta solucao", features: [{ title: "__beneficio_1__", description: "__desc_1__", icon: "zap" }, { title: "__beneficio_2__", description: "__desc_2__", icon: "shield" }, { title: "__beneficio_3__", description: "__desc_3__", icon: "chart" }, { title: "__beneficio_4__", description: "__desc_4__", icon: "users" }] },
      { type: "testimonial-slider", title: "Resultados reais", testimonials: [{ name: "__cliente_1__", role: "__cargo_1__", content: "__depoimento_1__", rating: 5 }, { name: "__cliente_2__", role: "__cargo_2__", content: "__depoimento_2__", rating: 5 }, { name: "__cliente_3__", role: "__cargo_3__", content: "__depoimento_3__", rating: 5 }] },
      { type: "pricing-table", title: "Escolha seu plano", plans: [{ name: "Starter", price: "R$ 97", features: ["Implementacao rapida", "Suporte base"], recommended: false, cta: "Comecar" }, { name: "Pro", price: "R$ 297", features: ["Tudo do Starter", "Automacoes", "Suporte prioritario"], recommended: true, cta: "Quero o Pro" }, { name: "Enterprise", price: "R$ 497", features: ["Tudo do Pro", "Suporte personalizado", "Integracao"], recommended: false, cta: "Contato" }] },
      { type: "faq-section", title: "Perguntas frequentes", items: [{ question: "__faq_1_q__", answer: "__faq_1_a__" }, { question: "__faq_2_q__", answer: "__faq_2_a__" }, { question: "__faq_3_q__", answer: "__faq_3_a__" }, { question: "__faq_4_q__", answer: "__faq_4_a__" }] },
      { type: "cta-section", title: "__cta_title__", subtitle: "__cta_subtitle__", button_text: "__cta_button__" },
      { type: "footer-section", text: "__footer__", social_media: [{ platform: "instagram", url: "#" }, { platform: "linkedin", url: "#" }] },
    ],
  },
  "lead-capture": {
    colors: { primary: "#667eea", secondary: "#f8f9ff", accent: "#764ba2" },
    sections: [
      { type: "navbar", links: [{ label: "Beneficios", url: "#beneficios" }, { label: "Depoimentos", url: "#depoimentos" }, { label: "FAQ", url: "#faq" }], cta_text: "Baixar gratis" },
      { type: "hero", headline: "__headline__", subheadline: "__subheadline__", cta: "Quero receber gratis", image_keyword: "__hero_image_keyword__" },
      { type: "feature-grid", title: "O que voce vai receber", features: [{ title: "__benef_1__", description: "__desc_1__", icon: "message" }, { title: "__benef_2__", description: "__desc_2__", icon: "layout" }, { title: "__benef_3__", description: "__desc_3__", icon: "chart" }, { title: "__benef_4__", description: "__desc_4__", icon: "check" }] },
      { type: "testimonial-slider", title: "Quem ja baixou aprovou", testimonials: [{ name: "__cliente_1__", role: "__role_1__", content: "__dep_1__", rating: 5 }, { name: "__cliente_2__", role: "__role_2__", content: "__dep_2__", rating: 5 }, { name: "__cliente_3__", role: "__role_3__", content: "__dep_3__", rating: 5 }] },
      { type: "faq-section", title: "Duvidas sobre o material", items: [{ question: "__faq_1_q__", answer: "__faq_1_a__" }, { question: "__faq_2_q__", answer: "__faq_2_a__" }, { question: "__faq_3_q__", answer: "__faq_3_a__" }, { question: "__faq_4_q__", answer: "__faq_4_a__" }] },
      { type: "cta-section", title: "__cta_title__", subtitle: "__cta_subtitle__", button_text: "Receber agora" },
      { type: "footer-section", text: "__footer__", social_media: [{ platform: "instagram", url: "#" }] },
    ],
  },
  "portfolio-criativo": {
    colors: { primary: "#ffffff", secondary: "#0c0c0c", accent: "#2EF0C2" },
    sections: [
      { type: "navbar", links: [{ label: "Projetos", url: "#projetos" }, { label: "Sobre", url: "#sobre" }, { label: "Contato", url: "#contato" }], cta_text: "Fale comigo" },
      { type: "hero", headline: "__headline__", subheadline: "__subheadline__", cta: "Ver projetos", image_keyword: "__hero_image_keyword__" },
      { type: "project-gallery", title: "Projetos em destaque", projects: [{ title: "__proj_1__", description: "__proj_1_desc__", image_keyword: "__proj_img_1__", link: "#" }, { title: "__proj_2__", description: "__proj_2_desc__", image_keyword: "__proj_img_2__", link: "#" }, { title: "__proj_3__", description: "__proj_3_desc__", image_keyword: "__proj_img_3__", link: "#" }, { title: "__proj_4__", description: "__proj_4_desc__", image_keyword: "__proj_img_4__", link: "#" }] },
      { type: "feature-grid", title: "Servicos criativos", features: [{ title: "__srv_1__", description: "__srv_1_desc__", icon: "layout" }, { title: "__srv_2__", description: "__srv_2_desc__", icon: "briefcase" }, { title: "__srv_3__", description: "__srv_3_desc__", icon: "award" }, { title: "__srv_4__", description: "__srv_4_desc__", icon: "star" }] },
      { type: "testimonial-slider", title: "Feedback de clientes", testimonials: [{ name: "__cliente_1__", role: "__role_1__", content: "__dep_1__", rating: 5 }, { name: "__cliente_2__", role: "__role_2__", content: "__dep_2__", rating: 5 }, { name: "__cliente_3__", role: "__role_3__", content: "__dep_3__", rating: 5 }] },
      { type: "cta-section", title: "__cta_title__", subtitle: "__cta_subtitle__", button_text: "Solicitar proposta" },
      { type: "footer-section", text: "__footer__", social_media: [{ platform: "instagram", url: "#" }, { platform: "linkedin", url: "#" }, { platform: "github", url: "#" }] },
    ],
  },
  "biolink-influencer": {
    colors: { primary: "#f5576c", secondary: "#ffffff", accent: "#f093fb" },
    sections: [
      { type: "profile-header", name: "__name__", bio: "__bio__", image_keyword: "__profile_image_keyword__" },
      { type: "social-proof", title: "Comunidade", logos: ["Instagram", "YouTube", "TikTok", "Twitter", "Spotify"] },
      { type: "link-buttons", links: [{ label: "__link_1_label__", url: "__link_1_url__", icon: "instagram" }, { label: "__link_2_label__", url: "__link_2_url__", icon: "youtube" }, { label: "__link_3_label__", url: "__link_3_url__", icon: "twitter" }, { label: "__link_4_label__", url: "__link_4_url__", icon: "link" }, { label: "__link_5_label__", url: "__link_5_url__", icon: "mail" }] },
      { type: "cta-section", title: "__cta_title__", subtitle: "__cta_subtitle__", button_text: "Falar comigo" },
      { type: "footer-section", text: "__footer__", social_media: [{ platform: "instagram", url: "#" }, { platform: "twitter", url: "#" }, { platform: "youtube", url: "#" }] },
    ],
  },
  "servico-premium": {
    colors: { primary: "#c9a962", secondary: "#1a252f", accent: "#ffffff" },
    sections: [
      { type: "navbar", links: [{ label: "Metodo", url: "#metodo" }, { label: "Resultados", url: "#resultados" }, { label: "Investimento", url: "#investimento" }], cta_text: "Agendar diagnostico" },
      { type: "hero", headline: "__headline__", subheadline: "__subheadline__", cta: "__cta__", image_keyword: "__hero_image_keyword__" },
      { type: "feature-grid", title: "Metodologia premium", features: [{ title: "__etapa_1__", description: "__etapa_1_desc__", icon: "award" }, { title: "__etapa_2__", description: "__etapa_2_desc__", icon: "briefcase" }, { title: "__etapa_3__", description: "__etapa_3_desc__", icon: "chart" }, { title: "__etapa_4__", description: "__etapa_4_desc__", icon: "shield" }] },
      { type: "social-proof", title: "Marcas e clientes atendidos", logos: ["Empresa A", "Empresa B", "Empresa C", "Empresa D", "Empresa E"] },
      { type: "testimonial-slider", title: "Resultados de clientes", testimonials: [{ name: "__cliente_1__", role: "__role_1__", content: "__dep_1__", rating: 5 }, { name: "__cliente_2__", role: "__role_2__", content: "__dep_2__", rating: 5 }, { name: "__cliente_3__", role: "__role_3__", content: "__dep_3__", rating: 5 }] },
      { type: "pricing-table", title: "Pacotes de servico", plans: [{ name: "Starter", price: "R$ 497", features: ["Diagnostico", "Plano inicial", "Suporte"], recommended: false, cta: "Comecar" }, { name: "Premium", price: "R$ 1297", features: ["Tudo do Starter", "Mentoria avancada", "Implementacao"], recommended: true, cta: "Quero o Premium" }, { name: "Elite", price: "R$ 2497", features: ["Tudo do Premium", "Consultoria 1:1", "Acompanhamento"], recommended: false, cta: "Solicitar proposta" }] },
      { type: "faq-section", title: "Duvidas frequentes", items: [{ question: "__faq_1_q__", answer: "__faq_1_a__" }, { question: "__faq_2_q__", answer: "__faq_2_a__" }, { question: "__faq_3_q__", answer: "__faq_3_a__" }, { question: "__faq_4_q__", answer: "__faq_4_a__" }] },
      { type: "cta-section", title: "__cta_title__", subtitle: "__cta_subtitle__", button_text: "Agendar reuniao" },
      { type: "footer-section", text: "__footer__", social_media: [{ platform: "linkedin", url: "#" }, { platform: "instagram", url: "#" }] },
    ],
  },
  "produto-digital": {
    colors: { primary: "#11998e", secondary: "#ffffff", accent: "#38ef7d" },
    sections: [
      { type: "navbar", links: [{ label: "Produto", url: "#produto" }, { label: "Catalogo", url: "#catalogo" }, { label: "Checkout", url: "#checkout" }], cta_text: "Comprar" },
      { type: "hero", headline: "__headline__", subheadline: "__subheadline__", cta: "Comprar agora", image_keyword: "__hero_image_keyword__" },
      { type: "social-proof", title: "Marcas e clientes", logos: ["Cliente 1", "Cliente 2", "Cliente 3", "Cliente 4", "Cliente 5"] },
      { type: "product-catalog", title: "Catalogo de produtos", products: [{ name: "__produto_1__", price: "__preco_1__", description: "__desc_1__", image_keyword: "__img_1__" }, { name: "__produto_2__", price: "__preco_2__", description: "__desc_2__", image_keyword: "__img_2__" }, { name: "__produto_3__", price: "__preco_3__", description: "__desc_3__", image_keyword: "__img_3__" }, { name: "__produto_4__", price: "__preco_4__", description: "__desc_4__", image_keyword: "__img_4__" }] },
      { type: "feature-grid", title: "Diferenciais da marca", features: [{ title: "__dif_1__", description: "__dif_1_desc__", icon: "shield" }, { title: "__dif_2__", description: "__dif_2_desc__", icon: "zap" }, { title: "__dif_3__", description: "__dif_3_desc__", icon: "shoppingbag" }, { title: "__dif_4__", description: "__dif_4_desc__", icon: "star" }] },
      { type: "pricing-table", title: "Checkout e pagamento", plans: [{ name: "Compra unica", price: "__price_single__", features: ["Pagamento seguro", "Cartao e pix", "Acesso imediato"], recommended: true, cta: "Ir para checkout" }, { name: "Parcelado", price: "__price_installments__", features: ["Parcelamento facilitado", "Mesmos beneficios"], recommended: false, cta: "Quero parcelar" }, { name: "Anual", price: "__price_annual__", features: ["Acesso completo", "Bons extras"], recommended: false, cta: "Assinar anual" }] },
      { type: "testimonial-slider", title: "Quem ja comprou recomenda", testimonials: [{ name: "__cliente_1__", role: "__role_1__", content: "__dep_1__", rating: 5 }, { name: "__cliente_2__", role: "__role_2__", content: "__dep_2__", rating: 5 }, { name: "__cliente_3__", role: "__role_3__", content: "__dep_3__", rating: 5 }] },
      { type: "faq-section", title: "Duvidas sobre compra e entrega", items: [{ question: "__faq_1_q__", answer: "__faq_1_a__" }, { question: "__faq_2_q__", answer: "__faq_2_a__" }, { question: "__faq_3_q__", answer: "__faq_3_a__" }, { question: "__faq_4_q__", answer: "__faq_4_a__" }] },
      { type: "cta-section", title: "__cta_title__", subtitle: "__cta_subtitle__", button_text: "Finalizar pagamento" },
      { type: "footer-section", text: "__footer__", social_media: [{ platform: "instagram", url: "#" }, { platform: "youtube", url: "#" }] },
    ],
  },
  "evento-lancamento": {
    colors: { primary: "#8e2de2", secondary: "#0a0a0a", accent: "#00d9ff" },
    sections: [
      { type: "navbar", links: [{ label: "Evento", url: "#evento" }, { label: "Agenda", url: "#agenda" }, { label: "Inscricao", url: "#inscricao" }], cta_text: "Reservar vaga" },
      { type: "hero", headline: "__headline__", subheadline: "__subheadline__", cta: "Quero participar", image_keyword: "__hero_image_keyword__" },
      { type: "feature-grid", title: "O que voce vai aprender", features: [{ title: "__topico_1__", description: "__topico_1_desc__", icon: "zap" }, { title: "__topico_2__", description: "__topico_2_desc__", icon: "layout" }, { title: "__topico_3__", description: "__topico_3_desc__", icon: "chart" }, { title: "__topico_4__", description: "__topico_4_desc__", icon: "users" }, { title: "__topico_5__", description: "__topico_5_desc__", icon: "star" }] },
      { type: "social-proof", title: "Quem ja participou", logos: ["Participante A", "Participante B", "Participante C", "Participante D", "Participante E"] },
      { type: "testimonial-slider", title: "Depoimentos", testimonials: [{ name: "__cliente_1__", role: "__role_1__", content: "__dep_1__", rating: 5 }, { name: "__cliente_2__", role: "__role_2__", content: "__dep_2__", rating: 5 }, { name: "__cliente_3__", role: "__role_3__", content: "__dep_3__", rating: 5 }] },
      { type: "faq-section", title: "Perguntas frequentes", items: [{ question: "__faq_1_q__", answer: "__faq_1_a__" }, { question: "__faq_2_q__", answer: "__faq_2_a__" }, { question: "__faq_3_q__", answer: "__faq_3_a__" }, { question: "__faq_4_q__", answer: "__faq_4_a__" }] },
      { type: "cta-section", title: "__cta_title__", subtitle: "__cta_subtitle__", button_text: "Garantir minha vaga" },
      { type: "footer-section", text: "__footer__", social_media: [{ platform: "instagram", url: "#" }, { platform: "youtube", url: "#" }, { platform: "linkedin", url: "#" }] },
    ],
  },
  "empresa-institucional": {
    colors: { primary: "#3498db", secondary: "#ffffff", accent: "#2c3e50" },
    sections: [
      { type: "navbar", links: [{ label: "Sobre", url: "#sobre" }, { label: "Servicos", url: "#servicos" }, { label: "Contato", url: "#contato" }], cta_text: "Falar com especialista" },
      { type: "hero", headline: "__headline__", subheadline: "__subheadline__", cta: "Solicitar proposta", image_keyword: "__hero_image_keyword__" },
      { type: "feature-grid", title: "Nossos servicos", features: [{ title: "__srv_1__", description: "__srv_1_desc__", icon: "briefcase" }, { title: "__srv_2__", description: "__srv_2_desc__", icon: "award" }, { title: "__srv_3__", description: "__srv_3_desc__", icon: "users" }, { title: "__srv_4__", description: "__srv_4_desc__", icon: "chart" }] },
      { type: "social-proof", title: "Clientes atendidos", logos: ["Cliente A", "Cliente B", "Cliente C", "Cliente D", "Cliente E"] },
      { type: "testimonial-slider", title: "Resultados", testimonials: [{ name: "__cliente_1__", role: "__role_1__", content: "__dep_1__", rating: 5 }, { name: "__cliente_2__", role: "__role_2__", content: "__dep_2__", rating: 5 }, { name: "__cliente_3__", role: "__role_3__", content: "__dep_3__", rating: 5 }] },
      { type: "faq-section", title: "Duvidas frequentes", items: [{ question: "__faq_1_q__", answer: "__faq_1_a__" }, { question: "__faq_2_q__", answer: "__faq_2_a__" }, { question: "__faq_3_q__", answer: "__faq_3_a__" }, { question: "__faq_4_q__", answer: "__faq_4_a__" }] },
      { type: "cta-section", title: "__cta_title__", subtitle: "__cta_subtitle__", button_text: "Entrar em contato" },
      { type: "footer-section", text: "__footer__", social_media: [{ platform: "linkedin", url: "#" }, { platform: "instagram", url: "#" }] },
    ],
  },
};

const byCategory = {
  ecommerce: byTemplateId["produto-digital"],
  landing: byTemplateId["vendas-agressivo"],
  portfolio: byTemplateId["portfolio-criativo"],
  biolink: byTemplateId["biolink-influencer"],
  service: byTemplateId["servico-premium"],
};

function getTemplateBlueprint(templateId, category) {
  if (templateId && byTemplateId[templateId]) return byTemplateId[templateId];
  if (category && byCategory[category]) return byCategory[category];
  return { colors: DEFAULT_COLORS, sections: byTemplateId["vendas-agressivo"].sections };
}

module.exports = { getTemplateBlueprint };
