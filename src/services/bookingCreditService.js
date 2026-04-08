/**
 * Débito/reposição de créditos para reservas (SportBooking).
 * As funções com sufixo InSession devem ser chamadas dentro de session.withTransaction.
 */
const User = require("../models/User");
const CreditTransaction = require("../models/CreditTransaction");

async function debitForBookingInSession(session, userId, creditCost, bookingId, extraMeta = {}) {
  const cost = Math.max(0, Math.floor(Number(creditCost) || 0));
  if (cost <= 0) throw new Error("INVALID_DEBIT_AMOUNT");

  const user = await User.findById(userId).session(session);
  if (!user) throw new Error("USER_NOT_FOUND");
  const balanceBefore = Math.max(0, Math.floor(user.credits != null ? user.credits : 0));
  if (balanceBefore < cost) {
    const err = new Error("INSUFFICIENT_CREDITS");
    err.code = "INSUFFICIENT_CREDITS";
    err.credits = balanceBefore;
    err.required = cost;
    throw err;
  }
  user.credits = balanceBefore - cost;
  await user.save({ session });

  await CreditTransaction.create(
    [
      {
        user: user._id,
        type: "BOOKING_DEBIT",
        amount: -cost,
        balanceBefore,
        balanceAfter: user.credits,
        description: "Débito por reserva de atividade",
        meta: {
          reservationId: String(bookingId),
          ...extraMeta,
        },
        booking: bookingId,
      },
    ],
    { session }
  );
  return {
    user,
    creditsBefore: balanceBefore,
    creditsAfter: user.credits,
    debited: cost,
  };
}

async function refundForCancelledBookingInSession(session, userId, creditAmount, bookingId) {
  const amt = Math.max(0, Math.floor(Number(creditAmount) || 0));
  if (amt <= 0) {
    const user = await User.findById(userId).session(session);
    const bal = user ? Math.max(0, Math.floor(user.credits != null ? user.credits : 0)) : 0;
    return {
      creditsBefore: bal,
      creditsAfter: bal,
      restored: 0,
    };
  }

  const user = await User.findById(userId).session(session);
  if (!user) throw new Error("USER_NOT_FOUND");
  const balanceBefore = Math.max(0, Math.floor(user.credits != null ? user.credits : 0));
  user.credits = balanceBefore + amt;
  await user.save({ session });

  await CreditTransaction.create(
    [
      {
        user: user._id,
        type: "BOOKING_REFUND",
        amount: amt,
        balanceBefore,
        balanceAfter: user.credits,
        description: "Reposição por cancelamento de reserva",
        meta: { reservationId: String(bookingId) },
        booking: bookingId,
      },
    ],
    { session }
  );
  return {
    creditsBefore: balanceBefore,
    creditsAfter: user.credits,
    restored: amt,
  };
}

module.exports = {
  debitForBookingInSession,
  refundForCancelledBookingInSession,
};
