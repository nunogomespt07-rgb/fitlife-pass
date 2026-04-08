const mongoose = require("mongoose");

const partnerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      default: "pilates",
    },

    categorySlug: {
      type: String,
      required: true,
      default: "pilates",
    },

    categoryLabel: {
      type: String,
      required: true,
      default: "Pilates",
    },

    city: {
      type: String,
      default: "",
    },

    location: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      default: "",
    },

    image: {
      type: String,
      default: "",
    },

    images: {
      type: [String],
      default: [],
    },

    partnerType: {
      type: String,
      enum: ["gym_access", "class_booking", "court_booking"],
      default: "class_booking",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    pricing: {
      credits: {
        type: Number,
        default: 0,
      },
      price: {
        type: Number,
        default: 0,
      },
      currency: {
        type: String,
        default: "EUR",
      },
    },

    contacts: {
      phone: {
        type: String,
        default: "",
      },
      email: {
        type: String,
        default: "",
      },
      website: {
        type: String,
        default: "",
      },
    },

    payoutNotes: {
      type: String,
      default: "",
    },

    commissionRate: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.Partner || mongoose.model("Partner", partnerSchema);