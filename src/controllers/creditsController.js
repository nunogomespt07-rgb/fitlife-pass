const User = require("../models/User");

function isProd() {
  return String(process.env.NODE_ENV || "").toLowerCase() === "production";
}

// GET /credits/balance
exports.getBalance = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("credits");
    if (!user) return res.status(404).json({ message: "Utilizador não encontrado" });

    return res.json({ credits: user.credits });
  } catch (err) {
    return res
      .status(500)
      .json(
        isProd()
          ? { message: "Erro ao obter créditos" }
          : { message: "Erro ao obter créditos", error: err?.message ?? String(err) }
      );
  }
};

// POST /credits/add  { amount }
exports.addCredits = async (req, res) => {
  try {
    const amount = Number(req.body.amount);

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "amount inválido" });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "Utilizador não encontrado" });

    user.credits += amount;
    await user.save();

    return res.json({ message: "Créditos adicionados", credits: user.credits });
  } catch (err) {
    return res
      .status(500)
      .json(
        isProd()
          ? { message: "Erro ao adicionar créditos" }
          : { message: "Erro ao adicionar créditos", error: err?.message ?? String(err) }
      );
  }
};

// POST /credits/spend  { amount }
exports.spendCredits = async (req, res) => {
  try {
    const amount = Number(req.body.amount);

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "amount inválido" });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "Utilizador não encontrado" });

    if (user.credits < amount) {
      return res.status(400).json({ message: "Créditos insuficientes", credits: user.credits });
    }

    user.credits -= amount;
    await user.save();

    return res.json({ message: "Créditos gastos", credits: user.credits });
  } catch (err) {
    return res
      .status(500)
      .json(
        isProd()
          ? { message: "Erro ao gastar créditos" }
          : { message: "Erro ao gastar créditos", error: err?.message ?? String(err) }
      );
  }
};