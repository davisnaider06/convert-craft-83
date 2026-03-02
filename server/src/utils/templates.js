const DEFAULT_COLORS = {
  primary: "#2563eb",
  secondary: "#0f172a",
  accent: "#14b8a6",
};

const byTemplateId = {
  "vendas-agressivo": {
    colors: { primary: "#2EF0C2", secondary: "#1a1a2e", accent: "#ff6b6b" },
    sections: [
      { type: "navbar", links: [{ label: "Inicio", url: "#inicio" }, { label: "Oferta", url: "#oferta" }, { label: "FAQ", url: "#faq" }], cta: "Quero Agora" },
      { type: "hero", headline: "__headline__", subheadline: "__subheadline__", cta: "Quero transformar meu negocio", image_keyword: "__hero_image_keyword__" },
      { type: "feature-grid", title: "Por que escolher esta solucao", features: [{ title: "__beneficio_1__", description: "__desc_1__", icon: "zap" }, { title: "__beneficio_2__", description: "__desc_2__", icon: "shield" }, { title: "__beneficio_3__", description: "__desc_3__", icon: "chart" }, { title: "__beneficio_4__", description: "__desc_4__", icon: "users" }] },
      { type: "testimonial-slider", title: "Resultados reais", testimonials: [{ name: "__cliente_1__", role: "__cargo_1__", content: "__depoimento_1__", rating: 5 }, { name: "__cliente_2__", role: "__cargo_2__", content: "__depoimento_2__", rating: 5 }, { name: "__cliente_3__", role: "__cargo_3__", content: "__depoimento_3__", rating: 5 }] },
      { type: "pricing-table", title: "Escolha seu plano", plans: [{ name: "Starter", price: "R$ 97", features: ["Implementacao rapida", "Suporte base"], recommended: false, cta: "Comecar" }, { name: "Pro", price: "R$ 297", features: ["Tudo do Starter", "Automacoes", "Suporte prioritario"], recommended: true, cta: "Quero o Pro" }] },
      { type: "faq-section", title: "Perguntas frequentes", items: [{ question: "__faq_1_q__", answer: "__faq_1_a__" }, { question: "__faq_2_q__", answer: "__faq_2_a__" }, { question: "__faq_3_q__", answer: "__faq_3_a__" }, { question: "__faq_4_q__", answer: "__faq_4_a__" }] },
      { type: "cta-section", title: "__cta_title__", subtitle: "__cta_subtitle__", button_text: "__cta_button__" },
      { type: "footer-section", brand: "__brand__", description: "__footer_desc__", social_media: [{ platform: "instagram", url: "__instagram_url__" }, { platform: "linkedin", url: "__linkedin_url__" }] },
    ],
  },
  "produto-digital": {
    colors: { primary: "#11998e", secondary: "#ffffff", accent: "#38ef7d" },
    sections: [
      { type: "navbar", links: [{ label: "Produto", url: "#produto" }, { label: "Catalogo", url: "#catalogo" }, { label: "Checkout", url: "#checkout" }], cta: "Comprar" },
      { type: "hero", headline: "__headline__", subheadline: "__subheadline__", cta: "Comprar agora", image_keyword: "__hero_image_keyword__" },
      { type: "social-proof", title: "Marcas e clientes", logos: ["Cliente 1", "Cliente 2", "Cliente 3", "Cliente 4"] },
      { type: "product-catalog", title: "Catalogo de produtos", subtitle: "__catalog_subtitle__", products: [{ name: "__produto_1__", price: "__preco_1__", description: "__desc_1__", image_keyword: "__img_1__" }, { name: "__produto_2__", price: "__preco_2__", description: "__desc_2__", image_keyword: "__img_2__" }, { name: "__produto_3__", price: "__preco_3__", description: "__desc_3__", image_keyword: "__img_3__" }, { name: "__produto_4__", price: "__preco_4__", description: "__desc_4__", image_keyword: "__img_4__" }] },
      { type: "feature-grid", title: "Diferenciais da marca", features: [{ title: "__dif_1__", description: "__dif_1_desc__", icon: "shield" }, { title: "__dif_2__", description: "__dif_2_desc__", icon: "zap" }, { title: "__dif_3__", description: "__dif_3_desc__", icon: "shoppingbag" }] },
      { type: "pricing-table", title: "Checkout e pagamento", plans: [{ name: "Compra unica", price: "__price_single__", features: ["Pagamento seguro", "Cartao e pix", "Acesso imediato"], recommended: true, cta: "Ir para checkout" }, { name: "Parcelado", price: "__price_installments__", features: ["Parcelamento facilitado", "Mesmos beneficios"], recommended: false, cta: "Quero parcelar" }] },
      { type: "testimonial-slider", title: "Quem ja comprou recomenda", testimonials: [{ name: "__cliente_1__", role: "__role_1__", content: "__dep_1__", rating: 5 }, { name: "__cliente_2__", role: "__role_2__", content: "__dep_2__", rating: 5 }] },
      { type: "faq-section", title: "Duvidas sobre compra e entrega", items: [{ question: "__faq_1_q__", answer: "__faq_1_a__" }, { question: "__faq_2_q__", answer: "__faq_2_a__" }, { question: "__faq_3_q__", answer: "__faq_3_a__" }] },
      { type: "cta-section", title: "__cta_title__", subtitle: "__cta_subtitle__", button_text: "Finalizar pagamento" },
      { type: "footer-section", brand: "__brand__", description: "__footer_desc__", social_media: [{ platform: "instagram", url: "__instagram_url__" }, { platform: "youtube", url: "__youtube_url__" }] },
    ],
  },
};

const byCategory = {
  ecommerce: byTemplateId["produto-digital"],
  landing: byTemplateId["vendas-agressivo"],
  portfolio: {
    colors: { primary: "#ffffff", secondary: "#0c0c0c", accent: "#2EF0C2" },
    sections: [
      { type: "navbar", links: [{ label: "Projetos", url: "#projetos" }, { label: "Sobre", url: "#sobre" }, { label: "Contato", url: "#contato" }], cta: "Fale comigo" },
      { type: "hero", headline: "__headline__", subheadline: "__subheadline__", cta: "Ver projetos", image_keyword: "__hero_image_keyword__" },
      { type: "project-gallery", title: "Projetos em destaque", projects: [{ title: "__proj_1__", description: "__proj_1_desc__", image_keyword: "__proj_img_1__", link: "__proj_link_1__" }, { title: "__proj_2__", description: "__proj_2_desc__", image_keyword: "__proj_img_2__", link: "__proj_link_2__" }, { title: "__proj_3__", description: "__proj_3_desc__", image_keyword: "__proj_img_3__", link: "__proj_link_3__" }] },
      { type: "testimonial-slider", title: "Feedback de clientes", testimonials: [{ name: "__cliente_1__", role: "__role_1__", content: "__dep_1__", rating: 5 }, { name: "__cliente_2__", role: "__role_2__", content: "__dep_2__", rating: 5 }] },
      { type: "cta-section", title: "__cta_title__", subtitle: "__cta_subtitle__", button_text: "__cta_button__" },
      { type: "footer-section", brand: "__brand__", description: "__footer_desc__", social_media: [{ platform: "instagram", url: "__instagram_url__" }, { platform: "linkedin", url: "__linkedin_url__" }] },
    ],
  },
  biolink: {
    colors: { primary: "#f5576c", secondary: "#ffffff", accent: "#f093fb" },
    sections: [
      { type: "profile-header", name: "__name__", bio: "__bio__", image_keyword: "__profile_image_keyword__" },
      { type: "link-buttons", links: [{ label: "__link_1_label__", url: "__link_1_url__", icon: "instagram" }, { label: "__link_2_label__", url: "__link_2_url__", icon: "youtube" }, { label: "__link_3_label__", url: "__link_3_url__", icon: "twitter" }, { label: "__link_4_label__", url: "__link_4_url__", icon: "link" }] },
      { type: "social-proof", title: "Comunidade", logos: ["Instagram", "YouTube", "TikTok"] },
      { type: "footer-section", brand: "__brand__", description: "__footer_desc__", social_media: [{ platform: "instagram", url: "__instagram_url__" }, { platform: "twitter", url: "__twitter_url__" }] },
    ],
  },
  service: {
    colors: { primary: "#3498db", secondary: "#ffffff", accent: "#2c3e50" },
    sections: [
      { type: "navbar", links: [{ label: "Servicos", url: "#servicos" }, { label: "Sobre", url: "#sobre" }, { label: "Contato", url: "#contato" }], cta: "Agendar diagnostico" },
      { type: "hero", headline: "__headline__", subheadline: "__subheadline__", cta: "__cta__", image_keyword: "__hero_image_keyword__" },
      { type: "feature-grid", title: "Servicos principais", features: [{ title: "__srv_1__", description: "__srv_1_desc__", icon: "briefcase" }, { title: "__srv_2__", description: "__srv_2_desc__", icon: "award" }, { title: "__srv_3__", description: "__srv_3_desc__", icon: "users" }] },
      { type: "social-proof", title: "Empresas atendidas", logos: ["Cliente A", "Cliente B", "Cliente C"] },
      { type: "testimonial-slider", title: "Resultados", testimonials: [{ name: "__cliente_1__", role: "__role_1__", content: "__dep_1__", rating: 5 }, { name: "__cliente_2__", role: "__role_2__", content: "__dep_2__", rating: 5 }] },
      { type: "faq-section", title: "Duvidas frequentes", items: [{ question: "__faq_1_q__", answer: "__faq_1_a__" }, { question: "__faq_2_q__", answer: "__faq_2_a__" }] },
      { type: "cta-section", title: "__cta_title__", subtitle: "__cta_subtitle__", button_text: "__cta_button__" },
      { type: "footer-section", brand: "__brand__", description: "__footer_desc__", social_media: [{ platform: "linkedin", url: "__linkedin_url__" }, { platform: "instagram", url: "__instagram_url__" }] },
    ],
  },
};

function getTemplateBlueprint(templateId, category) {
  if (templateId && byTemplateId[templateId]) return byTemplateId[templateId];
  if (category && byCategory[category]) return byCategory[category];
  return { colors: DEFAULT_COLORS, sections: byTemplateId["vendas-agressivo"].sections };
}

module.exports = { getTemplateBlueprint };
