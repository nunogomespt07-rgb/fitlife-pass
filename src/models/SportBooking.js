const mongoose = require("mongoose");

const sportBookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    activity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SportActivity",
      required: true,
      index: true,
    },
    partner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Partner",
      default: null,
      index: true,
    },
    creditsUsed: {
      type: Number,
      required: true,
    },
    bookingDate: {
      type: Date,
      default: Date.now,
    },
    /** Início agendado da atividade (cópia/imutável). */
    scheduledAt: {
      type: Date,
      default: null,
    },
    category: { type: String, default: null, trim: true },
    city: { type: String, default: null, trim: true },
    grossAmountEur: { type: Number, default: 0 },
    partnerPayoutEur: { type: Number, default: 0 },
    platformFeeEur: { type: Number, default: 0 },
    netAmountEur: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["booked", "cancelled"],
      default: "booked",
    },
    cancelledAt: { type: Date, default: null },
    cancelReason: { type: String, default: null, trim: true },
    restoredCredits: { type: Boolean, default: false },
    userSnapshot: { type: Object, default: null },
    partnerSnapshot: { type: Object, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SportBooking", sportBookingSchema);
