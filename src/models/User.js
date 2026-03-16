const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    credits: { type: Number, default: 0 },

    // Subscrição simples: um plano por utilizador
    plan: {
      type: String,
      enum: ["basic", "premium", null],
      default: null,
    },
    planStatus: {
      type: String,
      enum: ["active", "cancelled", null],
      default: null,
    },
    planRenewAt: {
      type: Date,
    },
    stripeCustomerId: {
      type: String,
    },
    stripeSubscriptionId: {
      type: String,
    },
  },
  { timestamps: true }
);

// Sem pre-save de password: o hash é feito apenas no authController (register)
// para garantir que register e login usam a mesma lógica bcryptjs.

module.exports = mongoose.model("User", userSchema);
