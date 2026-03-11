const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const apiBookingController = require("../controllers/apiBookingController");

router.post("/", authMiddleware, apiBookingController.createBooking);
router.get("/", authMiddleware, apiBookingController.getMyBookings);
router.delete("/:bookingId", authMiddleware, apiBookingController.cancelBooking);

module.exports = router;
