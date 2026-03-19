const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: false, default: null },
   credits: { type: Number, default: 20 },

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
}
  },
  { timestamps: true }
);

// ✅ Hash automático (e só aqui)
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model("User", userSchema);
