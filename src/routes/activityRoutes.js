const express = require("express");
const router = express.Router();

const activityController = require("../controllers/activityController");

// AQUI DENTRO TEM DE SER SÓ "/" e "/:id"
router.get("/", activityController.getActivities);
router.get("/:id", activityController.getActivityById);

module.exports = router;