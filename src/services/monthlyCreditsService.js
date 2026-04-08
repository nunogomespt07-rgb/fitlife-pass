const User = require("../models/User");
const CreditTransaction = require("../models/CreditTransaction");

function getMonthKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * Quando a chave YYYY-MM muda (novo mês), zera créditos e ancora o período.
 * Fonte de verdade: Mongo + movimento CREDIT_RESET no ledger.
 */
async function applyMonthlyCreditsResetIfNeeded(userId) {
  const user = await User.findById(userId);
  if (!user) return null;

  const key = getMonthKey();

  if (user.creditsPeriodKey == null || user.creditsPeriodKey === "") {
    user.creditsPeriodKey = key;
    await user.save();
    return user;
  }

  if (user.creditsPeriodKey !== key) {
    const balanceBefore = Math.max(0, Math.floor(user.credits != null ? user.credits : 0));
    user.credits = 0;
    user.creditsPeriodKey = key;
    await user.save();

    if (balanceBefore > 0) {
      await CreditTransaction.create({
        user: user._id,
        type: "CREDIT_RESET",
        amount: -balanceBefore,
        balanceBefore,
        balanceAfter: 0,
        description: "Reset mensal de créditos (dia 1 / novo período)",
        meta: { periodKey: key },
      });
    }
  }

  return user;
}

module.exports = {
  getMonthKey,
  applyMonthlyCreditsResetIfNeeded,
};
