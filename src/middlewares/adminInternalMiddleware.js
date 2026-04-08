/**
 * Protege rotas internas só para o servidor Next (ou ferramentas com segredo).
 * Headers aceites: x-admin-secret ou x-fitlife-admin-secret === ADMIN_API_SECRET
 */
module.exports = function adminInternalMiddleware(req, res, next) {
  const secret = (process.env.ADMIN_API_SECRET || "").trim();
  if (!secret || secret.length < 8) {
    if (process.env.NODE_ENV === "production") {
      return res.status(503).json({
        success: false,
        message: "ADMIN_API_SECRET não configurado no servidor API (mín. 8 caracteres).",
      });
    }
    console.warn(
      "[adminInternal] ADMIN_API_SECRET em falta — em desenvolvimento a rota fica aberta. NÃO uses em produção."
    );
    return next();
  }
  const sent = String(
    req.headers["x-admin-secret"] || req.headers["x-fitlife-admin-secret"] || ""
  ).trim();
  if (sent !== secret) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  next();
};
