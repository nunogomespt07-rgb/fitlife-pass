// src/controllers/authController.js

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

function isProd() {
  return String(process.env.NODE_ENV || "").toLowerCase() === "production";
}

function internalErrorPayload(message, err) {
  if (isProd()) return { message };
  return { message, error: err?.message ?? String(err) };
}

// ✅ REGISTER — create user, then create session (JWT) and return success
exports.register = async (req, res) => {
  try {
    // Extrair e validar campos obrigatórios
    const firstName = (req.body.firstName || "").trim();
    const lastName = (req.body.lastName || "").trim();
    const email = (req.body.email || "").trim().toLowerCase();
    const password = (req.body.password || "").trim();
    const birthDate = (req.body.birthDate || "").trim();

    if (!firstName || !lastName || !email || !password || !birthDate) {
      return res.status(400).json({ message: "Faltam dados obrigatórios (firstName, lastName, email, password, birthDate)." });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: "Este email já está em utilização." });
    }

    // Extrair opcionais
    const phoneCountryCode = req.body.phoneCountryCode || null;
    const phone = req.body.phone || null;
    const country = req.body.country || null;
    const address = req.body.address || null;
    const city = req.body.city || null;
    const postalCode = req.body.postalCode || null;
    const documentId = req.body.documentId || null;
    const gender = req.body.gender || null;
    const fitnessGoal = req.body.fitnessGoal || null;

    // Derivar name
    const name = `${firstName} ${lastName}`.trim();

    const user = await User.create({
      firstName,
      lastName,
      name,
      email,
      password,
      birthDate,
      phoneCountryCode,
      phone,
      country,
      address,
      city,
      postalCode,
      documentId,
      gender,
      fitnessGoal,
      credits: 0,
      plan: null,
      planStatus: null,
      planRenewAt: null,
      creditsPeriodKey: null,
      interests: [],
    });

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "JWT_SECRET não definido no .env" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const u = await User.findById(user._id).select("-password");
    return res.status(201).json({
      success: true,
      token,
      user: {
        id: String(u._id),
        firstName: u.firstName,
        lastName: u.lastName,
        name: u.name,
        email: u.email,
        birthDate: u.birthDate,
        phoneCountryCode: u.phoneCountryCode,
        phone: u.phone,
        country: u.country,
        address: u.address,
        city: u.city,
        postalCode: u.postalCode,
        documentId: u.documentId,
        gender: u.gender,
        fitnessGoal: u.fitnessGoal,
        credits: typeof u.credits === "number" ? Math.max(0, Math.floor(u.credits)) : 0,
        plan: u.plan ?? null,
        reservations: [],
      },
    });
  } catch (err) {
    return res.status(500).json(internalErrorPayload("Erro no registo", err));
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
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        credits: Math.max(0, Math.floor(user.credits != null ? user.credits : 0)),
        plan: user.plan ?? null,
        planStatus: user.planStatus ?? null,
      },
    });
  } catch (err) {
    return res.status(500).json(internalErrorPayload("Erro no login", err));
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
    return res.status(500).json(internalErrorPayload("Erro ao processar pedido.", err));
  }
};

// ✅ GOOGLE OAUTH (recebe dados do NextAuth e cria/atualiza utilizador)
exports.googleOAuth = async (req, res) => {
  try {
    const { email, name, image } = req.body || {};

    if (!email) {
      return res.status(400).json({ ok: false, message: "Falta email" });
    }

    // cria ou atualiza utilizador pelo email
    const displayName = (typeof name === "string" && name.trim()) ? name.trim() : "Utilizador";

    const user = await User.findOneAndUpdate(
      { email },
      {
        $set: {
          name: displayName,
          email,
          image: image || null,
          provider: "google",
        },
        $setOnInsert: {
          credits: 0,
          plan: null,
          planStatus: null,
          planRenewAt: null,
          creditsPeriodKey: null,
        },
      },
      { new: true, upsert: true }
    ).select("-password");

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ ok: false, message: "JWT_SECRET não definido no .env" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.json({
      ok: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        credits: typeof user.credits === "number" ? user.credits : 0,
        plan: user.plan ?? null,
      },
    });
  } catch (err) {
    console.error("googleOAuth error:", err);
    return res.status(500).json({ ok: false, message: "Erro no servidor" });
  }
};
