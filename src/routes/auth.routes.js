const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

router.get("/", (req, res) => {
  res.json({ message: "Rota /auth OK ✅" });
});

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/oauth/google", authController.googleOAuth);

module.exports = router;
