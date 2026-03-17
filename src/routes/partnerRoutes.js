const express = require("express");
const router = express.Router();

const Booking = require("../models/Booking");

function isProd() {
  return String(process.env.NODE_ENV || "").toLowerCase() === "production";
}

// POST /partner/checkin
// Body: { token: "..." }
router.post("/checkin", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token em falta" });
    }

    // procurar a reserva pelo token
    const booking = await Booking.findOne({ checkInToken: token });

    if (!booking) {
      return res.status(404).json({ message: "Token inválido" });
    }

    // expirou?
    if (booking.checkInExpiresAt && new Date(booking.checkInExpiresAt) < new Date()) {
      return res.status(400).json({ message: "Token expirado" });
    }

    // já foi usado?
    if (booking.status === "checked_in") {
      return res.status(400).json({ message: "Token já usado (check-in já feito)" });
    }

    // marcar check-in
    booking.status = "checked_in";

    // opcional mas recomendado: inutilizar o token para não reutilizarem
    booking.checkInToken = null;
    booking.checkInExpiresAt = null;

    await booking.save();

    return res.status(200).json({
      message: "Check-in efetuado com sucesso ✅",
      bookingId: booking._id,
      status: booking.status,
    });
  } catch (err) {
    return res
      .status(500)
      .json(
        isProd()
          ? { message: "Erro interno" }
          : { message: "Erro interno", error: err?.message ?? String(err) }
      );
  }
});

module.exports = router;
