const User = require("../models/User");
const Subscription = require("../models/Subscription");
const CreditTransaction = require("../models/CreditTransaction");
const creditLedgerService = require("../services/creditLedgerService");

function isProd() {
  return String(process.env.NODE_ENV || "").toLowerCase() === "production";
}

const PLAN_CONFIG = {
  START: { creditsPerMonth: 50 },
  CORE: { creditsPerMonth: 100 },
  PRO: { creditsPerMonth: 110 },
};

// Ativar ou trocar de plano (simulação de subscrição)
exports.activatePlan = async (req, res) => {
  try {
    console.log("[activate] body", req.body);
    console.log("[activate] req.user", req.user || null);
    const userId = req.userId;
    const { plan } = req.body;
    console.log("[activate] plan raw", req.body?.plan);
    console.log("[subscription/activate] start", { userId, plan, body: req.body });

    const normalizedPlan = creditLedgerService.normalizePlan(plan);
    if (!normalizedPlan || !PLAN_CONFIG[normalizedPlan]) {
      return res.status(400).json({ message: "Plano inválido" });
    }
    console.log("[subscription/activate] normalizedPlan", { normalizedPlan });

    const cfg = PLAN_CONFIG[normalizedPlan];
    const now = new Date();
    const end = new Date(now);
    end.setMonth(end.getMonth() + 1);

    const session = await User.startSession();
    session.startTransaction();

    try {
      const user = await User.findById(userId).session(session);
      console.log("[activate] user found", !!user);
      if (!user) {
        await session.abortTransaction();
        return res.status(404).json({ message: "Utilizador não encontrado" });
      }

      // Ledger service is source of truth for how credits are attributed/expiring.
      console.log("[activate] before save", user?.toObject ? user.toObject() : user);
      console.log("[subscription/activate] applying plan credits", {
        userId,
        normalizedPlan,
      });
      const granted = await creditLedgerService.applyPlan(userId, normalizedPlan, session);
      console.log("[subscription/activate] plan applied", {
        userId,
        normalizedPlan,
        grantedCredits: granted?.grantedCredits,
        userCreditsAfter: granted?.user?.credits,
      });

      await Subscription.findOneAndUpdate(
        { user: user._id },
        {
          user: user._id,
          plan: normalizedPlan,
          status: "active",
          creditsPerPeriod: cfg.creditsPerMonth,
          currentPeriodStart: now,
          currentPeriodEnd: end,
        },
        { upsert: true, new: true, session }
      );

      // Credit ledger already wrote the relevant CreditTransaction(s).

      await session.commitTransaction();

      const safeUser = granted.user.toObject();
      delete safeUser.password;

      return res.json({
        message: "Plano ativado com sucesso",
        user: safeUser,
      });
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  } catch (err) {
    const error = err || {};
    console.log("VALIDATION ERROR:", error?.errors || null);
    if (error?.errors) {
      console.log("VALIDATION ERROR FIELDS:", Object.keys(error.errors));
    }
    return res.status(500).json({
      success: false,
      message: "PLAN_ACTIVATE_ERROR",
      error: error.message ?? String(error),
      name: error.name ?? "Error",
      stack: error.stack ?? null,
      body: req.body || null,
      reqUser: req.user || null,
    });
  }
};

// Cancelar plano (não mexe nos créditos já atribuídos)
exports.cancelPlan = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        planStatus: "cancelled",
      },
      { new: true }
    );

    const subscription = await Subscription.findOneAndUpdate(
      { user: userId },
      { status: "cancelled" },
      { new: true }
    );

    const safeUser = user.toObject();
    delete safeUser.password;

    return res.json({
      message: "Plano cancelado com sucesso",
      user: safeUser,
      subscription,
    });
  } catch (err) {
    return res
      .status(500)
      .json(
        isProd()
          ? { message: "Erro ao cancelar plano" }
          : { message: "Erro ao cancelar plano", error: err?.message ?? String(err) }
      );
  }
};