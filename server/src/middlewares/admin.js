const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function parseAdminEmails() {
  const raw = process.env.ADMIN_EMAILS || "";
  const parsed =
    raw
      .split(",")
      .map((s) => String(s || "").trim().toLowerCase())
      .filter(Boolean);

  // Dev fallback: mirrors the emails hardcoded in the frontend.
  // For production, always set ADMIN_EMAILS in the backend environment.
  if (parsed.length === 0) {
    return [
      "kaueramaciott@gmail.com",
      "conteudosmr@gmail.com",
      "fernandafernamdesoliveira@gmail.com",
      "admin@boder.ia",
    ];
  }

  return parsed;
}

async function requireAdmin(req, res, next) {
  try {
    const userId = req?.auth?.userId;
    if (!userId) return res.status(401).json({ error: "Nao autenticado." });

    const adminEmails = parseAdminEmails();
    if (adminEmails.length === 0) return res.status(500).json({ error: "ADMIN_EMAILS nao configurado no backend." });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const email = String(user?.email || "").toLowerCase();

    if (!email || !adminEmails.includes(email)) {
      return res.status(403).json({ error: "Acesso admin negado." });
    }

    return next();
  } catch (error) {
    return res.status(500).json({ error: "Falha na validação de admin." });
  }
}

module.exports = { requireAdmin };

