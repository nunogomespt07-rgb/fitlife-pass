const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const User = require("../models/User");

// GET /users/me
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Utilizador não encontrado." });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Erro ao buscar utilizador." });
  }
});

module.exports = router;