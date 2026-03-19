const mongoose = require("mongoose");

const creditLedgerEntrySchema = new mongoose.Schema(
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
        "PLAN_GRANT",
        "CREDIT_PURCHASE",
        "BOOKING_DEBIT",
        "BOOKING_REFUND",
        "EXPIRATION",
      ],
      required: true,
      index: true,
    },
    amount: {
      // Positive for grants/refunds, negative for debits.
      type: Number,
      required: true,
    },
    expiresAt: {
      type: Date,
      default: null,
      index: true,
    },
    relatedBookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SportBooking",
      default: null,
    },
    relatedPlan: {
      type: String,
      default: null,
      trim: true,
    },
    metadata: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CreditLedgerEntry", creditLedgerEntrySchema);

