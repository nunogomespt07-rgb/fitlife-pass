const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, trim: true, default: null },
    lastName: { type: String, trim: true, default: null },
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
      enum: ["START", "CORE", "PRO", null],
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
    country: { type: String, trim: true, default: null },
    city: { type: String, trim: true, default: null },
    phone: { type: String, trim: true, default: null },
    address: { type: String, trim: true, default: null },
    postalCode: { type: String, trim: true, default: null },
    dateOfBirth: { type: String, trim: true, default: null },
    nif: { type: String, trim: true, default: null },
    fitnessGoal: { type: String, trim: true, default: null },
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
