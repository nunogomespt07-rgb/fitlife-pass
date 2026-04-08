const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    // OBRIGATÓRIOS
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true }, // derivado de firstName + lastName
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    birthDate: { type: String, required: true, trim: true },

    // OPCIONAIS
    phoneCountryCode: {
      type: String,
      enum: ["+351", "+34", "+33", "+44", "+39", "+49", "+1", "+55", null],
      default: null,
      trim: true,
    },
    phone: { type: String, default: null, trim: true },
    country: {
      type: String,
      enum: [
        "Portugal",
        "Espanha",
        "França",
        "Reino Unido",
        "Itália",
        "Alemanha",
        "Brasil",
        "Estados Unidos",
        null
      ],
      default: null,
      trim: true,
    },
    address: { type: String, default: null, trim: true },
    city: { type: String, default: null, trim: true },
    postalCode: { type: String, default: null, trim: true },
    documentId: { type: String, default: null, trim: true },
    gender: {
      type: String,
      enum: ["Masculino", "Feminino", "Indefinido", null],
      default: null,
      trim: true,
    },
    fitnessGoal: {
      type: String,
      enum: [
        "Perder peso",
        "Ganhar massa muscular",
        "Manter forma",
        "Melhorar condição física",
        "Reabilitação",
        "Bem-estar",
        "Performance",
        null
      ],
      default: null,
      trim: true,
    },

    // CAMPOS EXISTENTES (NÃO ALTERAR)
    password: { type: String, required: false, default: null },
    credits: { type: Number, default: 0 },
    creditsPeriodKey: { type: String, default: null },
    cancellationMonthKey: { type: String, default: null },
    monthlyCancellationCount: { type: Number, default: 0 },
    plan: {
      type: String,
      enum: ["START", "CORE", "PRO", null],
      default: null,
    },
    planStatus: {
      type: String,
      enum: ["active", "canceled", null],
      default: null,
    },
    planRenewAt: {
      type: Date,
      default: null,
    },
    image: { type: String, default: null },
    provider: { type: String, default: null, trim: true },
    interests: { type: [String], default: [] },
  },
  { timestamps: true }
);


// Derivar name de firstName + lastName se necessário
userSchema.pre("save", async function () {
  if (this.firstName && this.lastName) {
    this.name = `${this.firstName} ${this.lastName}`.trim();
  }
  // Retrocompatibilidade: se não houver firstName/lastName mas houver name, tenta derivar
  if ((!this.firstName || !this.lastName) && this.name) {
    const parts = this.name.split(" ");
    if (!this.firstName) this.firstName = parts[0] || null;
    if (!this.lastName) this.lastName = parts.slice(1).join(" ") || null;
  }
  if (!this.isModified("password") || !this.password) return;
  // Evitar duplo hash se a password já for bcrypt (ex.: migração)
  if (String(this.password).startsWith("$2")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model("User", userSchema);
