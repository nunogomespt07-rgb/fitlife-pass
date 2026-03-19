const mongoose = require("mongoose");

const creditTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        // Legacy/compat
        "subscription",
        "top_up",
        "spend",
        "booking",
        "plan_grant",
        "credit_purchase",
        "booking_debit",
        "booking_refund",
        "credit_expiry",
        "manual_adjustment",
        // New ledger types (creditLedgerService)
        "PLAN_GRANT",
        "CREDIT_PURCHASE",
        "BOOKING_DEBIT",
        "BOOKING_REFUND",
        "EXPIRATION",
      ],
      required: true,
    },
    amount: {
      // positivo para entradas, negativo para saídas
      type: Number,
      required: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    // For grant-like movements, tracks how many credits are still available in this lot.
    remaining: {
      type: Number,
      default: 0,
    },
    // 30-day expiration for granted/purchased/refunded credits.
    expiresAt: {
      type: Date,
      default: null,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    meta: {
      type: Object,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CreditTransaction", creditTransactionSchema);

