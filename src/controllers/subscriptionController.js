const User = require("../models/User");
const Subscription = require("../models/Subscription");
const CreditTransaction = require("../models/CreditTransaction");

const PLAN_CONFIG = {
  basic: { creditsPerMonth: 20 },
  premium: { creditsPerMonth: 40 },
};

// Ativar ou trocar de plano (simulação de subscrição)
exports.activatePlan = async (req, res) => {
  try {
    const userId = req.userId;
    const { plan } = req.body;

    if (!["basic", "premium"].includes(plan)) {
      return res.status(400).json({ message: "Plano inválido" });
    }

    const cfg = PLAN_CONFIG[plan];
    const now = new Date();
    const end = new Date(now);
    end.setMonth(end.getMonth() + 1);

    const session = await User.startSession();
    session.startTransaction();

    try {
      const user = await User.findById(userId).session(session);
      if (!user) {
        await session.abortTransaction();
        return res.status(404).json({ message: "Utilizador não encontrado" });
      }

      user.plan = plan;
      user.planStatus = "active";
      user.planRenewAt = end;
      user.credits = (user.credits || 0) + cfg.creditsPerMonth;
      await user.save({ session });

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

      await CreditTransaction.create(
        [
          {
            user: user._id,
            type: "subscription",
            amount: cfg.creditsPerMonth,
            balanceAfter: user.credits,
            description: `Ativação de plano ${plan}`,
            meta: { plan },
          },
        ],
        { session }
      );

      await session.commitTransaction();

      const safeUser = user.toObject();
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
    return res
      .status(500)
      .json({ message: "Erro ao ativar plano", error: err.message });
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
      .json({ message: "Erro ao cancelar plano", error: err.message });
  }
};