const { createRemoteJWKSet, jwtVerify } = require("jose");

const explicitIssuer = process.env.CLERK_ISSUER || null;
const explicitJwksUrl = process.env.CLERK_JWKS_URL || null;
const jwksCache = new Map();

function getBearerToken(req) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) return null;
  return header.slice(7).trim();
}

function decodeJwtPayload(token) {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payloadBase64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const pad = payloadBase64.length % 4;
    const normalized = pad ? payloadBase64 + "=".repeat(4 - pad) : payloadBase64;
    const json = Buffer.from(normalized, "base64").toString("utf8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function normalizeIssuer(issuer) {
  if (!issuer) return null;
  return String(issuer).replace(/\/+$/, "");
}

function getJwksForIssuer(issuer) {
  const normalizedIssuer = normalizeIssuer(issuer);
  if (!normalizedIssuer) return null;

  const jwksUrl = explicitJwksUrl || `${normalizedIssuer}/.well-known/jwks.json`;
  if (!jwksCache.has(jwksUrl)) {
    jwksCache.set(jwksUrl, createRemoteJWKSet(new URL(jwksUrl)));
  }
  return jwksCache.get(jwksUrl);
}

async function requireAuth(req, res, next) {
  try {
    const token = getBearerToken(req);
    if (!token) {
      return res.status(401).json({ error: "Token de autenticação ausente." });
    }

    const decoded = decodeJwtPayload(token);
    const tokenIssuer = normalizeIssuer(decoded?.iss);
    const issuer = normalizeIssuer(explicitIssuer || tokenIssuer);
    const jwks = getJwksForIssuer(issuer);

    if (!issuer || !jwks) {
      return res.status(401).json({
        error: "Não foi possível validar autenticação (issuer ausente).",
      });
    }

    const { payload } = await jwtVerify(token, jwks, { issuer });
    if (!payload?.sub) {
      return res.status(401).json({ error: "Token inválido (subject ausente)." });
    }

    req.auth = { userId: String(payload.sub), payload };
    return next();
  } catch {
    return res.status(401).json({ error: "Não autenticado." });
  }
}

module.exports = { requireAuth };
