const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "Token em falta" });
    }

    const [type, token] = authHeader.split(" ");

    if (type !== "Bearer" || !token) {
      return res.status(401).json({ message: "Formato de token inválido" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Define ambos para não haver confusão
    req.user = decoded;
    req.userId = decoded.id || decoded.userId || decoded._id;

    if (!req.userId) {
      return res.status(401).json({ message: "Token sem id de utilizador" });
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: "Token inválido" });
  }
};