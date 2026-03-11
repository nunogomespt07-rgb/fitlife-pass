// src/controllers/authController.js

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ✅ REGISTER — create user, then create session (JWT) and return success
exports.register = async (req, res) => {
  try {
    const name = (req.body.name || "").trim();
    const email = (req.body.email || "").trim().toLowerCase();
    const password = (req.body.password || "").trim();

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Faltam dados (name, email, password)." });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: "Este email já está em utilização." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "JWT_SECRET não definido no .env" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    return res.status(500).json({ message: "Erro no registo", err: String(err) });
  }
};

// ✅ LOGIN (devolve token)
exports.login = async (req, res) => {
  try {
    const email = (req.body.email || "").trim().toLowerCase();
    const password = (req.body.password || "").trim();

    if (!email || !password) {
      return res.status(400).json({ message: "Faltam dados (email, password)." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "JWT_SECRET não definido no .env" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.json({
      message: "Login OK",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    return res.status(500).json({ message: "Erro no login", err: String(err) });
  }
};

// ✅ FORGOT PASSWORD — request recovery email (always returns success for UX; implement email later)
exports.forgotPassword = async (req, res) => {
  try {
    const email = (req.body.email || "").trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ message: "Email é obrigatório." });
    }
    const user = await User.findOne({ email });
    if (user) {
      // TODO: send recovery email with token/link; for now we don't expose whether email exists
    }
    return res.json({
      message: "Se esse email estiver associado a uma conta, receberás instruções para redefinir a password.",
    });
  } catch (err) {
    return res.status(500).json({ message: "Erro ao processar pedido.", err: String(err) });
  }
};

// ✅ GOOGLE OAUTH (recebe dados do NextAuth e cria/atualiza utilizador)
exports.googleOAuth = async (req, res) => {
  try {
    const { email, name, image } = req.body || {};

    if (!email) {
      return res.status(400).json({ ok: false, message: "Falta email" });
    }

    // 🔥 cria ou atualiza utilizador pelo email
    const user = await User.findOneAndUpdate(
      { email },
      {
        $set: {
          name: name || email.split("@")[0],
          email,
          image: image || null,
          provider: "google",
        },
      },
      { new: true, upsert: true }
    );

    return res.json({ ok: true, user });
  } catch (err) {
    console.error("googleOAuth error:", err);
    return res.status(500).json({ ok: false, message: "Erro no servidor" });
  }
};
