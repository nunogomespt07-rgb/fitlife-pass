const mongoose = require("mongoose");
const SportActivity = require("../models/SportActivity");
const SportBooking = require("../models/SportBooking");
const User = require("../models/User");

exports.createBooking = async (req, res) => {
  try {
    const userId = req.userId;
    const { activityId } = req.body || {};

    if (!activityId) {
      return res.status(400).json({ message: "activityId é obrigatório" });
    }

    if (!mongoose.Types.ObjectId.isValid(activityId)) {
      return res.status(400).json({ message: "activityId inválido" });
    }

    const activity = await SportActivity.findById(activityId);
    if (!activity) {
      return res.status(404).json({ message: "Atividade não encontrada" });
    }

    const participantsCount = activity.participants ? activity.participants.length : 0;
    if (participantsCount >= activity.maxParticipants) {
      return res.status(400).json({
        message: "Não há vagas disponíveis para esta atividade",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilizador não encontrado" });
    }

    const creditCost = activity.creditsCost != null ? activity.creditsCost : 1;
    const userCredits = user.credits != null ? user.credits : 0;

    if (userCredits < creditCost) {
      return res.status(400).json({
        message: "Créditos insuficientes",
        credits: userCredits,
        required: creditCost,
      });
    }

    const isAlreadyParticipant = activity.participants.some(
      (p) => p.toString() === userId.toString()
    );
    if (isAlreadyParticipant) {
      return res.status(400).json({
        message: "Já tens uma reserva para esta atividade",
      });
    }

    user.credits = userCredits - creditCost;
    await user.save();

    await SportBooking.create({
      user: userId,
      activity: activityId,
      creditsUsed: creditCost,
      status: "booked",
    });

    activity.participants.push(userId);
    await activity.save();

    return res.status(201).json({
      message: "Reserva confirmada",
      remainingCredits: user.credits,
    });
  } catch (err) {
    console.error("createBooking error:", err);
    return res.status(500).json({
      message: "Erro ao criar reserva",
      error: err?.message || String(err),
    });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const userId = req.userId;

    // Histórico completo de reservas do utilizador (booked + cancelled),
    // ordenado por data de reserva mais recente primeiro.
    const bookings = await SportBooking.find({ user: userId })
      .populate("activity")
      .sort({ bookingDate: -1 });

    return res.json(bookings);
  } catch (err) {
    console.error("getMyBookings error:", err);
    return res.status(500).json({
      message: "Erro ao buscar reservas",
      error: err?.message || String(err),
    });
  }
};

/**
 * DELETE /api/bookings/:bookingId
 * Cancel a booking: remove booking, remove user from activity participants, restore credits.
 */
exports.cancelBooking = async (req, res) => {
  try {
    const userId = req.userId;
    const { bookingId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ message: "ID de reserva inválido" });
    }

    const booking = await SportBooking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Reserva não encontrada" });
    }

    if (booking.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Não tens permissão para cancelar esta reserva" });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Reserva já está cancelada" });
    }

    const activity = await SportActivity.findById(booking.activity);
    if (activity && activity.participants && activity.participants.length > 0) {
      activity.participants = activity.participants.filter(
        (p) => p.toString() !== userId.toString()
      );
      await activity.save();
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilizador não encontrado" });
    }

    const restoredCredits = booking.creditsUsed || 0;
    user.credits = (user.credits != null ? user.credits : 0) + restoredCredits;
    await user.save();

    await SportBooking.findByIdAndDelete(bookingId);

    return res.json({
      message: "Reserva cancelada com sucesso",
      restoredCredits,
      remainingCredits: user.credits,
    });
  } catch (err) {
    console.error("cancelBooking error:", err);
    return res.status(500).json({
      message: "Erro ao cancelar reserva",
      error: err?.message || String(err),
    });
  }
};
