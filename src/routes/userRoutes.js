const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const User = require("../models/User");
const creditLedgerService = require("../services/creditLedgerService");

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
    country: user.country ?? null,
    city: user.city ?? null,
    phone: user.phone ?? null,
    address: user.address ?? null,
    postalCode: user.postalCode ?? null,
    dateOfBirth: user.dateOfBirth ?? null,
    nif: user.nif ?? null,
    fitnessGoal: user.fitnessGoal ?? null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

async function getCurrentUser(req, res) {
  try {
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
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const set = {};

    const profileFields = [
      "firstName",
      "lastName",
      "country",
      "city",
      "phone",
      "address",
      "postalCode",
      "dateOfBirth",
      "nif",
      "fitnessGoal",
      "plan",
      "planStatus",
    ];

    for (const field of profileFields) {
      if (field in body) {
        const value = body[field];
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
        set[field] = value == null ? null : String(value).trim();
      }
    }

    if ("name" in body) {
      const name = body.name == null ? "" : String(body.name).trim();
      if (!name) {
        return res.status(400).json({ message: "name inválido" });
      }
      set.name = name;
    } else {
      const first = "firstName" in set ? (set.firstName || "") : "";
      const last = "lastName" in set ? (set.lastName || "") : "";
      const combined = `${first} ${last}`.trim();
      if (combined) set.name = combined;
    }

    if (Object.keys(set).length === 0) {
      const existing = await User.findById(req.userId).select("-password");
      if (!existing) return res.status(404).json({ message: "Utilizador não encontrado." });
      return res.json(normalizeUserResponse(existing));
    }

    const updated = await User.findByIdAndUpdate(
      req.userId,
      { $set: set },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updated) {
      return res.status(404).json({ message: "Utilizador não encontrado." });
    }

    return res.json(normalizeUserResponse(updated));
  } catch (err) {
    return res.status(500).json({ message: "Erro ao atualizar utilizador." });
  }
}

// GET /users/me
router.get("/me", auth, getCurrentUser);
// Alias: GET /api/user (mounted in app.js at /api)
router.get("/user", auth, getCurrentUser);
// PATCH /users/me
router.patch("/me", auth, updateCurrentUser);
// Alias: PATCH /api/user
router.patch("/user", auth, updateCurrentUser);

module.exports = router;