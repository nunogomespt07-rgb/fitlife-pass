const mongoose = require("mongoose");

const partnerSessionSchema = new mongoose.Schema(
  {
    partnerId: { type: String, required: true },
    activityId: { type: String }, // real backend _id
    name: { type: String, required: true },
    dateISO: { type: String, required: true },
    time: { type: String, required: true },
    durationMinutes: { type: Number, required: true },
    credits: { type: Number, required: true },
    fitlifeSlots: { type: Number, required: true },
    location: { type: String },
    professionalName: { type: String },
    specialties: { type: [String] },
    publicDescription: { type: String },
    peakLabel: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PartnerSession", partnerSessionSchema);