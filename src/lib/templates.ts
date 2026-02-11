// Importar imagens de preview dos templates
import vendasAgressivoImg from "@/assets/templates/vendas-agressivo.png";
import leadCaptureImg from "@/assets/templates/lead-capture.png";
import portfolioCriativoImg from "@/assets/templates/portfolio-criativo.png";
import biolinkInfluencerImg from "@/assets/templates/biolink-influencer.png";
import servicoPremiumImg from "@/assets/templates/servico-premium.png";
import produtoDigitalImg from "@/assets/templates/produto-digital.png";
import eventoLancamentoImg from "@/assets/templates/evento-lancamento.png";
import empresaInstitucionalImg from "@/assets/templates/empresa-institucional.png";

export interface Template {
  id: string;
  name: string;
  description: string;
  category: "landing" | "portfolio" | "ecommerce" | "biolink" | "service";
  style: "agressivo" | "profissional" | "clean" | "premium";
  preview: string;
  previewImage: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  features: string[];
  prompt: string;
}

export const TEMPLATES: Template[] = [
  {
    id: "vendas-agressivo",
    name: "Vendas Diretas",
    description: "Landing page focada em conversão com CTAs fortes e urgência",
    category: "landing",
    style: "agressivo",
    preview: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    previewImage: vendasAgressivoImg,
    colors: {
      primary: "#2EF0C2",
      secondary: "#1a1a2e",
      accent: "#ff6b6b",
    },
    features: ["Countdown timer", "Prova social", "Garantia", "Depoimentos"],
    prompt: `Crie uma landing page de vendas AGRESSIVA com:
- Hero com headline impactante e countdown de oferta limitada
- Seção de problema/dor do cliente
- Apresentação da solução
- 4 benefícios principais com ícones
- 3 depoimentos de clientes satisfeitos
- Preço com desconto riscado e novo preço
- Garantia de 7 dias
- CTA grande e pulsante
- FAQ com 4 perguntas
- Footer com aviso de vagas limitadas`,
  },
  {
    id: "lead-capture",
    name: "Captura de Leads",
    description: "Otimizada para coletar emails com isca digital",
    category: "landing",
    style: "profissional",
    preview: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    previewImage: leadCaptureImg,
    colors: {
      primary: "#667eea",
      secondary: "#f8f9ff",
      accent: "#764ba2",
    },
    features: ["Formulário destacado", "Isca digital", "Benefícios", "Confiança"],
    prompt: `Crie uma landing page de CAPTURA DE LEADS com:
- Hero limpo com headline sobre o benefício principal
- Formulário de email em destaque (nome e email)
- Descrição da isca digital (ebook/curso/template)
- 3 benefícios do que a pessoa vai receber
- Selos de segurança e privacidade
- Depoimento de quem já baixou
- CTA "Quero Receber Grátis"
- Footer minimalista`,
  },
  {
    id: "portfolio-criativo",
    name: "Portfólio Criativo",
    description: "Showcase elegante para profissionais e freelancers",
    category: "portfolio",
    style: "clean",
    preview: "linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 100%)",
    previewImage: portfolioCriativoImg,
    colors: {
      primary: "#ffffff",
      secondary: "#0c0c0c",
      accent: "#2EF0C2",
    },
    features: ["Galeria de projetos", "Sobre mim", "Serviços", "Contato"],
    prompt: `Crie um portfólio CRIATIVO e MINIMALISTA com:
- Hero com nome grande e título profissional
- Seção "Sobre" com foto placeholder e bio
- Grid de 6 projetos com hover effect
- Seção de serviços oferecidos (3 cards)
- Depoimentos de clientes (2)
- Formulário de contato simples
- Links de redes sociais
- Design dark mode elegante`,
  },
  {
    id: "biolink-influencer",
    name: "Bio Link",
    description: "Centralize todos os seus links em uma página",
    category: "biolink",
    style: "clean",
    preview: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    previewImage: biolinkInfluencerImg,
    colors: {
      primary: "#f5576c",
      secondary: "#ffffff",
      accent: "#f093fb",
    },
    features: ["Links organizados", "Redes sociais", "Foto de perfil", "Bio"],
    prompt: `Crie uma página BIO LINK moderna com:
- Foto de perfil circular no topo
- Nome e bio curta
- 6 botões de links estilizados (empilhados)
- Ícones de redes sociais (Instagram, YouTube, TikTok, Twitter)
- Animações suaves nos botões
- Background com gradiente suave
- Design mobile-first
- Espaçamento generoso`,
  },
  {
    id: "servico-premium",
    name: "Serviço Premium",
    description: "Para consultores, coaches e prestadores de serviço",
    category: "service",
    style: "premium",
    preview: "linear-gradient(135deg, #2c3e50 0%, #1a252f 100%)",
    previewImage: servicoPremiumImg,
    colors: {
      primary: "#c9a962",
      secondary: "#1a252f",
      accent: "#ffffff",
    },
    features: ["Autoridade", "Metodologia", "Resultados", "Agenda"],
    prompt: `Crie uma landing page de SERVIÇO PREMIUM com:
- Hero sofisticado com headline de autoridade
- Seção "Quem sou eu" com credenciais
- Metodologia ou processo em 4 etapas
- Resultados alcançados com números
- 3 pacotes de serviço com preços
- Depoimentos em vídeo (placeholders)
- FAQ elegante
- CTA para agendar reunião
- Design luxuoso com dourado`,
  },
  {
    id: "produto-digital",
    name: "Produto Digital",
    description: "Para cursos, ebooks e infoprodutos",
    category: "ecommerce",
    style: "profissional",
    preview: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
    previewImage: produtoDigitalImg,
    colors: {
      primary: "#11998e",
      secondary: "#ffffff",
      accent: "#38ef7d",
    },
    features: ["Módulos do curso", "Bônus", "Garantia", "Checkout"],
    prompt: `Crie uma landing page de PRODUTO DIGITAL com:
- Hero com mockup do produto e headline de transformação
- Vídeo de vendas placeholder
- Para quem é / Para quem não é
- Conteúdo do produto (módulos ou capítulos)
- 3 bônus exclusivos
- Preço com parcelamento
- Garantia de satisfação
- FAQ completo
- Botão de compra fixo no mobile`,
  },
  {
    id: "evento-lancamento",
    name: "Evento/Lançamento",
    description: "Para webinars, lives e lançamentos",
    category: "landing",
    style: "agressivo",
    preview: "linear-gradient(135deg, #8e2de2 0%, #4a00e0 100%)",
    previewImage: eventoLancamentoImg,
    colors: {
      primary: "#8e2de2",
      secondary: "#0a0a0a",
      accent: "#00d9ff",
    },
    features: ["Countdown", "Inscrição", "Palestrante", "Agenda"],
    prompt: `Crie uma landing page de EVENTO/LANÇAMENTO com:
- Hero impactante com data e hora do evento
- Countdown grande e animado
- Sobre o que será o evento
- Foto e bio do palestrante
- O que você vai aprender (5 tópicos)
- Formulário de inscrição (nome, email, whatsapp)
- Bônus para quem se inscrever
- Urgência de vagas limitadas
- Design vibrante e energético`,
  },
  {
    id: "empresa-institucional",
    name: "Institucional",
    description: "Site corporativo profissional",
    category: "service",
    style: "profissional",
    preview: "linear-gradient(135deg, #2c3e50 0%, #3498db 100%)",
    previewImage: empresaInstitucionalImg,
    colors: {
      primary: "#3498db",
      secondary: "#ffffff",
      accent: "#2c3e50",
    },
    features: ["Sobre a empresa", "Serviços", "Equipe", "Contato"],
    prompt: `Crie um site INSTITUCIONAL profissional com:
- Hero com slogan e imagem corporativa
- Seção "Sobre nós" com missão e valores
- 4 serviços principais em cards
- Números/estatísticas da empresa
- Equipe (3 pessoas com foto placeholder)
- Clientes atendidos (logos placeholder)
- Formulário de contato completo
- Mapa e endereço
- Footer com todas as informações`,
  },
];

export const TEMPLATE_CATEGORIES = [
  { id: "all", label: "Todos", icon: "Grid" },
  { id: "landing", label: "Landing Page", icon: "Rocket" },
  { id: "portfolio", label: "Portfólio", icon: "Briefcase" },
  { id: "biolink", label: "Bio Link", icon: "Link" },
  { id: "service", label: "Serviços", icon: "Award" },
  { id: "ecommerce", label: "Produtos", icon: "ShoppingBag" },
];

export function getTemplateById(id: string): Template | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

export function getTemplatesByCategory(category: string): Template[] {
  if (category === "all") return TEMPLATES;
  return TEMPLATES.filter((t) => t.category === category);
}
