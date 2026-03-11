const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    activity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Activity",
      required: true,
    },
    creditsUsed: {
      type: Number,
      required: true,
    },
    bookingDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["booked", "cancelled", "checked_in"],
      default: "booked",
    },
    checkInToken: { type: String, unique: true, index: true },
checkInExpiresAt: { type: Date },
checkedInAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);