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
    const planRaw = req.body?.plan;
    const plan = typeof planRaw === "string" ? planRaw.toUpperCase() : null;
    console.log("[activate] plan raw", planRaw);
    console.log("[subscription/activate] normalized plan", { plan });

    if (!["START", "CORE", "PRO"].includes(plan)) {
      throw new Error("INVALID_PLAN");
    }
    const cfg = PLAN_CONFIG[plan];
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

      // Idempotency + safe overwrite:
      // - If planStatus is active and same plan -> do nothing
      // - If planStatus is active and different plan -> overwrite plan
      // - Always ensure planStatus becomes "active"
      const normalizedPlan = plan.toUpperCase();
      if (user.planStatus === "active") {
        if (user.plan === normalizedPlan) {
          const safeUser = user.toObject();
          delete safeUser.password;
          await session.abortTransaction();
          return res.json({
            success: true,
            message: "Plan already active",
            user: safeUser,
          });
        }

        user.plan = normalizedPlan;
      } else {
        user.plan = normalizedPlan;
        user.planStatus = "active";
      }

      user.planStatus = "active";
      await user.save({ session });

      // Ledger service is source of truth for how credits are attributed/expiring.
      console.log("[activate] applying plan credits", { userId, plan });
      const granted = await creditLedgerService.applyPlan(userId, plan, session);
      console.log("[subscription/activate] plan applied", {
        userId,
        plan,
        grantedCredits: granted?.grantedCredits,
        userCreditsAfter: granted?.user?.credits,
      });

      await Subscription.findOneAndUpdate(
        { user: user._id },
        {
          user: user._id,
          plan,
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
        success: true,
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
  message: error.message || "UNKNOWN_ERROR",
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
        planStatus: "canceled",
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