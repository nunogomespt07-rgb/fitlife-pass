

const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const User = require("../models/User");
const creditLedgerService = require("../services/creditLedgerService");
const monthlyCreditsService = require("../services/monthlyCreditsService");

// Public test route for connectivity/debugging (must be after router is initialized)
router.get("/user/public", (req, res) => {
  res.json({ ok: true, message: "API /api/user/public está acessível (sem auth)" });
});

function normalizeUserResponse(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    credits: typeof user.credits === "number" ? user.credits : 0,
    plan: user.plan ?? null,
    planStatus: user.planStatus ?? null,
    planRenewAt: user.planRenewAt ?? null,
    subscriptionPlanId: user.plan ?? null,
    subscriptionPlanName: user.plan ?? null,
    firstName: user.firstName ?? null,
    lastName: user.lastName ?? null,
    birthDate: user.birthDate ?? null,
    phoneCountryCode: user.phoneCountryCode ?? null,
    phone: user.phone ?? null,
    country: user.country ?? null,
    address: user.address ?? null,
    city: user.city ?? null,
    postalCode: user.postalCode ?? null,
    documentId: user.documentId ?? null,
    gender: user.gender ?? null,
    fitnessGoal: user.fitnessGoal ?? null,
    interests: Array.isArray(user.interests) ? user.interests : [],
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

async function getCurrentUser(req, res) {
  try {
    await monthlyCreditsService.applyMonthlyCreditsResetIfNeeded(req.userId);
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Utilizador não encontrado." });
    }

    res.json(normalizeUserResponse(user));
  } catch (err) {
    res.status(500).json({ message: "Erro ao buscar utilizador." });
  }
}

async function updateCurrentUser(req, res) {
  try {
    console.log("[PATCH /users/me] req.body:", req.body);
    console.log("[PATCH /users/me] req.user:", req.user);
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const set = {};

    // Lista completa de campos de perfil aceites
    const profileFields = [
      "name",
      "firstName",
      "lastName",
      "birthDate",
      "phoneCountryCode",
      "phone",
      "country",
      "address",
      "city",
      "postalCode",
      "documentId",
      "gender",
      "fitnessGoal",
      "plan",
      "planStatus",
      "interests"
    ];

    for (const field of profileFields) {
      if (field in body) {
        let value = body[field];
        if (field === "plan") {
          if (value == null) {
            set[field] = null;
            continue;
          }
          const normalizedPlan = creditLedgerService.normalizePlan(value);
          if (!normalizedPlan) {
            return res.status(400).json({ message: "Plano inválido" });
          }
          set[field] = normalizedPlan;
          continue;
        }
        if (field === "planStatus") {
          if (value == null) {
            set[field] = null;
            continue;
          }
          const raw = String(value).trim().toLowerCase();
          if (raw === "active") {
            set[field] = "active";
            continue;
          }
          if (raw === "canceled" || raw === "cancelled") {
            set[field] = "canceled";
            continue;
          }
          set[field] = null;
          continue;
        }
        if (field === "interests") {
          if (value == null) {
            set.interests = [];
          } else if (Array.isArray(value)) {
            set.interests = value
              .map((x) => (x == null ? "" : String(x).trim()))
              .filter(Boolean);
          } else {
            return res.status(400).json({ message: "interests deve ser um array" });
          }
          continue;
        }
        set[field] = value == null ? null : String(value).trim();
      }
    }

    // Garantir que o campo name é sempre preenchido
    if (!set.name) {
      const first = "firstName" in set ? (set.firstName || "") : "";
      const last = "lastName" in set ? (set.lastName || "") : "";
      const combined = `${first} ${last}`.trim();
      set.name = combined || undefined;
    }

    if (Object.keys(set).length === 0) {
      const existing = await User.findById(req.userId).select("-password");
      if (!existing) return res.status(404).json({ message: "Utilizador não encontrado." });
      return res.json(normalizeUserResponse(existing));
    }

    let updated = null;
    try {
      updated = await User.findByIdAndUpdate(
        req.userId,
        { $set: set },
        { new: true, runValidators: false }
      ).select("-password");
    } catch (errUpdate) {
      console.error("[PATCH /users/me] Mongoose update error:", errUpdate);
      return res.status(500).json({ message: "Erro ao atualizar utilizador (update)", error: errUpdate?.message || String(errUpdate) });
    }
    if (!updated) {
      console.error("[PATCH /users/me] Utilizador não encontrado após update", req.userId);
      return res.status(404).json({ message: "Utilizador não encontrado." });
    }
    return res.json(normalizeUserResponse(updated));
  } catch (err) {
    console.error("[PATCH /users/me] Erro geral:", err);
    return res.status(500).json({ message: "Erro ao atualizar utilizador.", error: err?.message || String(err) });
  }
}

// GET /users/me
router.get("/me", auth, getCurrentUser);
// Alias: GET /api/user (mounted in app.js at /api)
router.get("/user", auth, getCurrentUser);
// GET /user/current (mounted in app.js at /user)
router.get("/current", auth, getCurrentUser);
// PATCH /users/me
router.patch("/me", auth, updateCurrentUser);
// Alias: PATCH /api/user
router.patch("/user", auth, updateCurrentUser);

module.exports = router;