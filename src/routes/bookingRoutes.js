// src/routes/bookingRoutes.js
const express = require("express");
const crypto = require("crypto");
const QRCode = require("qrcode");

const authMiddleware = require("../middlewares/authMiddleware");

const Booking = require("../models/Booking");
const Activity = require("../models/Activity");
const User = require("../models/User");

const router = express.Router();

/**
 * POST /bookings
 * Cria uma reserva (NÃO desconta créditos aqui)
 * Gera token + expiração 24h + QRCode (dataURL)
 * body: { activityId, bookingDate? }
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { activityId, bookingDate } = req.body;

    if (!activityId) {
      return res.status(400).json({ message: "activityId é obrigatório" });
    }

    const activity = await Activity.findById(activityId);
    if (!activity) {
      return res.status(404).json({ message: "Atividade não encontrada" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Utilizador não encontrado" });
    }

    // validação “leve” (igual ao teu print) — o desconto real acontece no check-in
    if ((user.credits || 0) < (activity.creditsCost || 0)) {
      return res.status(400).json({
        message: "Créditos insuficientes",
        credits: user.credits || 0,
        cost: activity.creditsCost || 0,
      });
    }

    // Token + expiração 24h
    const checkInToken = crypto.randomBytes(32).toString("hex");
    const checkInExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const booking = await Booking.create({
      user: user._id,
      activity: activity._id,
      creditsUsed: activity.creditsCost || 0,
      bookingDate: bookingDate ? new Date(bookingDate) : new Date(),
      status: "booked",
      checkInToken,
      checkInExpiresAt,
    });

    // QR em DataURL para o client
    const qrCode = await QRCode.toDataURL(checkInToken);

    return res.status(201).json({
      message: "Reserva criada com sucesso ✅",
      booking,
      checkInToken,
      checkInExpiresAt,
      qrCode,
    });
  } catch (err) {
    return res.status(500).json({ message: "Erro ao criar reserva" });
  }
});

/**
 * POST /bookings/checkin
 * Check-in via QR (DESCONTA créditos aqui)
 * body: { token }
 */
router.post("/checkin", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token é obrigatório" });
    }

    const booking = await Booking.findOne({ checkInToken: token });
    if (!booking) {
      return res.status(404).json({ message: "Reserva não encontrada" });
    }

    // BLOQUEIO DE CHECK-IN DUPLO
    if (booking.status === "checked_in") {
      return res
        .status(400)
        .json({ message: "Reserva já foi validada (check-in já feito)" });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Reserva cancelada" });
    }

    // Token expiração
    if (!booking.checkInExpiresAt || booking.checkInExpiresAt < new Date()) {
      return res.status(400).json({ message: "Token expirado" });
    }

    const user = await User.findById(booking.user);
    if (!user) {
      return res.status(404).json({ message: "Utilizador não encontrado" });
    }

    const activity = await Activity.findById(booking.activity);
    if (!activity) {
      return res.status(404).json({ message: "Atividade não encontrada" });
    }

    const cost = booking.creditsUsed ?? activity.creditsCost ?? 0;

    // Confirma saldo no momento do check-in
    if ((user.credits || 0) < cost) {
      return res.status(400).json({
        message: "Créditos insuficientes para fazer check-in",
        credits: user.credits || 0,
        cost,
      });
    }

    // Descontar créditos
    user.credits = (user.credits || 0) - cost;
    await user.save();

    // Marcar booking como checked-in e invalidar token
    booking.status = "checked_in";
    booking.checkedInAt = new Date();
    booking.checkInToken = undefined;
    booking.checkInExpiresAt = undefined;
    await booking.save();

    return res.status(200).json({
      message: "Check-in efetuado ✅ Créditos descontados",
      booking,
      newBalance: user.credits,
      cost,
    });
  } catch (err) {
    return res.status(500).json({ message: "Erro no check-in" });
  }
});

/**
 * GET /bookings
 * Histórico de reservas do utilizador
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate("activity")
      .sort({ createdAt: -1 });

    return res.json(bookings);
  } catch (err) {
    return res.status(500).json({ message: "Erro ao buscar reservas" });
  }
});

/**
 * PATCH /bookings/:id/cancel
 * Cancelar reserva (sem refund porque ainda não descontou)
 */
router.patch("/:id/cancel", authMiddleware, async (req, res) => {
  try {
    const bookingId = req.params.id;

    const booking = await Booking.findOne({ _id: bookingId, user: req.user.id });
    if (!booking) {
      return res.status(404).json({ message: "Reserva não encontrada" });
    }

    if (booking.status === "checked_in") {
      return res.status(400).json({ message: "Check-in já feito — não pode cancelar" });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Reserva já está cancelada" });
    }

    booking.status = "cancelled";
    booking.cancelledAt = new Date();
    booking.checkInToken = undefined;
    booking.checkInExpiresAt = undefined;

    await booking.save();

    return res.json({ message: "Reserva cancelada com sucesso", booking });
  } catch (err) {
    return res.status(500).json({ message: "Erro ao cancelar reserva" });
  }
});

module.exports = router;
