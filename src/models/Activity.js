const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true }, // gym, yoga, padel, crossfit...
    creditsCost: { type: Number, required: true, min: 1 },

    city: { type: String, required: true, trim: true },
    address: { type: String, trim: true },

    // mais tarde: coordenadas p/ "perto de mim"
    lat: { type: Number },
    lng: { type: Number },

    partnerName: { type: String, trim: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Activity", activitySchema);