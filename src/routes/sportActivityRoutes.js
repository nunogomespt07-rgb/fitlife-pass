const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const sportActivityController = require("../controllers/sportActivityController");

// Criar atividade (protegido)
router.post(
  "/",
  authMiddleware,
  sportActivityController.createActivity
);

// Listar atividades (público)
router.get("/", sportActivityController.getActivities);

// Obter uma atividade (público)
router.get("/:id", sportActivityController.getActivityById);

// Juntar-se a uma atividade (protegido)
router.post(
  "/:id/join",
  authMiddleware,
  sportActivityController.joinActivity
);

module.exports = router;

