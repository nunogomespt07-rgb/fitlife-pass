const User = require("../models/User");

function isProd() {
  return String(process.env.NODE_ENV || "").toLowerCase() === "production";
}

exports.createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // validações simples
    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email e password são obrigatórios." });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: "Email já está registado." });
    }

    const user = await User.create({ name, email, password });

    // não devolver password no response
    const userSafe = {
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };

    return res.status(201).json(userSafe);
  } catch (err) {
    return res
      .status(500)
      .json(
        isProd()
          ? { message: "Erro a criar utilizador." }
          : { message: "Erro a criar utilizador.", error: err?.message ?? String(err) }
      );
  }
}