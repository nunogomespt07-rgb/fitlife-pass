const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

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
    const authHeader = req.headers.authorization || "";
    const userId =
      req.userId ||
      req?.user?.userId ||
      req?.user?.id ||
      req?.user?._id ||
      null;
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const amount = body.amount;

    // Temporary debug logs for Railway runtime diagnosis.
    console.log("[credits/add] auth header", authHeader ? "present" : "missing");
    console.log("[credits/add] req.user", req.user || null);
    console.log("[credits/add] req.body", req.body || null);
    console.log("[credits/add] amount", req.body?.amount);
    console.log("[credits/add] userId", req?.user?.userId || req?.user?.id || userId || null);

    if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
      return res
        .status(400)
        .json({ message: "amount tem de ser um número > 0" });
    }

    if (!userId || !mongoose.Types.ObjectId.isValid(String(userId))) {
      return res.status(401).json({ message: "Utilizador autenticado inválido" });
    }

    console.log("[credits/add] before findById");
    const user = await User.findById(String(userId));
    console.log("[credits/add] after findById", !!user);
    if (!user)
      return res.status(404).json({ message: "Utilizador não encontrado" });

    const currentCredits =
      typeof user.credits === "number" && Number.isFinite(user.credits)
        ? user.credits
        : 0;
    console.log("[credits/add] user.credits before", user?.credits);
    user.credits = currentCredits + amount;
    await user.save();
    console.log("[credits/add] user after update", {
      id: String(user._id),
      credits: user.credits,
    });

    await CreditTransaction.create({
      user: user._id,
      type: "top_up",
      amount,
      balanceAfter: user.credits,
      description: "Top-up de créditos (simulado)",
    });

    return res.json({ success: true, credits: user.credits });
  } catch (error) {
    console.error({
      route: "/credits/add",
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      body: req.body,
      user: req.user,
      userId: req.userId,
    });
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      name: error instanceof Error ? error.name : "UnknownError",
      stack: error instanceof Error ? error.stack : undefined,
      reqUser: req.user || null,
      body: req.body || null,
    });
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