const express = require("express");
const router = express.Router();
const adminReservationsController = require("../controllers/adminReservationsController");

router.get("/metrics", adminReservationsController.metrics);
router.get("/", adminReservationsController.listReservations);

module.exports = router;
