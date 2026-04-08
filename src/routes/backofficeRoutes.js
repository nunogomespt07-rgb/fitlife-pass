const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const PartnerSession = require("../models/PartnerSession");

// Helper to add days
function addDays(ymd, days) {
  const d = new Date(ymd + "T12:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// POST /api/backoffice/sessions - save sessions for a partner week
router.post("/sessions", authMiddleware, async (req, res) => {
  try {
    const { partnerId, weekStartISO, sessions } = req.body;
    // Delete existing for that week
    await PartnerSession.deleteMany({
      partnerId,
      dateISO: { $gte: weekStartISO, $lt: addDays(weekStartISO, 7) }
    });
    // Insert new
    const docs = sessions.map(s => ({ ...s, partnerId }));
    await PartnerSession.insertMany(docs);
    res.json({ message: "Sessions saved" });
  } catch (e) {
    console.error("Save sessions error:", e);
    res.status(500).json({ error: e.message });
  }
});

// GET /api/backoffice/sessions - get sessions for a week (for backoffice)
router.get("/sessions", authMiddleware, async (req, res) => {
  try {
    const { partnerId, weekStartISO } = req.query;
    const sessions = await PartnerSession.find({
      partnerId,
      dateISO: { $gte: weekStartISO, $lt: addDays(weekStartISO, 7) }
    });
    res.json(sessions);
  } catch (e) {
    console.error("Get sessions error:", e);
    res.status(500).json({ error: e.message });
  }
});

// POST /api/backoffice/public-availability - save public sessions (for publish)
router.post("/public-availability", authMiddleware, async (req, res) => {
  try {
    const { sessions } = req.body;
    // Assuming sessions have partnerId
    // For simplicity, delete all and insert, but better to upsert
    // For demo, just insert
    await PartnerSession.insertMany(sessions);
    res.json({ message: "Public availability saved" });
  } catch (e) {
    console.error("Save public availability error:", e);
    res.status(500).json({ error: e.message });
  }
});

// GET /api/public-availability - public read for client
router.get("/public-availability", async (req, res) => {
  try {
    const { partnerId, minISO, maxISO } = req.query;
    if (!partnerId || !minISO || !maxISO) {
      console.error("Missing required query params", { partnerId, minISO, maxISO });
      return res.json([]);
    }
    const sessions = await PartnerSession.find({
      partnerId: { $exists: true, $eq: partnerId },
      dateISO: { $exists: true, $gte: minISO, $lte: maxISO }
    }).sort({ dateISO: 1, time: 1 });
    if (!Array.isArray(sessions)) return res.json([]);
    res.json(sessions.filter(s => s && s.partnerId && s.dateISO));
  } catch (e) {
    console.error("Get public availability error:", e);
    res.json([]);
  }
});

module.exports = router;