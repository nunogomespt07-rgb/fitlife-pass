// src/app.js

const express = require("express");
const cors = require("cors");

const app = express();

// models
const Partner = require("./models/Partner");

// routes
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/auth.routes");
const creditsRoutes = require("./routes/creditsRoutes");
const activityRoutes = require("./routes/activityRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const stripeRoutes = require("./routes/stripeRoutes");
const partnerRoutes = require("./routes/partnerRoutes");
// sportActivityRoutes removed
const apiBookingRoutes = require("./routes/apiBookingRoutes");
const backofficeRoutes = require("./routes/backofficeRoutes");
const adminCustomersRoutes = require("./routes/adminCustomersRoutes");
const adminPartnersRoutes = require("./routes/adminPartnersRoutes");
const adminReservationsRoutes = require("./routes/adminReservationsRoutes");

// middlewares
const authMiddleware = require("./middlewares/authMiddleware");
const adminInternalMiddleware = require("./middlewares/adminInternalMiddleware");

// controllers
const apiBookingController = require("./controllers/apiBookingController");

// -------------------------
// CORS
// -------------------------
const allowedOrigins = [
  "http://localhost:3000",
  "https://fitlife-pass.vercel.app",
  "https://fitlife-pass-tb97.vercel.app",
];

const envOrigins = (process.env.CORS_ORIGIN || process.env.FRONTEND_URL || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const origins = [...new Set([...allowedOrigins, ...envOrigins])];

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (origins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// -------------------------
// Health check
// -------------------------
app.get("/", (_req, res) => {
  res.json({ ok: true, message: "API Multisport a funcionar ✅" });
});

// -------------------------
// Main API routes
// -------------------------
app.use("/users", userRoutes);

// alias compatibility
app.use("/api", userRoutes);
app.use("/user", userRoutes);

app.use("/auth", authRoutes);
app.use("/credits", creditsRoutes);
app.use("/activities", activityRoutes);
// Only activityRoutes is used for activities

app.use("/api/bookings", apiBookingRoutes);

// alias create reservation


// admin / backoffice
app.use(
  "/admin/customers",
  adminInternalMiddleware,
  adminCustomersRoutes
);

app.use(
  "/admin/partners",
  adminInternalMiddleware,
  adminPartnersRoutes
);

app.use(
  "/admin/reservations",
  adminInternalMiddleware,
  adminReservationsRoutes
);

app.use("/api/backoffice", backofficeRoutes);

// legacy / direct routes
app.use("/bookings", bookingRoutes);
app.use("/subscriptions", subscriptionRoutes);
app.use("/stripe", stripeRoutes);
app.use("/partners", partnerRoutes);

// -------------------------
// GET /api/partners
// Returns real MongoDB partners
// Seeds demo data only if empty
// -------------------------
app.get("/api/partners", async (_req, res) => {
  try {
    let partners = await Partner.find({}).lean();

    if (!Array.isArray(partners)) {
      partners = [];
    }

    if (partners.length === 0) {
      const seed = [
        {
          name: "Pilates Studio Lisboa",
          slug: "pilates-lisboa",
          category: "pilates",
          categorySlug: "pilates",
          categoryLabel: "Pilates",
          image: "/images/pilates.jpg",
          images: [],
          description: "Estúdio de pilates no centro de Lisboa.",
          location: "Lisboa",
          city: "Lisboa",
          partnerType: "class_booking",
          isActive: true,
          status: "active",
        },
        {
          name: "Crossfit Porto",
          slug: "crossfit-porto",
          category: "crossfit",
          categorySlug: "crossfit",
          categoryLabel: "Crossfit",
          image: "/images/crossfit.jpg",
          images: [],
          description: "Box de crossfit no Porto.",
          location: "Porto",
          city: "Porto",
          partnerType: "class_booking",
          isActive: true,
          status: "active",
        },
        {
          name: "Padel Club Lisboa",
          slug: "padel-lisboa",
          category: "padel",
          categorySlug: "padel",
          categoryLabel: "Padel",
          image: "/images/padel.jpg",
          images: [],
          description: "Clube de padel em Lisboa.",
          location: "Lisboa",
          city: "Lisboa",
          partnerType: "court_booking",
          isActive: true,
          status: "active",
        },
      ];

      await Partner.insertMany(seed);
      partners = await Partner.find({}).lean();
    }

    return res.json(partners);
  } catch (err) {
    console.error("Error fetching /api/partners:", err);
    return res.status(500).json({
      message: "Erro ao obter parceiros",
      error: err?.message || String(err),
    });
  }
});

// -------------------------
// JSON error handler
// -------------------------
app.use((err, _req, res, _next) => {
  console.error("UNHANDLED ERROR:", err);

  const isProd = process.env.NODE_ENV === "production";

  return res.status(500).json(
    isProd
      ? { message: "Erro interno" }
      : { message: "Erro interno", error: err?.message || String(err) }
  );
});

module.exports = app;