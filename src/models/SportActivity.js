const mongoose = require("mongoose");

const sportActivitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    sportType: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    maxParticipants: {
      type: Number,
      required: true,
      min: 1,
    },
    creditsCost: {
      type: Number,
      default: 1,
      min: 0,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    /**
     * Chave estável alinhada com o id de atividade na app (ex.: partnerId-dayOffset-slotIndex).
     * Usada quando USE_EXISTING_APP_DATA_AS_REAL e o id não é ObjectId Mongo.
     */
    appStableKey: {
      type: String,
      trim: true,
      sparse: true,
      unique: true,
    },
    /** Slug do parceiro na app (ex.: fitclub-lisboa) para reporting/admin. */
    partnerClientSlug: {
      type: String,
      default: null,
      trim: true,
      index: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("SportActivity", sportActivitySchema);

