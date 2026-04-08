const Partner = require("../models/Partner");
// const SportBooking = require("../models/SportBooking");
// const SportActivity = require("../models/SportActivity");











// GET /admin/partners
exports.listPartners = async (req, res) => {
  try {
    const partners = await Partner.find({});
    res.json(partners);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /admin/partners/:id
exports.getPartner = async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id);
    if (!partner) return res.status(404).json({ error: "Partner not found" });
    res.json(partner);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /admin/partners
exports.createPartner = async (req, res) => {
  try {
    const partner = new Partner(req.body);
    await partner.save();
    res.status(201).json(partner);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PUT /admin/partners/:id
exports.updatePartner = async (req, res) => {
  try {
    const partner = await Partner.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!partner) return res.status(404).json({ error: "Partner not found" });
    res.json(partner);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE /admin/partners/:id
exports.deletePartner = async (req, res) => {
  try {
    const partner = await Partner.findByIdAndDelete(req.params.id);
    if (!partner) return res.status(404).json({ error: "Partner not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
