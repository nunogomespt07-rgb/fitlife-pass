const express = require("express");
const router = express.Router();
const adminCustomersController = require("../controllers/adminCustomersController");

router.get("/metrics", adminCustomersController.customerMetrics);
router.get("/", adminCustomersController.listCustomers);

module.exports = router;
