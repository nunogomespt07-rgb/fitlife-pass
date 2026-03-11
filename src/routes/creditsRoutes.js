const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const User = require("../models/User");
const CreditTransaction = require("../models/CreditTransaction");

// GET /credits/balance
router.get("/balance", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("credits name email");
    if (!user) return res.status(404).json({ message: "Utilizador não encontrado" });

    res.json({
      user: { id: user._id, name: user.name, email: user.email },
      credits: user.credits,
    });
  } catch (err) {
    res.status(500).json({ message: "Erro ao buscar créditos" });
  }
});

// POST /credits/add  { "amount": 10 }  (simulação de top-up)
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const amount = Number(req.body.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return res
        .status(400)
        .json({ message: "amount tem de ser um número > 0" });
    }

    const user = await User.findById(req.userId);
    if (!user)
      return res.status(404).json({ message: "Utilizador não encontrado" });

    user.credits += amount;
    await user.save();

    await CreditTransaction.create({
      user: user._id,
      type: "top_up",
      amount,
      balanceAfter: user.credits,
      description: "Top-up de créditos (simulado)",
    });

    res.json({ message: "Créditos adicionados", credits: user.credits });
  } catch (err) {
    res.status(500).json({ message: "Erro ao adicionar créditos" });
  }
});

// POST /credits/spend  { "amount": 5 }  (movimento genérico)
router.post("/spend", authMiddleware, async (req, res) => {
  try {
    const amount = Number(req.body.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return res
        .status(400)
        .json({ message: "amount tem de ser um número > 0" });
    }

    const user = await User.findById(req.userId);
    if (!user)
      return res.status(404).json({ message: "Utilizador não encontrado" });

    if (user.credits < amount) {
      return res.status(400).json({
        message: "Créditos insuficientes",
        credits: user.credits,
        needed: amount,
      });
    }

    user.credits -= amount;
    await user.save();

    await CreditTransaction.create({
      user: user._id,
      type: "spend",
      amount: -amount,
      balanceAfter: user.credits,
      description: "Utilização manual de créditos",
    });

    res.json({ message: "Créditos gastos", credits: user.credits });
  } catch (err) {
    res.status(500).json({ message: "Erro ao gastar créditos" });
  }
});

// GET /credits/transactions  – histórico de movimentos
router.get("/transactions", authMiddleware, async (req, res) => {
  try {
    const tx = await CreditTransaction.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(tx);
  } catch (err) {
    res.status(500).json({ message: "Erro ao buscar histórico de créditos" });
  }
});

module.exports = router;