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
      enum: ["subscription", "top_up", "spend", "booking"],
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

