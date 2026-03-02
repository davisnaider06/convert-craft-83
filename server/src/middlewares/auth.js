const { createRemoteJWKSet, jwtVerify } = require("jose");

const clerkIssuer = process.env.CLERK_ISSUER;
const clerkJwksUrl = process.env.CLERK_JWKS_URL || (clerkIssuer ? `${clerkIssuer}/.well-known/jwks.json` : null);

let jwks = null;
if (clerkJwksUrl) {
  jwks = createRemoteJWKSet(new URL(clerkJwksUrl));
}

function getBearerToken(req) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) return null;
  return header.slice(7).trim();
}

async function requireAuth(req, res, next) {
  try {
    if (!jwks || !clerkIssuer) {
      return res.status(500).json({
        error: "Servidor sem configuração de autenticação (CLERK_ISSUER/CLERK_JWKS_URL).",
      });
    }

    const token = getBearerToken(req);
    if (!token) {
      return res.status(401).json({ error: "Token de autenticação ausente." });
    }

    const { payload } = await jwtVerify(token, jwks, { issuer: clerkIssuer });
    if (!payload?.sub) {
      return res.status(401).json({ error: "Token inválido (subject ausente)." });
    }

    req.auth = {
      userId: String(payload.sub),
      payload,
    };
    next();
  } catch (error) {
    return res.status(401).json({ error: "Não autenticado." });
  }
}

module.exports = { requireAuth };
