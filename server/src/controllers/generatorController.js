const { PrismaClient } = require("@prisma/client");
const aiService = require("../services/aiService");
const userService = require("../services/userService");

const prisma = new PrismaClient();

function isValidSiteSchema(payload) {
  return payload && typeof payload === "object" && Array.isArray(payload.sections) && payload.sections.length > 0;
}

function getAuthenticatedUserId(req) {
  return req?.auth?.userId || null;
}

function normalizeSubdomain(value) {
  return String(value || "").toLowerCase().trim();
}

function isValidSubdomain(value) {
  return /^[a-z0-9](?:[a-z0-9-]{1,61}[a-z0-9])?$/.test(value);
}

function toLegacyContent(sectionBasedContent) {
  if (!sectionBasedContent || !Array.isArray(sectionBasedContent.sections)) return {};

  const get = (type) => sectionBasedContent.sections.find((s) => s?.type === type) || null;
  const hero = get("hero");
  const featureGrid = get("feature-grid");
  const socialProof = get("social-proof");
  const testimonials = get("testimonial-slider");
  const pricing = get("pricing-table");
  const faq = get("faq-section");
  const cta = get("cta-section");

  return {
    colors: sectionBasedContent.colors || {},
    hero: hero
      ? {
          headline: hero.headline || "",
          subheadline: hero.subheadline || "",
          cta: hero.cta || cta?.button_text || "Comecar",
          image_keyword: hero.image_keyword || "",
        }
      : undefined,
    features: featureGrid?.features || [],
    social_proof: socialProof ? { title: socialProof.title || "Empresas que confiam", logos: socialProof.logos || [] } : undefined,
    testimonials: testimonials?.testimonials || [],
    pricing: pricing?.plans || [],
    faq: faq?.items || [],
    cta_section: cta ? { title: cta.title || "", subtitle: cta.subtitle || "", button_text: cta.button_text || "Fale conosco" } : undefined,
  };
}

const createSite = async (req, res) => {
  try {
    const authUserId = getAuthenticatedUserId(req);
    const { prompt, userId, userEmail, templateId, generationContext } = req.body;
    const effectiveUserId = authUserId || userId;

    if (!effectiveUserId || !prompt) {
      return res.status(400).json({ error: "Dados incompletos (userId ou prompt)." });
    }

    const { user, custo } = await userService.verificarSaldo(effectiveUserId, userEmail, prompt);
    const codigoCompleto = await aiService.gerarSite(prompt, templateId, generationContext || null);

    if (!isValidSiteSchema(codigoCompleto)) {
      return res.status(502).json({
        error: "A IA retornou um formato inválido para o site. Tente novamente.",
      });
    }

    await userService.descontarCreditos(effectiveUserId, custo, prompt, "auto-fallback");

    res.json({
      success: true,
      creditsSpent: custo,
      remainingCredits: user.credits - custo,
      code: codigoCompleto,
    });
  } catch (error) {
    if (error.message && error.message.includes("Saldo insuficiente")) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: "Erro interno ao gerar site." });
  }
};

const getUserData = async (req, res) => {
  try {
    const authUserId = getAuthenticatedUserId(req);
    const { userId } = req.params;
    const { email } = req.query;

    if (authUserId && authUserId !== userId) {
      return res.status(403).json({ error: "Acesso negado para este usuário." });
    }

    const user = await userService.ensureUser(userId, email);
    res.json({ credits: user.credits, plan: user.planType });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const listSites = async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const sites = await prisma.site.findMany({
      where: { userId },
      orderBy: { updated_at: "desc" },
    });
    res.json({ sites });
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar sites." });
  }
};

const getSiteById = async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const { id } = req.params;

    const site = await prisma.site.findFirst({ where: { id, userId } });
    if (!site) return res.status(404).json({ error: "Site não encontrado." });
    res.json({ site });
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar site." });
  }
};

const saveDraft = async (req, res) => {
  try {
    const authUserId = getAuthenticatedUserId(req);
    const { siteId, content, name, description, nicho, objetivo, estilo, userId } = req.body;
    const effectiveUserId = authUserId || userId;

    if (!effectiveUserId) {
      return res.status(400).json({ error: "Dados incompletos (userId)." });
    }

    if (!isValidSiteSchema(content)) {
      return res.status(400).json({ error: "Conteúdo inválido para rascunho." });
    }

    const data = {
      userId: effectiveUserId,
      name: name || "Novo Site",
      description: description || "",
      content: {
        ...(content || {}),
        ...toLegacyContent(content),
        schema_version: 2,
        // Preserve metadata generated by the IA (ex: background/design system)
        // and only add/override the extra business tags.
        metadata: {
          ...(content?.metadata && typeof content.metadata === "object" ? content.metadata : {}),
          nicho: typeof nicho !== "undefined" ? nicho || null : content?.metadata?.nicho ?? null,
          objetivo: typeof objetivo !== "undefined" ? objetivo || null : content?.metadata?.objetivo ?? null,
          estilo: typeof estilo !== "undefined" ? estilo || null : content?.metadata?.estilo ?? null,
        },
      },
      is_published: false,
      custom_domain: null,
    };

    if (!siteId) {
      const created = await prisma.site.create({ data });
      return res.json({ success: true, site: created });
    }

    const existing = await prisma.site.findFirst({ where: { id: siteId, userId: effectiveUserId } });
    if (!existing) return res.status(404).json({ error: "Site não encontrado para atualizar." });

    const updated = await prisma.site.update({
      where: { id: siteId },
      data: {
        name: data.name,
        description: data.description,
        content: data.content,
      },
    });
    res.json({ success: true, site: updated });
  } catch (error) {
    res.status(500).json({ error: "Erro ao salvar rascunho." });
  }
};

const deleteSite = async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const { id } = req.params;

    const existing = await prisma.site.findFirst({ where: { id, userId } });
    if (!existing) return res.status(404).json({ error: "Site não encontrado." });

    await prisma.site.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Erro ao excluir site." });
  }
};

const publishSite = async (req, res) => {
  const authUserId = getAuthenticatedUserId(req);
  const { siteId, subdomain, content, name, description, userId, nicho, objetivo, estilo } = req.body;
  const effectiveUserId = authUserId || userId;
  const normalizedSubdomain = normalizeSubdomain(subdomain);

  if (!effectiveUserId) {
    return res.status(400).json({ error: "Dados incompletos (userId)." });
  }

  if (!isValidSubdomain(normalizedSubdomain)) {
    return res.status(400).json({ error: "Subdomínio inválido. Use apenas letras, números e hífen." });
  }

  const contentToPersist = {
    ...(content || {}),
    ...toLegacyContent(content),
    schema_version: 2,
  };
  contentToPersist.metadata = {
    ...(contentToPersist.metadata && typeof contentToPersist.metadata === "object" ? contentToPersist.metadata : {}),
    nicho: typeof nicho !== "undefined" ? nicho || null : contentToPersist.metadata?.nicho ?? null,
    objetivo: typeof objetivo !== "undefined" ? objetivo || null : contentToPersist.metadata?.objetivo ?? null,
    estilo: typeof estilo !== "undefined" ? estilo || null : contentToPersist.metadata?.estilo ?? null,
  };

  try {
    const existingSubdomain = await prisma.site.findUnique({
      where: { subdomain: normalizedSubdomain },
    });

    if (existingSubdomain && existingSubdomain.id !== siteId) {
      return res.status(400).json({ error: "Este subdomínio já está em uso. Escolha outro." });
    }

    let site = null;
    const isTempSite = !siteId || String(siteId).startsWith("site-");

    if (isTempSite) {
      site = await prisma.site.create({
        data: {
          userId: effectiveUserId,
          name: name || "Meu Site",
          description: description || "Landing Page",
          content: contentToPersist,
          subdomain: normalizedSubdomain,
          is_published: true,
          published_at: new Date(),
        },
      });
    } else {
      const checkSite = await prisma.site.findFirst({
        where: { id: siteId, userId: effectiveUserId },
      });

      if (!checkSite) {
        return res.status(404).json({ error: "Site não encontrado para publicação." });
      }

      site = await prisma.site.update({
        where: { id: siteId },
        data: {
          name: name || checkSite.name || "Meu Site",
          description: description || checkSite.description || "",
          is_published: true,
          subdomain: normalizedSubdomain,
          content: contentToPersist,
          published_at: checkSite.published_at || new Date(),
        },
      });
    }

    res.json({ success: true, site });
  } catch (error) {
    res.status(500).json({ error: "Erro ao publicar site. Tente novamente." });
  }
};

const unpublishSite = async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const { id } = req.params;

    const existing = await prisma.site.findFirst({ where: { id, userId } });
    if (!existing) return res.status(404).json({ error: "Site não encontrado." });

    const updated = await prisma.site.update({
      where: { id },
      data: { is_published: false, published_at: null },
    });

    res.json({ success: true, site: updated });
  } catch (error) {
    res.status(500).json({ error: "Erro ao despublicar site." });
  }
};

const updateSiteDomain = async (req, res) => {
  try {
    const authUserId = getAuthenticatedUserId(req);
    const { id } = req.params;
    const { customDomain } = req.body || {};

    if (!authUserId) return res.status(401).json({ error: "Nao autenticado." });

    const site = await prisma.site.findFirst({ where: { id, userId: authUserId } });
    if (!site) return res.status(404).json({ error: "Site não encontrado." });

    const user = await prisma.user.findUnique({ where: { id: authUserId } });
    if (!user) return res.status(404).json({ error: "Usuario não encontrado." });

    // Domínio customizado só para usuários pagos.
    if (user.planType === "free") {
      return res.status(403).json({ error: "Recurso disponível apenas para usuários pagos." });
    }

    const cleanDomain = customDomain
      ? String(customDomain)
          .toLowerCase()
          .replace(/^https?:\/\//, "")
          .replace(/\/$/, "")
          .trim()
      : "";

    if (!cleanDomain) {
      const updated = await prisma.site.update({
        where: { id },
        data: { custom_domain: null },
      });
      return res.json({ success: true, site: updated });
    }

    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;
    if (!domainRegex.test(cleanDomain)) {
      return res.status(400).json({ error: "Domínio inválido. Use o formato: meusite.com.br" });
    }

    const updated = await prisma.site.update({
      where: { id },
      data: { custom_domain: cleanDomain },
    });

    res.json({ success: true, site: updated });
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar domínio." });
  }
};

const listGenerations = async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);
    if (!userId) return res.status(401).json({ error: "Nao autenticado." });

    const logs = await prisma.generationLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ error: "Erro ao carregar histórico." });
  }
};

const getPublicSite = async (req, res) => {
  const { subdomain } = req.params;

  try {
    const site = await prisma.site.findUnique({
      where: { subdomain: normalizeSubdomain(subdomain) },
    });

    if (!site || !site.is_published) {
      return res.status(404).json({ error: "Site não encontrado." });
    }

    res.json(site);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar site." });
  }
};

module.exports = {
  createSite,
  getUserData,
  listSites,
  getSiteById,
  saveDraft,
  deleteSite,
  publishSite,
  unpublishSite,
  updateSiteDomain,
  listGenerations,
  getPublicSite,
};
