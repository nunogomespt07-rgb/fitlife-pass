// src/app.js
const express = require("express");
const cors = require("cors");

// rotas
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/auth.routes");
const creditsRoutes = require("./routes/creditsRoutes");
const activityRoutes = require("./routes/activityRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const stripeRoutes = require("./routes/stripeRoutes");
const partnerRoutes = require("./routes/partnerRoutes");
const sportActivityRoutes = require("./routes/sportActivityRoutes");
const apiBookingRoutes = require("./routes/apiBookingRoutes");

const app = express();

// CORS – allow Vercel frontend and preflight
const allowedOrigins = [
  "https://fitlife-pass.vercel.app",
  "https://fitlife-pass-tb97.vercel.app",
  "http://localhost:3000",
];

const envOrigins = (process.env.CORS_ORIGIN || process.env.FRONTEND_URL || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const origins = [...new Set([...allowedOrigins, ...envOrigins])];

const corsOptions = {
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (origins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// health check (para testar no browser)
app.get("/", (_req, res) => {
  res.json({ ok: true, message: "API Multisport a funcionar ✅" });
});

// rotas da API
app.use("/users", userRoutes);
app.use("/auth", authRoutes);
app.use("/credits", creditsRoutes);
app.use("/activities", activityRoutes);
app.use("/api/activities", sportActivityRoutes);
app.use("/api/bookings", apiBookingRoutes);
app.use("/bookings", bookingRoutes);
app.use("/subscriptions", subscriptionRoutes);
app.use("/stripe", stripeRoutes);
app.use("/partners", partnerRoutes);

// Error handler (JSON) para evitar respostas HTML / crashes silenciosos
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error("UNHANDLED ERROR:", err);
  return res.status(500).json({
    message: "Erro interno",
    error: err?.message || String(err),
  });
});

module.exports = app;
