const mongoose = require("mongoose");
const SportActivity = require("../models/SportActivity");
const SportBooking = require("../models/SportBooking");
const User = require("../models/User");
const monthlyCreditsService = require("../services/monthlyCreditsService");
const { useExistingAppDataAsReal } = require("../config/integration");
const {
  debitForBookingInSession,
  refundForCancelledBookingInSession,
} = require("../services/bookingCreditService");

const TWELVE_H_MS = 12 * 60 * 60 * 1000;
const FIVE_MIN_MS = 5 * 60 * 1000;
const MAX_CANCELLATIONS_PER_MONTH = 3;
const MAX_BOOKINGS_PER_DAY = 2;

function sameCalendarDay(a, b) {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

/** Valores financeiros placeholder até existir tabela de preços por crédito. */
function financeFromCredits(creditCost) {
  const c = Math.max(0, Number(creditCost) || 0);
  return {
    grossAmountEur: c,
    partnerPayoutEur: 0,
    platformFeeEur: 0,
    netAmountEur: c,
  };
}

function combineDateTime(dateISO, timeHM) {
  const parts = String(dateISO || "").trim().split("-");
  if (parts.length !== 3) return new Date(NaN);
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const d = parseInt(parts[2], 10);
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) {
    return new Date(NaN);
  }
  const tm = String(timeHM || "12:00").split(":");
  const hh = parseInt(tm[0], 10) || 0;
  const mm = parseInt(tm[1], 10) || 0;
  return new Date(y, m - 1, d, hh, mm, 0, 0);
}

/**
 * Resolve ObjectId Mongo OU (modo integração) appStableKey + criação lazy com activitySnapshot.
 */
async function resolveSportActivityId(body, session) {
  const useIntegration = useExistingAppDataAsReal();
  const { activityId, activitySnapshot } = body || {};
  const idStr = String(activityId || "").trim();

  if (!idStr) {
    return null;
  }

  if (mongoose.Types.ObjectId.isValid(idStr) && idStr.length === 24) {
    const existing = await SportActivity.findById(idStr).session(session);
    return existing ? idStr : null;
  }

  if (!useIntegration) {
    return null;
  }

  const key = idStr;
  let found = await SportActivity.findOne({ appStableKey: key }).session(session);
  if (found) {
    return String(found._id);
  }

  if (!activitySnapshot || typeof activitySnapshot !== "object") {
    const err = new Error("SNAPSHOT_REQUIRED");
    err.code = "SNAPSHOT_REQUIRED";
    throw err;
  }

  const snapKey = String(activitySnapshot.appStableKey || "").trim();
  if (snapKey !== key) {
    const err = new Error("SNAPSHOT_KEY_MISMATCH");
    err.code = "SNAPSHOT_KEY_MISMATCH";
    throw err;
  }

  const creatorId = (process.env.INTEGRATION_ACTIVITY_CREATOR_USER_ID || "").trim();
  if (!creatorId || !mongoose.Types.ObjectId.isValid(creatorId)) {
    const err = new Error("CREATOR_NOT_CONFIGURED");
    err.code = "CREATOR_NOT_CONFIGURED";
    throw err;
  }

  const creatorUser = await User.findById(creatorId).session(session);
  if (!creatorUser) {
    const err = new Error("CREATOR_NOT_FOUND");
    err.code = "CREATOR_NOT_FOUND";
    throw err;
  }

  const dateISO = String(activitySnapshot.dateISO || "").trim();
  const timeHM = String(activitySnapshot.time || "12:00").trim();
  const scheduledDate = combineDateTime(dateISO, timeHM);
  if (Number.isNaN(scheduledDate.getTime())) {
    const err = new Error("INVALID_DATE");
    err.code = "INVALID_DATE";
    throw err;
  }

  const maxParticipants = Math.max(1, Math.floor(Number(activitySnapshot.maxParticipants) || 1));
  const creditsCost = Math.max(0, Math.floor(Number(activitySnapshot.creditsCost) ?? 0));

  const doc = {
    title: String(activitySnapshot.title || "Atividade").slice(0, 200),
    sportType: String(activitySnapshot.sportType || "geral").slice(0, 200),
    location: String(activitySnapshot.location || "").slice(0, 500),
    date: scheduledDate,
    maxParticipants,
    creditsCost,
    creator: creatorId,
    participants: [],
    appStableKey: key,
    partnerClientSlug: activitySnapshot.partnerClientSlug
      ? String(activitySnapshot.partnerClientSlug).slice(0, 80)
      : null,
  };

  try {
    const [created] = await SportActivity.create([doc], { session });
    return String(created._id);
  } catch (e) {
    if (e && e.code === 11000) {
      const again = await SportActivity.findOne({ appStableKey: key }).session(session);
      return again ? String(again._id) : null;
    }
    throw e;
  }
}

exports.createBooking = async (req, res) => {
  const userId = req.userId;
  const body = req.body || {};
  const { activityId } = body;

  if (!activityId) {
    return res.status(400).json({ message: "activityId é obrigatório" });
  }

  const idStrEarly = String(activityId).trim();
  const looksMongo =
    mongoose.Types.ObjectId.isValid(idStrEarly) && idStrEarly.length === 24;
  if (!looksMongo && !useExistingAppDataAsReal()) {
    return res.status(400).json({
      message:
        "activityId inválido. Ativa USE_EXISTING_APP_DATA_AS_REAL no servidor para reservar atividades do catálogo atual.",
    });
  }

  try {
    await monthlyCreditsService.applyMonthlyCreditsResetIfNeeded(userId);

    const session = await mongoose.startSession();
    try {
      let bookingIdForResponse = null;
      let debitMeta = null;
      let resolvedActivityId = null;
      /**
       * Transação atómica (ordem):
       * 1) resolver atividade (Mongo id ou modo integração + appStableKey)
       * 2) validar atividade / vagas / limite dia
       * 3) validar utilizador e saldo >= custo (antes de criar documentos)
       * 4) criar SportBooking
       * 5) debitar créditos + CreditTransaction (BOOKING_DEBIT)
       * 6) atualizar participantes na atividade
       */
      await session.withTransaction(async () => {
        resolvedActivityId = await resolveSportActivityId(body, session);
        if (!resolvedActivityId) {
          const err = new Error("ACTIVITY_NOT_FOUND");
          err.code = "ACTIVITY_NOT_FOUND";
          throw err;
        }

        const activity = await SportActivity.findById(resolvedActivityId).session(session);
        if (!activity) {
          const err = new Error("ACTIVITY_NOT_FOUND");
          err.code = "ACTIVITY_NOT_FOUND";
          throw err;
        }

        const participantsCount = activity.participants ? activity.participants.length : 0;
        if (participantsCount >= activity.maxParticipants) {
          const err = new Error("NO_SLOTS");
          err.code = "NO_SLOTS";
          throw err;
        }

        const isAlreadyParticipant = activity.participants.some(
          (p) => p.toString() === userId.toString()
        );
        if (isAlreadyParticipant) {
          const err = new Error("ALREADY_BOOKED");
          err.code = "ALREADY_BOOKED";
          throw err;
        }

        const creditCost = activity.creditsCost != null ? activity.creditsCost : 1;

        const existingBookings = await SportBooking.find({
          user: userId,
          status: "booked",
        })
          .session(session)
          .populate("activity");

        const dayCount = existingBookings.filter((b) => {
          const act = b.activity;
          if (!act || !act.date) return false;
          return sameCalendarDay(act.date, activity.date);
        }).length;

        if (dayCount >= MAX_BOOKINGS_PER_DAY) {
          const err = new Error("DAY_LIMIT");
          err.code = "DAY_LIMIT";
          throw err;
        }

        const userForBalance = await User.findById(userId).session(session);
        if (!userForBalance) {
          const err = new Error("USER_NOT_FOUND");
          err.code = "USER_NOT_FOUND";
          throw err;
        }
        const balanceBeforeCheck = Math.max(
          0,
          Math.floor(userForBalance.credits != null ? userForBalance.credits : 0)
        );
        if (creditCost > 0 && balanceBeforeCheck < creditCost) {
          const err = new Error("INSUFFICIENT_CREDITS");
          err.code = "INSUFFICIENT_CREDITS";
          err.credits = balanceBeforeCheck;
          err.required = creditCost;
          throw err;
        }

        const fin = financeFromCredits(creditCost);
        const userRow = await User.findById(userId).session(session).select("name email");
        const [booking] = await SportBooking.create(
          [
            {
              user: userId,
              activity: resolvedActivityId,
              partner: null,
              creditsUsed: creditCost,
              scheduledAt: activity.date,
              category: activity.sportType || null,
              city: activity.location || null,
              grossAmountEur: fin.grossAmountEur,
              partnerPayoutEur: fin.partnerPayoutEur,
              platformFeeEur: fin.platformFeeEur,
              netAmountEur: fin.netAmountEur,
              status: "booked",
              userSnapshot: userRow ? { name: userRow.name, email: userRow.email } : null,
            },
          ],
          { session }
        );

        bookingIdForResponse = booking._id;

        if (creditCost > 0) {
          const debitResult = await debitForBookingInSession(
            session,
            userId,
            creditCost,
            booking._id,
            { activityId: String(resolvedActivityId) }
          );
          debitMeta = {
            userId: String(userId),
            creditsBefore: debitResult.creditsBefore,
            creditsAfter: debitResult.creditsAfter,
            debited: debitResult.debited,
          };
        } else {
          debitMeta = {
            userId: String(userId),
            creditsBefore: balanceBeforeCheck,
            creditsAfter: balanceBeforeCheck,
            debited: 0,
          };
        }

        activity.participants.push(userId);
        await activity.save({ session });
      });

      const reservation =
        bookingIdForResponse != null
          ? await SportBooking.findById(bookingIdForResponse).populate("activity").lean()
          : null;

      return res.status(201).json({
        success: true,
        message: "Reserva confirmada",
        booking: reservation,
        creditsBefore: debitMeta?.creditsBefore,
        debited: debitMeta?.debited ?? 0,
        creditsAfter: debitMeta?.creditsAfter,
        credits: debitMeta?.creditsAfter,
        remainingCredits: debitMeta?.creditsAfter,
        user: {
          id: String(userId),
          credits: debitMeta?.creditsAfter,
        },
        reservation,
        wallet: debitMeta,
      });
    } finally {
      session.endSession();
    }
  } catch (err) {
    console.error("createBooking error:", err);
    if (err?.code === "SNAPSHOT_REQUIRED") {
      return res.status(400).json({
        message:
          "Para esta atividade é necessário o snapshot (activitySnapshot). Recarrega a página ou contacta o suporte.",
      });
    }
    if (err?.code === "SNAPSHOT_KEY_MISMATCH") {
      return res.status(400).json({ message: "Dados da atividade inconsistentes (appStableKey)." });
    }
    if (err?.code === "CREATOR_NOT_CONFIGURED") {
      return res.status(503).json({
        message:
          "Servidor sem INTEGRATION_ACTIVITY_CREATOR_USER_ID (ObjectId de utilizador válido no Mongo).",
      });
    }
    if (err?.code === "CREATOR_NOT_FOUND") {
      return res.status(503).json({
        message: "INTEGRATION_ACTIVITY_CREATOR_USER_ID não corresponde a um utilizador existente.",
      });
    }
    if (err?.code === "INVALID_DATE") {
      return res.status(400).json({ message: "Data ou hora da atividade inválida." });
    }
    if (err?.code === "ACTIVITY_NOT_FOUND") {
      return res.status(404).json({ message: "Atividade não encontrada" });
    }
    if (err?.code === "NO_SLOTS") {
      return res.status(400).json({
        message: "Não há vagas disponíveis para esta atividade",
      });
    }
    if (err?.code === "ALREADY_BOOKED") {
      return res.status(400).json({
        message: "Já tens uma reserva para esta atividade",
      });
    }
    if (err?.code === "DAY_LIMIT") {
      return res.status(400).json({
        message: `Limite de ${MAX_BOOKINGS_PER_DAY} reservas por dia atingido.`,
      });
    }
    if (err?.code === "INSUFFICIENT_CREDITS") {
      return res.status(400).json({
        message: "Créditos insuficientes",
        credits: err.credits,
        required: err.required,
      });
    }
    if (err?.code === "USER_NOT_FOUND") {
      return res.status(404).json({ message: "Utilizador não encontrado" });
    }
    return res.status(500).json({
      message: "Erro ao criar reserva",
      error: err?.message || String(err),
    });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const userId = req.userId;

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
 * Cancelamento: regras de tempo, máx. 3/mês; soft cancel (status cancelled).
 */
exports.cancelBooking = async (req, res) => {
  try {
    const userId = req.userId;
    const { bookingId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ message: "ID de reserva inválido" });
    }

    await monthlyCreditsService.applyMonthlyCreditsResetIfNeeded(userId);

    const booking = await SportBooking.findById(bookingId).populate("activity");
    if (!booking) {
      return res.status(404).json({ message: "Reserva não encontrada" });
    }

    if (booking.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Não tens permissão para cancelar esta reserva" });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Reserva já está cancelada" });
    }

    const rawAct = booking.activity;
    const activity =
      rawAct && typeof rawAct === "object" && "date" in rawAct
        ? rawAct
        : await SportActivity.findById(rawAct);

    const now = new Date();
    const activityStart = activity && activity.date ? new Date(activity.date) : null;
    const createdAt = booking.createdAt ? new Date(booking.createdAt) : now;

    const msUntilStart = activityStart ? activityStart.getTime() - now.getTime() : 0;
    const msSinceBooking = now.getTime() - createdAt.getTime();

    const withinGraceWindow = msSinceBooking <= FIVE_MIN_MS;
    const atLeast12hBeforeStart = activityStart ? msUntilStart >= TWELVE_H_MS : false;

    if (!withinGraceWindow && !atLeast12hBeforeStart) {
      return res.status(400).json({
        message:
          "Cancelamento só é permitido até 12h antes do início da aula ou nos 5 minutos após a marcação.",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilizador não encontrado" });
    }

    const monthKey = monthlyCreditsService.getMonthKey();
    if (user.cancellationMonthKey !== monthKey) {
      user.cancellationMonthKey = monthKey;
      user.monthlyCancellationCount = 0;
      await user.save();
    }

    if (user.monthlyCancellationCount >= MAX_CANCELLATIONS_PER_MONTH) {
      return res.status(400).json({
        message: `Atingiste o limite de ${MAX_CANCELLATIONS_PER_MONTH} cancelamentos neste mês.`,
      });
    }

    const restoredCredits = booking.creditsUsed || 0;
    const session = await mongoose.startSession();

    let remainingCredits = 0;
    let refundWallet = {
      creditsBefore: 0,
      creditsAfter: 0,
      restored: 0,
    };
    try {
      await session.withTransaction(async () => {
        const b = await SportBooking.findById(bookingId).session(session);
        if (!b || b.status === "cancelled") {
          const err = new Error("ALREADY_CANCELLED");
          err.code = "ALREADY_CANCELLED";
          throw err;
        }

        const act = await SportActivity.findById(b.activity).session(session);
        if (act && act.participants && act.participants.length > 0) {
          act.participants = act.participants.filter((p) => p.toString() !== userId.toString());
          await act.save({ session });
        }

        refundWallet = await refundForCancelledBookingInSession(
          session,
          userId,
          restoredCredits,
          bookingId
        );

        const u2 = await User.findById(userId).session(session);
        if (u2) {
          u2.monthlyCancellationCount = (u2.monthlyCancellationCount || 0) + 1;
          await u2.save({ session });
          remainingCredits = u2.credits;
        }

        b.status = "cancelled";
        b.cancelledAt = now;
        b.restoredCredits = restoredCredits > 0;
        await b.save({ session });
      });
    } finally {
      session.endSession();
    }

    return res.json({
      success: true,
      message: "Reserva cancelada com sucesso",
      restoredCredits,
      credits: remainingCredits,
      remainingCredits,
      user: {
        id: String(userId),
        credits: remainingCredits,
      },
      creditsBefore: refundWallet.creditsBefore,
      creditsAfter: remainingCredits,
      wallet: {
        creditsBefore: refundWallet.creditsBefore,
        creditsAfter: remainingCredits,
        debited: 0,
        restored: refundWallet.restored,
      },
    });
  } catch (err) {
    console.error("cancelBooking error:", err);
    if (err?.code === "ALREADY_CANCELLED") {
      return res.status(400).json({ message: "Reserva já está cancelada" });
    }
    return res.status(500).json({
      message: "Erro ao cancelar reserva",
      error: err?.message || String(err),
    });
  }
};
