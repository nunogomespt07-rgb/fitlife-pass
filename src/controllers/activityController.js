const mongoose = require("mongoose");
const Activity = require("../models/Activity");

// GET /activities
exports.getActivities = async (req, res) => {
  try {
    const activities = await Activity.find().sort({ createdAt: -1 });
    return res.json(activities);
  } catch (e) {
    console.error("getActivities error:", e);
    return res.status(500).json({
      message: "DEBUG-GET-ACTIVITIES-123",
      error: e?.message || String(e),
      stack: e?.stack || null,
    });
  }
};

// GET /activities/:id
exports.getActivityById = async (req, res) => {
  try {
    const { id } = req.params;

    // validar ObjectId (evita CastError)
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const activity = await Activity.findById(id);

    if (!activity) {
      return res.status(404).json({ message: "Activity não encontrada" });
    }

    return res.json(activity);
  } catch (e) {
    console.error("getActivityById error:", e);
    return res.status(500).json({
      message: "DEBUG-GET-ACTIVITYBYID-123",
      error: e?.message || String(e),
      stack: e?.stack || null,
    });
  }
};