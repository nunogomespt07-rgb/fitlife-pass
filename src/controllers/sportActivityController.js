const mongoose = require("mongoose");
const SportActivity = require("../models/SportActivity");

// POST /api/activities
exports.createActivity = async (req, res) => {
  try {
    const userId = req.userId;

    const { title, sportType, location, date, maxParticipants } = req.body || {};

    if (!title || !sportType || !location || !date || !maxParticipants) {
      return res.status(400).json({
        message:
          "Faltam campos obrigatórios: title, sportType, location, date, maxParticipants",
      });
    }

    const parsedDate = new Date(date);
    const max = Number(maxParticipants);

    if (!Number.isFinite(parsedDate.getTime())) {
      return res.status(400).json({ message: "date inválida" });
    }

    if (!Number.isFinite(max) || max < 1) {
      return res
        .status(400)
        .json({ message: "maxParticipants tem de ser >= 1" });
    }

    const activity = await SportActivity.create({
      title: title.trim(),
      sportType: sportType.trim(),
      location: location.trim(),
      date: parsedDate,
      maxParticipants: max,
      creator: userId,
      participants: [userId],
    });

    return res.status(201).json(activity);
  } catch (err) {
    console.error("createActivity error:", err);
    return res.status(500).json({
      message: "Erro ao criar atividade",
      error: err?.message || String(err),
    });
  }
};

// GET /api/activities
exports.getActivities = async (_req, res) => {
  try {
    const activities = await SportActivity.find()
      .populate("creator", "name email")
      .populate("participants", "name email")
      .sort({ date: 1, createdAt: -1 });

    return res.json(activities);
  } catch (err) {
    console.error("getActivities error:", err);
    return res.status(500).json({
      message: "Erro ao listar atividades",
      error: err?.message || String(err),
    });
  }
};

// GET /api/activities/:id
exports.getActivityById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const activity = await SportActivity.findById(id)
      .populate("creator", "name email")
      .populate("participants", "name email");

    if (!activity) {
      return res.status(404).json({ message: "Atividade não encontrada" });
    }

    return res.json(activity);
  } catch (err) {
    console.error("getActivityById error:", err);
    return res.status(500).json({
      message: "Erro ao obter atividade",
      error: err?.message || String(err),
    });
  }
};

// POST /api/activities/:id/join
exports.joinActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const activity = await SportActivity.findById(id);
    if (!activity) {
      return res.status(404).json({ message: "Atividade não encontrada" });
    }

    const alreadyParticipant = activity.participants.some(
      (p) => p.toString() === userId.toString()
    );
    if (alreadyParticipant) {
      return res
        .status(400)
        .json({ message: "Já estás inscrito nesta atividade" });
    }

    if (activity.participants.length >= activity.maxParticipants) {
      return res
        .status(400)
        .json({ message: "Limite de participantes atingido" });
    }

    activity.participants.push(userId);
    await activity.save();

    const populated = await activity
      .populate("creator", "name email")
      .populate("participants", "name email");

    return res.status(200).json(populated);
  } catch (err) {
    console.error("joinActivity error:", err);
    return res.status(500).json({
      message: "Erro ao juntar-te à atividade",
      error: err?.message || String(err),
    });
  }
};

