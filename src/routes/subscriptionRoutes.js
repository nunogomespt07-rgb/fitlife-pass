const express = require("express");
const router = express.Router();
router.get('/_test_', (req, res) => res.json({ subscription: 'ok' }));

const authMiddleware = require("../middlewares/authMiddleware");
const subscriptionController = require("../controllers/subscriptionController");

// Ativar plano
router.post("/activate", authMiddleware, subscriptionController.activatePlan);

// Cancelar plano
router.post("/cancel", authMiddleware, subscriptionController.cancelPlan);

module.exports = router;